import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TasksService } from '../../../src/modules/tasks/service';
import { Task, TaskDocument, TaskStatus } from '../../../src/modules/tasks/schema';
import { NotFoundException } from '@nestjs/common';
import { CreateTaskDto, UpdateTaskDto } from '../../../src/modules/tasks/dto';
import { CustomLoggerService } from '../../../src/modules/common/utils/logger';

describe('TasksService', () => {
    let service: TasksService;
    let taskModel: Model<TaskDocument>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TasksService,
                CustomLoggerService,
                {
                    provide: getModelToken(Task.name),
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

        service = module.get<TasksService>(TasksService);
        taskModel = module.get<Model<TaskDocument>>(getModelToken(Task.name));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create a new employee', async () => {
            const createTaskDto: CreateTaskDto = {
                title: 'Task 1',
                description: 'Task 1 description',
                status: TaskStatus.OPEN,
            };

            jest.spyOn(taskModel, 'create').mockResolvedValueOnce(createTaskDto as any);

            const result = await service.create(createTaskDto);

            expect(result).toEqual(createTaskDto);
            expect(taskModel.create).toHaveBeenCalledWith(createTaskDto);
        });
    });

    describe('findAll', () => {
        it('should find all tasks with pagination', async () => {
            const taskId = 'taskId';
            const query = { page: '1', limit: '10' };

            (taskModel.countDocuments as jest.Mock).mockResolvedValueOnce(1);

            (taskModel.find as jest.Mock).mockReturnValueOnce({
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

            expect(taskModel.countDocuments).toHaveBeenCalledWith({});
            expect(taskModel.find).toHaveBeenCalledWith({});
        });
    });


    describe('findOne', () => {
        it('should find a task by id', async () => {
            const taskId = 'taskId';

            jest.spyOn(taskModel, 'findById').mockReturnValue({
                exec: jest.fn().mockResolvedValueOnce({
                    _id: taskId,
                    title: 'Task 1',
                    description: 'Task 1 description',
                    status: TaskStatus.OPEN,
                }),
            } as any);

            const result = await service.findOne(taskId);

            expect(result).toEqual({
                _id: taskId,
                title: 'Task 1',
                description: 'Task 1 description',
                status: TaskStatus.OPEN,
            });
            expect(taskModel.findById).toHaveBeenCalledWith(taskId);
        });

        it('should throw an error if task not found', async () => {
            const taskId = 'taskId';

            jest.spyOn(taskModel, 'findById').mockReturnValue({
                exec: jest.fn().mockResolvedValueOnce(null),
            } as any);

            await expect(service.findOne(taskId)).rejects.toThrow(NotFoundException);

            expect(taskModel.findById).toHaveBeenCalledWith(taskId);
        });
    });

    describe('update', () => {
        it('should update task', async () => {
            const taskId = 'taskId';
            const updateTaskDto: UpdateTaskDto = { title: 'Call Jane Doe' };

            jest.spyOn(taskModel, 'findByIdAndUpdate').mockReturnValue({
                exec: jest.fn().mockResolvedValueOnce({ _id: taskId, ...updateTaskDto }),
            } as any);

            const result = await service.update(taskId, updateTaskDto);

            expect(result).toEqual({ _id: taskId, ...updateTaskDto });
            expect(taskModel.findByIdAndUpdate).toHaveBeenCalledWith(
                taskId,
                { title: updateTaskDto.title },
                { new: true },
            );
        });

        it('should throw an error if task not found', async () => {
            const taskId = 'taskId';
            const updateTaskDto: UpdateTaskDto = { title: 'Call Jane Doe' };

            jest.spyOn(taskModel, 'findByIdAndUpdate').mockReturnValue({
                exec: jest.fn().mockResolvedValueOnce(null),
            } as any);

            await expect(service.update(taskId, updateTaskDto)).rejects.toThrow(NotFoundException);
        });
    });


    describe('remove', () => {
        it('should remove a task', async () => {
            const taskId = 'taskId';

            jest.spyOn(taskModel, 'findOneAndDelete').mockReturnValue({
                exec: jest.fn().mockResolvedValueOnce({ _id: taskId }),
            } as any);

            const result = await service.remove(taskId);

            expect(result).toEqual({ _id: taskId });
            expect(taskModel.findOneAndDelete).toHaveBeenCalledWith({ _id: taskId });
        });

        it('should throw an error if task not found', async () => {
            const taskId = 'taskId';

            jest.spyOn(taskModel, 'findOneAndDelete').mockReturnValue({
                exec: jest.fn().mockResolvedValueOnce(null),
            } as any);

            await expect(service.remove(taskId)).rejects.toThrow(NotFoundException);
        });
    });
});