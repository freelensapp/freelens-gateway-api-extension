import { Renderer } from "@freelensapp/extensions";
import { Gateway } from "../../api/k8s";
import { withErrorPage } from "../../components/error-page";
import { observer } from "../../observer";
import styles from "./gateway-page-v1.module.scss";
import stylesInline from "./gateway-page-v1.module.scss?inline";
import { type GatewayPageProps, namespaceCell } from "./shared";

const {
  Component: { BadgeBoolean, KubeObjectAge, KubeObjectListLayout, WithTooltip },
} = Renderer;

function getClassName(item: Gateway): string {
  return item.spec?.gatewayClassName ?? "-";
}

function getAddresses(item: Gateway): string[] {
  return (item.spec?.addresses?.map((address) => address.value).filter(Boolean) as string[]) ?? [];
}

function isProgrammed(item: Gateway): boolean {
  return (
    item.status?.conditions?.some((condition) => condition?.type === "Programmed" && condition?.status === "True") ??
    false
  );
}

export const GatewaysPage = observer((props: GatewayPageProps) =>
  withErrorPage(props, () => {
    const store = Gateway.getStore<Gateway>();

    return (
      <>
        <style>{stylesInline}</style>
        <KubeObjectListLayout<Gateway, any>
          tableId={`${Gateway.crd.plural}Table`}
          className={styles.page}
          store={store}
          sortingCallbacks={{
            name: (item: Gateway) => item.getName(),
            namespace: (item: Gateway) => item.getNs() ?? "",
            class: (item: Gateway) => getClassName(item),
            addresses: (item: Gateway) => getAddresses(item).join(","),
            programmed: (item: Gateway) => String(isProgrammed(item)),
            age: (item: Gateway) => item.getCreationTimestamp(),
          }}
          searchFilters={[(item: Gateway) => item.getSearchFields()]}
          renderHeaderTitle={Gateway.crd.title}
          renderTableHeader={[
            { title: "Name", sortBy: "name", className: styles.name },
            { title: "Namespace", sortBy: "namespace", className: styles.namespace },
            { title: "Class", sortBy: "class", className: styles.class },
            { title: "Addresses", sortBy: "addresses", className: styles.addresses },
            { title: "Programmed", sortBy: "programmed", className: styles.programmed },
            { title: "Age", sortBy: "age", className: styles.age },
          ]}
          renderTableContents={(item: Gateway) => [
            <WithTooltip>{item.getName()}</WithTooltip>,
            namespaceCell(item.getNs()),
            <WithTooltip>{getClassName(item)}</WithTooltip>,
            <WithTooltip>{getAddresses(item).join(", ") || "-"}</WithTooltip>,
            <BadgeBoolean value={isProgrammed(item)} />,
            <KubeObjectAge object={item} key="age" />,
          ]}
        />
      </>
    );
  }),
);
