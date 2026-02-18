
const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

async function main() {
    try {
        console.log('Starting debug script...');

        // Mock DTO
        const dto = {
            fullName: "Test User",
            dob: "2000-01-01",
            gender: "Male",
            // ... other fields
            siblings: JSON.stringify([
                { name: "Sib1", maritalStatus: "Single", employmentStatus: "Employed" },
                { name: "Sib2", maritalStatus: "Married", employmentStatus: "Unemployed" }
            ]),
            children: JSON.stringify([
                { name: "Child1", gender: "M", dob: "2020-01-01" }
            ])
        };

        // ... Mock Logic from EmployeesService ...
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

        console.log(`Generated ${SHEET_HEADERS.length} headers.`);

        // Parse Siblings
        let siblings = dto.siblings;
        if (typeof siblings === 'string') {
            try { siblings = JSON.parse(siblings); } catch (e) { siblings = []; }
        }
        const siblingData = Array.isArray(siblings) ? siblings : [];
        const siblingCells = [];
        for (let i = 0; i < 5; i++) {
            const s = siblingData[i] || {};
            siblingCells.push(s.name || "", s.maritalStatus || "", s.employmentStatus || "");
        }

        // Parse Children
        let children = dto.children;
        if (typeof children === 'string') {
            try { children = JSON.parse(children); } catch (e) { children = []; }
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
            "", "", "", // Contact, Emergency, Email
            "", "", "", "", "", "", // Dept, Desg, Joining, Blood, Father, Mother
            "", "", "", "", // Family, Spouse, SpouseEmp, Nominee
            "", "", "", "", "", // Address..., Bank...
            "", "", "", "", "", // Photo...
            "", "", "", "", // Income...
            ...siblingCells,
            ...childCells
        ];

        console.log(`Generated row with ${row.length} cells.`);

        // Google Sheets Auth & Write
        let auth;
        const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
        const privateKey = process.env.GOOGLE_PRIVATE_KEY;

        if (clientEmail && privateKey) {
            auth = new google.auth.GoogleAuth({
                credentials: {
                    client_email: clientEmail,
                    private_key: privateKey.replace(/\\n/g, '\n'),
                },
                scopes: ['https://www.googleapis.com/auth/spreadsheets'],
            });
        } else {
            const keyFilePath = path.join(process.cwd(), 'service-account.json');
            if (fs.existsSync(keyFilePath)) {
                auth = new google.auth.GoogleAuth({
                    keyFile: keyFilePath,
                    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
                });
            }
        }

        if (!auth) throw new Error('No credentials found');

        const sheets = google.sheets({ version: 'v4', auth });
        const spreadsheetId = process.env.GOOGLE_SHEET_ID;
        const tabName = process.env.GOOGLE_SHEET_TAB_NAME || 'Employees';

        console.log(`Appending to Spreadsheet: ${spreadsheetId}, Tab: ${tabName}`);

        await sheets.spreadsheets.values.append({
            spreadsheetId,
            range: `${tabName}!A1`,
            valueInputOption: 'RAW',
            requestBody: {
                values: [row],
            },
        });

        console.log('Success! Row appended.');

    } catch (error) {
        console.error('Error:', error);
        fs.writeFileSync('debug_result.txt', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    }
}

main();
