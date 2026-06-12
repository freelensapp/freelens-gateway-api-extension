import { Renderer } from "@freelensapp/extensions";
import { XMesh } from "../../api/x-k8s";
import { withErrorPage } from "../../components/error-page";
import { observer } from "../../observer";
import { type GatewayPageProps } from "../k8s/shared";
import styles from "./xmeshes-page-v1alpha1.module.scss";
import stylesInline from "./xmeshes-page-v1alpha1.module.scss?inline";

const {
  Component: { BadgeBoolean, KubeObjectAge, KubeObjectListLayout, WithTooltip },
} = Renderer;

function getControllerName(item: XMesh): string {
  return item.spec?.controllerName ?? "";
}

function isAccepted(item: XMesh): boolean {
  return (item.status?.conditions ?? []).some(
    (condition) => condition?.type === "Accepted" && condition?.status === "True",
  );
}

export const XMeshesPage = observer((props: GatewayPageProps) =>
  withErrorPage(props, () => {
    const store = XMesh.getStore<XMesh>();

    return (
      <>
        <style>{stylesInline}</style>
        <KubeObjectListLayout<XMesh, any>
          tableId={`${XMesh.crd.plural}Table`}
          className={styles.page}
          store={store}
          sortingCallbacks={{
            name: (item: XMesh) => item.getName(),
            controller: (item: XMesh) => getControllerName(item),
            accepted: (item: XMesh) => String(isAccepted(item)),
            age: (item: XMesh) => item.getCreationTimestamp(),
          }}
          searchFilters={[(item: XMesh) => item.getSearchFields()]}
          renderHeaderTitle={XMesh.crd.title}
          renderTableHeader={[
            { title: "Name", sortBy: "name", className: styles.name },
            { title: "Controller", sortBy: "controller", className: styles.controller },
            { title: "Accepted", sortBy: "accepted", className: styles.accepted },
            { title: "Age", sortBy: "age", className: styles.age },
          ]}
          renderTableContents={(item: XMesh) => [
            <WithTooltip>{item.getName()}</WithTooltip>,
            <WithTooltip>{getControllerName(item)}</WithTooltip>,
            <BadgeBoolean value={isAccepted(item)} />,
            <KubeObjectAge object={item} key="age" />,
          ]}
        />
      </>
    );
  }),
);
