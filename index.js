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

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    const jsonHeaders = {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: jsonHeaders });
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

        return new Response(JSON.stringify({
          success: true,
          message: 'Enrollment submitted successfully to Cloudflare Edge!',
          data: {
            id: enrollmentId,
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

    // 4. POST /api/contact
    if (path === '/api/contact' && request.method === 'POST') {
      try {
        const body = await request.json();
        const { name, email, subject, message } = body;

        if (!name || !email || !message) {
          return new Response(JSON.stringify({ success: false, message: 'Name, email, and message are required.' }), { status: 400, headers: jsonHeaders });
        }

        const ticketId = `OFONI-TICK-${Math.floor(100000 + Math.random() * 900000)}`;
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
      return new Response(JSON.stringify({
        success: true,
        stats: {
          activeStudents: 450,
          totalGraduates: 1520,
          employmentRate: '94.8%',
          hubsAvailable: 2,
          projectsBuilt: 4800
        }
      }), { headers: jsonHeaders });
    }

    // Serve static assets if binding exists or fetch asset
    if (env && env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response(JSON.stringify({ success: false, message: 'Endpoint not found' }), { status: 404, headers: jsonHeaders });
  }
};
