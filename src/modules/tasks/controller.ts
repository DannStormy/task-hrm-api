import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { TasksService } from './service';
import { Task } from './schema';
import { CreateTaskDto, UpdateTaskDto } from './dto';
import { Query as ExpressQuery } from 'express-serve-static-core';
import { FetchAllResponse } from '../common/dto';

@Controller('tasks')
export class TasksController {
    constructor(private readonly tasksService: TasksService) { }

    @Post()
    async create(@Body() task: CreateTaskDto): Promise<Task> {
        return this.tasksService.create(task);
    }

    @Get()
    async findAll(@Query() query: ExpressQuery): Promise<FetchAllResponse> {
        return this.tasksService.findAll(query);
    }

    @Get(':taskId')
    async findOne(@Param('taskId') taskId: string): Promise<Task> {
        return this.tasksService.findOne(taskId);
    }

    @Patch(':taskId')
    async update(@Param('taskId') taskId: string, @Body() updateTaskDto: UpdateTaskDto): Promise<Task> {
        return this.tasksService.update(taskId, updateTaskDto);
    }

    @Delete(':taskId')
    async remove(@Param('taskId') taskId: string): Promise<Task> {
        return this.tasksService.remove(taskId);
    }
}
