import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiltroContainer,
  FiltrosContainer,
  Label,
  Select,
  Datas,
  InputGroup,
  InputContainer,
  Input,
  ButtonGroup,
  AplicarButton,
  LimparButton,
} from '../styles/FiltroMapa';

interface Filtros {
  tipo: string;
  estado: string;
  bioma: string;
  inicio: string;
  fim: string;
}

interface FiltroGraficoProps {
  onAplicar: (filtros: Filtros) => void;
}

const estados = [
  { id: '12', nome: 'Acre' }, { id: '27', nome: 'Alagoas' }, { id: '16', nome: 'Amapá' },
  { id: '13', nome: 'Amazonas' }, { id: '29', nome: 'Bahia' }, { id: '23', nome: 'Ceará' },
  { id: '32', nome: 'Espírito Santo' }, { id: '52', nome: 'Goiás' }, { id: '21', nome: 'Maranhão' },
  { id: '51', nome: 'Mato Grosso' }, { id: '50', nome: 'Mato Grosso do Sul' }, { id: '31', nome: 'Minas Gerais' },
  { id: '15', nome: 'Pará' }, { id: '25', nome: 'Paraíba' }, { id: '41', nome: 'Paraná' },
  { id: '26', nome: 'Pernambuco' }, { id: '22', nome: 'Piauí' }, { id: '33', nome: 'Rio de Janeiro' },
  { id: '24', nome: 'Rio Grande do Norte' }, { id: '43', nome: 'Rio Grande do Sul' }, { id: '11', nome: 'Rondônia' },
  { id: '14', nome: 'Roraima' }, { id: '42', nome: 'Santa Catarina' }, { id: '35', nome: 'São Paulo' },
  { id: '28', nome: 'Sergipe' }, { id: '17', nome: 'Tocantins' }, { id: '53', nome: 'Distrito Federal' }
];

const biomas = [
  { id: '1', nome: 'Amazônia' }, { id: '2', nome: 'Caatinga' }, { id: '3', nome: 'Cerrado' },
  { id: '4', nome: 'Mata Atlântica' }, { id: '5', nome: 'Pampa' }, { id: '6', nome: 'Pantanal' }
];

// Mapeamento de estados para seus biomas
const estadoBiomasMap: Record<string, string[]> = {
  '12': ['1', '3'],  // Acre → Amazônia, Cerrado
  '13': ['1'],
  '29': ['3', '4'],
  '15': ['1', '3'],
  '51': ['1', '3'],
  '50': ['3', '6'],
  '43': ['5'],
  '52': ['3'],
  '16': ['1'],
  '14': ['1'],
  '21': ['3'],
  // adicione depois os demais conforme seu banco real
};

const FiltroGrafico: React.FC<FiltroGraficoProps> = ({ onAplicar }) => {
  const navigate = useNavigate();

  const [tipo, setTipo] = useState<string>('');
  const [estado, setEstado] = useState<string>('');
  const [bioma, setBioma] = useState<string>('');
  const [inicio, setInicio] = useState('');
  const [fim, setFim] = useState('');

  const aplicar = () => {
    if (!inicio || !fim) {
      alert("Selecione o intervalo de datas");
      return;
    }
    navigate('/grafico');
    onAplicar({ tipo, estado, bioma, inicio, fim });
  };

  const limpar = () => {
    setTipo('');
    setEstado('');
    setBioma('');
    setInicio('');
    setFim('');
    onAplicar({ tipo: '', estado: '', bioma: '', inicio: '', fim: '' });
  };

  const biomasDisponiveis = useMemo(() => {
    if (!estado) return biomas;
    const biomasIds = estadoBiomasMap[estado] || [];
    return biomas.filter(b => biomasIds.includes(b.id));
  }, [estado]);

  return (
    <FiltroContainer>
      <FiltrosContainer>
        <Label>Tipo</Label>
        <Select value={tipo} onChange={(e) => setTipo(e.target.value)}>
          <option value="">Selecione um tipo</option>
          <option value="risco">Risco de Fogo</option>
          <option value="foco_calor">Foco de Calor</option>
          <option value="area_queimada">Área Queimada</option>
        </Select>

        <Label>Estado</Label>
        <Select value={estado} onChange={(e) => { setEstado(e.target.value); setBioma(''); }}>
          <option value="">Todos os Estados</option>
          {estados.map((e) => (
            <option key={e.id} value={e.id}>{e.nome}</option>
          ))}
        </Select>

        <Label>Bioma</Label>
        <Select value={bioma} onChange={(e) => setBioma(e.target.value)}>
          <option value="">Todos os Biomas</option>
          {biomasDisponiveis.map((b) => (
            <option key={b.id} value={b.id}>{b.nome}</option>
          ))}
        </Select>

        <Datas>
          <Label>Datas:</Label>
          <InputGroup>
            <InputContainer>
              <Label>Início</Label>
              <Input type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} />
            </InputContainer>
            <InputContainer>
              <Label>Fim</Label>
              <Input type="date" value={fim} onChange={(e) => setFim(e.target.value)} />
            </InputContainer>
          </InputGroup>
        </Datas>

        <ButtonGroup>
          <AplicarButton onClick={aplicar}>Aplicar</AplicarButton>
          <LimparButton onClick={limpar}>Limpar</LimparButton>
        </ButtonGroup>
      </FiltrosContainer>
    </FiltroContainer>
  );
};

export default FiltroGrafico;
