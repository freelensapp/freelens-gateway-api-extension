import { Renderer } from "@freelensapp/extensions";
import { withErrorPage } from "../../components/error-page";
import { ReferenceGrant } from "../../k8s/gateway-api";
import { observer } from "../../observer";
import { type GatewayPageProps, namespaceCell } from "./shared";

const {
  Component: { KubeObjectAge, KubeObjectListLayout, WithTooltip },
} = Renderer;

function getFromCount(item: ReferenceGrant): number {
  return typeof (item as any).getFromCount === "function"
    ? (item as any).getFromCount()
    : ((item as any).spec?.from ?? []).length;
}

function getToCount(item: ReferenceGrant): number {
  return typeof (item as any).getToCount === "function"
    ? (item as any).getToCount()
    : ((item as any).spec?.to ?? []).length;
}

export const ReferenceGrantsPage = observer((props: GatewayPageProps) =>
  withErrorPage(props, () => {
    const store = ReferenceGrant.getStore<ReferenceGrant>();

    return (
      <KubeObjectListLayout<ReferenceGrant, any>
        tableId={`${ReferenceGrant.crd.plural}Table`}
        className="ReferenceGrantsPage"
        store={store}
        sortingCallbacks={{
          name: (item: ReferenceGrant) => item.getName(),
          namespace: (item: ReferenceGrant) => item.getNs() ?? "",
          from: (item: ReferenceGrant) => getFromCount(item),
          to: (item: ReferenceGrant) => getToCount(item),
          age: (item: ReferenceGrant) => item.getCreationTimestamp(),
        }}
        searchFilters={[(item: ReferenceGrant) => item.getSearchFields()]}
        renderHeaderTitle={ReferenceGrant.crd.title}
        renderTableHeader={[
          { title: "Name", sortBy: "name" },
          { title: "Namespace", sortBy: "namespace" },
          { title: "From", sortBy: "from" },
          { title: "To", sortBy: "to" },
          { title: "Age", sortBy: "age" },
        ]}
        renderTableContents={(item: ReferenceGrant) => [
          <WithTooltip>{item.getName()}</WithTooltip>,
          namespaceCell(item.getNs()),
          <WithTooltip>{String(getFromCount(item))}</WithTooltip>,
          <WithTooltip>{String(getToCount(item))}</WithTooltip>,
          <KubeObjectAge object={item} key="age" />,
        ]}
      />
    );
  }),
);
