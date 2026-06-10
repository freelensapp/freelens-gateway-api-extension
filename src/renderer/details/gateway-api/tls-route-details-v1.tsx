import { Renderer } from "@freelensapp/extensions";
import { TLSRoute } from "../../k8s/gateway-api";
import { observer } from "../../observer";
import { RouteDetails } from "./shared-route-details";

function getHostnames(object: TLSRoute): string[] {
  return object.spec?.hostnames ?? [];
}

function getParentRefs(object: TLSRoute): any[] {
  return (object.spec?.parentRefs ?? []).map((ref) => ({
    ...ref,
    kind: ref.kind ?? "Gateway",
  }));
}

function getBackendRefs(object: TLSRoute): any[] {
  return (object.spec?.rules ?? []).flatMap((rule) => rule.backendRefs ?? []);
}

function isAccepted(object: TLSRoute): boolean {
  return (
    object.status?.parents?.some((parent) =>
      parent.conditions?.some((condition) => condition.type === "Accepted" && condition.status === "True"),
    ) ?? false
  );
}

export const TLSRouteDetails = observer((props: Renderer.Component.KubeObjectDetailsProps<TLSRoute>) => {
  const { object } = props;

  return (
    <RouteDetails
      object={object}
      hostnames={getHostnames(object)}
      parentRefs={getParentRefs(object)}
      backends={getBackendRefs(object)}
      accepted={isAccepted(object)}
    />
  );
});
