import axios from 'axios';

export interface DetectedConfig {
  framework: string;
  icon: string;
  buildCommand: string | null;
  runCommand: string | null;
  port: number;
  envVarsNeeded?: string[];
  nodeVersion?: string;
  outputDir?: string;
  dockerfile?: boolean;
}

export class FrameworkDetector {
  private githubApi = 'https://api.github.com';

  async detectFromRepo(repoUrl: string): Promise<DetectedConfig> {
    try {
      const { owner, repo } = this.parseGithubUrl(repoUrl);
      
      // Get file list from root
      const response = await axios.get(`${this.githubApi}/repos/${owner}/${repo}/contents`, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          // Optional: 'Authorization': `token ${process.env.GITHUB_TOKEN}`
        }
      });
      
      const files = response.data.map((f: any) => f.name);
      const hasFile = (name: string) => files.includes(name);

      // Node.js detection
      if (hasFile('package.json')) {
        const pkgContent = await this.getFileContent(owner, repo, 'package.json');
        const parsed = JSON.parse(pkgContent);

        // Next.js
        if (parsed.dependencies?.next) {
          return {
            framework: 'nextjs',
            icon: '▲',
            buildCommand: 'npm run build',
            runCommand: 'npm start',
            port: 3000,
            envVarsNeeded: ['DATABASE_URL'],
            nodeVersion: '18'
          };
        }

        // React (Vite)
        if (parsed.dependencies?.vite || parsed.devDependencies?.vite) {
          return {
            framework: 'react-vite',
            icon: '⚡',
            buildCommand: 'npm run build',
            runCommand: null, // static
            outputDir: 'dist',
            port: 8080 // Default for static
          };
        }

        // Express/Node
        if (parsed.dependencies?.express) {
          const mainFile = parsed.main || 'index.js';
          return {
            framework: 'nodejs',
            icon: '🟢',
            buildCommand: 'npm install',
            runCommand: `node ${mainFile}`,
            port: 3000,
            envVarsNeeded: ['DATABASE_URL', 'PORT']
          };
        }

        // NestJS
        if (parsed.dependencies?.['@nestjs/core']) {
          return {
            framework: 'nestjs',
            icon: '🔴',
            buildCommand: 'npm run build',
            runCommand: 'node dist/main',
            port: 3000
          };
        }

        // Default Node
        return {
          framework: 'nodejs',
          icon: '🟢',
          buildCommand: 'npm install',
          runCommand: 'npm start',
          port: 8080
        };
      }

      // Docker detection
      if (hasFile('Dockerfile')) {
        const dockerfile = await this.getFileContent(owner, repo, 'Dockerfile');
        const portMatch = dockerfile.match(/EXPOSE\s+(\d+)/i);
        return {
          framework: 'docker',
          icon: '🐳',
          buildCommand: null,
          runCommand: null,
          port: portMatch ? parseInt(portMatch[1]) : 8080,
          dockerfile: true
        };
      }

      // Python detection
      if (hasFile('requirements.txt') || hasFile('pyproject.toml')) {
        if (hasFile('manage.py')) {
          return {
            framework: 'django',
            icon: '🐍',
            buildCommand: 'pip install -r requirements.txt',
            runCommand: 'gunicorn myapp.wsgi',
            port: 8000,
            envVarsNeeded: ['DATABASE_URL', 'SECRET_KEY']
          };
        }
        return {
          framework: 'python',
          icon: '🐍',
          buildCommand: 'pip install -r requirements.txt',
          runCommand: 'uvicorn main:app',
          port: 8000
        };
      }

      // Laravel/PHP
      if (hasFile('artisan')) {
        return {
          framework: 'laravel',
          icon: '🔴',
          buildCommand: 'composer install && php artisan migrate',
          runCommand: 'php artisan serve',
          port: 8000,
          envVarsNeeded: ['DATABASE_URL', 'APP_KEY']
        };
      }

      return {
        framework: 'unknown',
        icon: '❓',
        buildCommand: null,
        runCommand: null,
        port: 8080
      };

    } catch (error) {
      console.error('Detection error:', error);
      throw new Error('Failed to detect framework from repository');
    }
  }

  private parseGithubUrl(url: string) {
    const regex = /github\.com\/([^/]+)\/([^/.]+)/;
    const match = url.match(regex);
    if (!match) throw new Error('Invalid GitHub URL');
    return { owner: match[1], repo: match[2] };
  }

  private async getFileContent(owner: string, repo: string, path: string): Promise<string> {
    const url = `${this.githubApi}/repos/${owner}/${repo}/contents/${path}`;
    const res = await axios.get(url, {
      headers: { 'Accept': 'application/vnd.github.v3.raw' }
    });
    return typeof res.data === 'string' ? res.data : JSON.stringify(res.data);
  }
}
