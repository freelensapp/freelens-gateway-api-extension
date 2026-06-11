import { Renderer } from "@freelensapp/extensions";
import { UDPRoute } from "../../k8s/gateway-api";
import { observer } from "../../observer";
import { createHash } from "../../utils";
import styles from "./common.module.scss";
import stylesInline from "./common.module.scss?inline";

const {
  Component: { BadgeBoolean, DrawerItem, DrawerTitle, LinkToObject, Icon, Table, TableCell, TableHead, TableRow },
} = Renderer;

function isAccepted(object: UDPRoute): boolean {
  return (object.status?.parents ?? []).some((parent) =>
    (parent?.conditions ?? []).some((condition) => condition?.type === "Accepted" && condition?.status === "True"),
  );
}

export const UDPRouteDetails = observer((props: Renderer.Component.KubeObjectDetailsProps<UDPRoute>) => {
  const { object } = props;
  const objectNs = object.getNs();

  const parentRefs = object.spec?.parentRefs ?? [];
  const rules = object.spec?.rules ?? [];
  const accepted = isAccepted(object);

  return (
    <>
      <style>{stylesInline}</style>
      <div className={styles.details}>
        <DrawerItem name="Accepted">
          <BadgeBoolean value={accepted} />
        </DrawerItem>

        <DrawerTitle>Parent References</DrawerTitle>
        {parentRefs.length > 0 ? (
          <Table selectable tableId="parentRefs" scrollable={false} sortSyncWithUrl={false}>
            <TableHead flat sticky={false}>
              <TableCell>Group</TableCell>
              <TableCell>Kind</TableCell>
              <TableCell>Namespace</TableCell>
              <TableCell>Section Name</TableCell>
              <TableCell>Name</TableCell>
            </TableHead>
            {parentRefs.map((parentRef) => {
              const namespace = parentRef.namespace || objectNs;
              const kind = parentRef.kind ?? "Gateway";
              const key = createHash(parentRef);

              return (
                <TableRow key={key} nowrap>
                  <TableCell>{parentRef.group || "gateway.networking.k8s.io"}</TableCell>
                  <TableCell>{kind}</TableCell>
                  <TableCell>{namespace ?? "-"}</TableCell>
                  <TableCell>{parentRef.sectionName ?? "-"}</TableCell>
                  <TableCell>
                    <LinkToObject
                      object={object}
                      objectRef={{
                        apiVersion: "gateway.networking.k8s.io/v1",
                        kind,
                        name: parentRef.name,
                        namespace,
                      }}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </Table>
        ) : (
          <DrawerItem name="Parent References">-</DrawerItem>
        )}

        {rules.length > 0 && (
          <>
            <DrawerTitle>Rules</DrawerTitle>
            {rules.map((rule, index) => {
              const key = createHash(rule);
              return (
                <div key={key}>
                  <div className={styles.title}>
                    <Icon small material="list" />
                    <span>Rule {index + 1}</span>
                    {rule.name && <span style={{ color: "var(--textColorSecondary)" }}>({rule.name})</span>}
                  </div>

                  {rule.backendRefs && rule.backendRefs.length > 0 && (
                    <DrawerItem name="Backend References">
                      <Table selectable tableId="backendRefs" scrollable={false} sortSyncWithUrl={false}>
                        <TableHead flat sticky={false}>
                          <TableCell>Reference</TableCell>
                          <TableCell>Port</TableCell>
                          <TableCell>Weight</TableCell>
                        </TableHead>
                        {rule.backendRefs.map((backend) => {
                          const kind = backend.kind ?? "Service";
                          const namespace = backend.namespace || objectNs;
                          const key = createHash(backend);

                          return (
                            <TableRow key={key} nowrap>
                              <TableCell>
                                <LinkToObject
                                  object={object}
                                  objectRef={{
                                    apiVersion: "v1",
                                    kind,
                                    name: backend.name,
                                    namespace,
                                  }}
                                />
                              </TableCell>
                              <TableCell>{backend.port ?? "-"}</TableCell>
                              <TableCell>{backend.weight ?? "-"}</TableCell>
                            </TableRow>
                          );
                        })}
                      </Table>
                    </DrawerItem>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>
    </>
  );
});
