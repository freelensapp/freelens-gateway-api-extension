import { Renderer } from "@freelensapp/extensions";
import { HTTPRoute } from "../../k8s/gateway-api";
import { observer } from "../../observer";
import { RouteDetails } from "./shared-route-details";

function getHostnames(object: HTTPRoute): string[] {
  return typeof (object as any).getHostnames === "function"
    ? (object as any).getHostnames()
    : ((object as any).spec?.hostnames ?? []);
}

function getParentRefs(object: HTTPRoute): any[] {
  if (typeof (object as any).getParentRefs === "function") {
    return (object as any).getParentRefs();
  }

  const spec = (object as any).spec ?? {};

  return [...(spec.commonParentRefs ?? []), ...(spec.parentRefs ?? [])];
}

function getBackends(object: HTTPRoute): any[] {
  if (typeof (object as any).getBackendRefs === "function") {
    return (object as any).getBackendRefs();
  }

  return ((object as any).spec?.rules ?? []).flatMap((rule: any) => rule?.backendRefs ?? []);
}

function isAccepted(object: HTTPRoute): boolean {
  return typeof (object as any).isAccepted === "function"
    ? Boolean((object as any).isAccepted())
    : (((object as any).status?.parents ?? []) as any[]).some((parent: any) =>
        (parent?.conditions ?? []).some(
          (condition: any) => condition?.type === "Accepted" && condition?.status === "True",
        ),
      );
}

export const HTTPRouteDetails = observer((props: Renderer.Component.KubeObjectDetailsProps<HTTPRoute>) => {
  const { object } = props;

  return (
    <RouteDetails
      object={object}
      hostnames={getHostnames(object)}
      parentRefs={getParentRefs(object)}
      backends={getBackends(object)}
      accepted={isAccepted(object)}
    />
  );
});
