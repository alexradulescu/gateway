import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import type { Suburb } from "./data";
import { studios } from "./pilates";
import { lines } from "./transit";

const CBD: L.LatLngExpression = [-33.8731, 151.2065];

type Pin = { suburb: Suburb; score: number; dim: boolean; saved: boolean };

type Props = {
  pins: Pin[];
  selectedId: string | null;
  /** Pixels of map hidden under the bottom sheet, so focus lands in the visible area. */
  bottomInset: number;
  dark: boolean;
  showTransit: boolean;
  onSelect: (id: string) => void;
};

function tone(score: number) {
  if (score >= 70) return "great";
  if (score >= 55) return "good";
  return "fair";
}

function pinHtml({ suburb, score, dim, saved }: Pin, selected: boolean) {
  const cls = ["pin", `pin--${tone(score)}`, dim && "pin--dim", selected && "pin--selected"]
    .filter(Boolean)
    .join(" ");
  return `<div class="${cls}"><span class="pin__min">${suburb.commute}′</span><span class="pin__name">${saved ? "★ " : ""}${suburb.name}</span></div>`;
}

export function MapView({ pins, selectedId, bottomInset, dark, showTransit, onSelect }: Props) {
  const host = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const tiles = useRef<L.LayerGroup | null>(null);
  const layer = useRef<L.LayerGroup | null>(null);
  const transit = useRef<L.LayerGroup | null>(null);
  const select = useRef(onSelect);
  select.current = onSelect;
  const insetRef = useRef(bottomInset);

  useEffect(() => {
    const m = L.map(host.current!, {
      maxZoom: 16,
      zoomControl: false,
      attributionControl: false,
    });
    L.marker(CBD, {
      icon: L.divIcon({
        className: "",
        html: '<div class="cbd">CBD</div>',
        iconSize: [44, 24],
        iconAnchor: [22, 12],
      }),
      interactive: false,
      keyboard: false,
    }).addTo(m);
    // Lines sit above tiles but under suburb pins.
    m.createPane("transit").style.zIndex = "450";
    transit.current = buildTransit();
    for (const studio of studios) {
      L.marker([studio.lat, studio.lng], {
        icon: L.divIcon({ className: "", html: '<div class="studio">S</div>', iconSize: [0, 0] }),
        zIndexOffset: -200,
        title: `STRONG Pilates ${studio.name}`,
      })
        .bindTooltip(`STRONG Pilates · ${studio.name}`, { direction: "top", offset: [0, -10] })
        .addTo(m);
    }
    L.control.attribution({ position: "topright", prefix: false }).addTo(m);
    layer.current = L.layerGroup().addTo(m);
    // Names collide when zoomed out; keep just the commute badges until zoom 12.
    const syncZoom = () => host.current?.classList.toggle("map--far", m.getZoom() < 12);
    m.on("zoomend", syncZoom);
    // Inner ring first; Parramatta and Wentworth Point are a short pan west.
    const centre = m.project([-33.865, 151.185], 12).add([0, insetRef.current / 2]);
    m.setView(m.unproject(centre, 12), 12);
    syncZoom();
    map.current = m;
    return () => {
      m.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    const m = map.current!;
    tiles.current?.remove();
    const tone = dark ? "Dark" : "Light";
    const url = (kind: string) =>
      `https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_${tone}_Gray_${kind}/MapServer/tile/{z}/{y}/{x}`;
    tiles.current = L.layerGroup([
      L.tileLayer(url("Base"), {
        maxZoom: 16,
        attribution: "Tiles &copy; Esri, HERE, Garmin, &copy; OpenStreetMap contributors",
      }),
      L.tileLayer(url("Reference"), { maxZoom: 16 }),
    ]).addTo(m);
  }, [dark]);

  useEffect(() => {
    const m = map.current!;
    if (showTransit) transit.current!.addTo(m);
    else transit.current!.remove();
  }, [showTransit]);

  useEffect(() => {
    const group = layer.current!;
    group.clearLayers();
    // Draw dimmed first so active pins stay on top.
    const ordered = [...pins].sort((a, b) => Number(b.dim) - Number(a.dim));
    for (const pin of ordered) {
      const selected = pin.suburb.id === selectedId;
      const marker = L.marker([pin.suburb.lat, pin.suburb.lng], {
        icon: L.divIcon({ className: "", html: pinHtml(pin, selected), iconSize: [0, 0] }),
        zIndexOffset: selected ? 1000 : pin.dim ? -500 : 0,
        keyboard: true,
        title: pin.suburb.name,
      });
      marker.on("click", () => select.current(pin.suburb.id));
      group.addLayer(marker);
    }
  }, [pins, selectedId]);

  useEffect(() => {
    const m = map.current;
    const pin = pins.find((p) => p.suburb.id === selectedId);
    if (!m || !pin) return;
    const zoom = Math.max(m.getZoom(), 13);
    const target = m.project([pin.suburb.lat, pin.suburb.lng], zoom).add([0, bottomInset / 2]);
    m.flyTo(m.unproject(target, zoom), zoom, { duration: 0.6 });
    // Only refocus when selection changes, not on every pin restyle.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  return <div ref={host} className="map" />;
}

function buildTransit() {
  const group = L.layerGroup();
  const seen = new Set<string>();
  for (const line of lines) {
    const path = line.stops.map(([, lat, lng]) => [lat, lng] as L.LatLngTuple);
    const dashed = line.kind === "ferry" || line.id === "m-bankstown";
    L.polyline(path, {
      pane: "transit",
      color: "#fff",
      weight: 7,
      opacity: 0.7,
      interactive: false,
    }).addTo(group);
    L.polyline(path, {
      pane: "transit",
      color: line.color,
      weight: line.kind === "lightrail" ? 3 : 4,
      opacity: 0.9,
      dashArray: dashed ? "6 6" : undefined,
      interactive: false,
    }).addTo(group);
    const stops = line.kind === "ferry" ? [line.stops[0], line.stops.at(-1)!] : line.stops;
    for (const [name, lat, lng] of stops) {
      const key = `${name}|${line.kind}`;
      if (seen.has(key)) continue;
      seen.add(key);
      L.circleMarker([lat, lng], {
        pane: "transit",
        radius: 3.5,
        color: line.color,
        weight: 2,
        fillColor: "#fff",
        fillOpacity: 1,
      })
        .bindTooltip(`${name} · ${line.name}`, { direction: "top", offset: [0, -4] })
        .addTo(group);
    }
  }
  return group;
}
