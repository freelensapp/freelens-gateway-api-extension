import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import { formatCondition } from "../../api/k8s/types";
import { XBackend } from "../../api/x-k8s";
import { formatBackendPort, isBackendAccepted } from "../../api/x-k8s/xbackend-v1alpha1";
import { BackendTLSValidation } from "../k8s/backend-tls-validation";
import { ReferenceLink } from "../k8s/reference-link";
import { gatewayApiGroup } from "../k8s/references";
import styles from "./common.module.scss";

const {
  Component: { BadgeBoolean, DrawerItem, DrawerTitle, Icon },
  Util: { createReactKey },
} = Renderer;

export const XBackendDetails = observer((props: Renderer.Component.KubeObjectDetailsProps<XBackend>) => {
  const { object } = props;
  const objectNs = object.getNs();
  const tls = object.spec?.tls;
  const parents = object.status?.parents ?? [];

  return (
    <div className={styles.details}>
      <DrawerItem name="Type">{object.spec?.type ?? "-"}</DrawerItem>
      <DrawerItem name="Accepted">
        <BadgeBoolean value={isBackendAccepted(object.status)} />
      </DrawerItem>
      <DrawerItem name="Hostname" hidden={!object.spec?.externalHostname}>
        {object.spec?.externalHostname?.hostname ?? "-"}
      </DrawerItem>
      <DrawerItem name="Port">{formatBackendPort(object.spec?.port)}</DrawerItem>
      <DrawerItem name="Protocol">{object.spec?.protocol ?? "-"}</DrawerItem>

      {tls && (
        <>
          <DrawerTitle>TLS</DrawerTitle>
          <DrawerItem name="Mode">{tls.mode}</DrawerItem>
          <DrawerItem name="Client Certificate" hidden={!tls.clientCertificateRef}>
            {tls.clientCertificateRef && (
              <ReferenceLink
                object={object}
                group={tls.clientCertificateRef.group ?? ""}
                kind={tls.clientCertificateRef.kind ?? "Secret"}
                name={tls.clientCertificateRef.name}
                namespace={tls.clientCertificateRef.namespace ?? objectNs}
              />
            )}
          </DrawerItem>
          {tls.validation && <BackendTLSValidation object={object} validation={tls.validation} />}
        </>
      )}

      <DrawerTitle>Parents</DrawerTitle>
      {parents.length > 0 ? (
        parents.map((parent) => {
          const { parentRef } = parent;
          const group = parentRef.group ?? gatewayApiGroup;
          const kind = parentRef.kind ?? "Gateway";
          const conditions = parent.conditions ?? [];

          return (
            <div key={`${parent.controllerName}/${createReactKey(parentRef)}`}>
              <div className={styles.title}>
                <Icon small material="list" />
                <span>
                  {kind} {parentRef.name}
                </span>
              </div>
              <DrawerItem name="Controller Name">{parent.controllerName}</DrawerItem>
              <DrawerItem name="Parent">
                <ReferenceLink
                  object={object}
                  group={group}
                  kind={kind}
                  name={parentRef.name}
                  namespace={parentRef.namespace ?? objectNs}
                />
              </DrawerItem>
              <DrawerItem name="Group">{group || "-"}</DrawerItem>
              <DrawerItem name="Section Name" hidden={!parentRef.sectionName}>
                {parentRef.sectionName}
              </DrawerItem>
              <DrawerItem name="Port" hidden={parentRef.port === undefined}>
                {parentRef.port}
              </DrawerItem>
              <DrawerItem name="Conditions">
                {conditions.length > 0 ? conditions.map(formatCondition).join(", ") : "-"}
              </DrawerItem>
            </div>
          );
        })
      ) : (
        <DrawerItem name="Parents">-</DrawerItem>
      )}
    </div>
  );
});
