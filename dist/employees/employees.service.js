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
const cloudinary_service_1 = require("../cloudinary/cloudinary.service");
const sheets_service_1 = require("../sheets/sheets.service");
let EmployeesService = class EmployeesService {
    cloudinaryService;
    sheetsService;
    constructor(cloudinaryService, sheetsService) {
        this.cloudinaryService = cloudinaryService;
        this.sheetsService = sheetsService;
    }
    flattenSiblings(siblings) {
        const result = [];
        if (Array.isArray(siblings)) {
            siblings.forEach(s => {
                result.push(s.name || "", s.maritalStatus || "", s.employmentStatus || "");
            });
        }
        return result;
    }
    async create(dto, files) {
        const fileLinks = {};
        const uploadSingle = async (key) => {
            if (files[key] && files[key][0]) {
                const url = await this.cloudinaryService.uploadFile(files[key][0]);
                fileLinks[`${key}Url`] = url;
                return url;
            }
            return '';
        };
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
                const url = await this.cloudinaryService.uploadFile(file);
                eduCertUrls.push(url);
            }
            fileLinks['educationalCertificatesUrl'] = eduCertUrls;
        }
        let siblings = dto.siblings;
        if (typeof siblings === 'string') {
            try {
                siblings = JSON.parse(siblings);
            }
            catch (e) {
                siblings = [];
            }
        }
        const siblingCells = this.flattenSiblings(siblings || []);
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
            dto.selectedSibling,
            dto.contactAddress,
            dto.permanentAddress,
            dto.bankName,
            dto.accountNumber,
            dto.ifscCode,
            dto.nomineeName,
            photoUrl,
            aadhaarUrl,
            panUrl,
            birthCertificateUrl,
            communityCertificateUrl,
            incomeCertificateUrl,
            nativityCertificateUrl,
            ...eduCertUrls,
            ...siblingCells
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
    __metadata("design:paramtypes", [cloudinary_service_1.CloudinaryService,
        sheets_service_1.SheetsService])
], EmployeesService);
//# sourceMappingURL=employees.service.js.map