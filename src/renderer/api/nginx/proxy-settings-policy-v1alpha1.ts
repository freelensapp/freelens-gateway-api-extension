import { Renderer } from "@freelensapp/extensions";
import { type LocalPolicyTargetReference } from "../k8s/backend-tls-policy-v1";
import { type GatewayKubeObjectCRD, type PolicyStatus } from "../k8s/types";

export interface ProxyBuffers {
  number?: number;
  size?: string;
}

export interface ProxyBuffering {
  disable?: boolean;
  bufferSize?: string;
  buffers?: ProxyBuffers;
  busyBuffersSize?: string;
}

export interface ProxyTimeout {
  connect?: string;
  read?: string;
  send?: string;
}

export interface ProxySettingsPolicySpec {
  targetRefs: LocalPolicyTargetReference[];
  buffering?: ProxyBuffering;
  timeout?: ProxyTimeout;
}

export interface ProxySettingsPolicyStatus extends PolicyStatus {}

export class ProxySettingsPolicy extends Renderer.K8sApi.LensExtensionKubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  ProxySettingsPolicyStatus,
  ProxySettingsPolicySpec
> {
  static readonly kind = "ProxySettingsPolicy";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/gateway.nginx.org/v1alpha1/proxysettingspolicies";
  static readonly crd: GatewayKubeObjectCRD = {
    apiVersions: ["gateway.nginx.org/v1alpha1"],
    plural: "proxysettingspolicies",
    singular: "proxysettingspolicy",
    shortNames: [],
    title: "Proxy Settings Policies",
  };
}

export class ProxySettingsPolicyApi extends Renderer.K8sApi.KubeApi<ProxySettingsPolicy> {}
export class ProxySettingsPolicyStore extends Renderer.K8sApi.KubeObjectStore<
  ProxySettingsPolicy,
  ProxySettingsPolicyApi
> {}
