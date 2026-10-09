import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { GatewayApiEvents } from "../components/gateway-api-events";
import { InfoPage } from "../components/info-page";
import { PieChart } from "../components/pie-chart";
import styles from "./overview.module.scss";
import { getAvailableResource, kinds, type Resource } from "./overview-kinds";

const {
  Component: { NamespaceSelectFilter, TabLayout },
} = Renderer;

export interface OverviewPageProps {
  extension: Renderer.LensExtension;
}

export const OverviewPage = observer(({ extension }: OverviewPageProps) => {
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
    (versions: Resource[]) => {
      const available = getAvailableResource(versions);
      if (!available) return null;
      const { resource, store } = available;
      if (!getCrd(store)) return null;

      const items = store.contextItems;

      return (
        <div key={resource.crd.plural} className={styles.chartColumn} hidden={!items.length}>
          <PieChart
            title={resource.crd.title}
            objects={items}
            onTitleClick={() => void extension.navigate(resource.crd.singular)}
          />
        </div>
      );
    },
    [getCrd, extension],
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

      for (const versions of kinds) {
        const store = getAvailableResource(versions)?.store;
        if (!store) continue;
        try {
          await store.loadAll({ namespaces, reqInit: { signal } });
          watches.current.push(store.subscribe());
        } catch (_) {
          // a kind that fails to load has no chart
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
    <TabLayout>
      <div className={styles.overviewContent}>
        <header>
          <h5>Gateway API Overview</h5>
          <NamespaceSelectFilter id="gateway-api-overview-namespace-select-filter-input" />
        </header>

        <div className={styles.overviewStatuses}>
          <div className={styles.statuses}>{kinds.map((versions) => getChart(versions))}</div>
        </div>

        <GatewayApiEvents compact compactLimit={100} />
      </div>
    </TabLayout>
  );
});
