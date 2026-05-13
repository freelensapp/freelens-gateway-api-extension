import { Renderer } from "@freelensapp/extensions";

const {
  Component: { BadgeBoolean, DrawerItem, DrawerTitle, LinkToObject },
} = Renderer;

export interface RouteDetailsProps {
  object: Renderer.K8sApi.LensExtensionKubeObject<any, any, any>;
  hostnames?: string[];
  parentRefs: Array<{ kind: string; name: string; namespace?: string; sectionName?: string }>;
  backends: Array<{ kind?: string; name: string; namespace?: string; port?: number; weight?: number }>;
  accepted: boolean;
}

function routeRef(namespace: string | undefined, kind: string, name: string) {
  return {
    apiVersion: "gateway.networking.k8s.io/v1",
    kind,
    name,
    namespace,
  };
}

export function RouteDetails({ object, hostnames, parentRefs, backends, accepted }: RouteDetailsProps) {
  const objectNs = object.getNs();

  return (
    <>
      {hostnames ? <DrawerItem name="Hostnames">{hostnames.join(", ") || "*"}</DrawerItem> : null}
      <DrawerItem name="Accepted">
        <BadgeBoolean value={accepted} />
      </DrawerItem>
      <DrawerTitle>Parent References</DrawerTitle>
      {parentRefs.map((parentRef, index) => {
        const namespace = parentRef.namespace || objectNs;

        return (
          <DrawerItem key={`${parentRef.kind}-${parentRef.name}-${index}`} name={`${parentRef.kind} ${index + 1}`}>
            <LinkToObject object={object} objectRef={routeRef(namespace, parentRef.kind, parentRef.name)} />
          </DrawerItem>
        );
      })}
      {parentRefs.length === 0 ? <DrawerItem name="Parent References">-</DrawerItem> : null}
      <DrawerTitle>Backend References</DrawerTitle>
      {backends.map((backend, index) => {
        const kind = backend.kind ?? "Service";
        const namespace = backend.namespace || objectNs;

        return (
          <DrawerItem key={`${kind}-${backend.name}-${index}`} name={`${kind} ${index + 1}`}>
            <LinkToObject
              object={object}
              objectRef={{
                apiVersion: "v1",
                kind,
                name: backend.name,
                namespace,
              }}
            />
          </DrawerItem>
        );
      })}
      {backends.length === 0 ? <DrawerItem name="Backend References">-</DrawerItem> : null}
    </>
  );
}
