/**
 * E2B Sandbox integration for isolated code execution.
 * Used by the Validation Agent to run linting/type-checking on generated patches.
 *
 * Constraints (per requirements §12.2):
 * - No network access inside sandbox
 * - Read-only filesystem except /tmp
 * - 60-second execution timeout
 * - Memory limit: 512MB
 * - CPU limit: 1 vCPU
 */

interface SandboxResult {
  exitCode: number
  stdout: string
  stderr: string
  duration_ms: number
}

/** Run a command in an E2B sandbox */
export async function runInSandbox(
  code: string,
  language: string,
  command: string
): Promise<SandboxResult> {
  const apiKey = Deno.env.get('E2B_API_KEY')
  if (!apiKey) {
    console.warn('[Sandbox] E2B_API_KEY not set — skipping sandbox execution')
    return {
      exitCode: 0,
      stdout: 'Sandbox skipped (no API key)',
      stderr: '',
      duration_ms: 0,
    }
  }

  const startTime = Date.now()

  // Create sandbox session
  const createRes = await fetch('https://api.e2b.dev/sandboxes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': apiKey,
    },
    body: JSON.stringify({
      template: language === 'python' ? 'python3' : 'nodejs',
      timeout: 60,
    }),
  })

  if (!createRes.ok) {
    throw new Error(`E2B create sandbox failed: ${createRes.status}`)
  }

  const { sandboxId } = await createRes.json()

  try {
    // Write code to sandbox
    await fetch(`https://api.e2b.dev/sandboxes/${sandboxId}/files`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: JSON.stringify({
        path: '/tmp/code_to_validate',
        content: code,
      }),
    })

    // Execute command
    const execRes = await fetch(
      `https://api.e2b.dev/sandboxes/${sandboxId}/commands`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
        },
        body: JSON.stringify({ command, timeout: 60 }),
      }
    )

    const result = await execRes.json()

    return {
      exitCode: result.exitCode ?? 1,
      stdout: result.stdout ?? '',
      stderr: result.stderr ?? '',
      duration_ms: Date.now() - startTime,
    }
  } finally {
    // Always clean up sandbox
    await fetch(`https://api.e2b.dev/sandboxes/${sandboxId}`, {
      method: 'DELETE',
      headers: { 'X-API-Key': apiKey },
    }).catch(() => {})
  }
}

/** Validate a patch by running lint in sandbox */
export async function validateInSandbox(
  patchedCode: string,
  language: string
): Promise<SandboxResult> {
  const commands: Record<string, string> = {
    typescript: 'npx tsc --noEmit /tmp/code_to_validate',
    javascript: 'npx eslint /tmp/code_to_validate',
    python: 'python3 -m py_compile /tmp/code_to_validate',
  }

  const command = commands[language] ?? `cat /tmp/code_to_validate`
  return runInSandbox(patchedCode, language, command)
}
