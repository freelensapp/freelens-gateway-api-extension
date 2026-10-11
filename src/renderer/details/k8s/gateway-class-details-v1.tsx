import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import { GatewayClass } from "../../api/k8s";
import { ReferenceLink } from "./reference-link";

const {
  Component: { BadgeBoolean, DrawerItem, DrawerTitle },
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
              <DrawerItem name="Group">{object.spec.parametersRef.group || "-"}</DrawerItem>
              <DrawerItem name="Kind">{object.spec.parametersRef.kind}</DrawerItem>
              <DrawerItem name="Name">
                <ReferenceLink
                  object={object}
                  group={object.spec.parametersRef.group}
                  kind={object.spec.parametersRef.kind}
                  name={object.spec.parametersRef.name}
                  namespace={object.spec.parametersRef.namespace}
                />
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
