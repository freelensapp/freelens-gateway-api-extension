import { Common, Renderer } from "@freelensapp/extensions";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  BackendTLSPolicy as BackendTLSPolicy_v1,
  Gateway as Gateway_v1,
  GatewayClass as GatewayClass_v1,
  GRPCRoute as GRPCRoute_v1,
  HTTPRoute as HTTPRoute_v1,
  ListenerSet as ListenerSet_v1,
  TCPRoute as TCPRoute_v1alpha2,
  TLSRoute as TLSRoute_v1,
  UDPRoute as UDPRoute_v1alpha2,
} from "../api/k8s";
import { XBackendTrafficPolicy as XBackendTrafficPolicy_v1alpha1, XMesh as XMesh_v1alpha1 } from "../api/x-k8s";
import { GatewayApiEvents } from "../components/gateway-api-events";
import { InfoPage } from "../components/info-page";
import { PieChart } from "../components/pie-chart";
import { observer } from "../observer";
import styles from "./overview.module.scss";
import stylesInline from "./overview.module.scss?inline";

const {
  Component: { NamespaceSelectFilter, TabLayout },
} = Renderer;

const {
  Util: { cssNames },
} = Common;

// Resources whose status can be summarized. ReferenceGrant is omitted because
// it has no status subresource.
const resources = [
  GatewayClass_v1,
  Gateway_v1,
  HTTPRoute_v1,
  GRPCRoute_v1,
  TCPRoute_v1alpha2,
  TLSRoute_v1,
  UDPRoute_v1alpha2,
  ListenerSet_v1,
  BackendTLSPolicy_v1,
  XBackendTrafficPolicy_v1alpha1,
  XMesh_v1alpha1,
];

export interface OverviewPageProps {
  extension?: Renderer.LensExtension;
}

export const OverviewPage = observer((_props: OverviewPageProps) => {
  const [crds, setCrds] = useState<Renderer.K8sApi.CustomResourceDefinition[]>([]);
  const [loaded, setLoaded] = useState(false);
  const watches = useRef<(() => void)[]>([]);
  const abortController = useRef(new AbortController());

  const getCrd = useCallback(
    (store: Renderer.K8sApi.KubeObjectStore) => {
      return crds.find((crd) => crd.spec.names.kind === store.api.kind && crd.spec.group === store.api.apiGroup);
    },
    [crds],
  );

  const getChart = useCallback(
    (resource: (typeof resources)[number]) => {
      try {
        const store = resource.getStore();
        if (!store) return null;
        const crd = getCrd(store);
        if (!crd) return null;

        const items = store.contextItems;

        return (
          <div key={resource.crd.plural} className={cssNames(styles.chartColumn, "column")} hidden={!items.length}>
            <PieChart title={resource.crd.title} objects={items} crd={crd} />
          </div>
        );
      } catch (_) {
        return null;
      }
    },
    [getCrd],
  );

  useEffect(() => {
    let isMounted = true;
    const signal = abortController.current.signal;

    (async () => {
      const crdStore = Renderer.K8sApi.crdStore;
      const loadedCrds = (await crdStore.loadAll()) || [];
      if (isMounted) setCrds(loadedCrds);

      const namespaceStore = Renderer.K8sApi.namespaceStore;
      await namespaceStore.loadAll({ namespaces: [], reqInit: { signal } });
      watches.current.push(namespaceStore.subscribe());

      const namespaces = namespaceStore.items.map((ns) => ns.getName());

      for (const resource of resources) {
        try {
          const store = resource.getStore();
          if (!store) continue;
          await store.loadAll({ namespaces, reqInit: { signal } });
          watches.current.push(store.subscribe());
        } catch (_) {
          continue;
        }
      }

      try {
        const eventStore = Renderer.K8sApi.eventStore;
        await eventStore.loadAll({ namespaces, reqInit: { signal } });
        watches.current.push(eventStore.subscribe());
      } catch (_) {
        // events are best-effort
      }

      if (isMounted) setLoaded(true);
    })();

    return () => {
      isMounted = false;
      abortController.current.abort();
      watches.current.forEach((unsubscribe) => unsubscribe());
      watches.current = [];
    };
  }, []);

  if (!loaded && crds.length === 0) {
    return <InfoPage message="Loading Gateway API resources..." />;
  }

  return (
    <>
      <style>{stylesInline}</style>
      <TabLayout>
        <div className={styles.overviewContent}>
          <header>
            <h5>Gateway API Overview</h5>
            <NamespaceSelectFilter id="gateway-api-overview-namespace-select-filter-input" />
          </header>

          <div className={styles.overviewStatuses}>
            <div className={styles.statuses}>{resources.map((resource) => getChart(resource))}</div>
          </div>

          <GatewayApiEvents compact compactLimit={100} />
        </div>
      </TabLayout>
    </>
  );
});
