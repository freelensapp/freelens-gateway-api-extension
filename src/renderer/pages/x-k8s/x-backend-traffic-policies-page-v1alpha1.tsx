import { Renderer } from "@freelensapp/extensions";
import { XBackendTrafficPolicy } from "../../api/x-k8s";
import { withErrorPage } from "../../components/error-page";
import { observer } from "../../observer";
import { type GatewayPageProps, namespaceCell } from "../k8s/shared";
import styles from "./x-backend-traffic-policies-page-v1alpha1.module.scss";
import stylesInline from "./x-backend-traffic-policies-page-v1alpha1.module.scss?inline";

const {
  Component: { KubeObjectAge, KubeObjectListLayout, WithTooltip },
} = Renderer;

export const XBackendTrafficPoliciesPage = observer((props: GatewayPageProps) =>
  withErrorPage(props, () => {
    const store = XBackendTrafficPolicy.getStore<XBackendTrafficPolicy>();

    return (
      <>
        <style>{stylesInline}</style>
        <KubeObjectListLayout<XBackendTrafficPolicy, any>
          tableId={`${XBackendTrafficPolicy.crd.plural}Table`}
          className={styles.page}
          store={store}
          sortingCallbacks={{
            name: (item: XBackendTrafficPolicy) => item.getName(),
            namespace: (item: XBackendTrafficPolicy) => item.getNs() ?? "",
            age: (item: XBackendTrafficPolicy) => item.getCreationTimestamp(),
          }}
          searchFilters={[(item: XBackendTrafficPolicy) => item.getSearchFields()]}
          renderHeaderTitle={XBackendTrafficPolicy.crd.title}
          renderTableHeader={[
            { title: "Name", sortBy: "name", className: styles.name },
            { title: "Namespace", sortBy: "namespace", className: styles.namespace },
            { title: "Age", sortBy: "age", className: styles.age },
          ]}
          renderTableContents={(item: XBackendTrafficPolicy) => [
            <WithTooltip>{item.getName()}</WithTooltip>,
            namespaceCell(item.getNs()),
            <KubeObjectAge object={item} key="age" />,
          ]}
        />
      </>
    );
  }),
);
