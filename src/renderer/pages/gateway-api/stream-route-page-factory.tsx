import { Renderer } from "@freelensapp/extensions";
import * as MobxReact from "mobx-react";
import { withErrorPage } from "../../components/error-page";
import { formatBackendRefs, formatParentRefs, type GatewayPageProps, namespaceCell } from "./shared";

const { observer } = MobxReact;

const {
  Component: { BadgeBoolean, KubeObjectAge, KubeObjectListLayout, WithTooltip },
} = Renderer;

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
            parentRefs: (item: T) => formatParentRefs((item as any).getParentRefs()),
            backends: (item: T) => formatBackendRefs((item as any).getBackendRefs()),
            accepted: (item: T) => String((item as any).isAccepted()),
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
            <WithTooltip>{formatParentRefs((item as any).getParentRefs())}</WithTooltip>,
            <WithTooltip>{formatBackendRefs((item as any).getBackendRefs())}</WithTooltip>,
            <BadgeBoolean value={(item as any).isAccepted()} />,
            <KubeObjectAge object={item} key="age" />,
          ]}
        />
      );
    }),
  );
}
