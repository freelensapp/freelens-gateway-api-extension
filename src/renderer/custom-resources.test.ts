import { Renderer } from "@freelensapp/extensions";
import { describe, expect, it } from "vitest";
import * as k8s from "./api/k8s";
import * as xK8s from "./api/x-k8s";
import { customResources } from "./custom-resources";

type KubeObjectClass = typeof Renderer.K8sApi.LensExtensionKubeObject<any, any, any>;

// Every model class the API modules export, each once although most are
// exported under two names.
const models = [...new Set<unknown>([...Object.values(k8s), ...Object.values(xK8s)])].filter(
  (value): value is KubeObjectClass =>
    typeof value === "function" && value.prototype instanceof Renderer.K8sApi.LensExtensionKubeObject,
);

const describeModel = (model: { kind?: string; crd?: { apiVersions: readonly string[] } }) =>
  `${model.kind} ${model.crd?.apiVersions.join()}`;

describe("customResources", () => {
  it("lists every model, since every kind and version has a page", () => {
    const listed = new Set<unknown>(customResources);
    const missing = models
      .filter((model) => !listed.has(model))
      .map(describeModel)
      .sort();

    expect(missing).toEqual([]);
  });

  it("lists each model once", () => {
    expect(new Set(customResources).size).toBe(customResources.length);
  });

  // The host rejects an entry without a kind, without the apiVersions and
  // plural of its crd, or of the core group, and leaves its resource in the tree.
  it("lists only models the host can read", () => {
    for (const model of customResources) {
      expect(model.kind, describeModel(model)).toBeTruthy();
      expect(model.crd?.plural, describeModel(model)).toBeTruthy();
      expect(model.crd?.apiVersions.length, describeModel(model)).toBeGreaterThan(0);
      for (const apiVersion of model.crd?.apiVersions ?? []) {
        expect(apiVersion, describeModel(model)).toMatch(/^gateway\.networking\.(x-)?k8s\.io\/v\w+$/);
      }
    }
  });
});
