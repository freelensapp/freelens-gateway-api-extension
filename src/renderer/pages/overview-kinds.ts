import { Renderer } from "@freelensapp/extensions";
import {
  BackendTLSPolicy as BackendTLSPolicy_v1,
  Gateway as Gateway_v1,
  GatewayClass as GatewayClass_v1,
  GRPCRoute as GRPCRoute_v1,
  HTTPRoute as HTTPRoute_v1,
  ListenerSet as ListenerSet_v1,
  TCPRoute_v1,
  TCPRoute_v1alpha2,
  TLSRoute as TLSRoute_v1,
  UDPRoute_v1,
  UDPRoute_v1alpha2,
} from "../api/k8s";
import { XBackendTrafficPolicy as XBackendTrafficPolicy_v1alpha1, XMesh as XMesh_v1alpha1 } from "../api/x-k8s";

type KubeObjectClass = typeof Renderer.K8sApi.LensExtensionKubeObject<any, any, any>;

// Kinds whose status can be summarized, each with its model classes in the
// order the cluster pages prefer them. ReferenceGrant is omitted because it has
// no status subresource.
const kindVersions = [
  [GatewayClass_v1],
  [Gateway_v1],
  [HTTPRoute_v1],
  [GRPCRoute_v1],
  [TCPRoute_v1, TCPRoute_v1alpha2],
  [TLSRoute_v1],
  [UDPRoute_v1, UDPRoute_v1alpha2],
  [ListenerSet_v1],
  [BackendTLSPolicy_v1],
  [XBackendTrafficPolicy_v1alpha1],
  [XMesh_v1alpha1],
];

export type Resource = (typeof kindVersions)[number][number];

// Typed as one array type, so that `getAvailableResource` infers `Resource`
// for any entry rather than failing on a union of array types.
export const kinds: Resource[][] = kindVersions;

// The first version of a kind that has a store. The host has a store for every
// served version, so a kind served in two versions is shown once.
export function getAvailableResource<T extends KubeObjectClass>(versions: readonly T[]) {
  for (const resource of versions) {
    try {
      const store = resource.getStore();
      if (store) return { resource, store };
    } catch (_) {
      // version not served
    }
  }
  return undefined;
}
