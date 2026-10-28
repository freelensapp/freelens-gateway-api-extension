/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// The latest session: the experimental channel of the newest Gateway API
// release (`integration/fixtures/latest/crds`), which serves every kind the
// extension shows at its newest version, TCPRoute and UDPRoute in v1 next to
// v1alpha2, and ReferenceGrant in v1 next to v1beta1. Every page lists its test
// object, and its details open at the newest version with the extension's own
// panel. The session disconnects the kind cluster, sets up the CRDs, connects
// the cluster again, so that the app reads the CRDs anew, and leaves the
// cluster disconnected; it does not depend on another test file having run.

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
  setUpCluster,
  tearDownCluster,
} from "./extension-helpers";

import type { Frame } from "playwright";

import type { AppSession, PageId } from "./extension-helpers";

const fixtures = "latest";

// The version each page is expected to choose.
const listed: [PageId, string][] = [
  ["gatewayclass", "gateway.networking.k8s.io/v1"],
  ["gateway", "gateway.networking.k8s.io/v1"],
  ["httproute", "gateway.networking.k8s.io/v1"],
  ["grpcroute", "gateway.networking.k8s.io/v1"],
  ["tcproute", "gateway.networking.k8s.io/v1"],
  ["tlsroute", "gateway.networking.k8s.io/v1"],
  ["udproute", "gateway.networking.k8s.io/v1"],
  ["referencegrant", "gateway.networking.k8s.io/v1"],
  ["listenerset", "gateway.networking.k8s.io/v1"],
  ["backendtlspolicy", "gateway.networking.k8s.io/v1"],
  ["xbackendtrafficpolicy", "gateway.networking.x-k8s.io/v1alpha1"],
  ["xbackend", "gateway.networking.x-k8s.io/v1alpha1"],
  ["xmesh", "gateway.networking.x-k8s.io/v1alpha1"],
];

// ReferenceGrant has no status, so the Overview has no chart for it.
const charted = listed.map(([pageId]) => pageId).filter((pageId) => pageId !== "referencegrant");

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
        // The cluster first: the app watches the CRDs, and would log errors
        // for CRDs deleted under it.
        if (session) {
          await disconnectKindCluster(session);
        }

        errors = (await session?.close()) ?? [];
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
  it("shows a chart for each kind with objects on the Overview", async () => {
    await openOverview(frame, charted);
  });

  for (const [pageId, apiVersion] of listed) {
    it(`lists the ${kindViews[pageId].title} object and shows its ${apiVersion} details`, async () => {
      const row = await openListPage(frame, pageId);

      expect(await openDetails(frame, pageId, row)).toBe(apiVersion);
    });
  }
});
