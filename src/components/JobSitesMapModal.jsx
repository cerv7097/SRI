import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, MapPin } from 'lucide-react';

const getCacheKey = (site) => `${(site?.jobName || '').toLowerCase()}-${(site?.address || '').toLowerCase()}`;

const JobSitesMapModal = ({ isOpen, onClose, jobSites = [] }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [geocodeCache, setGeocodeCache] = useState({});
  const [geocodeStatus, setGeocodeStatus] = useState('idle');
  const [geocodeError, setGeocodeError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setActiveIndex(0);
      setGeocodeStatus('idle');
      setGeocodeError(null);
    }
  }, [isOpen]);

  const activeSite = useMemo(() => jobSites[activeIndex], [jobSites, activeIndex]);

  useEffect(() => {
    if (!isOpen || !activeSite) {
      return;
    }

    const cacheKey = getCacheKey(activeSite);
    if (geocodeCache[cacheKey]) {
      setGeocodeStatus('success');
      setGeocodeError(null);
      return;
    }

    const controller = new AbortController();
    const fetchCoordinates = async () => {
      setGeocodeStatus('loading');
      setGeocodeError(null);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(activeSite.address)}&limit=1`,
          {
            headers: {
              'Accept': 'application/json',
            },
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error('Geocoding request failed');
        }

        const results = await response.json();
        if (!Array.isArray(results) || results.length === 0) {
          setGeocodeCache((prev) => ({ ...prev, [cacheKey]: null }));
          setGeocodeStatus('error');
          setGeocodeError('Unable to locate that address.');
          return;
        }

        const { lat, lon } = results[0];
        setGeocodeCache((prev) => ({ ...prev, [cacheKey]: { lat: Number(lat), lon: Number(lon) } }));
        setGeocodeStatus('success');
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }
        console.error('Error geocoding address:', error);
        setGeocodeStatus('error');
        setGeocodeError('Unable to reach the map service. Please try again.');
      }
    };

    fetchCoordinates();

    return () => {
      controller.abort();
    };
  }, [activeSite, geocodeCache, isOpen]);

  const activeCoordinates = useMemo(() => {
    if (!activeSite) {
      return null;
    }
    const cacheKey = getCacheKey(activeSite);
    return geocodeCache[cacheKey] || null;
  }, [activeSite, geocodeCache]);

  const mapSrc = useMemo(() => {
    if (!activeCoordinates) {
      return '';
    }
    const { lat, lon } = activeCoordinates;
    const delta = 0.01;
    const bbox = [
      (lon - delta).toFixed(6),
      (lat - delta).toFixed(6),
      (lon + delta).toFixed(6),
      (lat + delta).toFixed(6),
    ].join(',');
    return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat.toFixed(6)},${lon.toFixed(6)}`;
  }, [activeCoordinates]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-5xl rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Current Job Sites</p>
            <h3 className="text-xl font-semibold text-slate-900">Live Map View</h3>
          </div>
          <button
            onClick={onClose}
            className="text-sm font-semibold text-slate-500 transition hover:text-slate-900"
          >
            Close
          </button>
        </div>

        <div className="grid gap-4 p-6 lg:grid-cols-3">
          <div className="space-y-3 lg:col-span-1">
            {jobSites.map((site, index) => (
              <button
                key={`${site.jobName}-${site.address}-${index}`}
                onClick={() => setActiveIndex(index)}
                className={`w-full rounded-xl border px-4 py-3 text-left transition ${
                  index === activeIndex
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 bg-white hover:border-blue-300'
                }`}
              >
                <p className="text-sm font-semibold text-slate-900">{site.jobName}</p>
                <p className="text-xs text-slate-500">{site.address}</p>
                <p className="text-[11px] uppercase tracking-wide text-slate-400">
                  {site.status === 'completed' ? 'Completed' : 'Active'} · {new Date(site.updatedAt).toLocaleDateString()}
                </p>
              </button>
            ))}
          </div>

          <div className="lg:col-span-2">
            {!activeSite ? (
              <div className="flex h-[450px] items-center justify-center rounded-2xl border border-dashed border-slate-200 text-slate-500">
                No job site selected.
              </div>
            ) : geocodeStatus === 'loading' ? (
              <div className="flex h-[450px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 text-slate-500">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                Locating address on the map...
              </div>
            ) : geocodeStatus === 'error' || !activeCoordinates ? (
              <div className="flex h-[450px] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-200 text-center text-slate-500">
                <MapPin className="h-6 w-6 text-orange-500" />
                <p>{geocodeError || 'Unable to locate this address. Try another job.'}</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                  <iframe
                    title={`Map of ${activeSite.jobName}`}
                    src={mapSrc}
                    width="100%"
                    height="450"
                    loading="lazy"
                  />
                  <div className="pointer-events-none absolute left-1/2 top-4 -translate-x-1/2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-700 shadow">
                    {activeSite.jobName}
                  </div>
                </div>
                <a
                  href={`https://www.openstreetmap.org/?mlat=${activeCoordinates.lat}&mlon=${activeCoordinates.lon}#map=18/${activeCoordinates.lat}/${activeCoordinates.lon}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-500"
                >
                  Open full map view
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobSitesMapModal;
