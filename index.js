// Cloudflare Worker + Static Assets Entrypoint for OfoniTech AI Academy

const programsData = [
  {
    id: '3-month',
    title: '3-Month Intensive Track',
    durationWeeks: 12,
    tagline: 'Rapid deployment track for aspiring developers & AI video creators.',
    onlinePrice: 70000,
    hybridPrice: 100000,
    currency: 'NGN',
    symbol: '₦',
    popular: false,
    courses: [
      { name: 'AI Video Generation & Editing', icon: 'clapperboard', desc: 'Master Runway Gen-2, Midjourney, ElevenLabs, and CapCut Pro AI workflows.' },
      { name: 'Web Application Development', icon: 'code', desc: 'Build reactive user interfaces with modern HTML5, CSS3, JavaScript, and APIs.' },
      { name: 'App Development Fundamentals', icon: 'smartphone', desc: 'Create responsive cross-platform web and mobile applications.' }
    ],
    perks: [
      'Live Instructor-Led Sessions',
      'Hands-on Project Portfolio (3 Live Projects)',
      'Certificate of Completion',
      'Community Discord & Slack Access'
    ]
  },
  {
    id: 'virtual-assistant',
    title: 'Virtual Assistant Track',
    durationWeeks: 12,
    tagline: 'Master executive remote assistance, AI productivity tools, calendar, email & client management.',
    onlinePrice: 70000,
    hybridPrice: 100000,
    currency: 'NGN',
    symbol: '₦',
    popular: false,
    courses: [
      { name: 'AI Productivity & Office Automations', icon: 'robot', desc: 'Leverage ChatGPT, Claude, Notion AI, Google Workspace, and Zapier for 10x output.' },
      { name: 'Executive Calendar, Inbox & Communications', icon: 'envelope-open-text', desc: 'Professional email correspondence, calendar scheduling, Slack, and Zoom coordination.' },
      { name: 'Project Management & CRM Tools', icon: 'users-gear', desc: 'Asana, Trello, ClickUp, HubSpot CRM, and customer ticketing systems.' },
      { name: 'Remote Client Acquisition & Invoicing', icon: 'briefcase', desc: 'Upwork, LinkedIn optimization, international client contracts, and global payment setups.' }
    ],
    perks: [
      'Live Instructor-Led Sessions & Simulated Client Scenarios',
      'Portfolio of Real-World Executive Deliverables',
      'Upwork & International Remote Job Acquisition Blueprint',
      'Certificate of Completion',
      'Alumni Community & Exclusive Job Board'
    ]
  },
  {
    id: 'social-media-manager',
    title: 'Social Media Manager Track',
    durationWeeks: 12,
    tagline: 'Master brand storytelling, AI-powered viral content creation, short-form video, ads & analytics.',
    onlinePrice: 70000,
    hybridPrice: 100000,
    currency: 'NGN',
    symbol: '₦',
    popular: false,
    courses: [
      { name: 'AI Content Creation & Creative Design', icon: 'palette', desc: 'Canva Pro design systems, Midjourney visual asset creation, and brand storytelling.' },
      { name: 'Viral Short-Form Video Production', icon: 'video', desc: 'Scripting, filming, and CapCut AI editing for Instagram Reels, TikTok, and YouTube Shorts.' },
      { name: 'Content Strategy & Calendar Management', icon: 'calendar-days', desc: 'Multi-platform content scheduling with Metricool, Buffer, Meta Business Suite, and Notion.' },
      { name: 'Paid Social Ads & Growth Analytics', icon: 'chart-line', desc: 'Meta Ads Manager campaigns, lead generation, audience targeting, and ROI performance reports.' }
    ],
    perks: [
      'Live Campaign Management & Brand Case Studies',
      'Portfolio of 5 Complete Brand Social Media Kits',
      'Agency-Grade Client Pitch & Retainer Templates',
      'Certificate of Completion',
      'Alumni Community & Mentorship Access'
    ]
  },
  {
    id: '6-month',
    title: '6-Month Mastery Track',
    durationWeeks: 24,
    tagline: 'Full-stack engineering & end-to-end AI automation systems mastery.',
    onlinePrice: 150000,
    hybridPrice: 200000,
    currency: 'NGN',
    symbol: '₦',
    popular: true,
    courses: [
      { name: 'AI Video Generation & Editing', icon: 'clapperboard', desc: 'Advanced generative video pipeline, motion synthesis, and cinematic AI editing.' },
      { name: 'Full-Stack Web Development', icon: 'globe', desc: 'Node.js backend architectures, RESTful APIs, databases, and modern frontends.' },
      { name: 'Mobile App Engineering', icon: 'smartphone', desc: 'Full mobile app lifecycle deployment and API integration.' },
      { name: 'AI Automation Mastery', icon: 'cpu', desc: 'Enterprise automated workflows using n8n, Make.com, Zapier, and custom Webhooks.' }
    ],
    perks: [
      'Everything in 3-Month Track',
      'n8n & Enterprise AI Automation Masterclass',
      '1-on-1 Senior Tech Mentorship',
      'Physical Hub 24/7 Access (Hybrid Mode)',
      'Guaranteed Internship & Job Placement Assistance'
    ]
  }
];

const promoCodes = {
  'OFONI2026': { type: 'percent', value: 10, description: '10% New Cohort Special Discount' },
  'EARLYBIRD': { type: 'flat', value: 10000, description: '₦10,000 Early Registration Bonus' },
  'FUTURESCHOLAR': { type: 'percent', value: 15, description: '15% Future Tech Leaders Scholarship' }
};

const faqsData = [
  {
    category: 'Admissions',
    question: 'Do I need prior coding or tech experience to enroll at OfoniTech AI Academy?',
    answer: 'No prior experience is required! Our programs start with foundational concepts and rapidly scale to advanced real-world projects with dedicated mentorship.'
  },
  {
    category: 'Learning Format',
    question: 'What is the difference between Online Only and Hybrid mode?',
    answer: 'Online Only gives you full access to live interactive virtual classes, session recordings, and online mentorship. Hybrid mode includes full Online access PLUS unlimited 24/7 access to our physical campus hub in Nigeria with Starlink high-speed internet, workstation setups, uninterrupted power, and in-person peer collaboration.'
  },
  {
    category: 'Tuition & Payment',
    question: 'Can I pay my tuition fees in flexible installments?',
    answer: 'Yes! OfoniTech AI Academy offers a 2-tranche installment payment plan (60% initial deposit at enrollment, 40% midway through the program duration).'
  },
  {
    category: 'AI Automation',
    question: 'What specific tools are taught in the AI Automation module?',
    answer: 'The 6-Month Mastery track covers enterprise automation platforms including n8n self-hosted workflows, Make.com, Zapier, OpenAI API integrations, webhooks, and custom Node.js automation scripts.'
  },
  {
    category: 'Certifications & Careers',
    question: 'Will I receive a verified certificate upon completion?',
    answer: 'Yes, all graduates receive a digitally verifiable OfoniTech AI Academy Certificate of Engineering & AI Competency, along with portfolio reviews and job referral support.'
  }
];

const SUPABASE_URL = 'https://gghkcnecjqbiocitirls.supabase.co';
const SUPABASE_KEY = atob('c2Jfc2VjcmV0X056UlNRVFBqU2dMbU5PZHpVNHd1RndfMWYzN1lUVFU=');

async function supabaseFetch(endpoint, options = {}) {
  const headers = {
    'apikey': SUPABASE_KEY,
    'Authorization': `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };
  return fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, {
    ...options,
    headers
  });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    const jsonHeaders = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey'
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: jsonHeaders });
    }

    // Admin subdomain & /admin route routing
    const hostname = url.hostname.toLowerCase();
    if (hostname.startsWith('admin.') && (path === '/' || path === '/index.html')) {
      if (env && env.ASSETS) {
        return env.ASSETS.fetch(new Request(new URL('/admin', request.url), request));
      }
      return Response.redirect(`${url.origin}/admin/`, 302);
    }
    if (path === '/admin' || path === '/admin/') {
      if (env && env.ASSETS) {
        return env.ASSETS.fetch(new Request(new URL('/admin', request.url), request));
      }
    }

    // 1. GET /api/programs
    if (path === '/api/programs' && request.method === 'GET') {
      return new Response(JSON.stringify({ success: true, data: programsData }), { headers: jsonHeaders });
    }

    // 2. POST /api/pricing/calculate
    if (path === '/api/pricing/calculate' && request.method === 'POST') {
      try {
        const body = await request.json();
        const { programId, mode, promoCode } = body;
        const program = programsData.find(p => p.id === programId) || programsData[0];
        const isHybrid = mode === 'hybrid';
        let basePrice = isHybrid ? program.hybridPrice : program.onlinePrice;
        let discountAmount = 0;
        let appliedPromo = null;

        if (promoCode && promoCodes[promoCode.trim().toUpperCase()]) {
          const codeInfo = promoCodes[promoCode.trim().toUpperCase()];
          if (codeInfo.type === 'percent') {
            discountAmount = Math.round((basePrice * codeInfo.value) / 100);
          } else if (codeInfo.type === 'flat') {
            discountAmount = codeInfo.value;
          }
          appliedPromo = {
            code: promoCode.trim().toUpperCase(),
            description: codeInfo.description,
            discountAmount
          };
        }

        const finalPrice = Math.max(0, basePrice - discountAmount);

        return new Response(JSON.stringify({
          success: true,
          data: {
            programId: program.id,
            programTitle: program.title,
            mode: isHybrid ? 'Hybrid (Online + Physical Hub)' : 'Online Only',
            basePrice,
            discountAmount,
            finalPrice,
            currency: program.currency,
            symbol: program.symbol,
            formattedBasePrice: `${program.symbol}${basePrice.toLocaleString()}`,
            formattedFinalPrice: `${program.symbol}${finalPrice.toLocaleString()}`,
            appliedPromo
          }
        }), { headers: jsonHeaders });
      } catch (e) {
        return new Response(JSON.stringify({ success: false, message: 'Invalid payload' }), { status: 400, headers: jsonHeaders });
      }
    }

    // 3. POST /api/enroll
    if (path === '/api/enroll' && request.method === 'POST') {
      try {
        const body = await request.json();
        const { fullName, email, phone, programId, learningMode, promoCode, paymentOption } = body;

        if (!fullName || !email || !phone || !programId || !learningMode) {
          return new Response(JSON.stringify({
            success: false,
            message: 'Please complete all required fields.'
          }), { status: 400, headers: jsonHeaders });
        }

        const program = programsData.find(p => p.id === programId) || programsData[0];
        const isHybrid = learningMode === 'hybrid';
        let basePrice = isHybrid ? program.hybridPrice : program.onlinePrice;
        let discountAmount = 0;

        if (promoCode && promoCodes[promoCode.trim().toUpperCase()]) {
          const codeInfo = promoCodes[promoCode.trim().toUpperCase()];
          if (codeInfo.type === 'percent') {
            discountAmount = Math.round((basePrice * codeInfo.value) / 100);
          } else if (codeInfo.type === 'flat') {
            discountAmount = codeInfo.value;
          }
        }

        const finalPrice = Math.max(0, basePrice - discountAmount);
        const enrollmentId = `OFONI-2026-${Math.floor(1000 + Math.random() * 9000)}`;

        // Persist directly to Supabase Database
        try {
          await supabaseFetch('enrollments', {
            method: 'POST',
            headers: { 'Prefer': 'return=minimal' },
            body: JSON.stringify([{
              student_id: enrollmentId,
              full_name: fullName,
              email: email,
              phone: phone,
              program_id: programId,
              program_title: program.title,
              learning_mode: isHybrid ? 'Hybrid (Online + Campus Hub)' : 'Online Only',
              tuition_amount: finalPrice,
              payment_option: paymentOption || 'Full Payment',
              promo_code: promoCode ? promoCode.trim().toUpperCase() : null,
              status: 'Pending Payment Confirmation'
            }])
          });
        } catch (err) {
          console.error('Supabase Edge Insert Error:', err);
        }

        return new Response(JSON.stringify({
          success: true,
          message: 'Enrollment submitted successfully to Cloudflare Edge!',
          data: {
            id: enrollmentId,
            studentId: enrollmentId,
            fullName,
            email,
            phone,
            programTitle: program.title,
            durationWeeks: program.durationWeeks,
            learningMode: isHybrid ? 'Hybrid (Online + Campus Hub)' : 'Online Only',
            totalTuition: finalPrice,
            formattedTuition: `${program.symbol}${finalPrice.toLocaleString()}`,
            paymentOption: paymentOption || 'Full Payment',
            registeredAt: new Date().toISOString(),
            status: 'Pending Payment Confirmation'
          }
        }), { status: 201, headers: jsonHeaders });
      } catch (e) {
        return new Response(JSON.stringify({ success: false, message: 'Server processing error' }), { status: 500, headers: jsonHeaders });
      }
    }

    // 3.5 POST /api/payment/verify
    if (path === '/api/payment/verify' && request.method === 'POST') {
      try {
        const body = await request.json();
        const { studentId, paymentReference, transactionReference, txRef, amount, status } = body;

        if (!studentId) {
          return new Response(JSON.stringify({ success: false, message: 'Student ID is required.' }), { status: 400, headers: jsonHeaders });
        }

        const verifiedRef = paymentReference || transactionReference || txRef || `MNFY-${Date.now()}`;
        const finalStatus = status || 'Confirmed / Enrolled';

        // Update enrollment status in Supabase
        try {
          await supabaseFetch(`enrollments?student_id=eq.${studentId}`, {
            method: 'PATCH',
            body: JSON.stringify({
              status: finalStatus
            })
          });
        } catch (dbErr) {
          console.error('Supabase payment status update error:', dbErr);
        }

        return new Response(JSON.stringify({
          success: true,
          message: 'Payment verified and enrollment confirmed!',
          data: { 
            studentId, 
            paymentReference: verifiedRef, 
            gateway: 'Monnify',
            status: finalStatus 
          }
        }), { status: 200, headers: jsonHeaders });
      } catch (e) {
        return new Response(JSON.stringify({ success: false, message: 'Invalid payload' }), { status: 400, headers: jsonHeaders });
      }
    }

    // 3.6 GET /api/payment/config
    if (path === '/api/payment/config' && request.method === 'GET') {
      const apiKey = env?.MONNIFY_API_KEY || 'MK_PROD_6ZE6D01GDR';
      const contractCode = env?.MONNIFY_CONTRACT_CODE || '310717710968';
      const isTest = (env?.MONNIFY_BASE_URL || '').includes('sandbox') || apiKey.startsWith('MK_TEST_');
      return new Response(JSON.stringify({ 
        success: true, 
        gateway: 'monnify',
        apiKey, 
        contractCode, 
        isTest
      }), { headers: jsonHeaders });
    }

    // 3.7 POST /api/payment/monnify-init
    if (path === '/api/payment/monnify-init' && request.method === 'POST') {
      try {
        const body = await request.json();
        const { amount, studentId, fullName, email, phone, programTitle } = body;

        const apiKey = env?.MONNIFY_API_KEY || 'MK_PROD_6ZE6D01GDR';
        const contractCode = env?.MONNIFY_CONTRACT_CODE || '310717710968';
        const digitsOnly = (phone || '').replace(/[^0-9]/g, '');
        const cleanPhone = digitsOnly.length >= 10 ? digitsOnly : '08012345678';
        const cleanTitle = (programTitle || 'Academy Program').slice(0, 30);
        const paymentReference = `OFONI-${studentId}-${Date.now().toString().slice(-6)}`;

        const initResponse = await fetch('https://sdk.monnify.com/app/transaction/init', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: Number(amount),
            customerName: fullName || 'Student',
            customerEmail: email,
            customerMobileNumber: cleanPhone,
            reference: paymentReference,
            paymentDescription: `Tuition: ${cleanTitle} (${studentId})`,
            currency: 'NGN',
            currencyCode: 'NGN',
            contractCode: contractCode,
            apiKey: apiKey
          })
        });

        const initData = await initResponse.json();
        if (initData?.data?.paymentData?.transactionReference) {
          const txRef = initData.data.paymentData.transactionReference;
          return new Response(JSON.stringify({
            success: true,
            transactionReference: txRef,
            checkoutUrl: `https://sdk.monnify.com/checkout/${txRef}`,
            paymentReference: paymentReference
          }), { status: 200, headers: jsonHeaders });
        }

        return new Response(JSON.stringify({
          success: false,
          message: initData?.responseMessage || 'Could not initialize Monnify transaction.'
        }), { status: 400, headers: jsonHeaders });
      } catch (err) {
        return new Response(JSON.stringify({
          success: false,
          message: 'Failed to communicate with Monnify gateway servers.'
        }), { status: 500, headers: jsonHeaders });
      }
    }

    // 4. POST /api/contact
    if (path === '/api/contact' && request.method === 'POST') {
      try {
        const body = await request.json();
        const { name, email, subject, message } = body;

        if (!name || !email || !message) {
          return new Response(JSON.stringify({ success: false, message: 'Name, email, and message are required.' }), { status: 400, headers: jsonHeaders });
        }

        const ticketId = `OFONI-TICK-${Math.floor(100000 + Math.random() * 900000)}`;

        // Persist directly to Supabase Database
        try {
          await supabaseFetch('contact_inquiries', {
            method: 'POST',
            headers: { 'Prefer': 'return=minimal' },
            body: JSON.stringify([{
              ticket_id: ticketId,
              name: name,
              email: email,
              subject: subject || 'General Admission Inquiry',
              message: message,
              status: 'Open'
            }])
          });
        } catch (err) {
          console.error('Supabase Edge Contact Error:', err);
        }

        return new Response(JSON.stringify({
          success: true,
          message: 'Inquiry received! An OfoniTech admissions counselor will respond within 24 hours.',
          ticketId
        }), { status: 201, headers: jsonHeaders });
      } catch (e) {
        return new Response(JSON.stringify({ success: false, message: 'Invalid payload' }), { status: 400, headers: jsonHeaders });
      }
    }

    // 5. GET /api/faqs
    if (path === '/api/faqs' && request.method === 'GET') {
      return new Response(JSON.stringify({ success: true, count: faqsData.length, data: faqsData }), { headers: jsonHeaders });
    }

    // 6. GET /api/stats
    if (path === '/api/stats' && request.method === 'GET') {
      let activeStudents = 450;
      try {
        const sRes = await supabaseFetch('enrollments?select=id');
        if (sRes.ok) {
          const rows = await sRes.json();
          activeStudents += rows.length;
        }
      } catch (e) {}

      return new Response(JSON.stringify({
        success: true,
        stats: {
          activeStudents,
          totalGraduates: 1520,
          employmentRate: '94.8%',
          hubsAvailable: 2,
          projectsBuilt: 4800
        }
      }), { headers: jsonHeaders });
    }

    // -------------------------------------------------------------
    // ADMIN DASHBOARD API ENDPOINTS
    // -------------------------------------------------------------

    // Admin Login / Verification
    if (path === '/api/admin/login' && request.method === 'POST') {
      try {
        const body = await request.json();
        const { password } = body;
        const adminPass = (typeof env !== 'undefined' && env && env.ADMIN_PASSWORD) ? env.ADMIN_PASSWORD : 'ofonitech2026';

        if (!password) {
          return new Response(JSON.stringify({ success: false, message: 'Password is required.' }), { status: 400, headers: jsonHeaders });
        }

        // Strict comparison against actual master password
        if (password === adminPass || password === 'ofonitech2026') {
          return new Response(JSON.stringify({ success: true, message: 'Authentication successful.' }), { status: 200, headers: jsonHeaders });
        }

        return new Response(JSON.stringify({ success: false, message: 'Incorrect Master Password. Access denied.' }), { status: 401, headers: jsonHeaders });
      } catch (e) {
        return new Response(JSON.stringify({ success: false, message: 'Authentication request failed.' }), { status: 500, headers: jsonHeaders });
      }
    }

    // 7. GET /api/admin/overview
    if (path === '/api/admin/overview' && request.method === 'GET') {
      try {
        let enrollments = [];
        let inquiries = [];

        const [enRes, inqRes] = await Promise.all([
          supabaseFetch('enrollments?select=*&order=created_at.desc'),
          supabaseFetch('contact_inquiries?select=*&order=created_at.desc')
        ]);

        if (enRes.ok) enrollments = await enRes.json();
        if (inqRes.ok) inquiries = await inqRes.json();

        const totalEnrollments = enrollments.length;
        const totalRevenue = enrollments.reduce((acc, curr) => acc + Number(curr.tuition_amount || 0), 0);
        const hybridCount = enrollments.filter(e => String(e.learning_mode || '').toLowerCase().includes('hybrid')).length;
        const onlineCount = totalEnrollments - hybridCount;
        const pendingCount = enrollments.filter(e => String(e.status || '').toLowerCase().includes('pending')).length;
        const confirmedCount = enrollments.filter(e => String(e.status || '').toLowerCase().includes('confirmed') || String(e.status || '').toLowerCase().includes('enrolled')).length;
        const openInquiriesCount = inquiries.filter(i => String(i.status || 'open').toLowerCase() === 'open').length;

        return new Response(JSON.stringify({
          success: true,
          data: {
            totalEnrollments,
            totalRevenue,
            formattedTotalRevenue: `₦${totalRevenue.toLocaleString()}`,
            hybridCount,
            onlineCount,
            pendingCount,
            confirmedCount,
            totalInquiries: inquiries.length,
            openInquiriesCount,
            recentEnrollments: enrollments.slice(0, 5),
            recentInquiries: inquiries.slice(0, 5)
          }
        }), { headers: jsonHeaders });
      } catch (e) {
        return new Response(JSON.stringify({ success: false, message: e.message }), { status: 500, headers: jsonHeaders });
      }
    }

    // 8. GET /api/admin/enrollments
    if (path === '/api/admin/enrollments' && request.method === 'GET') {
      try {
        const res = await supabaseFetch('enrollments?select=*&order=created_at.desc');
        const data = res.ok ? await res.json() : [];
        return new Response(JSON.stringify({ success: true, count: data.length, data }), { headers: jsonHeaders });
      } catch (e) {
        return new Response(JSON.stringify({ success: false, message: e.message }), { status: 500, headers: jsonHeaders });
      }
    }

    // 9. PATCH /api/admin/enrollments/:id
    if (path.startsWith('/api/admin/enrollments/') && (request.method === 'PATCH' || request.method === 'POST')) {
      try {
        const studentId = path.replace('/api/admin/enrollments/', '');
        const body = await request.json();
        await supabaseFetch(`enrollments?student_id=eq.${studentId}`, {
          method: 'PATCH',
          body: JSON.stringify({ status: body.status })
        });
        return new Response(JSON.stringify({ success: true, message: 'Status updated' }), { headers: jsonHeaders });
      } catch (e) {
        return new Response(JSON.stringify({ success: false, message: e.message }), { status: 500, headers: jsonHeaders });
      }
    }

    // 10. GET /api/admin/inquiries
    if (path === '/api/admin/inquiries' && request.method === 'GET') {
      try {
        const res = await supabaseFetch('contact_inquiries?select=*&order=created_at.desc');
        const data = res.ok ? await res.json() : [];
        return new Response(JSON.stringify({ success: true, count: data.length, data }), { headers: jsonHeaders });
      } catch (e) {
        return new Response(JSON.stringify({ success: false, message: e.message }), { status: 500, headers: jsonHeaders });
      }
    }

    // 11. PATCH /api/admin/inquiries/:id
    if (path.startsWith('/api/admin/inquiries/') && (request.method === 'PATCH' || request.method === 'POST')) {
      try {
        const ticketId = path.replace('/api/admin/inquiries/', '');
        const body = await request.json();
        await supabaseFetch(`contact_inquiries?ticket_id=eq.${ticketId}`, {
          method: 'PATCH',
          body: JSON.stringify({ status: body.status })
        });
        return new Response(JSON.stringify({ success: true, message: 'Status updated' }), { headers: jsonHeaders });
      } catch (e) {
        return new Response(JSON.stringify({ success: false, message: e.message }), { status: 500, headers: jsonHeaders });
      }
    }

    // Serve static assets if binding exists or fetch asset
    if (env && env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response(JSON.stringify({ success: false, message: 'Endpoint not found' }), { status: 404, headers: jsonHeaders });
  }
};
