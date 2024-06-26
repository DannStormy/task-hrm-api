import { Test, TestingModule } from '@nestjs/testing';
import { EmployeesController } from '../../../src/modules/employees/controller';
import { EmployeesService } from '../../../src/modules/employees/service';
import { CreateEmployeeDto, UpdateEmployeeDto } from '../../../src/modules/employees/dto';
import { FetchAllResponse } from '../../../src/modules/common/dto';
import { NotFoundException } from '@nestjs/common';

const mockEmployee = {
    _id: 'someEmployeeId',
    name: 'John Doe',
    email: 'john.doe@example.com',
    position: 'Developer',
    department: 'IT',
    salary: 1000,
    hireDate: new Date(),
};

const createEmployeeDto: CreateEmployeeDto = {
    name: mockEmployee.name,
    email: mockEmployee.email,
    position: mockEmployee.position,
    department: mockEmployee.department,
    salary: mockEmployee.salary,
    hireDate: mockEmployee.hireDate,
};

const updateEmployeeDto: UpdateEmployeeDto = {
    name: 'Jane Doe',
};

const mockUpdatedEmployee = {
    ...mockEmployee,
    ...updateEmployeeDto,
};

describe('EmployeesController', () => {
    let controller: EmployeesController;
    let service: EmployeesService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [EmployeesController],
            providers: [
                {
                    provide: EmployeesService,
                    useValue: {
                        create: jest.fn(),
                        findOne: jest.fn(),
                        findAll: jest.fn(),
                        update: jest.fn(),
                        remove: jest.fn(),
                    },
                },
            ],
        }).compile();

        controller = module.get<EmployeesController>(EmployeesController);
        service = module.get<EmployeesService>(EmployeesService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should throw an error if employee already exists', async () => {
            jest.spyOn(service, 'create').mockRejectedValueOnce(new Error('Employee already exists'));

            await expect(controller.create(createEmployeeDto)).rejects.toThrow();
            expect(service.create).toHaveBeenCalledWith(createEmployeeDto);
        })

        it('should create a new employee', async () => {
            jest.spyOn(service, 'create').mockResolvedValue(mockEmployee);

            const result = await controller.create(createEmployeeDto);
            expect(result).toEqual(mockEmployee);
        });
    });

    describe('findOne', () => {
        it('should return an employee', async () => {
            jest.spyOn(service, 'findOne').mockResolvedValue(mockEmployee);

            const result = await controller.findOne('someEmployeeId');
            expect(result).toEqual(mockEmployee);
        });

        it('should throw an error if employee not found', async () => {
            jest.spyOn(service, 'findOne').mockRejectedValueOnce(new NotFoundException('Employee not found'));

            await expect(controller.findOne('invalidEmployeeId')).rejects.toThrow(NotFoundException);
            expect(service.findOne).toHaveBeenCalledWith('invalidEmployeeId');
        });
    });

    describe('findAll', () => {
        it('should return all employees', async () => {
            const query = { page: 1, limit: 10 } as any;
            const response: FetchAllResponse = {
                data: [mockEmployee],
                totalCount: 1,
                totalPages: 1,
                currentPage: 1,
            };
            jest.spyOn(service, 'findAll').mockResolvedValue(response);

            const result = await controller.findAll(query);
            expect(result).toEqual(response);
        });
    });

    describe('update', () => {
        it('should update employee', async () => {
            jest.spyOn(service, 'update').mockResolvedValue(mockUpdatedEmployee);

            const result = await controller.update('12345', updateEmployeeDto);
            expect(result).toEqual(mockUpdatedEmployee);
        });

        it('should throw an error if employee email already exists', async () => {
            jest.spyOn(service, 'update').mockRejectedValueOnce(new Error('Email already exists'));

            await expect(controller.update('12345', updateEmployeeDto)).rejects.toThrow();
            expect(service.update).toHaveBeenCalledWith('12345', updateEmployeeDto);
        });

        it('should throw an error if employee not found', async () => {
            jest.spyOn(service, 'update').mockRejectedValueOnce(new NotFoundException('Employee not found'));

            await expect(controller.update('invalidEmployeeId', updateEmployeeDto)).rejects.toThrow(NotFoundException);
            expect(service.update).toHaveBeenCalledWith('invalidEmployeeId', updateEmployeeDto);
        });
    });

    describe('remove', () => {
        it('should remove an employee', async () => {
            jest.spyOn(service, 'remove').mockResolvedValue(mockEmployee);

            const result = await controller.remove('someEmployeeId');
            expect(result).toEqual(mockEmployee);
        });

        it('should throw an error if employee not found', async () => {
            jest.spyOn(service, 'remove').mockRejectedValueOnce(new NotFoundException('Employee not found'));

            await expect(controller.remove('invalidEmployeeId')).rejects.toThrow(NotFoundException);
            expect(service.remove).toHaveBeenCalledWith('invalidEmployeeId');
        });

    });
});
