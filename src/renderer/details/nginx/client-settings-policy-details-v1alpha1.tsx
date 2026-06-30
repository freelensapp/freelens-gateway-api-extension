import { Renderer } from "@freelensapp/extensions";
import { ClientSettingsPolicy } from "../../api/nginx";
import { observer } from "../../observer";
import styles from "../k8s/common.module.scss";
import stylesInline from "../k8s/common.module.scss?inline";

const {
  Component: { DrawerItem, DrawerTitle },
} = Renderer;

export const ClientSettingsPolicyDetails = observer(
  (props: Renderer.Component.KubeObjectDetailsProps<ClientSettingsPolicy>) => {
    const { object } = props;
    const body = object.spec?.body;
    const keepAlive = object.spec?.keepAlive;

    return (
      <>
        <style>{stylesInline}</style>
        <div className={styles.details}>
          {body && (
            <>
              <DrawerTitle>Body</DrawerTitle>
              <DrawerItem name="Max Size">{body.maxSize ?? "-"}</DrawerItem>
              <DrawerItem name="Timeout">{body.timeout ?? "-"}</DrawerItem>
            </>
          )}

          {keepAlive && (
            <>
              <DrawerTitle>Keep-Alive</DrawerTitle>
              <DrawerItem name="Requests">{keepAlive.requests ?? "-"}</DrawerItem>
              <DrawerItem name="Time">{keepAlive.time ?? "-"}</DrawerItem>
              <DrawerItem name="Min Timeout">{keepAlive.minTimeout ?? "-"}</DrawerItem>
              {keepAlive.timeout && (
                <>
                  <DrawerItem name="Timeout Server">{keepAlive.timeout.server ?? "-"}</DrawerItem>
                  <DrawerItem name="Timeout Header">{keepAlive.timeout.header ?? "-"}</DrawerItem>
                </>
              )}
            </>
          )}

          {!body && !keepAlive && <DrawerItem name="Spec">No settings configured</DrawerItem>}
        </div>
      </>
    );
  },
);
