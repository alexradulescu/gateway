import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { ThingsHome } from "../../components/ThingsHome";
import { GroupDrawer } from "../../components/GroupDrawer";
import { ThingsLoading, ThingsNotFound } from "../../components/ThingsStates";
import { OpenedGroupProvider } from "../../context/OpenedGroupContext";

export const Route = createFileRoute("/$groupId")({
  component: OpenedGroupRoute,
});

function OpenedGroupRoute() {
  const { groupId } = Route.useParams();
  const openedGroup = useQuery(api.things.openedGroup, { groupId });

  if (openedGroup === undefined) return <ThingsLoading label="Opening group" />;
  if (openedGroup === null) return <ThingsNotFound message="That group does not exist." />;

  return (
    <OpenedGroupProvider value={openedGroup}>
      <ThingsHome />
      <GroupDrawer key={openedGroup.group._id} openedGroup={openedGroup}>
        <Outlet />
      </GroupDrawer>
    </OpenedGroupProvider>
  );
}
