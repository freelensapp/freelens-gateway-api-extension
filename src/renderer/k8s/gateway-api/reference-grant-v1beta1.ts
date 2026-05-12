import { Renderer } from "@freelensapp/extensions";
import { type GatewayKubeObjectCRD } from "./types";

export interface ReferenceGrantSpec {
  from?: Array<{ group: string; kind: string; namespace?: string }>;
  to?: Array<{ group: string; kind: string; name?: string }>;
}

export class ReferenceGrant extends Renderer.K8sApi.LensExtensionKubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  void,
  ReferenceGrantSpec
> {
  static readonly kind = "ReferenceGrant";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/gateway.networking.k8s.io/v1beta1/referencegrants";
  static readonly crd: GatewayKubeObjectCRD = {
    apiVersions: ["gateway.networking.k8s.io/v1beta1"],
    plural: "referencegrants",
    singular: "referencegrant",
    shortNames: ["refgrant"],
    title: "Reference Grants",
  };

  getFromCount(): number {
    return this.spec.from?.length ?? 0;
  }

  getToCount(): number {
    return this.spec.to?.length ?? 0;
  }
}

export class ReferenceGrantApi extends Renderer.K8sApi.KubeApi<ReferenceGrant> {}
export class ReferenceGrantStore extends Renderer.K8sApi.KubeObjectStore<ReferenceGrant, ReferenceGrantApi> {}
