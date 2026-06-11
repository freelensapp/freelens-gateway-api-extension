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

export interface LocalObjectReference {
  group: string;
  kind: string;
  name: string;
}

export interface SecretObjectReference {
  group?: string;
  kind?: string;
  name: string;
  namespace?: string;
}

export type GatewayDefaultScope = "All" | "None";

export type SessionPersistenceType = "Cookie" | "Header";

export type CookieLifetimeType = "Session" | "Permanent";

export interface CookieConfig {
  /** default: `"Session"` */
  lifetimeType?: CookieLifetimeType;
}

export interface SessionPersistence {
  sessionName?: string;
  absoluteTimeout?: string;
  /** default: `"Cookie"` */
  type?: SessionPersistenceType;
  cookieConfig?: CookieConfig;
}

export interface ParentReference {
  /** default: `"gateway.networking.k8s.io"` */
  group?: string;
  /** default: `"Gateway"` */
  kind?: string;
  namespace?: string;
  name: string;
  sectionName?: string;
  port?: number;
}

export interface BackendObjectReference {
  /** default: `""` */
  group?: string;
  /** default: `"Service"` */
  kind?: string;
  name: string;
  namespace?: string;
  port?: number;
}

export interface BackendRef extends BackendObjectReference {
  /** default: `1` */
  weight?: number;
}

export interface CommonRouteSpec {
  parentRefs?: ParentReference[];
  useDefaultGateways?: GatewayDefaultScope;
}

export interface Fraction {
  numerator: number;
  denominator?: number;
}

export interface RouteParentStatus {
  parentRef: ParentReference;
  controllerName: string;
  conditions?: GatewayCondition[];
}

export interface RouteStatus {
  parents: RouteParentStatus[];
}

export interface PolicyAncestorStatus {
  ancestorRef: ParentReference;
  controllerName: string;
  conditions?: Condition[];
}

export interface PolicyStatus {
  conditions?: PolicyAncestorStatus[];
}
