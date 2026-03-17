export function chunkCode(code: string, chunkSize = 120, overlap = 20): string[] {
  const lines = code.split('\n');
  const chunks: string[] = [];
  let start = 0;

  while (start < lines.length) {
    const end = start + chunkSize;
    const chunk = lines.slice(start, end).join('\n');
    chunks.push(chunk);
    start += chunkSize - overlap;
  }

  return chunks;
}
