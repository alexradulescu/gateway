/// <reference types="bun-types" />

import { describe, expect, test } from "bun:test";
import {
  advanceCity,
  advanceOffline,
  createCity,
  finishAllProjects,
  parseCity,
  placeBuilding,
  resolveHarbourMission,
  resolveCrisis,
  serializeCity,
  setDoctrine,
  startResearch,
  triggerCrisis,
  maybeTriggerScheduledCrisis,
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

  test("minor opportunities arrive from configurable active play time", () => {
    const city = createCity("Thalassa", 42);
    const due = { ...city, nextMinorEventAt: 1 };

    const advanced = advanceCity(due, 2, 1);

    expect(advanced.eventLog[0]?.title).not.toBe("A new polis");
    expect(advanced.nextMinorEventAt).toBeGreaterThan(advanced.activeSeconds);
  });

  test("a scheduled severe crisis warns the city before it strikes", () => {
    const city = createCity("Thalassa", 42);
    const warned = maybeTriggerScheduledCrisis({ ...city, nextCrisisAt: 1 }, 2);

    expect(warned.crisisWarning).not.toBeNull();
    expect(warned.pendingCrisis).toBeNull();
    expect(warned.crisisWarningEndsAt).toBeGreaterThan(warned.activeSeconds);

    const warningSeconds = warned.crisisWarningEndsAt! - warned.activeSeconds;
    const afterOffline = advanceOffline(warned, 60 * 60);
    expect(afterOffline.crisisWarningEndsAt! - afterOffline.activeSeconds).toBe(warningSeconds);
  });

  test("malformed city files are rejected before replacing the active city", () => {
    const malformed = JSON.stringify({
      ...createCity("Thalassa", 42),
      resources: { food: "all of it" },
    });

    expect(() => parseCity(malformed)).toThrow("valid Aegean Polis");
  });

  test("an imported city must retain at least one safe news entry", () => {
    const malformed = JSON.stringify({ ...createCity("Thalassa", 42), eventLog: [] });

    expect(() => parseCity(malformed)).toThrow("valid Aegean Polis");
  });

  test("developer completion finishes timers without simulating a day", () => {
    const queued = startResearch(
      placeBuilding(createCity("Thalassa", 42), "academy", 15),
      "irrigation",
    );
    const resourcesBefore = queued.resources;
    const activeSecondsBefore = queued.activeSeconds;

    const finished = finishAllProjects(queued);

    expect(finished.construction).toBeNull();
    expect(finished.research).toBeNull();
    expect(finished.completedResearch).toContain("irrigation");
    expect(finished.activeSeconds).toBe(activeSecondsBefore);
    expect(finished.resources).toEqual(resourcesBefore);
  });

  test("research opens specialised buildings and civic doctrines", () => {
    const city = createCity("Thalassa", 42);

    expect(() => placeBuilding(city, "workshop", 15)).toThrow("Stonecraft");
    expect(() => setDoctrine(city, "industrial")).toThrow("Stonecraft");

    const learned = finishAllProjects(startResearch(city, "stonecraft"));
    expect(placeBuilding(learned, "workshop", 15).construction?.kind).toBe("build");
    expect(setDoctrine(learned, "industrial").doctrine).toBe("industrial");
  });

  test("production stops when a city has no available workers", () => {
    const city = createCity("Thalassa", 42);
    const understaffed = {
      ...city,
      population: 1,
      resources: { ...city.resources, food: 0, timber: 0 },
    };

    const advanced = advanceCity(understaffed, 60, 1, false);

    expect(advanced.resources.food).toBe(0);
    expect(advanced.resources.timber).toBe(0);
  });

  test("a pastoral doctrine changes the city's production path", () => {
    const city = createCity("Thalassa", 42);
    const baseline = advanceCity(
      { ...city, population: 100, resources: { ...city.resources, food: 0 } },
      60,
      1,
      false,
    );
    const pastoral = advanceCity(
      { ...city, doctrine: "pastoral", population: 100, resources: { ...city.resources, food: 0 } },
      60,
      1,
      false,
    );

    expect(pastoral.resources.food).toBeGreaterThan(baseline.resources.food);
  });

  test("harbour missions resolve off-screen and patrols require real defence", () => {
    const city = createCity("Thalassa", 42);
    const traded = resolveHarbourMission(city, "trade");

    expect(traded.resources.coin).toBeGreaterThan(city.resources.coin);
    expect(traded.eventLog[0]?.title).toBe("Trade voyage complete");
    expect(() => resolveHarbourMission(city, "patrol")).toThrow("30 defence");
  });
});
