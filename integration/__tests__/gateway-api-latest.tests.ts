/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// Runs inside a Freelens checkout, copied into `freelens/integration/__tests__/`
// by the integration tests workflow, and imports the helpers found there.
//
// The latest session: the experimental channel of the newest Gateway API
// release (`integration/crds/latest`), which serves every kind the extension
// shows at its newest version, TCPRoute and UDPRoute in v1 next to v1alpha2,
// and ReferenceGrant in v1 next to v1beta1. Every page lists its test object,
// and its details open at the newest version with the extension's own panel.
// The session sets up the cluster, starts its own app and tears both down; it
// does not depend on another test file having run.

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
  setUpCluster,
  startApp,
  tearDownCluster,
} from "./extension-helpers";

import type { Frame } from "playwright";

import type { AppSession, PageId } from "./extension-helpers";

const session = "latest";

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

  it(
    "shows a chart for each kind with objects on the Overview",
    async () => {
      await openOverview(frame, charted);
    },
    5 * 60 * 1000,
  );
});
