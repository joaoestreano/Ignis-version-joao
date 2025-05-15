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

  const tipo =
    location.pathname === '/risco' ? 'risco' :
    location.pathname === '/foco_calor' ? 'foco_calor' :
    location.pathname === '/area_queimada' ? 'area_queimada' :
    'area_queimada';

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
      console.log('Buscando dados de:', url); // <- DEBUG
      try {
        const res = await fetch(url);
        const rawData = await res.json();
        console.log('Dados recebidos:', rawData); // <- DEBUG

        if (Array.isArray(rawData)) {
          startTransition(() => {
            setDados(rawData);
          });
        } else {
          console.warn('Resposta inesperada do backend:', rawData);
          setDados([]);
        }
      } catch (error) {
        console.error('Erro ao buscar dados do gráfico:', error);
        setDados([]);
      }
    };

    fetchData();
  }, [filtros, tipo]);

  // Agrupamento por categoria (bioma ou estado)
  const agrupado: Record<string, number> = {};
  dados.forEach((d) => {
    const chave = d.bioma || d.estado || 'Desconhecido';
    const valor = Number(d[tipoValor as keyof Ocorrencia]) || 0;
    if (!agrupado[chave]) agrupado[chave] = 0;
    agrupado[chave] += valor;
  });

  const chartData = [
    ['Categoria', tipoValor.toUpperCase()],
    ...Object.entries(agrupado),
  ];

  const options = {
    title: 'Dados por Categoria',
    legend: { position: 'none' },
    bars: 'horizontal' as const,
    hAxis: { minValue: 0 },
    height: 400,
    backgroundColor: '#333',
    titleTextStyle: { color: '#fff' },
    hAxisTextStyle: { color: '#fff' },
    vAxisTextStyle: { color: '#fff' },
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#222', minHeight: '60vh' }}>
      {chartData.length <= 1 ? (
        <p style={{ color: 'white' }}>Nenhum dado disponível.</p>
      ) : (
        <Chart chartType="BarChart" data={chartData} options={options} />
      )}
    </div>
  );
};

export default Grafico;
