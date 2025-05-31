import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiltrosMapa } from '../entities/FiltroMapa';
import {
  FiltroContainer,
  FiltrosContainer,
  ToggleWrapper,
  Slider,
  SliderThumb,
  Select,
  Datas,
  Label,
  ButtonGroup,
  AplicarButton,
  LimparButton
} from '../styles/FiltroMapa';

interface FiltroMapaProps {
  onFiltrar: (filtros: FiltrosMapa) => void;
}

const FiltroMapa: React.FC<FiltroMapaProps> = ({ onFiltrar }) => {
  const formatarParaDiaMesAno = (dataISO: string): string => {
    const [ano, mes, dia] = dataISO.split("-");
    return `${dia}/${mes}/${ano.slice(2)}`;
  };

  const navigate = useNavigate();
  const location = useLocation();

  const [estado, setEstado] = useState<number | ''>('');
  const [bioma, setBioma] = useState<number | ''>('');
  const [inicio, setInicio] = useState('');
  const [fim, setFim] = useState('');
  const [tipo, setTipo] = useState<FiltrosMapa['tipo']>('');

  const [datasDisponiveis, setDatasDisponiveis] = useState<string[]>([]);

  useEffect(() => {
    if (location.pathname.includes('foco_calor')) setTipo('foco_calor');
    else if (location.pathname.includes('area_queimada')) setTipo('area_queimada');
    else if (location.pathname.includes('risco')) setTipo('risco');
    else setTipo('');
  }, [location.pathname]);

  useEffect(() => {
    const buscarDatas = async () => {
      if (!tipo) return;
      try {
        const res = await fetch(`/api/datas_disponiveis?tipo=${tipo}`);
        const data = await res.json();

        const datasFormatadas = data.datas_disponiveis.map((d: string) =>
          new Date(d).toISOString().split('T')[0].trim()
        );

        const datasUnicas: string[] = Array.from(new Set<string>(datasFormatadas)).sort();
        setDatasDisponiveis(datasUnicas);
      } catch (error) {
        console.error('Erro ao buscar datas disponíveis:', error);
      }
    };

    buscarDatas();
  }, [tipo]);

  const datasFimDisponiveis = useMemo(() => {
    if (!inicio) return [];

    const inicioDate = new Date(inicio);
    const datas: string[] = [];

    for (let i = 0; i < 7; i++) {
      const novaData = new Date(inicioDate);
      novaData.setDate(inicioDate.getDate() + i);
      datas.push(novaData.toISOString().split('T')[0]);
    }

    return datas;
  }, [inicio]);

  const limparFiltro = () => {
    navigate('/');
    setTipo('risco');
    setEstado('');
    setBioma('');
    setInicio('');
    setFim('');
    onFiltrar({
      tipo: '',
      estado: '',
      bioma: '',
      inicio: '',
      fim: '',
    });
  };

  const aplicarFiltro = () => {
    if (!inicio || !fim) {
      alert('⚠️ Selecione um intervalo de datas antes de aplicar.');
      return;
    }

    const rota = tipo ? `/${tipo}` : '/';
    navigate(rota);
    onFiltrar({
      tipo,
      estado: estado !== '' ? estado.toString() : '',
      bioma: bioma !== '' ? bioma.toString() : '',
      inicio,
      fim,
    });
  };

  return (
    <FiltroContainer>
      <FiltrosContainer>
        <ToggleWrapper>
          <span>Foco de Calor</span>
          <Slider $ativo={tipo === 'foco_calor'} $cor="#FF9800" onClick={() => setTipo('foco_calor')}>
            <SliderThumb $ativo={tipo === 'foco_calor'} />
          </Slider>
        </ToggleWrapper>

        <ToggleWrapper>
          <span>Área Queimada</span>
          <Slider $ativo={tipo === 'area_queimada'} $cor="#FF9800" onClick={() => setTipo('area_queimada')}>
            <SliderThumb $ativo={tipo === 'area_queimada'} />
          </Slider>
        </ToggleWrapper>

        <ToggleWrapper>
          <span>Risco de Fogo</span>
          <Slider $ativo={tipo === 'risco'} $cor="#FF9800" onClick={() => setTipo('risco')}>
            <SliderThumb $ativo={tipo === 'risco'} />
          </Slider>
        </ToggleWrapper>

        <Label>Estado</Label>
        <Select value={estado} onChange={(e) => setEstado(e.target.value === '' ? '' : parseInt(e.target.value))}>
          <option value="">Selecione um estado</option>
          <option value="12">Acre</option>
          <option value="27">Alagoas</option>
          <option value="16">Amapá</option>
          <option value="13">Amazonas</option>
          <option value="29">Bahia</option>
          <option value="23">Ceará</option>
          <option value="32">Espírito Santo</option>
          <option value="52">Goiás</option>
          <option value="21">Maranhão</option>
          <option value="51">Mato Grosso</option>
          <option value="50">Mato Grosso do Sul</option>
          <option value="31">Minas Gerais</option>
          <option value="15">Pará</option>
          <option value="25">Paraíba</option>
          <option value="41">Paraná</option>
          <option value="26">Pernambuco</option>
          <option value="22">Piauí</option>
          <option value="33">Rio de Janeiro</option>
          <option value="24">Rio Grande do Norte</option>
          <option value="43">Rio Grande do Sul</option>
          <option value="11">Rondônia</option>
          <option value="14">Roraima</option>
          <option value="42">Santa Catarina</option>
          <option value="35">São Paulo</option>
          <option value="28">Sergipe</option>
          <option value="17">Tocantins</option>
          <option value="53">Distrito Federal</option>
        </Select>

        <Label>Bioma</Label>
        <Select value={bioma} onChange={(e) => setBioma(e.target.value === '' ? '' : parseInt(e.target.value))}>
          <option value="">Selecione um bioma</option>
          <option value="3">Cerrado</option>
          <option value="2">Caatinga</option>
          <option value="6">Pantanal</option>
          <option value="4">Mata Atlântica</option>
          <option value="5">Pampa</option>
          <option value="1">Amazônia</option>
        </Select>

        <Datas>
          <Label>Data Início</Label>
          <Select value={inicio} onChange={(e) => { setInicio(e.target.value); setFim(''); }}>
            <option value="">Selecione uma data</option>
            {datasDisponiveis.map((data) => (
              <option key={data} value={data}>
                {formatarParaDiaMesAno(data)}
              </option>
            ))}
          </Select>

          <Label>Data Fim</Label>
          <Select value={fim} onChange={(e) => setFim(e.target.value)} disabled={!inicio}>
            <option value="">Selecione uma data</option>
            {datasFimDisponiveis.map((data) => (
              <option key={data} value={data}>
                {formatarParaDiaMesAno(data)}
              </option>
            ))}
          </Select>
        </Datas>

        {(!inicio || !fim) && (
          <p style={{ color: 'White', fontSize: '0.9rem' }}>
            ⚠️ Selecione um intervalo de datas válido.
          </p>
        )}

        <ButtonGroup>
          <AplicarButton onClick={aplicarFiltro} disabled={!inicio || !fim}>
            Aplicar
          </AplicarButton>
          <LimparButton onClick={limparFiltro}>
            Limpar
          </LimparButton>
        </ButtonGroup>
      </FiltrosContainer>
    </FiltroContainer>
  );
};

export default FiltroMapa;
