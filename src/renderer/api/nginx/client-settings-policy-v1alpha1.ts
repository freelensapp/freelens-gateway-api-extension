import { Renderer } from "@freelensapp/extensions";
import { type LocalPolicyTargetReference } from "../k8s/backend-tls-policy-v1";
import { type GatewayKubeObjectCRD, type PolicyStatus } from "../k8s/types";

export interface ClientKeepAliveTimeout {
  server?: string;
  header?: string;
}

export interface ClientKeepAlive {
  requests?: number;
  time?: string;
  timeout?: ClientKeepAliveTimeout;
  minTimeout?: string;
}

export interface ClientBody {
  maxSize?: string;
  timeout?: string;
}

export interface ClientSettingsPolicySpec {
  targetRef: LocalPolicyTargetReference;
  body?: ClientBody;
  keepAlive?: ClientKeepAlive;
}

export interface ClientSettingsPolicyStatus extends PolicyStatus {}

export class ClientSettingsPolicy extends Renderer.K8sApi.LensExtensionKubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  ClientSettingsPolicyStatus,
  ClientSettingsPolicySpec
> {
  static readonly kind = "ClientSettingsPolicy";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/gateway.nginx.org/v1alpha1/clientsettingspolicies";
  static readonly crd: GatewayKubeObjectCRD = {
    apiVersions: ["gateway.nginx.org/v1alpha1"],
    plural: "clientsettingspolicies",
    singular: "clientsettingspolicy",
    shortNames: [],
    title: "Client Settings Policies",
  };
}

export class ClientSettingsPolicyApi extends Renderer.K8sApi.KubeApi<ClientSettingsPolicy> {}
export class ClientSettingsPolicyStore extends Renderer.K8sApi.KubeObjectStore<
  ClientSettingsPolicy,
  ClientSettingsPolicyApi
> {}
