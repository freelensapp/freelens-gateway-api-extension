import { Renderer } from "@freelensapp/extensions";
import { XBackendTrafficPolicy } from "../../api/x-k8s";
import { observer } from "../../observer";
import { createHash } from "../../utils";
import styles from "./common.module.scss";
import stylesInline from "./common.module.scss?inline";

const {
  Component: { DrawerItem, DrawerTitle, LinkToObject, Table, TableCell, TableHead, TableRow },
} = Renderer;

export const XBackendTrafficPolicyDetails = observer(
  (props: Renderer.Component.KubeObjectDetailsProps<XBackendTrafficPolicy>) => {
    const { object } = props;
    const targetRefs = object.spec?.targetRefs ?? [];
    const retryConstraint = object.spec?.retryConstraint;
    const sessionPersistence = object.spec?.sessionPersistence;

    return (
      <>
        <style>{stylesInline}</style>
        <div className={styles.details}>
          <DrawerTitle>Target Refs</DrawerTitle>
          {targetRefs.length > 0 ? (
            <Table selectable tableId="xBackendTrafficPolicyTargetRefs" scrollable={false} sortSyncWithUrl={false}>
              <TableHead flat sticky={false}>
                <TableCell>Group</TableCell>
                <TableCell>Kind</TableCell>
                <TableCell>Name</TableCell>
              </TableHead>
              {targetRefs.map((targetRef) => {
                const key = createHash(targetRef);

                return (
                  <TableRow key={key} nowrap>
                    <TableCell>{targetRef.group || "-"}</TableCell>
                    <TableCell>{targetRef.kind}</TableCell>
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

          {retryConstraint && (
            <>
              <DrawerTitle>Retry Constraint</DrawerTitle>
              {retryConstraint.budget && (
                <>
                  <DrawerItem name="Budget Percent">{retryConstraint.budget.percent ?? 20}</DrawerItem>
                  <DrawerItem name="Budget Interval">{retryConstraint.budget.interval ?? "10s"}</DrawerItem>
                </>
              )}
              {retryConstraint.minRetryRate && (
                <>
                  <DrawerItem name="Min Retry Rate Count">{retryConstraint.minRetryRate.count ?? 10}</DrawerItem>
                  <DrawerItem name="Min Retry Rate Interval">
                    {retryConstraint.minRetryRate.interval ?? "1s"}
                  </DrawerItem>
                </>
              )}
            </>
          )}

          {sessionPersistence && (
            <>
              <DrawerTitle>Session Persistence</DrawerTitle>
              <DrawerItem name="Session Name" hidden={!sessionPersistence.sessionName}>
                {sessionPersistence.sessionName ?? "-"}
              </DrawerItem>
              <DrawerItem name="Type">{sessionPersistence.type ?? "Cookie"}</DrawerItem>
              <DrawerItem name="Absolute Timeout" hidden={!sessionPersistence.absoluteTimeout}>
                {sessionPersistence.absoluteTimeout ?? "-"}
              </DrawerItem>
              {sessionPersistence.cookieConfig && (
                <DrawerItem name="Cookie Lifetime Type">
                  {sessionPersistence.cookieConfig.lifetimeType ?? "Session"}
                </DrawerItem>
              )}
            </>
          )}
        </div>
      </>
    );
  },
);
