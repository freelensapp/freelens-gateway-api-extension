import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import { useCallback, useEffect, useState } from "react";
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
    // One controller and one list of watches per run of the effect: React.StrictMode,
    // which Freelens dev renders in, runs it, cleans it up and runs it again on the
    // same instance, and a controller kept across runs would stay aborted.
    const abortController = new AbortController();
    const signal = abortController.signal;
    const watches: (() => void)[] = [];

    (async () => {
      const crdStore = Renderer.K8sApi.crdStore;
      const loadedCrds = (await crdStore.loadAll()) || [];
      if (!signal.aborted) setCrds(loadedCrds);

      const namespaceStore = Renderer.K8sApi.namespaceStore;
      await namespaceStore.loadAll({ namespaces: [], reqInit: { signal } });
      if (signal.aborted) return;
      watches.push(namespaceStore.subscribe());

      const namespaces = namespaceStore.items.map((ns) => ns.getName());

      for (const versions of kinds) {
        const store = getAvailableResource(versions)?.store;
        if (!store) continue;
        try {
          await store.loadAll({ namespaces, reqInit: { signal } });
          if (signal.aborted) return;
          watches.push(store.subscribe());
        } catch (_) {
          // a kind that fails to load has no chart
        }
      }

      try {
        const eventStore = Renderer.K8sApi.eventStore;
        await eventStore.loadAll({ namespaces, reqInit: { signal } });
        if (signal.aborted) return;
        watches.push(eventStore.subscribe());
      } catch (_) {
        // events are best-effort
      }

      if (!signal.aborted) setLoaded(true);
    })();

    return () => {
      abortController.abort();
      watches.forEach((unsubscribe) => unsubscribe());
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
