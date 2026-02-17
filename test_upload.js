
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpload() {
    console.log('Testing upload to "employee_documents"...');
    const fileName = `test-${Date.now()}.txt`;
    const fileContent = 'Hello Supabase';

    const { data, error } = await supabase.storage
        .from('employee_documents')
        .upload(fileName, fileContent, {
            contentType: 'text/plain',
            upsert: false,
        });

    if (error) {
        console.error('Upload failed:', error);
    } else {
        console.log('Upload successful:', data);

        // Cleanup
        await supabase.storage.from('employee_documents').remove([fileName]);
    }
}

testUpload();
