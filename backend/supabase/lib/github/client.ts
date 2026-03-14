/** Thin wrapper around GitHub REST API */
export class GitHubClient {
  private token: string
  private baseUrl = 'https://api.github.com'

  constructor(token: string) {
    this.token = token
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })
    if (!res.ok) throw new Error(`GitHub API error ${res.status}: ${await res.text()}`)
    return res.json()
  }

  async getIssue(owner: string, repo: string, number: number) {
    return this.request(`/repos/${owner}/${repo}/issues/${number}`)
  }

  async getFileTree(owner: string, repo: string, branch = 'main') {
    return this.request(
      `/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`
    )
  }

  async getFileContent(owner: string, repo: string, path: string) {
    return this.request<{ content: string; sha: string }>(
      `/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`
    )
  }

  async createBranch(owner: string, repo: string, branchName: string, sha: string) {
    return this.request(`/repos/${owner}/${repo}/git/refs`, {
      method: 'POST',
      body: JSON.stringify({ ref: `refs/heads/${branchName}`, sha }),
    })
  }

  async updateFile(
    owner: string, repo: string, path: string,
    content: string, message: string, sha: string, branch: string
  ) {
    return this.request(`/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`, {
      method: 'PUT',
      body: JSON.stringify({
        message, content: btoa(content), sha, branch,
      }),
    })
  }

  async createPullRequest(
    owner: string, repo: string,
    title: string, body: string, head: string, base: string
  ) {
    return this.request<{ number: number; html_url: string }>(
      `/repos/${owner}/${repo}/pulls`,
      { method: 'POST', body: JSON.stringify({ title, body, head, base }) }
    )
  }

  async createWebhook(owner: string, repo: string, webhookUrl: string, secret: string) {
    return this.request(`/repos/${owner}/${repo}/hooks`, {
      method: 'POST',
      body: JSON.stringify({
        name: 'web',
        active: true,
        events: ['issues', 'pull_request', 'pull_request_review'],
        config: { url: webhookUrl, content_type: 'json', secret },
      }),
    })
  }

  async graphql<T>(query: string, variables: Record<string, unknown>): Promise<T> {
    const res = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, variables }),
    })
    const { data, errors } = await res.json()
    if (errors?.length) throw new Error(errors[0].message)
    return data
  }
}
