import { Renderer } from "@freelensapp/extensions";
import * as MobxReact from "mobx-react";
import { ExamplePreferencesStore } from "../../common/store";
import { withErrorPage } from "../components/error-page";

import type { Example } from "../k8s/example/example-v1alpha2";

const { observer } = MobxReact;

const {
  Component: { BadgeBoolean, DrawerItem, MarkdownViewer },
} = Renderer;

export interface ExampleDetailsProps extends Renderer.Component.KubeObjectDetailsProps<Example> {
  extension: Renderer.LensExtension;
}

export const ExampleDetails = observer((props: ExampleDetailsProps) =>
  withErrorPage(props, () => {
    const { object } = props;
    const preferences = ExamplePreferencesStore.getInstance<ExamplePreferencesStore>();

    return (
      <>
        <DrawerItem name="Api Version">v1alpha2</DrawerItem>
        <DrawerItem name="Description">
          <MarkdownViewer markdown={object.spec.description ?? ""} />
        </DrawerItem>
        <DrawerItem name="Example checkbox">
          <BadgeBoolean value={preferences.enabled} />
        </DrawerItem>
      </>
    );
  }),
);
