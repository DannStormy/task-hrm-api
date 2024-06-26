import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Employee, EmployeeDocument } from './schema';
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto';
import { Query } from 'express-serve-static-core';
import { FetchAllResponse } from '../common/dto';
import { CustomLoggerService } from '../common/utils/logger';

@Injectable()
export class EmployeesService {
    constructor(
        @InjectModel(Employee.name) private employeeModel: Model<EmployeeDocument>, 
        private readonly logger: CustomLoggerService
    ) {
        this.logger.setContext('EmployeesService');
    }

    async create(employee: CreateEmployeeDto): Promise<Employee> {
        this.logger.log(`Creating employee: ${employee.email}`);

        const existingEmployee = await this.employeeModel.findOne({ email: employee.email });

        if (existingEmployee) {

            this.logger.warn(`Email already exists: ${employee.email}`);

            throw new ConflictException('Email already exists');
        }

        return await this.employeeModel.create(employee);
    }

    async findAll(query: Query): Promise<FetchAllResponse> {
        this.logger.log(`Fetching employees`);
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;

        const [totalCount, employees] = await Promise.all([
            this.employeeModel.countDocuments(),
            this.employeeModel.find().limit(limit).skip(skip).exec(),
        ]);

        const totalPages = Math.ceil(totalCount / limit);

        return {
            data: employees,
            totalCount,
            totalPages,
            currentPage: page,
        };
    }

    async findOne(id: string): Promise<Employee> {
        this.logger.log(`Fetching employee: ${id}`);
        const employee = await this.employeeModel.findById(id).exec();
        if (!employee) {

            this.logger.warn(`Employee not found: ${id}`);

            throw new NotFoundException('Employee not found');
        }
        return employee;
    }

    async update(id: string, employee: UpdateEmployeeDto): Promise<Employee> {
        this.logger.log(`Updating employee: ${id}`);
        if (employee.email) {
            const existingEmployee = await this.employeeModel.findOne({ email: employee.email, _id: { $ne: id } });

            if (existingEmployee) {

                this.logger.warn(`Email already exists: ${employee.email}`);

                throw new ConflictException('Email already exists');
            }
        }

        const updatedEmployee = await this.employeeModel.findByIdAndUpdate(id, employee, { new: true }).exec();
        if (!updatedEmployee) {
            throw new NotFoundException('Employee not found');
        }

        return updatedEmployee;
    }

    async remove(id: string): Promise<Employee> {
        this.logger.log(`Removing employee: ${id}`);
        const deletedEmployee = await this.employeeModel.findOneAndDelete({ _id: id }).exec();
        if (!deletedEmployee) {

            this.logger.warn(`Employee not found: ${id}`);

            throw new NotFoundException('Employee not found');
        }
        return deletedEmployee;
    }
}
