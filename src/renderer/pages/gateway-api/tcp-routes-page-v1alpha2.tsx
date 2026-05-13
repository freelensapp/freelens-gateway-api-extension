import { TCPRoute } from "../../k8s/gateway-api";
import { createStreamRoutePage } from "./stream-route-page-factory";

export const TCPRoutesPage = createStreamRoutePage<TCPRoute>(TCPRoute);
