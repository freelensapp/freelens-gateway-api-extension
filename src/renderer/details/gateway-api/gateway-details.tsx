import { Renderer } from "@freelensapp/extensions";
import * as MobxReact from "mobx-react";
import { Gateway } from "../../k8s/gateway-api";

const { observer } = MobxReact;

const {
  Component: { BadgeBoolean, DrawerItem, DrawerTitle, LinkToObject },
} = Renderer;

function routeRef(namespace: string | undefined, kind: string, name: string) {
  return {
    apiVersion: "gateway.networking.k8s.io/v1",
    kind,
    name,
    namespace,
  };
}

export const GatewayDetails = observer((props: Renderer.Component.KubeObjectDetailsProps<Gateway>) => {
  const { object } = props;
  const namespace = object.getNs();

  return (
    <>
      <DrawerItem name="Gateway Class">
        <LinkToObject object={object} objectRef={routeRef(undefined, "GatewayClass", object.getClassName())} />
      </DrawerItem>
      <DrawerItem name="Ready">
        <BadgeBoolean value={object.isReady()} />
      </DrawerItem>
      <DrawerItem name="Addresses">{object.getAddresses().join(", ") || "-"}</DrawerItem>
      <DrawerTitle>Listeners</DrawerTitle>
      {object.getListeners().map((listener) => (
        <DrawerItem key={listener.name} name={listener.name}>
          {`${listener.protocol}:${listener.port} ${listener.hostname ?? "*"}`}
        </DrawerItem>
      ))}
      {object.getListeners().length === 0 ? <DrawerItem name="Listeners">-</DrawerItem> : null}
      <DrawerItem name="Namespace">{namespace ?? "-"}</DrawerItem>
    </>
  );
});
