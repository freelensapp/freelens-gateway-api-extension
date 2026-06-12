import { Renderer } from "@freelensapp/extensions";
import { type BackendRef, type ParentReference } from "../../api/k8s/types";
import { withErrorPage } from "../../components/error-page";
import { observer } from "../../observer";
import { formatBackendRefs, formatParentRefs, type GatewayPageProps, namespaceCell } from "./shared";

const {
  Component: { BadgeBoolean, KubeObjectAge, KubeObjectListLayout, WithTooltip },
} = Renderer;

interface HasSpecWithParentRefs {
  spec?: {
    parentRefs?: ParentReference[];
    commonParentRefs?: ParentReference[];
  };
}

interface HasSpecWithRules {
  spec?: {
    rules?: Array<{ backendRefs?: BackendRef[] }>;
  };
}

interface HasStatusWithParents {
  status?: {
    parents?: Array<{
      conditions?: Array<{ type: string; status: string }>;
    }>;
  };
}

function getParentRefs(item: HasSpecWithParentRefs): ParentReference[] {
  const spec = item.spec ?? {};

  return [...(spec.commonParentRefs ?? []), ...(spec.parentRefs ?? [])];
}

function getBackendRefs(item: HasSpecWithRules): BackendRef[] {
  return (item.spec?.rules ?? []).flatMap((rule) => rule?.backendRefs ?? []);
}

function isAccepted(item: HasStatusWithParents): boolean {
  return (item.status?.parents ?? []).some((parent) =>
    (parent?.conditions ?? []).some((condition) => condition.type === "Accepted" && condition.status === "True"),
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
            parentRefs: (item: T) => formatParentRefs(getParentRefs(item)),
            backends: (item: T) => formatBackendRefs(getBackendRefs(item)),
            accepted: (item: T) => String(isAccepted(item)),
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
            <WithTooltip>{formatParentRefs(getParentRefs(item))}</WithTooltip>,
            <WithTooltip>{formatBackendRefs(getBackendRefs(item))}</WithTooltip>,
            <BadgeBoolean value={isAccepted(item)} />,
            <KubeObjectAge object={item} key="age" />,
          ]}
        />
      );
    }),
  );
}
