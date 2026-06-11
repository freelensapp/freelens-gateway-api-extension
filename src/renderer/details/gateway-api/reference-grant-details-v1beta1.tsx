import { Renderer } from "@freelensapp/extensions";
import { ReferenceGrant } from "../../k8s/gateway-api/reference-grant-v1beta1";
import { observer } from "../../observer";
import { createHash } from "../../utils";

const {
  Component: { DrawerItem, DrawerTitle, Table, TableCell, TableHead, TableRow },
} = Renderer;

export const ReferenceGrantDetails = observer((props: Renderer.Component.KubeObjectDetailsProps<ReferenceGrant>) => {
  const { object } = props;

  return (
    <>
      <DrawerItem name="Name">{object.getName()}</DrawerItem>
      <DrawerItem name="Namespace">{object.getNs() ?? "-"}</DrawerItem>

      <DrawerTitle>From</DrawerTitle>
      {object.spec.from && object.spec.from.length > 0 && (
        <Table selectable tableId="referenceGrantFrom" scrollable={false} sortSyncWithUrl={false}>
          <TableHead flat sticky={false}>
            <TableCell>Group</TableCell>
            <TableCell>Kind</TableCell>
            <TableCell>Namespace</TableCell>
          </TableHead>
          {object.spec.from.map((entry) => {
            const key = createHash(entry);

            return (
              <TableRow key={key} nowrap>
                <TableCell>{entry.group || "-"}</TableCell>
                <TableCell>{entry.kind}</TableCell>
                <TableCell>{entry.namespace ?? "-"}</TableCell>
              </TableRow>
            );
          })}
        </Table>
      )}
      {!object.spec.from?.length && <DrawerItem name="From">-</DrawerItem>}

      <DrawerTitle>To</DrawerTitle>
      {object.spec.to && object.spec.to.length > 0 && (
        <Table selectable tableId="referenceGrantTo" scrollable={false} sortSyncWithUrl={false}>
          <TableHead flat sticky={false}>
            <TableCell>Group</TableCell>
            <TableCell>Kind</TableCell>
            <TableCell>Name</TableCell>
          </TableHead>
          {object.spec.to.map((entry) => {
            const key = createHash(entry);

            return (
              <TableRow key={key} nowrap>
                <TableCell>{entry.group || "-"}</TableCell>
                <TableCell>{entry.kind}</TableCell>
                <TableCell>{entry.name ?? "-"}</TableCell>
              </TableRow>
            );
          })}
        </Table>
      )}
      {!object.spec.to?.length && <DrawerItem name="To">-</DrawerItem>}
    </>
  );
});
