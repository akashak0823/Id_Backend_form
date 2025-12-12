import { IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEmployeeDto {
    @IsString()
    fullName: string;

    @IsString()
    dob: string;

    @IsString()
    gender: string;

    @IsString()
    contactNumber: string;

    @IsString()
    emergencyContact: string;

    @IsString()
    email: string;

    @IsString()
    contactAddress: string;

    @IsString()
    permanentAddress: string;

    @IsString()
    fatherName: string;

    @IsString()
    motherName: string;

    @IsOptional()
    totalFamilyMembers: number | string;

    @IsOptional()
    @IsArray()
    siblings: any[];

    @IsOptional()
    @IsString()
    selectedSibling: string;

    @IsString()
    department: string;

    @IsString()
    designation: string;

    @IsString()
    joiningDate: string;

    @IsString()
    bloodGroup: string;

    @IsString()
    bankName: string;

    @IsString()
    accountNumber: string;

    @IsString()
    ifscCode: string;

    @IsString()
    nomineeName: string;

    @IsOptional()
    @IsString()
    nativityCertificate: string;
}
