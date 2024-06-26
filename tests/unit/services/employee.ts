import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EmployeesService } from '../../../src/modules/employees/service';
import { Employee, EmployeeDocument } from '../../../src/modules/employees/schema';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CreateEmployeeDto, UpdateEmployeeDto } from '../../../src/modules/employees/dto';
import { CustomLoggerService } from '../../../src/modules/common/utils/logger';

describe('EmployeesService', () => {
    let service: EmployeesService;
    let employeeModel: Model<EmployeeDocument>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EmployeesService,
                CustomLoggerService,
                {
                    provide: getModelToken(Employee.name),
                    useValue: {
                        findOne: jest.fn(),
                        findById: jest.fn(),
                        findByIdAndUpdate: jest.fn(),
                        findOneAndDelete: jest.fn(),
                        create: jest.fn(),
                        countDocuments: jest.fn(),
                        find: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<EmployeesService>(EmployeesService);
        employeeModel = module.get<Model<EmployeeDocument>>(getModelToken(Employee.name));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create a new employee', async () => {
            const createEmployeeDto: CreateEmployeeDto = {
                name: 'John Doe',
                email: 'john.doe@example.com',
                position: 'Developer',
                department: 'IT',
                salary: 1000,
                hireDate: new Date(),
            };

            jest.spyOn(employeeModel, 'findOne').mockResolvedValueOnce(null);
            jest.spyOn(employeeModel, 'create').mockResolvedValueOnce(createEmployeeDto as any);

            const result = await service.create(createEmployeeDto);

            expect(result).toEqual(createEmployeeDto);
            expect(employeeModel.findOne).toHaveBeenCalledWith({ email: createEmployeeDto.email });
            expect(employeeModel.create).toHaveBeenCalledWith(createEmployeeDto);
        });

        it('should throw ConflictException if email already exists', async () => {
            const createEmployeeDto: CreateEmployeeDto = {
                name: 'John Doe',
                email: 'john.doe@example.com',
                position: 'Developer',
                department: 'IT',
                salary: 1000,
                hireDate: new Date(),
            };

            jest.spyOn(employeeModel, 'findOne').mockResolvedValueOnce(createEmployeeDto as any);

            await expect(service.create(createEmployeeDto)).rejects.toThrow(ConflictException);
        });
    });

    describe('findAll', () => {
        it('should find all employees with pagination', async () => {
            const query = { page: '1', limit: '10' };

            (employeeModel.countDocuments as jest.Mock).mockResolvedValueOnce(1);

            (employeeModel.find as jest.Mock).mockReturnValueOnce({
                limit: jest.fn().mockReturnThis(),
                skip: jest.fn().mockReturnThis(),
                exec: jest.fn().mockResolvedValueOnce([]),
            });

            const result = await service.findAll(query);

            expect(result).toEqual({
                data: [],
                totalCount: 1,
                totalPages: 1,
                currentPage: 1,
            });

            expect(employeeModel.countDocuments).toHaveBeenCalledWith();
            expect(employeeModel.find).toHaveBeenCalledWith();
        });
    });


    describe('findOne', () => {
        it('should find an employee by id', async () => {
            const employeeId = 'employeeId';

            jest.spyOn(employeeModel, 'findById').mockReturnValue({
                exec: jest.fn().mockResolvedValueOnce({ 
                    _id: employeeId,
                    name: 'Jenkins',
                    email: 'john.doe@example.com',
                    position: 'Developer',
                    department: 'IT',
                    salary: 1000,
                    hireDate: 'new Date()',
                }),
            } as any);

            const result = await service.findOne(employeeId);

            expect(result).toEqual({ 
                _id: employeeId,
                name: 'Jenkins',
                email: 'john.doe@example.com',
                position: 'Developer',
                department: 'IT',
                salary: 1000,
                hireDate: 'new Date()',
            });
            expect(employeeModel.findById).toHaveBeenCalledWith(employeeId);
        });

        it('should throw an error if employee not found', async () => {
            const employeeId = 'employeeId';
            
            jest.spyOn(employeeModel, 'findById').mockReturnValue({
                exec: jest.fn().mockResolvedValueOnce(null),
            } as any);

            await expect(service.findOne(employeeId)).rejects.toThrow(NotFoundException);

            expect(employeeModel.findById).toHaveBeenCalledWith(employeeId);
        });
    });

    describe('update', () => {
        it('should update employee', async () => {
            const employeeId = 'employeeId';
            const updateEmployeeDto: UpdateEmployeeDto = { name: 'Jenkins' };

            jest.spyOn(employeeModel, 'findByIdAndUpdate').mockReturnValue({
                exec: jest.fn().mockResolvedValueOnce({ _id: employeeId, ...updateEmployeeDto }),
            } as any);

            const result = await service.update(employeeId, updateEmployeeDto);

            expect(result).toEqual({ _id: employeeId, ...updateEmployeeDto });
            expect(employeeModel.findByIdAndUpdate).toHaveBeenCalledWith(
                employeeId,
                { name: updateEmployeeDto.name },
                { new: true },
            );
        });

        it('should throw an error if employee not found', async () => {
            const employeeId = 'employeeId';
            const updateEmployeeDto: UpdateEmployeeDto = { name: 'Jenkins' };

            jest.spyOn(employeeModel, 'findByIdAndUpdate').mockReturnValue({
                exec: jest.fn().mockResolvedValueOnce(null),
            } as any);

            await expect(service.update(employeeId, updateEmployeeDto)).rejects.toThrow(NotFoundException);
        });
    });


    describe('remove', () => {
        it('should remove an employee', async () => {
            const employeeId = 'employeeId';

            jest.spyOn(employeeModel, 'findOneAndDelete').mockReturnValue({
                exec: jest.fn().mockResolvedValueOnce({ _id: employeeId }),
            } as any);

            const result = await service.remove(employeeId);

            expect(result).toEqual({ _id: employeeId });
            expect(employeeModel.findOneAndDelete).toHaveBeenCalledWith({ _id: employeeId });
        });

        it('should throw an error if employee not found', async () => {
            const employeeId = 'employeeId';

            jest.spyOn(employeeModel, 'findOneAndDelete').mockReturnValue({
                exec: jest.fn().mockResolvedValueOnce(null),
            } as any);

            await expect(service.remove(employeeId)).rejects.toThrow(NotFoundException);
        });
    });
});