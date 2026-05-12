import { Renderer } from "@freelensapp/extensions";

type Observer = <T extends (...args: any[]) => any>(component: T) => T;

const fromGlobal =
  (globalThis as any).MobxReact?.observer ??
  (globalThis as any).LensExtensions?.MobxReact?.observer ??
  (globalThis as any).LensExtensions?.Renderer?.MobxReact?.observer;

// If host didn't expose MobxReact yet, keep app functional without crashing.
export const observer: Observer = typeof fromGlobal === "function" ? fromGlobal : (component: any) => component;

// Keep import of Renderer to match extension runtime assumptions and avoid treeshake quirks.
void Renderer;
