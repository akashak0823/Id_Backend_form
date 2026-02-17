
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createBucket() {
    console.log('Attempting to create bucket "employee_documents"...');
    const { data, error } = await supabase.storage.createBucket('employee_documents', {
        public: true,
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: ['image/*', 'application/pdf']
    });

    if (error) {
        console.error('Failed to create bucket:', error);
    } else {
        console.log('Bucket "employee_documents" created successfully:', data);
    }
}

createBucket();
