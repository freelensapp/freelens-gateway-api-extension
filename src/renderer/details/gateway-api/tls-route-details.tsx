import { Renderer } from "@freelensapp/extensions";
import * as MobxReact from "mobx-react";
import { TLSRoute } from "../../k8s/gateway-api";
import { RouteDetails } from "./shared-route-details";

const { observer } = MobxReact;

export const TLSRouteDetails = observer((props: Renderer.Component.KubeObjectDetailsProps<TLSRoute>) => {
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
