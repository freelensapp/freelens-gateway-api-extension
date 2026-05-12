import { Renderer } from "@freelensapp/extensions";

import type { ExampleKubeObjectCRD, NamespacedObjectReference } from "../types";

export interface ExampleSpec {
  title?: string;
  suspended?: boolean;
  description?: string;
  examples?: NamespacedObjectReference[];
}

export type ExampleStatus = {};

export class Example extends Renderer.K8sApi.LensExtensionKubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  ExampleStatus,
  ExampleSpec
> {
  static readonly kind = "Example";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/example.freelens.app/v1alpha2/examples";

  static readonly crd: ExampleKubeObjectCRD = {
    apiVersions: ["example.freelens.app/v1alpha2"],
    plural: "examples",
    singular: "example",
    shortNames: ["ex"],
    title: "Examples",
  };

  static getSuspended(object: Example): boolean {
    return object.spec.suspended ?? false;
  }

  static getTitle(object: Example): string | undefined {
    return object.spec.title;
  }
}

export class ExampleApi extends Renderer.K8sApi.KubeApi<Example> {}
export class ExampleStore extends Renderer.K8sApi.KubeObjectStore<Example, ExampleApi> {}
