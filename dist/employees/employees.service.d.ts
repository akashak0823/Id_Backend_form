import { CreateEmployeeDto } from './dto/create-employee.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { SheetsService } from '../sheets/sheets.service';
export declare class EmployeesService {
    private readonly cloudinaryService;
    private readonly sheetsService;
    constructor(cloudinaryService: CloudinaryService, sheetsService: SheetsService);
    private flattenSiblings;
    create(dto: CreateEmployeeDto, files: {
        [key: string]: Express.Multer.File[];
    }): Promise<{
        success: boolean;
        fileLinks: any;
    }>;
}
