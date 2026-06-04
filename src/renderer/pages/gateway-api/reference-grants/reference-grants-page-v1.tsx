import { Renderer } from "@freelensapp/extensions";
import { withErrorPage } from "../../../components/error-page";
import { ReferenceGrant } from "../../../k8s/gateway-api";
import { observer } from "../../../observer";
import { type GatewayPageProps, namespaceCell } from "../shared";
import { getReferenceGrantRowSummaries } from "./reference-grant-summaries";
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
            from: (item: ReferenceGrant) => getReferenceGrantRowSummaries(item.spec).from,
            to: (item: ReferenceGrant) => getReferenceGrantRowSummaries(item.spec).to,
            age: (item: ReferenceGrant) => item.getCreationTimestamp(),
          }}
          searchFilters={[(item: ReferenceGrant) => item.getSearchFields()]}
          renderHeaderTitle={ReferenceGrant.crd.title}
          renderTableHeader={[
            { title: "Name", sortBy: "name", className: styles.name },
            { title: "Namespace", sortBy: "namespace", className: styles.namespace },
            { title: "From", sortBy: "from", className: styles.from },
            { title: "To", sortBy: "to", className: styles.to },
            { title: "Age", sortBy: "age", className: styles.age },
          ]}
          renderTableContents={(item: ReferenceGrant) => {
            const summaries = getReferenceGrantRowSummaries(item.spec);

            return [
              <WithTooltip>{item.getName()}</WithTooltip>,
              namespaceCell(item.getNs()),
              <WithTooltip>{summaries.from}</WithTooltip>,
              <WithTooltip>{summaries.to}</WithTooltip>,
              <KubeObjectAge object={item} key="age" />,
            ];
          }}
        />
      </>
    );
  }),
);
