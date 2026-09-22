import React, { useState, useEffect } from 'react';
import {
  WeatherData,
  PredictionHorizon,
  StormEntity,
  AlertItem,
  RiskZonePolygon,
  LightningHotspot,
  VulnerableLocation,
  DataSourceItem,
  LocationItem,
} from './types';
import {
  fetchLocations,
  fetchCurrentWeather,
  fetchPredictions,
  fetchStorms,
  fetchAlerts,
  fetchRiskZones,
  fetchLightningHotspots,
  fetchVulnerableLocations,
  fetchDataSources,
} from './services/api';
import { datasetService } from './services/datasetService';
import { Header } from './components/common/Header';
import { Sidebar, PageId } from './components/common/Sidebar';
import { LoadingState, ErrorState } from './components/common/States';

// Pages
import { DashboardPage } from './components/pages/DashboardPage';
import { RiskMapPage } from './components/pages/RiskMapPage';
import { PredictionsPage } from './components/pages/PredictionsPage';
import { StormTrackingPage } from './components/pages/StormTrackingPage';
import { AlertsPage } from './components/pages/AlertsPage';
import { DataStatusPage } from './components/pages/DataStatusPage';
import { AIModelPage } from './components/pages/AIModelPage';
import { AIAlgorithmPage } from './components/pages/AIAlgorithmPage';
import { DatasetsPage } from './components/pages/DatasetsPage';
import { AboutPage } from './components/pages/AboutPage';

export default function App() {
  const [activePage, setActivePage] = useState<PageId>('dashboard');
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<LocationItem | null>(null);

  // Core Data States from Original Datasets
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [predictions, setPredictions] = useState<PredictionHorizon[]>([]);
  const [storms, setStorms] = useState<StormEntity[]>([]);
  const [selectedStorm, setSelectedStorm] = useState<StormEntity | null>(null);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [riskZones, setRiskZones] = useState<RiskZonePolygon[]>([]);
  const [lightningHotspots, setLightningHotspots] = useState<LightningHotspot[]>([]);
  const [vulnerableLocations, setVulnerableLocations] = useState<VulnerableLocation[]>([]);
  const [dataSources, setDataSources] = useState<DataSourceItem[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // Load initial locations
  useEffect(() => {
    async function init() {
      try {
        const locs = await fetchLocations();
        setLocations(locs);
        if (locs.length > 0) {
          setSelectedLocation(locs[0]);
        }
      } catch (err) {
        console.error('Failed to load locations', err);
      }
    }
    init();
  }, []);

  // Subscribe to dataset updates so UI updates immediately when original files are uploaded
  useEffect(() => {
    const unsubscribe = datasetService.subscribe(async () => {
      const activeState = datasetService.getSelectedState();
      if (activeState) {
        const locs = await fetchLocations(activeState);
        setLocations(locs);
        if (locs.length > 0 && (!selectedLocation || !locs.some((l) => l.id === selectedLocation.id))) {
          setSelectedLocation(locs[0]);
          loadAllData(locs[0].id);
          return;
        }
      }
      if (selectedLocation) {
        loadAllData(selectedLocation.id);
      }
    });
    return unsubscribe;
  }, [selectedLocation?.id]);

  // Fetch telemetry whenever selectedLocation changes
  useEffect(() => {
    if (!selectedLocation) return;
    loadAllData(selectedLocation.id);
  }, [selectedLocation?.id]);

  const handleSelectState = async (stateName: string) => {
    datasetService.setSelectedState(stateName);
    try {
      const locs = await fetchLocations(stateName);
      setLocations(locs);
      if (locs.length > 0) {
        setSelectedLocation(locs[0]);
        loadAllData(locs[0].id);
      }
    } catch (err) {
      console.error('Failed to change state', err);
    }
  };

  const loadAllData = async (locId: string) => {
    try {
      setError(null);
      const [
        wData,
        pData,
        sData,
        aData,
        rzData,
        lhData,
        vlData,
        dsData,
      ] = await Promise.all([
        fetchCurrentWeather(locId),
        fetchPredictions(locId),
        fetchStorms(locId),
        fetchAlerts(locId),
        fetchRiskZones(locId),
        fetchLightningHotspots(locId),
        fetchVulnerableLocations(locId),
        fetchDataSources(),
      ]);

      setWeather(wData);
      setPredictions(pData);
      setStorms(sData);
      if (sData.length > 0 && !selectedStorm) {
        setSelectedStorm(sData[0]);
      } else if (sData.length === 0) {
        setSelectedStorm(null);
      }
      setAlerts(aData);
      setRiskZones(rzData);
      setLightningHotspots(lhData);
      setVulnerableLocations(vlData);
      setDataSources(dsData);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err?.message || 'Failed to load meteorological data feeds.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    if (!selectedLocation) return;
    setRefreshing(true);
    await loadAllData(selectedLocation.id);
  };

  const handleSelectLocation = (locId: string) => {
    const found = locations.find((l) => l.id === locId);
    if (found) {
      setSelectedLocation(found);
    }
  };

  const activeAlertCount = alerts.filter(
    (a) => a.status === 'ACTIVE' || a.status === 'WARNING'
  ).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-slate-950">
      {/* Top Header */}
      <Header
        locations={locations}
        selectedLocationId={selectedLocation?.id || ''}
        onSelectLocation={handleSelectLocation}
        onRefresh={handleRefresh}
        isRefreshing={refreshing}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        alertCount={activeAlertCount}
        onNavigateAlerts={() => setActivePage('alerts')}
      />

      {/* Main Layout Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          currentPage={activePage}
          onNavigate={(page) => {
            setActivePage(page);
            setIsSidebarOpen(false);
          }}
          isOpenMobile={isSidebarOpen}
          onToggleMobile={() => setIsSidebarOpen(!isSidebarOpen)}
          activeAlertsCount={activeAlertCount}
        />

        {/* Dynamic Content Canvas */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-slate-950 via-slate-900/30 to-slate-950">
          {loading ? (
            <div className="min-h-[500px] flex items-center justify-center">
              <LoadingState message="Connecting to meteorological telemetry pipelines..." />
            </div>
          ) : error ? (
            <div className="min-h-[400px] flex items-center justify-center">
              <ErrorState
                title="Telemetry Ingestion Error"
                message={error}
                onRetry={handleRefresh}
              />
            </div>
          ) : (
            <>
              {activePage === 'datasets' && <DatasetsPage />}

              {activePage === 'dashboard' && selectedLocation && (
                <DashboardPage
                  location={selectedLocation}
                  weather={weather}
                  predictions={predictions}
                  storms={storms}
                  alerts={alerts}
                  riskZones={riskZones}
                  dataSources={dataSources}
                  onNavigate={setActivePage}
                  onSelectStorm={setSelectedStorm}
                  onSelectState={handleSelectState}
                />
              )}

              {activePage === 'risk-map' && selectedLocation && (
                <RiskMapPage
                  location={selectedLocation}
                  storms={storms}
                  alerts={alerts}
                  riskZones={riskZones}
                  lightningHotspots={lightningHotspots}
                  vulnerableLocations={vulnerableLocations}
                  selectedStorm={selectedStorm}
                  onSelectStorm={setSelectedStorm}
                />
              )}

              {activePage === 'predictions' && selectedLocation && (
                <PredictionsPage
                  location={selectedLocation}
                  predictions={predictions}
                  onPredictionsUpdated={(updated) => setPredictions(updated)}
                />
              )}

              {activePage === 'storm-tracking' && (
                <StormTrackingPage
                  storms={storms}
                  selectedStorm={selectedStorm}
                  onSelectStorm={setSelectedStorm}
                />
              )}

              {activePage === 'alerts' && <AlertsPage alerts={alerts} />}

              {activePage === 'data-status' && (
                <DataStatusPage dataSources={dataSources} />
              )}

              {(activePage === 'ai-algorithm' || activePage === 'ai-model') && selectedLocation && (
                <AIAlgorithmPage
                  location={selectedLocation}
                  weather={weather}
                  predictions={predictions}
                  storms={storms}
                  alerts={alerts}
                  riskZones={riskZones}
                  lightningHotspots={lightningHotspots}
                  dataSources={dataSources}
                />
              )}

              {activePage === 'about' && <AboutPage />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
