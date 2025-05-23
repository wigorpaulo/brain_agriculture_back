import { Test, TestingModule } from '@nestjs/testing';
import { StatesService } from './states.service';
import { State } from './entities/state.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StateValidationService } from '../common/services/state-validation.service';
import { CreateStateDto } from './dto/create-state.dto';
import { UpdateStateDto } from './dto/update-state.dto';
import { mockRepositoryService, mockState } from '../../test/mocks/state.mock';

describe('StatesService', () => {
  let service: StatesService;
  let repo: jest.Mocked<Repository<State>>;
  let validationService: jest.Mocked<StateValidationService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatesService,
        {
          provide: getRepositoryToken(State),
          useValue: mockRepositoryService,
        },
        {
          provide: StateValidationService,
          useValue: {
            validateNameUnique: jest.fn(),
            validate: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<StatesService>(StatesService);
    repo = module.get(getRepositoryToken(State));
    validationService = module.get(StateValidationService);
  });

  describe('create', () => {
    it('should create a state', async () => {
      const dto: CreateStateDto = { name: 'São Paulo', uf: 'SP' };

      validationService.validateNameUnique.mockResolvedValue(undefined);
      repo.create.mockReturnValue(mockState);
      repo.save.mockResolvedValue(mockState);

      const result = await service.create(dto);

      expect(validationService.validateNameUnique).toHaveBeenCalledWith(dto.name);
      expect(repo.create).toHaveBeenCalledWith(expect.objectContaining(dto));
      expect(repo.save).toHaveBeenCalledWith(mockState);
      expect(result).toEqual(mockState);
    });
  });

  describe('findAll', () => {
    it('should return all states', async () => {
      repo.find.mockResolvedValue([mockState]);

      const result = await service.findAll();

      expect(result).toEqual([mockState]);
    });
  });

  describe('findOne', () => {
    it('should return a state by ID', async () => {
      repo.findOne.mockResolvedValue(mockState);

      const result = await service.findOne(1);

      expect(repo.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(mockState);
    });
  });

  describe('update', () => {
    it('should update a state with new name', async () => {
      const dto: UpdateStateDto = { name: 'Minas Gerais' };

      validationService.validateNameUnique.mockResolvedValue(undefined);
      validationService.validate.mockResolvedValue(mockState);
      repo.merge.mockReturnValue({ ...mockState, name: 'Minas Gerais' });
      repo.save.mockResolvedValue({ ...mockState, name: 'Minas Gerais' });

      const result = await service.update(1, dto);

      expect(validationService.validateNameUnique).toHaveBeenCalledWith(dto.name);
      expect(validationService.validate).toHaveBeenCalledWith(1);
      expect(repo.merge).toHaveBeenCalled();
      expect(repo.save).toHaveBeenCalled();
      expect(result.name).toBe('Minas Gerais');
    });

    it('should update a state without name (skip validation)', async () => {
      const dto: UpdateStateDto = { uf: 'MG' };

      validationService.validate.mockResolvedValue(mockState);
      repo.merge.mockReturnValue({ ...mockState, uf: 'MG' });
      repo.save.mockResolvedValue({ ...mockState, uf: 'MG' });

      const result = await service.update(1, dto);

      expect(validationService.validateNameUnique).not.toHaveBeenCalled();
      expect(result.uf).toBe('MG');
    });
  });

  describe('remove', () => {
    it('should remove a state', async () => {
      validationService.validate.mockResolvedValue(mockState);
      repo.remove.mockResolvedValue(mockState);

      await service.remove(1);

      expect(validationService.validate).toHaveBeenCalledWith(1);
      expect(repo.remove).toHaveBeenCalledWith(mockState);
    });
  });
});
