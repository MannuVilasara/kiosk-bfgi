import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation2, ChevronRight, Compass, Loader2 } from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────────
interface LatLng {
  lat: number;
  lng: number;
}
interface BuildingLabel {
  id: string;
  name: string;
  sub?: string;
  lat: number;
  lng: number;
}
interface MapNode {
  id: string;
  lat: number;
  lng: number;
}
interface Segment {
  from: string;
  to: string;
}
interface PathLabel {
  en: string;
  hi?: string;
  pa?: string;
}
interface MapPath {
  id: string;
  label: PathLabel | string;
  segments: Segment[];
}
interface MapData {
  nodes: MapNode[];
  paths: MapPath[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────
/** Returns an ordered array of LatLng coords for the given path ID. */
function getCoordinatesFromPath(
  pathId: string,
  nodeMap: Map<string, LatLng>,
  paths: MapPath[]
): LatLng[] {
  const path = paths.find((p) => p.id === pathId);
  if (!path || path.segments.length === 0) return [];
  const ids: string[] = [path.segments[0].from];
  for (const seg of path.segments) ids.push(seg.to);
  return ids.flatMap((id) => {
    const c = nodeMap.get(id);
    return c ? [c] : [];
  });
}

// ── Component ─────────────────────────────────────────────────────────────────
const Navigation = () => {
  const { t, i18n } = useTranslation();

  /** Resolve a path label to the current UI language, falling back to English. */
  const resolveLabel = (label: MapPath['label']): string => {
    if (!label) return '';
    if (typeof label === 'string') return label;
    const lang = i18n.language as 'en' | 'hi' | 'pa';
    return label[lang] || label.en;
  };
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const startMarkerRef = useRef<L.CircleMarker | null>(null);
  const endMarkerRef = useRef<L.CircleMarker | null>(null);
  const buildingLayerGroupRef = useRef<L.LayerGroup | null>(null);

  const [mapData, setMapData] = useState<MapData | null>(null);
  const [buildingLabels, setBuildingLabels] = useState<BuildingLabel[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);
  const [activePathId, setActivePathId] = useState<string | null>(null);
  const [mapStarted, setMapStarted] = useState(false);

  // ── 1. Fetch map data + building labels in parallel ─────────────────────
  useEffect(() => {
    if (!mapStarted) return;
    setLoadingData(true);
    setDataError(null);
    Promise.all([
      axios.get('/api/kiosk/map-data'),
      axios.get('/api/kiosk/buildinglabel'),
    ])
      .then(([mapRes, labelRes]) => {
        setMapData(mapRes.data);
        if (Array.isArray(labelRes.data)) setBuildingLabels(labelRes.data);
      })
      .catch(() => setDataError(t('navigation.failedToLoad')))
      .finally(() => setLoadingData(false));
  }, [mapStarted]);

  // ── 2. Initialise Leaflet map once map data is available ─────────────────
  useEffect(() => {
    if (!mapStarted || !mapData || !mapRef.current || leafletMapRef.current) return;

    const nodeMap = new Map<string, LatLng>(
      mapData.nodes.map((n) => [n.id, { lat: n.lat, lng: n.lng }])
    );

    // Auto-centre: average lat/lng of all nodes
    const lats = mapData.nodes.map((n) => n.lat);
    const lngs = mapData.nodes.map((n) => n.lng);
    const centerLat = lats.reduce((a, b) => a + b, 0) / lats.length;
    const centerLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;

    const map = L.map(mapRef.current, {
      center: [centerLat, centerLng],
      zoom: 18,
      zoomControl: false,
    });

    // Google Satellite tiles – no API key required
    L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      maxZoom: 21,
      attribution: '© Google',
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Plot every node as a small grey circle marker
    mapData.nodes.forEach((node) => {
      L.circleMarker([node.lat, node.lng], {
        radius: 5,
        color: '#ffffff',
        weight: 2,
        fillColor: '#94a3b8',
        fillOpacity: 0.9,
      })
        .addTo(map)
        .bindTooltip(node.id.replace(/_/g, ' '), {
          permanent: false,
          direction: 'top',
          className: 'leaflet-tooltip-custom',
        });
    });

    // Kiosk "You Are Here" marker
    const kioskCoord = nodeMap.get('kiosk_placed');
    if (kioskCoord) {
      L.circleMarker([kioskCoord.lat, kioskCoord.lng], {
        radius: 9,
        color: '#ffffff',
        weight: 3,
        fillColor: '#002b5c',
        fillOpacity: 1,
      })
        .addTo(map)
        .bindTooltip(t('navigation.youAreHere'), {
          permanent: true,
          direction: 'top',
          className: 'leaflet-tooltip-you',
        });
    }

    leafletMapRef.current = map;
    return () => {
      map.remove();
      leafletMapRef.current = null;
    };
  }, [mapStarted, mapData]);

  // ── 3. Render permanent building labels (re-runs if labels or map change) ─
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map || buildingLabels.length === 0) return;

    // Remove previous label layer
    buildingLayerGroupRef.current?.remove();
    const group = L.layerGroup();

    buildingLabels.forEach((b) => {
      const html = b.sub
        ? `<span class="bldg-pill"><span class="bldg-name">${b.name}</span><span class="bldg-sub">${b.sub}</span></span>`
        : `<span class="bldg-pill"><span class="bldg-name">${b.name}</span></span>`;

      L.circleMarker([b.lat, b.lng], {
        radius: 0,
        opacity: 0,
        fillOpacity: 0,
        interactive: false,
      })
        .bindTooltip(html, {
          permanent: true,
          direction: 'center',
          className: 'bldg-tooltip',
        })
        .addTo(group)
        .openTooltip();
    });

    group.addTo(map);
    buildingLayerGroupRef.current = group;
  }, [buildingLabels, leafletMapRef.current]);

  // ── drawPath ─────────────────────────────────────────────────────────────
  /** Draws the selected path on the map: blue polyline, green start, red end. */
  function drawPath(pathId: string) {
    const map = leafletMapRef.current;
    if (!map || !mapData) return;

    // Remove previous route layers
    routeLayerRef.current?.remove();
    startMarkerRef.current?.remove();
    endMarkerRef.current?.remove();
    routeLayerRef.current = null;
    startMarkerRef.current = null;
    endMarkerRef.current = null;

    const nodeMap = new Map<string, LatLng>(
      mapData.nodes.map((n) => [n.id, { lat: n.lat, lng: n.lng }])
    );
    const coords = getCoordinatesFromPath(pathId, nodeMap, mapData.paths);
    if (coords.length < 2) return;

    const latlngs: [number, number][] = coords.map((c) => [c.lat, c.lng]);

    // Blue route polyline
    const polyline = L.polyline(latlngs, {
      color: '#1d4ed8',
      weight: 5,
      opacity: 0.9,
    }).addTo(map);
    routeLayerRef.current = polyline;

    // Green start marker
    startMarkerRef.current = L.circleMarker(latlngs[0], {
      radius: 9,
      color: '#ffffff',
      weight: 3,
      fillColor: '#16a34a',
      fillOpacity: 1,
    })
      .addTo(map)
      .bindTooltip(t('navigation.start'), {
        permanent: true,
        direction: 'top',
        className: 'leaflet-tooltip-start',
      });

    // Red end marker
    const last = latlngs[latlngs.length - 1];
    endMarkerRef.current = L.circleMarker(last, {
      radius: 9,
      color: '#ffffff',
      weight: 3,
      fillColor: '#dc2626',
      fillOpacity: 1,
    })
      .addTo(map)
      .bindTooltip(t('navigation.destination'), {
        permanent: true,
        direction: 'top',
        className: 'leaflet-tooltip-end',
      });

    map.fitBounds(polyline.getBounds(), { padding: [60, 60] });
  }

  const handleSelectPath = (pathId: string) => {
    setActivePathId(pathId);
    drawPath(pathId);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      className="h-full w-full rounded-[40px] overflow-hidden flex font-sans relative shadow-sm"
      style={{ border: '1px solid #e2e8f0' }}
    >
      {/* ── Sidebar ────────────────────────────────────────────────────── */}
      <div className="w-72 shrink-0 flex flex-col bg-white border-r border-slate-100 z-10">
        {/* Header */}
        <div className="px-7 py-7 border-b border-slate-100">
          <div className="flex items-center gap-2 mb-1">
            <Navigation2 size={12} className="text-[#002b5c]/40" />
            <span className="text-[9px] font-black text-[#002b5c]/40 uppercase tracking-[0.3em]">
              {t('navigation.campusWayfinding')}
            </span>
          </div>
          <h2 className="text-2xl font-black text-[#002b5c] tracking-tight leading-none">
            {t('navigation.navigate')}
          </h2>
          <p className="text-[10px] text-slate-400 font-semibold mt-1">
            {t('navigation.selectDestination')}
          </p>
        </div>

        {/* "You Are Here" chip */}
        <div className="mx-5 mt-5 flex items-center gap-3 bg-[#002b5c]/5 rounded-2xl px-4 py-3 shrink-0">
          <div className="w-3 h-3 rounded-full bg-[#002b5c] ring-4 ring-[#002b5c]/20" />
          <span className="text-[9px] font-black text-[#002b5c] uppercase tracking-widest">
            {t('navigation.youAreHere')}
          </span>
        </div>

        {/* Destination list */}
        <div
          className="flex-1 overflow-y-auto px-4 mt-4 space-y-2 pb-4"
          style={{ scrollbarWidth: 'thin' }}
        >
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] px-2 mb-3">
            {t('navigation.destinations')}
          </p>

          {loadingData && (
            <div className="flex items-center gap-2 px-2 py-3">
              <Loader2 size={14} className="text-[#002b5c] animate-spin" />
              <span className="text-[10px] font-bold text-slate-400">
                {t('navigation.loadingRoutes')}
              </span>
            </div>
          )}

          {dataError && <p className="text-[10px] font-bold text-red-400 px-2">{dataError}</p>}

          {(mapData?.paths ?? []).map((path) => {
            const isActive = activePathId === path.id;
            return (
              <button
                key={path.id}
                onClick={() => handleSelectPath(path.id)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-all text-left active:scale-[0.98] ${
                  isActive
                    ? 'bg-[#002b5c] border-[#002b5c] text-white shadow-lg'
                    : 'bg-white border-slate-100 hover:border-[#002b5c]/30 hover:shadow-sm text-[#002b5c]'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                    isActive ? 'bg-white/15' : 'bg-slate-50'
                  }`}
                >
                  <MapPin size={14} />
                </div>
                <span className="text-xs font-black flex-1 leading-snug">
                  {resolveLabel(path.label)}
                </span>
                <ChevronRight size={13} className={isActive ? 'opacity-60' : 'opacity-30'} />
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="px-6 py-4 border-t border-slate-100 space-y-2 shrink-0">
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">
            {t('navigation.legend')}
          </p>
          {[
            { color: '#002b5c', label: t('navigation.kiosk') },
            { color: '#1d4ed8', label: t('navigation.route') },
            { color: '#16a34a', label: t('navigation.start') },
            { color: '#dc2626', label: t('navigation.destination') },
            { color: '#94a3b8', label: t('navigation.node') },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ background: item.color }}
              />
              <span className="text-[9px] font-semibold text-slate-500">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Map ─────────────────────────────────────────────────────────── */}
      <div className="flex-1 relative bg-[#0a1628]">
        {/* Splash screen — shown until user starts navigation */}
        {!mapStarted && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#0a1628]">
            {/* Decorative rings */}
            <div className="relative flex items-center justify-center mb-10">
              <div className="absolute w-48 h-48 rounded-full border border-white/5" />
              <div className="absolute w-32 h-32 rounded-full border border-white/10" />
              <div className="absolute w-20 h-20 rounded-full border border-white/20" />
              <div className="w-14 h-14 rounded-full bg-[#002b5c] border-2 border-[#1d4ed8]/60 flex items-center justify-center shadow-lg">
                <Compass size={26} className="text-white" />
              </div>
            </div>

            <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.4em] mb-2">
              {t('navigation.bfgi')}
            </p>
            <h1 className="text-3xl font-black text-white tracking-tight mb-2">
              {t('navigation.campusNavigation')}
            </h1>
            <p className="text-xs text-white/40 font-semibold mb-10 text-center max-w-xs leading-relaxed">
              {t('navigation.mapDescription')}
            </p>

            <button
              onClick={() => setMapStarted(true)}
              className="flex items-center gap-3 bg-[#1d4ed8] hover:bg-[#1e40af] active:scale-95 text-white font-black text-sm px-8 py-4 rounded-2xl transition-all shadow-lg"
            >
              <Navigation2 size={16} />
              {t('navigation.startNavigation')}
            </button>

            <p className="text-[9px] text-white/20 font-semibold mt-6 uppercase tracking-widest">
              {t('navigation.tapToLoad')}
            </p>
          </div>
        )}

        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
      </div>

      {/* Tooltip styles injected once */}
      <style>{`
        .leaflet-tooltip-custom {
          background: rgba(0,0,0,0.75);
          color: #fff;
          border: none;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 6px;
          box-shadow: none;
        }
        .leaflet-tooltip-custom::before { display: none; }
        .leaflet-tooltip-you {
          background: #002b5c;
          color: #fff;
          border: none;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 900;
          padding: 2px 7px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.25);
        }
        .leaflet-tooltip-you::before { border-top-color: #002b5c; }
        .leaflet-tooltip-start {
          background: #16a34a;
          color: #fff;
          border: none;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 900;
          padding: 2px 7px;
        }
        .leaflet-tooltip-start::before { border-top-color: #16a34a; }
        .leaflet-tooltip-end {
          background: #dc2626;
          color: #fff;
          border: none;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 900;
          padding: 2px 7px;
        }
        .leaflet-tooltip-end::before { border-top-color: #dc2626; }

        /* ── Building name labels ─────────────────────────────────── */
        .bldg-tooltip {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
          pointer-events: none !important;
        }
        .bldg-tooltip::before { display: none !important; }
        .bldg-pill {
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          gap: 1px;
          pointer-events: none;
        }
        .bldg-name {
          display: block;
          background: rgba(255, 255, 255, 0.93);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          color: #0f172a;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.02em;
          padding: 3px 8px;
          border-radius: 6px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255,255,255,0.8);
          white-space: nowrap;
          line-height: 1.3;
          border: 1px solid rgba(255,255,255,0.6);
        }
        .bldg-sub {
          display: block;
          background: rgba(0, 43, 92, 0.82);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          color: #fff;
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.04em;
          padding: 2px 6px;
          border-radius: 4px;
          box-shadow: 0 1px 6px rgba(0,0,0,0.4);
          white-space: nowrap;
          line-height: 1.3;
        }
      `}</style>
    </div>
  );
};

export default Navigation;
