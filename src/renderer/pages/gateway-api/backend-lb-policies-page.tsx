import { BackendLBPolicy } from "../../k8s/gateway-api";
import { createPolicyPage } from "./policy-page-factory";

export const BackendLBPoliciesPage = createPolicyPage<BackendLBPolicy>(
  BackendLBPolicy,
  (item) => `${item.getTargetRef().kind}/${item.getTargetRef().name}`,
);
