/**
 * Status categorization for Gateway API resources.
 *
 * Gateway API resources report their state through `Condition`s, but the
 * location of those conditions depends on the resource:
 *
 * - Top-level `status.conditions[]`: Gateway, GatewayClass, ListenerSet, Mesh
 * - `status.parents[].conditions[]`: HTTPRoute, GRPCRoute, TCPRoute, TLSRoute, UDPRoute
 * - `status.ancestors[].conditions[]` (modelled here as `status.conditions[].conditions[]`):
 *   BackendTLSPolicy, BackendTrafficPolicy and other policy resources
 *
 * ReferenceGrant has no status and is therefore not categorizable.
 *
 * Condition reasons are defined by the upstream Gateway API Go types
 * (sigs.k8s.io/gateway-api/apis/v1: gateway_types.go, gatewayclass_types.go,
 * shared_types.go, and the policy condition reasons). The reasons that
 * indicate transient/in-progress states (rather than a terminal failure) are
 * collected in `inProgressReasons` below:
 *
 * - GatewayClass `Accepted`: Accepted, InvalidParameters, Unsupported, Pending, Waiting
 * - Gateway `Accepted`: Accepted, Invalid, NoResources, Pending, UnsupportedAddress,
 *   ListenersNotValid
 * - Gateway `Programmed`: Programmed, Invalid, NoResources, Pending, AddressNotAssigned,
 *   AddressNotUsable
 * - Route `Accepted`: Accepted, NotAllowedByListeners, NoMatchingListenerHostname,
 *   NoMatchingParent, UnsupportedValue, Pending, GatewayNotProgrammed
 * - Route `ResolvedRefs`: ResolvedRefs, RefNotPermitted, InvalidKind, BackendNotFound,
 *   UnsupportedProtocol
 * - Policy `Accepted`: Accepted, Invalid, Pending
 */

export type GatewayApiStatusCategory = "Ready" | "NotReady" | "InProgress" | "Unknown";

/**
 * Condition reasons that represent a transient / in-progress state rather than a
 * terminal failure. When such a reason is present the resource is reported as
 * "In Progress" even if the corresponding condition status is `False`.
 */
const inProgressReasons = new Set<string>([
  "Pending",
  "Waiting",
  "Reconciling",
  "NotReconciled",
  "GatewayNotProgrammed",
]);

interface NormalizedCondition {
  status: string;
  reason: string;
}

function toRecord(value: unknown): Record<string, unknown> | undefined {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : undefined;
}

function pushCondition(target: NormalizedCondition[], value: unknown): void {
  const condition = toRecord(value);
  if (!condition || typeof condition.status !== "string") {
    return;
  }
  target.push({
    status: condition.status,
    reason: typeof condition.reason === "string" ? condition.reason : "",
  });
}

/**
 * Collects all conditions from a Gateway API resource status, regardless of
 * whether they live at the top level, under `parents[]`, or under nested
 * ancestor entries.
 */
function collectConditions(status: unknown): NormalizedCondition[] {
  const record = toRecord(status);
  if (!record) {
    return [];
  }

  const conditions: NormalizedCondition[] = [];

  // Top-level conditions (Gateway, GatewayClass, ListenerSet, Mesh) and
  // nested ancestor conditions (policies expose `status.ancestors[].conditions[]`
  // which is modelled here as `status.conditions[].conditions[]`).
  if (Array.isArray(record.conditions)) {
    for (const entry of record.conditions) {
      const entryRecord = toRecord(entry);
      if (entryRecord && Array.isArray(entryRecord.conditions)) {
        for (const nested of entryRecord.conditions) {
          pushCondition(conditions, nested);
        }
      } else {
        pushCondition(conditions, entry);
      }
    }
  }

  // Route conditions live under each parent reference.
  if (Array.isArray(record.parents)) {
    for (const parent of record.parents) {
      const parentRecord = toRecord(parent);
      if (parentRecord && Array.isArray(parentRecord.conditions)) {
        for (const nested of parentRecord.conditions) {
          pushCondition(conditions, nested);
        }
      }
    }
  }

  return conditions;
}

function isInProgress(condition: NormalizedCondition): boolean {
  return condition.status === "Unknown" || inProgressReasons.has(condition.reason);
}

/**
 * Computes a coarse status category for any Gateway API resource based on its
 * conditions. Resources without conditions (not yet reconciled, or without a
 * status subresource such as ReferenceGrant) are reported as "Unknown".
 */
export function getStatusCategory(object: { status?: unknown }): GatewayApiStatusCategory {
  const conditions = collectConditions(object.status);

  if (conditions.length === 0) {
    return "Unknown";
  }

  if (conditions.some((condition) => condition.status === "False" && !inProgressReasons.has(condition.reason))) {
    return "NotReady";
  }

  if (conditions.some(isInProgress)) {
    return "InProgress";
  }

  if (conditions.every((condition) => condition.status === "True")) {
    return "Ready";
  }

  return "Unknown";
}
