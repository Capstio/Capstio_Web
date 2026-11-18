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

// Buttons of the app playground, per runtime (components/playground).
export type PlaygroundAction = "restart" | "stop" | "start" | "pull" | "reload";

export const playgroundActions: Record<Runtime, readonly PlaygroundAction[]> = {
  compose: ["restart", "stop", "pull"],
  pm2: ["restart", "stop", "reload"],
  systemd: ["restart", "stop"],
};

// The command one playground button stands for. A Compose project is
// addressed by its folder, a PM2 process or systemd unit by its name; PM2
// apps that belong to root run through sudo.
export function appCommand(
  runtime: Runtime,
  action: PlaygroundAction,
  app: { name: string; path?: string; user?: string },
): string {
  if (runtime === "compose") {
    const verb = action === "pull" ? "pull && docker compose up -d" : action;
    return `cd ${app.path} && docker compose ${verb}`;
  }
  if (runtime === "pm2") {
    const sudo = app.user === "root" ? "sudo " : "";
    return `${sudo}pm2 ${action} ${app.name}`;
  }
  return `sudo systemctl ${action} ${app.name}`;
}
