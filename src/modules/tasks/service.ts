import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task, TaskDocument } from './schema';
import * as dto from './dto';
import { Query } from 'express-serve-static-core';
import { FetchAllResponse } from '../common/dto';
import { CustomLoggerService } from '../common/utils/logger';

@Injectable()
export class TasksService {
    constructor(
        @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
        private readonly logger: CustomLoggerService
    ) {
        this.logger.setContext('TasksService');
    }

    async create(task: dto.CreateTaskDto): Promise<Task> {
        this.logger.log(`Creating task: ${task.title}`);
        return await this.taskModel.create(task);
    }

    async findAll(query: Query): Promise<FetchAllResponse> {
        this.logger.log(`Fetching tasks`);
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;

        const filter: any = {};

        if (query.status) {
            filter['status'] = query.status;
        }

        const [totalCount, tasks] = await Promise.all([
            this.taskModel.countDocuments(filter),
            this.taskModel.find(filter).limit(limit).skip(skip).exec(),
        ]);

        const totalPages = Math.ceil(totalCount / limit);

        return {
            data: tasks,
            totalCount,
            totalPages,
            currentPage: page,
        };
    }

    async findOne(id: string): Promise<Task> {
        this.logger.log(`Fetching task: ${id}`);
        const task = await this.taskModel.findById(id).exec();
        if (!task) {
            this.logger.warn(`Task not found: ${id}`);
            throw new NotFoundException('Task not found');
        }
        return task;
    }

    async update(id: string, updateTaskDto: dto.UpdateTaskDto): Promise<Task> {
        this.logger.log(`Updating task: ${id}`);
        const existingTask = await this.taskModel
            .findByIdAndUpdate(id, updateTaskDto, { new: true })
            .exec();

        if (!existingTask) {
            this.logger.warn(`Task not found: ${id}`);
            throw new NotFoundException('Task not found');
        }

        return existingTask;
    }

    async remove(id: string): Promise<Task> {
        this.logger.log(`Removing task: ${id}`);
        const deletedTask = await this.taskModel.findOneAndDelete({ _id: id }).exec();
        if (!deletedTask) {
            this.logger.warn(`Task not found: ${id}`);
            throw new NotFoundException('Task not found');
        }
        return deletedTask;
    }
}
