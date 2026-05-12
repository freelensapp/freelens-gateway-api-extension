import { Renderer } from "@freelensapp/extensions";
import * as MobxReact from "mobx-react";
import { withErrorPage } from "../../components/error-page";
import { HTTPRoute } from "../../k8s/gateway-api";
import { formatParentRefs, type GatewayPageProps, namespaceCell } from "./shared";

const { observer } = MobxReact;

const {
  Component: { BadgeBoolean, KubeObjectAge, KubeObjectListLayout, WithTooltip },
} = Renderer;

export const HTTPRoutesPage = observer((props: GatewayPageProps) =>
  withErrorPage(props, () => {
    const store = HTTPRoute.getStore<HTTPRoute>();

    return (
      <KubeObjectListLayout<HTTPRoute, any>
        tableId={`${HTTPRoute.crd.plural}Table`}
        className="HTTPRoutesPage"
        store={store}
        sortingCallbacks={{
          name: (item: HTTPRoute) => item.getName(),
          namespace: (item: HTTPRoute) => item.getNs() ?? "",
          hostnames: (item: HTTPRoute) => item.getHostnames().join(","),
          rules: (item: HTTPRoute) => item.getRulesCount(),
          accepted: (item: HTTPRoute) => String(item.isAccepted()),
          age: (item: HTTPRoute) => item.getCreationTimestamp(),
        }}
        searchFilters={[(item: HTTPRoute) => item.getSearchFields(), (item: HTTPRoute) => item.getHostnames()]}
        renderHeaderTitle={HTTPRoute.crd.title}
        renderTableHeader={[
          { title: "Name", sortBy: "name" },
          { title: "Namespace", sortBy: "namespace" },
          { title: "Hostnames", sortBy: "hostnames" },
          { title: "Parent Refs", sortBy: "hostnames" },
          { title: "Rules", sortBy: "rules" },
          { title: "Accepted", sortBy: "accepted" },
          { title: "Age", sortBy: "age" },
        ]}
        renderTableContents={(item: HTTPRoute) => [
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
