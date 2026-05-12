import { Renderer } from "@freelensapp/extensions";
import { BackendTLSPolicy } from "../../k8s/gateway-api";
import { observer } from "../../observer";

const {
  Component: { BadgeBoolean, DrawerItem, DrawerTitle },
} = Renderer;

function isAccepted(object: BackendTLSPolicy): boolean {
  return typeof (object as any).isAccepted === "function"
    ? Boolean((object as any).isAccepted())
    : ((object as any).status?.conditions ?? []).some(
        (condition: any) => condition?.type === "Accepted" && condition?.status === "True",
      );
}

function getTargetRefs(object: BackendTLSPolicy): Array<{ kind: string; name: string; namespace?: string }> {
  return typeof (object as any).getTargetRefs === "function"
    ? (object as any).getTargetRefs()
    : ((object as any).spec?.targetRefs ?? []);
}

function getCaCertRefs(object: BackendTLSPolicy): Array<{ kind: string; name: string; namespace?: string }> {
  return typeof (object as any).getCaCertRefs === "function"
    ? (object as any).getCaCertRefs()
    : ((object as any).spec?.validation?.caCertificateRefs ?? []);
}

function getHostname(object: BackendTLSPolicy): string {
  if (typeof (object as any).getHostname === "function") {
    return (object as any).getHostname() ?? "-";
  }

  return (object as any).spec?.validation?.hostname ?? "-";
}

export const BackendTLSPolicyDetails = observer(
  (props: Renderer.Component.KubeObjectDetailsProps<BackendTLSPolicy>) => {
    const { object } = props;
    const targetRefs = getTargetRefs(object);
    const caCertRefs = getCaCertRefs(object);

    return (
      <>
        <DrawerItem name="Hostname">{getHostname(object)}</DrawerItem>
        <DrawerItem name="Accepted">
          <BadgeBoolean value={isAccepted(object)} />
        </DrawerItem>
        <DrawerTitle>Target Refs</DrawerTitle>
        {targetRefs.map((targetRef, index) => (
          <DrawerItem key={`target-${index}`} name={`${targetRef.kind} ${index + 1}`}>
            {targetRef.name}
          </DrawerItem>
        ))}
        {targetRefs.length === 0 ? <DrawerItem name="Target Refs">-</DrawerItem> : null}
        <DrawerTitle>CA Cert Refs</DrawerTitle>
        {caCertRefs.map((caCertRef, index) => (
          <DrawerItem key={`ca-${index}`} name={`${caCertRef.kind} ${index + 1}`}>
            {caCertRef.name}
          </DrawerItem>
        ))}
        {caCertRefs.length === 0 ? <DrawerItem name="CA Cert Refs">-</DrawerItem> : null}
      </>
    );
  },
);
