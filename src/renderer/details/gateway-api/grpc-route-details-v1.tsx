import { Renderer } from "@freelensapp/extensions";
import crypto from "crypto";
import { GRPCRoute } from "../../k8s/gateway-api";
import { observer } from "../../observer";
import styles from "./common.module.scss";
import stylesInline from "./common.module.scss?inline";

const {
  Component: { BadgeBoolean, DrawerItem, DrawerTitle, LinkToObject, Icon, Table, TableCell, TableHead, TableRow },
} = Renderer;

function routeRef(namespace: string | undefined, kind: string, name: string) {
  return {
    apiVersion: "gateway.networking.k8s.io/v1",
    kind,
    name,
    namespace,
  };
}

function isAccepted(object: GRPCRoute): boolean {
  return (object.status?.parents ?? []).some((parent) =>
    (parent?.conditions ?? []).some((condition) => condition?.type === "Accepted" && condition?.status === "True"),
  );
}

export const GRPCRouteDetails = observer((props: Renderer.Component.KubeObjectDetailsProps<GRPCRoute>) => {
  const { object } = props;
  const objectNs = object.getNs();

  const hostnames = object.spec?.hostnames ?? [];
  const parentRefs = object.spec?.parentRefs ?? [];
  const rules = object.spec?.rules ?? [];
  const accepted = isAccepted(object);

  return (
    <>
      <style>{stylesInline}</style>
      <div className={styles.details}>
        {hostnames.length > 0 && <DrawerItem name="Hostnames">{hostnames.join(", ") || "*"}</DrawerItem>}
        <DrawerItem name="Accepted">
          <BadgeBoolean value={accepted} />
        </DrawerItem>

        <DrawerTitle>Parent References</DrawerTitle>
        {parentRefs.map((parentRef) => {
          const namespace = parentRef.namespace || objectNs;
          const kind = parentRef.kind ?? "Gateway";
          const key = crypto.createHash("sha256").update(JSON.stringify(parentRefs)).digest("hex").substring(0, 16);

          return (
            <DrawerItem key={key}>
              <LinkToObject object={object} objectRef={routeRef(namespace, kind, parentRef.name)} />
            </DrawerItem>
          );
        })}
        {parentRefs.length === 0 ? <DrawerItem name="Parent References">-</DrawerItem> : null}

        {rules.length > 0 && (
          <>
            <DrawerTitle>Rules</DrawerTitle>
            {rules.map((rule, index) => {
              const key = crypto.createHash("sha256").update(JSON.stringify(rule)).digest("hex").substring(0, 16);
              return (
                <div key={key}>
                  <div className={styles.title}>
                    <Icon small material="list" />
                    <span>Rule {index + 1}</span>
                    {rule.name && <span style={{ color: "var(--textColorSecondary)" }}>({rule.name})</span>}
                  </div>

                  {rule.matches && rule.matches.length > 0 && (
                    <DrawerItem name="Matches">
                      {rule.matches.map((match) => {
                        const key = crypto
                          .createHash("sha256")
                          .update(JSON.stringify(match))
                          .digest("hex")
                          .substring(0, 16);

                        return (
                          <div key={key} style={{ marginBottom: "10px" }}>
                            {match.method && (
                              <>
                                <DrawerItem name="Method Type" key={`${key}-type`}>
                                  {match.method.type ?? "Exact"}
                                </DrawerItem>
                                {match.method.service && (
                                  <DrawerItem name="Service" key={`${key}-service`}>
                                    {match.method.service}
                                  </DrawerItem>
                                )}
                                {match.method.method && (
                                  <DrawerItem name="Method" key={`${key}-method`}>
                                    {match.method.method}
                                  </DrawerItem>
                                )}
                              </>
                            )}
                            {match.headers && match.headers.length > 0 && (
                              <DrawerItem name="Headers" key={`${key}-headers`}>
                                {JSON.stringify(match.headers)}
                              </DrawerItem>
                            )}
                          </div>
                        );
                      })}
                    </DrawerItem>
                  )}

                  {rule.filters && rule.filters.length > 0 && (
                    <DrawerItem name="Filters">
                      {rule.filters.map((filter) => {
                        const key = crypto
                          .createHash("sha256")
                          .update(JSON.stringify(filter))
                          .digest("hex")
                          .substring(0, 16);
                        return <div key={key}>{filter.type}</div>;
                      })}
                    </DrawerItem>
                  )}

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
                          const key = crypto
                            .createHash("sha256")
                            .update(JSON.stringify(backend))
                            .digest("hex")
                            .substring(0, 16);

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
