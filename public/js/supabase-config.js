/**
 * ============================================================================
 * OFONITECH AI ACADEMY - SUPABASE DATABASE CONNECTOR
 * ============================================================================
 * 
 * Direct database persistence for:
 * 1. Student Enrollments (`public.enrollments`)
 * 2. Support / Contact Inquiries (`public.contact_inquiries`)
 * 
 * No user login / sign-in required!
 * ============================================================================
 */

const SUPABASE_CONFIG = {
    // Paste your Supabase Project URL (e.g. 'https://abcdefghijkl.supabase.co')
    url: 'https://your-project-id.supabase.co',

    // Paste your Supabase public 'anon' key (starts with 'eyJhbGciOi...')
    anonKey: 'your-supabase-anon-key-here'
};

let supabaseClient = null;

function isSupabaseConfigured() {
    return (
        SUPABASE_CONFIG.url &&
        !SUPABASE_CONFIG.url.includes('your-project-id') &&
        SUPABASE_CONFIG.anonKey &&
        !SUPABASE_CONFIG.anonKey.includes('your-supabase-anon-key')
    );
}

function getSupabaseClient() {
    if (!supabaseClient && window.supabase && isSupabaseConfigured()) {
        try {
            supabaseClient = window.supabase.createClient(
                SUPABASE_CONFIG.url,
                SUPABASE_CONFIG.anonKey
            );
            console.log('✅ Supabase Database Client connected.');
        } catch (err) {
            console.error('Failed to initialize Supabase client:', err);
        }
    }
    return supabaseClient;
}

/**
 * Persist student enrollment record directly to Supabase database
 */
async function saveEnrollmentToSupabase(enrollment) {
    const client = getSupabaseClient();
    if (!client) return { success: false, reason: 'Supabase not configured' };

    try {
        const { data, error } = await client
            .from('enrollments')
            .insert([
                {
                    student_id: enrollment.studentId,
                    full_name: enrollment.fullName,
                    email: enrollment.email,
                    phone: enrollment.phone,
                    program_id: enrollment.programId,
                    program_title: enrollment.programTitle,
                    learning_mode: enrollment.learningMode,
                    tuition_amount: enrollment.totalTuition,
                    payment_option: enrollment.paymentOption,
                    promo_code: enrollment.promoCode || null,
                    status: enrollment.status || 'Pending Payment Confirmation'
                }
            ]);

        if (error) {
            console.warn('Supabase enrollment insert warning:', error.message);
            return { success: false, error };
        }

        console.log('🎉 Enrollment saved to Supabase database successfully.');
        return { success: true, data };
    } catch (err) {
        console.warn('Supabase enrollment error:', err);
        return { success: false, error: err };
    }
}

/**
 * Persist contact ticket inquiry to Supabase database
 */
async function saveContactToSupabase(contact) {
    const client = getSupabaseClient();
    if (!client) return { success: false, reason: 'Supabase not configured' };

    try {
        const { data, error } = await client
            .from('contact_inquiries')
            .insert([
                {
                    ticket_id: contact.ticketId,
                    name: contact.name,
                    email: contact.email,
                    subject: contact.subject,
                    message: contact.message,
                    status: 'Open'
                }
            ]);

        if (error) {
            console.warn('Supabase contact insert warning:', error.message);
            return { success: false, error };
        }

        console.log('📩 Inquiry saved to Supabase database successfully.');
        return { success: true, data };
    } catch (err) {
        console.warn('Supabase contact error:', err);
        return { success: false, error: err };
    }
}
