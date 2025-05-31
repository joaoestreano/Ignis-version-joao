import React, { useEffect, useState, useCallback } from 'react';
import MapComponent from './MapComponent';
import { MapaContainer } from '../styles/MapaContainer';
import { FiltrosMapa } from '../entities/FiltroMapa';
import { BaseDado } from '../entities/BaseDado';

interface MapaProps {
  tipo: '' | 'risco' | 'foco_calor' | 'area_queimada';
  filtros: FiltrosMapa;
}

const Mapa: React.FC<MapaProps> = ({ tipo, filtros }) => {
  const [dados, setDados] = useState<BaseDado[]>([]); // 🔥 Sempre inicializa como array vazio

  const montarQueryParams = useCallback(() => {
    const params = new URLSearchParams();
    if (filtros.estado) params.append('estado', filtros.estado);
    if (filtros.bioma) params.append('bioma', filtros.bioma);
    if (filtros.inicio) params.append('inicio', filtros.inicio);
    if (filtros.fim) params.append('fim', filtros.fim);
    return params.toString();
  }, [filtros]);

  useEffect(() => {
    if (tipo === '') {
      setDados([]); // 🔥 Limpa dados quando não há tipo selecionado
      return;
    }

    const fetchData = async () => {
      const query = montarQueryParams();
      const url =
        tipo === 'risco' ? `/api/risco?${query}` :
        tipo === 'foco_calor' ? `/api/foco_calor?${query}` :
        tipo === 'area_queimada' ? `/api/area_queimada?${query}` :
        '';

      if (!url) {
        setDados([]);
        return;
      }

      try {
        const res = await fetch(url);
        const rawData = await res.json();

        if (Array.isArray(rawData)) {
          const dadosComTipo = rawData.map(item => ({
            ...item,
            tipo
          }));
          setDados(dadosComTipo);
        } else {
          console.warn('❗ Dados não são um array:', rawData);
          setDados([]);
        }
      } catch (error) {
        console.error('❌ Erro ao buscar dados:', error);
        setDados([]);
      }
    };

    fetchData();
  }, [filtros, tipo, montarQueryParams]);

  return (
    <MapaContainer>
      <MapComponent dados={dados} tipo={tipo} filtros={filtros} />
    </MapaContainer>
  );
};

export default Mapa;
