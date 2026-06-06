import { Renderer } from "@freelensapp/extensions";
import { GatewayClass } from "../../k8s/gateway-api";
import { observer } from "../../observer";

const {
  Component: { BadgeBoolean, DrawerItem, DrawerTitle, LinkToObject },
} = Renderer;

function getControllerName(object: GatewayClass): string {
  return object.spec?.controllerName ?? "-";
}

function isAccepted(object: GatewayClass): boolean {
  return (object.status?.conditions ?? []).some(
    (condition) => condition?.type === "Accepted" && condition?.status === "True",
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
      {object.status?.supportedFeatures && (
        <div>
          <DrawerTitle>Supported Features</DrawerTitle>
          {object.status.supportedFeatures.map((feature, index) => (
            <DrawerItem key={`feature-${index}`} name={`Feature ${index + 1}`}>
              {feature.name}
            </DrawerItem>
          ))}
        </div>
      )}
    </>
  );
});
