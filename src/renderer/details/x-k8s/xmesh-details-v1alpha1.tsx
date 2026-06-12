import { Renderer } from "@freelensapp/extensions";
import { XMesh } from "../../api/x-k8s";
import { observer } from "../../observer";
import styles from "./common.module.scss";
import stylesInline from "./common.module.scss?inline";

const {
  Component: { BadgeBoolean, DrawerItem, DrawerTitle, LinkToObject },
} = Renderer;

function getControllerName(object: XMesh): string {
  return object.spec?.controllerName ?? "-";
}

function isAccepted(object: XMesh): boolean {
  return (object.status?.conditions ?? []).some(
    (condition) => condition?.type === "Accepted" && condition?.status === "True",
  );
}

export const XMeshDetails = observer((props: Renderer.Component.KubeObjectDetailsProps<XMesh>) => {
  const { object } = props;

  return (
    <>
      <style>{stylesInline}</style>
      <div className={styles.details}>
        <DrawerItem name="Controller Name">{getControllerName(object)}</DrawerItem>
        <DrawerItem name="Accepted">
          <BadgeBoolean value={isAccepted(object)} />
        </DrawerItem>
        <DrawerItem name="Description" hidden={!object.spec?.description}>
          {object.spec?.description ?? "-"}
        </DrawerItem>
        {object.spec?.parametersRef && (
          <div>
            <DrawerTitle>Parameters Reference</DrawerTitle>
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
      </div>
    </>
  );
});
