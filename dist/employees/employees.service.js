"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeesService = void 0;
const common_1 = require("@nestjs/common");
const supabase_service_1 = require("../supabase/supabase.service");
const sheets_service_1 = require("../sheets/sheets.service");
let EmployeesService = class EmployeesService {
    supabaseService;
    sheetsService;
    constructor(supabaseService, sheetsService) {
        this.supabaseService = supabaseService;
        this.sheetsService = sheetsService;
    }
    async create(dto, files) {
        const fileLinks = {};
        const uploadSingle = async (key) => {
            if (files[key] && files[key][0]) {
                const file = files[key][0];
                if (file.size === 0) {
                    return '';
                }
                console.log(`Uploading ${key}...`);
                const url = await this.supabaseService.uploadFile(file);
                console.log(`Uploaded ${key}: ${url}`);
                fileLinks[`${key}Url`] = url;
                return url;
            }
            return '';
        };
        const siblingHeaders = [];
        for (let i = 1; i <= 5; i++) {
            siblingHeaders.push(`Sibling ${i} Name`, `Sibling ${i} Marital Status`, `Sibling ${i} Employment Status`);
        }
        const childHeaders = [];
        for (let i = 1; i <= 5; i++) {
            childHeaders.push(`Child ${i} Name`, `Child ${i} Gender`, `Child ${i} DOB`);
        }
        const SHEET_HEADERS = [
            "Full Name", "Date of Birth", "Gender", "Contact Number", "Emergency Contact Number", "Email ID",
            "Department", "Designation", "Joining Date", "Blood Group", "Father Name", "Mother Name",
            "Total Family Members", "Spouse Name", "Spouse Employment Status", "Nominee Name",
            "Contact Address", "Permanent Address", "Bank Name", "Bank Account Number", "IFSC Code",
            "Photo", "Aadhaar Card", "PAN", "Birth Certificate", "Community Certificate",
            "Income Certificate", "Nativity Certificate", "Educational Certificates", "Selected Sibling",
            ...siblingHeaders,
            ...childHeaders
        ];
        await this.sheetsService.setHeaders(SHEET_HEADERS);
        const photoUrl = await uploadSingle('photo');
        const aadhaarUrl = await uploadSingle('aadhaar');
        const panUrl = await uploadSingle('pan');
        const birthCertificateUrl = await uploadSingle('birthCertificate');
        const communityCertificateUrl = await uploadSingle('communityCertificate');
        const incomeCertificateUrl = await uploadSingle('incomeCertificate');
        const nativityCertificateUrl = await uploadSingle('nativityCertificate');
        const eduCertUrls = [];
        if (files.educationalCertificates && files.educationalCertificates.length > 0) {
            for (const file of files.educationalCertificates) {
                if (file.size > 0) {
                    const url = await this.supabaseService.uploadFile(file);
                    eduCertUrls.push(url);
                }
            }
            fileLinks['educationalCertificatesUrl'] = eduCertUrls;
        }
        const eduCertsString = eduCertUrls.join(',\n');
        let siblings = dto.siblings;
        if (typeof siblings === 'string') {
            try {
                siblings = JSON.parse(siblings);
            }
            catch (e) {
                siblings = [];
            }
        }
        const siblingData = Array.isArray(siblings) ? siblings : [];
        const siblingCells = [];
        for (let i = 0; i < 5; i++) {
            const s = siblingData[i] || {};
            siblingCells.push(s.name || "", s.maritalStatus || "", s.employmentStatus || "");
        }
        let children = dto.children;
        if (typeof children === 'string') {
            try {
                children = JSON.parse(children);
            }
            catch (e) {
                children = [];
            }
        }
        const childData = Array.isArray(children) ? children : [];
        const childCells = [];
        for (let i = 0; i < 5; i++) {
            const c = childData[i] || {};
            childCells.push(c.name || "", c.gender || "", c.dob || "");
        }
        const row = [
            dto.fullName,
            dto.dob,
            dto.gender,
            dto.contactNumber,
            dto.emergencyContact,
            dto.email,
            dto.department,
            dto.designation,
            dto.joiningDate,
            dto.bloodGroup,
            dto.fatherName,
            dto.motherName,
            dto.totalFamilyMembers,
            dto.spouseName || "",
            dto.spouseEmploymentStatus || "",
            dto.nomineeName,
            dto.contactAddress,
            dto.permanentAddress,
            dto.bankName,
            dto.accountNumber,
            dto.ifscCode,
            photoUrl,
            aadhaarUrl,
            panUrl,
            birthCertificateUrl,
            communityCertificateUrl,
            incomeCertificateUrl,
            nativityCertificateUrl,
            eduCertsString,
            dto.selectedSibling,
            ...siblingCells,
            ...childCells
        ];
        await this.sheetsService.appendRow(row);
        return {
            success: true,
            fileLinks
        };
    }
};
exports.EmployeesService = EmployeesService;
exports.EmployeesService = EmployeesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [supabase_service_1.SupabaseService,
        sheets_service_1.SheetsService])
], EmployeesService);
//# sourceMappingURL=employees.service.js.map