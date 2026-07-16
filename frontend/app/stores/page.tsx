'use client';

import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';

interface Store {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  mapsUrl?: string;
  type?: string;
  distance?: number;
}

const getDirectionsLink = (store: Store) => {
  const url = store.mapsUrl;
  if (url && url.trim() !== '') {
    if (url.includes('google.com/maps/embed') || url.includes('/embed')) {
      return `https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}`;
    }
    return url;
  }
  return `https://www.google.com/maps/dir/?api=1&destination=${store.latitude},${store.longitude}`;
};

const getEmbedSrc = (store: Store) => {
  const url = store.mapsUrl;
  if (url && url.trim() !== '') {
    if (url.includes('google.com/maps/embed') || url.includes('/embed')) {
      return url;
    }
  }
  return `https://maps.google.com/maps?q=${store.latitude},${store.longitude}&z=15&output=embed`;
};

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export default function StoreLocatorPage() {
  const [stores, setStores] = useState<Store[]>([]);
  const [isLocating, setIsLocating] = useState(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedStoreId, setSelectedStoreId] = useState<string | null>(null);

  const loadStores = async (lat?: number, lng?: number) => {
    setIsLocating(true);
    setErrorMsg('');
    try {
      const res = await api.locateStores(lat, lng);
      setStores(res);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to fetch store database.');
    } finally {
      setIsLocating(false);
    }
  };

  useEffect(() => {
    loadStores();
  }, []);

  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser.');
      return;
    }
    
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setUserCoords({ lat, lng });
        
        try {
          // Fetch fresh list from API
          const res = await api.locateStores();
          
          // Calculate distance and sort on client-side
          const sorted = res
            .map((store: Store) => {
              const distance = calculateDistance(lat, lng, Number(store.latitude), Number(store.longitude));
              return { ...store, distance: Number(distance.toFixed(2)) };
            })
            .sort((a: Store, b: Store) => {
              if (a.distance === undefined && b.distance === undefined) return 0;
              if (a.distance === undefined) return 1;
              if (b.distance === undefined) return -1;
              return a.distance - b.distance;
            });
            
          setStores(sorted);
          if (sorted.length > 0) {
            const firstLive = sorted.find((s: Store) => s.type === 'LIVE');
            if (firstLive) {
              setSelectedStoreId(firstLive.id);
            }
          }
        } catch (err: any) {
          setErrorMsg(err.message || 'Failed to locate stores.');
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        console.warn('Geolocation access denied.', err);
        setErrorMsg('Location permission denied. Please allow location access in your browser settings.');
        setIsLocating(false);
      }
    );
  };
 
  const handleManualCity = async (lat: number, lng: number, cityName: string) => {
    setIsLocating(true);
    setErrorMsg('');
    setUserCoords({ lat, lng });
    
    try {
      const res = await api.locateStores();
      const sorted = res
        .map((store: Store) => {
          const distance = calculateDistance(lat, lng, Number(store.latitude), Number(store.longitude));
          return { ...store, distance: Number(distance.toFixed(2)) };
        })
        .sort((a: Store, b: Store) => {
          if (a.distance === undefined && b.distance === undefined) return 0;
          if (a.distance === undefined) return 1;
          if (b.distance === undefined) return -1;
          return a.distance - b.distance;
        });
        
      setStores(sorted);
      if (sorted.length > 0) {
        const firstLive = sorted.find((s: Store) => s.type === 'LIVE');
        if (firstLive) {
          setSelectedStoreId(firstLive.id);
        }
      }
      setErrorMsg(`Showing outlets relative to ${cityName} city center.`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to locate stores.');
    } finally {
      setIsLocating(false);
    }
  };

  const handleStoreClick = (store: Store) => {
    if (store.type === 'UPCOMING') return;
    setSelectedStoreId(store.id);
  };

  const liveStores = stores.filter((s) => s.type === 'LIVE');
  const selectedStore = liveStores.find((s) => s.id === selectedStoreId) || liveStores[0];
  const activeSelectedId = selectedStore?.id || null;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10 bg-[#FAF9F6]">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full">
          Store Locator
        </span>
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900">
          Find a Physical <span className="gradient-text-green">EcoFone Store</span>
        </h1>
        <p className="text-slate-500 text-xs sm:text-sm">
          Locate our retail outlets and franchise experience stores. Get real-time driving directions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Actions & List */}
        <div className="lg:col-span-1 space-y-6">
          <button
            onClick={handleGeolocate}
            disabled={isLocating}
            className="w-full bg-[#0a2d1a] hover:bg-[#0c3d23] text-white border border-emerald-500/10 text-xs font-bold py-3.5 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="6" />
              <circle cx="12" cy="12" r="2" />
            </svg>
            <span>{isLocating ? 'Detecting position...' : 'Find Closest Store (GPS)'}</span>
          </button>

          {/* Manual Location Override */}
          <div className="space-y-2 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm space-y-3">
            <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Or select your city:</span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleManualCity(26.846694, 80.946166, 'Lucknow')}
                className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-extrabold text-[10px] py-2 rounded-lg border border-slate-200 transition-colors text-center"
              >
                Lucknow
              </button>
              <button
                type="button"
                onClick={() => handleManualCity(28.3640, 79.4150, 'Bareilly')}
                className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-extrabold text-[10px] py-2 rounded-lg border border-slate-200 transition-colors text-center"
              >
                Bareilly
              </button>
              <button
                type="button"
                onClick={() => handleManualCity(26.7606, 83.3731, 'Gorakhpur')}
                className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-extrabold text-[10px] py-2 rounded-lg border border-slate-200 transition-colors text-center"
              >
                Gorakhpur
              </button>
            </div>
          </div>

          {userCoords && (
            <div className="bg-emerald-500/5 border border-emerald-500/10 text-slate-655 p-3.5 rounded-2xl text-xs space-y-1">
              <span className="font-bold text-slate-800 flex items-center gap-1.5 text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                Location Pin Active
              </span>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                Coordinates: <strong className="text-slate-800">{userCoords.lat.toFixed(4)}° N, {userCoords.lng.toFixed(4)}° E</strong>. Map pin centered relative to this point.
              </p>
            </div>
          )}

          {errorMsg && (
            <div className="bg-white border border-slate-100 text-slate-500 p-3 rounded-xl text-xs shadow-sm">
              {errorMsg}
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-xs text-slate-400 font-bold uppercase tracking-wider">Nearby Outlets ({stores.length})</h3>
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
              {stores.map((store) => (
                <div
                  key={store.id}
                  onClick={() => handleStoreClick(store)}
                  className={`bg-white rounded-3xl p-5 border cursor-pointer transition-all hover:shadow-lg ${
                    activeSelectedId === store.id ? 'border-emerald-500 shadow-md scale-[1.01]' : 'border-slate-100 shadow-md'
                  }`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-900 text-sm">{store.name}</h4>
                      {store.type !== 'LIVE' && (
                        <span className="inline-block text-[9px] font-extrabold text-orange-600 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded uppercase tracking-wider">
                          Upcoming Store
                        </span>
                      )}
                    </div>
                  </div>
                  {store.type === 'LIVE' && (
                    <>
                      <p className="text-[11px] text-slate-500 leading-relaxed mt-1">{store.address}</p>
                      <div className="text-[10px] text-slate-450 mt-1 font-semibold">Phone: {store.phone}</div>
                      
                      <div className="pt-2 flex gap-2">
                        <a
                          href={getDirectionsLink(store)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-[10px] px-4 py-2.5 rounded-lg transition-colors flex-1 text-center border border-slate-200"
                        >
                          Get Driving Directions →
                        </a>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Google Maps Embed */}
        <div className="lg:col-span-2 h-[550px] rounded-3xl overflow-hidden border border-slate-100 shadow-md relative bg-[#FAF9F6] z-10">
          {selectedStore ? (
            <iframe
              src={getEmbedSrc(selectedStore)}
              className="w-full h-full border-0"
              style={{ minHeight: '550px' }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Store location map"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center space-y-3">
              <span className="text-4xl">📍</span>
              <h4 className="font-bold text-slate-800 text-sm">Select an Outlet</h4>
              <p className="text-xs text-slate-500 max-w-xs">Select a store from the list to view its official Google Maps directions and location details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
