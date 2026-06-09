import { Renderer } from "@freelensapp/extensions";
import { withErrorPage } from "../../components/error-page";
import { TCPRoute } from "../../k8s/gateway-api";
import { observer } from "../../observer";
import { type GatewayPageProps, namespaceCell } from "./shared";
import styles from "./tcp-routes-page-v1alpha2.module.scss";
import stylesInline from "./tcp-routes-page-v1alpha2.module.scss?inline";

const {
  Component: { BadgeBoolean, KubeObjectAge, KubeObjectListLayout, WithTooltip },
} = Renderer;

function isAccepted(item: TCPRoute): boolean {
  return (
    item.status?.parents?.some((parent) =>
      parent.conditions?.some((condition) => condition.type === "Accepted" && condition.status === "True"),
    ) ?? false
  );
}

export const TCPRoutesPage = observer((props: GatewayPageProps) =>
  withErrorPage(props, () => {
    const store = TCPRoute.getStore<TCPRoute>();

    return (
      <>
        <style>{stylesInline}</style>
        <KubeObjectListLayout<TCPRoute, any>
          tableId={`${TCPRoute.crd.plural}Table`}
          className={styles.page}
          store={store}
          sortingCallbacks={{
            name: (item: TCPRoute) => item.getName(),
            namespace: (item: TCPRoute) => item.getNs() ?? "",
            accepted: (item: TCPRoute) => String(isAccepted(item)),
            age: (item: TCPRoute) => item.getCreationTimestamp(),
          }}
          searchFilters={[(item: TCPRoute) => item.getSearchFields()]}
          renderHeaderTitle={TCPRoute.crd.title}
          renderTableHeader={[
            { title: "Name", sortBy: "name", className: styles.name },
            { title: "Namespace", sortBy: "namespace", className: styles.namespace },
            { title: "Accepted", sortBy: "accepted", className: styles.accepted },
            { title: "Age", sortBy: "age", className: styles.age },
          ]}
          renderTableContents={(item: TCPRoute) => [
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
