import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PaymentsService } from '../../../src/modules/payments/service';
import { Payment, PaymentDocument } from '../../../src/modules/payments/schema';
import { Employee, EmployeeDocument } from '../../../src/modules/employees/schema';
import { NotFoundException } from '@nestjs/common';
import { CreatePaymentDto, UpdateStatusDto } from '../../../src/modules/payments/dto';
import { PaymentStatus } from '../../../src/modules/payments/schema';
import { CustomLoggerService } from '../../../src/modules/common/utils/logger';

describe('PaymentsService', () => {
    let service: PaymentsService;
    let paymentModel: Model<PaymentDocument>;
    let employeeModel: Model<EmployeeDocument>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PaymentsService,
                CustomLoggerService,
                {
                    provide: getModelToken(Payment.name),
                    useValue: {
                        countDocuments: jest.fn(),
                        find: jest.fn(),
                        findById: jest.fn(),
                        findByIdAndUpdate: jest.fn(),
                        findOneAndDelete: jest.fn(),
                        create: jest.fn(),
                    },
                },
                {
                    provide: getModelToken(Employee.name),
                    useValue: {
                        findById: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<PaymentsService>(PaymentsService);
        paymentModel = module.get<Model<PaymentDocument>>(getModelToken(Payment.name));
        employeeModel = module.get<Model<EmployeeDocument>>(getModelToken(Employee.name));
    });


    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create a new payment', async () => {
            const createPaymentDto: CreatePaymentDto = {
                employeeId: 'employeeId' as any,
                amount: 100,
                status: PaymentStatus.PENDING,
                date: new Date().toISOString() as any,
            };

            jest.spyOn(employeeModel, 'findById').mockReturnValue({
                exec: jest.fn().mockResolvedValueOnce({}),
            } as any);

            jest.spyOn(paymentModel, 'create').mockImplementationOnce((payment) => Promise.resolve(payment as any));

            const result = await service.create(createPaymentDto);

            expect(result).toEqual(createPaymentDto);
            expect(employeeModel.findById).toHaveBeenCalledWith('employeeId');
            expect(paymentModel.create).toHaveBeenCalledWith(createPaymentDto);
        });

        it('should throw an error if employee not found', async () => {
            const createPaymentDto: CreatePaymentDto = {
                employeeId: 'employeeId' as any,
                amount: 100,
                status: PaymentStatus.PENDING,
                date: new Date().toISOString() as any,
            };

            jest.spyOn(employeeModel, 'findById').mockReturnValue({
                exec: jest.fn().mockResolvedValueOnce(null),
            } as any);

            await expect(service.create(createPaymentDto)).rejects.toThrow(NotFoundException);
        });
    });

    describe('findByEmployee', () => {
        it('should return payments for a given employee', async () => {
            const employeeId = 'employeeId';
            const query = { page: '1', limit: '10' };

            (paymentModel.countDocuments as jest.Mock).mockResolvedValueOnce(1);

            (paymentModel.find as jest.Mock).mockReturnValueOnce({
                limit: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValueOnce([]),
            });

            const result = await service.findByEmployee(employeeId, query);

            expect(result).toEqual({
                data: [],
                totalCount: 1,
                totalPages: 1,
                currentPage: 1,
            });

            expect(paymentModel.countDocuments).toHaveBeenCalledWith({ employeeId });
            expect(paymentModel.find).toHaveBeenCalledWith({ employeeId });
        });
    });

    describe('updateStatus', () => {
        it('should update payment status', async () => {
            const paymentId = 'paymentId';
            const updateStatusDto: UpdateStatusDto = { status: PaymentStatus.COMPLETED };

            jest.spyOn(paymentModel, 'findByIdAndUpdate').mockReturnValue({
                exec: jest.fn().mockResolvedValueOnce({ _id: paymentId, ...updateStatusDto }),
            } as any);

            const result = await service.updateStatus(paymentId, updateStatusDto);

            expect(result).toEqual({ _id: paymentId, ...updateStatusDto });
            expect(paymentModel.findByIdAndUpdate).toHaveBeenCalledWith(
                paymentId,
                { status: updateStatusDto.status },
                { new: true },
            );
        });

        it('should throw an error if payment not found', async () => {
            const paymentId = 'paymentId';
            const updateStatusDto: UpdateStatusDto = { status: PaymentStatus.COMPLETED };

            jest.spyOn(paymentModel, 'findByIdAndUpdate').mockReturnValue({
                exec: jest.fn().mockResolvedValueOnce(null),
            } as any);

            await expect(service.updateStatus(paymentId, updateStatusDto)).rejects.toThrow(NotFoundException);
        });
    });

    describe('remove', () => {
        it('should remove a payment', async () => {
            const paymentId = 'paymentId';

            jest.spyOn(paymentModel, 'findOneAndDelete').mockReturnValue({
                exec: jest.fn().mockResolvedValueOnce({ _id: paymentId }),
            } as any);

            const result = await service.remove(paymentId);

            expect(result).toEqual({ _id: paymentId });
            expect(paymentModel.findOneAndDelete).toHaveBeenCalledWith({ _id: paymentId });
        });

        it('should throw an error if payment not found', async () => {
            const paymentId = 'paymentId';

            jest.spyOn(paymentModel, 'findOneAndDelete').mockReturnValue({
                exec: jest.fn().mockResolvedValueOnce(null),
            } as any);

            await expect(service.remove(paymentId)).rejects.toThrow(NotFoundException);
        });
    });
});
