import { Renderer } from "@freelensapp/extensions";
import { BackendTLSPolicy } from "../../k8s/gateway-api";
import { hasTrueCondition } from "../../k8s/gateway-api/types";
import { observer } from "../../observer";

const {
  Component: { BadgeBoolean, DrawerItem, DrawerTitle },
} = Renderer;

function isAccepted(object: BackendTLSPolicy): boolean {
  return hasTrueCondition(object.status?.conditions, "Accepted");
}

function getTargetRefs(object: BackendTLSPolicy): Array<{ kind: string; name: string; namespace?: string }> {
  return object.spec?.targetRefs ?? [];
}

function getCaCertRefs(object: BackendTLSPolicy): Array<{ kind: string; name: string; namespace?: string }> {
  return object.spec?.validation?.caCertificateRefs ?? [];
}

function getHostname(object: BackendTLSPolicy): string {
  return object.spec?.validation?.hostname ?? "-";
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
