import { Renderer } from "@freelensapp/extensions";
import { GatewayClass } from "../../k8s/gateway-api";
import { observer } from "../../observer";

const {
  Component: { BadgeBoolean, DrawerItem, DrawerTitle, LinkToObject },
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

export const GatewayClassDetails = observer((props: Renderer.Component.KubeObjectDetailsProps<GatewayClass>) => {
  const { object } = props;

  return (
    <>
      <DrawerItem name="Controller Name">{getControllerName(object)}</DrawerItem>
      <DrawerItem name="Accepted">
        <BadgeBoolean value={isAccepted(object)} />
      </DrawerItem>
      {object.spec.parametersRef && (
        <div>
          <DrawerTitle>Parameters Reference</DrawerTitle>
          {object.spec.parametersRef && (
            <div>
              <DrawerItem name="Group">{object.spec.parametersRef.group}</DrawerItem>
              <DrawerItem name="Kind">{object.spec.parametersRef.kind}</DrawerItem>
              <DrawerItem name="Name">
                <LinkToObject objectRef={object.spec.parametersRef} object={object}>
                  {object.spec.parametersRef.name}
                </LinkToObject>
              </DrawerItem>
              <DrawerItem name="Namespace" hidden={!object.spec.parametersRef.namespace}>
                {object.spec.parametersRef.namespace}
              </DrawerItem>
            </div>
          )}
        </div>
      )}
    </>
  );
});
