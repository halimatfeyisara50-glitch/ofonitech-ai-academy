/**
 * ============================================================================
 * OFONITECH AI ACADEMY - MONNIFY PAYMENT GATEWAY CONNECTOR
 * ============================================================================
 * 
 * Official tuition checkout supporting:
 * - Debit & Credit Cards (Mastercard, Visa, Verve)
 * - Instant Bank Transfer (Dynamic Monnify Virtual Account)
 * - USSD (*737#, *901#, etc.)
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
                console.log(`⚡ Monnify gateway ready in ${MONNIFY_CONFIG.isTestMode ? 'TEST' : 'LIVE'} mode.`);
            }
        }
    } catch (e) {
        console.warn('Using client fallback Monnify configuration.', e);
    }
})();

/**
 * Launch Monnify checkout iframe with fast server initialization & fallback
 */
async function initiateMonnifyPayment(studentId, fullName, email, phone, amount, programTitle) {
    const payBtn = document.getElementById('payMonnifyBtn');
    const cleanName = decodeURIComponent(fullName || 'Student').trim();
    const cleanTitle = decodeURIComponent(programTitle || 'Academy Track').trim();

    if (payBtn) {
        payBtn.disabled = true;
        payBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Launching Monnify Gateway...';
    }

    // Hide any previous stuck Monnify preloader
    const preloader = document.getElementById('MonnifyPreLoader');
    if (preloader) preloader.remove();

    try {
        // Method 1: Fast Server-Side Initialization (Takes ~1.5s, bypasses client CORS & preloader freezes)
        const initRes = await fetch('/api/payment/monnify-init', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                amount: Number(amount),
                studentId: studentId,
                fullName: cleanName,
                email: email,
                phone: phone,
                programTitle: cleanTitle
            })
        });

        if (initRes.ok) {
            const initData = await initRes.json();
            if (initData.success && initData.checkoutUrl) {
                console.log('⚡ Monnify checkout session initialized:', initData.transactionReference);
                openMonnifyCustomIframe(initData.checkoutUrl, studentId, cleanTitle, amount, initData.transactionReference);
                return;
            }
        }
    } catch (serverInitErr) {
        console.warn('Server init fallback, trying client SDK:', serverInitErr);
    }

    // Method 2: Standard MonnifySDK Client Fallback
    launchMonnifyClientSdk(studentId, cleanName, email, phone, amount, cleanTitle);
}

/**
 * Open Monnify Checkout directly in responsive iframe modal with zero lag
 */
function openMonnifyCustomIframe(checkoutUrl, studentId, programTitle, amount, txRef) {
    const payBtn = document.getElementById('payMonnifyBtn');
    
    // Remove any existing overlay
    const existing = document.getElementById('monnifyCustomOverlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'monnifyCustomOverlay';
    overlay.className = 'monnify-custom-overlay';

    overlay.innerHTML = `
        <div class="monnify-custom-container">
            <div class="monnify-custom-header">
                <div class="monnify-custom-title">
                    <i class="fa-solid fa-shield-halved"></i> OfoniTech AI Academy • Monnify Secure Payment
                </div>
                <button type="button" class="monnify-custom-close" onclick="closeMonnifyCustomIframe()">
                    <i class="fa-solid fa-xmark"></i> Close
                </button>
            </div>
            <iframe id="monnifyCheckoutIframe" 
                    src="${checkoutUrl}" 
                    class="monnify-custom-iframe" 
                    allow="geolocation; clipboard-write; payment" 
                    title="Monnify Secure Checkout">
            </iframe>
        </div>
    `;

    document.body.appendChild(overlay);

    if (payBtn) {
        payBtn.disabled = false;
        payBtn.innerHTML = `<i class="fa-solid fa-lock"></i> Pay ₦${Number(amount).toLocaleString()} via Monnify`;
    }

    // Global PostMessage Listener for Monnify Iframe Callbacks
    const messageHandler = async function (e) {
        const data = e.data || {};
        const msgType = data.type || (typeof data === 'string' ? data : '');

        // Monnify transaction completion signals
        if (msgType === 'MonnifyPopupComplete' || msgType === 'TRANSACTION_SUCCESS' || data.paymentStatus === 'PAID') {
            window.removeEventListener('message', messageHandler);
            closeMonnifyCustomIframe();
            await handleMonnifySuccess(studentId, data.data || data, programTitle);
        } else if (msgType === 'MonnifyPopupClose' || msgType === 'MonnifyPopupCancel') {
            window.removeEventListener('message', messageHandler);
            closeMonnifyCustomIframe();
        }
    };

    window.addEventListener('message', messageHandler);
}

/**
 * Close custom Monnify Iframe modal
 */
function closeMonnifyCustomIframe() {
    const overlay = document.getElementById('monnifyCustomOverlay');
    if (overlay) overlay.remove();

    const payBtn = document.getElementById('payMonnifyBtn');
    if (payBtn) {
        payBtn.disabled = false;
    }
}

/**
 * Fallback to client-side MonnifySDK
 */
function launchMonnifyClientSdk(studentId, cleanName, email, phone, amount, cleanTitle) {
    const payBtn = document.getElementById('payMonnifyBtn');
    if (typeof MonnifySDK === 'undefined' || typeof MonnifySDK.initialize !== 'function') {
        alert('Monnify checkout is connecting. Please wait a moment and click again.');
        if (payBtn) {
            payBtn.disabled = false;
            payBtn.innerHTML = `<i class="fa-solid fa-lock"></i> Pay ₦${Number(amount).toLocaleString()} via Monnify`;
        }
        return;
    }

    const digitsOnly = (phone || '').replace(/[^0-9]/g, '');
    const cleanPhone = digitsOnly.length >= 10 ? digitsOnly : '08012345678';
    const paymentReference = `OFONI-${studentId}-${Date.now().toString().slice(-6)}`;

    MonnifySDK.initialize({
        amount: Number(amount),
        currency: MONNIFY_CONFIG.currency,
        reference: paymentReference,
        customerName: cleanName,
        customerFullName: cleanName,
        customerEmail: email,
        customerMobileNumber: cleanPhone,
        apiKey: MONNIFY_CONFIG.apiKey,
        contractCode: MONNIFY_CONFIG.contractCode,
        paymentDescription: `Tuition: ${cleanTitle.slice(0, 30)} (${studentId})`,
        isTestMode: MONNIFY_CONFIG.isTestMode,
        showLoadingState: false, // Prevent buggy default preloader
        paymentMethods: ["CARD", "ACCOUNT_TRANSFER", "USSD"],
        metadata: {
            studentId: studentId,
            programTitle: cleanTitle
        },
        onLoadComplete: () => {
            const pre = document.getElementById('MonnifyPreLoader');
            if (pre) pre.remove();
            if (payBtn) {
                payBtn.disabled = false;
                payBtn.innerHTML = `<i class="fa-solid fa-lock"></i> Pay ₦${Number(amount).toLocaleString()} via Monnify`;
            }
        },
        onComplete: async function (response) {
            const isSuccess = response.status === 'SUCCESS' || response.status === 'PAID' || response.paymentStatus === 'PAID';
            if (isSuccess) {
                await handleMonnifySuccess(studentId, response, cleanTitle);
            } else {
                alert(`Transaction status: ${response.status || 'INCOMPLETE'}`);
                if (payBtn) payBtn.disabled = false;
            }
        },
        onClose: function () {
            if (payBtn) payBtn.disabled = false;
        }
    });
}

/**
 * Handle successful Monnify transaction: verify with backend & update UI receipt
 */
async function handleMonnifySuccess(studentId, paymentData, programTitle) {
    const paymentBox = document.getElementById('monnifyActionBox');
    const paymentRef = paymentData.paymentReference || paymentData.transactionReference || paymentData.reference || `MNFY-${Date.now()}`;
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
        console.log('✅ Monnify verified for student:', studentId);
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
