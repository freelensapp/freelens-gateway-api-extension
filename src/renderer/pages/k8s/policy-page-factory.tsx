import { Renderer } from "@freelensapp/extensions";
import { withErrorPage } from "../../components/error-page";
import { observer } from "../../observer";
import { type GatewayPageProps, namespaceCell } from "./shared";

const {
  Component: { BadgeBoolean, KubeObjectAge, KubeObjectListLayout, WithTooltip },
} = Renderer;

interface HasStatusConditions {
  status?: {
    conditions?: Array<{ type: string; status: string }>;
  };
}

function isAccepted(item: HasStatusConditions): boolean {
  return (item.status?.conditions ?? []).some(
    (condition) => condition.type === "Accepted" && condition.status === "True",
  );
}

export function createPolicyPage<T extends Renderer.K8sApi.LensExtensionKubeObject<any, any, any>>(
  KubeObject: {
    crd: { plural: string; title: string };
    getStore: () => any;
  },
  getTargets: (item: T) => string,
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
            targets: (item: T) => getTargets(item),
            accepted: (item: T) => String(isAccepted(item)),
            age: (item: T) => item.getCreationTimestamp(),
          }}
          searchFilters={[(item: T) => item.getSearchFields()]}
          renderHeaderTitle={KubeObject.crd.title}
          renderTableHeader={[
            { title: "Name", sortBy: "name" },
            { title: "Namespace", sortBy: "namespace" },
            { title: "Targets", sortBy: "targets" },
            { title: "Accepted", sortBy: "accepted" },
            { title: "Age", sortBy: "age" },
          ]}
          renderTableContents={(item: T) => [
            <WithTooltip>{item.getName()}</WithTooltip>,
            namespaceCell(item.getNs()),
            <WithTooltip>{getTargets(item)}</WithTooltip>,
            <BadgeBoolean value={isAccepted(item)} />,
            <KubeObjectAge object={item} key="age" />,
          ]}
        />
      );
    }),
  );
}
