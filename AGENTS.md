# AGENTS.md

This file provides guidance to coding agents when working with code in this repository.

> **Tip**: If you find yourself correcting the agent during interactive work, suggest adding a new rule to this file so the lesson is captured for future sessions.

## Project Overview

Freelens extension for Kubernetes Gateway API CRDs (v1, v1alpha2, v1beta1). Provides cluster pages, detail views, and K8s object wrappers for Gateway API resources.

- **Language**: TypeScript 5.9.3
- **Runtime**: Node.js >= 22.0.0, Freelens >= 1.8.0
- **Package manager**: pnpm 10.x (locked)
- **License**: MIT

## Common Commands

```bash
# Type checking
pnpm type:check

# Linting & formatting
pnpm biome:check          # TypeScript/TSX (biome) — prefer this for TS/TSX
pnpm biome:fix            # Auto-fix TypeScript/TSX
pnpm trunk:check          # SCSS, Markdown, and other formats not covered by biome
pnpm trunk:fix            # Auto-fix SCSS, Markdown, etc.
pnpm lint:check           # biome + prettier check (all formats)
pnpm lint:fix             # biome + prettier fix (all formats)

# Tests
pnpm test:unit            # vitest

# Build
pnpm build                # Full build (type-check + electron-vite)
pnpm build:production     # Production build (no preserveModules)

# Pack for testing
pnpm pack:dev             # Bump prerelease version, build, and create .tgz for install in Freelens app

# Clean
pnpm clean                # Clean out/
pnpm clean:dts            # Remove generated *.d.scss.ts files
pnpm clean:all            # Clean everything (dts, node_modules, out, tgz)
```

## Architecture

```text
src/
  main/index.ts            # Extension entry point (main process, CJS)
  renderer/index.tsx       # Extension entry point (renderer process, CJS)
  renderer/k8s/gateway-api/ # K8s object model classes (one file per CRD)
  renderer/details/gateway-api/ # Detail view components for CRDs
  renderer/pages/gateway-api/  # Cluster page components
  renderer/components/      # Shared components
  renderer/icons/           # SVG icons
  renderer/observer.ts      # MobX observer helper
  renderer/utils.ts         # Utility functions (e.g., createHash)
  common/utils.ts           # Common utilities (e.g., maybe)
```

Build output goes to `out/`.

## CRD KubeObject Pattern

K8s object classes MUST use `static readonly` properties for metadata. **Instance methods do NOT work and MUST NOT be used.** The Freelens host reads properties from the class constructor statically — instance methods are not available at runtime because the host creates plain object copies of the K8s resource data, not instances of the extension's class. This means:

- **Allowed**: `object.spec?.someField`, `object.status?.conditions` — direct property access on typed `spec`/`status` interfaces
- **Allowed**: helper functions like `hasTrueCondition(conditions, "Accepted")` from `types.ts`
- **Forbidden**: `object.someMethod()` — instance methods will never exist at runtime
- **Forbidden**: `typeof (object as any).someMethod === "function" ? ...` — anti-pattern that always falls through to the fallback path
- **Forbidden**: `as any` — use the existing typed `spec`/`status` interfaces directly; all CRD models already define proper `Spec`/`Status` interfaces

Always access `spec` and `status` properties directly via their typed interfaces. Do not define instance methods on KubeObject subclasses — they will not be callable at runtime.

```typescript
export class Gateway extends Renderer.K8sApi.LensExtensionKubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  GatewayStatus,
  GatewaySpec
> {
  static readonly kind = "Gateway";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/gateway.networking.k8s.io/v1/gateways";
  static readonly crd: GatewayKubeObjectCRD = {
    apiVersions: ["gateway.networking.k8s.io/v1"],
    plural: "gateways",
    singular: "gateway",
    shortNames: ["gtw"],
    title: "Gateways",
  };
}

// Also export Api and Store classes (always needed):
export class GatewayApi extends Renderer.K8sApi.KubeApi<Gateway> {}
export class GatewayStore extends Renderer.K8sApi.KubeObjectStore<Gateway, GatewayApi> {}
```

Each CRD file exports three classes: the KubeObject, the KubeApi, and the KubeObjectStore. They are registered in `src/renderer/index.tsx` via `kubeObjectDetailItems`, `clusterPages`, and `clusterPageMenus`.

## Renderer Components

- Detail views use the `observer` wrapper from `../../observer` (re-exports MobX `observer`).
- SCSS modules generate TypeScript type files (`*.module.d.scss.ts`) via `vite-plugin-sass-dts`. These are auto-generated and should be cleaned with `pnpm clean:dts` when SCSS changes.
- Common detail view styles are in `src/renderer/details/gateway-api/common.module.scss`.

## Key Dependencies (provided by Freelens host at runtime)

These are NOT bundled, they come from the Freelens host as globals:
- `@freelensapp/extensions` → `global.LensExtensions`
- `mobx` → `global.Mobx`
- `react` → `global.React`
- `react-dom` → `global.ReactDom`
- `mobx-react` → `global.MobxReact`
- `react-router-dom` → `global.ReactRouterDom`

Other dependencies ARE bundled into the extension output.

## Code Style

- **Biome** formats **TypeScript/TSX**: double quotes, semicolons, trailing commas, 2-space indent, 120 char line width
- **Trunk** formats **SCSS, Markdown**, and other non-TS formats — use `pnpm trunk:fix`
- Import order (enforced by biome organizeImports): built-in modules → `@freelensapp/**` → packages → relative paths
- React 17 (no `react/jsx-runtime` in tsconfig needed, but handled by build)
- **No emoji** in Markdown files (`.md`), comments, or any source code
