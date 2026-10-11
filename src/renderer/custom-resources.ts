import {
  BackendTLSPolicy_v1,
  Gateway_v1,
  GatewayClass_v1,
  GRPCRoute_v1,
  HTTPRoute_v1,
  ListenerSet_v1,
  ReferenceGrant_v1,
  ReferenceGrant_v1beta1,
  TCPRoute_v1,
  TCPRoute_v1alpha2,
  TLSRoute_v1,
  UDPRoute_v1,
  UDPRoute_v1alpha2,
} from "./api/k8s";
import { XBackend_v1alpha1, XBackendTrafficPolicy_v1alpha1, XMesh_v1alpha1 } from "./api/x-k8s";

import type { Common } from "@freelensapp/extensions";

// The model classes of every kind and version the extension has a page for.
// While the extension is enabled, the host leaves these resources out of the
// Custom Resources tree of the cluster sidebar. Every version of a kind is
// listed, so that removing one version keeps the others registered.
export const customResources: Common.Types.CustomResourceRegistration[] = [
  GatewayClass_v1,
  Gateway_v1,
  HTTPRoute_v1,
  GRPCRoute_v1,
  TCPRoute_v1,
  TCPRoute_v1alpha2,
  TLSRoute_v1,
  UDPRoute_v1,
  UDPRoute_v1alpha2,
  ReferenceGrant_v1,
  ReferenceGrant_v1beta1,
  ListenerSet_v1,
  BackendTLSPolicy_v1,
  XBackendTrafficPolicy_v1alpha1,
  XBackend_v1alpha1,
  XMesh_v1alpha1,
];
