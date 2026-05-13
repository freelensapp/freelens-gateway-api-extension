import { Renderer } from "@freelensapp/extensions";
import { withErrorPage } from "../../components/error-page";
import { GRPCRoute } from "../../k8s/gateway-api";
import { observer } from "../../observer";
import { formatParentRefs, type GatewayPageProps, namespaceCell } from "./shared";

const {
  Component: { BadgeBoolean, KubeObjectAge, KubeObjectListLayout, WithTooltip },
} = Renderer;

function getHostnames(item: GRPCRoute): string[] {
  return typeof (item as any).getHostnames === "function"
    ? (item as any).getHostnames()
    : ((item as any).spec?.hostnames ?? []);
}

function getRulesCount(item: GRPCRoute): number {
  return typeof (item as any).getRulesCount === "function"
    ? (item as any).getRulesCount()
    : ((item as any).spec?.rules ?? []).length;
}

function getParentRefs(item: GRPCRoute): any[] {
  if (typeof (item as any).getParentRefs === "function") {
    return (item as any).getParentRefs();
  }

  const spec = (item as any).spec ?? {};

  return [...(spec.commonParentRefs ?? []), ...(spec.parentRefs ?? [])];
}

function isAccepted(item: GRPCRoute): boolean {
  return typeof (item as any).isAccepted === "function"
    ? Boolean((item as any).isAccepted())
    : ((item as any).status?.parents ?? []).some((parent: any) =>
        (parent?.conditions ?? []).some(
          (condition: any) => condition?.type === "Accepted" && condition?.status === "True",
        ),
      );
}

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
          hostnames: (item: GRPCRoute) => getHostnames(item).join(","),
          rules: (item: GRPCRoute) => getRulesCount(item),
          accepted: (item: GRPCRoute) => String(isAccepted(item)),
          age: (item: GRPCRoute) => item.getCreationTimestamp(),
        }}
        searchFilters={[(item: GRPCRoute) => item.getSearchFields(), (item: GRPCRoute) => getHostnames(item)]}
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
          <WithTooltip>{getHostnames(item).join(", ") || "*"}</WithTooltip>,
          <WithTooltip>{formatParentRefs(getParentRefs(item) as any)}</WithTooltip>,
          <WithTooltip>{String(getRulesCount(item))}</WithTooltip>,
          <BadgeBoolean value={isAccepted(item)} />,
          <KubeObjectAge object={item} key="age" />,
        ]}
      />
    );
  }),
);
