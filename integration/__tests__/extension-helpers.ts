/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// The code the integration test sessions share. The sessions attach to
// Freelens started with `pnpm dev` from a freelensapp/freelens checkout, over
// the Chrome DevTools Protocol port that script opens, and drive its renderer
// with Playwright. Its name does not match `*.tests.ts`, so Vitest does not
// collect it as a test file.

import { spawnSync } from "node:child_process";
import * as fs from "node:fs";
import * as path from "node:path";
import { chromium } from "playwright";

import type { Browser, ConsoleMessage, Frame, Locator, Page } from "playwright";

export const extensionName = "@freelensapp/gateway-api-extension";

// The root of this checkout, installed in place and read for the manifests.
const extensionDir = path.resolve(import.meta.dirname, "..", "..");

// The fixtures, one directory per cluster session: the Gateway API CRDs of one
// release in `crds`, and the test objects in `objects`.
const fixturesDir = path.join(extensionDir, "integration", "fixtures");

// The CDP endpoint of Freelens dev: `pnpm dev` of Freelens starts Electron
// with `--remoteDebuggingPort 9223`.
const cdpUrl = process.env.FREELENS_CDP_URL || "http://127.0.0.1:9223";

// The log of the main process, which CDP does not carry: the output of
// `pnpm dev` of Freelens, or its `lens.log`. Without it only the renderer's
// errors are checked.
const mainLogFile = process.env.FREELENS_MAIN_LOG;

// The kind cluster the sessions run against.
export const kindClusterName = process.env.TEST_KIND_CLUSTER_NAME || "kind";

// The namespace of the test objects, created by the fixtures.
const testNamespace = "integration-tests";

// The name of every test object. It starts with `integration-tests`, as the
// cluster-scoped objects must, so that the setup finds what an earlier run
// left.
const testObjectName = "integration-tests-object";

// The API groups of the Gateway API CRDs, whichever release installed them.
const gatewayApiGroups = ["gateway.networking.k8s.io", "gateway.networking.x-k8s.io"];

// The cluster-scoped resources of the fixtures, whose test objects are not
// deleted with the namespace.
const clusterScopedTestResources = ["gatewayclasses.gateway.networking.k8s.io", "xmeshes.gateway.networking.x-k8s.io"];

// The ValidatingAdmissionPolicy that the experimental channel installs since
// v1.5, and its binding, both with this name. It refuses to create a CRD of a
// release before v1.5 and to downgrade one, so it goes before the CRDs of
// another session are applied.
const safeUpgradesPolicyName = "safe-upgrades.gateway.networking.k8s.io";

// The package name with `@` dropped and `/` turned into `--`
// (`sanitizeExtensionName` in Freelens's `lens-extension.ts`).
const sanitizedExtensionId = extensionName.replace("@", "").replace("/", "--");

// The page that selects the namespace of the test objects: any list page of a
// namespaced kind renders the namespace filter. HTTPRoute is served by every
// release the sessions install.
const namespacePageId = "httproute";

/**
 * The views of a kind: the title of its page, which is also the title of its
 * Overview chart and of the page shown when the cluster serves none of its
 * versions, and a text that only the extension's details panel of the kind
 * renders. The keys are the page ids, the `id` of each `clusterPages`
 * registration in `src/renderer/index.tsx`.
 */
export const kindViews = {
  gatewayclass: { title: "Gateway Classes", detailsText: "Controller Name" },
  gateway: { title: "Gateways", detailsText: "Gateway Class" },
  httproute: { title: "HTTP Routes", detailsText: "Parent References" },
  grpcroute: { title: "gRPC Routes", detailsText: "Parent References" },
  tcproute: { title: "TCP Routes", detailsText: "Parent References" },
  tlsroute: { title: "TLS Routes", detailsText: "Parent References" },
  udproute: { title: "UDP Routes", detailsText: "Parent References" },
  referencegrant: { title: "Reference Grants", detailsText: "From" },
  listenerset: { title: "Listener Sets", detailsText: "Parent Reference" },
  backendtlspolicy: { title: "Backend TLS Policies", detailsText: "Target Refs" },
  xbackendtrafficpolicy: { title: "Backend Traffic Policies", detailsText: "Target Refs" },
  xbackend: { title: "Backends", detailsText: "Protocol" },
  xmesh: { title: "Meshes", detailsText: "Controller Name" },
} satisfies Record<string, { title: string; detailsText: string }>;

export type PageId = keyof typeof kindViews;

const viewTimeout = { timeout: 60 * 1000 };

const ansiEscapePattern = /\u001b\[[0-9;]*m/g;

// The Kubernetes proxy of Freelens logs a request that the renderer aborts as
// an error. Freelens dev renders in React.StrictMode, which mounts every view
// twice and aborts the requests of the first mount, so the line comes and goes
// with the timing of a run, also before any view of the extension has opened.
// It names no request, and says nothing about the extension.
const abortedProxyRequestPattern = /proxy_server\.go:\d+\] Error while proxying request: context canceled$/;

/**
 * A connection to Freelens dev, with the errors that either process logs.
 */
export interface AppSession {
  browser: Browser;
  /** The root frame's page, where the catalog, the extensions and the preferences render. */
  window: Page;
  /** The errors logged so far. */
  errors(): string[];
  /** Stops collecting errors; returns every error logged until then. */
  stopCollecting(): Promise<string[]>;
  /** Stops collecting errors, unless stopped already, and closes the connection; returns every error collected. */
  close(): Promise<string[]>;
}

/**
 * Whether Freelens dev answers on its CDP endpoint and the kind cluster is
 * reachable. Outside CI a session skips with a warning otherwise; in CI the
 * run fails, so that a mistake in the workflow does not turn into a silent
 * skip.
 */
export async function appReady({ cluster }: { cluster: boolean }): Promise<boolean> {
  let reason: string | undefined;

  try {
    const response = await fetch(new URL("/json/version", cdpUrl), { signal: AbortSignal.timeout(5000) });

    if (!response.ok) {
      reason = `${cdpUrl} answered ${response.status}`;
    }
  } catch (error) {
    reason = `Freelens dev does not answer on ${cdpUrl}: ${error instanceof Error ? error.message : error}`;
  }

  if (!reason && cluster) {
    if (spawnSync("kubectl", ["--context", `kind-${kindClusterName}`, "get", "--raw", "/readyz"]).status !== 0) {
      reason = `the kind cluster ${kindClusterName} is not reachable`;
    }
  }

  if (!reason) {
    return true;
  }

  if (process.env.CI) {
    throw new Error(`Cannot run the integration tests: ${reason}`);
  }

  console.warn(`Skipping the integration tests: ${reason}`);

  return false;
}

/**
 * Describes the arguments of a console message, read in the page: an `Error`
 * by its stack, an `ErrorEvent` by its message, location and error, another
 * `Event` by its type and target, anything else as JSON.
 */
async function describeConsoleArgs(msg: ConsoleMessage): Promise<string> {
  const descriptions = await Promise.all(
    msg.args().map((arg) =>
      arg
        .evaluate((value) => {
          if (value instanceof Error) {
            return value.stack ?? `${value.name}: ${value.message}`;
          }

          if (value instanceof ErrorEvent) {
            const stack = value.error instanceof Error ? ` ${value.error.stack}` : "";

            return `${value.type} event: ${value.message} (${value.filename}:${value.lineno}:${value.colno})${stack}`;
          }

          if (value instanceof Event) {
            return `${value.type} event of ${value.target?.constructor.name ?? "no target"}`;
          }

          try {
            return JSON.stringify(value) ?? String(value);
          } catch {
            return String(value);
          }
        })
        .catch((error) => `<argument not readable: ${error instanceof Error ? error.message : error}>`),
    ),
  );

  // A message of the browser itself, such as a resource or a worker that
  // failed to load, has no arguments; its time ties it to the main log.
  return descriptions.length
    ? descriptions.join(" ")
    : `<empty message without arguments, at ${new Date(msg.timestamp()).toISOString()}>`;
}

/**
 * Collects the errors of the renderer's console, of every frame, and the
 * lines of the main log written after the session started.
 */
function collectErrors(window: Page) {
  const errorLogs: string[] = [];
  const pendingDescriptions: Promise<void>[] = [];
  let mainLogOffset = mainLogFile && fs.existsSync(mainLogFile) ? fs.statSync(mainLogFile).size : 0;

  // Chromium logs every response that is not a success as "Failed to load
  // resource", whose text has no URL, so the location of the message is added.
  // The text of a message is the preview of its arguments: the class name of
  // an object, such as `ErrorEvent`, or nothing at all. Such a message is
  // described from its arguments, read from the page after the event, and
  // `settle()` waits for that. A message of a worker names the worker.
  const onConsole = (msg: ConsoleMessage) => {
    if (msg.type() === "error") {
      const { url, lineNumber, columnNumber } = msg.location();
      const worker = msg.worker();
      const location = `${url ? ` (${url}:${lineNumber}:${columnNumber})` : ""}${worker ? ` (worker ${worker.url()})` : ""}`;
      const text = msg.text().replaceAll(ansiEscapePattern, "");
      const index = errorLogs.push(`[renderer] ${text}${location}`) - 1;

      if (!text.trim() || /^[A-Z]\w*$/.test(text)) {
        pendingDescriptions.push(
          describeConsoleArgs(msg).then((description) => {
            errorLogs[index] = `[renderer] ${description}${location}`;
          }),
        );
      }
    }
  };

  const onPageError = (error: Error) => {
    errorLogs.push(`[renderer] ${error.stack ?? error.message}`);
  };

  // A line of the main log starts with its level, in the file and on the
  // console alike, after the task prefix that turbo adds to the output of
  // `pnpm dev` when it streams it (`freelens:dev: `).
  const readMainLog = () => {
    if (!mainLogFile || !fs.existsSync(mainLogFile)) {
      return;
    }

    const size = fs.statSync(mainLogFile).size;

    // A rotated log starts again from the beginning.
    if (size < mainLogOffset) {
      mainLogOffset = 0;
    }

    if (size === mainLogOffset) {
      return;
    }

    const fd = fs.openSync(mainLogFile, "r");

    try {
      const buffer = Buffer.alloc(size - mainLogOffset);

      fs.readSync(fd, buffer, 0, buffer.length, mainLogOffset);
      mainLogOffset = size;

      for (const line of buffer.toString("utf8").split("\n")) {
        const text = line.replaceAll(ansiEscapePattern, "");

        if (/^(?:[\w@/.-]+:[\w:-]+: )?\s*error:/.test(text) && !abortedProxyRequestPattern.test(text.trim())) {
          errorLogs.push(`[main] ${text.trim()}`);
        }
      }
    } finally {
      fs.closeSync(fd);
    }
  };

  window.on("console", onConsole);
  window.on("pageerror", onPageError);

  return {
    errors: () => {
      readMainLog();

      return [...errorLogs];
    },
    settle: async () => {
      await Promise.all(pendingDescriptions);
    },
    stop: () => {
      window.off("console", onConsole);
      window.off("pageerror", onPageError);
    },
  };
}

/**
 * Connects to Freelens dev and collects the errors either process logs until
 * the session stops collecting or is closed. Closing a browser connected over
 * CDP closes only the connection; the app keeps running.
 */
export async function connectApp(): Promise<AppSession> {
  const browser = await chromium.connectOverCDP(cdpUrl);

  try {
    const window = await rootPage(browser);
    const collector = collectErrors(window);
    let collected: Promise<string[]> | undefined;

    const stopCollecting = () => {
      collected ??= (async () => {
        await collector.settle();

        const errors = collector.errors();

        collector.stop();

        return errors;
      })();

      return collected;
    };

    return {
      browser,
      window,
      errors: collector.errors,
      stopCollecting,
      close: async () => {
        const errors = await stopCollecting();

        await browser.close();

        return errors;
      },
    };
  } catch (error) {
    await browser.close();
    throw error;
  }
}

/**
 * The page of the root frame: `https://renderer.freelens.app`, on the port of
 * the app's proxy. A cluster renders in an iframe of it, on
 * `<clusterId>.renderer.freelens.app`.
 */
async function rootPage(browser: Browser): Promise<Page> {
  const deadline = Date.now() + viewTimeout.timeout;

  while (Date.now() < deadline) {
    const page = browser
      .contexts()
      .flatMap((context) => context.pages())
      .find((page) => URL.canParse(page.url()) && new URL(page.url()).hostname === "renderer.freelens.app");

    if (page) {
      await page.waitForFunction(() => globalThis.FreelensExtensionApi?.Renderer !== undefined, null, viewTimeout);

      return page;
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  throw new Error(`No Freelens window on ${cdpUrl}`);
}

/**
 * Navigates the root frame with `Renderer.Navigation.navigate` of the
 * extension API: the application menu, which the packaged-app tests click,
 * belongs to the main process, which CDP does not reach.
 */
async function navigate(window: Page, url: string) {
  console.log(`navigate to ${url}`);
  await window.evaluate((url) => {
    const renderer = globalThis.FreelensExtensionApi.Renderer;

    if (!renderer) {
      throw new Error("The page has no Renderer API");
    }

    renderer.Navigation.navigate(url);
  }, url);
}

/**
 * Dismisses the notifications, so that one still in its enter animation does
 * not intercept pointer events on the elements behind it.
 */
async function dismissNotifications(window: Page) {
  const notificationCloseSelector =
    'i[data-testid*="close-notification-for-notification_"], div[class*="close-button-module__closeButton--"][aria-label="Close"]';

  for (let attempt = 0; attempt < 10; attempt++) {
    const closeButtons = await window.$$(notificationCloseSelector);

    if (closeButtons.length === 0) break;

    for (const closeButton of closeButtons) {
      await closeButton.click({ force: true }).catch(() => {});
    }

    await window.waitForTimeout(200);
  }
}

/**
 * Uninstalls the extension from the Extensions page, from wherever it was
 * installed. An extension installed in place is forgotten, its directory
 * stays.
 */
async function uninstallExtension(window: Page, row: Locator) {
  console.log(`uninstall ${extensionName}`);
  await row.locator('[id^="menu-actions-for-installed-extensions-for-"]').click();
  await window.locator(".MenuActions .MenuItem").getByText("Uninstall", { exact: true }).click();
  await window.getByTestId("confirmation-dialog").getByTestId("confirm").click();
  await row.waitFor({ state: "detached", ...viewTimeout });
}

/**
 * Installs this checkout in place from the Extensions page and waits until it
 * is enabled. An installation of the checkout that is already enabled is
 * kept, unless `reinstall` is set; any other installation of the extension is
 * uninstalled first.
 */
export async function installExtension({ window }: AppSession, { reinstall = false } = {}) {
  await navigate(window, "/extensions");

  const table = window.getByTestId("extensions-table");
  const row = table.locator("tbody tr", { hasText: extensionName });
  const enabled = row.locator("td").nth(2).getByText("Enabled", { exact: true });

  // Once the extensions are discovered, the page shows the table, or a notice
  // in its place when no extension is installed, as in a fresh profile.
  await table.or(window.getByText("There are no extensions installed.", { exact: true })).waitFor(viewTimeout);

  if (await row.count()) {
    const inPlace = await row.locator(`[title="Loaded in place from ${extensionDir}"]`).count();

    if (!reinstall && inPlace && (await enabled.count())) {
      console.log(`${extensionName} is installed from ${extensionDir}`);

      return;
    }

    await uninstallExtension(window, row);
  }

  console.log(`install ${extensionDir}`);
  await window.getByPlaceholder("Name, URL, or path to a package or directory").fill(extensionDir);
  await window.getByRole("button", { name: "Install", exact: true }).click();

  // A directory is loaded in place only after a confirmation.
  await window.getByTestId("confirmation-dialog").getByTestId("confirm").click(viewTimeout);

  // The status column reads "Incompatible" if the host refuses
  // `engines.freelens`.
  await enabled.waitFor(viewTimeout);
  await dismissNotifications(window);
}

/**
 * The catalog id of the kind cluster, looked up by its name.
 */
async function kindClusterId(window: Page): Promise<string> {
  const id = await window.waitForFunction(
    (name) =>
      globalThis.FreelensExtensionApi.Renderer?.Catalog.catalogEntities
        .getItemsForApiKind("entity.k8slens.dev/v1alpha1", "KubernetesCluster")
        .find((entity) => entity.getName() === name)
        ?.getId(),
    `kind-${kindClusterName}`,
    viewTimeout,
  );

  return id.jsonValue() as Promise<string>;
}

/**
 * The phase of the kind cluster in the catalog: `connected`, `connecting`,
 * `disconnected`.
 */
async function kindClusterPhase(window: Page, id: string): Promise<string | undefined> {
  return window.evaluate(
    (id) => globalThis.FreelensExtensionApi.Renderer?.Catalog.catalogEntities.getById(id)?.status.phase,
    id,
  );
}

/**
 * Disconnects the kind cluster if it is connected, and waits until it is
 * disconnected. The app reads which versions of a CRD are served when it
 * connects, so a session that changes the CRDs starts and ends with a
 * disconnected cluster. Only the kind cluster is touched; the app may have
 * others.
 */
export async function disconnectKindCluster({ window }: AppSession) {
  const id = await kindClusterId(window);

  if ((await kindClusterPhase(window, id)) === "disconnected") {
    return;
  }

  console.log(`disconnect kind-${kindClusterName}`);
  await navigate(window, "/catalog");
  await window.evaluate(async (id) => {
    const entity = globalThis.FreelensExtensionApi.Renderer?.Catalog.catalogEntities.getById(id);

    if (!entity || !("disconnect" in entity) || typeof entity.disconnect !== "function") {
      throw new Error(`The catalog has no cluster ${id}`);
    }

    await entity.disconnect();
  }, id);
  await window.waitForFunction(
    (id) =>
      globalThis.FreelensExtensionApi.Renderer?.Catalog.catalogEntities.getById(id)?.status.phase === "disconnected",
    id,
    viewTimeout,
  );
}

/**
 * Connects the kind cluster, selects the namespace of the test objects, and
 * returns the cluster's frame, where the extension's pages, details and menus
 * render.
 */
export async function openKindCluster({ window }: AppSession): Promise<Frame> {
  const id = await kindClusterId(window);

  await navigate(window, `/cluster/${id}`);

  const element = await window.waitForSelector(`#cluster-frame-${id}`, viewTimeout);
  const frame = await element.contentFrame();

  if (!frame) {
    throw new Error(`No iframe for kind-${kindClusterName}`);
  }

  await frame.waitForSelector("[data-testid=cluster-sidebar]", viewTimeout);
  await selectTestNamespace(frame);

  return frame;
}

/**
 * Opens a page of the extension in the cluster frame, by its page id, the `id`
 * of its `clusterPages` registration. The sidebar entries of the kinds are
 * nested under a group that the sidebar renders collapsed, so the frame is
 * navigated with `Renderer.Navigation.navigate` of the extension API instead.
 */
export async function openPage(frame: Frame, pageId: PageId | "overview") {
  const url = `/extension/${sanitizedExtensionId}/${pageId}`;

  console.log(`navigate the cluster frame to ${url}`);
  await frame.evaluate((url) => {
    const renderer = globalThis.FreelensExtensionApi.Renderer;

    if (!renderer) {
      throw new Error("The cluster frame has no Renderer API");
    }

    renderer.Navigation.navigate(url);
  }, url);
}

/**
 * Selects the namespace of the test objects in the namespace filter of a page
 * of the extension, which its `KubeObjectListLayout` renders for a namespaced
 * resource. The selection holds for every namespaced list of the cluster, and
 * the app keeps it, so it is made only when the filter shows another one. The
 * session opens no page of the host, whose requests can log errors of their
 * own: the Pods page asks for pod metrics, and kind has no metrics server.
 */
async function selectTestNamespace(frame: Frame) {
  await openPage(frame, namespacePageId);

  const label = frame.locator(".NamespaceSelect").getByText(`Namespace: ${testNamespace}`, { exact: true });
  const namespaceSelect = await frame.waitForSelector(".NamespaceSelect", viewTimeout);

  if (await label.count()) {
    return;
  }

  console.log(`select namespace ${testNamespace}`);
  await namespaceSelect.click();
  await namespaceSelect.type(testNamespace);
  await namespaceSelect.press("Enter");
  await namespaceSelect.click();
  await label.waitFor(viewTimeout);
}

/**
 * Runs kubectl against the kind cluster, never the current context, and fails
 * with its stderr when it exits non-zero.
 */
function kubectl(...args: string[]): string {
  const argv = ["--context", `kind-${kindClusterName}`, ...args];
  const command = `kubectl ${argv.join(" ")}`;

  console.log(command);

  const { error, status, signal, stdout, stderr } = spawnSync("kubectl", argv, {
    encoding: "utf8",
    timeout: 5 * 60 * 1000,
  });

  if (error) {
    throw new Error(`${command} failed: ${error.message}`);
  }

  if (status !== 0) {
    throw new Error(`${command} exited with ${status ?? signal}: ${stderr.trim()}`);
  }

  if (stdout.trim()) {
    console.log(stdout.trim());
  }

  return stdout;
}

/**
 * The lines of kubectl's output, without the empty ones.
 */
function lines(output: string): string[] {
  return output
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

/**
 * The Gateway API CRDs on the cluster, as `customresourcedefinition.apiextensions.k8s.io/<name>`.
 */
function gatewayApiCrds(): string[] {
  return lines(kubectl("get", "customresourcedefinitions", "--output=name")).filter((crd) =>
    gatewayApiGroups.some((group) => crd.endsWith(`.${group}`)),
  );
}

/**
 * Removes what an earlier session or run left, whichever release it came
 * from: the test namespace, the cluster-scoped test objects, the
 * `safe-upgrades` policy and its binding, and every Gateway API CRD, with every
 * object of their kinds. Each deletion waits until the object is gone.
 */
function removeGatewayApi() {
  kubectl("delete", "namespace", testNamespace, "--ignore-not-found", "--wait");

  const crds = gatewayApiCrds();

  for (const resource of clusterScopedTestResources) {
    if (!crds.includes(`customresourcedefinition.apiextensions.k8s.io/${resource}`)) {
      continue;
    }

    const testObjects = lines(kubectl("get", resource, "--output=name")).filter((object) =>
      object.split("/")[1]?.startsWith(testNamespace),
    );

    if (testObjects.length > 0) {
      kubectl("delete", ...testObjects, "--ignore-not-found", "--wait");
    }
  }

  kubectl("delete", "validatingadmissionpolicybinding", safeUpgradesPolicyName, "--ignore-not-found", "--wait");
  kubectl("delete", "validatingadmissionpolicy", safeUpgradesPolicyName, "--ignore-not-found", "--wait");

  if (crds.length > 0) {
    kubectl("delete", ...crds, "--ignore-not-found", "--wait");
  }
}

/**
 * Waits until every resource of the CRDs can be listed. A CRD is Established
 * before the API server has initialized the storage of its resource, and until
 * then a list answers 429, which the renderer logs as an error. The Overview
 * lists every kind, also the ones without a test object, as soon as the
 * cluster is connected.
 */
function waitForCrdStorage(crds: string[]) {
  const resources = crds.map((crd) => crd.split("/")[1]).join(",");
  const argv = ["--context", `kind-${kindClusterName}`, "get", resources, "--all-namespaces", "--output=name"];
  const deadline = Date.now() + 120 * 1000;

  console.log(`kubectl ${argv.join(" ")}, until it succeeds`);

  while (spawnSync("kubectl", argv, { encoding: "utf8", timeout: 30 * 1000 }).status !== 0) {
    if (Date.now() > deadline) {
      throw new Error(`The resources of the CRDs cannot be listed: ${resources}`);
    }

    spawnSync("sleep", ["1"]);
  }
}

/**
 * Removes what an earlier session or run left, then applies the CRDs of the
 * session and, once they are established and serve their resources, its test
 * objects.
 */
export function setUpCluster(session: string) {
  removeGatewayApi();

  kubectl("apply", "--server-side", "-k", path.join(fixturesDir, session, "crds"));

  const crds = gatewayApiCrds();

  kubectl("wait", "--for=condition=Established", ...crds, "--timeout=120s");
  waitForCrdStorage(crds);
  kubectl("apply", "--server-side", "-k", path.join(fixturesDir, session, "objects"));
}

/**
 * Deletes the test objects and the CRDs of the session, with the
 * `safe-upgrades` policy and its binding where the release has them.
 */
export function tearDownCluster(session: string) {
  try {
    kubectl("delete", "-k", path.join(fixturesDir, session, "objects"), "--ignore-not-found", "--wait");
  } finally {
    kubectl("delete", "-k", path.join(fixturesDir, session, "crds"), "--ignore-not-found", "--wait");
  }
}

/**
 * Closes the details drawer if it is open: a click on a row toggles it.
 */
async function closeDetails(frame: Frame) {
  const details = frame.locator(".KubeObjectDetails");

  if (await details.isVisible()) {
    await frame.locator("body").press("Escape");
    await details.waitFor({ state: "hidden", ...viewTimeout });
  }
}

/**
 * Throws when the extension's error boundary rendered its error page inside
 * the locator.
 */
async function expectNoErrorPage(locator: Locator, where: string) {
  // The class of `ErrorPage`, as CSS modules name it in the bundle.
  const errorPages = await locator.locator('[class*="_errorPage_"]').count();

  if (errorPages > 0) {
    throw new Error(`${where} shows ${errorPages} error page(s) of the extension`);
  }
}

/**
 * Opens the Overview page of the extension and waits for the chart of each
 * kind, titled with the kind and the number of its objects, such as
 * `Gateways (1)`, after checking that the page rendered no error page. A kind
 * shown twice, once per served version, would match twice and fail the wait.
 */
export async function openOverview(frame: Frame, pageIds: PageId[]) {
  await openPage(frame, "overview");
  await closeDetails(frame);

  for (const pageId of pageIds) {
    await frame.getByText(`${kindViews[pageId].title} (1)`, { exact: true }).waitFor(viewTimeout);
  }

  await expectNoErrorPage(frame.locator("main"), "The Overview");
}

/**
 * Opens a list page of the extension and returns the table row of the test
 * object.
 */
export async function openListPage(frame: Frame, pageId: PageId): Promise<Locator> {
  await openPage(frame, pageId);
  await closeDetails(frame);

  const row = frame
    .locator(".TableRow")
    .filter({ has: frame.locator(".TableCell").getByText(testObjectName, { exact: true }) });

  await row.waitFor(viewTimeout);
  await expectNoErrorPage(frame.locator("main"), `The ${kindViews[pageId].title} page`);

  return row;
}

/**
 * Waits until the URL of the frame names the details of the test object
 * (`kube-details=/apis/<group>/<version>/...`), and returns that API version.
 */
async function waitForDetailsApiVersion(frame: Frame): Promise<string> {
  const deadline = Date.now() + viewTimeout.timeout;

  for (;;) {
    const selfLink = new URL(frame.url()).searchParams.get("kube-details") ?? "";
    const match = /^\/apis\/([^/]+)\/([^/]+)\/.*\/([^/]+)$/.exec(selfLink);

    if (match?.[3] === testObjectName) {
      return `${match[1]}/${match[2]}`;
    }

    if (Date.now() > deadline) {
      throw new Error(`The URL names no details of ${testObjectName}: ${frame.url()}`);
    }

    await frame.waitForTimeout(250);
  }
}

/**
 * Opens the details of the row's object, waits for the text that only the
 * extension's details panel of the kind renders, checks that the extension's
 * error boundary rendered no error page in the drawer, and returns the API
 * version that the details URL names: the version the page chose.
 */
export async function openDetails(frame: Frame, pageId: PageId, row: Locator): Promise<string> {
  // The name is the first cell after the checkbox; a reference in another
  // column can have the same name.
  await row.locator(".TableCell:not(.checkbox)").first().getByText(testObjectName, { exact: true }).click();

  const apiVersion = await waitForDetailsApiVersion(frame);
  const details = frame.locator(".KubeObjectDetails");

  await details.getByText(kindViews[pageId].detailsText, { exact: true }).first().waitFor(viewTimeout);
  await expectNoErrorPage(details, `The details drawer of the ${kindViews[pageId].title} object`);

  return apiVersion;
}

/**
 * Opens the page of a kind that the cluster does not serve in any version the
 * extension models, and waits for the page that says so.
 */
export async function openUnavailablePage(frame: Frame, pageId: PageId) {
  await openPage(frame, pageId);
  await closeDetails(frame);
  await frame.getByText(`${kindViews[pageId].title} Not Available`, { exact: true }).waitFor(viewTimeout);
}
