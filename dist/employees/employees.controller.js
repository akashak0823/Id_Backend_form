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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmployeesController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const employees_service_1 = require("./employees.service");
let EmployeesController = class EmployeesController {
    employeesService;
    constructor(employeesService) {
        this.employeesService = employeesService;
    }
    async create(files, dataString) {
        if (!dataString) {
            throw new Error('Missing data field');
        }
        let createEmployeeDto;
        try {
            createEmployeeDto = JSON.parse(dataString);
        }
        catch (e) {
            throw new Error('Invalid JSON in data field');
        }
        return await this.employeesService.create(createEmployeeDto, files);
    }
};
exports.EmployeesController = EmployeesController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([
        { name: 'photo', maxCount: 1 },
        { name: 'aadhaar', maxCount: 1 },
        { name: 'pan', maxCount: 1 },
        { name: 'birthCertificate', maxCount: 1 },
        { name: 'communityCertificate', maxCount: 1 },
        { name: 'incomeCertificate', maxCount: 1 },
        { name: 'nativityCertificate', maxCount: 1 },
        { name: 'educationalCertificates', maxCount: 5 },
    ], {
        limits: { fileSize: 5 * 1024 * 1024 }
    })),
    __param(0, (0, common_1.UploadedFiles)()),
    __param(1, (0, common_1.Body)('data')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], EmployeesController.prototype, "create", null);
exports.EmployeesController = EmployeesController = __decorate([
    (0, common_1.Controller)('api/employees'),
    __metadata("design:paramtypes", [employees_service_1.EmployeesService])
], EmployeesController);
//# sourceMappingURL=employees.controller.js.map