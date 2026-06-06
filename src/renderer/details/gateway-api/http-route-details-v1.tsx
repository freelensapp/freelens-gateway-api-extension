import { Renderer } from "@freelensapp/extensions";
import { HTTPRoute } from "../../k8s/gateway-api";
import { observer } from "../../observer";
import { RouteDetails } from "./shared-route-details";

function getHostnames(object: HTTPRoute): string[] {
  return object.spec?.hostnames ?? [];
}

function getParentRefs(object: HTTPRoute): any[] {
  return object.spec?.parentRefs ?? [];
}

function getBackends(object: HTTPRoute): any[] {
  return (object.spec?.rules ?? []).flatMap((rule) => rule?.backendRefs ?? []);
}

function isAccepted(object: HTTPRoute): boolean {
  return (object.status?.parents ?? []).some((parent) =>
    (parent?.conditions ?? []).some((condition) => condition?.type === "Accepted" && condition?.status === "True"),
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
