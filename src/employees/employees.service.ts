import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { SupabaseService } from '../supabase/supabase.service';
import { SheetsService } from '../sheets/sheets.service';

@Injectable()
export class EmployeesService {
    constructor(
        private readonly supabaseService: SupabaseService,
        private readonly sheetsService: SheetsService,
    ) { }

    // Helper methods not needed anymore as we format inline

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
                const url = await this.supabaseService.uploadFile(file, file.originalname);
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
                    const url = await this.supabaseService.uploadFile(file, file.originalname);
                    eduCertUrls.push(url);
                }
            }
            fileLinks['educationalCertificatesUrl'] = eduCertUrls;
        }

        // Sibling variable cleanup
        let siblings = dto.siblings;
        if (typeof siblings === 'string') {
            try {
                siblings = JSON.parse(siblings);
            } catch (e) {
                siblings = [];
            }
        }

        // Handle Marital Status logic
        const isSingle = dto.maritalStatus === 'Single';
        const maritalStatus = dto.maritalStatus || "-";
        
        const spouseName = isSingle ? "NA" : (dto.spouseName || "-");
        const spouseMaritalStatus = isSingle ? "NA" : (dto.spouseMaritalStatus || "-");
        const spouseEmploymentStatus = isSingle ? "NA" : (dto.spouseEmploymentStatus || "-");
        
        let childrenFormatted = "-";
        if (isSingle) {
            childrenFormatted = "NA";
        } else if (dto.children && Array.isArray(dto.children) && dto.children.length > 0) {
            // Flatten children to a string representation for Google Sheets
            childrenFormatted = dto.children.map((c: any) => `${c.name} (${c.gender})`).join(", ");
        }

        // Format array fields as single strings for Google Sheets to prevent column shifting
        const eduCertUrlsFormatted = eduCertUrls.length > 0 
            ? eduCertUrls.join(", ") 
            : "-";

        let siblingsFormatted = "-";
        if (siblings && Array.isArray(siblings) && siblings.length > 0) {
            siblingsFormatted = siblings.map((s: any) => `${s.name} (${s.maritalStatus}, ${s.employmentStatus})`).join(" | ");
        }

        // Save to Google Sheets
        const row = [
            dto.fullName,
            dto.dob,
            dto.gender,
            maritalStatus,
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
            spouseName,
            spouseMaritalStatus,
            spouseEmploymentStatus,
            childrenFormatted,
            dto.selectedSibling || (isSingle ? "NA" : "-"),
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
            eduCertUrlsFormatted,
            siblingsFormatted
        ];

        await this.sheetsService.appendRow(row);

        // Save to Supabase DB
        const dbRecord = {
            full_name: dto.fullName,
            dob: dto.dob,
            gender: dto.gender,
            marital_status: maritalStatus,
            contact_number: dto.contactNumber,
            emergency_contact: dto.emergencyContact,
            email: dto.email,
            department: dto.department,
            designation: dto.designation,
            joining_date: dto.joiningDate,
            blood_group: dto.bloodGroup,
            father_name: dto.fatherName,
            mother_name: dto.motherName,
            total_family_members: dto.totalFamilyMembers,
            spouse_name: spouseName,
            spouse_marital_status: spouseMaritalStatus,
            spouse_employment_status: spouseEmploymentStatus,
            children: isSingle ? null : (dto.children || null),
            selected_sibling: dto.selectedSibling,
            contact_address: dto.contactAddress,
            permanent_address: dto.permanentAddress,
            bank_name: dto.bankName,
            account_number: dto.accountNumber,
            ifsc_code: dto.ifscCode,
            nominee_name: dto.nomineeName,
            photo_url: photoUrl,
            aadhaar_url: aadhaarUrl,
            pan_url: panUrl,
            birth_certificate_url: birthCertificateUrl,
            community_certificate_url: communityCertificateUrl,
            income_certificate_url: incomeCertificateUrl,
            nativity_certificate_url: nativityCertificateUrl,
            educational_certificates_urls: eduCertUrls,
            siblings: siblings // Stored as JSONB
        };

        await this.supabaseService.insertEmployee(dbRecord);

        return {
            success: true,
            fileLinks
        };
    }
}
