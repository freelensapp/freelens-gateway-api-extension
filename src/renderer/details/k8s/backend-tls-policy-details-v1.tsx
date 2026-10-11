import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import { BackendTLSPolicy } from "../../api/k8s";
import { BackendTLSValidation } from "./backend-tls-validation";
import styles from "./common.module.scss";

const {
  Component: { BadgeBoolean, DrawerItem, DrawerTitle, LinkToObject, Table, TableCell, TableHead, TableRow },
  Util: { createReactKey },
} = Renderer;

function isAccepted(object: BackendTLSPolicy): boolean {
  const ancestors = object.status?.conditions ?? [];

  return ancestors.some((ancestor) =>
    (ancestor.conditions ?? []).some((condition) => condition.type === "Accepted" && condition.status === "True"),
  );
}

export const BackendTLSPolicyDetails = observer(
  (props: Renderer.Component.KubeObjectDetailsProps<BackendTLSPolicy>) => {
    const { object } = props;
    const targetRefs = object.spec?.targetRefs ?? [];

    return (
      <div className={styles.details}>
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
              const key = createReactKey(targetRef);

              return (
                <TableRow key={key} nowrap>
                  <TableCell>{targetRef.group || "-"}</TableCell>
                  <TableCell>{targetRef.kind}</TableCell>
                  <TableCell>{targetRef.sectionName ?? "-"}</TableCell>
                  <TableCell>
                    <LinkToObject objectRef={targetRef} object={object} />
                  </TableCell>
                </TableRow>
              );
            })}
          </Table>
        ) : (
          <DrawerItem name="Target Refs">-</DrawerItem>
        )}

        <BackendTLSValidation object={object} validation={object.spec?.validation} />
      </div>
    );
  },
);
