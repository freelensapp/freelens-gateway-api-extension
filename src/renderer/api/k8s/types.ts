import { Renderer } from "@freelensapp/extensions";

export interface GatewayKubeObjectCRD extends Renderer.K8sApi.LensExtensionKubeObjectCRD {
  title: string;
}

export interface GatewayCondition extends Renderer.K8sApi.Condition {
  type: "Accepted" | "Programmed" | "Ready";
}

export function hasTrueCondition(conditions: Renderer.K8sApi.Condition[] | undefined, type: string): boolean {
  return conditions?.some((condition) => condition.type === type && condition.status === "True") ?? false;
}

// `Type: Status`, followed by the reason when there is one.
export function formatCondition(condition: Renderer.K8sApi.Condition): string {
  const text = `${condition.type}: ${condition.status}`;

  return condition.reason ? `${text} (${condition.reason})` : text;
}

// `name=value (type)` of a header or query parameter match, with `Exact` as the default type.
export function formatValueMatch(match: { type?: string; name: string; value: string }): string {
  return `${match.name}=${match.value} (${match.type ?? "Exact"})`;
}

export interface LocalObjectReference {
  group: string;
  kind: string;
  name: string;
}

export interface ObjectReference {
  group: string;
  kind: string;
  name: string;
  namespace?: string;
}

export interface SecretObjectReference {
  group?: string;
  kind?: string;
  name: string;
  namespace?: string;
}

export type SubjectAltNameType = "Hostname" | "URI";

export interface SubjectAltName {
  type: SubjectAltNameType;
  hostname?: string;
  uri?: string;
}

export interface BackendTLSPolicyValidation {
  caCertificateRefs?: LocalObjectReference[];
  wellKnownCACertificates?: string;
  hostname: string;
  subjectAltNames?: SubjectAltName[];
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
  conditions: GatewayCondition[];
}

export interface RouteStatus {
  parents: RouteParentStatus[];
}

export interface PolicyAncestorStatus {
  ancestorRef: ParentReference;
  controllerName: string;
  conditions: Renderer.K8sApi.Condition[];
}

export interface PolicyStatus {
  ancestors: PolicyAncestorStatus[];
}
