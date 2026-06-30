import { type BackendRef, type ParentReference } from "../../api/k8s/types";

export interface HasSpecWithParentRefs {
  spec?: {
    parentRefs?: ParentReference[];
    commonParentRefs?: ParentReference[];
  };
}

export interface HasSpecWithRules {
  spec?: {
    rules?: Array<{ backendRefs?: BackendRef[] }>;
  };
}

export interface HasStatusWithParents {
  status?: {
    parents?: Array<{
      conditions?: Array<{ type: string; status: string }>;
    }>;
  };
}

export function getParentRefs(item: HasSpecWithParentRefs): ParentReference[] {
  const spec = item.spec ?? {};

  return [...(spec.commonParentRefs ?? []), ...(spec.parentRefs ?? [])];
}

export function getBackendRefs(item: HasSpecWithRules): BackendRef[] {
  return (item.spec?.rules ?? []).flatMap((rule) => rule?.backendRefs ?? []);
}

export function isAccepted(item: HasStatusWithParents): boolean {
  return (item.status?.parents ?? []).some((parent) =>
    (parent?.conditions ?? []).some((condition) => condition.type === "Accepted" && condition.status === "True"),
  );
}
