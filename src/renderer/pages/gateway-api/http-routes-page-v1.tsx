import { Renderer } from "@freelensapp/extensions";
import { withErrorPage } from "../../components/error-page";
import { HTTPRoute } from "../../k8s/gateway-api";
import { observer } from "../../observer";
import styles from "./http-routes-page-v1.module.scss";
import stylesInline from "./http-routes-page-v1.module.scss?inline";
import { type GatewayPageProps, namespaceCell } from "./shared";

const {
  Component: { BadgeBoolean, KubeObjectAge, KubeObjectListLayout, WithTooltip },
} = Renderer;

function getHostnames(item: HTTPRoute): string[] {
  return item.spec?.hostnames ?? [];
}

function isAccepted(item: HTTPRoute): boolean {
  return (
    item.status?.parents?.some((parent) =>
      parent.conditions?.some((condition) => condition.type === "Accepted" && condition.status === "True"),
    ) ?? false
  );
}

export const HTTPRoutesPage = observer((props: GatewayPageProps) =>
  withErrorPage(props, () => {
    const store = HTTPRoute.getStore<HTTPRoute>();

    return (
      <>
        <style>{stylesInline}</style>
        <KubeObjectListLayout<HTTPRoute, any>
          tableId={`${HTTPRoute.crd.plural}Table`}
          className={styles.page}
          store={store}
          sortingCallbacks={{
            name: (item: HTTPRoute) => item.getName(),
            namespace: (item: HTTPRoute) => item.getNs() ?? "",
            hostnames: (item: HTTPRoute) => getHostnames(item).join(","),
            accepted: (item: HTTPRoute) => String(isAccepted(item)),
            age: (item: HTTPRoute) => item.getCreationTimestamp(),
          }}
          searchFilters={[(item: HTTPRoute) => item.getSearchFields(), (item: HTTPRoute) => getHostnames(item)]}
          renderHeaderTitle={HTTPRoute.crd.title}
          renderTableHeader={[
            { title: "Name", sortBy: "name", className: styles.name },
            { title: "Namespace", sortBy: "namespace", className: styles.namespace },
            { title: "Hostnames", sortBy: "hostnames", className: styles.hostnames },
            { title: "Accepted", sortBy: "accepted", className: styles.accepted },
            { title: "Age", sortBy: "age", className: styles.age },
          ]}
          renderTableContents={(item: HTTPRoute) => [
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
