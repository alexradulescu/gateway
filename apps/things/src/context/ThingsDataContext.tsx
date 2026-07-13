import { createContext, useContext, useEffect, useMemo, useRef } from "react";
import { Spinner, Toast, toast } from "@heroui/react";
import { useMutation, useQuery } from "convex/react";
import { useLocation } from "@tanstack/react-router";
import { api } from "../../../../convex/_generated/api";
import type { ThingsCatalogue, ThingsGroupItem, ThingsHomeData } from "../types";

type ThingsData = {
  home: ThingsHomeData;
  catalogue: ThingsCatalogue;
  showDeleteUndo: (item: ThingsGroupItem) => void;
};

const ThingsDataContext = createContext<ThingsData | null>(null);

export function ThingsDataProvider({ children }: { children: React.ReactNode }) {
  const home = useQuery(api.things.home);
  const catalogue = useQuery(api.things.catalogue);
  const restoreItem = useMutation(api.things.restoreGroupItem);
  const pathname = useLocation({ select: (location) => location.pathname });
  const undoGroupIdRef = useRef<string | null>(null);
  const undoExpiryRef = useRef<number | null>(null);

  useEffect(() => {
    const undoGroupId = undoGroupIdRef.current;
    if (undoGroupId === null) return;

    const groupPath = `/things/${undoGroupId}`;
    const remainsInOriginalGroup = pathname === groupPath || pathname.startsWith(`${groupPath}/`);
    if (remainsInOriginalGroup) return;

    undoGroupIdRef.current = null;
    if (undoExpiryRef.current !== null) window.clearTimeout(undoExpiryRef.current);
    undoExpiryRef.current = null;
    toast.clear();
  }, [pathname]);

  useEffect(
    () => () => {
      if (undoExpiryRef.current !== null) window.clearTimeout(undoExpiryRef.current);
      toast.clear();
    },
    [],
  );

  const value = useMemo(() => {
    if (home === undefined || catalogue === undefined) return null;

    return {
      home,
      catalogue,
      showDeleteUndo(item: ThingsGroupItem) {
        toast.clear();
        if (undoExpiryRef.current !== null) window.clearTimeout(undoExpiryRef.current);
        undoGroupIdRef.current = item.groupId;
        undoExpiryRef.current = window.setTimeout(() => {
          undoGroupIdRef.current = null;
          undoExpiryRef.current = null;
        }, 10_000);
        toast("Item deleted", {
          timeout: 10_000,
          actionProps: {
            children: "Undo",
            onPress: async () => {
              try {
                await restoreItem({ itemId: item._id });
                undoGroupIdRef.current = null;
                if (undoExpiryRef.current !== null) window.clearTimeout(undoExpiryRef.current);
                undoExpiryRef.current = null;
                toast.clear();
              } catch (error) {
                toast.danger(errorMessage(error, "Could not restore the item."));
              }
            },
            variant: "tertiary",
          },
        });
      },
    };
  }, [catalogue, home, restoreItem]);

  if (value === null) return <ThingsLoadingState label="Loading Things" />;

  return (
    <ThingsDataContext.Provider value={value}>
      {children}
      <Toast.Provider className="things-toast-region" placement="bottom" />
    </ThingsDataContext.Provider>
  );
}

export function useThingsData() {
  const value = useContext(ThingsDataContext);
  if (value === null) throw new Error("useThingsData must be used inside ThingsDataProvider.");
  return value;
}

function ThingsLoadingState({ label = "Loading" }: { label?: string }) {
  return (
    <main className="things-state" aria-busy="true" aria-label={label}>
      <Spinner color="accent" size="lg" />
      <p>{label}…</p>
    </main>
  );
}

export function errorMessage(error: unknown, fallback: string) {
  if (error && typeof error === "object" && "data" in error && typeof error.data === "string") {
    return error.data;
  }

  if (error instanceof Error && error.message) {
    const domainMessage = error.message.match(/Uncaught (?:Error|ConvexError): ([^\n]+)/u)?.[1];
    if (domainMessage) return domainMessage;
    if (!error.message.startsWith("[CONVEX")) return error.message;
  }

  return fallback;
}
