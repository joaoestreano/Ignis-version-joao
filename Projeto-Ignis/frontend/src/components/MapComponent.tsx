// MapComponent.tsx
import * as L from 'leaflet';
import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from 'react-leaflet';
import type { FeatureCollection } from 'geojson';

interface BaseDado {
  latitude: number;
  longitude: number;
  estado: string;
  bioma: string;
  risco_fogo: number;
  data: string;
  frp?: number;
  dia_sem_chuva?: string;
  precipitacao?: number;
  tipo: 'risco' | 'foco' | 'area_queimada';
}

interface Props {
  dados: BaseDado[];
  filtros: {
    bioma: string;
  };
  tipo: '' | 'risco' | 'foco_calor' | 'area_queimada';
}

// Limites do Brasil para impedir que o usuário mova o mapa para fora
const brasilBounds: L.LatLngBoundsExpression = [
  [-34.0, -74.0],
  [5.3, -32.4],
];

// Define a cor baseada no valor do risco de fogo
const getColor = (valor: number): string => {
  if (valor >= 0.8) return '#800026'; //vermelho escuro
  if (valor >= 0.6) return '#BD0026'; //vermelho forte
  if (valor >= 0.4) return '#FC4E2A'; //laranja avermelhado
  if (valor >= 0.2) return '#FD8D3C'; //laranja medio
  if (valor > 0) return '#FED976'; // amarelo
  return '#FFEDA0';
};

// Coordenadas aproximadas dos centros dos estados brasileiros
const centroEstados: Record<string, { lat: number; lon: number }> = {
  'Acre': { lat: -9.02, lon: -70.81 },
  'Alagoas': { lat: -9.57, lon: -36.78 },
  'Amapá': { lat: 1.41, lon: -51.77 },
  'Amazonas': { lat: -3.47, lon: -65.10 },
  'Bahia': { lat: -12.96, lon: -41.55 },
  'Ceará': { lat: -5.20, lon: -39.50 },
  'Distrito Federal': { lat: -15.83, lon: -47.86 },
  'Espírito Santo': { lat: -19.19, lon: -40.34 },
  'Goiás': { lat: -15.98, lon: -49.86 },
  'Maranhão': { lat: -5.42, lon: -45.44 },
  'Mato Grosso': { lat: -12.64, lon: -55.42 },
  'Mato Grosso do Sul': { lat: -20.51, lon: -54.54 },
  'Minas Gerais': { lat: -18.10, lon: -44.38 },
  'Pará': { lat: -3.79, lon: -52.48 },
  'Paraíba': { lat: -7.12, lon: -36.72 },
  'Paraná': { lat: -24.89, lon: -51.55 },
  'Pernambuco': { lat: -8.38, lon: -37.86 },
  'Piauí': { lat: -7.72, lon: -43.00 },
  'Rio de Janeiro': { lat: -22.84, lon: -43.15 },
  'Rio Grande do Norte': { lat: -5.81, lon: -36.59 },
  'Rio Grande do Sul': { lat: -30.01, lon: -53.43 },
  'Rondônia': { lat: -10.90, lon: -62.80 },
  'Roraima': { lat: 2.05, lon: -61.39 },
  'Santa Catarina': { lat: -27.45, lon: -50.95 },
  'São Paulo': { lat: -23.55, lon: -46.64 },
  'Sergipe': { lat: -10.57, lon: -37.45 },
  'Tocantins': { lat: -10.25, lon: -48.25 }
};

const normalizar = (str: string) =>
  str.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

const MapComponent: React.FC<Props> = ({ dados, filtros, tipo }) => {
  const [geojsonBiomas, setGeojsonBiomas] = useState<FeatureCollection | null>(null);

  // Carrega o arquivo GeoJSON dos biomas
  useEffect(() => {
    fetch('/biomas.geojson')
      .then(res => res.json())
      .then(data => setGeojsonBiomas(data))
      .catch(err => console.error('Erro ao carregar biomas:', err));
  }, []);

  // Mapeia ID numérico para nome de biomas
  const biomaIdToNome: Record<number, string> = {
    1: 'Amazônia', 2: 'Caatinga', 3: 'Cerrado', 4: 'Mata Atlântica', 5: 'Pampa', 6: 'Pantanal'
  };

  // Filtra o contorno do bioma selecionado para exibir no mapa
  const contornoFiltrado = useMemo(() => {
    if (!geojsonBiomas || !filtros.bioma) return null;
    const nomeBioma = biomaIdToNome[Number(filtros.bioma)];
    if (!nomeBioma) return null;
    const filtrados = geojsonBiomas.features.filter(f => {
      const nome = f.properties?.bioma;
      return nome && normalizar(nome) === normalizar(nomeBioma);
    });
    return { ...geojsonBiomas, features: filtrados };
  }, [geojsonBiomas, filtros.bioma]);

  // Agrupa os dados de risco por estado e calcula a média
  const dadosRiscoPorEstado = useMemo(() => {
    if (tipo !== 'risco') return [];
    const agrupado = dados.reduce<Record<string, { total: number; count: number }>>((acc, item) => {
      if (item.risco_fogo < 0) return acc;
      if (!acc[item.estado]) acc[item.estado] = { total: 0, count: 0 };
      acc[item.estado].total += item.risco_fogo;
      acc[item.estado].count++;
      return acc;
    }, {});
    return Object.entries(agrupado).map(([estado, { total, count }]) => ({
      estado,
      media: total / count,
      latitude: centroEstados[estado]?.lat ?? -15.78,
      longitude: centroEstados[estado]?.lon ?? -47.92
    }));
  }, [dados, tipo]);

  return (
    <MapContainer center={[-15.78, -47.92]} zoom={4} minZoom={5} style={{ height: '95vh', width: '75%', marginLeft: '24%', marginTop: '70px', borderRadius: '10px' }} maxBounds={brasilBounds} maxBoundsViscosity={1.0}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />

      {/* Exibe ícones de risco de fogo por estado */}
      {tipo === 'risco' && dadosRiscoPorEstado.map((item, idx) => (
        <Marker
          key={idx}
          position={[item.latitude, item.longitude]}
          icon={L.divIcon({
            className: 'custom-icon',
            html: `<div style="background-color: ${getColor(item.media)}; width: 35px; height: 35px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">${item.media.toFixed(2)}</div>`
          })}
        >
          <Popup>
            <strong>Estado:</strong> {item.estado}<br />
            <strong>Média Risco de Fogo:</strong> {item.media.toFixed(2)}
          </Popup>
        </Marker>
      ))}

      {/* Marcadores individuais para foco de calor e área queimada */}
      {(tipo === 'foco_calor' || tipo === 'area_queimada') && dados.map((item, idx) => (
        <Marker
          key={idx}
          position={[item.latitude, item.longitude]}
          icon={L.divIcon({
            className: 'custom-icon',
            html: `<div style="background-color: ${getColor(item.risco_fogo)}; width: 20px; height: 20px; border-radius: 50%;"></div>`
          })}
        >
          <Popup>
            <strong>Data:</strong> {new Date(item.data).toLocaleDateString()}<br />
            <strong>Estado:</strong> {item.estado}<br />
            <strong>Bioma:</strong> {item.bioma}<br />
            <strong>Risco de Fogo:</strong> {item.risco_fogo}<br />
            {item.frp !== undefined && <><strong>FRP:</strong> {item.frp}<br /></>}
            {item.dia_sem_chuva && (
              <>
                <strong>Dias sem chuva:</strong> {item.dia_sem_chuva}<br />
                <strong>Precipitação:</strong> {item.precipitacao}<br />
              </>
            )}
          </Popup>
        </Marker>
      ))}

      {/* Exibe o contorno do bioma selecionado */}
      {contornoFiltrado && (
        <GeoJSON
          key={filtros.bioma}
          data={contornoFiltrado}
          style={() => ({
            color: 'black',
            weight: 3,
            fillOpacity: 0
          })}
        />
      )}
    </MapContainer>
  );
};

export default MapComponent;
