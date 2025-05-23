import { mockUser } from './user.mock';
import { Producer } from '../../src/producers/entities/producer.entity';
import { CreateProducerDto } from '../../src/producers/dto/create-producer.dto';
import { mockCity } from './city.mock';
import { UpdateProducerDto } from '../../src/producers/dto/update-producer.dto';

export const mockProducer = {
  id: 1,
  name: 'João da Silva',
  cpf_cnpj: '80780550056',
  created_by: mockUser,
} as Producer;

export const mockProducerArray = [
  mockProducer,
  {
    ...mockProducer,
    id: 2,
    name: 'Maria Oliveira',
  },
];

export const mockCreateProducerDto: CreateProducerDto = {
  name: 'Carlos Pereira',
  cpf_cnpj: '11122233344',
  city_id: mockCity.id,
};

export const mockUpdateProducerDto: UpdateProducerDto = {
  name: 'Carlos Pereira Atualizado',
};
