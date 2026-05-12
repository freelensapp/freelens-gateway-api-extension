import { Renderer } from "@freelensapp/extensions";
import * as MobxReact from "mobx-react";
import { withErrorPage } from "../../components/error-page";
import { ReferenceGrant } from "../../k8s/gateway-api";
import { type GatewayPageProps, namespaceCell } from "./shared";

const { observer } = MobxReact;

const {
  Component: { KubeObjectAge, KubeObjectListLayout, WithTooltip },
} = Renderer;

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
          from: (item: ReferenceGrant) => item.getFromCount(),
          to: (item: ReferenceGrant) => item.getToCount(),
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
          <WithTooltip>{String(item.getFromCount())}</WithTooltip>,
          <WithTooltip>{String(item.getToCount())}</WithTooltip>,
          <KubeObjectAge object={item} key="age" />,
        ]}
      />
    );
  }),
);
