import { Renderer } from "@freelensapp/extensions";
import { withErrorPage } from "../components/error-page";
import { Example } from "../k8s/example/example-v1alpha2";

const {
  Component: { MenuItem, Icon },
} = Renderer;

export interface ExampleActiveToggleMenuItemProps extends Renderer.Component.KubeObjectMenuProps<Example> {
  extension: Renderer.LensExtension;
}

export const ExampleActiveToggleMenuItem = (props: ExampleActiveToggleMenuItemProps) =>
  withErrorPage(props, () => {
    const { object, toolbar } = props;

    if (!object) return <></>;

    const store = Example.getStore<Example>();

    const disable = async () => {
      await store.patch(
        object,
        {
          spec: {
            suspended: true,
          },
        },
        "merge",
      );
    };

    const enable = async () => {
      await store.patch(
        object,
        {
          spec: {
            suspended: false,
          },
        },
        "merge",
      );
    };

    if (object.spec.suspended) {
      return (
        <MenuItem onClick={enable}>
          <Icon material="play_circle_outline" interactive={toolbar} title="Resume" />
          <span className="title">Resume</span>
        </MenuItem>
      );
    } else {
      return (
        <MenuItem onClick={disable}>
          <Icon material="pause_circle_filled" interactive={toolbar} title="Suspend" />
          <span className="title">Suspend</span>
        </MenuItem>
      );
    }
  });
