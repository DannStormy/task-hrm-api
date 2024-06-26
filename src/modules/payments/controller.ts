import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { PaymentsService } from './service';
import { Payment } from './schema';
import { CreatePaymentDto, UpdateStatusDto } from './dto';
import { Query as ExpressQuery } from 'express-serve-static-core';
import { FetchAllResponse } from '../common/dto';

@Controller('payments')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) { }

    @Post()
    async create(@Body() payment: CreatePaymentDto): Promise<Payment> {
        return this.paymentsService.create(payment);
    }

    @Get(':employeeId')
    async findByEmployee(@Param('employeeId') employeeId: string, @Query() query: ExpressQuery): Promise<FetchAllResponse> {
        return this.paymentsService.findByEmployee(employeeId, query);
    }

    @Patch(':paymentId')
    async updateStatus(@Param('paymentId') paymentId: string, @Body() status: UpdateStatusDto): Promise<Payment> {
        return this.paymentsService.updateStatus(paymentId, status);
    }

    @Delete(':paymentId')
    async remove(@Param('paymentId') paymentId: string): Promise<Payment> {
        return this.paymentsService.remove(paymentId);
    }
}
