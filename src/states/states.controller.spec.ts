import { Test, TestingModule } from '@nestjs/testing';
import { StatesController } from './states.controller';
import { StatesService } from './states.service';
import { CreateStateDto } from './dto/create-state.dto';
import { UpdateStateDto } from './dto/update-state.dto';
import { mockState, mockStatesService } from '../../test/mocks/state.mock';

describe('StatesController', () => {
  let controller: StatesController;
  let service: StatesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StatesController],
      providers: [
        {
          provide: StatesService,
          useValue: mockStatesService,
        },
      ],
    }).compile();

    controller = module.get<StatesController>(StatesController);
    service = module.get<StatesService>(StatesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a state', async () => {
      const dto: CreateStateDto = { name: 'São Paulo', uf: 'SP' };
      const result = await controller.create(dto);
      expect(result).toEqual(mockState);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return all states', async () => {
      const result = await controller.findAll();
      expect(result).toEqual([mockState]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single state', async () => {
      const result = await controller.findOne('1');
      expect(result).toEqual(mockState);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update a state', async () => {
      const dto: UpdateStateDto = { name: 'Rio de Janeiro' };
      const result = await controller.update('1', dto);
      expect(result).toEqual({ ...mockState, name: 'Rio de Janeiro' });
      expect(service.update).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('remove', () => {
    it('should delete a state', async () => {
      const result = await controller.remove('1');
      expect(result).toBeUndefined();
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
