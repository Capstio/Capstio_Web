import type { Runtime } from "./commands";

// Sample data of the app playground (components/playground): the six demo
// servers and the apps, files and settings shown in the Capstio screenshots
// the playground replaces. Nothing here touches a real server.

export type Host = {
  id: string;
  port: number;
  os: string;
  // Base readings; the playground drifts them a little while it is on screen.
  ping: number;
  cpu: number;
  ram: number;
  disk: number;
  alert?: boolean;
};

export const hosts: readonly Host[] = [
  { id: "cache-01", port: 2224, os: "Alpine Linux v3.20", ping: 2, cpu: 1, ram: 10, disk: 72 },
  { id: "prod-db-01", port: 2221, os: "Ubuntu 24.04.5 LTS", ping: 9, cpu: 3, ram: 24, disk: 72 },
  { id: "prod-edge-01", port: 2223, os: "Rocky Linux 9.9 (Blue Onyx)", ping: 18, cpu: 2, ram: 12, disk: 72 },
  { id: "prod-web-01", port: 2230, os: "Ubuntu 24.04.5 LTS", ping: 3, cpu: 4, ram: 18, disk: 72, alert: true },
  { id: "staging-api", port: 2222, os: "Debian GNU/Linux 12 (bookworm)", ping: 2, cpu: 1, ram: 10, disk: 72 },
  { id: "worker-01", port: 2225, os: "Debian GNU/Linux 12 (bookworm)", ping: 2, cpu: 2, ram: 14, disk: 72 },
];

export const appsHostId = "prod-web-01";
export const openAlerts = 2;

export type AppStatus = "running" | "restarting" | "stopped" | "failed" | "flapping";

export type Container = { name: string; image: string; ram: string; cpu: number };

export type DemoApp = {
  id: string;
  runtime: Runtime;
  path?: string;
  user?: string;
  status: AppStatus;
  // Uptime in seconds when the playground opens.
  uptime: number;
  containers: readonly Container[];
  domain?: string;
  port?: number;
  env: readonly [string, string][];
};

const busybox = (name: string, ram = "124 KB"): Container => ({
  name,
  image: "busybox:1.36",
  ram,
  cpu: 0,
});

// The apps Capstio found on prod-web-01 (screenshot "Apps"), in list order.
// The other demo servers have none, as in the All VPS totals.
export const apps: readonly DemoApp[] = [
  {
    id: "billing",
    runtime: "compose",
    path: "/opt/tour/billing",
    status: "running",
    uptime: 540,
    containers: [busybox("billing-worker-1")],
    env: [["QUEUE", "billing"], ["STRIPE_API_KEY", "sk_live_51Hc"]],
  },
  {
    id: "demo-api",
    runtime: "compose",
    path: "/opt/demo-api",
    status: "running",
    uptime: 2010,
    containers: [
      { name: "demo-api-api-1", image: "node:22-alpine", ram: "48,2 MB", cpu: 0.4 },
      { name: "demo-api-db-1", image: "postgres:17", ram: "31,6 MB", cpu: 0.2 },
    ],
    env: [["NODE_ENV", "production"], ["PORT", "8080"], ["DATABASE_URL", "postgres://api:pw@db/api"]],
  },
  {
    id: "demo-web",
    runtime: "compose",
    path: "/opt/demo-web",
    status: "running",
    uptime: 2010,
    containers: [{ name: "demo-web-web-1", image: "nginx:1.27-alpine", ram: "6,1 MB", cpu: 0 }],
    domain: "demo.example.com",
    port: 80,
    env: [["NGINX_HOST", "demo.example.com"]],
  },
  {
    id: "metrics",
    runtime: "compose",
    path: "/opt/tour/metrics",
    status: "running",
    uptime: 540,
    containers: [busybox("metrics-exporter-1")],
    env: [["SCRAPE_INTERVAL", "15s"]],
  },
  {
    id: "queue-worker",
    runtime: "compose",
    path: "/opt/queue-worker",
    status: "flapping",
    uptime: 4,
    containers: [busybox("queue-worker-worker-1", "96 KB")],
    env: [["REDIS_URL", "redis://cache-01:6379/0"]],
  },
  {
    id: "shop-api",
    runtime: "compose",
    path: "/opt/tour/shop-api",
    status: "running",
    uptime: 540,
    containers: [busybox("shop-api-api-1"), busybox("shop-api-jobs-1")],
    port: 3001,
    env: [["PORT", "3001"], ["DATABASE_URL", "postgres://shop:pw@prod-db-01/shop"]],
  },
  {
    id: "shop-web",
    runtime: "compose",
    path: "/opt/tour/shop-web",
    status: "running",
    uptime: 540,
    containers: [busybox("shop-web-web-1")],
    domain: "shop.example.com",
    port: 3000,
    env: [["NODE_ENV", "production"], ["PORT", "3000"]],
  },
  {
    id: "legacy-cron",
    runtime: "pm2",
    path: "/root/legacy-cron",
    user: "root",
    status: "running",
    uptime: 1980,
    containers: [{ name: "legacy-cron", image: "node /root/legacy-cron/index.js", ram: "38,4 MB", cpu: 0.5 }],
    env: [["CRON", "*/5 * * * *"]],
  },
  {
    id: "demo-healthy",
    runtime: "systemd",
    status: "running",
    uptime: 1990,
    containers: [{ name: "demo-healthy.service", image: "/usr/local/bin/demo-healthy", ram: "2,3 MB", cpu: 0 }],
    env: [],
  },
  {
    id: "pm2-root",
    runtime: "systemd",
    status: "running",
    uptime: 1990,
    containers: [{ name: "pm2-root.service", image: "PM2 v7.0.4: God Daemon", ram: "52,0 MB", cpu: 0 }],
    env: [["PM2_HOME", "/root/.pm2"]],
  },
  {
    id: "report-worker",
    runtime: "systemd",
    path: "/opt/report-worker",
    status: "failed",
    uptime: 0,
    containers: [{ name: "report-worker.service", image: "/opt/report-worker/run.sh", ram: "—", cpu: 0 }],
    env: [["REPORT_BUCKET", "s3://reports"], ["AWS_SECRET_ACCESS_KEY", "wJalrXUtnFEMI"]],
  },
];

// The config file each runtime keeps for an app (Config tab).
export function appConfig(app: DemoApp): { file: string; text: string } {
  if (app.runtime === "compose") {
    const service = app.containers[0].name.split("-").slice(-2, -1)[0] ?? "app";
    return {
      file: `${app.path}/docker-compose.yml`,
      text: `services:\n  ${service}:\n    image: ${app.containers[0].image}\n    restart: unless-stopped\n    env_file: .env\n`,
    };
  }
  if (app.runtime === "pm2") {
    return {
      file: `${app.path}/ecosystem.config.js`,
      text: `module.exports = {\n  apps: [{\n    name: "${app.id}",\n    script: "index.js",\n    cron_restart: "0 3 * * *",\n  }],\n};\n`,
    };
  }
  return {
    file: `/etc/systemd/system/${app.id}.service`,
    text: `[Unit]\nDescription=${app.id}\nAfter=network.target\n\n[Service]\nExecStart=${app.containers[0].image}\nRestart=on-failure\n\n[Install]\nWantedBy=multi-user.target\n`,
  };
}

// Files tab: the shop-web folder with its .env, opened in the safe editor.
export const filesFolder = ["home", "deploy", "apps", "shop-web"] as const;

export type DemoFile = { name: string; size: string; kind: "env" | "yaml" | "nginx"; text: string };

export const envFileName = ".env.example";

export const envText = `NODE_ENV=production
PORT=3000
DATABASE_URL=postgres://shop:s3cr3t@prod-db-01:5432/shop
REDIS_URL=redis://cache-01:6379/0
STRIPE_WEBHOOK_SECRET=whsec_51HcQ2eZvKYlo2C
SENTRY_DSN=https://4f2a@o1.ingest.sentry.io/42
`;

// Earlier versions kept on the server, oldest first.
export const envBackups: readonly { text: string; time: string }[] = [
  { text: envText.replace("PORT=3000", "PORT=8080"), time: "11:04" },
  { text: envText.replace("NODE_ENV=production", "NODE_ENV=staging"), time: "12:30" },
  { text: envText.replace("PORT=3000\n", "PORT=3000\nLOG_LEVEL=debug\n"), time: "13:52" },
];

export const files: readonly DemoFile[] = [
  { name: envFileName, size: "230 bytes", kind: "env", text: envText },
  {
    name: "docker-compose.yml",
    size: "184 bytes",
    kind: "yaml",
    text: `services:\n  web:\n    image: ghcr.io/acme/shop-web:2.4.1\n    env_file: .env\n    ports:\n      - "3000:3000"\n    restart: unless-stopped\n`,
  },
  {
    name: "nginx.conf",
    size: "577 bytes",
    kind: "nginx",
    text: `server {\n    listen 443 ssl;\n    server_name shop.example.com;\n\n    location / {\n        proxy_pass http://127.0.0.1:3000;\n        proxy_set_header Host $host;\n    }\n}\n`,
  },
];

// Deterministic drift for live readings: the same (seed, tick) always gives
// the same value, so server and client render alike before the first tick.
export function drift(seed: number, tick: number, base: number, spread: number): number {
  if (tick === 0) return base;
  const noise = Math.sin(seed * 12.9898 + tick * 78.233) * 43758.5453;
  const unit = noise - Math.floor(noise);
  return Math.max(0, base + (unit - 0.5) * 2 * spread);
}
