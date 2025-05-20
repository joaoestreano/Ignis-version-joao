import React, { useEffect, useState, useTransition } from 'react';
import { Chart } from 'react-google-charts';
import { useLocation } from 'react-router-dom';

interface Ocorrencia {
  estado: string;
  bioma: string;
  data: string;
  risco_fogo?: number;
  frp?: number;
  area_queimada?: number;
}

interface Filtros {
  tipo: string;   // ← necessário para saber se é foco, risco ou área queimada
  local: string;  // ← necessário para saber se agrupa por estado ou bioma
  estado: string;
  bioma: string;
  inicio: string;
  fim: string;
}

interface Props {
  filtros: Filtros;
}

const Grafico: React.FC<Props> = ({ filtros }) => {
  const [dados, setDados] = useState<Ocorrencia[]>([]);
  const [isPending, startTransition] = useTransition();
  const location = useLocation();

  const tipo = filtros.tipo === 'Focos'
    ? 'foco_calor'
    : filtros.tipo === 'Riscos'
      ? 'risco'
      : 'area_queimada';


  const tipoValor =
    tipo === 'area_queimada'
      ? 'area_queimada'
      : tipo === 'foco_calor'
        ? 'frp'
        : 'risco_fogo';

  const montarQueryParams = () => {
    const params = new URLSearchParams();
    if (filtros.estado) params.append('estado', filtros.estado);
    if (filtros.bioma) params.append('bioma', filtros.bioma);
    if (filtros.inicio) params.append('inicio', filtros.inicio);
    if (filtros.fim) params.append('fim', filtros.fim);
    return params.toString();
  };

  useEffect(() => {
    const fetchData = async () => {
      const query = montarQueryParams();
      const url = `http://localhost:3000/api/${tipo}?${query}`;
      try {
        const res = await fetch(url);
        const rawData = await res.json();
        if (Array.isArray(rawData)) {
          startTransition(() => {
            setDados(rawData);
          });
        } else {
          setDados([]);
        }
      } catch (error) {
        console.error('Erro ao buscar dados do gráfico:', error);
        setDados([]);
      }
    };

    fetchData();
  }, [filtros, tipo]);

  // Agrupar por estado ou bioma
  const agrupado: Record<string, number> = {};
  dados.forEach((d) => {
    const chave = filtros.local === 'Biomas' ? d.bioma : d.estado;
    const valor = Number(d[tipoValor as keyof Ocorrencia]) || 0;
    if (!agrupado[chave]) agrupado[chave] = 0;
    agrupado[chave] += valor;
  });

  const chartData = [
    ['Categoria', tipoValor.toUpperCase(), { role: 'style' }],
    ...Object.entries(agrupado)
      .sort((a, b) => b[1] - a[1])
      .map(([chave, valor]) => {
        const cor = getCorBioma(chave);
        return [chave, valor, cor];
      }),
  ];

  function getCorBioma(bioma: string): string {
    switch (bioma.toLowerCase()) {
      case 'amazonia': return '#00b050';
      case 'cerrado': return '#ff0000';
      case 'pantanal': return '#4f81bd';
      case 'mata atlantica': return '#7030a0';
      case 'caatinga': return '#ffc000';
      case 'pampa': return '#ffff00';
      default: return '#999999';
    }
  }

  const agrupamento = filtros.local === 'Biomas' ? 'Bioma' : 'Estado';
const options = {
  title: `${tipoValor.toUpperCase()} por ${agrupamento}`,
    legend: { position: 'none' },
    bars: 'horizontal' as const,
    hAxis: { minValue: 0 },
    height: 400,
    backgroundColor: '#2b2b2b',
    titleTextStyle: { color: '#fff' },
    hAxisTextStyle: { color: '#fff' },
    vAxisTextStyle: { color: '#fff' },
  };

  return (
    <div
      style={{
        padding: '20px',
        backgroundColor: '#2b2b2b',
        minHeight: '60vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        border: '4px solid #111',
      }}
    >
      {chartData.length <= 1 ? (
        <p style={{ color: 'white' }}>Nenhum dado disponível.</p>
      ) : (
        <Chart chartType="BarChart" data={chartData} options={options} width="100%" height="400px" />
      )}
    </div>
  );
};

export default Grafico;
