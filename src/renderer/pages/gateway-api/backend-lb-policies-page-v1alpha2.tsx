import { BackendLBPolicy } from "../../k8s/gateway-api";
import { createPolicyPage } from "./policy-page-factory";

function getTargetText(item: BackendLBPolicy): string {
  const targetRef =
    typeof (item as any).getTargetRef === "function" ? (item as any).getTargetRef() : (item as any).spec?.targetRef;

  return targetRef ? `${targetRef.kind}/${targetRef.name}` : "-";
}

export const BackendLBPoliciesPage = createPolicyPage<BackendLBPolicy>(BackendLBPolicy, getTargetText);
