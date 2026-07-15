import type { FunctionReturnType } from "convex/server";
import { api } from "../../../convex/_generated/api";

export type ThingsHomeData = FunctionReturnType<typeof api.things.home>;
export type ThingsGroupSummary = ThingsHomeData["groups"][number];
export type ThingsCatalogue = FunctionReturnType<typeof api.things.catalogue>;
export type ThingsCatalogueItem = ThingsCatalogue[number];
export type ThingsCatalogueSettingsItem = FunctionReturnType<
  typeof api.things.catalogueSettings
>[number];
export type OpenedGroup = NonNullable<FunctionReturnType<typeof api.things.openedGroup>>;
export type ThingsGroupItem = OpenedGroup["activeItems"][number];
