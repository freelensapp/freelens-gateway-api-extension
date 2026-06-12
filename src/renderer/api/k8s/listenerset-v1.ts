import { Renderer } from "@freelensapp/extensions";
import { type AllowedRoutes, type ListenerTLSConfig, type ProtocolType, type RouteGroupKind } from "./gateway-v1";
import { type GatewayKubeObjectCRD } from "./types";

import type { Condition } from "@freelensapp/kube-object";

export interface ParentGatewayReference {
  /** default: `"gateway.networking.k8s.io"` */
  group?: string;
  /** default: `"Gateway"` */
  kind?: string;
  name: string;
  namespace?: string;
}

export interface ListenerEntry {
  name?: string;
  hostname?: string;
  port?: number;
  protocol: ProtocolType;
  tls?: ListenerTLSConfig;
  allowedRoutes?: AllowedRoutes;
}

export interface ListenerSetSpec {
  parentRef?: ParentGatewayReference;
  listeners: ListenerEntry[];
}

export interface ListenerEntryStatus {
  name: string;
  supportedKinds?: RouteGroupKind[];
  attachedRoutes: number;
  conditions?: Condition[];
}

export interface ListenerSetStatus {
  conditions?: Condition[];
  listeners?: ListenerEntryStatus[];
}

export class ListenerSet extends Renderer.K8sApi.LensExtensionKubeObject<
  Renderer.K8sApi.KubeObjectMetadata,
  ListenerSetStatus,
  ListenerSetSpec
> {
  static readonly kind = "ListenerSet";
  static readonly namespaced = true;
  static readonly apiBase = "/apis/gateway.networking.k8s.io/v1/listenersets";
  static readonly crd: GatewayKubeObjectCRD = {
    apiVersions: ["gateway.networking.k8s.io/v1"],
    plural: "listenersets",
    singular: "listenerset",
    shortNames: ["lset"],
    title: "Listener Sets",
  };
}

export class ListenerSetApi extends Renderer.K8sApi.KubeApi<ListenerSet> {}
export class ListenerSetStore extends Renderer.K8sApi.KubeObjectStore<ListenerSet, ListenerSetApi> {}
