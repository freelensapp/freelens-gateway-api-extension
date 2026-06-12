import { Renderer } from "@freelensapp/extensions";
import { BackendTLSPolicy } from "../../api/k8s";
import { withErrorPage } from "../../components/error-page";
import { observer } from "../../observer";
import styles from "./backend-tls-policies-page-v1.module.scss";
import stylesInline from "./backend-tls-policies-page-v1.module.scss?inline";
import { type GatewayPageProps, namespaceCell } from "./shared";

const {
  Component: { BadgeBoolean, KubeObjectAge, KubeObjectListLayout, WithTooltip },
} = Renderer;

function isAccepted(item: BackendTLSPolicy): boolean {
  const ancestors = item.status?.conditions ?? [];

  return ancestors.some((ancestor) =>
    (ancestor.conditions ?? []).some((condition) => condition.type === "Accepted" && condition.status === "True"),
  );
}

export const BackendTLSPoliciesPage = observer((props: GatewayPageProps) =>
  withErrorPage(props, () => {
    const store = BackendTLSPolicy.getStore<BackendTLSPolicy>();

    return (
      <>
        <style>{stylesInline}</style>
        <KubeObjectListLayout<BackendTLSPolicy, any>
          tableId={`${BackendTLSPolicy.crd.plural}Table`}
          className={styles.page}
          store={store}
          sortingCallbacks={{
            name: (item: BackendTLSPolicy) => item.getName(),
            namespace: (item: BackendTLSPolicy) => item.getNs() ?? "",
            accepted: (item: BackendTLSPolicy) => String(isAccepted(item)),
            age: (item: BackendTLSPolicy) => item.getCreationTimestamp(),
          }}
          searchFilters={[(item: BackendTLSPolicy) => item.getSearchFields()]}
          renderHeaderTitle={BackendTLSPolicy.crd.title}
          renderTableHeader={[
            { title: "Name", sortBy: "name", className: styles.name },
            { title: "Namespace", sortBy: "namespace", className: styles.namespace },
            { title: "Accepted", sortBy: "accepted", className: styles.accepted },
            { title: "Age", sortBy: "age", className: styles.age },
          ]}
          renderTableContents={(item: BackendTLSPolicy) => [
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
