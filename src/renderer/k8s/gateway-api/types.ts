import { Renderer } from "@freelensapp/extensions";

export interface GatewayKubeObjectCRD extends Renderer.K8sApi.LensExtensionKubeObjectCRD {
  title: string;
}

export type GatewayCondition = {
  type: string;
  status: "True" | "False" | "Unknown";
  reason?: string;
  message?: string;
};

export function hasTrueCondition(conditions: GatewayCondition[] | undefined, type: string): boolean {
  return conditions?.some((condition) => condition.type === type && condition.status === "True") ?? false;
}

export interface GatewayParentRef {
  kind: string;
  name: string;
  namespace?: string;
  sectionName?: string;
}

export interface GatewayBackendRef {
  kind?: "Service";
  name: string;
  namespace?: string;
  port?: number;
  weight?: number;
}
