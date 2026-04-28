export interface ErrorAnalysis {
  errorType: string;
  errorLine: string;
  fix: string;
  severity: 'error' | 'warning';
}

export class DeployErrorAnalyzer {
  async analyzeError(logs: string): Promise<ErrorAnalysis> {
    // Common error patterns
    const patterns = [
      {
        pattern: /Cannot find module '(.+)'/,
        type: 'missing_module',
        fix: (match: any) => `Add "npm install ${match[1]}" to your build command.`
      },
      {
        pattern: /EACCES: permission denied/,
        type: 'permission_error',
        fix: () => 'Sudo is not allowed in App Platform. Use a port above 1024 (e.g., 3000).'
      },
      {
        pattern: /port (\d+) is already in use/,
        type: 'port_conflict',
        fix: (match: any) => `Set the PORT environment variable to ${parseInt(match[1]) + 1}.`
      },
      {
        pattern: /DATABASE_URL.*not defined/,
        type: 'missing_env',
        fix: () => 'Please add the DATABASE_URL environment variable in your app settings.'
      },
      {
        pattern: /npm ERR! code ENOTFOUND/,
        type: 'network_error',
        fix: () => 'Check your package.json dependencies - one of the packages might have an invalid name.'
      },
      {
        pattern: /Error: listen EADDRINUSE/,
        type: 'port_in_use',
        fix: () => 'Set the HTTP_PORT environment variable to a different value.'
      },
      {
        pattern: /prisma.*generate/i,
        type: 'prisma_error',
        fix: () => 'Update your build command to: "npx prisma generate && npm run build"'
      }
    ];

    // Pattern match
    for (const p of patterns) {
      const match = logs.match(p.pattern);
      if (match) {
        return {
          errorType: p.type,
          errorLine: match[0],
          fix: p.fix(match),
          severity: 'error'
        };
      }
    }

    // AI analysis for unknown errors (Placeholder for Claude/Gemini API)
    return {
      errorType: 'unknown_build_error',
      errorLine: 'Multiple errors detected in build phase.',
      fix: 'Review your build logs and ensure all dependencies are correctly listed in package.json/requirements.txt.',
      severity: 'error'
    };
  }
}
