import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from '../../../src/modules/tasks/controller';
import { TasksService } from '../../../src/modules/tasks/service';
import { CreateTaskDto, UpdateTaskDto } from '../../../src/modules/tasks/dto';
import { FetchAllResponse } from '../../../src/modules/common/dto';
import { NotFoundException } from '@nestjs/common';
import { TaskStatus } from '../../../src/modules/tasks/schema';

const mockTask = {
    _id: 'someTaskId',
    title: 'Task 1',
    description: 'Task 1 description',
    status: TaskStatus.OPEN,
    dueDate: new Date(),
};

const createTaskDto: CreateTaskDto = {
    title: mockTask.title,
    description: mockTask.description,
    status: mockTask.status,
};

const updateTaskDto: UpdateTaskDto = {
    title: 'Call Jane Doe'
};

const mockUpdatedTask = {
    _id: 'someTaskId',
    title: updateTaskDto.title,
    description: 'Call Jane Doe description',
    status: TaskStatus.OPEN,
    dueDate: new Date(),
};

describe('TasksController', () => {
    let controller: TasksController;
    let service: TasksService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [TasksController],
            providers: [
                {
                    provide: TasksService,
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

        controller = module.get<TasksController>(TasksController);
        service = module.get<TasksService>(TasksService);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('should create a new task', async () => {
            jest.spyOn(service, 'create').mockResolvedValue(mockTask);

            const result = await controller.create(createTaskDto);
            expect(result).toEqual(mockTask);
        });
    });

    describe('findOne', () => {
        it('should return a task', async () => {
            jest.spyOn(service, 'findOne').mockResolvedValue(mockTask);

            const result = await controller.findOne('someTaskId');
            expect(result).toEqual(mockTask);
        });

        it('should throw an error if task not found', async () => {
            jest.spyOn(service, 'findOne').mockRejectedValueOnce(new NotFoundException('Task not found'));

            await expect(controller.findOne('invalidTaskId')).rejects.toThrow(NotFoundException);
            expect(service.findOne).toHaveBeenCalledWith('invalidTaskId');
        });
    });

    describe('findAll', () => {
        it('should return all tasks', async () => {
            const query = { page: 1, limit: 10 } as any;
            const response: FetchAllResponse = {
                data: [mockTask],
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
        it('should update task', async () => {
            jest.spyOn(service, 'update').mockResolvedValue(mockUpdatedTask);

            const result = await controller.update('12345', updateTaskDto);
            expect(result).toEqual(mockUpdatedTask);
        });

        it('should throw an error if task email already exists', async () => {
            jest.spyOn(service, 'update').mockRejectedValueOnce(new Error('Email already exists'));

            await expect(controller.update('12345', updateTaskDto)).rejects.toThrow();
            expect(service.update).toHaveBeenCalledWith('12345', updateTaskDto);
        });

        it('should throw an error if task not found', async () => {
            jest.spyOn(service, 'update').mockRejectedValueOnce(new NotFoundException('Task not found'));

            await expect(controller.update('invalidtaskId', updateTaskDto)).rejects.toThrow(NotFoundException);
            expect(service.update).toHaveBeenCalledWith('invalidtaskId', updateTaskDto);
        });
    });

    describe('remove', () => {
        it('should remove an task', async () => {
            jest.spyOn(service, 'remove').mockResolvedValue(mockTask);

            const result = await controller.remove('sometaskId');
            expect(result).toEqual(mockTask);
        });

        it('should throw an error if task not found', async () => {
            jest.spyOn(service, 'remove').mockRejectedValueOnce(new NotFoundException('Task not found'));

            await expect(controller.remove('invalidtaskId')).rejects.toThrow(NotFoundException);
            expect(service.remove).toHaveBeenCalledWith('invalidtaskId');
        });

    });
});
