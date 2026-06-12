import { Renderer } from "@freelensapp/extensions";
import { ListenerSet } from "../../api/k8s";
import { observer } from "../../observer";
import styles from "./common.module.scss";
import stylesInline from "./common.module.scss?inline";

import type { ListenerEntryStatus } from "../../api/k8s/listenerset-v1";

const {
  Component: {
    BadgeBoolean,
    DrawerItem,
    DrawerItemLabels,
    DrawerTitle,
    Icon,
    LinkToObject,
    LinkToSecret,
    Table,
    TableCell,
    TableHead,
    TableRow,
  },
} = Renderer;

function isAccepted(object: ListenerSet): boolean {
  return (object.status?.conditions ?? []).some(
    (condition) => condition.type === "Accepted" && condition.status === "True",
  );
}

function isProgrammed(object: ListenerSet): boolean {
  return (object.status?.conditions ?? []).some(
    (condition) => condition.type === "Programmed" && condition.status === "True",
  );
}

function formatCondition(condition: { type?: string; status?: string }): string {
  return `${condition.type ?? "Unknown"}: ${condition.status ?? "Unknown"}`;
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

export const ListenerSetDetails = observer((props: Renderer.Component.KubeObjectDetailsProps<ListenerSet>) => {
  const { object } = props;
  const objectNs = object.getNs();
  const parentRef = object.spec?.parentRef;
  const listeners = object.spec?.listeners ?? [];
  const statusListeners = (object.status?.listeners ?? []) as ListenerEntryStatus[];

  const parentRefObj = parentRef
    ? {
        apiVersion: "gateway.networking.k8s.io/v1",
        kind: parentRef.kind ?? "Gateway",
        name: parentRef.name,
        namespace: parentRef.namespace ?? objectNs,
      }
    : undefined;

  return (
    <>
      <style>{stylesInline}</style>
      <div className={styles.details}>
        <DrawerItem name="Accepted">
          <BadgeBoolean value={isAccepted(object)} />
        </DrawerItem>
        <DrawerItem name="Programmed">
          <BadgeBoolean value={isProgrammed(object)} />
        </DrawerItem>

        <DrawerTitle>Parent Reference</DrawerTitle>
        {parentRef ? (
          <Table selectable tableId="listenerSetParentRef" scrollable={false} sortSyncWithUrl={false}>
            <TableHead flat sticky={false}>
              <TableCell>Group</TableCell>
              <TableCell>Kind</TableCell>
              <TableCell>Name</TableCell>
            </TableHead>
            <TableRow nowrap>
              <TableCell>{parentRef.group ?? "gateway.networking.k8s.io"}</TableCell>
              <TableCell>{parentRef.kind ?? "Gateway"}</TableCell>
              <TableCell>
                <LinkToObject object={object} objectRef={parentRefObj} />
              </TableCell>
            </TableRow>
          </Table>
        ) : (
          <DrawerItem name="Parent Reference">-</DrawerItem>
        )}

        {listeners.length > 0 && (
          <>
            <DrawerTitle>Listeners</DrawerTitle>
            {listeners.map((listener) => (
              <div key={listener.name}>
                <div className={styles.title}>
                  <Icon small material="list" />
                  <span>{listener.name}</span>
                </div>
                <DrawerItem name="Listener">{`${listener.protocol}:${listener.port} ${listener.hostname ?? "*"}`}</DrawerItem>
                <DrawerItem name="TLS Mode" hidden={!listener.tls}>
                  {listener.tls?.mode ?? "Terminate"}
                </DrawerItem>
                <DrawerItem name="TLS Certs" hidden={!listener.tls?.certificateRefs?.length}>
                  {listener.tls?.certificateRefs?.map((certificateRef) => (
                    <LinkToSecret
                      key={`${certificateRef.name}-${certificateRef.namespace ?? objectNs}`}
                      name={certificateRef.name}
                      namespace={certificateRef.namespace ?? objectNs}
                    />
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
                <DrawerItem name="Allowed Route Kinds" hidden={!listener.allowedRoutes?.kinds}>
                  {formatGroupKinds(listener.allowedRoutes?.kinds)}
                </DrawerItem>
              </div>
            ))}
          </>
        )}

        {statusListeners.length > 0 && (
          <>
            <DrawerTitle>Status Listeners</DrawerTitle>
            {statusListeners.map((listenerStatus) => (
              <div key={`listener-status-${listenerStatus.name}`}>
                <div className={styles.title}>
                  <Icon small material="list" />
                  <span>{listenerStatus.name}</span>
                </div>
                <DrawerItem name="Attached Routes">{listenerStatus.attachedRoutes}</DrawerItem>
                <DrawerItem name="Supported Kinds">{formatGroupKinds(listenerStatus.supportedKinds)}</DrawerItem>
                <DrawerItem name="Conditions">
                  {listenerStatus.conditions?.length
                    ? listenerStatus.conditions.map((condition) => formatCondition(condition)).join(", ")
                    : "-"}
                </DrawerItem>
              </div>
            ))}
          </>
        )}
      </div>
    </>
  );
});
