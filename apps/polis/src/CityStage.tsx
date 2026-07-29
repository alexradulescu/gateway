import {
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  BUILDING_DEFINITIONS,
  DISTRICT_NAMES,
  isPlotUnlocked,
  type Building,
  type BuildingType,
  type CityState,
} from "./game";
import {
  CITY_STAGE_HEIGHT,
  CITY_STAGE_WIDTH,
  THALASSA_LAYOUT,
  getRoadBackground,
  positionForSite,
  type StageAnchorOverrides,
  type StagePosition,
} from "./cityStageLayout";
import { zoomStageCameraAt, type StageCamera } from "./cityStageCamera";

export type { StageCamera } from "./cityStageCamera";

type CityStageProps = {
  city: CityState;
  camera: StageCamera;
  selectedBuildingId: string | null;
  placementActive: boolean;
  editorEnabled: boolean;
  onCameraChange: (camera: StageCamera) => void;
  onPlot: (plotId: number) => void;
  onBuilding: (building: Building) => void;
  onLandmark: () => void;
  onEditorClose: () => void;
};

type DragState =
  | {
      kind: "camera";
      pointerId: number;
      start: StagePosition;
      camera: StageCamera;
      moved: boolean;
    }
  | {
      kind: "anchor";
      pointerId: number;
      plotId: number;
      start: StagePosition;
      position: StagePosition;
    };

function atlasStyle(type: BuildingType, level: number): CSSProperties {
  const index = BUILDING_DEFINITIONS[type].atlasIndex;
  const column = index % 4;
  const row = Math.floor(index / 4);
  const atlas =
    level === 1
      ? "/polis/assets/buildings-atlas.png"
      : `/polis/assets/buildings-atlas-level-${Math.min(3, level)}.png`;
  return {
    "--atlas-x": `${column * (100 / 3)}%`,
    "--atlas-y": `${row * 50}%`,
    "--atlas-image": `url("${atlas}")`,
  } as CSSProperties;
}

function buildingClass(
  building: Building,
  selectedBuildingId: string | null,
  constructing: boolean,
) {
  return [
    "placed-building",
    building.id === selectedBuildingId ? "placed-building--selected" : "",
    building.condition < 100 ? "placed-building--damaged" : "",
    constructing ? "placed-building--constructing" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function downloadAnchorJson(overrides: StageAnchorOverrides) {
  const anchors = Object.fromEntries(
    THALASSA_LAYOUT.sites.map((site) => {
      const position = positionForSite(site, overrides);
      return [site.plotId, { x: Math.round(position.x), y: Math.round(position.y) }];
    }),
  );
  const blob = new Blob(
    [
      JSON.stringify(
        {
          layoutId: THALASSA_LAYOUT.id,
          stage: { width: CITY_STAGE_WIDTH, height: CITY_STAGE_HEIGHT },
          anchors,
        },
        null,
        2,
      ),
    ],
    { type: "application/json" },
  );
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${THALASSA_LAYOUT.id}-anchors.json`;
  link.click();
  URL.revokeObjectURL(url);
}

export function CityStage({
  city,
  camera,
  selectedBuildingId,
  placementActive,
  editorEnabled,
  onCameraChange,
  onPlot,
  onBuilding,
  onLandmark,
  onEditorClose,
}: CityStageProps) {
  const drag = useRef<DragState | null>(null);
  const [anchorOverrides, setAnchorOverrides] = useState<StageAnchorOverrides>({});
  const [editorDistrict, setEditorDistrict] = useState(0);
  const [editorStatus, setEditorStatus] = useState("Drag a numbered anchor to calibrate it.");
  const background = getRoadBackground(city.roadLevel);
  const buildingByPlot = useMemo(
    () => new Map(city.buildings.map((building) => [building.plotId, building])),
    [city.buildings],
  );

  function stagePointer(event: ReactPointerEvent) {
    return { x: event.clientX, y: event.clientY };
  }

  function startCameraDrag(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.button !== 0 || (event.target as HTMLElement).closest("button")) return;
    drag.current = {
      kind: "camera",
      pointerId: event.pointerId,
      start: stagePointer(event),
      camera,
      moved: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function startAnchorDrag(event: ReactPointerEvent<HTMLButtonElement>, plotId: number) {
    event.stopPropagation();
    const site = THALASSA_LAYOUT.sitesByPlot.get(plotId);
    if (!site) return;
    drag.current = {
      kind: "anchor",
      pointerId: event.pointerId,
      plotId,
      start: stagePointer(event),
      position: positionForSite(site, anchorOverrides),
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function movePointer(event: ReactPointerEvent<HTMLDivElement>) {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId) return;
    const point = stagePointer(event);
    const dx = point.x - current.start.x;
    const dy = point.y - current.start.y;
    if (current.kind === "camera") {
      if (Math.abs(dx) + Math.abs(dy) > 5) current.moved = true;
      if (current.moved) {
        onCameraChange({
          ...current.camera,
          x: current.camera.x + dx,
          y: current.camera.y + dy,
        });
      }
      return;
    }
    const position = {
      x: Math.max(0, Math.min(CITY_STAGE_WIDTH, current.position.x + dx / camera.zoom)),
      y: Math.max(0, Math.min(CITY_STAGE_HEIGHT, current.position.y + dy / camera.zoom)),
    };
    setAnchorOverrides((overrides) => ({ ...overrides, [current.plotId]: position }));
    setEditorStatus(
      `Plot ${current.plotId + 1}: ${Math.round(position.x)}, ${Math.round(position.y)}`,
    );
  }

  function stopPointer(event: ReactPointerEvent<HTMLDivElement>) {
    if (drag.current?.pointerId === event.pointerId) drag.current = null;
  }

  return (
    <div
      className={`city-stage-host ${editorEnabled ? "city-stage-host--editing" : ""}`}
      onPointerDown={startCameraDrag}
      onPointerMove={movePointer}
      onPointerUp={stopPointer}
      onPointerCancel={stopPointer}
      onWheel={(event) => {
        event.preventDefault();
        const bounds = event.currentTarget.getBoundingClientRect();
        const point = { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
        const zoom = Math.max(0.45, Math.min(1.45, camera.zoom * Math.exp(-event.deltaY * 0.0015)));
        onCameraChange(
          zoomStageCameraAt(camera, { width: bounds.width, height: bounds.height }, point, zoom),
        );
      }}
    >
      <div
        className="city-stage-camera"
        style={
          {
            "--camera-x": `${camera.x}px`,
            "--camera-y": `${camera.y}px`,
            "--camera-zoom": camera.zoom,
          } as CSSProperties
        }
      >
        <div
          className={`city-stage city-stage--${city.doctrine}`}
          style={{ width: CITY_STAGE_WIDTH, height: CITY_STAGE_HEIGHT }}
        >
          <img
            key={background}
            className="city-stage-background"
            src={background}
            alt=""
            decoding="async"
            draggable={false}
          />

          {THALASSA_LAYOUT.sites.map((site) => {
            if (!isPlotUnlocked(city, site.plotId)) return null;
            const building = buildingByPlot.get(site.plotId);
            const position = positionForSite(site, anchorOverrides);
            if (building) {
              const constructing =
                city.construction?.targetBuildingId === building.id && building.status !== "active";
              return (
                <button
                  type="button"
                  key={building.id}
                  className={buildingClass(building, selectedBuildingId, constructing)}
                  style={
                    {
                      left: position.x,
                      top: position.y,
                      zIndex: 1000 + Math.round(position.y),
                      "--building-scale": site.size === "large" ? 1.08 : 1,
                    } as CSSProperties
                  }
                  aria-label={`${BUILDING_DEFINITIONS[building.type].name}, level ${building.level}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    onBuilding(building);
                  }}
                >
                  <span
                    className="atlas-sprite"
                    style={atlasStyle(building.type, building.level)}
                  />
                  {constructing && <span className="scaffolding">⋮</span>}
                  {building.condition < 100 && <span className="damage-mark">Repair</span>}
                  {building.id === selectedBuildingId && (
                    <span className="stage-building-label">
                      {BUILDING_DEFINITIONS[building.type].shortName} · {building.level}
                    </span>
                  )}
                </button>
              );
            }
            return (
              <button
                type="button"
                key={site.plotId}
                className={["stage-site", placementActive ? "stage-site--target" : ""].join(" ")}
                style={
                  {
                    left: position.x,
                    top: position.y,
                    width: site.radiusX * 2,
                    height: site.radiusY * 2,
                    zIndex: 500 + Math.round(position.y),
                  } as CSSProperties
                }
                aria-label={`Open ${site.trait} site ${site.plotId + 1}`}
                onClick={(event) => {
                  event.stopPropagation();
                  onPlot(site.plotId);
                }}
              >
                <span>{placementActive ? "Build here" : site.trait}</span>
              </button>
            );
          })}

          <button
            type="button"
            className="landmark-building landmark-building--town-hall"
            style={
              {
                left: THALASSA_LAYOUT.townHall.position.x,
                top: THALASSA_LAYOUT.townHall.position.y,
                zIndex: 1000 + THALASSA_LAYOUT.townHall.position.y,
                "--building-scale": THALASSA_LAYOUT.townHall.scale,
              } as CSSProperties
            }
            onClick={(event) => {
              event.stopPropagation();
              onLandmark();
            }}
          >
            <span className="atlas-sprite" style={atlasStyle("academy", 1)} />
            <span>Town Hall · {city.townHallLevel}</span>
          </button>

          <button
            type="button"
            className="landmark-building landmark-building--harbour"
            style={
              {
                left: THALASSA_LAYOUT.harbour.position.x,
                top: THALASSA_LAYOUT.harbour.position.y,
                zIndex: 1000 + THALASSA_LAYOUT.harbour.position.y,
                "--building-scale": THALASSA_LAYOUT.harbour.scale,
              } as CSSProperties
            }
            onClick={(event) => {
              event.stopPropagation();
              onLandmark();
            }}
          >
            <span className="atlas-sprite" style={atlasStyle("warehouse", 1)} />
            <span>Harbour · {city.harbourLevel}</span>
          </button>

          {editorEnabled &&
            THALASSA_LAYOUT.sites
              .filter((site) => site.district === editorDistrict)
              .map((site) => {
                const position = positionForSite(site, anchorOverrides);
                return (
                  <button
                    type="button"
                    key={`editor-${site.plotId}`}
                    className="stage-anchor-handle"
                    style={{
                      left: position.x,
                      top: position.y,
                      zIndex: 3000 + Math.round(position.y),
                    }}
                    aria-label={`Move plot ${site.plotId + 1} anchor`}
                    onPointerDown={(event) => startAnchorDrag(event, site.plotId)}
                  >
                    {site.plotId + 1}
                  </button>
                );
              })}
        </div>
      </div>

      {editorEnabled && (
        <aside className="stage-editor parchment" aria-label="Layout placement editor">
          <span>
            <strong>Thalassa-01 placement</strong>
            <small>{editorStatus}</small>
          </span>
          <button
            type="button"
            onClick={() => {
              setAnchorOverrides({});
              setEditorStatus("All anchors reset to the committed layout.");
            }}
          >
            Reset
          </button>
          <button
            type="button"
            onClick={() => {
              const next = (editorDistrict + 1) % DISTRICT_NAMES.length;
              setEditorDistrict(next);
              setEditorStatus(`Showing ${DISTRICT_NAMES[next]} anchors.`);
            }}
          >
            District {editorDistrict + 1} / {DISTRICT_NAMES.length}
          </button>
          <button
            type="button"
            onClick={() => {
              downloadAnchorJson(anchorOverrides);
              setEditorStatus("Anchor JSON downloaded.");
            }}
          >
            Export JSON
          </button>
          <button
            type="button"
            className="bare-close"
            aria-label="Close editor"
            onClick={onEditorClose}
          >
            ×
          </button>
        </aside>
      )}
    </div>
  );
}
