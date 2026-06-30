import { Renderer } from "@freelensapp/extensions";
import React from "react";
import { Gateway } from "../../api/k8s";
import {
  ClientSettingsPolicy,
  ClientSettingsPolicyApi,
  ProxySettingsPolicy,
  ProxySettingsPolicyApi,
  UpstreamSettingsPolicy,
  UpstreamSettingsPolicyApi,
} from "../../api/nginx";
import { observer } from "../../observer";
import styles from "./common.module.scss";
import stylesInline from "./common.module.scss?inline";

import type { GatewaySpecAddress, ListenerStatus } from "../../api/k8s/gateway-v1";
import type { ClientBody, ClientKeepAlive } from "../../api/nginx/client-settings-policy-v1alpha1";
import type { ProxyBuffering, ProxyTimeout } from "../../api/nginx/proxy-settings-policy-v1alpha1";
import type { UpstreamKeepAlive } from "../../api/nginx/upstream-settings-policy-v1alpha1";

const {
  Component: { BadgeBoolean, DrawerItem, DrawerItemLabels, DrawerTitle, Icon, LinkToObject, LinkToSecret },
} = Renderer;

function isAccepted(object: Gateway): boolean {
  return (object.status?.conditions ?? []).some(
    (condition) => condition?.type === "Accepted" && condition?.status === "True",
  );
}

function isProgrammed(object: Gateway): boolean {
  return (object.status?.conditions ?? []).some(
    (condition) => condition?.type === "Programmed" && condition?.status === "True",
  );
}

function useClientSettingsPolicies(object: Gateway): ClientSettingsPolicy[] {
  const [items, setItems] = React.useState<ClientSettingsPolicy[]>([]);

  React.useEffect(() => {
    const api = new ClientSettingsPolicyApi({ objectConstructor: ClientSettingsPolicy });

    api
      .list({ namespace: object.getNs() })
      .then((list) => {
        const filtered = (list ?? []).filter((policy) => {
          const targetRef = policy.spec?.targetRef;

          if (!targetRef) return false;

          const group = targetRef.group || "gateway.networking.k8s.io";

          return group === "gateway.networking.k8s.io" && targetRef.kind === "Gateway" && targetRef.name === object.getName();
        });

        setItems(filtered);
      })
      .catch(() => setItems([]));
  }, [object.getName(), object.getNs()]);

  return items;
}

function useProxySettingsPolicies(object: Gateway): ProxySettingsPolicy[] {
  const [items, setItems] = React.useState<ProxySettingsPolicy[]>([]);

  React.useEffect(() => {
    const api = new ProxySettingsPolicyApi({ objectConstructor: ProxySettingsPolicy });

    api
      .list({ namespace: object.getNs() })
      .then((list) => {
        const filtered = (list ?? []).filter((policy) => {
          const targetRefs = policy.spec?.targetRefs ?? [];

          return targetRefs.some((targetRef) => {
            const group = targetRef.group || "gateway.networking.k8s.io";

            return group === "gateway.networking.k8s.io" && targetRef.kind === "Gateway" && targetRef.name === object.getName();
          });
        });

        setItems(filtered);
      })
      .catch(() => setItems([]));
  }, [object.getName(), object.getNs()]);

  return items;
}

function useUpstreamSettingsPolicies(object: Gateway): UpstreamSettingsPolicy[] {
  const [items, setItems] = React.useState<UpstreamSettingsPolicy[]>([]);

  React.useEffect(() => {
    const api = new UpstreamSettingsPolicyApi({ objectConstructor: UpstreamSettingsPolicy });

    api
      .list({ namespace: object.getNs() })
      .then((list) => {
        const filtered = (list ?? []).filter((policy) => {
          const targetRefs = policy.spec?.targetRefs ?? [];

          return targetRefs.some((targetRef) => {
            const group = targetRef.group || "gateway.networking.k8s.io";

            return group === "gateway.networking.k8s.io" && targetRef.kind === "Gateway" && targetRef.name === object.getName();
          });
        });

        setItems(filtered);
      })
      .catch(() => setItems([]));
  }, [object.getName(), object.getNs()]);

  return items;
}

function renderClientBody(body: ClientBody | undefined) {
  if (!body) return null;

  return (
    <>
      <DrawerItem name="Body Max Size">{body.maxSize ?? "-"}</DrawerItem>
      <DrawerItem name="Body Timeout">{body.timeout ?? "-"}</DrawerItem>
    </>
  );
}

function renderClientKeepAlive(keepAlive: ClientKeepAlive | undefined) {
  if (!keepAlive) return null;

  return (
    <>
      <DrawerItem name="Keep-Alive Requests">{keepAlive.requests ?? "-"}</DrawerItem>
      <DrawerItem name="Keep-Alive Time">{keepAlive.time ?? "-"}</DrawerItem>
      <DrawerItem name="Keep-Alive Min Timeout">{keepAlive.minTimeout ?? "-"}</DrawerItem>
      {keepAlive.timeout && (
        <>
          <DrawerItem name="Keep-Alive Timeout Server">{keepAlive.timeout.server ?? "-"}</DrawerItem>
          <DrawerItem name="Keep-Alive Timeout Header">{keepAlive.timeout.header ?? "-"}</DrawerItem>
        </>
      )}
    </>
  );
}

function renderProxyBuffering(buffering: ProxyBuffering | undefined) {
  if (!buffering) return null;

  return (
    <>
      <DrawerItem name="Buffering Disabled">
        <BadgeBoolean value={buffering.disable ?? false} />
      </DrawerItem>
      <DrawerItem name="Buffer Size">{buffering.bufferSize ?? "-"}</DrawerItem>
      {buffering.buffers && (
        <>
          <DrawerItem name="Buffers Number">{buffering.buffers.number ?? "-"}</DrawerItem>
          <DrawerItem name="Buffers Size">{buffering.buffers.size ?? "-"}</DrawerItem>
        </>
      )}
      <DrawerItem name="Busy Buffers Size">{buffering.busyBuffersSize ?? "-"}</DrawerItem>
    </>
  );
}

function renderProxyTimeout(timeout: ProxyTimeout | undefined) {
  if (!timeout) return null;

  return (
    <>
      <DrawerItem name="Timeout Connect">{timeout.connect ?? "-"}</DrawerItem>
      <DrawerItem name="Timeout Read">{timeout.read ?? "-"}</DrawerItem>
      <DrawerItem name="Timeout Send">{timeout.send ?? "-"}</DrawerItem>
    </>
  );
}

function renderUpstreamKeepAlive(keepAlive: UpstreamKeepAlive | undefined) {
  if (!keepAlive) return null;

  return (
    <>
      <DrawerItem name="Keep-Alive Connections">{keepAlive.connections ?? "-"}</DrawerItem>
      <DrawerItem name="Keep-Alive Requests">{keepAlive.requests ?? "-"}</DrawerItem>
      <DrawerItem name="Keep-Alive Time">{keepAlive.time ?? "-"}</DrawerItem>
      <DrawerItem name="Keep-Alive Timeout">{keepAlive.timeout ?? "-"}</DrawerItem>
    </>
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
  const clientPolicies = useClientSettingsPolicies(object);
  const proxyPolicies = useProxySettingsPolicies(object);
  const upstreamPolicies = useUpstreamSettingsPolicies(object);

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
        <DrawerItem name="Accepted">
          <BadgeBoolean value={isAccepted(object)} />
        </DrawerItem>
        <DrawerItem name="Programmed">
          <BadgeBoolean value={isProgrammed(object)} />
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

        <DrawerItem name="Default Scope">{object.spec.defaultScope ?? "None"}</DrawerItem>

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
            <DrawerItem name="Backend Client Cert" hidden={!object.spec.tls.backend?.clientCertificateRef}>
              <LinkToSecret
                name={object.spec.tls.backend?.clientCertificateRef?.name}
                namespace={object.spec.tls.backend?.clientCertificateRef?.namespace ?? object.getNs()}
              />
            </DrawerItem>
            <DrawerItem name="Frontend Validation Mode">{frontendValidation?.mode ?? "-"}</DrawerItem>
            <DrawerItem name="Frontend CA Certs">
              {frontendValidation?.caCertificateRefs?.length
                ? frontendValidation.caCertificateRefs
                    .map((reference) => (
                      <DrawerItem name="" key={`${reference.kind}:${reference.name}:${reference.namespace}`}>
                        <LinkToObject objectRef={reference} object={object} />
                      </DrawerItem>
                    ))
                    .join(", ")
                : "-"}
            </DrawerItem>
            <DrawerItem name="Frontend Per Port TLS" hidden={frontendPerPort.length === 0}>
              {frontendPerPort.map((entry) => (
                <DrawerItem name={entry.port} key={`frontend-port-${entry.port}`}>
                  {entry.tls?.validation?.mode ?? "-"}:{" "}
                  {entry.tls?.validation?.caCertificateRefs?.map((reference) => (
                    <>
                      <LinkToObject objectRef={reference} object={object} />{" "}
                    </>
                  ))}
                </DrawerItem>
              ))}
            </DrawerItem>
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
                <DrawerItem name="TLS Mode" hidden={!listener.tls}>
                  {listener.tls?.mode ?? "Terminate"}
                </DrawerItem>
                <DrawerItem name="TLS Certs" hidden={!listener.tls?.certificateRefs?.length}>
                  {listener.tls?.certificateRefs?.map((certificateRef) => (
                    <LinkToSecret name={certificateRef.name} namespace={certificateRef.namespace ?? object.getNs()} />
                  ))}
                </DrawerItem>
                <DrawerItemLabels
                  name="TLS Options"
                  labels={listener.tls?.options ?? {}}
                  hidden={!listener.tls?.options}
                />
                <DrawerItem name="Allowed Routes Namespaces From">
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
          listenerStatuses.map((listenerStatus) => (
            <div key={`listener-status-${listenerStatus.name}`}>
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

        {clientPolicies.length > 0 && (
          <>
            {clientPolicies.map((policy) => (
              <div key={`csp-${policy.getName()}`}>
                <DrawerTitle>Client Settings Policy: {policy.getName()}</DrawerTitle>
                {renderClientBody(policy.spec?.body)}
                {renderClientKeepAlive(policy.spec?.keepAlive)}
              </div>
            ))}
          </>
        )}

        {proxyPolicies.length > 0 && (
          <>
            {proxyPolicies.map((policy) => (
              <div key={`psp-${policy.getName()}`}>
                <DrawerTitle>Proxy Settings Policy: {policy.getName()}</DrawerTitle>
                {renderProxyBuffering(policy.spec?.buffering)}
                {renderProxyTimeout(policy.spec?.timeout)}
              </div>
            ))}
          </>
        )}

        {upstreamPolicies.length > 0 && (
          <>
            {upstreamPolicies.map((policy) => (
              <div key={`usp-${policy.getName()}`}>
                <DrawerTitle>Upstream Settings Policy: {policy.getName()}</DrawerTitle>
                <DrawerItem name="Zone Size">{policy.spec?.zoneSize ?? "-"}</DrawerItem>
                <DrawerItem name="Load Balancing Method">{policy.spec?.loadBalancingMethod ?? "-"}</DrawerItem>
                <DrawerItem name="Hash Method Key">{policy.spec?.hashMethodKey ?? "-"}</DrawerItem>
                {renderUpstreamKeepAlive(policy.spec?.keepAlive)}
              </div>
            ))}
          </>
        )}
      </div>
    </>
  );
});
