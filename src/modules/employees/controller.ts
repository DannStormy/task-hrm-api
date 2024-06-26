import { Controller, Get, Post, Body, Patch, Param, Delete, ConflictException, Query } from '@nestjs/common';
import { EmployeesService } from './service';
import { Employee } from './schema';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto';
import { Query as ExpressQuery } from 'express-serve-static-core';
import { FetchAllResponse } from '../common/dto';


@Controller('employees')
export class EmployeesController {
    constructor(
        private readonly employeesService: EmployeesService,
    ) { }

    @Post()
    async create(@Body() employee: CreateEmployeeDto): Promise<Employee | ConflictException> {
        return this.employeesService.create(employee);
    }

    @Get()
    async findAll(@Query() query: ExpressQuery): Promise<FetchAllResponse> {
        return this.employeesService.findAll(query);
    }

    @Get(':employeeId')
    async findOne(@Param('employeeId') employeeId: string): Promise<Employee> {
        return this.employeesService.findOne(employeeId);
    }

    @Patch(':employeeId')
    async update(@Param('employeeId') employeeId: string, @Body() updateEmployeeDto: UpdateEmployeeDto): Promise<Employee> {
        return this.employeesService.update(employeeId, updateEmployeeDto);
    }

    @Delete(':employeeId')
    async remove(@Param('employeeId') employeeId: string): Promise<Employee> {
        return this.employeesService.remove(employeeId);
    }
}
