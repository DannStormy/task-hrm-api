import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsController } from '../../../src/modules/payments/controller';
import { PaymentsService } from '../../../src/modules/payments/service';
import { CreatePaymentDto, UpdateStatusDto } from '../../../src/modules/payments/dto';
import { PaymentStatus } from '../../../src/modules/payments/schema';
import { FetchAllResponse } from '../../../src/modules/common/dto';
import { NotFoundException } from '@nestjs/common';

const mockPayment = {
  _id: 'somePaymentId',
  employeeId: 'someEmployeeId' as any,
  amount: 1000,
  status: PaymentStatus.PENDING,
  date: new Date(),
};

const createPaymentDto: CreatePaymentDto = {
  employeeId: mockPayment.employeeId as any,
  amount: mockPayment.amount,
  status: mockPayment.status,
  date: mockPayment.date,
};

const updateStatusDto: UpdateStatusDto = {
  status: PaymentStatus.COMPLETED,
};

describe('PaymentsController', () => {
  let controller: PaymentsController;
  let service: PaymentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsController],
      providers: [
        {
          provide: PaymentsService,
          useValue: {
            create: jest.fn(),
            findByEmployee: jest.fn(),
            updateStatus: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PaymentsController>(PaymentsController);
    service = module.get<PaymentsService>(PaymentsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {

    it('should create a new payment', async () => {
      jest.spyOn(service, 'create').mockResolvedValue(mockPayment);

      const result = await controller.create(createPaymentDto);
      expect(result).toEqual(mockPayment);
    });

    it('should throw NotFoundException if employee not found', async () => {
      const createPaymentDto: CreatePaymentDto = {
        employeeId: 'invalidEmployeeId' as any,
        amount: 100,
        status: PaymentStatus.PENDING,
        date: new Date().toISOString() as any,
      };

      jest.spyOn(service, 'create').mockRejectedValueOnce(new NotFoundException('Employee not found'));

      await expect(controller.create(createPaymentDto)).rejects.toThrow(NotFoundException);
      expect(service.create).toHaveBeenCalledWith(createPaymentDto);
    });

  });

  describe('findByEmployee', () => {
    it('should return payments for a given employee', async () => {
      const query = { page: 1, limit: 10 } as any;
      const response: FetchAllResponse = {
        data: [mockPayment],
        totalCount: 1,
        totalPages: 1,
        currentPage: 1,
      };
      jest.spyOn(service, 'findByEmployee').mockResolvedValue(response);

      const result = await controller.findByEmployee('someEmployeeId', query);
      expect(result).toEqual(response);
    });
  });

  describe('updateStatus', () => {
    it('should update payment status', async () => {
      jest.spyOn(service, 'updateStatus').mockResolvedValue({ ...mockPayment, status: PaymentStatus.COMPLETED });

      const result = await controller.updateStatus('somePaymentId', updateStatusDto);
      expect(result.status).toEqual(PaymentStatus.COMPLETED);
    });
  });

  describe('remove', () => {
    it('should remove a payment', async () => {
      jest.spyOn(service, 'remove').mockResolvedValue(mockPayment);

      const result = await controller.remove('somePaymentId');
      expect(result).toEqual(mockPayment);
    });
  });
});
