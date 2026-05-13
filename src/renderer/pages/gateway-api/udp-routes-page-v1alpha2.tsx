import { UDPRoute } from "../../k8s/gateway-api";
import { createStreamRoutePage } from "./stream-route-page-factory";

export const UDPRoutesPage = createStreamRoutePage<UDPRoute>(UDPRoute);
