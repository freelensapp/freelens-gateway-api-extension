/**
 * Copyright (c) Freelens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import { Renderer } from "@freelensapp/extensions";
import { createAvailableVersionPage } from "./components/available-version";
import {
  BackendLBPolicyDetails,
  BackendTLSPolicyDetails,
  GatewayClassDetails,
  GatewayDetails,
  GRPCRouteDetails,
  HTTPRouteDetails,
  ReferenceGrantDetails,
  TCPRouteDetails,
  TLSRouteDetails,
  UDPRouteDetails,
} from "./details/gateway-api";
import { GatewayApiIcon } from "./icons";
import {
  BackendLBPolicy,
  BackendTLSPolicy,
  Gateway,
  GatewayClass,
  GRPCRoute,
  HTTPRoute,
  ReferenceGrant,
  TCPRoute,
  TLSRoute,
  UDPRoute,
} from "./k8s/gateway-api";
import {
  BackendLBPoliciesPage,
  BackendTLSPoliciesPage,
  GatewayClassesPage,
  GatewaysPage,
  GRPCRoutesPage,
  HTTPRoutesPage,
  ReferenceGrantsPage,
  TCPRoutesPage,
  TLSRoutesPage,
  UDPRoutesPage,
} from "./pages/gateway-api";

export default class GatewayApiRenderer extends Renderer.LensExtension {
  async onActivate() {}

  kubeObjectDetailItems = [
    {
      kind: GatewayClass.kind,
      apiVersions: GatewayClass.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<any>) => <GatewayClassDetails {...props} />,
      },
    },
    {
      kind: Gateway.kind,
      apiVersions: Gateway.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<any>) => <GatewayDetails {...props} />,
      },
    },
    {
      kind: HTTPRoute.kind,
      apiVersions: HTTPRoute.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<any>) => <HTTPRouteDetails {...props} />,
      },
    },
    {
      kind: GRPCRoute.kind,
      apiVersions: GRPCRoute.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<any>) => <GRPCRouteDetails {...props} />,
      },
    },
    {
      kind: TCPRoute.kind,
      apiVersions: TCPRoute.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<any>) => <TCPRouteDetails {...props} />,
      },
    },
    {
      kind: TLSRoute.kind,
      apiVersions: TLSRoute.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<any>) => <TLSRouteDetails {...props} />,
      },
    },
    {
      kind: UDPRoute.kind,
      apiVersions: UDPRoute.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<any>) => <UDPRouteDetails {...props} />,
      },
    },
    {
      kind: ReferenceGrant.kind,
      apiVersions: ReferenceGrant.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<any>) => <ReferenceGrantDetails {...props} />,
      },
    },
    {
      kind: BackendLBPolicy.kind,
      apiVersions: BackendLBPolicy.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<any>) => <BackendLBPolicyDetails {...props} />,
      },
    },
    {
      kind: BackendTLSPolicy.kind,
      apiVersions: BackendTLSPolicy.crd.apiVersions,
      priority: 10,
      components: {
        Details: (props: Renderer.Component.KubeObjectDetailsProps<any>) => <BackendTLSPolicyDetails {...props} />,
      },
    },
  ];

  clusterPages = [
    {
      id: "gatewayclass",
      components: {
        Page: createAvailableVersionPage("Gateway Classes", [
          { kubeObjectClass: GatewayClass, PageComponent: GatewayClassesPage, version: "v1" },
        ]),
      },
    },
    {
      id: "gateway",
      components: {
        Page: createAvailableVersionPage("Gateways", [
          { kubeObjectClass: Gateway, PageComponent: GatewaysPage, version: "v1" },
        ]),
      },
    },
    {
      id: "httproute",
      components: {
        Page: createAvailableVersionPage("HTTP Routes", [
          { kubeObjectClass: HTTPRoute, PageComponent: HTTPRoutesPage, version: "v1" },
        ]),
      },
    },
    {
      id: "grpcroute",
      components: {
        Page: createAvailableVersionPage("gRPC Routes", [
          { kubeObjectClass: GRPCRoute, PageComponent: GRPCRoutesPage, version: "v1" },
        ]),
      },
    },
    {
      id: "tcproute",
      components: {
        Page: createAvailableVersionPage("TCP Routes", [
          { kubeObjectClass: TCPRoute, PageComponent: TCPRoutesPage, version: "v1alpha2" },
        ]),
      },
    },
    {
      id: "tlsroute",
      components: {
        Page: createAvailableVersionPage("TLS Routes", [
          { kubeObjectClass: TLSRoute, PageComponent: TLSRoutesPage, version: "v1alpha2" },
        ]),
      },
    },
    {
      id: "udproute",
      components: {
        Page: createAvailableVersionPage("UDP Routes", [
          { kubeObjectClass: UDPRoute, PageComponent: UDPRoutesPage, version: "v1alpha2" },
        ]),
      },
    },
    {
      id: "referencegrant",
      components: {
        Page: createAvailableVersionPage("Reference Grants", [
          { kubeObjectClass: ReferenceGrant, PageComponent: ReferenceGrantsPage, version: "v1beta1" },
        ]),
      },
    },
    {
      id: "backendlbpolicy",
      components: {
        Page: createAvailableVersionPage("Backend LB Policies", [
          { kubeObjectClass: BackendLBPolicy, PageComponent: BackendLBPoliciesPage, version: "v1alpha2" },
        ]),
      },
    },
    {
      id: "backendtlspolicy",
      components: {
        Page: createAvailableVersionPage("Backend TLS Policies", [
          { kubeObjectClass: BackendTLSPolicy, PageComponent: BackendTLSPoliciesPage, version: "v1" },
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
