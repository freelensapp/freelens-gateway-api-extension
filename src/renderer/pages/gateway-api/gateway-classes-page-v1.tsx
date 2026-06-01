import { Renderer } from "@freelensapp/extensions";
import { withErrorPage } from "../../components/error-page";
import { GatewayClass } from "../../k8s/gateway-api";
import { observer } from "../../observer";
import styles from "./gateway-classes.module.scss";
import stylesInline from "./gateway-classes.module.scss?inline";
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

export const GatewayClassesPage = observer((props: GatewayPageProps) =>
  withErrorPage(props, () => {
    const store = GatewayClass.getStore<GatewayClass>();

    return (
      <>
        <style>{stylesInline}</style>
        <KubeObjectListLayout<GatewayClass, any>
          tableId={`${GatewayClass.crd.plural}Table`}
          className={styles.page}
          store={store}
          sortingCallbacks={{
            name: (item: GatewayClass) => item.getName(),
            controller: (item: GatewayClass) => getControllerName(item),
            accepted: (item: GatewayClass) => String(isAccepted(item)),
            age: (item: GatewayClass) => item.getCreationTimestamp(),
          }}
          searchFilters={[(item: GatewayClass) => item.getSearchFields()]}
          renderHeaderTitle={GatewayClass.crd.title}
          renderTableHeader={[
            { title: "Name", sortBy: "name", className: styles.name },
            { title: "Controller", sortBy: "controller", className: styles.controller },
            { title: "Accepted", sortBy: "accepted", className: styles.accepted },
            { title: "Age", sortBy: "age", className: styles.age },
          ]}
          renderTableContents={(item: GatewayClass) => [
            <WithTooltip>{item.getName()}</WithTooltip>,
            <WithTooltip>{getControllerName(item)}</WithTooltip>,
            <BadgeBoolean value={isAccepted(item)} />,
            <KubeObjectAge object={item} key="age" />,
          ]}
        />
      </>
    );
  }),
);
