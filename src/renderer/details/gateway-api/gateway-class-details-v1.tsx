import { Renderer } from "@freelensapp/extensions";
import { GatewayClass } from "../../k8s/gateway-api";
import { observer } from "../../observer";

const {
  Component: { BadgeBoolean, DrawerItem },
} = Renderer;

function getControllerName(object: GatewayClass): string {
  return typeof (object as any).getControllerName === "function"
    ? (object as any).getControllerName()
    : ((object as any).spec?.controllerName ?? "-");
}

function isAccepted(object: GatewayClass): boolean {
  return typeof (object as any).isAccepted === "function"
    ? Boolean((object as any).isAccepted())
    : ((object as any).status?.conditions ?? []).some(
        (condition: any) => condition?.type === "Accepted" && condition?.status === "True",
      );
}

function isDefaultClass(object: GatewayClass): boolean {
  return (object as any).metadata?.annotations?.["gateway.networking.k8s.io/is-default-class"] === "true";
}

export const GatewayClassDetails = observer((props: Renderer.Component.KubeObjectDetailsProps<GatewayClass>) => {
  const { object } = props;

  return (
    <>
      <DrawerItem name="Controller Name">{getControllerName(object)}</DrawerItem>
      <DrawerItem name="Accepted">
        <BadgeBoolean value={isAccepted(object)} />
      </DrawerItem>
      <DrawerItem name="Default Class">
        <BadgeBoolean value={isDefaultClass(object)} />
      </DrawerItem>
      <DrawerItem name="Description">{object.spec.description ?? "-"}</DrawerItem>
    </>
  );
});
