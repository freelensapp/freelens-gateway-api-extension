import { Renderer } from "@freelensapp/extensions";
import { TLSRoute } from "../../api/k8s";
import { withErrorPage } from "../../components/error-page";
import { observer } from "../../observer";
import { type GatewayPageProps, namespaceCell } from "./shared";
import styles from "./tls-routes-page-v1.module.scss";
import stylesInline from "./tls-routes-page-v1.module.scss?inline";

const {
  Component: { BadgeBoolean, KubeObjectAge, KubeObjectListLayout, WithTooltip },
} = Renderer;

function getHostnames(item: TLSRoute): string[] {
  return item.spec?.hostnames ?? [];
}

function isAccepted(item: TLSRoute): boolean {
  return (
    item.status?.parents?.some((parent) =>
      parent.conditions?.some((condition) => condition.type === "Accepted" && condition.status === "True"),
    ) ?? false
  );
}

export const TLSRoutesPage = observer((props: GatewayPageProps) =>
  withErrorPage(props, () => {
    const store = TLSRoute.getStore<TLSRoute>();

    return (
      <>
        <style>{stylesInline}</style>
        <KubeObjectListLayout<TLSRoute, any>
          tableId={`${TLSRoute.crd.plural}Table`}
          className={styles.page}
          store={store}
          sortingCallbacks={{
            name: (item: TLSRoute) => item.getName(),
            namespace: (item: TLSRoute) => item.getNs() ?? "",
            hostnames: (item: TLSRoute) => getHostnames(item).join(","),
            accepted: (item: TLSRoute) => String(isAccepted(item)),
            age: (item: TLSRoute) => item.getCreationTimestamp(),
          }}
          searchFilters={[(item: TLSRoute) => item.getSearchFields(), (item: TLSRoute) => getHostnames(item)]}
          renderHeaderTitle={TLSRoute.crd.title}
          renderTableHeader={[
            { title: "Name", sortBy: "name", className: styles.name },
            { title: "Namespace", sortBy: "namespace", className: styles.namespace },
            { title: "Hostnames", sortBy: "hostnames", className: styles.hostnames },
            { title: "Accepted", sortBy: "accepted", className: styles.accepted },
            { title: "Age", sortBy: "age", className: styles.age },
          ]}
          renderTableContents={(item: TLSRoute) => [
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
