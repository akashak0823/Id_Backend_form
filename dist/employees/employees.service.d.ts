import { CreateEmployeeDto } from './dto/create-employee.dto';
import { SupabaseService } from '../supabase/supabase.service';
import { SheetsService } from '../sheets/sheets.service';
export declare class EmployeesService {
    private readonly supabaseService;
    private readonly sheetsService;
    constructor(supabaseService: SupabaseService, sheetsService: SheetsService);
    create(dto: CreateEmployeeDto, files: {
        [key: string]: Express.Multer.File[];
    }): Promise<{
        success: boolean;
        fileLinks: any;
    }>;
}
