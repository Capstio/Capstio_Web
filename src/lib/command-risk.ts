// Sorts a shell command into the three risk levels Capstio uses (safe, needs
// confirmation, dangerous) for the dangerous command demo. A short list of
// well-known patterns, checked in order of severity; anything else counts as
// safe. It explains the idea on the website; it is not the app's own rules.

export type RiskLevel = "safe" | "confirm" | "dangerous";

const dangerous: RegExp[] = [
  /\brm\s+(-\w*\s+)*-\w*[rf]\w*/, // rm -rf, rm -r, rm -f
  /\bdocker\s+(system|volume|image|container|network)\s+prune\b/,
  /\bdocker\s+volume\s+rm\b/,
  /\bdocker\s+compose\s+down\b.*\s(-v|--volumes)\b/,
  /\bmkfs(\.\w+)?\b/,
  /\bdd\s+.*\bof=/,
  /\b(shutdown|reboot|halt|poweroff)\b/,
  /\biptables\s+(-F|--flush)\b/,
  /\bufw\s+(disable|reset)\b/,
  /\bchmod\s+(-R\s+)?777\s+\//,
  /\bdrop\s+(database|table)\b/i,
  /:\(\)\s*\{/, // fork bomb
  />\s*\/dev\/sd[a-z]/,
];

const confirm: RegExp[] = [
  /\bsystemctl\s+(restart|stop|disable|kill)\b/,
  /\bdocker\s+(compose\s+)?(down|stop|restart|rm|kill)\b/,
  /\bpm2\s+(restart|stop|delete|kill)\b/,
  /\bkill(all)?\b/,
  /\bapt(-get)?\s+(upgrade|dist-upgrade|remove|purge|autoremove)\b/,
  /\b(dnf|yum)\s+(update|upgrade|remove)\b/,
  /\bsed\s+-i\b/,
  /\bchown\s+-R\b/,
  /\buserdel\b/,
  /\bgit\s+(reset\s+--hard|push\s+.*--force)\b/,
  /\brm\s/, // removing files without -r or -f
];

export function commandRisk(command: string): RiskLevel {
  const text = command.trim();
  if (dangerous.some((pattern) => pattern.test(text))) return "dangerous";
  if (confirm.some((pattern) => pattern.test(text))) return "confirm";
  return "safe";
}

// One-click examples: safe, needs confirmation, dangerous, dangerous.
export const exampleCommands = [
  "df -h",
  "sudo systemctl restart nginx",
  "docker system prune -a --volumes",
  "rm -rf /var/lib/docker",
];

// The host the demo pretends to be connected to; dangerous commands ask for it.
export const demoHost = "prod-web-1";
