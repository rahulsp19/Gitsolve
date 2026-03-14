export interface CodeChunk {
  content: string
  type: 'function' | 'class' | 'module' | 'block'
  startLine: number
  endLine: number
  language: string
}

/** Simple line-based chunker (Tree-sitter WASM used in production) */
export function chunkCode(content: string, language: string, maxTokens = 1500): CodeChunk[] {
  const lines = content.split('\n')
  const chunks: CodeChunk[] = []

  // For MVP: split by empty lines as rough semantic boundaries
  let currentChunk: string[] = []
  let startLine = 0

  lines.forEach((line, idx) => {
    currentChunk.push(line)
    const approxTokens = currentChunk.join('\n').length / 4

    if (approxTokens >= maxTokens || idx === lines.length - 1) {
      if (currentChunk.join('').trim()) {
        chunks.push({
          content: currentChunk.join('\n'),
          type: detectChunkType(currentChunk, language),
          startLine,
          endLine: idx,
          language,
        })
      }
      startLine = idx + 1
      currentChunk = []
    }
  })

  return chunks
}

function detectChunkType(lines: string[], language: string): CodeChunk['type'] {
  const text = lines.join('\n')
  if (/^\s*(def |async def |function |const \w+ = \(|async function)/.test(text)) return 'function'
  if (/^\s*(class )/.test(text)) return 'class'
  return 'block'
}

export function buildChunkContext(filePath: string, chunk: CodeChunk): string {
  return `File: ${filePath}\nLanguage: ${chunk.language}\nType: ${chunk.type}\nLines: ${chunk.startLine}-${chunk.endLine}\n\n${chunk.content}`
}
