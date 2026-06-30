import { Renderer } from "@freelensapp/extensions";
import { ProxySettingsPolicy } from "../../api/nginx";
import { observer } from "../../observer";
import styles from "../k8s/common.module.scss";
import stylesInline from "../k8s/common.module.scss?inline";

const {
  Component: { BadgeBoolean, DrawerItem, DrawerTitle },
} = Renderer;

export const ProxySettingsPolicyDetails = observer(
  (props: Renderer.Component.KubeObjectDetailsProps<ProxySettingsPolicy>) => {
    const { object } = props;
    const buffering = object.spec?.buffering;
    const timeout = object.spec?.timeout;

    return (
      <>
        <style>{stylesInline}</style>
        <div className={styles.details}>
          {buffering && (
            <>
              <DrawerTitle>Buffering</DrawerTitle>
              <DrawerItem name="Disabled">
                <BadgeBoolean value={buffering.disable ?? false} />
              </DrawerItem>
              <DrawerItem name="Buffer Size">{buffering.bufferSize ?? "-"}</DrawerItem>
              {buffering.buffers && (
                <>
                  <DrawerItem name="Buffers Number">{buffering.buffers.number ?? "-"}</DrawerItem>
                  <DrawerItem name="Buffers Size">{buffering.buffers.size ?? "-"}</DrawerItem>
                </>
              )}
              <DrawerItem name="Busy Buffers Size">{buffering.busyBuffersSize ?? "-"}</DrawerItem>
            </>
          )}

          {timeout && (
            <>
              <DrawerTitle>Timeout</DrawerTitle>
              <DrawerItem name="Connect">{timeout.connect ?? "-"}</DrawerItem>
              <DrawerItem name="Read">{timeout.read ?? "-"}</DrawerItem>
              <DrawerItem name="Send">{timeout.send ?? "-"}</DrawerItem>
            </>
          )}

          {!buffering && !timeout && <DrawerItem name="Spec">No settings configured</DrawerItem>}
        </div>
      </>
    );
  },
);
