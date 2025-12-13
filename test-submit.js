
const { Blob } = require('buffer'); // Ensure Blob is available if needed, though global in Node 20+

const dummyBlob = new Blob(['dummy content'], { type: 'text/plain' });

async function test() {
    const formData = new FormData();
    // Add single files
    formData.append('photo', dummyBlob, 'photo.jpg');
    formData.append('aadhaar', dummyBlob, 'aadhaar.pdf');
    formData.append('pan', dummyBlob, 'pan.pdf');

    // Add multiple educational certificates
    formData.append('educationalCertificates', dummyBlob, 'cert1.pdf');
    formData.append('educationalCertificates', dummyBlob, 'cert2.pdf');

    // Add complex data
    const data = {
        fullName: "Test User 2",
        dob: "1990-01-01",
        gender: "Male",
        contactNumber: "1234567890",
        emergencyContact: "0987654321",
        email: "test2@example.com",
        contactAddress: "Test Address",
        permanentAddress: "Test Address",
        fatherName: "Father",
        motherName: "Mother",
        totalFamilyMembers: "4",
        department: "IT",
        designation: "Dev",
        joiningDate: "2020-01-01",
        bloodGroup: "O+",
        bankName: "Bank",
        accountNumber: "12345",
        ifscCode: "ABCD0001234",
        nomineeName: "Nominee",
        siblings: JSON.stringify([
            { name: "Sib1", maritalStatus: "Single", employmentStatus: "Unemployed" }
        ])
    };

    formData.append('data', JSON.stringify(data));

    console.log('Sending complex request...');
    try {
        const response = await fetch('http://localhost:4000/api/employees', {
            method: 'POST',
            body: formData,
        });
        console.log('Status:', response.status);
        const text = await response.text();
        console.log('Body:', text);
    } catch (e) {
        console.error('Fetch Error:', e);
    }
}
test();
