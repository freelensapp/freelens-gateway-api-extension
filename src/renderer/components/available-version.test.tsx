// @vitest-environment jsdom

import { Renderer } from "@freelensapp/extensions";
import { act, cleanup, render, screen } from "@testing-library/react";
import { observable, runInAction } from "mobx";
import { afterEach, describe, expect, it, vi } from "vitest";
import { type AvailableVersionPageProps, createAvailableVersionPage } from "./available-version";

// Only `name` is read by the pages below.
const extension = { name: "gateway-api-extension" } as Renderer.LensExtension;

// The stub's `getStore()` throws, as the host's does for a version that is not
// served. A test marks a version as served by spying on `getStore` of its class.
class Route_v1 extends Renderer.K8sApi.LensExtensionKubeObject {}
class Route_v1alpha2 extends Renderer.K8sApi.LensExtensionKubeObject {}

function serve(kubeObjectClass: typeof Renderer.K8sApi.LensExtensionKubeObject<any, any, any>) {
  vi.spyOn(kubeObjectClass, "getStore").mockReturnValue({} as Renderer.K8sApi.KubeObjectStore<any, any, any>);
}

const RoutesPage = createAvailableVersionPage<AvailableVersionPageProps>("Routes", [
  {
    kubeObjectClass: Route_v1,
    PageComponent: ({ extension }) => <span>v1 page of {extension.name}</span>,
    version: "v1",
  },
  {
    kubeObjectClass: Route_v1alpha2,
    PageComponent: ({ extension }) => <span>v1alpha2 page of {extension.name}</span>,
    version: "v1alpha2",
  },
]);

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("createAvailableVersionPage", () => {
  it("renders the first version that has a store, with the extension", () => {
    serve(Route_v1);
    serve(Route_v1alpha2);

    render(<RoutesPage extension={extension} />);

    expect(screen.getByText("v1 page of gateway-api-extension")).toBeDefined();
    expect(screen.queryByText(/v1alpha2 page/)).toBeNull();
  });

  it("falls back to a later version when an earlier one has no store", () => {
    serve(Route_v1alpha2);

    render(<RoutesPage extension={extension} />);

    expect(screen.getByText("v1alpha2 page of gateway-api-extension")).toBeDefined();
  });

  it("renders the not available page with the versions it tried when no version has a store", () => {
    render(<RoutesPage extension={extension} />);

    expect(screen.getByText("Routes Not Available")).toBeDefined();
    expect(screen.getByText("v1, v1alpha2")).toBeDefined();
  });

  it("renders the version's page once the host serves it after the first render", () => {
    // The host's `getStore()` reads its observable API registry. The spy reads an
    // observable in its place, so that serving the version is a change the page sees.
    const served = observable.box(false);
    vi.spyOn(Route_v1, "getStore").mockImplementation(() => {
      if (!served.get()) {
        throw new Error("no API for Route_v1");
      }
      return {} as Renderer.K8sApi.KubeObjectStore<any, any, any>;
    });

    render(<RoutesPage extension={extension} />);

    expect(screen.getByText("Routes Not Available")).toBeDefined();

    act(() => runInAction(() => served.set(true)));

    expect(screen.getByText("v1 page of gateway-api-extension")).toBeDefined();
    expect(screen.queryByText("Routes Not Available")).toBeNull();
  });
});
