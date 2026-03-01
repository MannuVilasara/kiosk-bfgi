import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Navigation2, ChevronRight, Compass } from 'lucide-react';

// ── Map Data ──────────────────────────────────────────────────────────────────
const MAP_DATA = {
  nodes: [
    { id: 'Gate',                    lat: 30.25324731661996,  lng: 74.84412526180347 },
    { id: 'Parking',                 lat: 30.25269024585599,  lng: 74.84417006980173 },
    { id: 'Park1',                   lat: 30.252113382642953, lng: 74.84341430638237 },
    { id: 'Parking_junction',        lat: 30.252705445441148, lng: 74.84361061425308 },
    { id: 'park_junction',           lat: 30.252421699498658, lng: 74.84336620891912 },
    { id: 'kiosk_placed',            lat: 30.251786667710704, lng: 74.84289473509908 },
    { id: 'blockA_junction1',        lat: 30.25208052769207,  lng: 74.84305141485102 },
    { id: 'blockA',                  lat: 30.251867716958323, lng: 74.8427757256478  },
    { id: 'connect_junction1',       lat: 30.25160687721107,  lng: 74.8424932630872  },
    { id: 'cad_junction',            lat: 30.251423858059713, lng: 74.84232174821103 },
    { id: 'cad_block',               lat: 30.251326247709308, lng: 74.84243474624569 },
    { id: 'Boys_Hostel_junction',    lat: 30.251301845104784, lng: 74.8428625245402  },
    { id: 'Boys_Hostel_mid_junction',lat: 30.251085064145318, lng: 74.84308539989519 },
    { id: 'Boys_Hostel',             lat: 30.25091508958664,  lng: 74.84335023764241 },
    { id: 'blockB_junction',         lat: 30.251127540621148, lng: 74.84194441547791 },
    { id: 'blockB',                  lat: 30.251035262118187, lng: 74.84209645870588 },
    { id: 'Library_junction',        lat: 30.25145228956008,  lng: 74.84156280849645 },
    { id: 'Library',                 lat: 30.251383139875884, lng: 74.84148036552736 },
    { id: 'main_junction',           lat: 30.250685164845926, lng: 74.84132588717452 },
    { id: 'main_canteen',            lat: 30.250797379793315, lng: 74.84117052272076 },
    { id: 'blockE_junction',         lat: 30.250913934480067, lng: 74.84096114051607 },
    { id: 'blockE',                  lat: 30.25099133511851,  lng: 74.84065703676549 },
  ],
  paths: [
    {
      id: 'to_cad_block',
      label: 'CAD Block',
      segments: [
        { from: 'kiosk_placed', to: 'blockA'      },
        { from: 'blockA',       to: 'cad_junction' },
        { from: 'cad_junction', to: 'cad_block'    },
      ],
    },
    {
      id: 'to_blockB',
      label: 'Block B',
      segments: [
        { from: 'kiosk_placed',    to: 'blockA'          },
        { from: 'blockA',          to: 'cad_junction'    },
        { from: 'cad_junction',    to: 'blockB_junction' },
        { from: 'blockB_junction', to: 'blockB'          },
      ],
    },
    {
      id: 'to_main_canteen',
      label: 'Main Canteen',
      segments: [
        { from: 'kiosk_placed',  to: 'blockA'        },
        { from: 'blockA',        to: 'cad_junction'  },
        { from: 'cad_junction',  to: 'main_junction' },
        { from: 'main_junction', to: 'main_canteen'  },
      ],
    },
    {
      id: 'to_boys_hostel',
      label: 'Boys Hostel',
      segments: [
        { from: 'kiosk_placed',            to: 'blockA'                  },
        { from: 'blockA',                  to: 'connect_junction1'       },
        { from: 'connect_junction1',       to: 'Boys_Hostel_junction'    },
        { from: 'Boys_Hostel_junction',    to: 'Boys_Hostel_mid_junction'},
        { from: 'Boys_Hostel_mid_junction',to: 'Boys_Hostel'             },
      ],
    },
    {
      id: 'to_library',
      label: 'Library',
      segments: [
        { from: 'kiosk_placed',    to: 'blockA'           },
        { from: 'blockA',          to: 'cad_junction'     },
        { from: 'cad_junction',    to: 'blockB_junction'  },
        { from: 'blockB_junction', to: 'Library_junction' },
        { from: 'Library_junction',to: 'Library'          },
      ],
    },
  ],
};

// ── Types ─────────────────────────────────────────────────────────────────────
interface LatLng { lat: number; lng: number; }

// ── Helpers ───────────────────────────────────────────────────────────────────
const nodeMap = new Map<string, LatLng>(
  MAP_DATA.nodes.map((n) => [n.id, { lat: n.lat, lng: n.lng }])
);

/** Returns an ordered array of LatLng coords for the given path ID. */
function getCoordinatesFromPath(pathId: string): LatLng[] {
  const path = MAP_DATA.paths.find((p) => p.id === pathId);
  if (!path || path.segments.length === 0) return [];

  const ids: string[] = [path.segments[0].from];
  for (const seg of path.segments) ids.push(seg.to);

  return ids.flatMap((id) => {
    const coord = nodeMap.get(id);
    return coord ? [coord] : [];
  });
}

// ── Component ─────────────────────────────────────────────────────────────────
const Navigation = () => {
  const mapRef        = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const startMarkerRef= useRef<L.CircleMarker | null>(null);
  const endMarkerRef  = useRef<L.CircleMarker | null>(null);

  const [activePathId, setActivePathId] = useState<string | null>(null);
  const [mapStarted, setMapStarted]     = useState(false);

  // ── Initialise map once user taps "Start Navigation" ────────────────────
  useEffect(() => {
    if (!mapStarted || !mapRef.current || leafletMapRef.current) return;

    // Auto-centre: compute average lat/lng of all nodes
    const lats = MAP_DATA.nodes.map((n) => n.lat);
    const lngs = MAP_DATA.nodes.map((n) => n.lng);
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
    MAP_DATA.nodes.forEach((node) => {
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
        .bindTooltip('You Are Here', { permanent: true, direction: 'top', className: 'leaflet-tooltip-you' });
    }

    leafletMapRef.current = map;
    return () => { map.remove(); leafletMapRef.current = null; };
  }, [mapStarted]);

  // ── drawPath ─────────────────────────────────────────────────────────────
  /** Draws the selected path on the map: blue polyline, green start, red end. */
  function drawPath(pathId: string) {
    const map = leafletMapRef.current;
    if (!map) return;

    // Remove previous route layers
    routeLayerRef.current?.remove();
    startMarkerRef.current?.remove();
    endMarkerRef.current?.remove();
    routeLayerRef.current = null;
    startMarkerRef.current = null;
    endMarkerRef.current = null;

    const coords = getCoordinatesFromPath(pathId);
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
    }).addTo(map).bindTooltip('Start', { permanent: true, direction: 'top', className: 'leaflet-tooltip-start' });

    // Red end marker
    const last = latlngs[latlngs.length - 1];
    endMarkerRef.current = L.circleMarker(last, {
      radius: 9,
      color: '#ffffff',
      weight: 3,
      fillColor: '#dc2626',
      fillOpacity: 1,
    }).addTo(map).bindTooltip('Destination', { permanent: true, direction: 'top', className: 'leaflet-tooltip-end' });

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
              Campus Wayfinding
            </span>
          </div>
          <h2 className="text-2xl font-black text-[#002b5c] tracking-tight leading-none">
            Navigate
          </h2>
          <p className="text-[10px] text-slate-400 font-semibold mt-1">
            Select a destination below
          </p>
        </div>

        {/* "You Are Here" chip */}
        <div className="mx-5 mt-5 flex items-center gap-3 bg-[#002b5c]/5 rounded-2xl px-4 py-3 shrink-0">
          <div className="w-3 h-3 rounded-full bg-[#002b5c] ring-4 ring-[#002b5c]/20" />
          <span className="text-[9px] font-black text-[#002b5c] uppercase tracking-widest">
            You Are Here — Kiosk
          </span>
        </div>

        {/* Destination list */}
        <div className="flex-1 overflow-y-auto px-4 mt-4 space-y-2 pb-4" style={{scrollbarWidth:'thin'}}>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] px-2 mb-3">
            Destinations
          </p>
          {MAP_DATA.paths.map((path) => {
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
                <span className="text-xs font-black flex-1 leading-snug">{path.label}</span>
                <ChevronRight size={13} className={isActive ? 'opacity-60' : 'opacity-30'} />
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="px-6 py-4 border-t border-slate-100 space-y-2 shrink-0">
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-2">Legend</p>
          {[
            { color: '#002b5c', label: 'Kiosk (You Are Here)' },
            { color: '#1d4ed8', label: 'Route' },
            { color: '#16a34a', label: 'Start' },
            { color: '#dc2626', label: 'Destination' },
            { color: '#94a3b8', label: 'Node' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: item.color }} />
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
              Baba Farid Group of Institutions
            </p>
            <h1 className="text-3xl font-black text-white tracking-tight mb-2">
              Campus Navigation
            </h1>
            <p className="text-xs text-white/40 font-semibold mb-10 text-center max-w-xs leading-relaxed">
              Interactive satellite map with walking directions to buildings, hostels &amp; facilities.
            </p>

            <button
              onClick={() => setMapStarted(true)}
              className="flex items-center gap-3 bg-[#1d4ed8] hover:bg-[#1e40af] active:scale-95 text-white font-black text-sm px-8 py-4 rounded-2xl transition-all shadow-lg"
            >
              <Navigation2 size={16} />
              Start Navigation
            </button>

            <p className="text-[9px] text-white/20 font-semibold mt-6 uppercase tracking-widest">
              Tap to load satellite map
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
      `}</style>
    </div>
  );
};

export default Navigation;
