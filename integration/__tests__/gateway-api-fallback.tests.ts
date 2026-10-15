/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// Runs inside a Freelens checkout, copied into `freelens/integration/__tests__/`
// by the integration tests workflow, and imports the helpers found there.
//
// The fallback session: the experimental channel of Gateway API v1.4.1
// (`integration/crds/fallback`), which serves TCPRoute and UDPRoute only in
// v1alpha2 and ReferenceGrant only in v1beta1, so their pages fall back to the
// older version, and has no TLSRoute v1, no ListenerSet v1, no XBackend and no
// XMesh, so their pages say that the cluster does not serve the kind. The
// session sets up the cluster, starts its own app and tears both down; it does
// not depend on another test file having run.

import { describeIf } from "@freelensapp/test-utils";
import { afterAll, beforeAll, expect, it } from "vitest";
import {
  clusterReady,
  installExtension,
  kindViews,
  openDetails,
  openKindCluster,
  openListPage,
  openOverview,
  openUnavailablePage,
  setUpCluster,
  startApp,
  tearDownCluster,
} from "./extension-helpers";

import type { Frame } from "playwright";

import type { AppSession, PageId } from "./extension-helpers";

const session = "fallback";

// The version each page is expected to fall back to.
const listed: [PageId, string][] = [
  ["tcproute", "gateway.networking.k8s.io/v1alpha2"],
  ["udproute", "gateway.networking.k8s.io/v1alpha2"],
  ["referencegrant", "gateway.networking.k8s.io/v1beta1"],
];

// The kinds of which the CRDs serve no version the extension models.
const unavailable: PageId[] = ["tlsroute", "listenerset", "xbackend", "xmesh"];

describeIf(clusterReady())(`Gateway API views, ${session} CRDs`, () => {
  let app: AppSession | undefined;
  let frame: Frame;

  beforeAll(
    async () => {
      setUpCluster(session);
      app = await startApp();
      await installExtension(app);
      frame = await openKindCluster(app);
    },
    10 * 60 * 1000,
  );

  afterAll(
    async () => {
      let errors: string[] = [];

      try {
        // The app first: it watches the CRDs, and would log errors for CRDs
        // deleted under it.
        errors = (await app?.close()) ?? [];
      } finally {
        tearDownCluster(session);
      }

      expect(errors).toEqual([]);
    },
    10 * 60 * 1000,
  );

  for (const [pageId, apiVersion] of listed) {
    it(
      `lists the ${kindViews[pageId].title} object and shows its ${apiVersion} details`,
      async () => {
        const row = await openListPage(frame, pageId);

        expect(await openDetails(frame, pageId, row)).toBe(apiVersion);
      },
      5 * 60 * 1000,
    );
  }

  for (const pageId of unavailable) {
    it(
      `says that the cluster does not serve ${kindViews[pageId].title}`,
      async () => {
        await openUnavailablePage(frame, pageId);
      },
      5 * 60 * 1000,
    );
  }

  it(
    "shows a chart for the routes at v1alpha2 on the Overview",
    async () => {
      await openOverview(frame, ["tcproute", "udproute"]);
    },
    5 * 60 * 1000,
  );
});
