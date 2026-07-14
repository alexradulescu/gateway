import { createFileRoute } from "@tanstack/react-router";
import { ItemDetailModal } from "../../components/ItemDetailModal";

export const Route = createFileRoute("/$groupId/$itemId")({
  component: ItemDetailRoute,
});

function ItemDetailRoute() {
  const { groupId, itemId } = Route.useParams();
  return <ItemDetailModal groupId={groupId} itemId={itemId} />;
}
