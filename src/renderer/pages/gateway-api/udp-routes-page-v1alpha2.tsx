import { Renderer } from "@freelensapp/extensions";
import { withErrorPage } from "../../components/error-page";
import { UDPRoute } from "../../k8s/gateway-api";
import { observer } from "../../observer";
import { type GatewayPageProps, namespaceCell } from "./shared";
import styles from "./udp-routes-page-v1alpha2.module.scss";
import stylesInline from "./udp-routes-page-v1alpha2.module.scss?inline";

const {
  Component: { BadgeBoolean, KubeObjectAge, KubeObjectListLayout, WithTooltip },
} = Renderer;

function isAccepted(item: UDPRoute): boolean {
  return (
    item.status?.parents?.some((parent) =>
      parent.conditions?.some((condition) => condition.type === "Accepted" && condition.status === "True"),
    ) ?? false
  );
}

export const UDPRoutesPage = observer((props: GatewayPageProps) =>
  withErrorPage(props, () => {
    const store = UDPRoute.getStore<UDPRoute>();

    return (
      <>
        <style>{stylesInline}</style>
        <KubeObjectListLayout<UDPRoute, any>
          tableId={`${UDPRoute.crd.plural}Table`}
          className={styles.page}
          store={store}
          sortingCallbacks={{
            name: (item: UDPRoute) => item.getName(),
            namespace: (item: UDPRoute) => item.getNs() ?? "",
            accepted: (item: UDPRoute) => String(isAccepted(item)),
            age: (item: UDPRoute) => item.getCreationTimestamp(),
          }}
          searchFilters={[(item: UDPRoute) => item.getSearchFields()]}
          renderHeaderTitle={UDPRoute.crd.title}
          renderTableHeader={[
            { title: "Name", sortBy: "name", className: styles.name },
            { title: "Namespace", sortBy: "namespace", className: styles.namespace },
            { title: "Accepted", sortBy: "accepted", className: styles.accepted },
            { title: "Age", sortBy: "age", className: styles.age },
          ]}
          renderTableContents={(item: UDPRoute) => [
            <WithTooltip>{item.getName()}</WithTooltip>,
            namespaceCell(item.getNs()),
            <BadgeBoolean value={isAccepted(item)} />,
            <KubeObjectAge object={item} key="age" />,
          ]}
        />
      </>
    );
  }),
);
