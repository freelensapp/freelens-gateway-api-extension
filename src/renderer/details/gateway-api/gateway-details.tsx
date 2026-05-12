import { Renderer } from "@freelensapp/extensions";
import * as MobxReact from "mobx-react";
import { Gateway } from "../../k8s/gateway-api";

const { observer } = MobxReact;

const {
  Component: { BadgeBoolean, DrawerItem, DrawerTitle, LinkToObject },
} = Renderer;

function getClassName(object: Gateway): string {
  return typeof (object as any).getClassName === "function"
    ? (object as any).getClassName()
    : ((object as any).spec?.gatewayClassName ?? "");
}

function isReady(object: Gateway): boolean {
  return typeof (object as any).isReady === "function"
    ? Boolean((object as any).isReady())
    : ((object as any).status?.conditions ?? []).some(
        (condition: any) => condition?.type === "Ready" && condition?.status === "True",
      );
}

function getAddresses(object: Gateway): string[] {
  return typeof (object as any).getAddresses === "function"
    ? (object as any).getAddresses()
    : ((object as any).status?.addresses ?? []).map((address: any) => address?.value).filter(Boolean);
}

function getListeners(object: Gateway): any[] {
  return typeof (object as any).getListeners === "function"
    ? (object as any).getListeners()
    : ((object as any).spec?.listeners ?? []);
}

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
  const listeners = getListeners(object);

  return (
    <>
      <DrawerItem name="Gateway Class">
        <LinkToObject object={object} objectRef={routeRef(undefined, "GatewayClass", getClassName(object))} />
      </DrawerItem>
      <DrawerItem name="Ready">
        <BadgeBoolean value={isReady(object)} />
      </DrawerItem>
      <DrawerItem name="Addresses">{getAddresses(object).join(", ") || "-"}</DrawerItem>
      <DrawerTitle>Listeners</DrawerTitle>
      {listeners.map((listener) => (
        <DrawerItem key={listener.name} name={listener.name}>
          {`${listener.protocol}:${listener.port} ${listener.hostname ?? "*"}`}
        </DrawerItem>
      ))}
      {listeners.length === 0 ? <DrawerItem name="Listeners">-</DrawerItem> : null}
      <DrawerItem name="Namespace">{namespace ?? "-"}</DrawerItem>
    </>
  );
});
