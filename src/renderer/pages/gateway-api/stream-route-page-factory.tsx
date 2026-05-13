import { Renderer } from "@freelensapp/extensions";
import { withErrorPage } from "../../components/error-page";
import { observer } from "../../observer";
import { formatBackendRefs, formatParentRefs, type GatewayPageProps, namespaceCell } from "./shared";

const {
  Component: { BadgeBoolean, KubeObjectAge, KubeObjectListLayout, WithTooltip },
} = Renderer;

function getParentRefs(item: any): any[] {
  if (typeof item?.getParentRefs === "function") {
    return item.getParentRefs();
  }

  const spec = item?.spec ?? {};

  return [...(spec.commonParentRefs ?? []), ...(spec.parentRefs ?? [])];
}

function getBackendRefs(item: any): any[] {
  if (typeof item?.getBackendRefs === "function") {
    return item.getBackendRefs();
  }

  return (item?.spec?.rules ?? []).flatMap((rule: any) => rule?.backendRefs ?? []);
}

function isAccepted(item: any): boolean {
  if (typeof item?.isAccepted === "function") {
    return Boolean(item.isAccepted());
  }

  return (item?.status?.parents ?? []).some((parent: any) =>
    (parent?.conditions ?? []).some((condition: any) => condition?.type === "Accepted" && condition?.status === "True"),
  );
}

export function createStreamRoutePage<T extends Renderer.K8sApi.LensExtensionKubeObject<any, any, any>>(
  KubeObject: {
    crd: { plural: string; title: string };
    getStore: () => any;
  },
  getHostnames?: (item: T) => string[],
) {
  return observer((props: GatewayPageProps) =>
    withErrorPage(props, () => {
      const store = KubeObject.getStore();

      return (
        <KubeObjectListLayout<T, any>
          tableId={`${KubeObject.crd.plural}Table`}
          className={`${KubeObject.crd.plural}Page`}
          store={store}
          sortingCallbacks={{
            name: (item: T) => item.getName(),
            namespace: (item: T) => item.getNs() ?? "",
            hostnames: (item: T) => getHostnames?.(item)?.join(",") ?? "",
            parentRefs: (item: T) => formatParentRefs(getParentRefs(item as any)),
            backends: (item: T) => formatBackendRefs(getBackendRefs(item as any)),
            accepted: (item: T) => String(isAccepted(item as any)),
            age: (item: T) => item.getCreationTimestamp(),
          }}
          searchFilters={[(item: T) => item.getSearchFields(), (item: T) => getHostnames?.(item) ?? []]}
          renderHeaderTitle={KubeObject.crd.title}
          renderTableHeader={[
            { title: "Name", sortBy: "name" },
            { title: "Namespace", sortBy: "namespace" },
            ...(getHostnames ? [{ title: "Hostnames", sortBy: "hostnames" as const }] : []),
            { title: "Parent Refs", sortBy: "parentRefs" },
            { title: "Backends", sortBy: "backends" },
            { title: "Accepted", sortBy: "accepted" },
            { title: "Age", sortBy: "age" },
          ]}
          renderTableContents={(item: T) => [
            <WithTooltip>{item.getName()}</WithTooltip>,
            namespaceCell(item.getNs()),
            ...(getHostnames ? [<WithTooltip>{getHostnames(item).join(", ") || "*"}</WithTooltip>] : []),
            <WithTooltip>{formatParentRefs(getParentRefs(item as any))}</WithTooltip>,
            <WithTooltip>{formatBackendRefs(getBackendRefs(item as any))}</WithTooltip>,
            <BadgeBoolean value={isAccepted(item as any)} />,
            <KubeObjectAge object={item} key="age" />,
          ]}
        />
      );
    }),
  );
}
