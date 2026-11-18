// Reads the Host blocks of an OpenSSH client config (~/.ssh/config) the way an
// import screen needs them. Runs in the browser only; nothing is sent anywhere.

export type SshHost = {
  alias: string;
  hostName?: string;
  user?: string;
  port?: string;
  identityFile?: string;
  proxyJump?: string;
};

export type ParsedSshConfig = {
  hosts: SshHost[];
  // Patterns such as "Host *" or "Host *.internal" set defaults, they are not hosts.
  skippedPatterns: number;
};

const keys: Record<string, keyof Omit<SshHost, "alias">> = {
  hostname: "hostName",
  user: "user",
  port: "port",
  identityfile: "identityFile",
  proxyjump: "proxyJump",
};

export function parseSshConfig(text: string): ParsedSshConfig {
  const hosts: SshHost[] = [];
  let skippedPatterns = 0;
  // The hosts the current block applies to; null inside a Match block or
  // before the first Host line.
  let current: SshHost[] | null = null;

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    // "Key value", "Key=value" or "Key = value"; values may be quoted.
    const match = line.match(/^(\S+?)\s*(?:=\s*|\s+)(.+)$/);
    if (!match) continue;
    const key = match[1].toLowerCase();
    const value = match[2].trim().replace(/^"(.*)"$/, "$1");

    if (key === "host") {
      current = [];
      for (const alias of value.split(/\s+/)) {
        if (/[*?!]/.test(alias)) {
          skippedPatterns += 1;
          continue;
        }
        const host: SshHost = { alias };
        hosts.push(host);
        current.push(host);
      }
      continue;
    }
    if (key === "match") {
      current = null;
      continue;
    }

    const field = keys[key];
    if (!field || !current) continue;
    // As in ssh, the first value given for a host wins.
    for (const host of current) host[field] ??= value;
  }

  return { hosts, skippedPatterns };
}

// Example shown before the visitor pastes their own config. Documentation
// addresses and made-up names only.
export const exampleSshConfig = `Host prod-web
  HostName 203.0.113.10
  User deploy
  IdentityFile ~/.ssh/id_ed25519

Host staging
  HostName 203.0.113.20
  User ubuntu
  Port 2222

Host db-internal
  HostName 10.0.0.5
  User postgres
  ProxyJump prod-web

Host *
  ServerAliveInterval 30
`;
