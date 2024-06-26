import { IsNumber, IsEnum, IsMongoId, IsDateString } from "class-validator";
import { PaymentStatus } from "./schema";
import { Types } from "mongoose";

export class CreatePaymentDto {
    @IsMongoId()
    employeeId: Types.ObjectId;

    @IsNumber()
    amount: number;

    @IsEnum(PaymentStatus)
    status: PaymentStatus;

    @IsDateString()
    date: Date;
}

export class UpdateStatusDto {
    @IsEnum(PaymentStatus)
    status: PaymentStatus;
}