import { Common, Renderer } from "@freelensapp/extensions";
import { useState } from "react";
import { observer } from "../observer";

const {
  Component: {
    KubeObjectListLayout,
    Icon,
    KubeObjectAge,
    NamespaceSelectBadge,
    WithTooltip,
    TabLayout,
    ReactiveDuration,
  },
  Navigation: { getDetailsUrl, navigate },
  K8sApi: { eventStore, apiManager },
} = Renderer;

const {
  Util: { cssNames, stopPropagation },
} = Common;

const columnId = {
  message: "message",
  namespace: "namespace",
  object: "object",
  type: "type",
  count: "count",
  source: "source",
  age: "age",
  lastSeen: "last-seen",
} as const;

interface Sorting {
  sortBy: string;
  orderBy: "asc" | "desc";
}

/**
 * Events belonging to Gateway API resources are recognized by the API group of
 * their involved object (gateway.networking.k8s.io and the experimental
 * gateway.networking.x-k8s.io group).
 */
function isGatewayApiEvent(event: Renderer.K8sApi.KubeEvent): boolean {
  return event?.involvedObject?.apiVersion?.includes("gateway.networking.") ?? false;
}

const sortingCallbacks: Record<string, (event: Renderer.K8sApi.KubeEvent) => string | number> = {
  [columnId.namespace]: (event) => event.getNs() ?? "",
  [columnId.type]: (event) => event.type ?? "",
  [columnId.object]: (event) => event.involvedObject.name,
  [columnId.count]: (event) => event.count ?? 0,
  [columnId.age]: (event) => -event.getCreationTimestamp(),
  [columnId.lastSeen]: (event) => (event.lastTimestamp ? -new Date(event.lastTimestamp).getTime() : 0),
};

export interface GatewayApiEventsProps {
  className?: string;
  compact?: boolean;
  compactLimit?: number;
}

export const GatewayApiEvents = observer((props: GatewayApiEventsProps) => {
  const { compact, compactLimit, className, ...layoutProps } = props;

  const [sorting, setSorting] = useState<Sorting>({ sortBy: columnId.age, orderBy: "asc" });

  const items = (() => {
    const filtered = eventStore.contextItems.filter(isGatewayApiEvent);
    const callback = sortingCallbacks[sorting.sortBy];

    if (!callback) {
      return filtered;
    }

    return [...filtered].sort((a, b) => {
      const valA = callback(a);
      const valB = callback(b);
      if (valA === valB) return 0;
      const compare = valA > valB ? 1 : -1;
      return sorting.orderBy === "asc" ? compare : -compare;
    });
  })();

  const visibleItems = compact ? items.slice(0, compactLimit) : items;

  const customizeHeader = ({ info, title, ...headerPlaceholders }: any) => {
    const allEventsAreShown = visibleItems.length === items.length;

    if (compact) {
      if (allEventsAreShown) {
        return { title };
      }

      return {
        title,
        info: (
          <span>
            {"("}
            {visibleItems.length}
            {" of "}
            {items.length}
            {")"}
          </span>
        ),
      };
    }

    return {
      info: (
        <>
          {info}
          <Icon small material="help_outline" className="help-icon" tooltip={`Limited to ${eventStore.limit}`} />
        </>
      ),
      title,
      ...headerPlaceholders,
    };
  };

  const events = (
    <KubeObjectListLayout
      {...layoutProps}
      isConfigurable
      tableId="gateway-api-events"
      store={eventStore}
      className={cssNames("Events", className, { compact })}
      renderHeaderTitle="Gateway API Events"
      customizeHeader={customizeHeader}
      isSelectable={false}
      getItems={() => visibleItems}
      virtual={!compact}
      tableProps={{
        sortSyncWithUrl: false,
        sortByDefault: sorting,
        onSort: (params: Sorting) => setSorting(params),
      }}
      sortingCallbacks={sortingCallbacks}
      searchFilters={[
        (event: Renderer.K8sApi.KubeEvent) => event.getSearchFields(),
        (event: Renderer.K8sApi.KubeEvent) => event.message ?? "",
        (event: Renderer.K8sApi.KubeEvent) => event.getSource(),
        (event: Renderer.K8sApi.KubeEvent) => event.involvedObject.name,
      ]}
      renderTableHeader={[
        { title: "Type", className: "type", sortBy: columnId.type, id: columnId.type },
        { title: "Message", className: "message", id: columnId.message },
        { title: "Namespace", className: "namespace", sortBy: columnId.namespace, id: columnId.namespace },
        { title: "Involved Object", className: "object", sortBy: columnId.object, id: columnId.object },
        { title: "Source", className: "source", id: columnId.source },
        { title: "Count", className: "count", sortBy: columnId.count, id: columnId.count },
        { title: "Age", className: "age", sortBy: columnId.age, id: columnId.age },
        { title: "Last Seen", className: "last-seen", sortBy: columnId.lastSeen, id: columnId.lastSeen },
      ]}
      renderTableContents={(event: Renderer.K8sApi.KubeEvent) => {
        const { involvedObject, type, message } = event;
        const isWarning = event.isWarning();
        const detailsUrl = getDetailsUrl(apiManager.lookupApiLink(involvedObject, event));

        return [
          <WithTooltip>{type}</WithTooltip>,
          {
            className: cssNames({ warning: isWarning }),
            title: <WithTooltip>{message}</WithTooltip>,
          },
          <NamespaceSelectBadge key="namespace" namespace={event.getNs()} />,
          <a
            key="link"
            onClick={(e) => {
              stopPropagation(e);
              navigate(detailsUrl);
            }}
          >
            <WithTooltip>{`${involvedObject.kind}: ${involvedObject.name}`}</WithTooltip>
          </a>,
          <WithTooltip>{event.getSource()}</WithTooltip>,
          event.count,
          <KubeObjectAge key="age" object={event} />,
          <ReactiveDuration key="last-seen" timestamp={event.lastTimestamp} />,
        ];
      }}
    />
  );

  if (compact) {
    return events;
  }

  return <TabLayout>{events}</TabLayout>;
});
