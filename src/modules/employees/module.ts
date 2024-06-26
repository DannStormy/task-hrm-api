import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EmployeesService } from './service';
import { EmployeesController } from './controller';
import { Employee, EmployeeSchema } from './schema';
import { CustomLoggerService } from '../common/utils/logger';

@Module({
  imports: [MongooseModule.forFeature([{ name: Employee.name, schema: EmployeeSchema }])],
  controllers: [EmployeesController],
  providers: [EmployeesService, CustomLoggerService],
})
export class EmployeesModule {}