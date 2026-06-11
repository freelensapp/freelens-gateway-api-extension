import { Renderer } from "@freelensapp/extensions";
import { BackendTLSPolicy } from "../../k8s/gateway-api";
import { observer } from "../../observer";
import styles from "./common.module.scss";
import stylesInline from "./common.module.scss?inline";

const {
  Component: { BadgeBoolean, DrawerItem, DrawerTitle, LinkToObject },
} = Renderer;

function isAccepted(object: BackendTLSPolicy): boolean {
  const ancestors = object.status?.conditions ?? [];

  return ancestors.some((ancestor) =>
    (ancestor.conditions ?? []).some((condition) => condition.type === "Accepted" && condition.status === "True"),
  );
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
        <style>{stylesInline}</style>
        <div className={styles.details}>
          <DrawerItem name="Hostname">{getHostname(object)}</DrawerItem>
          <DrawerItem name="Accepted">
            <BadgeBoolean value={isAccepted(object)} />
          </DrawerItem>
          <DrawerTitle>Target Refs</DrawerTitle>
          {targetRefs.map((targetRef, index) => (
            <DrawerItem key={`target-${index}`} name={`${targetRef.kind} ${index + 1}`}>
              <LinkToObject objectRef={targetRef} object={object}>
                {targetRef.name}
              </LinkToObject>
            </DrawerItem>
          ))}
          {targetRefs.length === 0 ? <DrawerItem name="Target Refs">-</DrawerItem> : null}
          <DrawerTitle>CA Cert Refs</DrawerTitle>
          {caCertRefs.map((caCertRef, index) => (
            <DrawerItem key={`ca-${index}`} name={`${caCertRef.kind} ${index + 1}`}>
              <LinkToObject objectRef={caCertRef} object={object}>
                {caCertRef.name}
              </LinkToObject>
            </DrawerItem>
          ))}
          {caCertRefs.length === 0 ? <DrawerItem name="CA Cert Refs">-</DrawerItem> : null}
        </div>
      </>
    );
  },
);
