import { Renderer } from "@freelensapp/extensions";
import { type GatewayKubeObjectCRD, type LocalObjectReference, type PolicyStatus } from "./types";

export type SubjectAltNameType = "Hostname" | "URI";

export interface LocalPolicyTargetReference {
  group: string;
  kind: string;
  name: string;
}

export interface LocalPolicyTargetReferenceWithSectionName extends LocalPolicyTargetReference {
  sectionName?: string;
}

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

export interface BackendTLSPolicySpec {
  targetRefs?: LocalPolicyTargetReferenceWithSectionName[];
  validation: BackendTLSPolicyValidation;
  options?: Record<string, string>;
}

export interface BackendTLSPolicyStatus extends PolicyStatus {}

export class BackendTLSPolicy extends Renderer.K8sApi.LensExtensionKubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  BackendTLSPolicyStatus,
  BackendTLSPolicySpec
> {
  static readonly kind = "BackendTLSPolicy";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/gateway.networking.k8s.io/v1/backendtlspolicies";
  static readonly crd: GatewayKubeObjectCRD = {
    apiVersions: ["gateway.networking.k8s.io/v1"],
    plural: "backendtlspolicies",
    singular: "backendtlspolicy",
    shortNames: ["btlspolicy"],
    title: "Backend TLS Policies",
  };
}

export class BackendTLSPolicyApi extends Renderer.K8sApi.KubeApi<BackendTLSPolicy> {}
export class BackendTLSPolicyStore extends Renderer.K8sApi.KubeObjectStore<BackendTLSPolicy, BackendTLSPolicyApi> {}
