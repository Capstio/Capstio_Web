import type { MouseEvent } from "react";
import type { PlaygroundAction } from "@/lib/commands";
import { validateEnv } from "@/lib/env-file";
import {
  apps,
  appsHostId,
  envBackups,
  envFileName,
  envText,
  type AppStatus,
} from "@/lib/playground-data";

// State of one app playground. Everything a visitor changes lives here, so
// switching screens (or tour tabs) keeps a stopped app or an edited .env.

export type Screen = "apps" | "files" | "fleet";
export type AppTab = "container" | "config" | "environment" | "info";

export type AppRun = {
  status: AppStatus;
  // Tick at which the current uptime started, and the uptime then (seconds).
  since: number;
  uptime: number;
  restarts: number;
  lastAction: PlaygroundAction;
};

export type PlaygroundState = {
  screen: Screen;
  hostId: string;
  appId: string;
  appTab: AppTab;
  runs: Record<string, AppRun>;
  openFiles: string[];
  file: string;
  envText: string;
  envSaved: string;
  backups: { text: string; time: string }[];
  secretsShown: boolean;
  tick: number;
};

export type PlaygroundEvent =
  | { type: "screen"; screen: Screen }
  | { type: "host"; hostId: string; screen?: Screen }
  | { type: "app"; appId: string }
  | { type: "appTab"; tab: AppTab }
  | { type: "act"; appId: string; action: PlaygroundAction }
  | { type: "settle"; appId: string }
  | { type: "openFile"; name: string }
  | { type: "closeFile"; name: string }
  | { type: "editEnv"; text: string }
  | { type: "saveEnv"; time: string }
  | { type: "restoreEnv"; time: string }
  | { type: "secrets"; shown: boolean }
  | { type: "tick" };

// What every part of the window gets: the state, a way to change it, and the
// hint shown for parts of the app the playground does not simulate.
export type ScreenProps = {
  state: PlaygroundState;
  send: (event: PlaygroundEvent) => void;
  onInert: (event: MouseEvent<HTMLElement>) => void;
};

export function initialState(screen: Screen): PlaygroundState {
  const runs: Record<string, AppRun> = {};
  for (const app of apps) {
    runs[app.id] = { status: app.status, since: 0, uptime: app.uptime, restarts: 0, lastAction: "restart" };
  }
  runs["queue-worker"].restarts = 38;
  return {
    screen,
    hostId: appsHostId,
    appId: apps[0].id,
    appTab: "container",
    runs,
    openFiles: ["nginx.conf", envFileName],
    file: envFileName,
    envText,
    envSaved: envText,
    backups: [...envBackups],
    secretsShown: false,
    tick: 0,
  };
}

// Seconds an app has been up at the current tick (one tick is 2 seconds).
export const tickSeconds = 2;
export function uptimeOf(run: AppRun, tick: number): number {
  return run.uptime + (tick - run.since) * tickSeconds;
}

export function envDirty(state: PlaygroundState): boolean {
  return state.envText !== state.envSaved;
}

export function reducer(state: PlaygroundState, event: PlaygroundEvent): PlaygroundState {
  switch (event.type) {
    case "screen":
      return { ...state, screen: event.screen };
    case "host":
      return { ...state, hostId: event.hostId, screen: event.screen ?? (state.screen === "fleet" ? "apps" : state.screen) };
    case "app":
      return { ...state, appId: event.appId };
    case "appTab":
      return { ...state, appTab: event.tab };
    case "act": {
      const run = state.runs[event.appId];
      const status: AppStatus = event.action === "stop" ? "stopped" : "restarting";
      return {
        ...state,
        runs: { ...state.runs, [event.appId]: { ...run, status, lastAction: event.action } },
      };
    }
    case "settle": {
      const run = state.runs[event.appId];
      if (run.status !== "restarting") return state;
      return {
        ...state,
        runs: { ...state.runs, [event.appId]: { ...run, status: "running", since: state.tick, uptime: 0 } },
      };
    }
    case "openFile":
      return {
        ...state,
        file: event.name,
        openFiles: state.openFiles.includes(event.name) ? state.openFiles : [...state.openFiles, event.name],
      };
    case "closeFile": {
      const openFiles = state.openFiles.filter((name) => name !== event.name);
      const file = state.file === event.name ? (openFiles.at(-1) ?? "") : state.file;
      return { ...state, openFiles, file };
    }
    case "editEnv":
      return { ...state, envText: event.text };
    case "saveEnv":
      if (!envDirty(state) || !validateEnv(state.envText).ok) return state;
      return {
        ...state,
        envSaved: state.envText,
        backups: [...state.backups, { text: state.envSaved, time: event.time }],
      };
    case "restoreEnv": {
      // The latest backup comes back; what was saved becomes a backup itself,
      // so a restore can be undone the same way.
      const latest = state.backups.at(-1);
      if (!latest) return state;
      return {
        ...state,
        envText: latest.text,
        envSaved: latest.text,
        backups: [...state.backups.slice(0, -1), { text: state.envSaved, time: event.time }],
      };
    }
    case "secrets":
      return { ...state, secretsShown: event.shown };
    case "tick": {
      // A flapping container keeps restarting on its own.
      const flapping = state.runs["queue-worker"];
      const tick = state.tick + 1;
      if (flapping.status !== "flapping" || tick % 3 !== 0) return { ...state, tick };
      return {
        ...state,
        tick,
        runs: { ...state.runs, "queue-worker": { ...flapping, restarts: flapping.restarts + 1, since: tick, uptime: 0 } },
      };
    }
  }
}
