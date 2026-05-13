import { Renderer } from "@freelensapp/extensions";
import { UDPRoute } from "../../k8s/gateway-api";
import { observer } from "../../observer";
import { RouteDetails } from "./shared-route-details";

function getParentRefs(object: UDPRoute): any[] {
  if (typeof (object as any).getParentRefs === "function") {
    return (object as any).getParentRefs();
  }

  const spec = (object as any).spec ?? {};

  return [...(spec.commonParentRefs ?? []), ...(spec.parentRefs ?? [])];
}

function getBackends(object: UDPRoute): any[] {
  if (typeof (object as any).getBackendRefs === "function") {
    return (object as any).getBackendRefs();
  }

  return ((object as any).spec?.rules ?? []).flatMap((rule: any) => rule?.backendRefs ?? []);
}

function isAccepted(object: UDPRoute): boolean {
  return typeof (object as any).isAccepted === "function"
    ? Boolean((object as any).isAccepted())
    : (((object as any).status?.parents ?? []) as any[]).some((parent: any) =>
        (parent?.conditions ?? []).some(
          (condition: any) => condition?.type === "Accepted" && condition?.status === "True",
        ),
      );
}

export const UDPRouteDetails = observer((props: Renderer.Component.KubeObjectDetailsProps<UDPRoute>) => {
  const { object } = props;

  return (
    <RouteDetails
      object={object}
      parentRefs={getParentRefs(object)}
      backends={getBackends(object)}
      accepted={isAccepted(object)}
    />
  );
});
