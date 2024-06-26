import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentsService } from './service';
import { PaymentsController } from './controller';
import { Payment, PaymentSchema } from './schema';
import { Employee, EmployeeSchema } from '../employees/schema';
import { CustomLoggerService } from '../common/utils/logger';

@Module({
    imports: [MongooseModule.forFeature([{ name: Payment.name, schema: PaymentSchema }, { name: Employee.name, schema: EmployeeSchema }])],
    controllers: [PaymentsController],
    providers: [PaymentsService, CustomLoggerService],
})
export class PaymentsModule { }
