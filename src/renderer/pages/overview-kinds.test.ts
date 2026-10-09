import { Renderer } from "@freelensapp/extensions";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as k8s from "../api/k8s";
import * as xK8s from "../api/x-k8s";
import { getAvailableResource, kinds } from "./overview-kinds";

type KubeObjectClass = typeof Renderer.K8sApi.LensExtensionKubeObject<any, any, any>;

// The stub's `getStore()` throws, as the host's does for a version that is not
// served. A test marks a version as served by spying on `getStore` of its class.
function serve(kubeObjectClass: KubeObjectClass) {
  const store = {} as Renderer.K8sApi.KubeObjectStore<any, any, any>;
  vi.spyOn(kubeObjectClass, "getStore").mockReturnValue(store);
  return store;
}

class Route_v1 extends Renderer.K8sApi.LensExtensionKubeObject {}
class Route_v1alpha2 extends Renderer.K8sApi.LensExtensionKubeObject {}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("getAvailableResource", () => {
  it("returns the first version that has a store, with its store", () => {
    const store = serve(Route_v1);
    serve(Route_v1alpha2);

    expect(getAvailableResource([Route_v1, Route_v1alpha2])).toEqual({ resource: Route_v1, store });
  });

  it("falls back to a later version when an earlier one is not served", () => {
    const store = serve(Route_v1alpha2);

    expect(getAvailableResource([Route_v1, Route_v1alpha2])).toEqual({ resource: Route_v1alpha2, store });
  });

  it("skips a version whose getStore returns no store", () => {
    vi.spyOn(Route_v1, "getStore").mockReturnValue(undefined as never);
    const store = serve(Route_v1alpha2);

    expect(getAvailableResource([Route_v1, Route_v1alpha2])).toEqual({ resource: Route_v1alpha2, store });
  });

  it("returns undefined when no version is served", () => {
    expect(getAvailableResource([Route_v1, Route_v1alpha2])).toBeUndefined();
    expect(getAvailableResource([])).toBeUndefined();
  });
});

describe("kinds", () => {
  // Every model class the API modules export, each once although most are
  // exported under two names.
  const models = [...new Set<unknown>([...Object.values(k8s), ...Object.values(xK8s)])].filter(
    (value): value is KubeObjectClass =>
      typeof value === "function" && value.prototype instanceof Renderer.K8sApi.LensExtensionKubeObject,
  );

  it("holds the versions of one kind in each entry", () => {
    for (const versions of kinds) {
      expect(new Set(versions.map((resource) => resource.kind)).size).toBe(1);
      expect(new Set(versions.map((resource) => resource.crd.plural)).size).toBe(1);
    }
  });

  it("lists each kind once, so its chart has a unique key", () => {
    const plurals = kinds.map((versions) => versions[0].crd.plural);

    expect(new Set(plurals).size).toBe(plurals.length);
  });

  it("lists every model except ReferenceGrant, which has no status", () => {
    const listed = new Set<KubeObjectClass>(kinds.flat());
    const missing = models
      .filter((model) => !listed.has(model))
      .map((model) => `${model.kind} ${model.crd?.apiVersions.join()}`)
      .sort();

    expect(missing).toEqual([
      "ReferenceGrant gateway.networking.k8s.io/v1",
      "ReferenceGrant gateway.networking.k8s.io/v1beta1",
    ]);
  });

  it("prefers v1 to v1alpha2 for TCPRoute and UDPRoute, as the cluster pages do", () => {
    const versionsOf = (kind: string) =>
      kinds.find((versions) => versions[0].kind === kind)?.map((resource) => resource.crd.apiVersions.join());

    expect(versionsOf("TCPRoute")).toEqual(["gateway.networking.k8s.io/v1", "gateway.networking.k8s.io/v1alpha2"]);
    expect(versionsOf("UDPRoute")).toEqual(["gateway.networking.k8s.io/v1", "gateway.networking.k8s.io/v1alpha2"]);
  });

  it("shows a kind served in v1 and v1alpha2 once, from v1", () => {
    const store = serve(k8s.TCPRoute_v1);
    serve(k8s.TCPRoute_v1alpha2);

    const shown = kinds.map((versions) => getAvailableResource(versions)).filter((available) => available);

    expect(shown).toEqual([{ resource: k8s.TCPRoute_v1, store }]);
  });

  it("shows a kind served in v1alpha2 only from v1alpha2", () => {
    const store = serve(k8s.UDPRoute_v1alpha2);

    const shown = kinds.map((versions) => getAvailableResource(versions)).filter((available) => available);

    expect(shown).toEqual([{ resource: k8s.UDPRoute_v1alpha2, store }]);
  });
});
