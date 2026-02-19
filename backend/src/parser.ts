export function parseAIResponse(raw: string): string {
    let parsed = raw;
    parsed = parsed.replace(/<thinking>[\s\S]*?<\/thinking>/g, '');
    parsed = parsed.replace(/<stage>[\s\S]*?<\/stage>/g, '');
    parsed = parsed.replace(/<\/?[a-zA-Z_][a-zA-Z0-9_-]*\s*\/?>/g, '');
    parsed = parsed.replace(/\n{3,}/g, '\n\n').trim();
    return parsed;
}
