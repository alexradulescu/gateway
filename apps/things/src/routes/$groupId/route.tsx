import { useEffect, useState } from "react";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { GroupDrawer } from "../../components/GroupDrawer";
import { ThingsNotFound } from "../../components/ThingsStates";
import { useThingsData } from "../../context/ThingsDataContext";
import { OpenedGroupProvider } from "../../context/OpenedGroupContext";
import type { OpenedGroup } from "../../types";

export const Route = createFileRoute("/$groupId")({
  component: OpenedGroupRoute,
});

function OpenedGroupRoute() {
  const { groupId } = Route.useParams();
  const { home } = useThingsData();
  const openedGroup = useQuery(api.things.openedGroup, { groupId });
  const [lastResolvedGroup, setLastResolvedGroup] = useState<OpenedGroup | null>(null);

  useEffect(() => {
    if (openedGroup) setLastResolvedGroup(openedGroup);
  }, [openedGroup]);

  const displayedGroup = openedGroup === undefined ? lastResolvedGroup : openedGroup;
  const groupName =
    home.groups.find((group) => group._id === groupId)?.name ??
    displayedGroup?.group.name ??
    "Group";

  if (openedGroup === null) {
    return (
      <div className="things-full-page-layer">
        <ThingsNotFound message="That group does not exist." />
      </div>
    );
  }

  return (
    <GroupDrawer
      groupId={groupId}
      groupName={groupName}
      isLoading={openedGroup === undefined}
      openedGroup={displayedGroup}
    >
      {openedGroup ? (
        <OpenedGroupProvider value={openedGroup}>
          <Outlet />
        </OpenedGroupProvider>
      ) : null}
    </GroupDrawer>
  );
}
