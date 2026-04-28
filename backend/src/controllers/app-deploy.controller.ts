import { Request, Response } from 'express';
import axios from 'axios';
import prisma from '../config/prisma.js';
import { FrameworkDetector } from '../services/framework-detector.service.js';
import { DOAppPlatformService, DeployConfig } from '../services/do-app.service.js';
import { GitHubService } from '../services/github.service.js';
import { SubdomainService } from '../services/subdomain.service.js';
import { DeployErrorAnalyzer } from '../services/error-analyzer.service.js';

const detector = new FrameworkDetector();
const subdomainService = new SubdomainService();
const errorAnalyzer = new DeployErrorAnalyzer();

export const detectFramework = async (req: Request, res: Response) => {
  try {
    const { repoUrl } = req.body;
    if (!repoUrl) return res.status(400).json({ message: 'Repo URL is required' });
    
    const config = await detector.detectFromRepo(repoUrl);
    res.json(config);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const deployApp = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { repoUrl, config, appName } = req.body;

    // 1. Get active DO account
    const account = await prisma.dOAppAccount.findFirst({
      where: { status: 'active', appsCount: { lt: prisma.dOAppAccount.fields.appsLimit } }
    });

    if (!account) return res.status(503).json({ message: 'No active DigitalOcean accounts available' });

    const doService = new DOAppPlatformService(account.apiKey);
    
    // 2. Prepare config
    const repoMatch = repoUrl.match(/github\.com\/([^/]+\/[^/.]+)/);
    const repoPath = repoMatch ? repoMatch[1] : '';

    const deployConfig: DeployConfig = {
      ...config,
      appName: appName || `app-${Date.now()}`,
      repoPath,
      branch: config.branch || 'main'
    };

    // 3. Trigger DO Deploy
    const doApp = await doService.deployApp(deployConfig);

    // 4. Save to DB
    const app = await prisma.deployedApp.create({
      data: {
        userId,
        doAccountId: account.id,
        doAppId: doApp.id,
        repoUrl,
        repoBranch: deployConfig.branch,
        framework: deployConfig.framework,
        buildCommand: deployConfig.buildCommand,
        runCommand: deployConfig.runCommand,
        port: deployConfig.port,
        status: 'building',
        envVars: deployConfig.envVars as any,
      }
    });

    // 5. Update account count
    await prisma.dOAppAccount.update({
      where: { id: account.id },
      data: { appsCount: { increment: 1 } }
    });

    res.status(201).json({ message: 'Deployment started', appId: app.id, doAppId: doApp.id });
  } catch (error: any) {
    console.error('Deploy error:', error);
    res.status(500).json({ message: error.message });
  }
};

export const getAppStatus = async (req: Request, res: Response) => {
  try {
    const { appId } = req.params;
    const app = await prisma.deployedApp.findUnique({
      where: { id: appId },
      include: { account: true, deployments: true }
    });

    if (!app) return res.status(404).json({ message: 'App not found' });

    const doService = new DOAppPlatformService(app.account.apiKey);
    const doApp = await doService.getApp(app.doAppId);

    // Update status in DB if changed
    let status = app.status;
    const currentPhase = doApp.active_deployment?.phase || 'UNKNOWN';
    
    if (currentPhase === 'ACTIVE') status = 'running';
    else if (currentPhase === 'FAILED') status = 'failed';
    else if (currentPhase === 'PENDING' || currentPhase === 'BUILDING') status = 'building';

    if (status !== app.status) {
      await prisma.deployedApp.update({
        where: { id: appId },
        data: { 
          status,
          doUrl: doApp.live_url,
          deployedAt: status === 'running' ? new DateTime() : undefined
        }
      });

      // If just became running, create subdomain
      if (status === 'running' && !app.customSubdomain) {
        const fullUrl = await subdomainService.createSubdomain(app.repoUrl.split('/').pop()!, app.userId, doApp.live_url, app.id);
        await prisma.deployedApp.update({
          where: { id: appId },
          data: { customSubdomain: fullUrl }
        });
      }
    }

    res.json({ ...app, status, doApp });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getLogs = async (req: Request, res: Response) => {
  try {
    const { appId, deploymentId } = req.params;
    const app = await prisma.deployedApp.findUnique({
      where: { id: appId },
      include: { account: true }
    });

    if (!app) return res.status(404).json({ message: 'App not found' });

    const doService = new DOAppPlatformService(app.account.apiKey);
    const logs = await doService.getDeploymentLogs(app.doAppId, deploymentId);
    
    res.json({ logs });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const listApps = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const apps = await prisma.deployedApp.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(apps);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const saveGitHubToken = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { token } = req.body;
    await prisma.user.update({
      where: { id: userId },
      data: { githubToken: token }
    });
    res.json({ message: 'GitHub token saved successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getGitHubRepos = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.githubToken) {
      return res.status(400).json({ message: 'GitHub token not found' });
    }
    const github = new GitHubService(user.githubToken);
    const repos = await github.listRepositories();
    res.json(repos);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getGitHubBranches = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const { owner, repo } = req.params;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.githubToken) {
      return res.status(400).json({ message: 'GitHub token not found' });
    }
    const github = new GitHubService(user.githubToken);
    const branches = await github.listBranches(owner, repo);
    res.json(branches);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const githubAuthUrl = async (req: Request, res: Response) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = `${process.env.BACKEND_URL}/api/apps/github-callback`;
  const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=repo,user&state=${(req as any).user?.id}`;
  res.json({ url });
};

export const githubCallback = async (req: Request, res: Response) => {
  const { code, state } = req.query;
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  try {
    const response = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: clientId,
      client_secret: clientSecret,
      code,
    }, {
      headers: { Accept: 'application/json' }
    });

    const token = response.data.access_token;
    if (token) {
      await prisma.user.update({
        where: { id: state as string },
        data: { githubToken: token }
      });
      // Redirect back to frontend
      res.redirect(`${process.env.FRONTEND_URL}/dashboard/app-deploy?success=true`);
    } else {
      res.redirect(`${process.env.FRONTEND_URL}/dashboard/app-deploy?error=token_failed`);
    }
  } catch (error) {
    res.redirect(`${process.env.FRONTEND_URL}/dashboard/app-deploy?error=oauth_failed`);
  }
};
