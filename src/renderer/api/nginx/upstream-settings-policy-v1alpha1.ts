import { Renderer } from "@freelensapp/extensions";
import { type LocalPolicyTargetReference } from "../k8s/backend-tls-policy-v1";
import { type GatewayKubeObjectCRD, type PolicyStatus } from "../k8s/types";

export interface UpstreamKeepAlive {
  connections?: number;
  requests?: number;
  time?: string;
  timeout?: string;
}

export interface UpstreamSettingsPolicySpec {
  targetRefs: LocalPolicyTargetReference[];
  zoneSize?: string;
  keepAlive?: UpstreamKeepAlive;
  loadBalancingMethod?: string;
  hashMethodKey?: string;
}

export interface UpstreamSettingsPolicyStatus extends PolicyStatus {}

export class UpstreamSettingsPolicy extends Renderer.K8sApi.LensExtensionKubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  UpstreamSettingsPolicyStatus,
  UpstreamSettingsPolicySpec
> {
  static readonly kind = "UpstreamSettingsPolicy";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/gateway.nginx.org/v1alpha1/upstreamsettingspolicies";
  static readonly crd: GatewayKubeObjectCRD = {
    apiVersions: ["gateway.nginx.org/v1alpha1"],
    plural: "upstreamsettingspolicies",
    singular: "upstreamsettingspolicy",
    shortNames: [],
    title: "Upstream Settings Policies",
  };
}

export class UpstreamSettingsPolicyApi extends Renderer.K8sApi.KubeApi<UpstreamSettingsPolicy> {}
export class UpstreamSettingsPolicyStore extends Renderer.K8sApi.KubeObjectStore<
  UpstreamSettingsPolicy,
  UpstreamSettingsPolicyApi
> {}
