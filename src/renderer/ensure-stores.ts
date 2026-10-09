/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { Common, Renderer } from "@freelensapp/extensions";
import {
  BackendTLSPolicy as BackendTLSPolicy_v1,
  BackendTLSPolicyApi as BackendTLSPolicyApi_v1,
  BackendTLSPolicyStore as BackendTLSPolicyStore_v1,
  Gateway as Gateway_v1,
  GatewayApi as GatewayApi_v1,
  GatewayClass as GatewayClass_v1,
  GatewayClassApi as GatewayClassApi_v1,
  GatewayClassStore as GatewayClassStore_v1,
  GatewayStore as GatewayStore_v1,
  GRPCRoute as GRPCRoute_v1,
  GRPCRouteApi as GRPCRouteApi_v1,
  GRPCRouteStore as GRPCRouteStore_v1,
  HTTPRoute as HTTPRoute_v1,
  HTTPRouteApi as HTTPRouteApi_v1,
  HTTPRouteStore as HTTPRouteStore_v1,
  ListenerSet as ListenerSet_v1,
  ListenerSetApi as ListenerSetApi_v1,
  ListenerSetStore as ListenerSetStore_v1,
  ReferenceGrant as ReferenceGrant_v1,
  ReferenceGrant_v1beta1,
  ReferenceGrantApi as ReferenceGrantApi_v1,
  ReferenceGrantApi_v1beta1,
  ReferenceGrantStore as ReferenceGrantStore_v1,
  ReferenceGrantStore_v1beta1,
  TCPRoute as TCPRoute_v1,
  TCPRoute_v1alpha2,
  TCPRouteApi as TCPRouteApi_v1,
  TCPRouteApi_v1alpha2,
  TCPRouteStore as TCPRouteStore_v1,
  TCPRouteStore_v1alpha2,
  TLSRoute as TLSRoute_v1,
  TLSRouteApi as TLSRouteApi_v1,
  TLSRouteStore as TLSRouteStore_v1,
  UDPRoute as UDPRoute_v1,
  UDPRoute_v1alpha2,
  UDPRouteApi as UDPRouteApi_v1,
  UDPRouteApi_v1alpha2,
  UDPRouteStore as UDPRouteStore_v1,
  UDPRouteStore_v1alpha2,
} from "./api/k8s";
import {
  XBackendTrafficPolicy as XBackendTrafficPolicy_v1alpha1,
  XBackendTrafficPolicyApi as XBackendTrafficPolicyApi_v1alpha1,
  XBackendTrafficPolicyStore as XBackendTrafficPolicyStore_v1alpha1,
  XMesh as XMesh_v1alpha1,
  XMeshApi as XMeshApi_v1alpha1,
  XMeshStore as XMeshStore_v1alpha1,
} from "./api/x-k8s";

interface CrdRegistration {
  kubeObjectClass: typeof Renderer.K8sApi.LensExtensionKubeObject<any, any, any>;
  ApiClass: new (opts: any) => any;
  StoreClass: new (api: any) => any;
}

const registrations: CrdRegistration[] = [
  { kubeObjectClass: BackendTLSPolicy_v1, ApiClass: BackendTLSPolicyApi_v1, StoreClass: BackendTLSPolicyStore_v1 },
  { kubeObjectClass: GatewayClass_v1, ApiClass: GatewayClassApi_v1, StoreClass: GatewayClassStore_v1 },
  { kubeObjectClass: Gateway_v1, ApiClass: GatewayApi_v1, StoreClass: GatewayStore_v1 },
  { kubeObjectClass: GRPCRoute_v1, ApiClass: GRPCRouteApi_v1, StoreClass: GRPCRouteStore_v1 },
  { kubeObjectClass: HTTPRoute_v1, ApiClass: HTTPRouteApi_v1, StoreClass: HTTPRouteStore_v1 },
  { kubeObjectClass: ListenerSet_v1, ApiClass: ListenerSetApi_v1, StoreClass: ListenerSetStore_v1 },
  { kubeObjectClass: ReferenceGrant_v1, ApiClass: ReferenceGrantApi_v1, StoreClass: ReferenceGrantStore_v1 },
  {
    kubeObjectClass: ReferenceGrant_v1beta1,
    ApiClass: ReferenceGrantApi_v1beta1,
    StoreClass: ReferenceGrantStore_v1beta1,
  },
  { kubeObjectClass: TCPRoute_v1, ApiClass: TCPRouteApi_v1, StoreClass: TCPRouteStore_v1 },
  { kubeObjectClass: TCPRoute_v1alpha2, ApiClass: TCPRouteApi_v1alpha2, StoreClass: TCPRouteStore_v1alpha2 },
  { kubeObjectClass: TLSRoute_v1, ApiClass: TLSRouteApi_v1, StoreClass: TLSRouteStore_v1 },
  { kubeObjectClass: UDPRoute_v1, ApiClass: UDPRouteApi_v1, StoreClass: UDPRouteStore_v1 },
  { kubeObjectClass: UDPRoute_v1alpha2, ApiClass: UDPRouteApi_v1alpha2, StoreClass: UDPRouteStore_v1alpha2 },
  {
    kubeObjectClass: XBackendTrafficPolicy_v1alpha1,
    ApiClass: XBackendTrafficPolicyApi_v1alpha1,
    StoreClass: XBackendTrafficPolicyStore_v1alpha1,
  },
  { kubeObjectClass: XMesh_v1alpha1, ApiClass: XMeshApi_v1alpha1, StoreClass: XMeshStore_v1alpha1 },
];

/**
 * Eagerly registers KubeApi + KubeObjectStore for each CRD class so that
 * getStore() works even when the user lacks cluster-scoped RBAC to read CRDs
 * via apiextensions.k8s.io. Without this, the Freelens host only registers
 * stores for CRDs it can discover, and users without cluster-wide CRD read
 * access see "CRDs are not installed" despite having namespace-scoped access.
 */
export function ensureStoresRegistered(): void {
  for (const { kubeObjectClass, ApiClass, StoreClass } of registrations) {
    try {
      kubeObjectClass.getStore();
    } catch {
      try {
        const api = new ApiClass({ objectConstructor: kubeObjectClass });
        const store = new StoreClass(api);
        Renderer.K8sApi.apiManager.registerStore(store);
        Common.logger.debug(
          `[@freelensapp/gateway-api-extension]: Registered store for ${kubeObjectClass.kind} (${kubeObjectClass.apiBase})`,
        );
      } catch (error) {
        Common.logger.warn(
          `[@freelensapp/gateway-api-extension]: Failed to register store for ${kubeObjectClass.kind}: ${error}`,
        );
      }
    }
  }
}
