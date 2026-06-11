import { Renderer } from "@freelensapp/extensions";
import { withErrorPage } from "../../../components/error-page";
import { ReferenceGrant } from "../../../k8s/gateway-api/reference-grant-v1beta1";
import { observer } from "../../../observer";
import { type GatewayPageProps, namespaceCell } from "../shared";
import styles from "./reference-grants-page.module.scss";
import stylesInline from "./reference-grants-page.module.scss?inline";

const {
  Component: { KubeObjectAge, KubeObjectListLayout, WithTooltip },
} = Renderer;

export const ReferenceGrantsPage = observer((props: GatewayPageProps) =>
  withErrorPage(props, () => {
    const store = ReferenceGrant.getStore<ReferenceGrant>();

    return (
      <>
        <style>{stylesInline}</style>
        <KubeObjectListLayout<ReferenceGrant, any>
          tableId={`${ReferenceGrant.crd.plural}Table`}
          className={styles.page}
          store={store}
          sortingCallbacks={{
            name: (item: ReferenceGrant) => item.getName(),
            namespace: (item: ReferenceGrant) => item.getNs() ?? "",
            age: (item: ReferenceGrant) => item.getCreationTimestamp(),
          }}
          searchFilters={[(item: ReferenceGrant) => item.getSearchFields()]}
          renderHeaderTitle={ReferenceGrant.crd.title}
          renderTableHeader={[
            { title: "Name", sortBy: "name", className: styles.name },
            { title: "Namespace", sortBy: "namespace", className: styles.namespace },
            { title: "Age", sortBy: "age", className: styles.age },
          ]}
          renderTableContents={(item: ReferenceGrant) => [
            <WithTooltip>{item.getName()}</WithTooltip>,
            namespaceCell(item.getNs()),
            <KubeObjectAge object={item} key="age" />,
          ]}
        />
      </>
    );
  }),
);
