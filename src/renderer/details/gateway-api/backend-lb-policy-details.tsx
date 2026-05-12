import { Renderer } from "@freelensapp/extensions";
import * as MobxReact from "mobx-react";
import { BackendLBPolicy } from "../../k8s/gateway-api";

const { observer } = MobxReact;

const {
  Component: { BadgeBoolean, DrawerItem },
} = Renderer;

export const BackendLBPolicyDetails = observer((props: Renderer.Component.KubeObjectDetailsProps<BackendLBPolicy>) => {
  const { object } = props;

  return (
    <>
      <DrawerItem name="Target Ref">{`${object.getTargetRef().kind}/${object.getTargetRef().name}`}</DrawerItem>
      <DrawerItem name="Policy Type">{object.spec.policyType ?? "-"}</DrawerItem>
      <DrawerItem name="Accepted">
        <BadgeBoolean value={object.isAccepted()} />
      </DrawerItem>
    </>
  );
});
