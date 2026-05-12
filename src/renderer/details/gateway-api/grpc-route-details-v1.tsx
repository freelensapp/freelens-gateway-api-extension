import { Renderer } from "@freelensapp/extensions";
import * as MobxReact from "mobx-react";
import { GRPCRoute } from "../../k8s/gateway-api";
import { RouteDetails } from "./shared-route-details";

const { observer } = MobxReact;

function getHostnames(object: GRPCRoute): string[] {
  return typeof (object as any).getHostnames === "function"
    ? (object as any).getHostnames()
    : ((object as any).spec?.hostnames ?? []);
}

function getParentRefs(object: GRPCRoute): any[] {
  if (typeof (object as any).getParentRefs === "function") {
    return (object as any).getParentRefs();
  }

  const spec = (object as any).spec ?? {};

  return [...(spec.commonParentRefs ?? []), ...(spec.parentRefs ?? [])];
}

function getBackends(object: GRPCRoute): any[] {
  if (typeof (object as any).getBackendRefs === "function") {
    return (object as any).getBackendRefs();
  }

  return ((object as any).spec?.rules ?? []).flatMap((rule: any) => rule?.backendRefs ?? []);
}

function isAccepted(object: GRPCRoute): boolean {
  return typeof (object as any).isAccepted === "function"
    ? Boolean((object as any).isAccepted())
    : (((object as any).status?.parents ?? []) as any[]).some((parent: any) =>
        (parent?.conditions ?? []).some(
          (condition: any) => condition?.type === "Accepted" && condition?.status === "True",
        ),
      );
}

export const GRPCRouteDetails = observer((props: Renderer.Component.KubeObjectDetailsProps<GRPCRoute>) => {
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
