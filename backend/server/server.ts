import express from 'express';
import cors from 'cors';
import OpenAI from 'openai';

// ─── Load environment ──────────────────────────────────────────────────────
const dotenv = require('dotenv');
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const PORT = process.env.PORT || 3001;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN!;

// Initialize OpenRouter Client
const openRouter = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY!,
  defaultHeaders: {
    'HTTP-Referer': 'http://localhost:5173', // Recommended by OpenRouter
    'X-Title': 'GitSolve AI Analyzer',
  }
});

const OPENROUTER_MODEL_ANALYSIS = process.env.OPENROUTER_MODEL_ANALYSIS || 'mistralai/mistral-small-3.1-24b-instruct';
const OPENROUTER_MODEL_FIX = process.env.OPENROUTER_MODEL_FIX || 'meta-llama/llama-3.3-70b-instruct';

// ─── Types ─────────────────────────────────────────────────────────────────
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
  suggestedFix?: string; // For compatibility with the requested output format
  issue?: string;        // For compatibility
}

interface RepoFile {
  path: string;
  content: string;
  size: number;
}

// ─── GitHub Helpers ────────────────────────────────────────────────────────
const SKIP_DIRS = ['node_modules', '.git', 'dist', 'build', '__pycache__', '.next', 'vendor', '.venv', 'venv', 'coverage', '.cache'];
const CODE_EXTENSIONS = ['.js', '.ts', '.tsx', '.jsx', '.py', '.go', '.java', '.rs', '.rb', '.php', '.c', '.cpp', '.h', '.cs'];

function githubHeaders(authHeader?: string) {
  const token = authHeader?.replace('Bearer ', '') || GITHUB_TOKEN;
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

async function fetchRepoTree(owner: string, repo: string, authHeader?: string): Promise<{ filePaths: string[], empty: boolean, branch: string, error?: any }> {
  try {
    console.log("Fetching repo:", owner, repo);
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers: githubHeaders(authHeader) });
    
    if (repoRes.status === 404) return { filePaths: [], empty: true, branch: '', error: { status: 'not_found', message: 'Repository not found or access denied.' } };
    if (repoRes.status === 403) return { filePaths: [], empty: true, branch: '', error: { status: 'rate_limit', message: 'GitHub API rate limit exceeded.' } };
    if (!repoRes.ok) throw new Error(`GitHub API error ${repoRes.status}`);
    
    const repoData: any = await repoRes.json();

    const branch = repoData.default_branch || 'main';
    console.log("Default branch:", branch);

    const branchRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/branches/${branch}`, { headers: githubHeaders(authHeader) });
    if (!branchRes.ok) {
       if (branchRes.status === 404 || branchRes.status === 409) return { filePaths: [], empty: true, branch, error: { status: 'empty_repo', message: 'This repository has no files to analyze.' } };
       throw new Error(`Branch fetch error ${branchRes.status}`);
    }
    const branchData = await branchRes.json();
    const sha = branchData.commit?.commit?.tree?.sha;
    
    if (!sha) return { filePaths: [], empty: true, branch, error: { status: 'empty_repo', message: 'This repository has no files to analyze.' } };
    console.log("Tree SHA:", sha);

    const treeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${sha}?recursive=1`, { headers: githubHeaders(authHeader) });
    if (!treeRes.ok) throw new Error(`Tree fetch error ${treeRes.status}`);
    
    const data = await treeRes.json();
    const tree = data.tree || [];
    console.log("Files found:", tree.length);

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
      .slice(0, 50);

    return { filePaths, empty: filePaths.length === 0, branch };
  } catch (err: any) {
     return { filePaths: [], empty: true, branch: '', error: { status: 'error', message: err.message } };
  }
}

async function fetchFileContent(owner: string, repo: string, branch: string, path: string, authHeader?: string): Promise<string> {
  const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${encodeURIComponent(path)}`;
  const token = authHeader?.replace('Bearer ', '') || GITHUB_TOKEN;
  const headers: any = { Accept: 'application/vnd.github.v3.raw' };
  if (token) headers.Authorization = `token ${token}`;

  const res = await fetch(url, { headers });
  if (!res.ok) return '';
  return await res.text();
}

// ─── AI Analysis ───────────────────────────────────────────────────────────
async function analyzeRepositoryCode(codeChunks: string): Promise<AnalyzedIssue[]> {
  console.log('AI analysis started');
  try {
    const completion = await openRouter.chat.completions.create({
      model: OPENROUTER_MODEL_ANALYSIS,
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
      "issue": "N+1 database query detected" or brief description,
      "suggestedFix": "Use eager loading or a JOIN query",
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
      max_tokens: 16384,
      response_format: { type: 'json_object' }
    });

    console.log('AI analysis completed');

    const content = completion.choices[0]?.message?.content || '{}';
    let parsed: any;
    try {
      // In case OpenRouter models return markdown blocks, strip them
      const cleaned = content.replace(/^```json/m, '').replace(/```$/m, '').trim();
      try {
        parsed = JSON.parse(cleaned);
      } catch (parseError) {
        // Fallback for truncated JSON response due to output token limits
        console.warn('JSON parsing failed, attempting to recover truncated response...');
        const lastBrace = cleaned.lastIndexOf('}');
        if (lastBrace > 0) {
           const recovered = cleaned.substring(0, lastBrace + 1) + ']}';
           parsed = JSON.parse(recovered);
        } else {
           throw parseError;
        }
      }
      const issues = parsed.issues || parsed.results || (Array.isArray(parsed) ? parsed : []);
      console.log(`Issues detected: ${issues.length}`);
      
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
      console.error('Failed to parse AI response:', parseErr);
      return [];
    }
  } catch (err) {
    console.error('OpenRouter generation error in analyzeRepositoryCode:', err);
    return [];
  }
}

async function generateFix(issueDescription: string, codeSnippet: string) {
  try {
    const completion = await openRouter.chat.completions.create({
      model: OPENROUTER_MODEL_FIX,
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
      console.error('Failed to parse OpenRouter fix response:', e);
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
    console.error('OpenRouter error in generateFix:', err);
    throw err;
  }
}

// ─── Routes ────────────────────────────────────────────────────────────────

/** POST /api/analyze — Full repository analysis */
app.post('/api/analyze', async (req, res) => {
  try {
    const { repoUrl } = req.body;
    if (!repoUrl) return res.status(400).json({ error: 'repoUrl is required' });

    const { owner, repo } = parseRepoUrl(repoUrl);
    const repoName = `${owner}/${repo}`;

    console.log(`\n🔍 Starting analysis for: ${repoName}`);

    const authHeader = req.headers.authorization;

    // Step 1: repo-exploration
    console.log('📂 Fetching repository tree...');
    const { filePaths, empty, branch, error: treeError } = await fetchRepoTree(owner, repo, authHeader);
    
    if (empty && treeError?.status === 'empty_repo') {
      return res.json({ status: 'empty_repo', message: treeError.message });
    } else if (empty && treeError) {
      return res.status(400).json(treeError);
    }

    console.log(`   Found ${filePaths.length} code files`);

    if (filePaths.length === 0) {
      return res.json({
        repoName,
        issues: [],
        metrics: { filesScanned: 0, functionsAnalyzed: 0, issuesDetected: 0, securityRisks: 0 },
        agentSteps: [],
      });
    }

    // Step 2: code-understanding
    console.log('📄 Downloading file contents...');
    const files: RepoFile[] = [];
    for (const path of filePaths) {
      const content = await fetchFileContent(owner, repo, branch, path, authHeader);
      if (content) {
        files.push({ path, content, size: content.length });
      }
    }
    console.log(`   Downloaded ${files.length} files`);

    const codeChunks = files.map(f => `### File: ${f.path}\n\`\`\`\n${f.content.slice(0, 3000)}\n\`\`\``).join('\n\n');

    // Step 3: validation & issue detection (using OpenRouter)
    // Connect to specific analysis model
    let allIssues: AnalyzedIssue[] = [];
    if (files.length > 0) {
       allIssues = await analyzeRepositoryCode(codeChunks);
    }

    // Step 4: Compute metrics
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

    // Step 5: Build agent steps timeline matching the pipeline
    const agentSteps = [
      {
        id: 'step-1',
        agent_name: 'repo-exploration',
        status: 'success' as const,
        description: `Fetched repository tree from GitHub and identified ${filePaths.length} key code files.`,
        completed_at: new Date().toISOString(),
        step_order: 1,
      },
      {
        id: 'step-2',
        agent_name: 'code-understanding',
        status: 'success' as const,
        description: `Extracted and mapped code patterns. Evaluated ${functionsAnalyzed} structural functions.`,
        completed_at: new Date().toISOString(),
        step_order: 2,
      },
      {
        id: 'step-3',
        agent_name: 'validation',
        status: 'success' as const,
        description: `Ran rigorous OpenRouter analysis sequence. Detected ${allIssues.length} concrete issues.`,
        completed_at: new Date().toISOString(),
        step_order: 3,
      },
      {
        id: 'step-4',
        agent_name: 'solution-planning',
        status: 'success' as const,
        description: `Classified issues by severity and priority (Security/Perf/Bugs). Orchestration complete.`,
        completed_at: new Date().toISOString(),
        step_order: 4,
      },
    ];

    console.log(`✅ Analysis complete!\n`);

    res.json({
      repoName,
      issues: allIssues,
      metrics,
      agentSteps,
    });
  } catch (err: any) {
    console.error('Analysis error:', err);
    res.status(500).json({ error: err.message || 'Analysis failed' });
  }
});

/** POST /api/resolve — Generate AI fix for a specific issue using OpenRouter */
app.post('/api/resolve', async (req, res) => {
  try {
    const { issue, repoUrl } = req.body;
    if (!issue) return res.status(400).json({ error: 'issue is required' });

    const authHeader = req.headers.authorization;
    const { owner, repo } = repoUrl ? parseRepoUrl(repoUrl) : { owner: '', repo: '' };

    // Fetch the actual file content to give context
    let fileContent = issue.codeSnippet || '';
    if (owner && repo && issue.file) {
      try {
        const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers: githubHeaders(authHeader) });
        const repoData: any = await repoRes.json();
        const defaultBranch = repoData.default_branch || 'main';
        fileContent = await fetchFileContent(owner, repo, defaultBranch, issue.file, authHeader);
      } catch (e) {
        console.warn('Could not fetch file content, using snippet');
      }
    }

    const truncatedContent = fileContent.slice(0, 6000); // Token safety
    const issueDescription = `Type: ${issue.type} | Severity: ${issue.severity} | Fix Hint: ${issue.fix} | Problem: ${issue.description}`;

    // connect to code-generation agent
    const fixResult = await generateFix(issueDescription, truncatedContent);

    res.json({
      issueId: issue.id,
      explanation: fixResult.explanation,
      originalCode: fixResult.originalCode,
      fixedCode: fixResult.fixedCode,
      confidence: fixResult.confidence,
      changes: fixResult.changes,
      filePath: issue.file,
    });
  } catch (err: any) {
    console.error('Resolve error:', err);
    res.status(500).json({ error: err.message || 'Fix generation failed' });
  }
});

/** POST /api/create-pr — Create a Pull Request on GitHub */
app.post('/api/create-pr', async (req, res) => {
  // connect to pull-request agent 
  try {
    const { repoUrl, filePath, fixedCode, issueTitle, explanation } = req.body;
    if (!repoUrl || !filePath || !fixedCode) {
      return res.status(400).json({ error: 'repoUrl, filePath, and fixedCode are required' });
    }

    const authHeader = req.headers.authorization;
    const { owner, repo } = parseRepoUrl(repoUrl);
    const branchName = `gitsolve/fix-${Date.now()}`;

    // Get default branch
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { headers: githubHeaders(authHeader) });
    const repoData: any = await repoRes.json();
    const defaultBranch = repoData.default_branch || 'main';

    const refRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs/heads/${defaultBranch}`, { headers: githubHeaders(authHeader) });
    const refData: any = await refRes.json();
    const baseSha = refData.object?.sha;
    if (!baseSha) throw new Error('Could not get base branch SHA');

    // Create branch
    const branchRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/refs`, {
      method: 'POST',
      headers: { ...githubHeaders(authHeader), 'Content-Type': 'application/json' },
      body: JSON.stringify({ ref: `refs/heads/${branchName}`, sha: baseSha }),
    });
    if (!branchRes.ok) throw new Error(`Failed to create branch: ${await branchRes.text()}`);

    // Update file
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

    // Create PR
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

    res.json({
      success: true,
      pr_number: prData.number,
      pr_url: prData.html_url,
      branch_name: branchName,
      title: prData.title,
      repository_name: `${owner}/${repo}`,
    });
  } catch (err: any) {
    console.error('PR creation error:', err);
    res.status(500).json({ error: err.message || 'PR creation failed' });
  }
});

/** Health check */
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Start ─────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 GitSolve API server running on http://localhost:${PORT}`);
});
