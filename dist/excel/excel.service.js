"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var ExcelService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExcelService = void 0;
const common_1 = require("@nestjs/common");
const ExcelJS = __importStar(require("exceljs"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
let ExcelService = ExcelService_1 = class ExcelService {
    logger = new common_1.Logger(ExcelService_1.name);
    filePath = path.resolve('employees.xlsx');
    async appendEmployee(data) {
        const workbook = new ExcelJS.Workbook();
        let worksheet;
        try {
            if (fs.existsSync(this.filePath)) {
                await workbook.xlsx.readFile(this.filePath);
                worksheet = workbook.getWorksheet('Employees');
            }
        }
        catch (error) {
            this.logger.warn('Could not read existing file, creating new one.');
        }
        if (!worksheet) {
            if (!workbook.worksheets.length) {
                worksheet = workbook.addWorksheet('Employees');
            }
            else {
                const existing = workbook.getWorksheet('Employees');
                worksheet = existing ? existing : workbook.addWorksheet('Employees');
            }
            worksheet.columns = [
                { header: 'Full Name', key: 'fullName', width: 20 },
                { header: 'DOB', key: 'dob', width: 15 },
                { header: 'Gender', key: 'gender', width: 10 },
                { header: 'Email', key: 'email', width: 25 },
                { header: 'Contact No', key: 'contactNumber', width: 15 },
                { header: 'Department', key: 'department', width: 20 },
                { header: 'Designation', key: 'designation', width: 20 },
                { header: 'Employment Status', key: 'employmentStatus', width: 15 },
                { header: 'Siblings', key: 'siblings', width: 30 },
                { header: 'Drive Links', key: 'driveLinks', width: 50 },
            ];
        }
        const row = {
            ...data,
            siblings: data.siblings ? JSON.stringify(data.siblings) : '',
            driveLinks: JSON.stringify(data.driveLinks || {}),
        };
        worksheet.addRow(row);
        await workbook.xlsx.writeFile(this.filePath);
        this.logger.log(`Appended employee ${data.fullName} to Excel.`);
        return worksheet.rowCount;
    }
};
exports.ExcelService = ExcelService;
exports.ExcelService = ExcelService = ExcelService_1 = __decorate([
    (0, common_1.Injectable)()
], ExcelService);
//# sourceMappingURL=excel.service.js.map