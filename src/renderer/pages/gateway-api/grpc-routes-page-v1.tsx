import { Renderer } from "@freelensapp/extensions";
import { withErrorPage } from "../../components/error-page";
import { GRPCRoute } from "../../k8s/gateway-api";
import { observer } from "../../observer";
import styles from "./grpc-routes-page-v1.module.scss";
import stylesInline from "./grpc-routes-page-v1.module.scss?inline";
import { type GatewayPageProps, namespaceCell } from "./shared";

const {
  Component: { BadgeBoolean, KubeObjectAge, KubeObjectListLayout, WithTooltip },
} = Renderer;

function getHostnames(item: GRPCRoute): string[] {
  return item.spec?.hostnames ?? [];
}

function isAccepted(item: GRPCRoute): boolean {
  return (
    item.status?.parents?.some((parent) =>
      parent.conditions?.some((condition) => condition.type === "Accepted" && condition.status === "True"),
    ) ?? false
  );
}

export const GRPCRoutesPage = observer((props: GatewayPageProps) =>
  withErrorPage(props, () => {
    const store = GRPCRoute.getStore<GRPCRoute>();

    return (
      <>
        <style>{stylesInline}</style>
        <KubeObjectListLayout<GRPCRoute, any>
          tableId={`${GRPCRoute.crd.plural}Table`}
          className={styles.page}
          store={store}
          sortingCallbacks={{
            name: (item: GRPCRoute) => item.getName(),
            namespace: (item: GRPCRoute) => item.getNs() ?? "",
            hostnames: (item: GRPCRoute) => getHostnames(item).join(","),
            accepted: (item: GRPCRoute) => String(isAccepted(item)),
            age: (item: GRPCRoute) => item.getCreationTimestamp(),
          }}
          searchFilters={[(item: GRPCRoute) => item.getSearchFields(), (item: GRPCRoute) => getHostnames(item)]}
          renderHeaderTitle={GRPCRoute.crd.title}
          renderTableHeader={[
            { title: "Name", sortBy: "name", className: styles.name },
            { title: "Namespace", sortBy: "namespace", className: styles.namespace },
            { title: "Hostnames", sortBy: "hostnames", className: styles.hostnames },
            { title: "Accepted", sortBy: "accepted", className: styles.accepted },
            { title: "Age", sortBy: "age", className: styles.age },
          ]}
          renderTableContents={(item: GRPCRoute) => [
            <WithTooltip>{item.getName()}</WithTooltip>,
            namespaceCell(item.getNs()),
            <WithTooltip>{getHostnames(item).join(", ") || "*"}</WithTooltip>,
            <BadgeBoolean value={isAccepted(item)} />,
            <KubeObjectAge object={item} key="age" />,
          ]}
        />
      </>
    );
  }),
);
