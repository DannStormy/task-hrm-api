import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EmployeeDocument = Employee & Document;

@Schema()
export class Employee {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  position: string;

  @Prop({ required: true })
  department: string;

  @Prop({ required: true })
  salary: number;

  @Prop({ required: true })
  hireDate: Date;

  @Prop({ required: true, unique: true })
  email: string;
}

export const EmployeeSchema = SchemaFactory.createForClass(Employee);