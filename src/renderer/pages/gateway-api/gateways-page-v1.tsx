import { Renderer } from "@freelensapp/extensions";
import { withErrorPage } from "../../components/error-page";
import { Gateway } from "../../k8s/gateway-api";
import { observer } from "../../observer";
import { type GatewayPageProps, namespaceCell } from "./shared";

const {
  Component: { BadgeBoolean, KubeObjectAge, KubeObjectListLayout, WithTooltip },
} = Renderer;

function getClassName(item: Gateway): string {
  return typeof (item as any).getClassName === "function"
    ? (item as any).getClassName()
    : ((item as any).spec?.gatewayClassName ?? "");
}

function getAddresses(item: Gateway): string[] {
  return typeof (item as any).getAddresses === "function"
    ? (item as any).getAddresses()
    : ((item as any).status?.addresses ?? []).map((address: any) => address?.value).filter(Boolean);
}

function getListenersCount(item: Gateway): number {
  if (typeof (item as any).getListeners === "function") {
    return (item as any).getListeners().length;
  }

  return ((item as any).spec?.listeners ?? []).length;
}

function isReady(item: Gateway): boolean {
  return typeof (item as any).isReady === "function"
    ? Boolean((item as any).isReady())
    : ((item as any).status?.conditions ?? []).some(
        (condition: any) => condition?.type === "Ready" && condition?.status === "True",
      );
}

export const GatewaysPage = observer((props: GatewayPageProps) =>
  withErrorPage(props, () => {
    const store = Gateway.getStore<Gateway>();

    return (
      <KubeObjectListLayout<Gateway, any>
        tableId={`${Gateway.crd.plural}Table`}
        className="GatewaysPage"
        store={store}
        sortingCallbacks={{
          name: (item: Gateway) => item.getName(),
          namespace: (item: Gateway) => item.getNs() ?? "",
          class: (item: Gateway) => getClassName(item),
          addresses: (item: Gateway) => getAddresses(item).join(","),
          listeners: (item: Gateway) => getListenersCount(item),
          ready: (item: Gateway) => String(isReady(item)),
          age: (item: Gateway) => item.getCreationTimestamp(),
        }}
        searchFilters={[(item: Gateway) => item.getSearchFields()]}
        renderHeaderTitle={Gateway.crd.title}
        renderTableHeader={[
          { title: "Name", sortBy: "name" },
          { title: "Namespace", sortBy: "namespace" },
          { title: "Class", sortBy: "class" },
          { title: "Addresses", sortBy: "addresses" },
          { title: "Listeners", sortBy: "listeners" },
          { title: "Ready", sortBy: "ready" },
          { title: "Age", sortBy: "age" },
        ]}
        renderTableContents={(item: Gateway) => [
          <WithTooltip>{item.getName()}</WithTooltip>,
          namespaceCell(item.getNs()),
          <WithTooltip>{getClassName(item)}</WithTooltip>,
          <WithTooltip>{getAddresses(item).join(", ") || "-"}</WithTooltip>,
          <WithTooltip>{String(getListenersCount(item))}</WithTooltip>,
          <BadgeBoolean value={isReady(item)} />,
          <KubeObjectAge object={item} key="age" />,
        ]}
      />
    );
  }),
);
