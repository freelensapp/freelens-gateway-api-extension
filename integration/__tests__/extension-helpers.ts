/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// The code the integration test sessions share. Copied with them into
// `freelens/integration/__tests__/` by the integration tests workflow, and
// imports the helpers found there. Its name does not match `*.tests.ts`, so
// Freelens's Vitest does not collect it as a test file.

import { spawnSync } from "node:child_process";
import * as path from "node:path";
import { kindReady } from "../helpers/kind";
import * as utils from "../helpers/utils";

import type { ConsoleMessage, ElectronApplication, Frame, Locator, Page } from "playwright";

export const extensionName = "@freelensapp/gateway-api-extension";

// The kind cluster the sessions run against, as in Freelens's cluster tests.
export const kindClusterName = process.env.TEST_KIND_CLUSTER_NAME || "kind";

// The namespace of the test objects, created by the fixtures.
const testNamespace = "integration-tests";

// The name of every test object. It differs from the namespace, which the
// namespace column of a list shows as a link in the same row, and starts with
// `integration-tests`, as the cluster-scoped objects must.
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

// The link inside the sidebar item of one of the extension's
// `clusterPageMenus`: the menu id, after the sanitized package name. Only the
// link navigates.
const sidebarLinkTestId = (menuId: string) => `link-for-sidebar-item-${sanitizedExtensionId}-${menuId}`;

// The "Gateway API" entry, the parent of every other menu of the extension. A
// click on it expands or collapses its items.
const menuLinkTestId = sidebarLinkTestId("gateway-api");

const viewTimeout = { timeout: 60 * 1000 };

/**
 * The views of a kind: the title of its page, which is also the title of its
 * Overview chart and of the page shown when the cluster serves none of its
 * versions, and a text that only the extension's details panel of the kind
 * renders. The keys are the page ids, which `src/renderer/index.tsx` also uses
 * as the ids of the menu items.
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

/**
 * An app started by `startApp`, with the errors that either process logs.
 */
export interface AppSession {
  app: ElectronApplication;
  window: Page;
  /** The errors logged so far. */
  errors(): string[];
  /** Closes the app and stops collecting errors; returns every error logged. */
  close(): Promise<string[]>;
}

/**
 * Collects the errors of the renderer's console and of the output of the test
 * process, which carries the output of the app.
 */
function collectErrors() {
  const errorLogs: string[] = [];
  const processErrorLogs: string[] = [];
  const outputErrorPattern = /\[out\]\s*error:/i;
  const ansiEscapePattern = /\u001b\[[0-9;]*m/g;
  let processOutputBuffer = "";

  const collectOutputErrors = (chunk: string | Uint8Array) => {
    const text = typeof chunk === "string" ? chunk : Buffer.from(chunk).toString("utf8");
    processOutputBuffer += text;

    // Keep buffer bounded while preserving enough tail to match split patterns across chunks.
    if (processOutputBuffer.length > 200_000) {
      processOutputBuffer = processOutputBuffer.slice(-20_000);
    }

    const normalizedOutput = processOutputBuffer.replaceAll(ansiEscapePattern, "");

    if (outputErrorPattern.test(normalizedOutput)) {
      processErrorLogs.push(normalizedOutput.trim());
      processOutputBuffer = "";
    }
  };

  const logger = (msg: ConsoleMessage) => {
    const text = msg.text();
    const normalizedText = text.replaceAll(ansiEscapePattern, "");

    console.log(text);

    // Some app logs are emitted as "log" messages, so inspect both console type and message content.
    if (msg.type() === "error" || outputErrorPattern.test(normalizedText)) {
      errorLogs.push(`[${msg.type()}] ${normalizedText}`);
    }
  };

  const originalStdoutWrite = process.stdout.write.bind(process.stdout);
  const originalStderrWrite = process.stderr.write.bind(process.stderr);

  process.stdout.write = ((chunk, encoding, cb) => {
    collectOutputErrors(chunk);

    return originalStdoutWrite(chunk, encoding as never, cb as never);
  }) as typeof process.stdout.write;

  process.stderr.write = ((chunk, encoding, cb) => {
    collectOutputErrors(chunk);

    return originalStderrWrite(chunk, encoding as never, cb as never);
  }) as typeof process.stderr.write;

  return {
    logger,
    errors: () => [...errorLogs, ...processErrorLogs],
    stop: () => {
      process.stdout.write = originalStdoutWrite;
      process.stderr.write = originalStderrWrite;
    },
  };
}

/**
 * Starts the app, with a fresh `FREELENS_INTEGRATION_TESTING_DIR`, and collects
 * the errors either process logs until it is closed.
 */
export async function startApp(): Promise<AppSession> {
  const collector = collectErrors();
  let started: Awaited<ReturnType<typeof utils.start>> | undefined;

  try {
    started = await utils.start();
    started.window.on("console", collector.logger);
    console.log("await utils.clickWelcomeButton");
    await utils.clickWelcomeButton(started.window);
  } catch (error) {
    await started?.cleanup();
    collector.stop();
    throw error;
  }

  const { app, window, cleanup } = started;

  return {
    app,
    window,
    errors: collector.errors,
    close: async () => {
      // Keep listeners active through cleanup to catch late shutdown errors in CI logs.
      await cleanup();
      window.off("console", collector.logger);
      collector.stop();

      return collector.errors();
    },
  };
}

async function clickApplicationMenuItem(app: ElectronApplication, parentId: string, id: string) {
  await app.evaluate(
    async ({ app }, { parentId, id }) => {
      await app.applicationMenu?.getMenuItemById(parentId)?.submenu?.getMenuItemById(id)?.click();
    },
    { parentId, id },
  );
}

/**
 * Installs the extension from the Extensions page and waits until it is
 * enabled.
 */
export async function installExtension({ app, window }: AppSession) {
  // Navigate to extensions page
  console.log("navigate to extensions");
  await clickApplicationMenuItem(app, process.platform === "darwin" ? "mac" : "file", "navigate-to-extensions");

  // Trigger extension install: the packed tarball from the workflow, or the
  // published package when the test runs without one.
  console.log("await textbox.fill");
  await window
    .getByPlaceholder("Name, URL, or path to a package or directory")
    .fill(process.env.EXTENSION_PATH || extensionName);
  console.log("await install button click");
  await window.getByRole("button", { name: "Install", exact: true }).click();

  // Expect extension to be listed in installed list and enabled. The status
  // column reads "Incompatible" if the host refuses `engines.freelens`.
  console.log("await extensions table row");
  const row = window.getByTestId("extensions-table").locator("tbody tr", { hasText: extensionName });
  await row.locator("td").nth(2).getByText("Enabled", { exact: true }).waitFor();

  // Dismiss any notifications so a notification still in its enter animation
  // does not intercept pointer events on the elements behind it.
  console.log("dismiss notifications");
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
 * Opens the kind cluster from the catalog, selects the namespace of the test
 * objects, and returns the cluster's frame, where the extension's pages and
 * details render.
 */
export async function openKindCluster({ app, window }: AppSession): Promise<Frame> {
  console.log("navigate to catalog");
  await clickApplicationMenuItem(app, "view", "navigate-to-catalog");
  console.log(`open kind-${kindClusterName}`);

  const frame = await utils.launchKindClusterFromCatalog(kindClusterName, window);

  await selectTestNamespace(frame);

  return frame;
}

/**
 * Selects the namespace of the test objects in the namespace filter of the
 * extension's Gateways page, which its `KubeObjectListLayout` renders for a
 * namespaced resource that the cluster serves. A new cluster shows only
 * `default`, and the selection holds for every namespaced list of the cluster
 * and for the Overview. The page renders the filter only once the host has
 * registered the APIs of the cluster's CRDs. The session opens no page of the
 * host, whose requests can log errors of their own: the Pods page asks for pod
 * metrics, and kind has no metrics server.
 */
async function selectTestNamespace(frame: Frame) {
  console.log(`select namespace ${testNamespace}`);
  await openPage(frame, "gateway");

  const namespaceSelect = await frame.waitForSelector(".NamespaceSelect", viewTimeout);

  await namespaceSelect.click();
  await namespaceSelect.type(testNamespace);
  await namespaceSelect.press("Enter");
  await namespaceSelect.click();

  await frame
    .locator(".NamespaceSelect")
    .getByText(`Namespace: ${testNamespace}`, { exact: true })
    .waitFor(viewTimeout);
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
 * A path in the checkout of the extension, which `EXTENSION_DIR` names: the
 * tests run inside a Freelens checkout.
 */
function fromExtensionDir(...segments: string[]) {
  const extensionDir = process.env.EXTENSION_DIR;

  if (!extensionDir) {
    throw new Error("EXTENSION_DIR is not set");
  }

  return path.join(extensionDir, ...segments);
}

/**
 * Whether a session can run: `EXTENSION_DIR` is set and the kind cluster is
 * reachable. Outside CI a session skips with a warning otherwise; in CI the run
 * fails, so that a mistake in the workflow does not turn into a silent skip.
 */
export function clusterReady(): boolean {
  let reason: string | undefined;

  if (!process.env.EXTENSION_DIR) {
    reason = "EXTENSION_DIR is not set";
  } else if (!kindReady(kindClusterName, testNamespace)) {
    reason = `the kind cluster ${kindClusterName} is not running`;
  } else if (spawnSync("kubectl", ["--context", `kind-${kindClusterName}`, "get", "--raw", "/readyz"]).status !== 0) {
    reason = `the kind cluster ${kindClusterName} is not reachable`;
  }

  if (!reason) {
    return true;
  }

  if (process.env.CI) {
    throw new Error(`Cannot run the cluster tests: ${reason}`);
  }

  console.warn(`Skipping the cluster tests: ${reason}`);

  return false;
}

/**
 * Removes what an earlier session or run left, whichever Gateway API release
 * it installed: the test namespace, the cluster-scoped test objects, the
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
 * Removes what an earlier session or run left, then applies the Gateway API
 * CRDs of the session from `integration/crds/<session>` and, once they are
 * established, the test objects from `integration/fixtures/<session>`.
 */
export function setUpCluster(session: string) {
  removeGatewayApi();

  kubectl("apply", "--server-side", "-k", fromExtensionDir("integration", "crds", session));
  kubectl("wait", "--for=condition=Established", ...gatewayApiCrds(), "--timeout=120s");
  kubectl("apply", "--server-side", "-k", fromExtensionDir("integration", "fixtures", session));
}

/**
 * Deletes the test objects and the Gateway API CRDs of the session, with the
 * `safe-upgrades` policy and its binding where the release has them.
 */
export function tearDownCluster(session: string) {
  try {
    kubectl("delete", "-k", fromExtensionDir("integration", "fixtures", session), "--ignore-not-found", "--wait");
  } finally {
    kubectl("delete", "-k", fromExtensionDir("integration", "crds", session), "--ignore-not-found", "--wait");
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
 * Fails when the frame shows an error page of the extension's error boundary.
 */
async function expectNoErrorPage(scope: Frame | Locator, where: string) {
  // The class of `ErrorPage`, as CSS modules name it in the bundle.
  const errorPages = await scope.locator('[class*="_errorPage_"]').count();

  if (errorPages > 0) {
    throw new Error(`${where} shows ${errorPages} error page(s) of the extension`);
  }
}

/**
 * Opens one of the extension's pages from the sidebar, expanding the
 * "Gateway API" entry first when its items are not shown.
 */
async function openPage(frame: Frame, pageId: PageId | "overview") {
  const linkTestId = sidebarLinkTestId(pageId);

  console.log(`open page ${pageId}`);
  await frame.waitForSelector(`[data-testid="${menuLinkTestId}"]`, viewTimeout);

  if ((await frame.locator(`[data-testid="${linkTestId}"]`).count()) === 0) {
    await utils.clickSidebarItem(frame, menuLinkTestId);
  }

  await frame.waitForSelector(`[data-testid="${linkTestId}"]`, viewTimeout);
  await utils.clickSidebarItem(frame, linkTestId);
  await closeDetails(frame);
}

/**
 * Opens the list page of the kind and returns the table row of its test
 * object, after checking that the page rendered no error page.
 */
export async function openListPage(frame: Frame, pageId: PageId): Promise<Locator> {
  await openPage(frame, pageId);

  const row = frame
    .locator(".TableRow")
    .filter({ has: frame.locator(".TableCell").getByText(testObjectName, { exact: true }) });

  await row.waitFor(viewTimeout);
  await expectNoErrorPage(frame, `The ${kindViews[pageId].title} page`);

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

    if (match && match[3] === testObjectName) {
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
  await row.getByText(testObjectName, { exact: true }).click();

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
  await frame.getByText(`${kindViews[pageId].title} Not Available`, { exact: true }).waitFor(viewTimeout);
}

/**
 * Opens the Overview and waits for the chart of each kind, titled with the
 * kind and the count of its objects. A kind shown twice, once per served
 * version, would match twice and fail the wait.
 */
export async function openOverview(frame: Frame, pageIds: PageId[]) {
  await openPage(frame, "overview");
  await frame.getByText("Gateway API Overview", { exact: true }).waitFor(viewTimeout);

  for (const pageId of pageIds) {
    await frame.getByText(`${kindViews[pageId].title} (1)`, { exact: true }).waitFor(viewTimeout);
  }

  await expectNoErrorPage(frame, "The Overview");
}
