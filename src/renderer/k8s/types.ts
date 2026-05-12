import { Renderer } from "@freelensapp/extensions";

export interface NamespacedObjectReference {
  name: string;
  namespace?: string;
}

export interface ExampleKubeObjectCRD extends Renderer.K8sApi.LensExtensionKubeObjectCRD {
  title: string;
}
