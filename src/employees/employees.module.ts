import { Module } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { EmployeesController } from './employees.controller';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { SheetsService } from '../sheets/sheets.service';

@Module({
    imports: [CloudinaryModule],
    controllers: [EmployeesController],
    providers: [EmployeesService, SheetsService],
})
export class EmployeesModule { }
