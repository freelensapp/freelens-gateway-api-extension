/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { Renderer } from "@freelensapp/extensions";
import { BackendTLSPolicy as BackendTLSPolicy_v1 } from "./api/k8s/backend-tls-policy-v1";
import { GatewayClass as GatewayClass_v1 } from "./api/k8s/gateway-class-v1";
import { Gateway as Gateway_v1 } from "./api/k8s/gateway-v1";
import { GRPCRoute as GRPCRoute_v1 } from "./api/k8s/grpc-route-v1";
import { HTTPRoute as HTTPRoute_v1 } from "./api/k8s/http-route-v1";
import { ListenerSet as ListenerSet_v1 } from "./api/k8s/listenerset-v1";
import { ReferenceGrant as ReferenceGrant_v1 } from "./api/k8s/reference-grant-v1";
import { ReferenceGrant as ReferenceGrant_v1beta1 } from "./api/k8s/reference-grant-v1beta1";
import { TCPRoute as TCPRoute_v1alpha2 } from "./api/k8s/tcp-route-v1alpha2";
import { TLSRoute as TLSRoute_v1 } from "./api/k8s/tls-route-v1";
import { UDPRoute as UDPRoute_v1alpha2 } from "./api/k8s/udp-route-v1alpha2";
import { XBackendTrafficPolicy as XBackendTrafficPolicy_v1alpha1 } from "./api/x-k8s/x-backend-traffic-policy-v1alpha1";
import { createAvailableVersionPage } from "./components/available-version";
import { BackendTLSPolicyDetails as BackendTLSPolicyDetails_v1 } from "./details/k8s/backend-tls-policy-details-v1";
import { GatewayClassDetails as GatewayClassDetails_v1 } from "./details/k8s/gateway-class-details-v1";
import { GatewayDetails as GatewayDetails_v1 } from "./details/k8s/gateway-details-v1";
import { GRPCRouteDetails as GRPCRouteDetails_v1 } from "./details/k8s/grpc-route-details-v1";
import { HTTPRouteDetails as HTTPRouteDetails_v1 } from "./details/k8s/http-route-details-v1";
import { ListenerSetDetails as ListenerSetDetails_v1 } from "./details/k8s/listener-set-details-v1";
import { ReferenceGrantDetails as ReferenceGrantDetails_v1 } from "./details/k8s/reference-grant-details-v1";
import { ReferenceGrantDetails as ReferenceGrantDetails_v1beta1 } from "./details/k8s/reference-grant-details-v1beta1";
import { TCPRouteDetails as TCPRouteDetails_v1alpha2 } from "./details/k8s/tcp-route-details-v1alpha2";
import { TLSRouteDetails as TLSRouteDetails_v1 } from "./details/k8s/tls-route-details-v1";
import { UDPRouteDetails as UDPRouteDetails_v1alpha2 } from "./details/k8s/udp-route-details-v1alpha2";
import { XBackendTrafficPolicyDetails as XBackendTrafficPolicyDetails_v1alpha1 } from "./details/x-k8s/x-backend-traffic-policy-details-v1alpha1";
import { GatewayApiIcon } from "./icons";
import { BackendTLSPoliciesPage as BackendTLSPoliciesPage_v1 } from "./pages/k8s/backend-tls-policies-page-v1";
import { GatewayClassesPage as GatewayClassesPage_v1 } from "./pages/k8s/gateway-classes-page-v1";
import { GatewaysPage as GatewaysPage_v1 } from "./pages/k8s/gateways-page-v1";
import { GRPCRoutesPage as GRPCRoutesPage_v1 } from "./pages/k8s/grpc-routes-page-v1";
import { HTTPRoutesPage as HTTPRoutesPage_v1 } from "./pages/k8s/http-routes-page-v1";
import { ListenerSetsPage as ListenerSetsPage_v1 } from "./pages/k8s/listener-sets-page-v1";
import { ReferenceGrantsPage as ReferenceGrantsPage_v1 } from "./pages/k8s/reference-grants/reference-grants-page-v1";
import { ReferenceGrantsPage as ReferenceGrantsPage_v1beta1 } from "./pages/k8s/reference-grants/reference-grants-page-v1beta1";
import { TCPRoutesPage as TCPRoutesPage_v1alpha2 } from "./pages/k8s/tcp-routes-page-v1alpha2";
import { TLSRoutesPage as TLSRoutesPage_v1 } from "./pages/k8s/tls-routes-page-v1";
import { UDPRoutesPage as UDPRoutesPage_v1alpha2 } from "./pages/k8s/udp-routes-page-v1alpha2";
import { XBackendTrafficPoliciesPage as XBackendTrafficPoliciesPage_v1alpha1 } from "./pages/x-k8s/x-backend-traffic-policies-page-v1alpha1";

export default class GatewayApiRenderer extends Renderer.LensExtension {
  async onActivate() {}

  kubeObjectDetailItems = [
    {
      kind: GatewayClass_v1.kind,
      apiVersions: GatewayClass_v1.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<any>) => <GatewayClassDetails_v1 {...props} />,
      },
    },
    {
      kind: Gateway_v1.kind,
      apiVersions: Gateway_v1.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<any>) => <GatewayDetails_v1 {...props} />,
      },
    },
    {
      kind: HTTPRoute_v1.kind,
      apiVersions: HTTPRoute_v1.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<any>) => <HTTPRouteDetails_v1 {...props} />,
      },
    },
    {
      kind: GRPCRoute_v1.kind,
      apiVersions: GRPCRoute_v1.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<any>) => <GRPCRouteDetails_v1 {...props} />,
      },
    },
    {
      kind: TCPRoute_v1alpha2.kind,
      apiVersions: TCPRoute_v1alpha2.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<any>) => <TCPRouteDetails_v1alpha2 {...props} />,
      },
    },
    {
      kind: TLSRoute_v1.kind,
      apiVersions: TLSRoute_v1.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<any>) => <TLSRouteDetails_v1 {...props} />,
      },
    },
    {
      kind: UDPRoute_v1alpha2.kind,
      apiVersions: UDPRoute_v1alpha2.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<any>) => <UDPRouteDetails_v1alpha2 {...props} />,
      },
    },
    {
      kind: ReferenceGrant_v1.kind,
      apiVersions: ReferenceGrant_v1.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<any>) => <ReferenceGrantDetails_v1 {...props} />,
      },
    },
    {
      kind: ReferenceGrant_v1beta1.kind,
      apiVersions: ReferenceGrant_v1beta1.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<any>) => (
          <ReferenceGrantDetails_v1beta1 {...props} />
        ),
      },
    },
    {
      kind: ListenerSet_v1.kind,
      apiVersions: ListenerSet_v1.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<any>) => <ListenerSetDetails_v1 {...props} />,
      },
    },
    {
      kind: BackendTLSPolicy_v1.kind,
      apiVersions: BackendTLSPolicy_v1.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<any>) => <BackendTLSPolicyDetails_v1 {...props} />,
      },
    },
    {
      kind: XBackendTrafficPolicy_v1alpha1.kind,
      apiVersions: XBackendTrafficPolicy_v1alpha1.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<any>) => (
          <XBackendTrafficPolicyDetails_v1alpha1 {...props} />
        ),
      },
    },
  ];

  clusterPages = [
    {
      id: "gatewayclass",
      components: {
        Page: createAvailableVersionPage("Gateway Classes", [
          { kubeObjectClass: GatewayClass_v1, PageComponent: GatewayClassesPage_v1, version: "v1" },
        ]),
      },
    },
    {
      id: "gateway",
      components: {
        Page: createAvailableVersionPage("Gateways", [
          { kubeObjectClass: Gateway_v1, PageComponent: GatewaysPage_v1, version: "v1" },
        ]),
      },
    },
    {
      id: "httproute",
      components: {
        Page: createAvailableVersionPage("HTTP Routes", [
          { kubeObjectClass: HTTPRoute_v1, PageComponent: HTTPRoutesPage_v1, version: "v1" },
        ]),
      },
    },
    {
      id: "grpcroute",
      components: {
        Page: createAvailableVersionPage("gRPC Routes", [
          { kubeObjectClass: GRPCRoute_v1, PageComponent: GRPCRoutesPage_v1, version: "v1" },
        ]),
      },
    },
    {
      id: "tcproute",
      components: {
        Page: createAvailableVersionPage("TCP Routes", [
          { kubeObjectClass: TCPRoute_v1alpha2, PageComponent: TCPRoutesPage_v1alpha2, version: "v1alpha2" },
        ]),
      },
    },
    {
      id: "tlsroute",
      components: {
        Page: createAvailableVersionPage("TLS Routes", [
          { kubeObjectClass: TLSRoute_v1, PageComponent: TLSRoutesPage_v1, version: "v1" },
        ]),
      },
    },
    {
      id: "udproute",
      components: {
        Page: createAvailableVersionPage("UDP Routes", [
          { kubeObjectClass: UDPRoute_v1alpha2, PageComponent: UDPRoutesPage_v1alpha2, version: "v1alpha2" },
        ]),
      },
    },
    {
      id: "referencegrant",
      components: {
        Page: createAvailableVersionPage("Reference Grants", [
          { kubeObjectClass: ReferenceGrant_v1, PageComponent: ReferenceGrantsPage_v1, version: "v1" },
          { kubeObjectClass: ReferenceGrant_v1beta1, PageComponent: ReferenceGrantsPage_v1beta1, version: "v1beta1" },
        ]),
      },
    },
    {
      id: "listenerset",
      components: {
        Page: createAvailableVersionPage("Listener Sets", [
          { kubeObjectClass: ListenerSet_v1, PageComponent: ListenerSetsPage_v1, version: "v1" },
        ]),
      },
    },
    {
      id: "backendtlspolicy",
      components: {
        Page: createAvailableVersionPage("Backend TLS Policies", [
          { kubeObjectClass: BackendTLSPolicy_v1, PageComponent: BackendTLSPoliciesPage_v1, version: "v1" },
        ]),
      },
    },
    {
      id: "xbackendtrafficpolicy",
      components: {
        Page: createAvailableVersionPage("Backend Traffic Policies", [
          {
            kubeObjectClass: XBackendTrafficPolicy_v1alpha1,
            PageComponent: XBackendTrafficPoliciesPage_v1alpha1,
            version: "v1alpha1",
          },
        ]),
      },
    },
  ];

  clusterPageMenus = [
    {
      id: "gateway-api",
      title: "Gateway API",
      components: {
        Icon: GatewayApiIcon,
      },
    },
    {
      id: "gatewayclass",
      parentId: "gateway-api",
      title: "Gateway Classes",
      target: { pageId: "gatewayclass" },
      components: {},
    },
    {
      id: "gateway",
      parentId: "gateway-api",
      title: "Gateways",
      target: { pageId: "gateway" },
      components: {},
    },
    {
      id: "httproute",
      parentId: "gateway-api",
      title: "HTTP Routes",
      target: { pageId: "httproute" },
      components: {},
    },
    {
      id: "grpcroute",
      parentId: "gateway-api",
      title: "gRPC Routes",
      target: { pageId: "grpcroute" },
      components: {},
    },
    {
      id: "tcproute",
      parentId: "gateway-api",
      title: "TCP Routes",
      target: { pageId: "tcproute" },
      components: {},
    },
    {
      id: "tlsroute",
      parentId: "gateway-api",
      title: "TLS Routes",
      target: { pageId: "tlsroute" },
      components: {},
    },
    {
      id: "udproute",
      parentId: "gateway-api",
      title: "UDP Routes",
      target: { pageId: "udproute" },
      components: {},
    },
    {
      id: "referencegrant",
      parentId: "gateway-api",
      title: "Reference Grants",
      target: { pageId: "referencegrant" },
      components: {},
    },
    {
      id: "listenerset",
      parentId: "gateway-api",
      title: "Listener Sets",
      target: { pageId: "listenerset" },
      components: {},
    },
    {
      id: "backendtlspolicy",
      parentId: "gateway-api",
      title: "Backend TLS Policies",
      target: { pageId: "backendtlspolicy" },
      components: {},
    },
    {
      id: "xbackendtrafficpolicy",
      parentId: "gateway-api",
      title: "Backend Traffic Policies",
      target: { pageId: "xbackendtrafficpolicy" },
      components: {},
    },
  ];
}
