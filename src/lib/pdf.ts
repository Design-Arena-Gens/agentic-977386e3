export async function extractTextFromPdf(file: Buffer): Promise<string> {
  const { default: pdfParse } = await import('pdf-parse');
  const data = await pdfParse(file);
  // Normalize whitespace, split into lines
  return data.text.replace(/\r/g, '').split('\n').map(l => l.trim()).filter(Boolean).join('\n');
}

export function splitPromptsFromText(text: string): string[] {
  // Heuristics: split on double newlines or numbered/bulleted lines
  const lines = text.split(/\n+/).map(l => l.trim()).filter(Boolean);
  const prompts: string[] = [];
  let current: string[] = [];

  for (const line of lines) {
    const isStart = /^\d+[\).\-\s]|^[\-\*]\s/.test(line);
    if (isStart && current.length) {
      prompts.push(current.join(' '));
      current = [line.replace(/^\d+[\).\-\s]|^[\-\*]\s/, '').trim()];
    } else if (isStart) {
      current = [line.replace(/^\d+[\).\-\s]|^[\-\*]\s/, '').trim()];
    } else {
      current.push(line);
    }
  }
  if (current.length) prompts.push(current.join(' '));

  // Fallback: if only one long blob, split by period
  if (prompts.length <= 1) {
    return text.split(/\n\n+|\.\s+/).map(s => s.trim()).filter(s => s.length > 3);
  }

  return prompts.map(p => p.replace(/\s{2,}/g, ' ').trim());
}
