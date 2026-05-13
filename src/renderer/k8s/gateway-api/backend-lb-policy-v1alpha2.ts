import { Renderer } from "@freelensapp/extensions";
import { type GatewayCondition, type GatewayKubeObjectCRD, hasTrueCondition } from "./types";

export interface BackendLBPolicySpec {
  targetRef: { kind: string; name: string; namespace?: string };
  policyType?: string;
}

export interface BackendLBPolicyStatus {
  conditions?: GatewayCondition[];
}

export class BackendLBPolicy extends Renderer.K8sApi.LensExtensionKubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  BackendLBPolicyStatus,
  BackendLBPolicySpec
> {
  static readonly kind = "BackendLBPolicy";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/gateway.networking.k8s.io/v1alpha2/backendlbpolicies";
  static readonly crd: GatewayKubeObjectCRD = {
    apiVersions: ["gateway.networking.k8s.io/v1alpha2"],
    plural: "backendlbpolicies",
    singular: "backendlbpolicy",
    title: "Backend LB Policies",
  };

  getTargetRef(): { kind: string; name: string; namespace?: string } {
    return this.spec.targetRef;
  }

  isAccepted(): boolean {
    return hasTrueCondition(this.status?.conditions, "Accepted");
  }
}

export class BackendLBPolicyApi extends Renderer.K8sApi.KubeApi<BackendLBPolicy> {}
export class BackendLBPolicyStore extends Renderer.K8sApi.KubeObjectStore<BackendLBPolicy, BackendLBPolicyApi> {}
