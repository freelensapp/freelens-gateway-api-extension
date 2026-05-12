import { Renderer } from "@freelensapp/extensions";
import * as MobxReact from "mobx-react";
import { HTTPRoute } from "../../k8s/gateway-api";
import { RouteDetails } from "./shared-route-details";

const { observer } = MobxReact;

export const HTTPRouteDetails = observer((props: Renderer.Component.KubeObjectDetailsProps<HTTPRoute>) => {
  const { object } = props;

  return (
    <RouteDetails
      object={object}
      hostnames={object.getHostnames()}
      parentRefs={object.getParentRefs()}
      backends={object.getBackendRefs()}
      accepted={object.isAccepted()}
    />
  );
});
