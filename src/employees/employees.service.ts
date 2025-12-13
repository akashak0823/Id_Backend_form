import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { SheetsService } from '../sheets/sheets.service';

@Injectable()
export class EmployeesService {
    constructor(
        private readonly cloudinaryService: CloudinaryService,
        private readonly sheetsService: SheetsService,
    ) { }

    // Helper to flatten siblings
    private flattenSiblings(siblings: any[]) {
        const result: string[] = [];
        if (Array.isArray(siblings)) {
            siblings.forEach(s => {
                result.push(
                    s.name || "",
                    s.maritalStatus || "",
                    s.employmentStatus || ""
                );
            });
        }
        return result;
    }

    // Helper to flatten children
    private flattenChildren(children: any[]) {
        const result: string[] = [];
        if (Array.isArray(children)) {
            children.forEach(c => {
                result.push(
                    c.name || "",
                    c.gender || "",
                    c.dob || ""
                );
            });
        }
        return result;
    }

    async create(
        dto: CreateEmployeeDto,
        files: { [key: string]: Express.Multer.File[] }
    ) {
        const fileLinks: any = {};

        // Helper to upload single file
        const uploadSingle = async (key: string) => {
            if (files[key] && files[key][0]) {
                const file = files[key][0];
                if (file.size === 0) {
                    return '';
                }
                console.log(`Uploading ${key}...`);
                const url = await this.cloudinaryService.uploadFile(file);
                console.log(`Uploaded ${key}: ${url}`);
                fileLinks[`${key}Url`] = url;
                return url;
            }
            return '';
        };

        // Upload files
        const photoUrl = await uploadSingle('photo');
        const aadhaarUrl = await uploadSingle('aadhaar');
        const panUrl = await uploadSingle('pan');
        const birthCertificateUrl = await uploadSingle('birthCertificate');
        const communityCertificateUrl = await uploadSingle('communityCertificate');
        const incomeCertificateUrl = await uploadSingle('incomeCertificate');
        const nativityCertificateUrl = await uploadSingle('nativityCertificate');

        // Upload multiple educational certificates
        const eduCertUrls: string[] = [];
        if (files.educationalCertificates && files.educationalCertificates.length > 0) {
            for (const file of files.educationalCertificates) {
                if (file.size > 0) {
                    const url = await this.cloudinaryService.uploadFile(file);
                    eduCertUrls.push(url);
                }
            }
            fileLinks['educationalCertificatesUrl'] = eduCertUrls;
        }

        // Flatten siblings
        // Check if siblings is a string (JSON) or object
        let siblings = dto.siblings;
        if (typeof siblings === 'string') {
            try {
                siblings = JSON.parse(siblings);
            } catch (e) {
                siblings = [];
            }
        }
        const siblingCells = this.flattenSiblings(siblings || []);

        // Flatten children
        let children = dto.children;
        if (typeof children === 'string') {
            try {
                children = JSON.parse(children);
            } catch (e) {
                children = [];
            }
        }
        const childrenCells = this.flattenChildren(children || []);

        // Prepare row data as requested
        const row = [
            dto.fullName,
            dto.dob,
            dto.gender,
            dto.contactNumber, // phone
            dto.emergencyContact, // emergencyPhone
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
            ...childrenCells,
            dto.selectedSibling, // selectedSiblingName
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
            ...eduCertUrls,    // Flattened education cert URLs
            ...siblingCells    // Flattened siblings
        ];

        await this.sheetsService.appendRow(row);

        return {
            success: true,
            fileLinks
        };
    }
}
