import { Renderer } from "@freelensapp/extensions";
import * as MobxReact from "mobx-react";
import { withErrorPage } from "../../components/error-page";
import { GatewayClass } from "../../k8s/gateway-api";
import { type GatewayPageProps } from "./shared";

const { observer } = MobxReact;

const {
  Component: { BadgeBoolean, KubeObjectAge, KubeObjectListLayout, WithTooltip },
} = Renderer;

export const GatewayClassesPage = observer((props: GatewayPageProps) =>
  withErrorPage(props, () => {
    const store = GatewayClass.getStore<GatewayClass>();

    return (
      <KubeObjectListLayout<GatewayClass, any>
        tableId={`${GatewayClass.crd.plural}Table`}
        className="GatewayClassesPage"
        store={store}
        sortingCallbacks={{
          name: (item: GatewayClass) => item.getName(),
          controller: (item: GatewayClass) => item.getControllerName(),
          accepted: (item: GatewayClass) => String(item.isAccepted()),
          default: (item: GatewayClass) => String(item.isDefault),
          age: (item: GatewayClass) => item.getCreationTimestamp(),
        }}
        searchFilters={[(item: GatewayClass) => item.getSearchFields()]}
        renderHeaderTitle={GatewayClass.crd.title}
        renderTableHeader={[
          { title: "Name", sortBy: "name" },
          { title: "Controller", sortBy: "controller" },
          { title: "Accepted", sortBy: "accepted" },
          { title: "Default", sortBy: "default" },
          { title: "Age", sortBy: "age" },
        ]}
        renderTableContents={(item: GatewayClass) => [
          <WithTooltip>{item.getName()}</WithTooltip>,
          <WithTooltip>{item.getControllerName()}</WithTooltip>,
          <BadgeBoolean value={item.isAccepted()} />,
          <BadgeBoolean value={item.isDefault} />,
          <KubeObjectAge object={item} key="age" />,
        ]}
      />
    );
  }),
);
