import { Renderer } from "@freelensapp/extensions";
import * as MobxReact from "mobx-react";
import { BackendTLSPolicy } from "../../k8s/gateway-api";

const { observer } = MobxReact;

const {
  Component: { BadgeBoolean, DrawerItem, DrawerTitle },
} = Renderer;

export const BackendTLSPolicyDetails = observer(
  (props: Renderer.Component.KubeObjectDetailsProps<BackendTLSPolicy>) => {
    const { object } = props;

    return (
      <>
        <DrawerItem name="Hostname">{object.spec.hostname ?? "-"}</DrawerItem>
        <DrawerItem name="Accepted">
          <BadgeBoolean value={object.isAccepted()} />
        </DrawerItem>
        <DrawerTitle>Target Refs</DrawerTitle>
        {object.getTargetRefs().map((targetRef, index) => (
          <DrawerItem key={`target-${index}`} name={`${targetRef.kind} ${index + 1}`}>
            {targetRef.name}
          </DrawerItem>
        ))}
        {object.getTargetRefs().length === 0 ? <DrawerItem name="Target Refs">-</DrawerItem> : null}
        <DrawerTitle>CA Cert Refs</DrawerTitle>
        {object.getCaCertRefs().map((caCertRef, index) => (
          <DrawerItem key={`ca-${index}`} name={`${caCertRef.kind} ${index + 1}`}>
            {caCertRef.name}
          </DrawerItem>
        ))}
        {object.getCaCertRefs().length === 0 ? <DrawerItem name="CA Cert Refs">-</DrawerItem> : null}
      </>
    );
  },
);
