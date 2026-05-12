import { Renderer } from "@freelensapp/extensions";
import * as MobxReact from "mobx-react";
import { withErrorPage } from "../components/error-page";
import { Example, type ExampleApi } from "../k8s/example/example-v1alpha2";
import styles from "./examples-page.module.scss";
import stylesInline from "./examples-page.module.scss?inline";

const { observer } = MobxReact;

const {
  Component: { BadgeBoolean, KubeObjectAge, KubeObjectListLayout, LinkToNamespace, WithTooltip },
} = Renderer;

const KubeObject = Example;
type KubeObject = Example;
type KubeObjectApi = ExampleApi;

const sortingCallbacks = {
  name: (object: KubeObject) => object.getName(),
  namespace: (object: KubeObject) => object.getNs(),
  resumed: (object: KubeObject) => String(!KubeObject.getSuspended(object)),
  title: (object: KubeObject) => KubeObject.getTitle(object),
  age: (object: KubeObject) => object.getCreationTimestamp(),
};

const renderTableHeader: { title: string; sortBy: keyof typeof sortingCallbacks; className?: string }[] = [
  { title: "Name", sortBy: "name" },
  { title: "Namespace", sortBy: "namespace" },
  { title: "Resumed", sortBy: "resumed", className: styles.resumed },
  { title: "Title", sortBy: "title", className: styles.title },
  { title: "Age", sortBy: "age", className: styles.age },
];

export interface ExamplesPageProps {
  extension: Renderer.LensExtension;
}

export const ExamplesPage = observer((props: ExamplesPageProps) =>
  withErrorPage(props, () => {
    const store = KubeObject.getStore<KubeObject>();

    return (
      <>
        <style>{stylesInline}</style>
        <KubeObjectListLayout<KubeObject, KubeObjectApi>
          tableId={`${KubeObject.crd.plural}Table`}
          className={styles.page}
          store={store}
          sortingCallbacks={sortingCallbacks}
          searchFilters={[(object: KubeObject) => object.getSearchFields()]}
          renderHeaderTitle={KubeObject.crd.title}
          renderTableHeader={renderTableHeader}
          renderTableContents={(object: KubeObject) => [
            <WithTooltip>{object.getName()}</WithTooltip>,
            <LinkToNamespace namespace={object.getNs()} />,
            <BadgeBoolean value={!KubeObject.getSuspended(object)} />,
            <WithTooltip>{KubeObject.getTitle(object) ?? "N/A"}</WithTooltip>,
            <KubeObjectAge object={object} key="age" />,
          ]}
        />
      </>
    );
  }),
);
