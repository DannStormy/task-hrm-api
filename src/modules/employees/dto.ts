import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateEmployeeDto {
    @IsString()
    name: string;

    @IsString()
    position: string;

    @IsString()
    department: string;

    @IsNumber()
    salary: number;

    @IsDateString()
    hireDate: Date;

    @IsString()
    email: string;
}

export class UpdateEmployeeDto {
    @IsOptional()
    name?: string;

    @IsOptional()
    position?: string;

    @IsOptional()
    department?: string;

    @IsOptional()
    salary?: number;

    @IsOptional()
    hireDate?: Date;

    @IsOptional()
    email?: string;
}
