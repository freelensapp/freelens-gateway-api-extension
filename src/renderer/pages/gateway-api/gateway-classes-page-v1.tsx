import { Renderer } from "@freelensapp/extensions";
import { withErrorPage } from "../../components/error-page";
import { GatewayClass } from "../../k8s/gateway-api";
import { observer } from "../../observer";
import { type GatewayPageProps } from "./shared";

const {
  Component: { BadgeBoolean, KubeObjectAge, KubeObjectListLayout, WithTooltip },
} = Renderer;

function getControllerName(item: GatewayClass): string {
  return typeof (item as any).getControllerName === "function"
    ? (item as any).getControllerName()
    : ((item as any).spec?.controllerName ?? "");
}

function isAccepted(item: GatewayClass): boolean {
  return typeof (item as any).isAccepted === "function"
    ? Boolean((item as any).isAccepted())
    : ((item as any).status?.conditions ?? []).some(
        (condition: any) => condition?.type === "Accepted" && condition?.status === "True",
      );
}

function isDefaultClass(item: GatewayClass): boolean {
  return (item as any).metadata?.annotations?.["gateway.networking.k8s.io/is-default-class"] === "true";
}

export const GatewayClassesPage = observer((props: GatewayPageProps) =>
  withErrorPage(props, () => {
    const store = GatewayClass.getStore<GatewayClass>();

    return (
      <KubeObjectListLayout<GatewayClass, any>
        tableId={`${GatewayClass.crd.plural}Table`}
        className="GatewayClassesPage"
        store={store}
        sortingCallbacks={{
          name: (item: GatewayClass) => item.getName(),
          controller: (item: GatewayClass) => getControllerName(item),
          accepted: (item: GatewayClass) => String(isAccepted(item)),
          default: (item: GatewayClass) => String(isDefaultClass(item)),
          age: (item: GatewayClass) => item.getCreationTimestamp(),
        }}
        searchFilters={[(item: GatewayClass) => item.getSearchFields()]}
        renderHeaderTitle={GatewayClass.crd.title}
        renderTableHeader={[
          { title: "Name", sortBy: "name" },
          { title: "Controller", sortBy: "controller" },
          { title: "Accepted", sortBy: "accepted" },
          { title: "Default", sortBy: "default" },
          { title: "Age", sortBy: "age" },
        ]}
        renderTableContents={(item: GatewayClass) => [
          <WithTooltip>{item.getName()}</WithTooltip>,
          <WithTooltip>{getControllerName(item)}</WithTooltip>,
          <BadgeBoolean value={isAccepted(item)} />,
          <BadgeBoolean value={isDefaultClass(item)} />,
          <KubeObjectAge object={item} key="age" />,
        ]}
      />
    );
  }),
);
