import { Renderer } from "@freelensapp/extensions";
import { type LocalPolicyTargetReference } from "../k8s/backend-tls-policy-v1";
import { type GatewayKubeObjectCRD, type PolicyStatus, type SessionPersistence } from "../k8s/types";

export interface RequestRate {
  /** default: `10` */
  count?: number;
  /** default: `"1s"` */
  interval?: string;
}

export interface BudgetDetails {
  /** default: `20` */
  percent?: number;
  /** default: `"10s"` */
  interval?: string;
}

export interface RetryConstraint {
  budget?: BudgetDetails;
  minRetryRate?: RequestRate;
}

export interface BackendTrafficPolicySpec {
  targetRefs: LocalPolicyTargetReference[];
  retryConstraint?: RetryConstraint;
  sessionPersistence?: SessionPersistence;
}

export interface XBackendTrafficPolicyStatus extends PolicyStatus {}

export class XBackendTrafficPolicy extends Renderer.K8sApi.LensExtensionKubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  XBackendTrafficPolicyStatus,
  BackendTrafficPolicySpec
> {
  static readonly kind = "XBackendTrafficPolicy";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/gateway.networking.x-k8s.io/v1alpha1/xbackendtrafficpolicies";
  static readonly crd: GatewayKubeObjectCRD = {
    apiVersions: ["gateway.networking.x-k8s.io/v1alpha1"],
    plural: "xbackendtrafficpolicies",
    singular: "xbackendtrafficpolicy",
    shortNames: ["xbtrafficpolicy"],
    title: "Backend Traffic Policies",
  };
}

export class XBackendTrafficPolicyApi extends Renderer.K8sApi.KubeApi<XBackendTrafficPolicy> {}
export class XBackendTrafficPolicyStore extends Renderer.K8sApi.KubeObjectStore<
  XBackendTrafficPolicy,
  XBackendTrafficPolicyApi
> {}
