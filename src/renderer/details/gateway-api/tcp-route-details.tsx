import { Renderer } from "@freelensapp/extensions";
import * as MobxReact from "mobx-react";
import { TCPRoute } from "../../k8s/gateway-api";
import { RouteDetails } from "./shared-route-details";

const { observer } = MobxReact;

export const TCPRouteDetails = observer((props: Renderer.Component.KubeObjectDetailsProps<TCPRoute>) => {
  const { object } = props;

  return (
    <RouteDetails
      object={object}
      parentRefs={object.getParentRefs()}
      backends={object.getBackendRefs()}
      accepted={object.isAccepted()}
    />
  );
});
