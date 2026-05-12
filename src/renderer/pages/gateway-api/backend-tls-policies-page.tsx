import { BackendTLSPolicy } from "../../k8s/gateway-api";
import { createPolicyPage } from "./policy-page-factory";

export const BackendTLSPoliciesPage = createPolicyPage<BackendTLSPolicy>(
  BackendTLSPolicy,
  (item) =>
    item
      .getTargetRefs()
      .map((targetRef) => `${targetRef.kind}/${targetRef.name}`)
      .join(", ") || "-",
);
