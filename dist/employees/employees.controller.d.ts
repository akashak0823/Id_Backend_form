import { EmployeesService } from './employees.service';
export declare class EmployeesController {
    private readonly employeesService;
    constructor(employeesService: EmployeesService);
    create(files: {
        photo?: Express.Multer.File[];
        aadhaar?: Express.Multer.File[];
        pan?: Express.Multer.File[];
        birthCertificate?: Express.Multer.File[];
        communityCertificate?: Express.Multer.File[];
        incomeCertificate?: Express.Multer.File[];
        nativityCertificate?: Express.Multer.File[];
        educationalCertificates?: Express.Multer.File[];
    }, dataString: string): Promise<{
        success: boolean;
        fileLinks: any;
    }>;
}
