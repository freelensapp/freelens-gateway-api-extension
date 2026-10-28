/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// The fallback session: the experimental channel of Gateway API v1.4.1
// (`integration/fixtures/fallback/crds`), which serves TCPRoute and UDPRoute
// only in v1alpha2 and ReferenceGrant only in v1beta1, and has no TLSRoute v1,
// no ListenerSet v1, no XBackend and no XMesh. The pages of the first three
// fall back to the older version, and the pages of the others say that the
// cluster does not serve the kind. The session disconnects the kind cluster,
// sets up the CRDs, connects the cluster again, so that the app reads the CRDs
// anew, and leaves the cluster disconnected; it does not depend on another
// test file having run.

import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  appReady,
  connectApp,
  disconnectKindCluster,
  installExtension,
  kindViews,
  openDetails,
  openKindCluster,
  openListPage,
  openOverview,
  openUnavailablePage,
  setUpCluster,
  tearDownCluster,
} from "./extension-helpers";

import type { Frame } from "playwright";

import type { AppSession, PageId } from "./extension-helpers";

const fixtures = "fallback";

// The version each page is expected to fall back to.
const listed: [PageId, string][] = [
  ["tcproute", "gateway.networking.k8s.io/v1alpha2"],
  ["udproute", "gateway.networking.k8s.io/v1alpha2"],
  ["referencegrant", "gateway.networking.k8s.io/v1beta1"],
];

// The kinds of which the CRDs serve no version the extension models.
const unavailable: PageId[] = ["tlsroute", "listenerset", "xbackend", "xmesh"];

describe.skipIf(!(await appReady({ cluster: true })))(`Gateway API views, ${fixtures} CRDs`, () => {
  let session: AppSession | undefined;
  let frame: Frame;

  beforeAll(
    async () => {
      session = await connectApp();
      await disconnectKindCluster(session);
      setUpCluster(fixtures);
      await installExtension(session);
      frame = await openKindCluster(session);
    },
    10 * 60 * 1000,
  );

  afterAll(
    async () => {
      let errors: string[] = [];

      try {
        // The errors first: the app refreshes the cluster while it disconnects,
        // and logs errors of its own when the refresh loses the race.
        errors = (await session?.stopCollecting()) ?? [];

        // The cluster then: the app watches the CRDs, and would log errors
        // for CRDs deleted under it.
        if (session) {
          await disconnectKindCluster(session);
        }

        await session?.close();
      } finally {
        tearDownCluster(fixtures);
      }

      expect(errors).toEqual([]);
    },
    10 * 60 * 1000,
  );

  // The first view after the namespace is selected on the HTTP Routes page, so
  // that the Overview loads every other kind itself: after the list pages it
  // would find their stores loaded.
  it("shows a chart for each route on the Overview", async () => {
    await openOverview(frame, ["tcproute", "udproute"]);
  });

  for (const [pageId, apiVersion] of listed) {
    it(`lists the ${kindViews[pageId].title} object and shows its ${apiVersion} details`, async () => {
      const row = await openListPage(frame, pageId);

      expect(await openDetails(frame, pageId, row)).toBe(apiVersion);
    });
  }

  for (const pageId of unavailable) {
    it(`says that the cluster does not serve ${kindViews[pageId].title}`, async () => {
      await openUnavailablePage(frame, pageId);
    });
  }
});
