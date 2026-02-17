import { Module } from '@nestjs/common';
import { EmployeesService } from './employees.service';
import { EmployeesController } from './employees.controller';
import { SupabaseModule } from '../supabase/supabase.module';
import { SheetsService } from '../sheets/sheets.service';

@Module({
    imports: [SupabaseModule],
    controllers: [EmployeesController],
    providers: [EmployeesService, SheetsService],
})
export class EmployeesModule { }
