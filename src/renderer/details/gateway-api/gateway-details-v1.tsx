import { Renderer } from "@freelensapp/extensions";
import { Gateway } from "../../k8s/gateway-api";
import { observer } from "../../observer";
import styles from "./common.module.scss";
import stylesInline from "./common.module.scss?inline";

import type { GatewaySpecAddress, ListenerStatus } from "../../k8s/gateway-api/gateway-v1";

const {
  Component: { BadgeBoolean, DrawerItem, DrawerItemLabels, DrawerTitle, Icon, LinkToObject },
} = Renderer;

function isReady(object: Gateway): boolean {
  return typeof (object as any).isReady === "function"
    ? Boolean((object as any).isReady())
    : ((object as any).status?.conditions ?? []).some(
        (condition: any) => condition?.type === "Ready" && condition?.status === "True",
      );
}

function formatAddress(address: GatewaySpecAddress): string {
  const type = address.type ?? "IPAddress";
  const value = address.value ?? "-";

  return `${type}: ${value}`;
}

function formatSelector(selector: { matchLabels?: Record<string, string | undefined> } | undefined): string {
  if (!selector?.matchLabels || Object.keys(selector.matchLabels).length === 0) {
    return "-";
  }

  return Object.entries(selector.matchLabels)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}=${value}`)
    .join(", ");
}

function formatGroupKinds(kinds: Array<{ group?: string; kind: string }> | undefined): string {
  if (!kinds || kinds.length === 0) {
    return "-";
  }

  return kinds
    .map((entry) => {
      const group = entry.group ?? "gateway.networking.k8s.io";
      return `${group}/${entry.kind}`;
    })
    .join(", ");
}

function formatCondition(condition: { type?: string; status?: string }): string {
  return `${condition.type ?? "Unknown"}: ${condition.status ?? "Unknown"}`;
}

function routeRef(namespace: string | undefined, kind: string, name: string) {
  return {
    apiVersion: "gateway.networking.k8s.io/v1",
    kind,
    name,
    namespace,
  };
}

export const GatewayDetails = observer((props: Renderer.Component.KubeObjectDetailsProps<Gateway>) => {
  const { object } = props;
  const allowedListenerNamespaces = object.spec?.allowedListeners?.namespaces;
  const infrastructure = object.spec?.infrastructure;
  const frontendValidation = object.spec?.tls?.frontend?.default?.validation;
  const frontendPerPort = object.spec?.tls?.frontend?.perPort ?? [];
  const listenerStatuses = (object.status?.listeners ?? []) as ListenerStatus[];

  return (
    <>
      <style>{stylesInline}</style>
      <div className={styles.details}>
        <DrawerItem name="Gateway Class">
          <LinkToObject
            object={object}
            objectRef={routeRef(undefined, "GatewayClass", object.spec?.gatewayClassName ?? "")}
          />
        </DrawerItem>
        <DrawerItem name="Ready">
          <BadgeBoolean value={isReady(object)} />
        </DrawerItem>
        <DrawerItem name="Addresses">{}</DrawerItem>

        {object.spec.addresses && object.spec.addresses?.length > 0 && (
          <>
            <DrawerTitle>Spec Addresses</DrawerTitle>
            {object.spec.addresses?.map((address, index) => (
              <DrawerItem key={`spec-address-${index}`} name={`Address ${index + 1}`}>
                {formatAddress(address)}
              </DrawerItem>
            ))}
          </>
        )}

        <DrawerItem name="Default Scope" hidden={!object.spec.defaultScope}>
          {object.spec.defaultScope}
        </DrawerItem>

        {infrastructure && (
          <>
            <DrawerTitle>Infrastructure</DrawerTitle>
            <DrawerItemLabels name="Labels" labels={infrastructure.labels ?? {}} hidden={!infrastructure.labels} />
            <DrawerItemLabels
              name="Annotations"
              labels={infrastructure.annotations ?? {}}
              hidden={!infrastructure.annotations}
            />
            <DrawerItem name="Parameters Ref" hidden={!infrastructure.parametersRef}>
              {infrastructure.parametersRef
                ? `${infrastructure.parametersRef.group}/${infrastructure.parametersRef.kind}/${infrastructure.parametersRef.name}`
                : "-"}
            </DrawerItem>
          </>
        )}

        {(allowedListenerNamespaces || object.spec?.allowedListeners) && (
          <>
            <DrawerTitle>Allowed Listeners</DrawerTitle>
            <DrawerItem name="Namespaces From">{allowedListenerNamespaces?.from ?? "-"}</DrawerItem>
            <DrawerItem name="Namespaces Selector">{formatSelector(allowedListenerNamespaces?.selector)}</DrawerItem>
          </>
        )}

        {object.spec?.tls && (
          <>
            <DrawerTitle>TLS</DrawerTitle>
            <DrawerItem name="Backend Client Cert Ref" hidden={!object.spec.tls.backend?.clientCertificateRef}>
              {object.spec.tls.backend?.clientCertificateRef
                ? `${object.spec.tls.backend.clientCertificateRef.kind ?? "Secret"}/${object.spec.tls.backend.clientCertificateRef.name}`
                : "-"}
            </DrawerItem>
            <DrawerItem name="Frontend Validation Mode">{frontendValidation?.mode ?? "-"}</DrawerItem>
            <DrawerItem name="Frontend CA Cert Refs">
              {frontendValidation?.caCertificateRefs?.length
                ? frontendValidation.caCertificateRefs
                    .map((reference) => `${reference.kind ?? "Secret"}/${reference.name}`)
                    .join(", ")
                : "-"}
            </DrawerItem>
            {frontendPerPort.map((entry, index) => (
              <DrawerItem key={`frontend-port-${index}`} name={`Frontend Port ${entry.port}`}>
                {entry.tls.validation?.mode ?? "-"}
              </DrawerItem>
            ))}
          </>
        )}

        {object.spec.listeners && object.spec.listeners.length > 0 && (
          <>
            <DrawerTitle>Listeners</DrawerTitle>
            {object.spec.listeners.map((listener) => (
              <div key={listener.name}>
                <div className={styles.title}>
                  <Icon small material="list" /> <span>{listener.name}</span>
                </div>
                <DrawerItem name="Listener">{`${listener.protocol}:${listener.port} ${listener.hostname ?? "*"}`}</DrawerItem>
                <DrawerItem name="TLS Mode" hidden={!listener.tls?.mode}>
                  {listener.tls?.mode}
                </DrawerItem>
                <DrawerItem name="TLS Cert Refs" hidden={!listener.tls?.certificateRefs?.length}>
                  {listener.tls?.certificateRefs
                    ?.map((certificateRef) => `${certificateRef.kind ?? "Secret"}/${certificateRef.name}`)
                    .join(", ")}
                </DrawerItem>
                <DrawerItemLabels
                  name="TLS Options"
                  labels={listener.tls?.options ?? {}}
                  hidden={!listener.tls?.options}
                />
                <DrawerItem name="Allowed Routes Namespaces From" hidden={!listener.allowedRoutes?.namespaces?.from}>
                  {listener.allowedRoutes?.namespaces?.from ?? "-"}
                </DrawerItem>
                <DrawerItem name="Allowed Routes Selector" hidden={!listener.allowedRoutes?.namespaces?.selector}>
                  {formatSelector(listener.allowedRoutes?.namespaces?.selector)}
                </DrawerItem>
                <DrawerItem name="Allowed Route Kinds" hidden={!listener.allowedRoutes?.kinds}>
                  {formatGroupKinds(listener.allowedRoutes?.kinds)}
                </DrawerItem>
              </div>
            ))}
          </>
        )}

        <DrawerTitle>Status</DrawerTitle>
        <DrawerItem name="Attached Listener Sets" hidden={!object.status?.attachedListenerSets}>
          {object.status?.attachedListenerSets ?? "-"}
        </DrawerItem>
        {listenerStatuses &&
          listenerStatuses.map((listenerStatus, index) => (
            <div key={`listener-status-${listenerStatus.name}-${index}`}>
              <DrawerItem name={`Listener ${listenerStatus.name} Attached Routes`}>
                {listenerStatus.attachedRoutes}
              </DrawerItem>
              <DrawerItem name={`Listener ${listenerStatus.name} Supported Kinds`}>
                {formatGroupKinds(listenerStatus.supportedKinds)}
              </DrawerItem>
              <DrawerItem name={`Listener ${listenerStatus.name} Conditions`}>
                {listenerStatus.conditions?.length
                  ? listenerStatus.conditions.map((condition) => formatCondition(condition)).join(", ")
                  : "-"}
              </DrawerItem>
            </div>
          ))}
      </div>
    </>
  );
});
