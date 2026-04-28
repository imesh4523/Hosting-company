import { Router } from 'express';
import { detectFramework, deployApp, getAppStatus, getLogs, listApps, saveGitHubToken, getGitHubRepos, getGitHubBranches, githubAuthUrl, githubCallback } from '../controllers/app-deploy.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/detect', authenticate, detectFramework);
router.post('/deploy', authenticate, deployApp);
router.get('/list', authenticate, listApps);
router.get('/status/:appId', authenticate, getAppStatus);
router.get('/logs/:appId/:deploymentId', authenticate, getLogs);

router.post('/github-token', authenticate, saveGitHubToken);
router.get('/github-repos', authenticate, getGitHubRepos);
router.get('/github-branches/:owner/:repo', authenticate, getGitHubBranches);
router.get('/github-auth-url', authenticate, githubAuthUrl);
router.get('/github-callback', githubCallback); // No auth here as it's a callback

export default router;
