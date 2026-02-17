
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBuckets() {
    console.log('Checking Supabase connection...');
    const { data, error } = await supabase.storage.listBuckets();

    if (error) {
        console.error('Error listing buckets:', error);
    } else {
        console.log('Buckets:', data);
        const bucket = data.find(b => b.name === 'employee_documents');
        if (bucket) {
            console.log('Bucket "employee_documents" found!');
        } else {
            console.error('Bucket "employee_documents" NOT found. Please create it.');
        }
    }
}

checkBuckets();
