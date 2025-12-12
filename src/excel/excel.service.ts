import { Injectable, Logger } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class ExcelService {
    private readonly logger = new Logger(ExcelService.name);
    private readonly filePath = path.resolve('employees.xlsx');

    async appendEmployee(data: any) {
        const workbook = new ExcelJS.Workbook();
        let worksheet: ExcelJS.Worksheet | undefined;

        try {
            if (fs.existsSync(this.filePath)) {
                await workbook.xlsx.readFile(this.filePath);
                worksheet = workbook.getWorksheet('Employees');
            }
        } catch (error) {
            this.logger.warn('Could not read existing file, creating new one.');
        }

        if (!worksheet) {
            // Create new if not exists
            if (!workbook.worksheets.length) {
                worksheet = workbook.addWorksheet('Employees');
            } else {
                // If workbook has sheets but 'Employees' wasn't found (which means worksheet matches "undefined"), try getting it again or add it.
                // Since we already tried getting it above, we should add it.
                // But let's keep it safe:
                const existing = workbook.getWorksheet('Employees');
                worksheet = existing ? existing : workbook.addWorksheet('Employees');
            }

            // Header row
            worksheet.columns = [
                { header: 'Full Name', key: 'fullName', width: 20 },
                { header: 'DOB', key: 'dob', width: 15 },
                { header: 'Gender', key: 'gender', width: 10 },
                { header: 'Email', key: 'email', width: 25 },
                { header: 'Contact No', key: 'contactNumber', width: 15 },
                { header: 'Department', key: 'department', width: 20 },
                { header: 'Designation', key: 'designation', width: 20 },
                // ... add other headers as needed
                { header: 'Employment Status', key: 'employmentStatus', width: 15 },
                { header: 'Siblings', key: 'siblings', width: 30 },
                { header: 'Drive Links', key: 'driveLinks', width: 50 },
            ];
        }

        // Flatten data for Excel
        const row = {
            ...data,
            siblings: data.siblings ? JSON.stringify(data.siblings) : '',
            driveLinks: JSON.stringify(data.driveLinks || {}),
        };

        worksheet.addRow(row);
        await workbook.xlsx.writeFile(this.filePath);
        this.logger.log(`Appended employee ${data.fullName} to Excel.`);

        return worksheet.rowCount; // Return row number
    }
}
