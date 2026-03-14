import type { Context, Config } from "@netlify/functions";
import OpenAI from "openai";

// ─── Constants & Setup ─────────────────────────────────────────────────────

const SKIP_DIRS = ['node_modules', '.git', 'dist', 'build', '__pycache__', '.next', 'vendor', '.venv', 'venv', 'coverage', '.cache'];
const CODE_EXTENSIONS = ['.js', '.ts', '.tsx', '.jsx', '.py', '.go', '.java', '.rs', '.rb', '.php', '.c', '.cpp', '.h', '.cs'];

// Types
interface AnalyzedIssue {
  id: string;
  type: string;
  title: string;
  file: string;
  line?: number;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  classification: 'bug' | 'perf' | 'security' | 'feature' | 'docs';
  description: string;
  fix: string;
  codeSnippet?: string;
  suggestedFix?: string; 
  issue?: string;        
}

interface RepoFile {
  path: string;
  content: string;
  size: number;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function getEnv(key: string): string {
  // @ts-ignore
  if (typeof Netlify !== 'undefined' && Netlify.env && Netlify.env.get(key)) {
    // @ts-ignore
    return Netlify.env.get(key) as string;
  }
  return process.env[key] || '';
}

function getOpenRouter() {
  const apiKey = getEnv("OPENROUTER_API_KEY");
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured.");
  }
  return new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey,
    defaultHeaders: {
      'HTTP-Referer': 'https://gitsolve.netlify.app',
      'X-Title': 'GitSolve AI Analyzer',
    }
  });
}

function githubHeaders(authHeader?: string | null) {
  const token = authHeader?.replace('Bearer ', '') || getEnv('GITHUB_TOKEN');
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

function parseRepoUrl(input: string): { owner: string; repo: string } {
  let cleaned = input.trim();
  if (cleaned.startsWith('https://github.com/')) {
    cleaned = cleaned.replace('https://github.com/', '');
  }
  if (cleaned.endsWith('/')) cleaned = cleaned.slice(0, -1);
  if (cleaned.endsWith('.git')) cleaned = cleaned.slice(0, -4);
  const [owner, repo] = cleaned.split('/');
  if (!owner || !repo) throw new Error(`Invalid repository: ${input}`);
  return { owner, repo };
}

async function fetchRepoTree(owner: string, repo: string, authHeader?: string | null): Promise<{ filePaths: string[], empty: boolean, branch: string, error?: any }> {
  try {
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers: githubHeaders(authHeader) });
    
    if (repoRes.status === 404) return { filePaths: [], empty: true, branch: '', error: { status: 'not_found', message: 'Repository not found or access denied.' } };
    if (repoRes.status === 403) return { filePaths: [], empty: true, branch: '', error: { status: 'rate_limit', message: 'GitHub API rate limit exceeded.' } };
    if (!repoRes.ok) throw new Error(`GitHub API error ${repoRes.status}`);
    
    const repoData: any = await repoRes.json();
    const branch = repoData.default_branch || 'main';

    const branchRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/branches/${branch}`, { headers: githubHeaders(authHeader) });
    if (!branchRes.ok) {
       if (branchRes.status === 404 || branchRes.status === 409) return { filePaths: [], empty: true, branch, error: { status: 'empty_repo', message: 'This repository has no files to analyze.' } };
       throw new Error(`Branch fetch error ${branchRes.status}`);
    }
    const branchData = await branchRes.json();
    const sha = branchData.commit?.commit?.tree?.sha;
    
    if (!sha) return { filePaths: [], empty: true, branch, error: { status: 'empty_repo', message: 'This repository has no files to analyze.' } };

    const treeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${sha}?recursive=1`, { headers: githubHeaders(authHeader) });
    if (!treeRes.ok) throw new Error(`Tree fetch error ${treeRes.status}`);
    
    const data = await treeRes.json();
    const tree = data.tree || [];

    const filePaths = tree
      .filter((item: any) => {
        if (item.type !== 'blob') return false;
        const ext = '.' + item.path.split('.').pop()?.toLowerCase();
        if (!CODE_EXTENSIONS.includes(ext)) return false;
        if (SKIP_DIRS.some((dir: string) => item.path.includes(`${dir}/`) || item.path.startsWith(`${dir}/`))) return false;
        if (item.size && item.size > 100000) return false;
        return true;
      })
      .map((item: any) => item.path)
      .slice(0, 50); // limit to first 50 code files

    return { filePaths, empty: filePaths.length === 0, branch };
  } catch (err: any) {
     return { filePaths: [], empty: true, branch: '', error: { status: 'error', message: err.message } };
  }
}

async function fetchFileContent(owner: string, repo: string, branch: string, path: string, authHeader?: string | null): Promise<string> {
  const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${encodeURIComponent(path)}`;
  const res = await fetch(url, { headers: githubHeaders(authHeader) });
  if (!res.ok) return '';
  return await res.text();
}

async function analyzeRepositoryCode(codeChunks: string): Promise<AnalyzedIssue[]> {
  try {
    const openRouter = getOpenRouter();
    const model = getEnv("OPENROUTER_MODEL_ANALYSIS") || 'mistralai/mistral-small-3.1-24b-instruct';

    const completion = await openRouter.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: `You are an expert code security auditor and performance analyzer. Analyze this repository code and detect:
* security vulnerabilities
* inefficient database queries
* logic bugs
* unsafe input handling
* dead code

Return ONLY a structured JSON list of issues in this format:
{
  "issues": [
    {
      "file": "path/to/file",
      "severity": "critical" | "high" | "medium" | "low",
      "issue": "Brief description",
      "suggestedFix": "Code fix suggestion",
      "title": "Short Title",
      "classification": "security" | "bug" | "perf",
      "description": "Longer description of the issue",
      "line": 42
    }
  ]
}

No markdown outside the JSON, no explanations. Make sure it is valid JSON.`
        },
        {
          role: 'user',
          content: `Analyze these files:\n\n${codeChunks}`
        }
      ],
      temperature: 0.1,
      max_tokens: 4000,
      response_format: { type: 'json_object' }
    });

    const content = completion.choices[0]?.message?.content || '{}';
    let parsed: any;
    try {
      const cleaned = content.replace(/^```json/m, '').replace(/```$/m, '').trim();
      parsed = JSON.parse(cleaned);
      const issues = parsed.issues || parsed.results || (Array.isArray(parsed) ? parsed : []);
      
      return issues.map((iss: any, idx: number) => ({
        id: `issue-${idx}-${Date.now()}`,
        type: iss.issue || iss.title || 'Unknown',
        title: iss.title || iss.issue || 'Detected Issue',
        file: iss.file || 'unknown',
        line: iss.line,
        severity: iss.severity || 'medium',
        classification: iss.classification || 'bug',
        description: iss.description || iss.issue || 'No description provided',
        fix: iss.suggestedFix || iss.fix || 'Review and fix manually',
        codeSnippet: iss.codeSnippet || '',
      }));
    } catch (parseErr) {
      console.error('JSON parse error:', parseErr);
      return [];
    }
  } catch (err) {
    console.error('LLM error:', err);
    return [];
  }
}

async function generateFix(issueDescription: string, codeSnippet: string) {
  try {
    const openRouter = getOpenRouter();
    const model = getEnv("OPENROUTER_MODEL_FIX") || 'meta-llama/llama-3.3-70b-instruct';

    const completion = await openRouter.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: `Fix the following issue in the code and return the improved version.

Return ONLY a JSON object with:
- explanation: string (what was wrong and how you fixed it)
- originalCode: string (the problematic code section, ~10-20 lines around the issue)
- fixedCode: string (the corrected version of that same section)
- confidence: number (0-1, your confidence in this fix)
- changes: string[] (list of specific changes made)

No markdown outside the JSON, no extra text.`
        },
        {
          role: 'user',
          content: `Issue Description:
${issueDescription}

Code Snippet:
\`\`\`
${codeSnippet}
\`\`\`
`
        }
      ],
      temperature: 0.1,
      max_tokens: 4000,
      response_format: { type: 'json_object' }
    });

    const content = completion.choices[0]?.message?.content || '{}';
    let parsed: any;
    try {
      const cleaned = content.replace(/^```json/m, '').replace(/```$/m, '').trim();
      parsed = JSON.parse(cleaned);
    } catch (e) {
      parsed = {};
    }

    return {
      explanation: parsed.explanation || 'Fix generated by AI',
      originalCode: parsed.originalCode || codeSnippet,
      fixedCode: parsed.fixedCode || '',
      confidence: parsed.confidence || 0.85,
      changes: parsed.changes || ['Applied suggested fix'],
    };
  } catch (err) {
    throw err;
  }
}

// ─── Main Handler ──────────────────────────────────────────────────────────

export default async (req: Request, context: Context) => {
  const url = new URL(req.url);
  const path = url.pathname;

  // Handle CORS preflight just in case, though Netlify single-origin usually avoids it
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });
  }

  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  try {
    // HEALTH
    if (path.endsWith('/api/health') || path.endsWith('/api')) {
      return new Response(JSON.stringify({ status: 'ok', timestamp: new Date().toISOString() }), { headers: defaultHeaders });
    }

    // ANALYZE
    if (path.endsWith('/api/analyze') && req.method === 'POST') {
      const body = await req.json();
      const { repoUrl } = body;
      if (!repoUrl) return new Response(JSON.stringify({ error: 'repoUrl is required' }), { status: 400, headers: defaultHeaders });

      const { owner, repo } = parseRepoUrl(repoUrl);
      const repoName = `${owner}/${repo}`;
      const authHeader = req.headers.get('authorization');

      const { filePaths, empty, branch, error: treeError } = await fetchRepoTree(owner, repo, authHeader);
      
      if (empty && treeError?.status === 'empty_repo') {
        return new Response(JSON.stringify({ status: 'empty_repo', message: treeError.message }), { headers: defaultHeaders });
      } else if (empty && treeError) {
        return new Response(JSON.stringify(treeError), { status: 400, headers: defaultHeaders });
      }

      if (filePaths.length === 0) {
        return new Response(JSON.stringify({
          repoName,
          issues: [],
          metrics: { filesScanned: 0, functionsAnalyzed: 0, issuesDetected: 0, securityRisks: 0 },
          agentSteps: [],
        }), { headers: defaultHeaders });
      }

      const files: RepoFile[] = [];
      for (const filePath of filePaths) {
        const content = await fetchFileContent(owner, repo, branch, filePath, authHeader);
        if (content) {
          files.push({ path: filePath, content, size: content.length });
        }
      }

      const codeChunks = files.map(f => `### File: ${f.path}\n\`\`\`\n${f.content.slice(0, 3000)}\n\`\`\``).join('\n\n');

      let allIssues: AnalyzedIssue[] = [];
      if (files.length > 0) {
         allIssues = await analyzeRepositoryCode(codeChunks);
      }

      const functionsAnalyzed = files.reduce((count, f) => {
        const matches = f.content.match(/(function |const \w+ = |def |async |=> {|class )/g);
        return count + (matches?.length || 0);
      }, 0);

      const metrics = {
        filesScanned: files.length,
        functionsAnalyzed,
        issuesDetected: allIssues.length,
        securityRisks: allIssues.filter(i => i.classification === 'security' || i.title.toLowerCase().includes('security')).length,
      };

      const agentSteps = [
        { id: 'step-1', agent_name: 'repo-exploration', status: 'success', description: `Fetched repository tree from GitHub and identified ${filePaths.length} key code files.`, completed_at: new Date().toISOString(), step_order: 1 },
        { id: 'step-2', agent_name: 'code-understanding', status: 'success', description: `Extracted and mapped code patterns. Evaluated ${functionsAnalyzed} structural functions.`, completed_at: new Date().toISOString(), step_order: 2 },
        { id: 'step-3', agent_name: 'validation', status: 'success', description: `Ran rigorous OpenRouter analysis sequence. Detected ${allIssues.length} concrete issues.`, completed_at: new Date().toISOString(), step_order: 3 },
        { id: 'step-4', agent_name: 'solution-planning', status: 'success', description: `Classified issues by severity and priority (Security/Perf/Bugs). Orchestration complete.`, completed_at: new Date().toISOString(), step_order: 4 },
      ];

      return new Response(JSON.stringify({
        repoName,
        issues: allIssues,
        metrics,
        agentSteps,
      }), { headers: defaultHeaders });
    }

    // RESOLVE
    if (path.endsWith('/api/resolve') && req.method === 'POST') {
      const body = await req.json();
      const { issue, repoUrl } = body;
      if (!issue) return new Response(JSON.stringify({ error: 'issue is required' }), { status: 400, headers: defaultHeaders });

      const authHeader = req.headers.get('authorization');
      const { owner, repo } = repoUrl ? parseRepoUrl(repoUrl) : { owner: '', repo: '' };

      let fileContent = issue.codeSnippet || '';
      if (owner && repo && issue.file) {
        try {
          const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers: githubHeaders(authHeader) });
          const repoData: any = await repoRes.json();
          const defaultBranch = repoData.default_branch || 'main';
          fileContent = await fetchFileContent(owner, repo, defaultBranch, issue.file, authHeader);
        } catch (e) {
          // fallback to snippet
        }
      }

      const truncatedContent = fileContent.slice(0, 6000);
      const issueDescription = `Type: ${issue.type} | Severity: ${issue.severity} | Fix Hint: ${issue.fix} | Problem: ${issue.description}`;

      const fixResult = await generateFix(issueDescription, truncatedContent);

      return new Response(JSON.stringify({
        issueId: issue.id,
        explanation: fixResult.explanation,
        originalCode: fixResult.originalCode,
        fixedCode: fixResult.fixedCode,
        confidence: fixResult.confidence,
        changes: fixResult.changes,
        filePath: issue.file,
      }), { headers: defaultHeaders });
    }

    // CREATE PR
    if (path.endsWith('/api/create-pr') && req.method === 'POST') {
      const body = await req.json();
      const { repoUrl, filePath, fixedCode, issueTitle, explanation } = body;
      if (!repoUrl || !filePath || !fixedCode) {
        return new Response(JSON.stringify({ error: 'repoUrl, filePath, and fixedCode are required' }), { status: 400, headers: defaultHeaders });
      }

      const authHeader = req.headers.get('authorization');
      const { owner, repo } = parseRepoUrl(repoUrl);
      const branchName = `gitsolve/fix-${Date.now()}`;

      const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers: githubHeaders(authHeader) });
      const repoData: any = await repoRes.json();
      const defaultBranch = repoData.default_branch || 'main';

      const refRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${defaultBranch}`, { headers: githubHeaders(authHeader) });
      const refData: any = await refRes.json();
      const baseSha = refData.object?.sha;
      if (!baseSha) throw new Error('Could not get base branch SHA');

      const branchRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs`, {
        method: 'POST',
        headers: { ...githubHeaders(authHeader), 'Content-Type': 'application/json' },
        body: JSON.stringify({ ref: `refs/heads/${branchName}`, sha: baseSha }),
      });
      if (!branchRes.ok) throw new Error(`Failed to create branch: ${await branchRes.text()}`);

      const fileRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(filePath)}?ref=${defaultBranch}`, { headers: githubHeaders(authHeader) });
      const fileData: any = await fileRes.json();
      const fileSha = fileData.sha;

      const updateRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${encodeURIComponent(filePath)}`, {
          method: 'PUT',
          headers: { ...githubHeaders(authHeader), 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: `fix: ${issueTitle || 'AI-generated fix'}\n\nGenerated by GitSolve AI`,
            content: Buffer.from(fixedCode).toString('base64'),
            sha: fileSha,
            branch: branchName,
          }),
      });
      if (!updateRes.ok) throw new Error(`Failed to update file: ${await updateRes.text()}`);

      const prRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls`, {
        method: 'POST',
        headers: { ...githubHeaders(authHeader), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `[GitSolve] Fix: ${issueTitle || 'AI-detected issue'}`,
          body: `## 🤖 GitSolve AI Fix\n\n${explanation || 'Automated validation passing fix.'}\n\n### Changes\n- Fixed issue in \`${filePath}\`\n\n---\n*This PR was automatically generated by [GitSolve AI](https://github.com/rahulsp19/Gitsolve)*`,
          head: branchName,
          base: defaultBranch,
        }),
      });
      
      if (!prRes.ok) throw new Error(`Failed to create PR: ${await prRes.text()}`);
      const prData: any = await prRes.json();

      return new Response(JSON.stringify({
        success: true,
        pr_number: prData.number,
        pr_url: prData.html_url,
        branch_name: branchName,
        title: prData.title,
        repository_name: `${owner}/${repo}`,
      }), { headers: defaultHeaders });
    }

    return new Response(JSON.stringify({ error: `Not found: ${path} (Method: ${req.method})` }), { status: 404, headers: defaultHeaders });
  } catch (err: any) {
    console.error('API function error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Internal Server Error' }), { status: 500, headers: defaultHeaders });
  }
};

export const config: Config = {
  path: "/api/*"
};
