require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const supabase = require('./supabaseClient');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// In-memory Database / State Management
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

const enrollmentsStore = [];
const contactStore = [];

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

// Node.js REST API Routes

// 1. Get all programs & pricing matrix
app.get('/api/programs', (req, res) => {
  res.json({
    success: true,
    data: programsData
  });
});

// 2. Calculate dynamic tuition and fees
app.post('/api/pricing/calculate', (req, res) => {
  const { programId, mode, promoCode } = req.body;
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

  res.json({
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
  });
});

// 3. Process enrollment submission
app.post('/api/enroll', async (req, res) => {
  const { fullName, email, phone, programId, learningMode, promoCode, paymentOption } = req.body;

  if (!fullName || !email || !phone || !programId || !learningMode) {
    return res.status(400).json({
      success: false,
      message: 'Please complete all required fields (Full Name, Email, Phone, Program, and Learning Mode).'
    });
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
  const registeredAt = new Date().toISOString();

  const enrollmentRecord = {
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
    registeredAt,
    status: 'Pending Payment Confirmation'
  };

  enrollmentsStore.push(enrollmentRecord);

  // Sync with Supabase Database if configured
  if (supabase) {
    try {
      const { data: dbData, error } = await supabase
        .from('enrollments')
        .insert([{
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
        }]);

      if (error) {
        console.error('⚠️ Supabase Enrollment Insert Error:', error.message);
      } else {
        console.log(`✅ Enrollment ${enrollmentId} persisted to Supabase.`);
      }
    } catch (err) {
      console.error('⚠️ Supabase Enrollment Error:', err.message);
    }
  }

  res.status(201).json({
    success: true,
    message: 'Enrollment submitted successfully! Welcome to OfoniTech AI Academy.',
    data: enrollmentRecord
  });
});

// 4. Contact / Inquiry Endpoint
app.post('/api/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: 'Name, email, and message content are required.'
    });
  }

  const ticketId = `OFONI-TICK-${Math.floor(100000 + Math.random() * 900000)}`;
  const inquiry = {
    ticketId,
    name,
    email,
    subject: subject || 'General Admission Inquiry',
    message,
    timestamp: new Date().toISOString()
  };

  contactStore.push(inquiry);

  // Sync with Supabase Database if configured
  if (supabase) {
    try {
      const { data: dbData, error } = await supabase
        .from('contact_inquiries')
        .insert([{
          ticket_id: ticketId,
          name: name,
          email: email,
          subject: subject || 'General Admission Inquiry',
          message: message,
          status: 'Open'
        }]);

      if (error) {
        console.error('⚠️ Supabase Contact Insert Error:', error.message);
      } else {
        console.log(`✅ Inquiry ticket ${ticketId} persisted to Supabase.`);
      }
    } catch (err) {
      console.error('⚠️ Supabase Contact Error:', err.message);
    }
  }

  res.status(201).json({
    success: true,
    message: 'Inquiry received! An OfoniTech admissions counselor will respond within 24 hours.',
    ticketId
  });
});

// 5. Get FAQs
app.get('/api/faqs', (req, res) => {
  const { category } = req.query;
  let result = faqsData;
  if (category) {
    result = faqsData.filter(f => f.category.toLowerCase() === category.toLowerCase());
  }
  res.json({
    success: true,
    count: result.length,
    data: result
  });
});

// 6. Academy Stats
app.get('/api/stats', async (req, res) => {
  let activeStudents = 450;
  if (supabase) {
    try {
      const { count, error } = await supabase
        .from('enrollments')
        .select('*', { count: 'exact', head: true });

      if (!error && count !== null) {
        activeStudents += count;
      }
    } catch (err) {
      console.error('⚠️ Supabase Stats Query Error:', err.message);
    }
  }

  res.json({
    success: true,
    stats: {
      activeStudents,
      totalGraduates: 1520,
      employmentRate: '94.8%',
      hubsAvailable: 2,
      projectsBuilt: 4800
    }
  });
});

// Serve frontend SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 OfoniTech AI Academy Node.js Server running at http://localhost:${PORT}`);
});
