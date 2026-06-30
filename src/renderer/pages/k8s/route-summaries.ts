export function formatParentRefs(parentRefs: Array<{ kind?: string; name: string }>): string {
  if (parentRefs.length === 0) {
    return "-";
  }

  return parentRefs.map((parentRef) => `${parentRef.kind ?? "Gateway"}/${parentRef.name}`).join(", ");
}

export function formatBackendRefs(backendRefs: Array<{ kind?: string; name: string }>): string {
  if (backendRefs.length === 0) {
    return "-";
  }

  return backendRefs.map((backendRef) => `${backendRef.kind ?? "Service"}/${backendRef.name}`).join(", ");
}
