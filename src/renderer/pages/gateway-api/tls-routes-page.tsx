import { TLSRoute } from "../../k8s/gateway-api";
import { createStreamRoutePage } from "./stream-route-page-factory";

export const TLSRoutesPage = createStreamRoutePage<TLSRoute>(TLSRoute, (item) => item.getHostnames());
