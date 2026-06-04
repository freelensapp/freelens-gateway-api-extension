import { TCPRoute } from "../../k8s/gateway-api";
import { createStreamRoutePage } from "./stream-route-page-factory";

function getHostnames(item: TCPRoute): string[] {
  return typeof (item as any).getHostnames === "function"
    ? (item as any).getHostnames()
    : ((item as any).spec?.hostnames ?? []);
}

export const TCPRoutesPage = createStreamRoutePage<TCPRoute>(TCPRoute, getHostnames);
