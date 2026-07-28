/// <reference types="bun-types" />

import { describe, expect, test } from "bun:test";
import {
  advanceCity,
  advanceOffline,
  createCity,
  parseCity,
  placeBuilding,
  resolveCrisis,
  serializeCity,
  triggerCrisis,
} from "./game";

describe("Aegean Polis simulation", () => {
  test("a new city opens one-third of its plots with a useful starter settlement", () => {
    const city = createCity("Thalassa", 42);

    expect(city.name).toBe("Thalassa");
    expect(city.unlockedDistricts).toEqual([0]);
    expect(city.buildings.map((building) => building.type)).toEqual([
      "house",
      "farm",
      "lumber",
      "park",
    ]);
  });

  test("placing and completing a building changes only observable city state", () => {
    const city = createCity("Thalassa", 42);
    const timberBefore = city.resources.timber;
    const queued = placeBuilding(city, "academy", 15);

    expect(queued.construction?.kind).toBe("build");
    expect(queued.resources.timber).toBeLessThan(timberBefore);
    expect(queued.buildings.find((building) => building.plotId === 15)?.status).toBe(
      "constructing",
    );

    const completed = advanceCity(queued, 60, 1);
    expect(completed.construction).toBeNull();
    expect(completed.buildings.find((building) => building.plotId === 15)?.status).toBe("active");
  });

  test("offline progress is safe and capped at eight real hours", () => {
    const city = createCity("Thalassa", 42);

    const eightHours = advanceOffline(city, 8 * 60 * 60);
    const threeDays = advanceOffline(city, 3 * 24 * 60 * 60);

    expect(threeDays.resources).toEqual(eightHours.resources);
    expect(threeDays.pendingCrisis).toBeNull();
  });

  test("exported cities survive a save round trip without hidden state", () => {
    const city = advanceCity(createCity("Thalassa", 42), 120, 2);
    const restored = parseCity(serializeCity(city));

    expect(restored).toEqual(city);
  });

  test("an unprepared invasion causes bounded, recoverable damage", () => {
    const city = createCity("Thalassa", 42);
    const threatened = triggerCrisis(city, "invasion");
    const resolved = resolveCrisis(threatened, "shelter");

    expect(resolved.pendingCrisis).toBeNull();
    expect(resolved.resources.coin).toBeGreaterThanOrEqual(0);
    expect(resolved.buildings.filter((building) => building.condition === 0)).toHaveLength(1);
    expect(resolved.buildings.some((building) => building.type === "house")).toBe(true);
  });
});
