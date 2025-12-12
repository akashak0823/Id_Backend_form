import { Controller, Post, Body, UploadedFiles, UseInterceptors, InternalServerErrorException } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { EmployeesService } from './employees.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';

@Controller('api/employees')
export class EmployeesController {
    constructor(private readonly employeesService: EmployeesService) { }

    @Post()
    @UseInterceptors(FileFieldsInterceptor([
        { name: 'photo', maxCount: 1 },
        { name: 'aadhaar', maxCount: 1 },
        { name: 'pan', maxCount: 1 },
        { name: 'birthCertificate', maxCount: 1 },
        { name: 'communityCertificate', maxCount: 1 },
        { name: 'incomeCertificate', maxCount: 1 },
        { name: 'nativityCertificate', maxCount: 1 },
        { name: 'educationalCertificates', maxCount: 5 },
    ], {
        limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
    }))
    async create(
        @UploadedFiles() files: {
            photo?: Express.Multer.File[],
            aadhaar?: Express.Multer.File[],
            pan?: Express.Multer.File[],
            birthCertificate?: Express.Multer.File[],
            communityCertificate?: Express.Multer.File[],
            incomeCertificate?: Express.Multer.File[],
            nativityCertificate?: Express.Multer.File[],
            educationalCertificates?: Express.Multer.File[]
        },
        @Body('data') dataString: string,
    ) {
        if (!dataString) {
            throw new Error('Missing data field');
        }

        let createEmployeeDto: CreateEmployeeDto;
        try {
            createEmployeeDto = JSON.parse(dataString);
        } catch (e) {
            throw new Error('Invalid JSON in data field');
        }

        return await this.employeesService.create(createEmployeeDto, files);
    }
}
