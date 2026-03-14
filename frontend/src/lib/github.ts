/** GitHub OAuth helpers for the frontend */
const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID
const SCOPES = 'repo issues:write pull_requests:write'

export function getGitHubOAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    scope: SCOPES,
    state,
    redirect_uri: `${window.location.origin}/auth/callback`,
  })
  return `https://github.com/login/oauth/authorize?${params}`
}

export function generateOAuthState(): string {
  return crypto.randomUUID()
}
