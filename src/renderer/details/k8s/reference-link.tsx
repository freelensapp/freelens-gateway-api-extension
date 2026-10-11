import { Renderer } from "@freelensapp/extensions";
import { observer } from "mobx-react";
import { getReferenceApiVersion } from "./references";

const {
  Component: { LinkToObject },
} = Renderer;

export interface ReferenceLinkProps {
  object: Renderer.K8sApi.KubeObject;
  group: string;
  kind: string;
  name: string;
  namespace?: string;
}

// A link to the object a reference names, or its name alone when the cluster
// serves no API for the reference's group and kind.
export const ReferenceLink = observer(({ object, group, kind, name, namespace }: ReferenceLinkProps) => {
  const apiVersion = getReferenceApiVersion(group, kind);

  if (!apiVersion) {
    return <span>{name}</span>;
  }

  return <LinkToObject object={object} objectRef={{ apiVersion, kind, name, namespace }} />;
});
