import { Renderer } from "@freelensapp/extensions";

import type { Condition } from "@freelensapp/kube-object";

export interface GatewayKubeObjectCRD extends Renderer.K8sApi.LensExtensionKubeObjectCRD {
  title: string;
}

export interface GatewayCondition extends Condition {
  type: "Accepted" | "Programmed" | "Ready";
}

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

export type GatewayDefaultScope = "All" | "None";

export interface SecretObjectReference {
  group?: string;
  kind?: string;
  name: string;
  namespace?: string;
}
