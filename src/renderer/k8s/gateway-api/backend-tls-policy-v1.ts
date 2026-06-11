import { Renderer } from "@freelensapp/extensions";
import { type GatewayCondition, type GatewayKubeObjectCRD } from "./types";

export interface BackendTLSPolicySpec {
  targetRefs?: Array<{ kind: string; name: string; namespace?: string }>;
  validation?: {
    caCertificateRefs?: Array<{ kind: string; name: string; namespace?: string }>;
    hostname?: string;
  };
}

export interface BackendTLSPolicyStatus {
  conditions?: GatewayCondition[];
}

export class BackendTLSPolicy extends Renderer.K8sApi.LensExtensionKubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  BackendTLSPolicyStatus,
  BackendTLSPolicySpec
> {
  static readonly kind = "BackendTLSPolicy";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/gateway.networking.k8s.io/v1/backendtlspolicies";
  static readonly crd: GatewayKubeObjectCRD = {
    apiVersions: ["gateway.networking.k8s.io/v1"],
    plural: "backendtlspolicies",
    singular: "backendtlspolicy",
    shortNames: ["btlspolicy"],
    title: "Backend TLS Policies",
  };
}

export class BackendTLSPolicyApi extends Renderer.K8sApi.KubeApi<BackendTLSPolicy> {}
export class BackendTLSPolicyStore extends Renderer.K8sApi.KubeObjectStore<BackendTLSPolicy, BackendTLSPolicyApi> {}
