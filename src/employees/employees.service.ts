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

    async create(
        dto: CreateEmployeeDto,
        files: { [key: string]: Express.Multer.File[] }
    ) {
        const fileLinks: any = {};

        // Helper to upload single file
        const uploadSingle = async (key: string) => {
            if (files[key] && files[key][0]) {
                const url = await this.cloudinaryService.uploadFile(files[key][0]);
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
                const url = await this.cloudinaryService.uploadFile(file);
                eduCertUrls.push(url);
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

        // Prepare row data as requested
        const row = [

            // Timestamp (keeping it as it's useful, but placing at start if not forbidden)
            // User prompt list started with fullName. I will strictly follow the list to avoid misalignment with headers if they changed them.
            // Wait, if I change the columns, the user might need to update headers.
            // The user explicitly listed the fields.
            // [dto.fullName, dto.dob, ...]

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
