import { Renderer } from "@freelensapp/extensions";
import * as MobxReact from "mobx-react";
import { withErrorPage } from "../../components/error-page";
import { GRPCRoute } from "../../k8s/gateway-api";
import { formatParentRefs, type GatewayPageProps, namespaceCell } from "./shared";

const { observer } = MobxReact;

const {
  Component: { BadgeBoolean, KubeObjectAge, KubeObjectListLayout, WithTooltip },
} = Renderer;

export const GRPCRoutesPage = observer((props: GatewayPageProps) =>
  withErrorPage(props, () => {
    const store = GRPCRoute.getStore<GRPCRoute>();

    return (
      <KubeObjectListLayout<GRPCRoute, any>
        tableId={`${GRPCRoute.crd.plural}Table`}
        className="GRPCRoutesPage"
        store={store}
        sortingCallbacks={{
          name: (item: GRPCRoute) => item.getName(),
          namespace: (item: GRPCRoute) => item.getNs() ?? "",
          hostnames: (item: GRPCRoute) => item.getHostnames().join(","),
          rules: (item: GRPCRoute) => item.getRulesCount(),
          accepted: (item: GRPCRoute) => String(item.isAccepted()),
          age: (item: GRPCRoute) => item.getCreationTimestamp(),
        }}
        searchFilters={[(item: GRPCRoute) => item.getSearchFields(), (item: GRPCRoute) => item.getHostnames()]}
        renderHeaderTitle={GRPCRoute.crd.title}
        renderTableHeader={[
          { title: "Name", sortBy: "name" },
          { title: "Namespace", sortBy: "namespace" },
          { title: "Hostnames", sortBy: "hostnames" },
          { title: "Parent Refs", sortBy: "hostnames" },
          { title: "Rules", sortBy: "rules" },
          { title: "Accepted", sortBy: "accepted" },
          { title: "Age", sortBy: "age" },
        ]}
        renderTableContents={(item: GRPCRoute) => [
          <WithTooltip>{item.getName()}</WithTooltip>,
          namespaceCell(item.getNs()),
          <WithTooltip>{item.getHostnames().join(", ") || "*"}</WithTooltip>,
          <WithTooltip>{formatParentRefs(item.getParentRefs())}</WithTooltip>,
          <WithTooltip>{String(item.getRulesCount())}</WithTooltip>,
          <BadgeBoolean value={item.isAccepted()} />,
          <KubeObjectAge object={item} key="age" />,
        ]}
      />
    );
  }),
);
