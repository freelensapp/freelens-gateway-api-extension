import { Renderer } from "@freelensapp/extensions";
import { type GatewayKubeObjectCRD } from "./types";

export interface ReferenceGrantFrom {
  group: string;
  kind: string;
  namespace?: string;
}

export interface ReferenceGrantTo {
  group: string;
  kind: string;
  name?: string;
}

export interface ReferenceGrantSpec {
  from: ReferenceGrantFrom[];
  to: ReferenceGrantTo[];
}

export class ReferenceGrant extends Renderer.K8sApi.LensExtensionKubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  void,
  ReferenceGrantSpec
> {
  static readonly kind = "ReferenceGrant";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/gateway.networking.k8s.io/v1/referencegrants";
  static readonly crd: GatewayKubeObjectCRD = {
    apiVersions: ["gateway.networking.k8s.io/v1"],
    plural: "referencegrants",
    singular: "referencegrant",
    shortNames: ["refgrant"],
    title: "Reference Grants",
  };
}

export class ReferenceGrantApi extends Renderer.K8sApi.KubeApi<ReferenceGrant> {}
export class ReferenceGrantStore extends Renderer.K8sApi.KubeObjectStore<ReferenceGrant, ReferenceGrantApi> {}
