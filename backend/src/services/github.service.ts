import axios from 'axios';

export class GitHubService {
  private token: string;

  constructor(token: string) {
    this.token = token;
  }

  private get client() {
    return axios.create({
      baseURL: 'https://api.github.com',
      headers: {
        Authorization: `token ${this.token}`,
        Accept: 'application/vnd.github.v3+json',
      },
    });
  }

  async listRepositories() {
    try {
      const response = await this.client.get('/user/repos', {
        params: {
          sort: 'updated',
          per_page: 100,
          type: 'all'
        }
      });
      return response.data.map((repo: any) => ({
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        url: repo.html_url,
        private: repo.private,
        description: repo.description,
        language: repo.language
      }));
    } catch (error: any) {
      console.error('GitHub list repos error:', error.response?.data || error.message);
      throw new Error('Failed to fetch GitHub repositories');
    }
  }

  async listBranches(owner: string, repo: string) {
    try {
      const response = await this.client.get(`/repos/${owner}/${repo}/branches`);
      return response.data.map((branch: any) => branch.name);
    } catch (error: any) {
      console.error('GitHub list branches error:', error.response?.data || error.message);
      throw new Error('Failed to fetch branches');
    }
  }

  async getRepoContent(owner: string, repo: string, path: string = '') {
    try {
      const response = await this.client.get(`/repos/${owner}/${repo}/contents/${path}`);
      return response.data;
    } catch (error: any) {
      return null;
    }
  }
}
