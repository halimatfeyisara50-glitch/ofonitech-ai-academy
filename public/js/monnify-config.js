/**
 * ============================================================================
 * OFONITECH AI ACADEMY - MONNIFY PAYMENT GATEWAY CONNECTOR
 * ============================================================================
 * 
 * Official tuition checkout supporting:
 * - Debit & Credit Cards (Mastercard, Visa, Verve)
 * - Instant Bank Transfer (Dynamic Monnify Virtual Account)
 * - USSD (*737#, *901#, etc.)
 * - Phone Number / Moniepoint Wallet
 * ============================================================================
 */

const MONNIFY_CONFIG = {
    apiKey: window.MONNIFY_API_KEY || 'MK_PROD_6ZE6D01GDR',
    contractCode: window.MONNIFY_CONTRACT_CODE || '310717710968',
    currency: 'NGN',
    isTestMode: false
};

// Auto-sync Monnify credentials from backend /api/payment/config
(async function initMonnifyConfig() {
    try {
        const res = await fetch('/api/payment/config');
        if (res.ok) {
            const data = await res.json();
            if (data?.apiKey) {
                MONNIFY_CONFIG.apiKey = data.apiKey;
                MONNIFY_CONFIG.contractCode = data.contractCode || MONNIFY_CONFIG.contractCode;
                MONNIFY_CONFIG.isTestMode = data.isTest === true || data.apiKey.startsWith('MK_TEST_');
                console.log(`⚡ Monnify gateway initialized in ${MONNIFY_CONFIG.isTestMode ? 'TEST' : 'LIVE'} mode.`);
            }
        }
    } catch (e) {
        console.warn('Using client-cached Monnify configuration.', e);
    }
})();

/**
 * Launch Monnify inline checkout modal
 */
function initiateMonnifyPayment(studentId, fullName, email, phone, amount, programTitle) {
    const payBtn = document.getElementById('payMonnifyBtn');

    // 1. Ensure Monnify SDK is loaded; dynamically inject if missing
    if (typeof MonnifySDK === 'undefined' || typeof MonnifySDK.initialize !== 'function') {
        if (payBtn) {
            payBtn.disabled = true;
            payBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Connecting to Monnify...';
        }

        const existingScript = document.querySelector('script[src*="monnify.js"]');
        if (existingScript) existingScript.remove();

        const script = document.createElement('script');
        script.src = 'https://sdk.monnify.com/plugin/monnify.js';
        script.onload = () => {
            console.log('⚡ Monnify SDK loaded dynamically.');
            initiateMonnifyPayment(studentId, fullName, email, phone, amount, programTitle);
        };
        script.onerror = () => {
            alert('Unable to load Monnify checkout gateway. Please check your internet connection or disable ad-blockers and try again.');
            if (payBtn) {
                payBtn.disabled = false;
                payBtn.innerHTML = `<i class="fa-solid fa-rotate-right"></i> Retry Payment with Monnify`;
            }
        };
        document.body.appendChild(script);
        return;
    }

    // 2. Sanitize Inputs for Monnify API
    const digitsOnly = (phone || '').replace(/[^0-9]/g, '');
    let cleanPhone = digitsOnly.length >= 10 ? digitsOnly : '08012345678';
    if (cleanPhone.startsWith('234') && cleanPhone.length === 13) {
        cleanPhone = '0' + cleanPhone.slice(3);
    }

    const cleanName = decodeURIComponent(fullName || 'Student').trim();
    const cleanTitle = decodeURIComponent(programTitle || 'AI Program').trim();
    const paymentReference = `OFONI-${studentId}-${Date.now().toString().slice(-6)}`;

    if (payBtn) {
        payBtn.disabled = true;
        payBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Opening Secure Checkout...';
    }

    // 3. Safety timeout: If modal takes longer than 9s (due to slow network/CDN), re-enable button
    const safetyTimer = setTimeout(() => {
        if (payBtn && payBtn.disabled) {
            payBtn.disabled = false;
            payBtn.innerHTML = `<i class="fa-solid fa-rotate-right"></i> Reopen Monnify Checkout`;
        }
    }, 9000);

    try {
        MonnifySDK.initialize({
            amount: Number(amount),
            currency: MONNIFY_CONFIG.currency,
            reference: paymentReference,
            customerFullName: cleanName,
            customerEmail: email,
            customerMobileNumber: cleanPhone,
            apiKey: MONNIFY_CONFIG.apiKey,
            contractCode: MONNIFY_CONFIG.contractCode,
            paymentDescription: `Tuition: ${cleanTitle.slice(0, 30)} (${studentId})`,
            isTestMode: MONNIFY_CONFIG.isTestMode,
            paymentMethods: ["CARD", "ACCOUNT_TRANSFER", "USSD"],
            metadata: {
                studentId: studentId,
                programTitle: cleanTitle,
                academy: 'OfoniTech AI Academy'
            },
            onLoadStart: () => {
                console.log('⚡ Monnify checkout overlay loading...');
            },
            onLoadComplete: () => {
                clearTimeout(safetyTimer);
                console.log('⚡ Monnify checkout modal visible.');
                if (payBtn) {
                    payBtn.disabled = false;
                    payBtn.innerHTML = `<i class="fa-solid fa-lock"></i> Pay ₦${Number(amount).toLocaleString()} via Monnify`;
                }
            },
            onComplete: async function (response) {
                clearTimeout(safetyTimer);
                console.log('🎉 Monnify transaction response:', response);

                const isSuccess = response.status === 'SUCCESS' || 
                                  response.status === 'PAID' || 
                                  response.paymentStatus === 'PAID' || 
                                  response.paymentStatus === 'SUCCESS';

                if (isSuccess) {
                    await handleMonnifySuccess(studentId, response, cleanTitle);
                } else {
                    alert(`Transaction ended with status: ${response.status || response.paymentStatus || 'INCOMPLETE'}`);
                    if (payBtn) {
                        payBtn.disabled = false;
                        payBtn.innerHTML = `<i class="fa-solid fa-lock"></i> Pay ₦${Number(amount).toLocaleString()} via Monnify`;
                    }
                }
            },
            onClose: function (data) {
                clearTimeout(safetyTimer);
                console.log('Monnify payment modal closed by user', data);
                if (payBtn) {
                    payBtn.disabled = false;
                    payBtn.innerHTML = `<i class="fa-solid fa-lock"></i> Pay ₦${Number(amount).toLocaleString()} via Monnify`;
                }
            }
        });
    } catch (err) {
        clearTimeout(safetyTimer);
        console.error('Monnify initialization error:', err);
        alert('Error launching Monnify checkout: ' + err.message);
        if (payBtn) {
            payBtn.disabled = false;
            payBtn.innerHTML = `<i class="fa-solid fa-lock"></i> Pay ₦${Number(amount).toLocaleString()} via Monnify`;
        }
    }
}

/**
 * Handle successful Monnify transaction: verify with backend & update UI receipt
 */
async function handleMonnifySuccess(studentId, paymentData, programTitle) {
    const paymentBox = document.getElementById('monnifyActionBox');
    const paymentRef = paymentData.paymentReference || paymentData.transactionReference || paymentData.reference;
    const txRef = paymentData.transactionReference || paymentRef;

    // 1. Notify backend verification endpoint
    try {
        await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                studentId: studentId,
                paymentReference: paymentRef,
                transactionReference: txRef,
                amount: paymentData.amount || paymentData.authorizedAmount,
                status: 'Confirmed / Enrolled',
                gateway: 'Monnify',
                rawResponse: paymentData
            })
        });
        console.log('✅ Backend verification triggered for:', paymentRef);
    } catch (e) {
        console.warn('Backend sync note:', e);
    }

    // 2. Render celebration receipt
    if (paymentBox) {
        paymentBox.innerHTML = `
            <div class="monnify-success-box">
                <div style="font-size:2.8rem; margin-bottom: 0.5rem; animation: pulse 1.5s infinite;">🎉</div>
                <div class="monnify-success-title">Payment Confirmed & Seat Secured!</div>
                <p style="color: #94A3B8; font-size: 0.88rem; margin-bottom: 0.6rem;">
                    Your enrollment for <strong>${programTitle || 'OfoniTech AI Academy'}</strong> is now officially locked in.
                </p>
                <div class="monnify-success-ref">
                    <span style="color:#38BDF8;">Monnify Reference:</span> ${paymentRef}
                </div>
                <div style="margin-top: 1rem; display: flex; flex-direction: column; gap: 0.5rem;">
                    <a href="https://chat.whatsapp.com/" target="_blank" class="btn" style="background:#25D366; color:#000; font-weight:700; border-radius:10px; padding:0.75rem 1rem; text-decoration:none; display:inline-flex; align-items:center; justify-content:center; gap:0.5rem;">
                        <i class="fa-brands fa-whatsapp" style="font-size:1.1rem;"></i> Join Student Onboarding Community
                    </a>
                    <button class="btn btn-secondary" onclick="window.print()" style="padding:0.6rem; font-size:0.85rem;">
                        <i class="fa-solid fa-print"></i> Print Enrollment Receipt
                    </button>
                </div>
            </div>
        `;
    }
}
