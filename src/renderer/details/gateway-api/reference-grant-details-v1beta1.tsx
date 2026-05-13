import { Renderer } from "@freelensapp/extensions";
import { ReferenceGrant } from "../../k8s/gateway-api";
import { observer } from "../../observer";

const {
  Component: { DrawerItem, DrawerTitle },
} = Renderer;

export const ReferenceGrantDetails = observer((props: Renderer.Component.KubeObjectDetailsProps<ReferenceGrant>) => {
  const { object } = props;

  return (
    <>
      <DrawerTitle>From</DrawerTitle>
      {object.spec.from?.map((entry, index) => (
        <DrawerItem key={`from-${index}`} name={`${entry.kind} ${index + 1}`}>
          {`${entry.group} ${entry.namespace ? `(${entry.namespace})` : ""}`.trim()}
        </DrawerItem>
      ))}
      {object.spec.from?.length ? null : <DrawerItem name="From">-</DrawerItem>}

      <DrawerTitle>To</DrawerTitle>
      {object.spec.to?.map((entry, index) => (
        <DrawerItem key={`to-${index}`} name={`${entry.kind} ${index + 1}`}>
          {`${entry.group}${entry.name ? `/${entry.name}` : ""}`}
        </DrawerItem>
      ))}
      {object.spec.to?.length ? null : <DrawerItem name="To">-</DrawerItem>}
    </>
  );
});
