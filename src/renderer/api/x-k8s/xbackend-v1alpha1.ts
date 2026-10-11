import { Renderer } from "@freelensapp/extensions";
import {
  type BackendTLSPolicyValidation,
  type GatewayKubeObjectCRD,
  hasTrueCondition,
  type ParentReference,
  type SecretObjectReference,
} from "../k8s/types";

export type BackendType = "ExternalHostname";

// The Go type also declares `GRPC`, which the enum of the CRD does not accept.
export type BackendProtocol = "TCP" | "HTTP" | "HTTP2" | "HTTP11" | "H2C" | "MCP";

export type BackendTLSMode = "None" | "ServerOnly" | "ClientAndServer";

export interface BackendPort {
  name?: string;
  port: number;
}

export interface ExternalHostnameBackend {
  hostname: string;
}

export interface BackendTLS {
  mode: BackendTLSMode;
  /** set if and only if `mode` is `"ClientAndServer"` */
  clientCertificateRef?: SecretObjectReference;
  validation?: BackendTLSPolicyValidation;
}

export interface BackendSpec {
  type: BackendType;
  port: BackendPort;
  /** set if and only if `type` is `"ExternalHostname"` */
  externalHostname?: ExternalHostnameBackend;
  /** unset: the protocol of the route or listener */
  protocol?: BackendProtocol;
  tls?: BackendTLS;
}

export interface BackendAncestorStatus {
  controllerName: string;
  parentRef: ParentReference;
  conditions?: Renderer.K8sApi.Condition[];
}

export interface BackendStatus {
  /** the Go field `Ancestors` */
  parents?: BackendAncestorStatus[];
}

// Whether any parent has accepted the backend.
export function isBackendAccepted(status: BackendStatus | undefined): boolean {
  return status?.parents?.some((parent) => hasTrueCondition(parent.conditions, "Accepted")) ?? false;
}

// The port number, followed by the port's name when it has one.
export function formatBackendPort(port: BackendPort | undefined): string {
  if (port?.port === undefined) {
    return "-";
  }

  return port.name ? `${port.port} (${port.name})` : String(port.port);
}

export class XBackend extends Renderer.K8sApi.LensExtensionKubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  BackendStatus,
  BackendSpec
> {
  declare kind: "XBackend";
  declare apiVersion: "gateway.networking.x-k8s.io/v1alpha1";

  static readonly kind = "XBackend";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/gateway.networking.x-k8s.io/v1alpha1/xbackends";
  static readonly crd: GatewayKubeObjectCRD = {
    apiVersions: ["gateway.networking.x-k8s.io/v1alpha1"],
    plural: "xbackends",
    singular: "xbackend",
    shortNames: ["xbackend"],
    title: "Backends",
  };
}

export class XBackendApi extends Renderer.K8sApi.KubeApi<XBackend> {}
export class XBackendStore extends Renderer.K8sApi.KubeObjectStore<XBackend, XBackendApi> {}
