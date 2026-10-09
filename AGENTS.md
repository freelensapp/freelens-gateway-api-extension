# AGENTS.md

This file provides guidance to coding agents when working with code in this repository.

> **Tip**: If you find yourself correcting the agent during interactive work, suggest adding a new rule to this file so the lesson is captured for future sessions.

## Project Overview

Freelens extension for Kubernetes Gateway API CRDs (v1, v1alpha2, v1beta1). Provides cluster pages, detail views, and K8s object wrappers for Gateway API resources.

- **Language**: TypeScript 7.0.2
- **Runtime**: Freelens >= 2.0.0 (extension API v2)
- **Toolchain**: Node.js 24.21.0, yq 4.54.1 and cosign 3.1.3 (`mise.toml` with
  `mise.lock`; Node also in `.nvmrc`)
- **Package manager**: pnpm 12.9.1 (`packageManager`, run through corepack)
- **License**: MIT

Library and tool versions follow the Freelens stack exactly: the catalog in
Freelens's `pnpm-workspace.yaml` for libraries, the root `package.json` scripts
of Freelens for tools run with `pnpm dlx` (Biome, knip, Trunk launcher), and
Freelens's `mise.toml`, `mise.lock` and `.nvmrc` for Node and the other mise
tools. A library added to `package.json` that Freelens also has takes the
catalog version.

`mise.lock` pins a checksum and a URL per tool for all eight platforms; after
changing `mise.toml`, run `mise lock` (not only `mise install`, which re-locks
just the current platform). `mise.lock` is lockfile revision 3
(`lockfile_version = 3`), which needs mise 2026.9.16 or newer.

`@freelensapp/extensions` is pinned to one exact version, a nightly until
Freelens 2.0.0 is released. The libraries the host provides at runtime
(`react`, `react-dom`, `mobx`, `mobx-react`) and their types are
devDependencies only, for compiling and testing; `electron` is a devDependency
for its types only. `@types/react-dom` is needed because the
`@freelensapp/extensions` declaration imports its React types from `react` and
`react-dom`. No other `@freelensapp/*` package is a dependency: they are not
published for v2, and their types are reached through `Renderer.K8sApi` and the
other namespaces of `@freelensapp/extensions`.

pnpm settings live in `pnpm-workspace.yaml`. A dependency runs its install
scripts only when `allowBuilds` sets it to `true`; a new dependency with
install scripts that is not listed there fails `pnpm install`, so add it with
`true` or `false` deliberately. pnpm refuses versions younger than its
`minimumReleaseAge` (1 day), with `@freelensapp/extensions` excluded because
its pinned nightly is often adopted on the day it is published.

`strictPeerDependencies: true` makes `pnpm install` fail when the extension's
own copy of a shared library is outside the peer range that
`@freelensapp/extensions` declares for it (`react`, `react-dom`, `@types/react`,
`@types/react-dom`, `mobx`, `mobx-react`, `monaco-editor`, `electron`). These
peers are optional, so they are checked only for the libraries the extension
declares, and without the setting pnpm reports a mismatch as one warning line
and installs anyway. Keep one copy of each shared library and of `@types/node`
in the tree (`pnpm why <name>`; `pnpm dedupe` after an update).

## Common Commands

```bash
# Type checking
pnpm type:check           # All programs below, in this order
pnpm type:check:sources   # src/main, src/renderer, src/common
pnpm type:check:tests     # *.test.ts(x) under src/, and test/
pnpm type:check:tooling   # Vite, Vitest and SVGO configs, build/
pnpm type:check:environments # environment-tests/

# Linting & formatting
pnpm biome:check          # TypeScript/TSX, JS, JSON, CSS, HTML, SVG (biome)
pnpm biome:fix            # Auto-fix the formats above
pnpm trunk:check          # Markdown, YAML, TOML, SCSS, workflows, and Biome again (changed files)
pnpm trunk:fix            # Auto-fix Markdown, YAML, SCSS, etc.
pnpm lint:check           # Alias for biome:check
pnpm lint:fix             # Alias for biome:fix
pnpm knip:check           # Unused and unlisted dependencies (knip)

# Tests
pnpm test:unit            # vitest

# Build
pnpm build                # Both Vite runs, without the type check

# Pack for testing
pnpm pack:dev             # Bump prerelease version, build, and create .tgz for install in Freelens app

# Clean
pnpm clean                # Clean dist/
pnpm clean:dts            # Remove generated *.d.scss.ts files
pnpm clean:all            # Clean everything (dist, dts, node_modules, tgz)
```

## Architecture

```text
src/
  main/index.ts            # Extension entry point (main process, ESM)
  renderer/index.tsx       # Extension entry point (renderer process, ESM)
  renderer/k8s/gateway-api/ # K8s object model classes (one file per CRD)
  renderer/details/gateway-api/ # Detail view components for CRDs
  renderer/pages/gateway-api/  # Cluster page components
  renderer/components/      # Shared components
  renderer/icons/           # SVG icons
  common/utils.ts           # Common utilities (e.g., maybe)
```

Build output goes to `dist/`: `main.js`, `renderer.js` and `renderer.css`, with
source maps. `main` and `renderer` in `package.json` point at the two entries.
The Vite plugins of the build are in `build/`.

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

Kubernetes types that the models share with the host, such as `Condition`, `LabelSelector` and `ObjectReference`,
come from `Renderer.K8sApi` (`Renderer.K8sApi.Condition`).

The host renders a cluster page with `params` as its only prop. A page that needs the extension instance, as every
page here does for its error page, is created once at module level and registered as
`Page: () => <Page extension={this} />`. Creating it inside the `clusterPages` initializer with `this` as an argument
makes TypeScript infer the field circularly (TS7022).

## Renderer Components

- Components that read observables are wrapped in `observer` from `mobx-react`. The build resolves `mobx-react` to the
  host's instance (see "Modules provided by the host"), so the components react to the host's stores.
- React keys derived from an object's content come from `Renderer.Util.createReactKey`. It serializes with
  `JSON.stringify`, so it throws for `undefined`, and the key depends on the order of the object's keys.
- A component imports its CSS module for the class names. The rules reach the page through `renderer.css` (see
  "CSS"), so there is no `?inline` copy and no `<style>` tag.
- SCSS modules get TypeScript declarations (`*.module.d.scss.ts`), written during the renderer build (see
  "CSS module declarations"). They are committed, because `pnpm type:check` runs without a build; commit the
  regenerated file with a change to its SCSS module. `pnpm clean:dts` removes them.
- Common detail view styles are in `src/renderer/details/k8s/common.module.scss` and
  `src/renderer/details/x-k8s/common.module.scss`.

## Build

`vite.config.mjs` builds one entry point per run, in library mode, as ESM:
`vite build` builds the renderer and empties `dist/`, and `vite build --mode
main` builds main next to it. The two runs share no chunk; each bundle carries
its own copy of the `src/common/` code it imports. Nothing is minified.
`pnpm build` runs both and no type check.

A watch build of the renderer (`vite build --watch`) needs `--no-emptyOutDir`.
In watch mode Vite empties the output directory again before every rebuild, so
a renderer rebuild would delete `dist/main.js`.

### Modules provided by the host

The host publishes its singletons on `globalThis.FreelensExtensionApi`, and
each process publishes only the ones it has. This is contract C3 of the
Freelens extension API (`docs/extensions/api.md`):

| Module id           | Global            | Published in |
| ------------------- | ----------------- | ------------ |
| `react`             | `React`           | renderer     |
| `react-dom`         | `ReactDom`        | renderer     |
| `react/jsx-runtime` | `ReactJsxRuntime` | renderer     |
| `mobx`              | `Mobx`            | both         |
| `mobx-react`        | `MobxReact`       | renderer     |
| `monaco-editor`     | `MonacoEditor`    | renderer     |

`build/vite-plugin-host-modules.mjs` replaces a bare import of one of these
with a module that reads the global, in the extension's code and in every
library it bundles. Its named exports are the members of the copy installed as
a devDependency, which is pinned to the host's version, so the module graph is
static and an import of a name the host's version lacks fails the build. The
plugin also fails the build on an import of a host module that the process does
not publish (`react` in main), and on a subpath of a host package that the host
does not publish (`react-dom/client`, `react/jsx-dev-runtime`). Both would
otherwise either read `undefined` at runtime or bundle a second copy. A second
React throws `invalid hook call`; a second mobx throws nothing, and the host
simply never reacts to its observables.

Everything else is bundled. That includes `@freelensapp/extensions`, a shim of
three lines that reads `Common`, `Main` and `Renderer` off the same global; it
must not be mapped. `react-router-dom` is not provided by the host. The host
installs no dependencies of an extension, so whatever the code needs at runtime
and the host does not provide has to be in the bundle.

### Process-specific settings

- **Renderer**: nothing is external. Renderer code gets no Node or Electron, and
  an import of a Node builtin or of `electron` fails the build (Vite would
  otherwise replace it with an empty module and only warn).
  `process.env.NODE_ENV` is replaced at build time, because library mode
  leaves it for a consumer's bundler and the page has no `process`.
- **Main**: Node builtins (`node:*` and bare) and `electron` stay external.
  Bundled packages resolve with Vite's server conditions, so main gets their
  Node builds rather than their browser builds.

### Decorators

MobX 7 supports standard decorators only, and Oxc, which transpiles TypeScript
for Vite, passes them through unlowered, while neither Node nor Chromium runs
them yet. `build/vite-plugin-standard-decorators.mjs`, copied from Freelens,
hands every module with a decorator to esbuild first, which lowers the
decorators and their `accessor` fields. `vite.config.mjs` and
`vitest.config.ts` both use it. A decorator that reaches the host or a test
unlowered is a syntax error when the module is evaluated.

An observable field is an `accessor` (`@observable accessor enabled = false;`),
and the class does not call `makeObservable(this)`. `@observable` on a plain
field type-checks and builds; the development build of mobx throws when the
class is defined, and the production build leaves the field unobservable.

### CSS

The host links the stylesheet named after the renderer entry, `renderer.css`
next to `renderer.js`. Library mode extracts the CSS of the whole bundle into
that one file (`build.lib.cssFileName`), so a CSS module imported for its class
names reaches the page through it. A build that emits more than one CSS asset,
or a differently named one, leaves the extension unstyled; nothing checks it,
so look at `dist/` after a change to the CSS setup. CSS modules use
`camelCaseOnly` class names.

### CSS module declarations

`build/vite-plugin-css-module-declarations.mjs` writes `x.module.d.scss.ts`
next to every `x.module.scss` the renderer build imports, in `vite build` and
in watch mode. It takes the class names from Vite's own `preprocessCSS`, with
the build's resolved config, so they are the names the bundle exports, after
`localsConvention`; a class inside `:global(...)` is not one of them.

The plugin is written so that a build cannot leave a committed declaration
empty or partial, whether it fails, is interrupted or is killed:

- it awaits its work in `transform`, so the build does not end while a write is
  pending;
- it writes a declaration only when the content changed, so a build that
  changes no stylesheet touches no file;
- it writes to a temporary `*.tmp` file next to the declaration and renames it
  over the declaration, which replaces it whole or not at all.

The plugin has no options and no dependency other than Vite, and it refers to
no path of this repository, so other extensions copy it unchanged.

## TypeScript

Main code runs in Node, renderer code in a browser page, and common code in
both. Each is type-checked in a program of its own, so that an API the runtime
does not have fails `pnpm type:check` rather than the extension:

| Config                       | lib                       | types                 | Files                                                              |
| ---------------------------- | ------------------------- | --------------------- | ------------------------------------------------------------------ |
| `src/main/tsconfig.json`     | ES2024                    | `node`                | `src/main/`, `src/common/`                                         |
| `src/renderer/tsconfig.json` | ES2024, DOM, DOM.Iterable | `vite/client`         | `src/renderer/`, `src/common/`                                     |
| `src/common/tsconfig.json`   | ES2024, WebWorker         | none                  | `src/common/`                                                      |
| `src/tsconfig.json`          | ES2024, DOM, DOM.Iterable | `node`, `vite/client` | `*.test.ts(x)` under `src/`, and `test/`                           |
| `tsconfig.json`              | ES2024                    | `node`                | `vite.config.mjs`, `vitest.config.ts`, `svgo.config.mjs`, `build/` |

The three source configs exclude the test files. All configs extend
`tsconfig.base.json`, which has the compiler options of Freelens's fixture
extension: `strict`, `moduleResolution: Bundler`, `useDefineForClassFields`,
`noUncheckedSideEffectImports` and `skipLibCheck` among them. `skipLibCheck` is
required: `extension-api.d.ts` is one declaration for both processes and names
DOM types and the `Electron` namespace, which no single program has. Write
`types` in every config; it decides which `@types` packages a program sees.
`noEmit` is set in the base: TypeScript only checks, and Vite transpiles.

### Main, renderer and common

The main and renderer configs both include `src/common/`. Compiled as main,
common code fails on the DOM; compiled as renderer, it fails on Node. What
passes both is valid in both, and that is the check that decides. Common code
uses only what both runtimes have: `globalThis.crypto`, `TextEncoder` and
`TextDecoder`, `URL` and `URLSearchParams`, `AbortController`,
`structuredClone`, and the timers, with the timer handle kept opaque.

`src/common/tsconfig.json` is for the editor, which gives a file to one config
only. Its `WebWorker` lib is the closest single match and an approximation:
`self` and `postMessage` compile there and fail in the main program.

The split does not cover the API namespaces: `Main` and `Renderer` compile in
every program, and the one the process does not have is `undefined` at runtime.
Common code uses `Common`.

### Asset imports

The renderer program has `vite/client`, which declares `*?raw`, `*?inline` and
the CSS modules and brings no Node into the program. With
`allowArbitraryExtensions`, `import styles from "./x.module.scss"` resolves to
the generated `x.module.d.scss.ts`, so a class name that the stylesheet lacks
fails the check. Without that file, after `pnpm clean:dts`, the import falls
back to the untyped declaration of `vite/client`.

### Environment tests

`types` and `lib` alone do not keep an environment pure. A declaration file
with `/// <reference types="node" />` loads all of `@types/node` into any
program that reaches it, whatever `types` says, and one with
`/// <reference lib="dom" />` loads the DOM. `environment-tests/` proves the
split holds:

| File             | Compiled with          | Must                      |
| ---------------- | ---------------------- | ------------------------- |
| `node-apis.ts`   | renderer, common       | fail on every marked line |
| `dom-apis.ts`    | main, common           | fail on every marked line |
| `worker-apis.ts` | main                   | fail on every marked line |
| `shared-apis.ts` | main, renderer, common | pass                      |

Each line that must fail carries `// @ts-expect-error`, so a program that
starts accepting it fails with an unused directive. The configs there extend
the source configs and keep their `include`, so the probes are compiled
together with the sources and every declaration the sources reach. Compiled
alone, they would not see a declaration that a dependency of the sources brings
in. An error in the sources therefore shows up in the environment run as well.

When a declaration leaks, the environment tests fail; keep the leak out rather
than relax a probe. For Node in the renderer, point `typeRoots` of the renderer
config at a directory with an empty `node` package, which a reference directive
resolves to first. For the DOM in main, remove the directive from the
declaration with `pnpm patch`.

### Tests and tooling

Tests are not in the environment programs. Vitest runs them in Node, with
jsdom for files that ask for it, so `src/tsconfig.json` gives them the DOM and
Node. It sits in `src/` so that an editor finds it for a test file: the
environment config next to the test excludes it, and the editor goes on to the
next `tsconfig.json` up the tree. Tests compile against the real
`@freelensapp/extensions` declaration, while Vitest replaces the package with
`test/freelens-extensions.ts` at runtime.

No config declares the Vitest globals. TypeScript has no per-file globals, so
declaring `describe` or `vi` for tests would declare them for every file in the
program. Test and test-support files import what they use:

```ts
import { describe, expect, it, vi } from "vitest";
```

The module resolves from every program, so Biome keeps it out of the
extension's code: `style/noRestrictedImports` rejects an import of `vitest`
outside `src/**/*.test.*`, `test/` and `integration/`. `globals: true` stays on
in `vitest.config.ts` at runtime only, because React Testing Library registers
its automatic cleanup only when `afterEach` is a global.

The default environment is `node`. A test that renders a component starts with
`// @vitest-environment jsdom` and uses React Testing Library
(`src/renderer/components/error-page.test.tsx`). Vitest does not compile the
stylesheets; a CSS module import gives hashed class names
(`_errorPage_f24b79`), so tests find elements by text or role, not by class.

`@freelensapp/extensions` is stubbed because the real package cannot run in a
test: it is a shim that reads `Common`, `Main` and `Renderer` off
`globalThis.FreelensExtensionApi`, which only the host sets, and it ships no
mocks. The `alias` in `vitest.config.ts` points the import at
`test/freelens-extensions.ts`, for the tests and for the extension code they
import. The stub covers only what the tests use, at runtime only; the type
check still uses the real declaration. So a test that reaches a member the stub
lacks compiles and fails on `undefined`: add the member to the stub, as small as
the test needs. The other host modules are not stubbed: `react`, `mobx` and
`mobx-react` resolve to the devDependencies, the host's versions.

The stub's static `getStore()` of `LensExtensionKubeObject` always throws, as
the host's does for a CRD version it has no API for. A test that needs a version
to be served spies on `getStore` of that model class
(`src/renderer/components/available-version.test.tsx`).

The root `tsconfig.json` checks the tooling files. It has `checkJs`, so the
Vite config and the build plugins are type-checked too; give their function
parameters JSDoc types.

## Lint and CI

### Biome

`biome.jsonc` has the formatter, import groups and rules of Freelens. Two
overrides are specific to how the extension is laid out:

- `style/noRestrictedImports` keeps `vitest` out of the extension's code (see
  "Tests and tooling").
- `correctness/noNodejsModules` rejects a Node builtin import in
  `src/renderer/` and `src/common/`, tests left out. It flags the import in the
  editor, before `pnpm type:check` does; it does not see Node globals such as
  `Buffer` or `process`, which only the type check catches.

Every path in an override starts with `**/`. Trunk runs Biome from a sandbox
outside the repository, with `--config-path` pointing back at `biome.jsonc`,
and there a path anchored at the repository root matches no file, so the
override silently does nothing. A plain `biome check` matches both forms, so
only `trunk check` shows the difference.

`build/` is excluded except for its `*.{js,cjs,mjs}` files, the build plugins.
Biome also formats the SVG icons. It does not read SCSS; Trunk formats it with
Prettier.

### Trunk

`.trunk/trunk.yaml` has the linters of Freelens. Its own Biome definition runs
`biome check` and `biome format` with `--no-errors-on-unmatched`, because Biome
fails on a target that `biome.jsonc` excludes, and adds the `.cjs` and `.mjs`
files that Trunk's `javascript` type does not match. Biome's version there is
the one of the `biome` script in `package.json`.

### Knip

`pnpm knip:check` runs knip twice, for dependencies only: a development pass
over everything, and a `--production --strict` pass over the code that reaches
the bundles, which are the entries marked with `!` in `knip.jsonc`. In the
production pass only `dependencies` count, so a bundled library that the
extension's code imports belongs there. The host-provided modules are
devDependencies, for their types, and are ignored.

`knip.jsonc` lists the entries knip cannot find: the two source entries, the
Vitest alias target `test/freelens-extensions.ts` and the probes in
`environment-tests/`. Its Vite plugin is off: it adds the renderer entry of
`vite.config.mjs` as a development entry, which displaces
`src/renderer/index.tsx!`, and the production pass then skips the renderer.
`--no-config-hints` is set because one config serves both passes, and an entry
that only the production pass needs is reported as redundant by the other.
knip also reads the binaries the workflows in `.github/workflows/` call, and
reports one that no dependency provides; `yq`, which comes from mise, is
ignored.

## Code Style

- **Biome** formats **TypeScript/TSX, JS, JSON, CSS, HTML, SVG**: double quotes, semicolons, trailing commas, 2-space indent, 120 char line width — use `pnpm biome:fix`
- **Trunk** formats **Markdown, YAML, SCSS** (with Prettier), and other formats not covered by biome — use `pnpm trunk:fix`
- Import order (enforced by biome organizeImports): built-in modules → `@freelensapp/**` → packages → relative paths
- React 19 (`@types/react` 19: no global `JSX` namespace, use `React.JSX.Element`; components get `children` only when their props declare it)
- **No emoji** in Markdown files (`.md`), comments, or any source code

## Security

Never read, display, reference, or include the contents of the following files in any response or context, even if they are open in the editor:

- `.env`
- `.env.*`
- `.envrc`
- `.npmrc`
- `*.jks`
- `*.keystore`
- `*.p12`
- `*.pfx`
- `*.pem`
- `*.key`

The same list is git-ignored in `.gitignore` and enforced for Claude Code by
the `permissions.deny` rules in `.claude/settings.json`, which block reading
and editing these files. Change all three together. The rules are native
permissions rather than a hook on purpose: a hook runs a process in the
working tree, which may be an untrusted pull request, and an interpreter such
as `python3 -c` imports modules from that tree before the hook's own code.

## Electron Multi-Process

Extensions run in the same multi-process model as the Freelens host:

- **Main process** (`src/main/`) — Node.js environment, extension lifecycle, cluster connectivity
- **Renderer process** (`src/renderer/`) — Chromium browser, UI components

Code in `src/common/` is shared between both processes.

## Troubleshooting

### Changes Not Appearing

1. Check that files are not in ignored output directories (`dist/`, `node_modules/`)
2. Full clean and rebuild: `pnpm clean:all && pnpm install && pnpm build`
3. Reinstall the extension in Freelens (or restart the app in dev mode)

### Build Failures

1. Check for TypeScript errors: `pnpm type:check`
2. Check for linting errors: `pnpm lint:check`
3. Verify dependencies: `pnpm install`
4. Check Node.js version matches the `engines` field in `package.json`

### Runtime Errors

1. Open Freelens DevTools and check the Console tab for renderer errors
2. Check the terminal where Freelens was launched for main process errors
3. Look for stack traces with file:line numbers
4. Verify all CRD objects have proper `static readonly` properties (kind, apiBase, crd)
5. Validate both with `pnpm type:check` **and** `pnpm build` — runtime failures can appear only in the bundled `dist/` code

## Best Practices

1. **Use semantic search** to find examples and patterns in the codebase
2. **Follow existing patterns** — grep for similar implementations before creating new ones
3. **Test changes** before committing
4. **Run validation before committing:** `pnpm lint:fix && pnpm type:check && pnpm test:unit`
5. **For TypeScript/TSX, JS, JSON, CSS, HTML, SVG files:** run `pnpm biome:fix` (or `biome check` directly if `biome` is installed locally)
6. **For Markdown, YAML, SCSS and other formats:** run `pnpm trunk:fix` (or `trunk check` directly if `trunk` is installed locally)
7. **Full build** when in doubt about cached state: `pnpm clean:all && pnpm install && pnpm build`
8. **Do not use Anthropic Fable for coding tasks** — Fable may be used only for planning,
   analysis, and thinking through problems. When writing or editing code,
   use standard editing tools instead.

## GitHub Actions (Claude Code Action) Rules

This project has a Claude Code workflow (`.github/workflows/claude.yaml`) triggered
via `@claude` comments on issues, PR comments, and reviews. When operating via that
workflow, follow these rules:

### Code Review

When reviewing code and proposing fixes:

1. **Show the diff first** — present every proposed change as a unified diff
   block using the `diff` language tag:

   ```diff
   --- a/path/to/file.ts
   +++ b/path/to/file.ts
   @@ -10,7 +10,7 @@
    const oldLine = "before";
   -const changedLine = "after";
   +const changedLine = "the fix";
    const unchangedLine = "same";
   ```

   You can generate this from the terminal with:
   ```bash
   git diff -u -- path/to/file
   ```

   If the change spans multiple files, group them under a single commit
   subject and show each file's diff sequentially.

2. **Propose a commit subject first** — before any code change, output a
   single line with the proposed commit subject:

   ```text
   **Proposed commit:** <short description>
   ```

   Do **not** use Conventional Commits prefixes (e.g. `fix:`, `feat:`,
   `chore:`, `refactor:`, `docs:`, `test:`, `ci:`). This project prefers
   plain, descriptive commit messages and PR titles without any prefix.

   Wait for the user to confirm (or adjust) the subject before applying the
   change.

3. **Comment style:**
   - Keep review comments concise and actionable
   - Reference specific lines (file + line number) when pointing out issues
   - Offer a concrete fix suggestion rather than just flagging a problem
   - Do **not** use emoji in any Markdown, comments, commit messages, or
     PR descriptions. The only exception is emoji that already appears
     inside code strings (e.g. application logs, user-facing messages).
   - Use GitHub's `suggestion` block for small targeted fixes so the PR
     author can accept the change with a single click:

     ````suggestion
     <same unified-diff format as shown above>
     ````

   - For larger multi-file changes, use `diff -u` blocks in a regular
     comment instead, with the proposed commit subject shown first

### Making Changes to a PR

When asked to implement a change on a PR:

1. Propose the commit subject (as above)
2. Describe what will change and why
3. After confirmation, apply the changes with commits on the PR branch
4. **One commit per fix** — when a review surfaces more than one issue or
   the plan includes more than one fix, apply and commit each fix
   separately. Do not batch multiple independent fixes into a single
   commit. This keeps the history bisectable and makes each change easy
   to revert individually.

### Branch Naming Conventions

When creating a branch from an issue, use a human-readable name that includes
the issue number and a short slug derived from the issue title:

```text
claude/issue-<number>-<short-slug>
```

- `<number>` is the GitHub issue number
- `<short-slug>` is a kebab-case summary of the issue title, kept short
  (3–6 words maximum, omit articles and filler words)

Do **not** use auto-generated timestamp suffixes (e.g.
`claude/issue-1957-20260612-2108`) — these are not human-readable and make
branch lists hard to scan.

### Fork PRs: Review Only

A PR from a fork (different owner than `freelensapp`) gets a review and
nothing else: no commits, no pushes, no branches. Its code is untrusted, and
the head of a fork PR can change between the moment a maintainer looks at it
and the moment the workflow checks it out, so nothing taken from the checkout
may reach `freelensapp/freelens-gateway-api-extension`.

When a fork PR needs changes, a maintainer first copies the exact commit they
reviewed to a branch in this repository. From then on it is a
same-repository PR, which gets the full setup and the normal workflow. The
copy is made either locally (`gh pr checkout <N>`, then push the branch) or
by the Claude Task workflow, following "Copying a Fork PR" below.

### Copying a Fork PR

This applies to a Claude Task run whose prompt asks to copy a fork PR and
names the PR number and the full commit SHA to copy. It is a git-only task:
do not check out, read, build or run any of the PR's files, and do not
describe its changes, because they are untrusted input.

1. `git fetch origin refs/pull/<N>/head`.
2. Verify that `FETCH_HEAD` equals the given SHA. If it does not, or no full
   SHA was given, stop and report the actual head without pushing anything.
3. `git push origin <sha>:refs/heads/claude/pr-<N>`.
4. Open a PR from `claude/pr-<N>` to `main`. It MUST use the **exact same
   title** as the original PR, copied verbatim with no prefix, and its body
   is `Copy of #<N> at <sha>.` followed by the usual footer.
5. Comment on the original PR with a link to the new one.
