import { Common, Renderer } from "@freelensapp/extensions";
import styles from "./available-version.module.scss";
import stylesInline from "./available-version.module.scss?inline";

export interface AvailableVersionPageProps {
  extension: Renderer.LensExtension;
}

/**
 * Configuration for a single API version variant.
 */
interface VersionVariant<T extends AvailableVersionPageProps> {
  kubeObjectClass: typeof Renderer.K8sApi.LensExtensionKubeObject<any, any, any>;
  PageComponent: React.ComponentType<T>;
  version: string;
}

/**
 * Creates a page component that automatically selects the correct API version based on cluster availability.
 *
 * Tries versions in order and renders the first available one.
 * Shows a helpful message if no versions are available (CRD not installed).
 *
 * @param resourceName - Human-readable resource name (e.g., "OCI Repositories")
 * @param variants - Array of version variants, ordered by preference
 * @returns A page component that auto-detects a valid API version if present
 *
 * @example
 * ```tsx
 * createAvailableVersionPage(
 *   "Examples",
 *   [
 *     { kubeObjectClass: ExamplesV1alpha2, PageComponent: ExamplesV1alpha2, version: "v1alpha2" },
 *     { kubeObjectClass: ExamplesV1alpha1, PageComponent: ExamplesV1alpha1, version: "v1alpha1" },
 *   ]
 * );
 * ```
 */
export function createAvailableVersionPage<T extends AvailableVersionPageProps>(
  resourceName: string,
  variants: VersionVariant<T>[],
): React.ComponentType<T> {
  return (props: T) => {
    for (const variant of variants) {
      try {
        const store = variant.kubeObjectClass.getStore();
        if (store) {
          Common.logger.debug(
            `[@freelensapp/example-extension]: Rendering ${resourceName} page with API version ${variant.version}`,
          );
          return <variant.PageComponent {...props} />;
        }
      } catch (error) {
        Common.logger.debug(
          `[@freelensapp/example-extension]: API version ${variant.version} not available for ${resourceName}: ${error}`,
        );
      }
    }

    // No version available - CRD not installed in cluster
    const triedVersions = variants.map((v) => v.version).join(", ");
    Common.logger.info(
      `[@freelensapp/example-extension]: ${resourceName} CRD not found in cluster (tried versions: ${triedVersions})`,
    );

    return (
      <>
        <style>{stylesInline}</style>
        <div className={styles.unavailablePage}>
          <div className={styles.unavailableContent}>
            <h3 className={styles.unavailableTitle}>{resourceName} Not Available</h3>
            <p className={styles.unavailableMessage}>
              The <strong>{resourceName}</strong> CRDs are not installed in this cluster.
            </p>
            <p className={styles.unavailableDetails}>
              Tried API versions: <code>{triedVersions}</code>
            </p>
          </div>
        </div>
      </>
    );
  };
}
