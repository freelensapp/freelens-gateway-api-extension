import { Renderer } from "@freelensapp/extensions";

export { formatBackendRefs, formatParentRefs } from "./route-summaries";

const {
  Component: { LinkToNamespace, WithTooltip },
} = Renderer;

export interface GatewayPageProps {
  extension: Renderer.LensExtension;
}

export function namespaceCell(namespace: string | undefined) {
  if (!namespace) {
    return <WithTooltip>-</WithTooltip>;
  }

  return <LinkToNamespace namespace={namespace} />;
}
