import { Renderer } from "@freelensapp/extensions";
import { ProxySettingsPolicy } from "../../api/nginx";
import { withErrorPage } from "../../components/error-page";
import { observer } from "../../observer";
import { type GatewayPageProps, namespaceCell } from "../k8s/shared";
import styles from "./proxy-settings-policies-page-v1alpha1.module.scss";
import stylesInline from "./proxy-settings-policies-page-v1alpha1.module.scss?inline";

const {
  Component: { KubeObjectAge, KubeObjectListLayout, WithTooltip },
} = Renderer;

export const ProxySettingsPoliciesPage = observer((props: GatewayPageProps) =>
  withErrorPage(props, () => {
    const store = ProxySettingsPolicy.getStore<ProxySettingsPolicy>();

    return (
      <>
        <style>{stylesInline}</style>
        <KubeObjectListLayout<ProxySettingsPolicy, any>
          tableId={`${ProxySettingsPolicy.crd.plural}Table`}
          className={styles.page}
          store={store}
          sortingCallbacks={{
            name: (item: ProxySettingsPolicy) => item.getName(),
            namespace: (item: ProxySettingsPolicy) => item.getNs() ?? "",
            age: (item: ProxySettingsPolicy) => item.getCreationTimestamp(),
          }}
          searchFilters={[(item: ProxySettingsPolicy) => item.getSearchFields()]}
          renderHeaderTitle={ProxySettingsPolicy.crd.title}
          renderTableHeader={[
            { title: "Name", sortBy: "name", className: styles.name },
            { title: "Namespace", sortBy: "namespace", className: styles.namespace },
            { title: "Age", sortBy: "age", className: styles.age },
          ]}
          renderTableContents={(item: ProxySettingsPolicy) => [
            <WithTooltip key="name">{item.getName()}</WithTooltip>,
            namespaceCell(item.getNs()),
            <KubeObjectAge object={item} key="age" />,
          ]}
        />
      </>
    );
  }),
);
