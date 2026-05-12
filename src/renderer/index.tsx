/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { Renderer } from "@freelensapp/extensions";
import { createAvailableVersionPage } from "./components/available-version";
import { BackendLBPolicyDetails as BackendLBPolicyDetails_v1alpha2 } from "./details/gateway-api/backend-lb-policy-details-v1alpha2";
import { BackendTLSPolicyDetails as BackendTLSPolicyDetails_v1 } from "./details/gateway-api/backend-tls-policy-details-v1";
import { GatewayClassDetails as GatewayClassDetails_v1 } from "./details/gateway-api/gateway-class-details-v1";
import { GatewayDetails as GatewayDetails_v1 } from "./details/gateway-api/gateway-details-v1";
import { GRPCRouteDetails as GRPCRouteDetails_v1 } from "./details/gateway-api/grpc-route-details-v1";
import { HTTPRouteDetails as HTTPRouteDetails_v1 } from "./details/gateway-api/http-route-details-v1";
import { ReferenceGrantDetails as ReferenceGrantDetails_v1beta1 } from "./details/gateway-api/reference-grant-details-v1beta1";
import { TCPRouteDetails as TCPRouteDetails_v1alpha2 } from "./details/gateway-api/tcp-route-details-v1alpha2";
import { TLSRouteDetails as TLSRouteDetails_v1alpha2 } from "./details/gateway-api/tls-route-details-v1alpha2";
import { UDPRouteDetails as UDPRouteDetails_v1alpha2 } from "./details/gateway-api/udp-route-details-v1alpha2";
import { GatewayApiIcon } from "./icons";
import { BackendLBPolicy as BackendLBPolicy_v1alpha2 } from "./k8s/gateway-api/backend-lb-policy-v1alpha2";
import { BackendTLSPolicy as BackendTLSPolicy_v1 } from "./k8s/gateway-api/backend-tls-policy-v1";
import { GatewayClass as GatewayClass_v1 } from "./k8s/gateway-api/gateway-class-v1";
import { Gateway as Gateway_v1 } from "./k8s/gateway-api/gateway-v1";
import { GRPCRoute as GRPCRoute_v1 } from "./k8s/gateway-api/grpc-route-v1";
import { HTTPRoute as HTTPRoute_v1 } from "./k8s/gateway-api/http-route-v1";
import { ReferenceGrant as ReferenceGrant_v1beta1 } from "./k8s/gateway-api/reference-grant-v1beta1";
import { TCPRoute as TCPRoute_v1alpha2 } from "./k8s/gateway-api/tcp-route-v1alpha2";
import { TLSRoute as TLSRoute_v1alpha2 } from "./k8s/gateway-api/tls-route-v1alpha2";
import { UDPRoute as UDPRoute_v1alpha2 } from "./k8s/gateway-api/udp-route-v1alpha2";
import { BackendLBPoliciesPage as BackendLBPoliciesPage_v1alpha2 } from "./pages/gateway-api/backend-lb-policies-page-v1alpha2";
import { BackendTLSPoliciesPage as BackendTLSPoliciesPage_v1 } from "./pages/gateway-api/backend-tls-policies-page-v1";
import { GatewayClassesPage as GatewayClassesPage_v1 } from "./pages/gateway-api/gateway-classes-page-v1";
import { GatewaysPage as GatewaysPage_v1 } from "./pages/gateway-api/gateways-page-v1";
import { GRPCRoutesPage as GRPCRoutesPage_v1 } from "./pages/gateway-api/grpc-routes-page-v1";
import { HTTPRoutesPage as HTTPRoutesPage_v1 } from "./pages/gateway-api/http-routes-page-v1";
import { ReferenceGrantsPage as ReferenceGrantsPage_v1beta1 } from "./pages/gateway-api/reference-grants-page-v1beta1";
import { TCPRoutesPage as TCPRoutesPage_v1alpha2 } from "./pages/gateway-api/tcp-routes-page-v1alpha2";
import { TLSRoutesPage as TLSRoutesPage_v1alpha2 } from "./pages/gateway-api/tls-routes-page-v1alpha2";
import { UDPRoutesPage as UDPRoutesPage_v1alpha2 } from "./pages/gateway-api/udp-routes-page-v1alpha2";

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
      kind: TLSRoute_v1alpha2.kind,
      apiVersions: TLSRoute_v1alpha2.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<any>) => <TLSRouteDetails_v1alpha2 {...props} />,
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
      kind: BackendLBPolicy_v1alpha2.kind,
      apiVersions: BackendLBPolicy_v1alpha2.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<any>) => (
          <BackendLBPolicyDetails_v1alpha2 {...props} />
        ),
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
          { kubeObjectClass: TLSRoute_v1alpha2, PageComponent: TLSRoutesPage_v1alpha2, version: "v1alpha2" },
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
          {
            kubeObjectClass: ReferenceGrant_v1beta1,
            PageComponent: ReferenceGrantsPage_v1beta1,
            version: "v1beta1",
          },
        ]),
      },
    },
    {
      id: "backendlbpolicy",
      components: {
        Page: createAvailableVersionPage("Backend LB Policies", [
          {
            kubeObjectClass: BackendLBPolicy_v1alpha2,
            PageComponent: BackendLBPoliciesPage_v1alpha2,
            version: "v1alpha2",
          },
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
  ];

  clusterPageMenus = [
    {
      id: "gateway-api",
      title: "Gateway API",
      target: { pageId: "gateway" },
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
    { id: "gateway", parentId: "gateway-api", title: "Gateways", target: { pageId: "gateway" }, components: {} },
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
      id: "backendlbpolicy",
      parentId: "gateway-api",
      title: "Backend LB Policies",
      target: { pageId: "backendlbpolicy" },
      components: {},
    },
    {
      id: "backendtlspolicy",
      parentId: "gateway-api",
      title: "Backend TLS Policies",
      target: { pageId: "backendtlspolicy" },
      components: {},
    },
  ];
}
