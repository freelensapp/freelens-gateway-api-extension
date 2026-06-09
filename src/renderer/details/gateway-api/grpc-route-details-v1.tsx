import { Renderer } from "@freelensapp/extensions";
import { GRPCRoute } from "../../k8s/gateway-api";
import { observer } from "../../observer";

export const GRPCRouteDetails = observer((props: Renderer.Component.KubeObjectDetailsProps<GRPCRoute>) => {
  const { object } = props;

  return object ? <></> : null;
});
