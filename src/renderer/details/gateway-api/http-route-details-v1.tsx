import { Renderer } from "@freelensapp/extensions";
import { HTTPRoute } from "../../k8s/gateway-api";
import { observer } from "../../observer";
import { createHash } from "../../utils";
import styles from "./common.module.scss";
import stylesInline from "./common.module.scss?inline";

const {
  Component: { BadgeBoolean, DrawerItem, DrawerTitle, LinkToObject, Icon, Table, TableCell, TableHead, TableRow },
} = Renderer;

function isAccepted(object: HTTPRoute): boolean {
  return (object.status?.parents ?? []).some((parent) =>
    (parent?.conditions ?? []).some((condition) => condition?.type === "Accepted" && condition?.status === "True"),
  );
}

export const HTTPRouteDetails = observer((props: Renderer.Component.KubeObjectDetailsProps<HTTPRoute>) => {
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

                  {rule.matches && rule.matches.length > 0 && (
                    <DrawerItem name="Matches">
                      {rule.matches.map((match) => {
                        const key = createHash(match);

                        return (
                          <>
                            <DrawerItem name="Type" key={key}>
                              {match.path?.type ?? "PathPrefix"}
                            </DrawerItem>
                            <DrawerItem name="Path" key={key}>
                              {match.path?.value ?? "/"}
                            </DrawerItem>
                            <DrawerItem name="Method" key={key} hidden={!match.method}>
                              {match.method}
                            </DrawerItem>
                            <DrawerItem name="Headers" key={key} hidden={!match.headers}>
                              {match.headers &&
                                match.headers?.length > 0 &&
                                match.headers.map((h) => `${h.name}=${h.value} (${h.type ?? "Exact"})`).join(", ")}
                            </DrawerItem>
                            <DrawerItem name="Query Params" key={key} hidden={!match.queryParams}>
                              {match.queryParams &&
                                match.queryParams?.length > 0 &&
                                match.queryParams.map((q) => `${q.name}=${q.value} (${q.type ?? "Exact"})`).join(", ")}
                            </DrawerItem>
                          </>
                        );
                      })}
                    </DrawerItem>
                  )}

                  {rule.filters && rule.filters.length > 0 && (
                    <DrawerItem name="Filters">
                      {rule.filters.map((filter) => {
                        const key = createHash(filter);
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
