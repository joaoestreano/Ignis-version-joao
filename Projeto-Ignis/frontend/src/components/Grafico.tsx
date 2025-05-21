import React, { useEffect, useState } from 'react';
import { Chart } from 'react-google-charts';

interface DadoGrafico {
  categoria: string;
  total: number;
}


interface Filtros {
  tipo: string;
  local: string;
  estado: string;
  bioma: string;
  inicio: string;
  fim: string;
}

interface Props {
  filtros: Filtros;
}

const Grafico: React.FC<Props> = ({ filtros }) => {
  const [dados, setDados] = useState<DadoGrafico[]>([]);


  const montarQueryParams = () => {
    const params = new URLSearchParams();
    if (filtros.estado) params.append('estado', filtros.estado);
    if (filtros.bioma) params.append('bioma', filtros.bioma);
    if (filtros.inicio) params.append('inicio', filtros.inicio);
    if (filtros.fim) params.append('fim', filtros.fim);
    params.append('local', filtros.local); // ← importante!
    return params.toString();
  };

  useEffect(() => {
    const fetchData = async () => {
      const query = montarQueryParams();
      const url = `http://localhost:3000/api/grafico/area_queimada?${query}`;
      try {
        const res = await fetch(url);
        const rawData = await res.json();
        console.log("Dados do gráfico:", rawData); // debug
        if (Array.isArray(rawData)) {
          setDados(rawData);
        } else {
          setDados([]);
        }
      } catch (error) {
        console.error('Erro ao buscar dados do gráfico:', error);
        setDados([]);
      }
    };

    fetchData();
  }, [filtros]);

  const chartData = [
    ['Categoria', 'Área Queimada', { role: 'style' }],
    ...dados.map((d) => [d.categoria, Number(d.total), getCorBioma(d.categoria)]),
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
        <Chart
          chartType="BarChart"
          data={chartData}
          options={{
            title: `Área Queimada por ${filtros.local === 'Biomas' ? 'Bioma' : 'Estado'}`,
            legend: { position: 'none' },
            bars: 'horizontal',
            height: 400,
            backgroundColor: '#2b2b2b',
            titleTextStyle: { color: '#fff' },
            hAxis: { minValue: 0, textStyle: { color: '#fff' } },
            vAxis: { textStyle: { color: '#fff' } },
          }}
          width="100%"
          height="400px"
        />
      )}
    </div>
  );
};

export default Grafico;
