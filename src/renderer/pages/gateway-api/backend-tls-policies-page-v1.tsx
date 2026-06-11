import { BackendTLSPolicy } from "../../k8s/gateway-api";
import { createPolicyPage } from "./policy-page-factory";

function getTargetsText(item: BackendTLSPolicy): string {
  const targetRefs = item.spec?.targetRefs ?? [];

  return targetRefs.map((targetRef) => `${targetRef.kind}/${targetRef.name}`).join(", ") || "-";
}

export const BackendTLSPoliciesPage = createPolicyPage<BackendTLSPolicy>(BackendTLSPolicy, getTargetsText);
