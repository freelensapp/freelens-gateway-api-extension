import { Renderer } from "@freelensapp/extensions";
import { type ParametersReference, type SupportedFeature } from "../k8s/gateway-class-v1";
import { type GatewayKubeObjectCRD } from "../k8s/types";

import type { Condition } from "@freelensapp/kube-object";

export interface MeshSpec {
  controllerName?: string;
  parametersRef?: ParametersReference;
  description?: string;
}

export interface MeshStatus {
  conditions?: Condition[];
  supportedFeatures?: SupportedFeature[];
}

export class XMesh extends Renderer.K8sApi.LensExtensionKubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  MeshStatus,
  MeshSpec
> {
  static readonly kind = "XMesh";
  static readonly namespaced = false;
  static readonly apiBase = "/apis/gateway.networking.x-k8s.io/v1alpha1/xmeshes";
  static readonly crd: GatewayKubeObjectCRD = {
    apiVersions: ["gateway.networking.x-k8s.io/v1alpha1"],
    plural: "xmeshes",
    singular: "xmesh",
    shortNames: ["mesh"],
    title: "Meshes",
  };
}

export class XMeshApi extends Renderer.K8sApi.KubeApi<XMesh> {}
export class XMeshStore extends Renderer.K8sApi.KubeObjectStore<XMesh, XMeshApi> {}
