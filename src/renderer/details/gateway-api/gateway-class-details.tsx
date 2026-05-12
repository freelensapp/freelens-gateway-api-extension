import { Renderer } from "@freelensapp/extensions";
import * as MobxReact from "mobx-react";
import { GatewayClass } from "../../k8s/gateway-api";

const { observer } = MobxReact;

const {
  Component: { BadgeBoolean, DrawerItem },
} = Renderer;

export const GatewayClassDetails = observer((props: Renderer.Component.KubeObjectDetailsProps<GatewayClass>) => {
  const { object } = props;

  return (
    <>
      <DrawerItem name="Controller Name">{object.getControllerName()}</DrawerItem>
      <DrawerItem name="Accepted">
        <BadgeBoolean value={object.isAccepted()} />
      </DrawerItem>
      <DrawerItem name="Default Class">
        <BadgeBoolean value={object.isDefault} />
      </DrawerItem>
      <DrawerItem name="Description">{object.spec.description ?? "-"}</DrawerItem>
    </>
  );
});
