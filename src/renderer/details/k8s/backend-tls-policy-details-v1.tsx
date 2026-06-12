import { Renderer } from "@freelensapp/extensions";
import { BackendTLSPolicy } from "../../api/k8s";
import { observer } from "../../observer";
import { createHash } from "../../utils";
import styles from "./common.module.scss";
import stylesInline from "./common.module.scss?inline";

const {
  Component: { BadgeBoolean, DrawerItem, DrawerTitle, LinkToObject, Table, TableCell, TableHead, TableRow },
} = Renderer;

function isAccepted(object: BackendTLSPolicy): boolean {
  const ancestors = object.status?.conditions ?? [];

  return ancestors.some((ancestor) =>
    (ancestor.conditions ?? []).some((condition) => condition.type === "Accepted" && condition.status === "True"),
  );
}

function getHostname(object: BackendTLSPolicy): string {
  return object.spec?.validation?.hostname ?? "-";
}

export const BackendTLSPolicyDetails = observer(
  (props: Renderer.Component.KubeObjectDetailsProps<BackendTLSPolicy>) => {
    const { object } = props;
    const targetRefs = object.spec?.targetRefs ?? [];
    const caCertRefs = object.spec?.validation?.caCertificateRefs ?? [];

    return (
      <>
        <style>{stylesInline}</style>
        <div className={styles.details}>
          <DrawerItem name="Hostname">{getHostname(object)}</DrawerItem>
          <DrawerItem name="Accepted">
            <BadgeBoolean value={isAccepted(object)} />
          </DrawerItem>

          <DrawerTitle>Target Refs</DrawerTitle>
          {targetRefs.length > 0 ? (
            <Table selectable tableId="backendTLSPolicyTargetRefs" scrollable={false} sortSyncWithUrl={false}>
              <TableHead flat sticky={false}>
                <TableCell>Group</TableCell>
                <TableCell>Kind</TableCell>
                <TableCell>Section Name</TableCell>
                <TableCell>Name</TableCell>
              </TableHead>
              {targetRefs.map((targetRef) => {
                const key = createHash(targetRef);

                return (
                  <TableRow key={key} nowrap>
                    <TableCell>{targetRef.group || "-"}</TableCell>
                    <TableCell>{targetRef.kind}</TableCell>
                    <TableCell>{targetRef.sectionName ?? "-"}</TableCell>
                    <TableCell>
                      <LinkToObject objectRef={targetRef} object={object}>
                        {targetRef.name}
                      </LinkToObject>
                    </TableCell>
                  </TableRow>
                );
              })}
            </Table>
          ) : (
            <DrawerItem name="Target Refs">-</DrawerItem>
          )}

          <DrawerTitle>CA Cert Refs</DrawerTitle>
          {caCertRefs.length > 0 ? (
            <Table selectable tableId="backendTLSPolicyCaCertRefs" scrollable={false} sortSyncWithUrl={false}>
              <TableHead flat sticky={false}>
                <TableCell>Group</TableCell>
                <TableCell>Kind</TableCell>
                <TableCell>Name</TableCell>
              </TableHead>
              {caCertRefs.map((caCertRef) => {
                const key = createHash(caCertRef);

                return (
                  <TableRow key={key} nowrap>
                    <TableCell>{caCertRef.group || "-"}</TableCell>
                    <TableCell>{caCertRef.kind}</TableCell>
                    <TableCell>
                      <LinkToObject objectRef={caCertRef} object={object}>
                        {caCertRef.name}
                      </LinkToObject>
                    </TableCell>
                  </TableRow>
                );
              })}
            </Table>
          ) : (
            <DrawerItem name="CA Cert Refs">-</DrawerItem>
          )}
        </div>
      </>
    );
  },
);
