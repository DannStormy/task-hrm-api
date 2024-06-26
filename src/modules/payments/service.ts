import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payment, PaymentDocument } from './schema';
import { Employee, EmployeeDocument } from '../employees/schema';
import { Query } from 'express-serve-static-core';
import { FetchAllResponse } from '../common/dto';
import { CreatePaymentDto, UpdateStatusDto } from './dto';
import { CustomLoggerService } from '../common/utils/logger';

@Injectable()
export class PaymentsService {
    constructor(
        @InjectModel(Payment.name) private paymentModel: Model<PaymentDocument>,
        @InjectModel(Employee.name) private employeeModel: Model<EmployeeDocument>,
        private readonly logger: CustomLoggerService
    ) {
        this.logger.setContext('PaymentsService');
    }

    async create(payment: CreatePaymentDto): Promise<Payment> {
        this.logger.log(`Creating payment for employee: ${payment.employeeId}`);

        const existingEmployee = await this.employeeModel.findById(payment.employeeId).exec();

        if (!existingEmployee) {
            this.logger.warn(`Employee not found: ${payment.employeeId}`);
            throw new NotFoundException('Employee not found');
        }

        return await this.paymentModel.create(payment);
    }

    async findByEmployee(employeeId: string, query: Query): Promise<FetchAllResponse> {
        this.logger.log(`Fetching payments for employee: ${employeeId}`);
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;

        const filter: any = { employeeId };

        if (query.status) {
            filter['status'] = query.status;
        }

        const [totalCount, payments] = await Promise.all([
            this.paymentModel.countDocuments(filter),
            this.paymentModel.find(filter).limit(limit).skip(skip).exec(),
        ]);

        const totalPages = Math.ceil(totalCount / limit);

        return {
            data: payments,
            totalCount,
            totalPages,
            currentPage: page,
        };
    }

    async updateStatus(id: string, status: UpdateStatusDto): Promise<Payment> {
        this.logger.log(`Updating payment status: ${id}`);
        const existingPayment = await this.paymentModel.findByIdAndUpdate(
            id,
            { status: status.status },
            { new: true }
        ).exec();

        if (!existingPayment) {
            this.logger.warn(`Payment not found: ${id}`);
            throw new NotFoundException('Payment not found');
        }

        return existingPayment;
    }

    async remove(id: string): Promise<Payment> {
        this.logger.log(`Removing payment: ${id}`);

        const deletedPayment = await this.paymentModel.findOneAndDelete({ _id: id }).exec();
        
        if (!deletedPayment) {
            this.logger.warn(`Payment not found: ${id}`);
            throw new NotFoundException('Payment not found');
        }
        return deletedPayment;
    }
}
