// The shell command Capstio runs for each app action, per way the app is run
// (brief: "lệnh tương đương đổi đúng theo loại"). Shown in the equivalent
// command playground and offered for copying in the command palette. The
// example app is called "api".

export const runtimes = ["compose", "pm2", "systemd"] as const;
export type Runtime = (typeof runtimes)[number];

export const runtimeNames: Record<Runtime, string> = {
  compose: "Docker Compose",
  pm2: "PM2",
  systemd: "systemd",
};

// Shorter names for narrow screens.
export const runtimeShortNames: Record<Runtime, string> = {
  ...runtimeNames,
  compose: "Compose",
};

export const appActions = ["restart", "stop", "logs", "status"] as const;
export type AppAction = (typeof appActions)[number];

export const equivalentCommands: Record<Runtime, Record<AppAction, string>> = {
  compose: {
    restart: "docker compose restart api",
    stop: "docker compose stop api",
    logs: "docker compose logs -f --tail 200 api",
    status: "docker compose ps api",
  },
  pm2: {
    restart: "pm2 restart api",
    stop: "pm2 stop api",
    logs: "pm2 logs api --lines 200",
    status: "pm2 describe api",
  },
  systemd: {
    restart: "sudo systemctl restart api",
    stop: "sudo systemctl stop api",
    logs: "journalctl -u api -f -n 200",
    status: "systemctl status api",
  },
};
