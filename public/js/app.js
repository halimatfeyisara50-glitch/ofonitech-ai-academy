/**
 * OFONITECH AI ACADEMY - FRONTEND CONTROLLER
 * Interacts asynchronously with the Node.js / Express Server REST APIs
 */

let state = {
    programs: [],
    selectedMode: 'online', // 'online' | 'hybrid'
    appliedPromo: null,
    stats: null
};

// Initialize Application on DOM Content Loaded
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 OfoniTech AI Academy client connected to Node.js engine.');
    await fetchStats();
    await fetchPrograms();
    await fetchFaqs();
});

// 1. Fetch Academy Live Stats from Node API
async function fetchStats() {
    try {
        const response = await fetch('/api/stats');
        const data = await response.json();
        if (data.success) {
            state.stats = data.stats;
            document.getElementById('stat-graduates').textContent = `${data.stats.totalGraduates.toLocaleString()}+`;
            document.getElementById('stat-rate').textContent = data.stats.employmentRate;
            document.getElementById('stat-projects').textContent = `${data.stats.projectsBuilt.toLocaleString()}+`;
        }
    } catch (err) {
        console.warn('Stats fetch warning:', err);
    }
}

// 2. Fetch Programs & Pricing Matrix from Node API
async function fetchPrograms() {
    const grid = document.getElementById('program-grid');
    try {
        const response = await fetch('/api/programs');
        const result = await response.json();
        if (result.success) {
            state.programs = result.data;
            renderPrograms();
        }
    } catch (err) {
        grid.innerHTML = `<div class="error-msg">Failed to connect to Node.js server. Please ensure the server is running.</div>`;
    }
}

// Render Program Cards
function renderPrograms() {
    const grid = document.getElementById('program-grid');
    if (!grid) return;

    grid.innerHTML = state.programs.map(program => {
        const isHybrid = state.selectedMode === 'hybrid';
        let basePrice = isHybrid ? program.hybridPrice : program.onlinePrice;
        let finalPrice = basePrice;
        let promoAppliedText = '';

        // Apply local calculation matching backend
        if (state.appliedPromo) {
            if (state.appliedPromo.type === 'percent') {
                const discount = Math.round((basePrice * state.appliedPromo.value) / 100);
                finalPrice = Math.max(0, basePrice - discount);
            } else if (state.appliedPromo.type === 'flat') {
                finalPrice = Math.max(0, basePrice - state.appliedPromo.value);
            }
            promoAppliedText = `<div class="price-sub" style="color: #4ADE80; font-weight:600;"><i class="fa-solid fa-check"></i> ${state.appliedPromo.code} applied</div>`;
        }

        const formattedBase = `${program.symbol}${basePrice.toLocaleString()}`;
        const formattedFinal = `${program.symbol}${finalPrice.toLocaleString()}`;

        return `
            <div class="program-card ${program.popular ? 'popular-card' : ''}">
                ${program.popular ? '<div class="popular-badge">MOST POPULAR TRACK</div>' : ''}
                <div class="p-header">
                    <span class="p-duration">${program.durationWeeks} Weeks (${program.id === '3-month' ? '3 Months' : '6 Months'})</span>
                    <h3 class="p-title">${program.title}</h3>
                    <p class="p-tagline">${program.tagline}</p>
                </div>

                <div class="p-pricing-box">
                    <div class="price-main">
                        ${finalPrice < basePrice ? `<span class="strike-price">${formattedBase}</span>` : ''}
                        ${formattedFinal}
                    </div>
                    <div class="price-sub">Mode: <strong>${isHybrid ? 'Hybrid (Campus Access Included)' : 'Online Only'}</strong></div>
                    ${promoAppliedText}
                </div>

                <div class="p-courses-title">Included Courses:</div>
                <ul class="p-course-list">
                    ${program.courses.map(c => `
                        <li class="p-course-item">
                            <i class="fa-solid fa-circle-check"></i>
                            <div>
                                <strong>${c.name}</strong>
                                <div style="font-size:0.8rem; color:var(--text-muted);">${c.desc}</div>
                            </div>
                        </li>
                    `).join('')}
                </ul>

                <button class="btn btn-block ${program.popular ? 'btn-primary' : 'btn-glass'}" onclick="openEnrollModal('${program.id}')">
                    <i class="fa-solid fa-user-plus"></i> Enroll in ${program.id === '3-month' ? '3-Month' : '6-Month Track'}
                </button>
            </div>
        `;
    }).join('');
}

// Handle Online vs Hybrid Switcher
function handleModeToggle() {
    const isChecked = document.getElementById('modeToggle').checked;
    state.selectedMode = isChecked ? 'hybrid' : 'online';

    // Highlight text labels
    document.getElementById('label-online').classList.toggle('active', !isChecked);
    document.getElementById('label-hybrid').classList.toggle('active', isChecked);

    renderPrograms();
}

// Apply Promo Code via Node API
async function applyPromoCode() {
    const input = document.getElementById('promoInput').value.trim();
    const feedback = document.getElementById('promoFeedback');
    
    if (!input) {
        feedback.className = 'promo-feedback error';
        feedback.textContent = 'Please enter a valid promo code.';
        return;
    }

    try {
        const response = await fetch('/api/pricing/calculate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                programId: '6-month',
                mode: state.selectedMode,
                promoCode: input
            })
        });

        const res = await response.json();
        if (res.success && res.data.appliedPromo) {
            state.appliedPromo = res.data.appliedPromo;
            feedback.className = 'promo-feedback success';
            feedback.textContent = `🎉 Promo applied: ${res.data.appliedPromo.description} (Saved ${res.data.symbol}${res.data.discountAmount.toLocaleString()})`;
            renderPrograms();
        } else {
            feedback.className = 'promo-feedback error';
            feedback.textContent = 'Invalid promo code. Try "OFONI2026" or "EARLYBIRD".';
        }
    } catch (err) {
        feedback.className = 'promo-feedback error';
        feedback.textContent = 'Failed to validate promo code with Node server.';
    }
}

// 3. Fetch FAQs from Node API
async function fetchFaqs() {
    const accordion = document.getElementById('faq-accordion');
    try {
        const response = await fetch('/api/faqs');
        const res = await response.json();
        if (res.success) {
            accordion.innerHTML = res.data.map((faq, index) => `
                <div class="faq-item ${index === 0 ? 'active' : ''}" id="faq-${index}">
                    <div class="faq-header" onclick="toggleFaq(${index})">
                        <span>${faq.question}</span>
                        <i class="fa-solid fa-chevron-down faq-icon"></i>
                    </div>
                    <div class="faq-body">
                        ${faq.answer}
                    </div>
                </div>
            `).join('');
        }
    } catch (err) {
        accordion.innerHTML = '<p class="error-msg">Unable to load FAQs.</p>';
    }
}

function toggleFaq(index) {
    const item = document.getElementById(`faq-${index}`);
    const isActive = item.classList.contains('active');
    document.querySelectorAll('.faq-item').forEach(el => el.classList.remove('active'));
    if (!isActive) {
        item.classList.add('active');
    }
}

// 4. Modal Enrollment Logic
function openEnrollModal(programId = '6-month') {
    const modal = document.getElementById('enrollModal');
    const select = document.getElementById('m_program');
    if (select) select.value = programId;
    
    document.getElementById('m_mode').value = state.selectedMode;
    if (state.appliedPromo) {
        document.getElementById('m_promo').value = state.appliedPromo.code;
    }

    modal.classList.add('active');
    recalculateModalPrice();
}

function closeEnrollModal() {
    const modal = document.getElementById('enrollModal');
    modal.classList.remove('active');
}

// Recalculate Modal Pricing dynamically via Node server
async function recalculateModalPrice() {
    const programId = document.getElementById('m_program').value;
    const mode = document.getElementById('m_mode').value;
    const promoCode = document.getElementById('m_promo').value;

    try {
        const response = await fetch('/api/pricing/calculate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ programId, mode, promoCode })
        });
        const res = await response.json();
        if (res.success) {
            const d = res.data;
            document.getElementById('modalBasePrice').textContent = d.formattedBasePrice;
            document.getElementById('modalFinalPrice').textContent = d.formattedFinalPrice;

            const discountRow = document.getElementById('modalDiscountRow');
            if (d.discountAmount > 0) {
                discountRow.style.display = 'flex';
                document.getElementById('modalDiscountPrice').textContent = `-${d.symbol}${d.discountAmount.toLocaleString()}`;
            } else {
                discountRow.style.display = 'none';
            }
        }
    } catch (err) {
        console.warn('Modal calc error:', err);
    }
}

// Handle Modal Enrollment Submission to Node API
async function handleEnrollSubmit(e) {
    e.preventDefault();
    const btn = document.getElementById('enrollSubmitBtn');
    const resultDiv = document.getElementById('enrollmentResult');

    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting to Node.js...';

    const payload = {
        fullName: document.getElementById('m_name').value,
        email: document.getElementById('m_email').value,
        phone: document.getElementById('m_phone').value,
        programId: document.getElementById('m_program').value,
        learningMode: document.getElementById('m_mode').value,
        promoCode: document.getElementById('m_promo').value,
        paymentOption: document.getElementById('m_payment').value
    };

    try {
        const response = await fetch('/api/enroll', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const res = await response.json();
        if (res.success) {
            document.getElementById('enrollmentForm').style.display = 'none';
            resultDiv.style.display = 'block';
            resultDiv.innerHTML = `
                <div style="text-align:center;">
                    <div style="font-size: 3rem; color: #4ADE80;"><i class="fa-solid fa-circle-check"></i></div>
                    <h3 style="font-size: 1.4rem; font-weight:800; margin: 0.5rem 0;">Registration Confirmed!</h3>
                    <p style="color:var(--text-secondary); font-size:0.9rem;">Thank you, <strong>${res.data.fullName}</strong>. Your enrollment has been successfully recorded on our Node server.</p>
                    <div style="background: rgba(0,0,0,0.3); padding: 1rem; border-radius: 8px; margin: 1rem 0;">
                        <div>Registration Reference ID:</div>
                        <div class="res-id">${res.data.id}</div>
                        <div style="margin-top:0.4rem; font-size:0.85rem; color: var(--text-muted);">Program: ${res.data.programTitle} (${res.data.learningMode})</div>
                        <div style="font-size:0.85rem; color: var(--secondary); font-weight: 700;">Tuition: ${res.data.formattedTuition}</div>
                    </div>
                    <p style="font-size: 0.85rem; color: var(--text-muted);">A confirmation breakdown & payment link have been dispatched to <strong>${res.data.email}</strong>.</p>
                    <button class="btn btn-primary" onclick="location.reload()" style="margin-top:1rem;">Done</button>
                </div>
            `;
        } else {
            alert(`Error: ${res.message}`);
        }
    } catch (err) {
        alert('Network error communicating with Node.js backend.');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-lock"></i> Submit & Reserve Slot (Node.js API)';
    }
}

// 5. Handle Contact Form Submission
async function handleContactSubmit(e) {
    e.preventDefault();
    const btn = document.getElementById('contactSubmitBtn');
    const status = document.getElementById('contactStatus');

    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';

    const payload = {
        name: document.getElementById('c_name').value,
        email: document.getElementById('c_email').value,
        subject: document.getElementById('c_subject').value,
        message: document.getElementById('c_message').value
    };

    try {
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const res = await response.json();
        if (res.success) {
            status.style.color = '#4ADE80';
            status.textContent = `✅ ${res.message} (Reference Ticket: ${res.ticketId})`;
            document.getElementById('contactForm').reset();
        } else {
            status.style.color = '#F87171';
            status.textContent = `❌ ${res.message}`;
        }
    } catch (err) {
        status.style.color = '#F87171';
        status.textContent = '❌ Failed to connect to Node contact API.';
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Send Message (via Node API)';
    }
}

// Navigation helpers
function switchTrackTab(category) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    document.querySelectorAll('.module-card').forEach(card => {
        if (category === 'all' || card.dataset.category === category) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function scrollToCurriculum() {
    document.getElementById('curriculum').scrollIntoView({ behavior: 'smooth' });
}

function toggleMobileMenu() {
    const navLinks = document.getElementById('nav-links');
    const icon = document.getElementById('toggle-icon');
    if (!navLinks) return;
    
    const isActive = navLinks.classList.contains('active');

    if (isActive) {
        closeMobileMenu();
    } else {
        navLinks.classList.add('active');
        if (icon) {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-xmark');
        }
    }
}

function closeMobileMenu() {
    const navLinks = document.getElementById('nav-links');
    const icon = document.getElementById('toggle-icon');
    if (navLinks) {
        navLinks.classList.remove('active');
    }
    if (icon) {
        icon.classList.remove('fa-xmark');
        icon.classList.add('fa-bars');
    }
}

// Close mobile drawer when user clicks outside navbar
document.addEventListener('click', (e) => {
    const navbar = document.getElementById('navbar');
    if (navbar && !navbar.contains(e.target)) {
        closeMobileMenu();
    }
});

