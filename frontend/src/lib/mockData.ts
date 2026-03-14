import type { Repository, Issue, AgentStep, PullRequest } from '@/types'

export const mockRepositories: Repository[] = [
  {
    id: '1', user_id: '1', github_id: 1001, full_name: 'acme/nexus-dashboard',
    default_branch: 'main', language: 'TypeScript', is_indexed: true,
    stars: 2400, open_issues: 18, visibility: 'public',
    description: 'Enterprise-grade React dashboard template with Tailwind CSS and Framer Motion integration.',
    updated_at: '2h ago',
  },
  {
    id: '2', user_id: '1', github_id: 1002, full_name: 'acme/auth-service-v2',
    default_branch: 'main', language: 'Go', is_indexed: true,
    stars: 12, open_issues: 7, visibility: 'private',
    description: 'Internal microservice for handling OAuth2 and user sessions across all platforms.',
    updated_at: '1d ago',
  },
  {
    id: '3', user_id: '1', github_id: 1003, full_name: 'acme/ml-data-pipeline',
    default_branch: 'main', language: 'Python', is_indexed: false,
    stars: 850, open_issues: 24, visibility: 'public',
    description: 'High-performance data ingestion pipeline built with Python and Apache Spark.',
    updated_at: '3d ago',
  },
  {
    id: '4', user_id: '1', github_id: 1004, full_name: 'acme/vector-search-engine',
    default_branch: 'main', language: 'Rust', is_indexed: true,
    stars: 4100, open_issues: 3, visibility: 'public',
    description: 'Scalable vector similarity search engine for AI-powered recommendation systems.',
    updated_at: '5h ago',
  },
  {
    id: '5', user_id: '1', github_id: 1005, full_name: 'acme/mobile-app-ui',
    default_branch: 'develop', language: 'TypeScript', is_indexed: true,
    stars: 340, open_issues: 11, visibility: 'private',
    description: 'Cross-platform mobile application built with React Native and Expo.',
    updated_at: '12h ago',
  },
]

export const mockIssues: Issue[] = [
  {
    id: '1', repository_id: '1', github_number: 442, title: 'N+1 Query Detected in Product List',
    body: 'Fetching associated category labels for each product entry individually. This causes multiple database roundtrips that can be optimized using a single JOIN operation or eager loading.',
    state: 'open', labels: ['bug', 'performance'], author: 'devops-bot',
    classification: 'perf', priority: 1, severity: 'critical',
    file_path: 'src/api/controllers/productController.ts:142',
    created_at: '2024-03-10',
  },
  {
    id: '2', repository_id: '1', github_number: 438, title: 'Unsanitized User Input in Search',
    body: 'The search query is being rendered directly into the DOM without escaping, potentially allowing for Cross-Site Scripting (XSS) attacks in legacy browsers.',
    state: 'open', labels: ['security', 'bug'], author: 'security-scanner',
    classification: 'security', priority: 2, severity: 'high',
    file_path: 'src/ui/components/SearchBox.tsx:58',
    created_at: '2024-03-09',
  },
  {
    id: '3', repository_id: '1', github_number: 435, title: 'Redundant Re-renders in Dashboard',
    body: 'The `StatCard` component is re-rendering on every parent state change even when its specific props haven\'t changed. Suggesting React.memo optimization.',
    state: 'open', labels: ['performance'], author: 'alex-dev',
    classification: 'perf', priority: 3, severity: 'medium',
    file_path: 'src/ui/views/MainDashboard.tsx:210',
    created_at: '2024-03-08',
  },
  {
    id: '4', repository_id: '1', github_number: 430, title: 'Dead Code Found: authModuleLegacy.js',
    body: 'This module is no longer imported anywhere in the production bundle. Deleting it will reduce artifact size by approximately 12KB.',
    state: 'open', labels: ['cleanup'], author: 'ai-scanner',
    classification: 'docs', priority: 4, severity: 'info',
    file_path: 'src/lib/legacy/authModuleLegacy.js',
    created_at: '2024-03-07',
  },
]

export const mockAgentSteps: AgentStep[] = [
  {
    id: 's1', run_id: 'r1', agent_name: 'Issue Understanding Agent', status: 'success',
    step_order: 1, duration_ms: 3200, tokens_used: 1420,
    description: 'Parsed requirement and identified core logic inconsistency in the authentication middleware.',
    started_at: '09:41 AM', completed_at: '09:41 AM',
  },
  {
    id: 's2', run_id: 'r1', agent_name: 'Repository Exploration Agent', status: 'success',
    step_order: 2, duration_ms: 8400, tokens_used: 3200,
    description: 'Mapped relevant dependencies across 4 modules. Found related implementations in /src/auth/*.',
    started_at: '09:42 AM', completed_at: '09:42 AM',
  },
  {
    id: 's3', run_id: 'r1', agent_name: 'Code Localization Agent', status: 'success',
    step_order: 3, duration_ms: 4100, tokens_used: 2100,
    description: 'Pinpointed error to authProvider.ts line 242. Stack trace matches current context.',
    started_at: '09:44 AM', completed_at: '09:44 AM',
  },
  {
    id: 's4', run_id: 'r1', agent_name: 'Solution Planning Agent', status: 'success',
    step_order: 4, duration_ms: 5600, tokens_used: 2800,
    description: 'Drafted 3-step refactor plan to consolidate token validation logic. Validated against safety rules.',
    started_at: '09:45 AM', completed_at: '09:45 AM',
  },
  {
    id: 's5', run_id: 'r1', agent_name: 'Code Generation Agent', status: 'running',
    step_order: 5, duration_ms: 0, tokens_used: 0,
    description: 'Writing optimized TypeScript patches and generating corresponding unit tests...',
    started_at: '09:46 AM',
  },
]

export const mockPullRequest: PullRequest = {
  id: 'pr1',
  run_id: 'r1',
  issue_id: '1',
  github_pr_number: 443,
  github_pr_url: 'https://github.com/acme/nexus-dashboard/pull/443',
  branch_name: 'fix/sql-injection-session-auth',
  title: 'Fix: Security vulnerability in auth.ts',
  repository_name: 'nexus-dashboard',
  commit_message: 'fix: replace raw SQL query with parameterized Prisma ORM call',
  body: 'This PR fixes a SQL injection vulnerability in the session authentication module by migrating from raw SQL string interpolation to Prisma ORM type-safe queries.',
  diff: `  export async function getSession(id: string) {
    try {
-     const user = await db.query(\`SELECT * FROM users WHERE id = '\${id}'\`);
-     return user[0];
+     const user = await db.user.findUnique({
+       where: { id: id },
+     });
+     return user;
    } catch (e) {`,
  files_changed: ['src/lib/auth/session.ts', 'src/lib/auth/middleware.ts'],
  state: 'open',
}

export const mockAnalysisStats = {
  filesScanned: 1284,
  functionsAnalyzed: 4512,
  issuesDetected: 24,
  securityRisks: 12,
  progress: 75,
}

export const langColors: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f7df1e',
  Python: '#3572A5',
  Go: '#00ADD8',
  Rust: '#dea584',
  Java: '#b07219',
  Ruby: '#701516',
}
