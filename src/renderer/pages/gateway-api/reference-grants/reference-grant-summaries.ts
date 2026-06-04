export interface ReferenceGrantSummarySpec {
  from?: Array<{ group?: string; kind: string; namespace?: string }>;
  to?: Array<{ group?: string; kind: string; name?: string }>;
}

export interface ReferenceGrantRowSummaries {
  from: string;
  to: string;
}

function formatReferenceGrantFromEntry(entry: { kind: string; namespace?: string }): string {
  return `${entry.namespace ?? ""}/${entry.kind}`;
}

function formatReferenceGrantFromSummary(spec: ReferenceGrantSummarySpec | undefined): string {
  const from = spec?.from ?? [];

  if (from.length === 0) {
    return "-";
  }

  return from.map(formatReferenceGrantFromEntry).join(", ");
}

function formatReferenceGrantToEntry(entry: { kind: string; name?: string }): string {
  return entry.name ? `${entry.kind}/${entry.name}` : entry.kind;
}

function formatReferenceGrantToSummary(spec: ReferenceGrantSummarySpec | undefined): string {
  const to = spec?.to ?? [];

  if (to.length === 0) {
    return "-";
  }

  return to.map(formatReferenceGrantToEntry).join(", ");
}

export function getReferenceGrantRowSummaries(spec: ReferenceGrantSummarySpec | undefined): ReferenceGrantRowSummaries {
  return {
    from: formatReferenceGrantFromSummary(spec),
    to: formatReferenceGrantToSummary(spec),
  };
}
