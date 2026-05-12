import { TLSRoute } from "../../k8s/gateway-api";
import { createStreamRoutePage } from "./stream-route-page-factory";

function getHostnames(item: TLSRoute): string[] {
  return typeof (item as any).getHostnames === "function"
    ? (item as any).getHostnames()
    : ((item as any).spec?.hostnames ?? []);
}

export const TLSRoutesPage = createStreamRoutePage<TLSRoute>(TLSRoute, getHostnames);
