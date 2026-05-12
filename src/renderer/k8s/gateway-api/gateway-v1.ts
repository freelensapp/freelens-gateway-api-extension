import { Renderer } from "@freelensapp/extensions";
import { type GatewayCondition, type GatewayKubeObjectCRD, hasTrueCondition } from "./types";

export type GatewayProtocol = "HTTP" | "HTTPS" | "TCP" | "TLS" | "UDP";

export interface GatewayListener {
  name: string;
  hostname?: string;
  port: number;
  protocol: GatewayProtocol;
  tls?: {
    mode?: "Terminate" | "Passthrough";
  };
}

export interface GatewaySpec {
  gatewayClassName: string;
  listeners?: GatewayListener[];
}

export interface GatewayStatus {
  conditions?: GatewayCondition[];
  addresses?: Array<{ type: string; value: string }>;
}

export class Gateway extends Renderer.K8sApi.LensExtensionKubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  GatewayStatus,
  GatewaySpec
> {
  static readonly kind = "Gateway";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/gateway.networking.k8s.io/v1/gateways";
  static readonly crd: GatewayKubeObjectCRD = {
    apiVersions: ["gateway.networking.k8s.io/v1"],
    plural: "gateways",
    singular: "gateway",
    shortNames: ["gw"],
    title: "Gateways",
  };

  getClassName(): string {
    return this.spec.gatewayClassName;
  }

  getAddresses(): string[] {
    return (this.status?.addresses ?? []).map((address) => address.value);
  }

  getListeners(): GatewayListener[] {
    return this.spec.listeners ?? [];
  }

  isReady(): boolean {
    return hasTrueCondition(this.status?.conditions, "Ready");
  }
}

export class GatewayApi extends Renderer.K8sApi.KubeApi<Gateway> {}
export class GatewayStore extends Renderer.K8sApi.KubeObjectStore<Gateway, GatewayApi> {}
