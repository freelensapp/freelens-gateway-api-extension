import { Renderer } from "@freelensapp/extensions";
import { ClientSettingsPolicy } from "../../api/nginx";
import { withErrorPage } from "../../components/error-page";
import { observer } from "../../observer";
import { type GatewayPageProps, namespaceCell } from "../k8s/shared";
import styles from "./client-settings-policies-page-v1alpha1.module.scss";
import stylesInline from "./client-settings-policies-page-v1alpha1.module.scss?inline";

const {
  Component: { KubeObjectAge, KubeObjectListLayout, WithTooltip },
} = Renderer;

export const ClientSettingsPoliciesPage = observer((props: GatewayPageProps) =>
  withErrorPage(props, () => {
    const store = ClientSettingsPolicy.getStore<ClientSettingsPolicy>();

    return (
      <>
        <style>{stylesInline}</style>
        <KubeObjectListLayout<ClientSettingsPolicy, any>
          tableId={`${ClientSettingsPolicy.crd.plural}Table`}
          className={styles.page}
          store={store}
          sortingCallbacks={{
            name: (item: ClientSettingsPolicy) => item.getName(),
            namespace: (item: ClientSettingsPolicy) => item.getNs() ?? "",
            age: (item: ClientSettingsPolicy) => item.getCreationTimestamp(),
          }}
          searchFilters={[(item: ClientSettingsPolicy) => item.getSearchFields()]}
          renderHeaderTitle={ClientSettingsPolicy.crd.title}
          renderTableHeader={[
            { title: "Name", sortBy: "name", className: styles.name },
            { title: "Namespace", sortBy: "namespace", className: styles.namespace },
            { title: "Age", sortBy: "age", className: styles.age },
          ]}
          renderTableContents={(item: ClientSettingsPolicy) => [
            <WithTooltip>{item.getName()}</WithTooltip>,
            namespaceCell(item.getNs()),
            <KubeObjectAge object={item} key="age" />,
          ]}
        />
      </>
    );
  }),
);
