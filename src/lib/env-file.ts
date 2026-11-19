// .env checks of the app playground's config editor: the same rules the
// Capstio editor flags as you type. Kept free of path aliases so it runs
// under plain Node too.

export type EnvCheck = { ok: true } | { ok: false; line: number; message: string };

const keyPattern = /^[A-Za-z_][A-Za-z0-9_]*$/;

// Checks every line: blank lines and # comments pass, anything else must be
// KEY=VALUE with a valid key, closed quotes and no key set twice. Reports the
// first problem with its 1-based line number.
export function validateEnv(text: string): EnvCheck {
  const seen = new Set<string>();
  const lines = text.split("\n");
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index].trim();
    if (line === "" || line.startsWith("#")) continue;
    const at = index + 1;
    const body = line.startsWith("export ") ? line.slice(7).trimStart() : line;
    const equals = body.indexOf("=");
    if (equals === -1) return { ok: false, line: at, message: 'missing "="' };
    const key = body.slice(0, equals).trim();
    if (!keyPattern.test(key)) return { ok: false, line: at, message: `invalid key "${key}"` };
    if (seen.has(key)) return { ok: false, line: at, message: `${key} is set twice` };
    seen.add(key);
    const value = body.slice(equals + 1).trim();
    const quote = value[0];
    if ((quote === '"' || quote === "'") && (value.length < 2 || !value.endsWith(quote))) {
      return { ok: false, line: at, message: "unclosed quote" };
    }
  }
  return { ok: true };
}

// Keys whose values Capstio hides until "Show Secrets": credentials, tokens
// and connection strings (which usually carry a password).
export function isSecretKey(key: string): boolean {
  return /SECRET|TOKEN|PASSWORD|PASS|KEY|DSN|_URL$/i.test(key);
}

// One line split for display: the key (when the line is an assignment) and
// the rest after "=".
export function splitEnvLine(line: string): { key: string; value: string } | null {
  const equals = line.indexOf("=");
  if (line.trimStart().startsWith("#") || equals === -1) return null;
  return { key: line.slice(0, equals), value: line.slice(equals + 1) };
}
