import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import { Gateway, HTTPRoute } from "../../api/k8s";
import { withErrorPage } from "../../components/error-page";
import { getHTTPRouteLinks, type HTTPRouteLink } from "./http-route-links";
import styles from "./http-routes-page-v1.module.scss";
import { type GatewayPageProps, namespaceCell } from "./shared";

const {
  Component: { BadgeBoolean, KubeObjectAge, KubeObjectListLayout, WithTooltip },
} = Renderer;

function isAccepted(item: HTTPRoute): boolean {
  return (
    item.status?.parents?.some((parent) =>
      parent.conditions?.some((condition) => condition.type === "Accepted" && condition.status === "True"),
    ) ?? false
  );
}

// The host throws when the cluster does not serve the Gateway CRD. The routes
// are listed without links then.
function getGatewayStore() {
  try {
    return Gateway.getStore<Gateway>();
  } catch (_) {
    return undefined;
  }
}

// As the host renders the rules of an Ingress: the link opens in the browser
// and does not open the details of the row.
function renderLinks(links: HTTPRouteLink[]) {
  return links.map((link, index) => (
    <span key={link.text}>
      {index > 0 && ", "}
      {link.url ? (
        <a href={link.url} rel="noreferrer" target="_blank" onClick={(event) => event.stopPropagation()}>
          {link.text}
        </a>
      ) : (
        link.text
      )}
    </span>
  ));
}

export const HTTPRoutesPage = observer((props: GatewayPageProps) =>
  withErrorPage(props, () => {
    const store = HTTPRoute.getStore<HTTPRoute>();
    const gatewayStore = getGatewayStore();
    const getLinkTexts = (item: HTTPRoute) => getHTTPRouteLinks(item, gatewayStore?.items).map((link) => link.text);

    return (
      <KubeObjectListLayout<HTTPRoute, any>
        tableId={`${HTTPRoute.crd.plural}Table`}
        className={styles.page}
        store={store}
        dependentStores={gatewayStore ? [gatewayStore] : []}
        sortingCallbacks={{
          name: (item: HTTPRoute) => item.getName(),
          namespace: (item: HTTPRoute) => item.getNs() ?? "",
          routes: (item: HTTPRoute) => getLinkTexts(item).join(","),
          accepted: (item: HTTPRoute) => String(isAccepted(item)),
          age: (item: HTTPRoute) => item.getCreationTimestamp(),
        }}
        searchFilters={[(item: HTTPRoute) => item.getSearchFields(), getLinkTexts]}
        renderHeaderTitle={HTTPRoute.crd.title}
        renderTableHeader={[
          { title: "Name", sortBy: "name", className: styles.name },
          { title: "Namespace", sortBy: "namespace", className: styles.namespace },
          { title: "Routes", sortBy: "routes", className: styles.routes },
          { title: "Accepted", sortBy: "accepted", className: styles.accepted },
          { title: "Age", sortBy: "age", className: styles.age },
        ]}
        renderTableContents={(item: HTTPRoute) => [
          <WithTooltip>{item.getName()}</WithTooltip>,
          namespaceCell(item.getNs()),
          <WithTooltip>{renderLinks(getHTTPRouteLinks(item, gatewayStore?.items))}</WithTooltip>,
          <BadgeBoolean value={isAccepted(item)} />,
          <KubeObjectAge object={item} key="age" />,
        ]}
      />
    );
  }),
);
