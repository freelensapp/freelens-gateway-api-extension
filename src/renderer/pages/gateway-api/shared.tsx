import { Renderer } from "@freelensapp/extensions";

const {
  Component: { LinkToNamespace, WithTooltip },
} = Renderer;

export interface GatewayPageProps {
  extension: Renderer.LensExtension;
}

export function formatParentRefs(parentRefs: Array<{ kind: string; name: string }>): string {
  if (parentRefs.length === 0) {
    return "-";
  }

  return parentRefs.map((parentRef) => `${parentRef.kind}/${parentRef.name}`).join(", ");
}

export function formatBackendRefs(backendRefs: Array<{ kind?: string; name: string }>): string {
  if (backendRefs.length === 0) {
    return "-";
  }

  return backendRefs.map((backendRef) => `${backendRef.kind ?? "Service"}/${backendRef.name}`).join(", ");
}

export function namespaceCell(namespace: string | undefined) {
  if (!namespace) {
    return <WithTooltip>-</WithTooltip>;
  }

  return <LinkToNamespace namespace={namespace} />;
}
