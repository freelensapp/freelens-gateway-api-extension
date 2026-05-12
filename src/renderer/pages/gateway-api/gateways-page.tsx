import { Renderer } from "@freelensapp/extensions";
import * as MobxReact from "mobx-react";
import { withErrorPage } from "../../components/error-page";
import { Gateway } from "../../k8s/gateway-api";
import { type GatewayPageProps, namespaceCell } from "./shared";

const { observer } = MobxReact;

const {
  Component: { BadgeBoolean, KubeObjectAge, KubeObjectListLayout, WithTooltip },
} = Renderer;

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
          class: (item: Gateway) => item.getClassName(),
          addresses: (item: Gateway) => item.getAddresses().join(","),
          listeners: (item: Gateway) => item.getListeners().length,
          ready: (item: Gateway) => String(item.isReady()),
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
          <WithTooltip>{item.getClassName()}</WithTooltip>,
          <WithTooltip>{item.getAddresses().join(", ") || "-"}</WithTooltip>,
          <WithTooltip>{String(item.getListeners().length)}</WithTooltip>,
          <BadgeBoolean value={item.isReady()} />,
          <KubeObjectAge object={item} key="age" />,
        ]}
      />
    );
  }),
);
