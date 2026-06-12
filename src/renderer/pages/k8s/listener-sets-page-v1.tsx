import { Renderer } from "@freelensapp/extensions";
import { ListenerSet } from "../../api/k8s";
import { withErrorPage } from "../../components/error-page";
import { observer } from "../../observer";
import styles from "./listener-sets-page-v1.module.scss";
import stylesInline from "./listener-sets-page-v1.module.scss?inline";
import { type GatewayPageProps, namespaceCell } from "./shared";

const {
  Component: { BadgeBoolean, KubeObjectAge, KubeObjectListLayout, WithTooltip },
} = Renderer;

function isAccepted(item: ListenerSet): boolean {
  return (item.status?.conditions ?? []).some(
    (condition) => condition.type === "Accepted" && condition.status === "True",
  );
}

function isProgrammed(item: ListenerSet): boolean {
  return (item.status?.conditions ?? []).some(
    (condition) => condition.type === "Programmed" && condition.status === "True",
  );
}

export const ListenerSetsPage = observer((props: GatewayPageProps) =>
  withErrorPage(props, () => {
    const store = ListenerSet.getStore<ListenerSet>();

    return (
      <>
        <style>{stylesInline}</style>
        <KubeObjectListLayout<ListenerSet, any>
          tableId={`${ListenerSet.crd.plural}Table`}
          className={styles.page}
          store={store}
          sortingCallbacks={{
            name: (item: ListenerSet) => item.getName(),
            namespace: (item: ListenerSet) => item.getNs() ?? "",
            accepted: (item: ListenerSet) => String(isAccepted(item)),
            programmed: (item: ListenerSet) => String(isProgrammed(item)),
            age: (item: ListenerSet) => item.getCreationTimestamp(),
          }}
          searchFilters={[(item: ListenerSet) => item.getSearchFields()]}
          renderHeaderTitle={ListenerSet.crd.title}
          renderTableHeader={[
            { title: "Name", sortBy: "name", className: styles.name },
            { title: "Namespace", sortBy: "namespace", className: styles.namespace },
            { title: "Accepted", sortBy: "accepted", className: styles.accepted },
            { title: "Programmed", sortBy: "programmed", className: styles.programmed },
            { title: "Age", sortBy: "age", className: styles.age },
          ]}
          renderTableContents={(item: ListenerSet) => [
            <WithTooltip>{item.getName()}</WithTooltip>,
            namespaceCell(item.getNs()),
            <BadgeBoolean value={isAccepted(item)} />,
            <BadgeBoolean value={isProgrammed(item)} />,
            <KubeObjectAge object={item} key="age" />,
          ]}
        />
      </>
    );
  }),
);
