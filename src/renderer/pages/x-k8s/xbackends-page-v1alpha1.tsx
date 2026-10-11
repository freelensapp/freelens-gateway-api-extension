import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import { XBackend } from "../../api/x-k8s";
import { formatBackendPort, isBackendAccepted } from "../../api/x-k8s/xbackend-v1alpha1";
import { withErrorPage } from "../../components/error-page";
import { type GatewayPageProps, namespaceCell } from "../k8s/shared";
import styles from "./xbackends-page-v1alpha1.module.scss";

const {
  Component: { BadgeBoolean, KubeObjectAge, KubeObjectListLayout, WithTooltip },
} = Renderer;

function getHostname(item: XBackend): string {
  return item.spec?.externalHostname?.hostname ?? "-";
}

function getProtocol(item: XBackend): string {
  return item.spec?.protocol ?? "-";
}

function getTLSMode(item: XBackend): string {
  return item.spec?.tls?.mode ?? "-";
}

export const XBackendsPage = observer((props: GatewayPageProps) =>
  withErrorPage(props, () => {
    const store = XBackend.getStore<XBackend>();

    return (
      <KubeObjectListLayout<XBackend, any>
        tableId={`${XBackend.crd.plural}Table`}
        className={styles.page}
        store={store}
        sortingCallbacks={{
          name: (item: XBackend) => item.getName(),
          namespace: (item: XBackend) => item.getNs() ?? "",
          type: (item: XBackend) => item.spec?.type ?? "",
          hostname: (item: XBackend) => getHostname(item),
          port: (item: XBackend) => item.spec?.port?.port ?? 0,
          protocol: (item: XBackend) => getProtocol(item),
          tlsMode: (item: XBackend) => getTLSMode(item),
          accepted: (item: XBackend) => String(isBackendAccepted(item.status)),
          age: (item: XBackend) => item.getCreationTimestamp(),
        }}
        searchFilters={[(item: XBackend) => item.getSearchFields(), (item: XBackend) => getHostname(item)]}
        renderHeaderTitle={XBackend.crd.title}
        renderTableHeader={[
          { title: "Name", sortBy: "name", className: styles.name },
          { title: "Namespace", sortBy: "namespace", className: styles.namespace },
          { title: "Type", sortBy: "type", className: styles.type },
          { title: "Hostname", sortBy: "hostname", className: styles.hostname },
          { title: "Port", sortBy: "port", className: styles.port },
          { title: "Protocol", sortBy: "protocol", className: styles.protocol },
          { title: "TLS Mode", sortBy: "tlsMode", className: styles.tlsMode },
          { title: "Accepted", sortBy: "accepted", className: styles.accepted },
          { title: "Age", sortBy: "age", className: styles.age },
        ]}
        renderTableContents={(item: XBackend) => [
          <WithTooltip>{item.getName()}</WithTooltip>,
          namespaceCell(item.getNs()),
          <WithTooltip>{item.spec?.type ?? "-"}</WithTooltip>,
          <WithTooltip>{getHostname(item)}</WithTooltip>,
          <WithTooltip>{formatBackendPort(item.spec?.port)}</WithTooltip>,
          getProtocol(item),
          getTLSMode(item),
          <BadgeBoolean value={isBackendAccepted(item.status)} />,
          <KubeObjectAge object={item} key="age" />,
        ]}
      />
    );
  }),
);
