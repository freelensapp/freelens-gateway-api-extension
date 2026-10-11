import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import { formatCondition, type PolicyAncestorStatus } from "../../api/k8s/types";
import styles from "./common.module.scss";
import { ReferenceLink } from "./reference-link";
import { gatewayApiGroup } from "./references";

const {
  Component: { DrawerItem, DrawerTitle, Icon },
  Util: { createReactKey },
} = Renderer;

export interface PolicyAncestorsProps {
  object: Renderer.K8sApi.KubeObject;
  ancestors: PolicyAncestorStatus[];
}

// The `status.ancestors` of a policy: per ancestor, a link to it, the controller that reports it and the conditions.
export const PolicyAncestors = observer(({ object, ancestors }: PolicyAncestorsProps) => {
  const objectNs = object.getNs();

  return (
    <div className={styles.details}>
      <DrawerTitle>Ancestors</DrawerTitle>
      {ancestors.length > 0 ? (
        ancestors.map((ancestor) => {
          const { ancestorRef } = ancestor;
          const group = ancestorRef.group ?? gatewayApiGroup;
          const kind = ancestorRef.kind ?? "Gateway";

          return (
            <div key={`${ancestor.controllerName}/${createReactKey(ancestorRef)}`}>
              <div className={styles.title}>
                <Icon small material="list" />
                <span>
                  {kind} {ancestorRef.name}
                </span>
              </div>
              <DrawerItem name="Controller Name">{ancestor.controllerName}</DrawerItem>
              <DrawerItem name="Ancestor">
                <ReferenceLink
                  object={object}
                  group={group}
                  kind={kind}
                  name={ancestorRef.name}
                  namespace={ancestorRef.namespace ?? objectNs}
                />
              </DrawerItem>
              <DrawerItem name="Group">{group || "-"}</DrawerItem>
              <DrawerItem name="Section Name" hidden={!ancestorRef.sectionName}>
                {ancestorRef.sectionName}
              </DrawerItem>
              <DrawerItem name="Port" hidden={ancestorRef.port === undefined}>
                {ancestorRef.port}
              </DrawerItem>
              <DrawerItem name="Conditions">
                {ancestor.conditions.length > 0 ? ancestor.conditions.map(formatCondition).join(", ") : "-"}
              </DrawerItem>
            </div>
          );
        })
      ) : (
        <DrawerItem name="Ancestors">-</DrawerItem>
      )}
    </div>
  );
});
