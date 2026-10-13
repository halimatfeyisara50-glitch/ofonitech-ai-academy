/**
 * ============================================================================
 * OFONITECH AI ACADEMY - FLUTTERWAVE PAYMENT GATEWAY CONNECTOR
 * ============================================================================
 * 
 * Secure tuition checkout supporting:
 * - Debit Cards (Mastercard, Visa, Verve)
 * - Instant Bank Transfer (Dedicated Virtual Account)
 * - USSD (*737# etc.)
 * ============================================================================
 */

const FLUTTERWAVE_CONFIG = {
    // Flutterwave Public Key
    publicKey: window.FLUTTERWAVE_PUBLIC_KEY || 'FLWPUBK_TEST-094c7fa3e61030740c3bec88443af00a-X',
    currency: 'NGN',
    country: 'NG'
};

// Auto-sync public key from backend if configured in .env or edge variables
(async function initFlutterwaveKey() {
    try {
        const res = await fetch('/api/payment/config');
        if (res.ok) {
            const data = await res.json();
            if (data?.publicKey && data.publicKey.startsWith('FLWPUBK')) {
                FLUTTERWAVE_CONFIG.publicKey = data.publicKey;
                console.log('⚡ Flutterwave public key synchronized from server.');
            }
        }
    } catch (e) {
        // Silently use configured fallback
    }
})();

/**
 * Launch Flutterwave standard checkout modal
 */
function initiateFlutterwavePayment(studentId, fullName, email, phone, amount, programTitle) {
    if (typeof FlutterwaveCheckout !== 'function') {
        alert('Flutterwave secure checkout is loading. Please wait a moment and try again.');
        return;
    }

    // Generate unique transaction reference
    const txRef = `OFONI-TX-${studentId}-${Date.now()}`;
    const cleanName = decodeURIComponent(fullName);
    const cleanTitle = decodeURIComponent(programTitle);

    const payBtn = document.getElementById('payFlutterwaveBtn');
    if (payBtn) {
        payBtn.disabled = true;
        payBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Launching Secure Gateway...';
    }

    FlutterwaveCheckout({
        public_key: FLUTTERWAVE_CONFIG.publicKey,
        tx_ref: txRef,
        amount: Number(amount),
        currency: FLUTTERWAVE_CONFIG.currency,
        country: FLUTTERWAVE_CONFIG.country,
        payment_options: 'card, banktransfer, ussd',
        customer: {
            email: email,
            phone_number: phone,
            name: cleanName,
        },
        customizations: {
            title: 'OfoniTech AI Academy',
            description: `Tuition for ${cleanTitle}`,
            logo: 'https://ofonitechaiacademy.online/favicon.ico',
        },
        callback: async function (paymentData) {
            console.log('🎉 Flutterwave payment response:', paymentData);

            if (paymentData.status === 'successful' || paymentData.status === 'completed') {
                await handleFlutterwaveSuccess(studentId, paymentData);
            } else {
                alert(`Payment could not be completed. Status: ${paymentData.status}`);
                if (payBtn) {
                    payBtn.disabled = false;
                    payBtn.innerHTML = `<i class="fa-solid fa-lock"></i> Pay ₦${Number(amount).toLocaleString()} Now`;
                }
            }
        },
        onclose: function () {
            console.log('Flutterwave payment modal closed by user');
            if (payBtn) {
                payBtn.disabled = false;
                payBtn.innerHTML = `<i class="fa-solid fa-lock"></i> Pay ₦${Number(amount).toLocaleString()} Now`;
            }
        }
    });
}

/**
 * Handle successful payment: update database and update receipt view
 */
async function handleFlutterwaveSuccess(studentId, paymentData) {
    const paymentBox = document.getElementById('flutterwaveActionBox');
    const flwRef = paymentData.flw_ref || paymentData.tx_ref || paymentData.transaction_id;

    // 1. Update status via backend API
    try {
        await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                studentId: studentId,
                transactionId: paymentData.transaction_id,
                txRef: paymentData.tx_ref,
                flwRef: flwRef,
                amount: paymentData.amount,
                status: 'Confirmed / Enrolled'
            })
        });
    } catch (err) {
        console.warn('Backend payment verify sync warning:', err);
    }

    // 2. Direct Supabase Client sync if available
    try {
        if (window.supabase && typeof isSupabaseConfigured === 'function' && isSupabaseConfigured()) {
            const client = getSupabaseClient();
            if (client) {
                await client
                    .from('enrollments')
                    .update({ status: 'Confirmed / Enrolled' })
                    .eq('student_id', studentId);
            }
        }
    } catch (err) {
        console.warn('Supabase client payment status sync:', err);
    }

    // 3. Transform UI to Green Celebration Receipt
    if (paymentBox) {
        paymentBox.outerHTML = `
            <div class="flw-success-box">
                <div class="flw-success-title">
                    <i class="fa-solid fa-circle-check"></i> Payment Confirmed!
                </div>
                <p style="font-size: 0.85rem; color: #E2E8F0; margin-bottom: 0.4rem;">
                    Your slot in <strong>OfoniTech AI Academy</strong> is officially secured.
                </p>
                <div class="flw-success-ref">
                    Ref: ${flwRef}
                </div>
                <div style="font-size: 0.78rem; color: #86EFAC; margin-top: 0.3rem;">
                    <i class="fa-solid fa-envelope-circle-check"></i> Electronic receipt & onboarding pass sent to your email.
                </div>
            </div>
        `;
    }
}
