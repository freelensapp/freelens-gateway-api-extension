import { Renderer } from "@freelensapp/extensions";
import * as MobxReact from "mobx-react";
import { BackendLBPolicy } from "../../k8s/gateway-api";

const { observer } = MobxReact;

const {
  Component: { BadgeBoolean, DrawerItem },
} = Renderer;

function getTargetRef(object: BackendLBPolicy): { kind: string; name: string } | undefined {
  return typeof (object as any).getTargetRef === "function"
    ? (object as any).getTargetRef()
    : (object as any).spec?.targetRef;
}

function isAccepted(object: BackendLBPolicy): boolean {
  return typeof (object as any).isAccepted === "function"
    ? Boolean((object as any).isAccepted())
    : ((object as any).status?.conditions ?? []).some(
        (condition: any) => condition?.type === "Accepted" && condition?.status === "True",
      );
}

export const BackendLBPolicyDetails = observer((props: Renderer.Component.KubeObjectDetailsProps<BackendLBPolicy>) => {
  const { object } = props;
  const targetRef = getTargetRef(object);

  return (
    <>
      <DrawerItem name="Target Ref">{targetRef ? `${targetRef.kind}/${targetRef.name}` : "-"}</DrawerItem>
      <DrawerItem name="Policy Type">{object.spec.policyType ?? "-"}</DrawerItem>
      <DrawerItem name="Accepted">
        <BadgeBoolean value={isAccepted(object)} />
      </DrawerItem>
    </>
  );
});
