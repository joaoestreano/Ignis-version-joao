import React, { useState } from 'react';
import styled from 'styled-components';

interface FiltroGraficoProps {
  onAplicar: (filtros: {
    tipo: string;
    local: string;
    inicio: string;
    fim: string;
    estado: string;
    bioma: string;
  }) => void;
}

const estados = [
  { id: '11', nome: 'Rondônia' }, { id: '12', nome: 'Acre' }, { id: '13', nome: 'Amazonas' },
  { id: '14', nome: 'Roraima' }, { id: '15', nome: 'Pará' }, { id: '16', nome: 'Amapá' },
  { id: '17', nome: 'Tocantins' }, { id: '29', nome: 'Bahia' }, { id: '27', nome: 'Alagoas'},
  { id: '23', nome: 'Ceará'}, { id: '32', nome: 'Espirito Santo'}, { id: '52', nome: 'Goiás'},
  { id: '21', nome: 'Maranhão'}, { id: '51', nome:'Mato Grosso'}, { id: '50', nome: 'Mato Grosso do Sul'},
  { id: '31', nome:'Minas Gerais'}, { id: '25', nome:'Paraíba'}, { id: '41', nome:'Paraná'},
  { id: '26', nome:'Pernambuco'}, { id: '22', nome: 'Piauí'}, { id: '33', nome: 'Rio de Janeiro'},
  { id: '24', nome: 'Rio Grande do Norte'}, { id: '43', nome: 'Rio Grande do Sul'},
  { id: '42', nome: 'Santa Catarina'}, { id: '35', nome: 'São Paulo'}, { id: '28', nome: 'Sergipe'},
  { id: '53', nome: 'Distrito Federal'},
];

const biomas = [
  { id: '1', nome: 'Amazônia' },
  { id: '2', nome: 'Cerrado' },
  { id: '3', nome: 'Caatinga' },
  { id: '4', nome: 'Mata Atlântica' },
  { id: '5', nome: 'Pampa' },
  { id: '6', nome: 'Pantanal' },
];

const FiltroGrafico: React.FC<FiltroGraficoProps> = ({ onAplicar }) => {
  const [index1, setIndex1] = useState(0);
  const [index2, setIndex2] = useState(0);
  const [estado, setEstado] = useState('');
  const [bioma, setBioma] = useState('');
  const [inicio, setInicio] = useState('2025-03-20');
  const [fim, setFim] = useState('2025-05-09');

  const tipos = ['Focos', 'Área de Queimadas', 'Riscos de Fogo'];
  const locais = ['Estados', 'Biomas'];

  const aplicarFiltro = () => {
    onAplicar({
      tipo: tipos[index1],
      local: locais[index2],
      inicio,
      fim,
      estado,
      bioma,
    });
  };

  return (
    <FiltroContainer>
      <Filtros>
        <ToggleLabels1>
          {tipos.map((t, i) => (
            <span key={i}>{t}</span>
          ))}
        </ToggleLabels1>
        <SliderContainer onClick={() => setIndex1((index1 + 1) % tipos.length)}>
          <Slider1>
            <SliderThumb1 style={{ transform: `translateX(${index1 * 115}px)` }} />
          </Slider1>
        </SliderContainer>

        <ToggleLabels2>
          {locais.map((l, i) => (
            <span key={i}>{l}</span>
          ))}
        </ToggleLabels2>
        <SliderContainer onClick={() => setIndex2((index2 + 1) % locais.length)}>
          <Slider2>
            <SliderThumb2 style={{ transform: `translateX(${index2 * 75}px)` }} />
          </Slider2>
        </SliderContainer>

        <Label>Estados:</Label>
        <select value={estado} onChange={(e) => setEstado(e.target.value)}>
          <option value="">Todos</option>
          {estados.map((e) => (
            <option key={e.id} value={e.id}>{e.nome}</option>
          ))}
        </select>

        <Label>Biomas:</Label>
        <select value={bioma} onChange={(e) => setBioma(e.target.value)}>
          <option value="">Todos</option>
          {biomas.map((b) => (
            <option key={b.id} value={b.id}>{b.nome}</option>
          ))}
        </select>

        <Datas>
          <Label>Datas:</Label>
          <InputGroup>
            <InputContainer>
              <Label htmlFor="inicio">Início</Label>
              <Input
                type="date"
                id="inicio"
                value={inicio}
                onChange={(e) => setInicio(e.target.value)}
              />
            </InputContainer>
            <InputContainer>
              <Label htmlFor="fim">Fim</Label>
              <Input
                type="date"
                id="fim"
                value={fim}
                onChange={(e) => setFim(e.target.value)}
              />
            </InputContainer>
          </InputGroup>
        </Datas>

        <AplicarButton onClick={aplicarFiltro}>Aplicar</AplicarButton>
      </Filtros>
    </FiltroContainer>
  );
};

export default FiltroGrafico;

// 🧱 estilos mantidos ou adaptados
const FiltroContainer = styled.div`
  font-weight: bold;
  padding: 20px;
  background-color: #d32f2f;
  height: 83vh;
  width: 350px;
  border-radius: 0px 8px 8px 8px;
  z-index: 1;
  margin-top: 2%;
  position: fixed;
  color: white;
`;

const Filtros = styled.div`
  padding: 10px 0;
`;

const ToggleLabels1 = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;

  span {
    font-size: 16px;
    color: #fff;
    font-weight: bold;
  }
`;

const ToggleLabels2 = styled.div`
  display: flex;
  justify-content: center;
  gap: 60px;

  span {
    font-size: 16px;
    color: #fff;
    font-weight: bold;
  }
`;

const SliderContainer = styled.div`
  margin: 10px 0;
`;

const Slider1 = styled.div`
  position: relative;
  width: 345px;
  height: 24px;
  background-color: #ddd;
  border-radius: 12px;
  border: 1px solid white;
  display: flex;
  align-items: center;
  padding: 2px;
  cursor: pointer;
`;

const Slider2 = styled.div`
  position: relative;
  width: 150px;
  height: 24px;
  background-color: #ddd;
  border-radius: 12px;
  border: 1px solid white;
  display: flex;
  align-items: center;
  padding: 2px;
  cursor: pointer;
  left: 50%;
  transform: translateX(-50%);
`;

const SliderThumb1 = styled.div`
  position: absolute;
  width: 100px;
  height: 20px;
  background-color: #333;
  border-radius: 10px;
  transition: transform 0.3s ease-in-out;
`;

const SliderThumb2 = styled.div`
  position: absolute;
  width: 75px;
  height: 20px;
  background-color: #333;
  border-radius: 10px;
  transition: transform 0.3s ease-in-out;
`;

const Datas = styled.div`
  margin-top: 10px;
`;

const Label = styled.label`
  font-weight: bold;
  font-size: 1rem;
  display: block;
  margin: 10px 0 5px 0;
`;

const InputGroup = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 15px;
`;

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 48%;
`;

const Input = styled.input`
  padding: 8px;
  width: 150px;
  border-radius: 4px;
  border: 1px solid #ccc;
  margin-top: 5px;
`;

const AplicarButton = styled.button`
  margin-top: 10px;
  margin-left: 250px;
  width: 100px;
  padding: 8px;
  background-color: #616161;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;

  &:hover {
    background-color: #388e3c;
  }
`;