import { Renderer } from "@freelensapp/extensions";
import { withErrorPage } from "../../components/error-page";
import { HTTPRoute } from "../../k8s/gateway-api";
import { observer } from "../../observer";
import { formatParentRefs, type GatewayPageProps, namespaceCell } from "./shared";

const {
  Component: { BadgeBoolean, KubeObjectAge, KubeObjectListLayout, WithTooltip },
} = Renderer;

function getHostnames(item: HTTPRoute): string[] {
  return typeof (item as any).getHostnames === "function"
    ? (item as any).getHostnames()
    : ((item as any).spec?.hostnames ?? []);
}

function getRulesCount(item: HTTPRoute): number {
  return typeof (item as any).getRulesCount === "function"
    ? (item as any).getRulesCount()
    : ((item as any).spec?.rules ?? []).length;
}

function getParentRefs(item: HTTPRoute): any[] {
  if (typeof (item as any).getParentRefs === "function") {
    return (item as any).getParentRefs();
  }

  const spec = (item as any).spec ?? {};

  return [...(spec.commonParentRefs ?? []), ...(spec.parentRefs ?? [])];
}

function isAccepted(item: HTTPRoute): boolean {
  return typeof (item as any).isAccepted === "function"
    ? Boolean((item as any).isAccepted())
    : ((item as any).status?.parents ?? []).some((parent: any) =>
        (parent?.conditions ?? []).some(
          (condition: any) => condition?.type === "Accepted" && condition?.status === "True",
        ),
      );
}

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
          hostnames: (item: HTTPRoute) => getHostnames(item).join(","),
          rules: (item: HTTPRoute) => getRulesCount(item),
          accepted: (item: HTTPRoute) => String(isAccepted(item)),
          age: (item: HTTPRoute) => item.getCreationTimestamp(),
        }}
        searchFilters={[(item: HTTPRoute) => item.getSearchFields(), (item: HTTPRoute) => getHostnames(item)]}
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
