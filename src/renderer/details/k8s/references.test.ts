import { Renderer } from "@freelensapp/extensions";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as k8s from "../../api/k8s";
import * as xK8s from "../../api/x-k8s";
import { getReferenceApiVersion } from "./references";

type KubeObjectClass = typeof Renderer.K8sApi.LensExtensionKubeObject<any, any, any>;

interface RegisteredApi {
  apiGroup: string;
  kind: string;
  apiVersionWithGroup: string;
}

// The stub's `getStore()` throws, as the host's does for a version that is not
// served. A test marks a version as served by spying on `getStore` of its class.
function serve(kubeObjectClass: KubeObjectClass) {
  vi.spyOn(kubeObjectClass, "getStore").mockReturnValue({} as Renderer.K8sApi.KubeObjectStore<any, any, any>);
}

// The stub's API registry is empty. A test registers the APIs of the host by
// spying on `getApi`.
function register(apis: RegisteredApi[]) {
  return vi
    .spyOn(Renderer.K8sApi.apiManager, "getApi")
    .mockImplementation((pathOrCallback) =>
      typeof pathOrCallback === "function" ? (apis.find((api) => pathOrCallback(api as never)) as never) : undefined,
    );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("getReferenceApiVersion", () => {
  it("links the core group to v1", () => {
    const getApi = register([]);

    expect(getReferenceApiVersion("", "Service")).toBe("v1");
    expect(getApi).not.toHaveBeenCalled();
  });

  it("takes the first served version of a kind the extension models", () => {
    serve(k8s.TCPRoute_v1);
    serve(k8s.TCPRoute_v1alpha2);

    expect(getReferenceApiVersion("gateway.networking.k8s.io", "TCPRoute")).toBe("gateway.networking.k8s.io/v1");
  });

  it("falls back to a later version of a modeled kind when an earlier one is not served", () => {
    serve(k8s.UDPRoute_v1alpha2);

    expect(getReferenceApiVersion("gateway.networking.k8s.io", "UDPRoute")).toBe("gateway.networking.k8s.io/v1alpha2");
  });

  it("links a reference to XBackend to the version the cluster serves", () => {
    serve(xK8s.XBackend_v1alpha1);

    expect(getReferenceApiVersion("gateway.networking.x-k8s.io", "XBackend")).toBe(
      "gateway.networking.x-k8s.io/v1alpha1",
    );
  });

  it("asks the host for a kind of another group", () => {
    register([
      { apiGroup: "gateway.envoyproxy.io", kind: "Backend", apiVersionWithGroup: "gateway.envoyproxy.io/v1alpha1" },
    ]);

    expect(getReferenceApiVersion("gateway.envoyproxy.io", "Backend")).toBe("gateway.envoyproxy.io/v1alpha1");
  });

  it("matches a modeled kind by its group, not by its kind alone", () => {
    serve(k8s.TCPRoute_v1);
    register([{ apiGroup: "example.com", kind: "TCPRoute", apiVersionWithGroup: "example.com/v2" }]);

    expect(getReferenceApiVersion("example.com", "TCPRoute")).toBe("example.com/v2");
  });

  it("asks the host for a modeled kind that the cluster serves in no modeled version", () => {
    register([
      {
        apiGroup: "gateway.networking.k8s.io",
        kind: "TCPRoute",
        apiVersionWithGroup: "gateway.networking.k8s.io/v2",
      },
    ]);

    expect(getReferenceApiVersion("gateway.networking.k8s.io", "TCPRoute")).toBe("gateway.networking.k8s.io/v2");
  });

  it("returns undefined when the cluster serves no API for the group and kind", () => {
    register([{ apiGroup: "example.com", kind: "Other", apiVersionWithGroup: "example.com/v1" }]);

    expect(getReferenceApiVersion("example.com", "Backend")).toBeUndefined();
    expect(getReferenceApiVersion("gateway.networking.k8s.io", "TCPRoute")).toBeUndefined();
  });
});
