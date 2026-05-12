import { BackendTLSPolicy } from "../../k8s/gateway-api";
import { createPolicyPage } from "./policy-page-factory";

function getTargetsText(item: BackendTLSPolicy): string {
  const targetRefs =
    typeof (item as any).getTargetRefs === "function"
      ? (item as any).getTargetRefs()
      : ((item as any).spec?.targetRefs ?? []);

  return targetRefs.map((targetRef: any) => `${targetRef.kind}/${targetRef.name}`).join(", ") || "-";
}

export const BackendTLSPoliciesPage = createPolicyPage<BackendTLSPolicy>(BackendTLSPolicy, getTargetsText);
