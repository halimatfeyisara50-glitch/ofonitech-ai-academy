# AURA AI Academy Web Application Documentation

An interactive, high-converting Node.js-powered web application and API platform for **AURA AI Academy**, a modern tech and AI institute offering intensive training in video creation, web/mobile software engineering, and AI automation.

---

## 🚀 Key Features

* **Node.js & Express REST Backend**: Replaced legacy client-only Vanilla JS with a scalable Node.js server architecture managing program data, dynamic fee calculation, enrollment persistence, and support ticketing.
* **Interactive Pricing & Mode Switcher**: Toggles tuition between **Online Only** and **Hybrid (Online + Physical Campus Hub)** modes, with real-time fee calculation, promo code verification, and savings display.
* **Dynamic Node Enrollment Engine**: API endpoint (`POST /api/enroll`) validates student registration, handles discount promo codes (`AURA2026`, `EARLYBIRD`), generates unique student IDs (e.g. `AURA-2026-8941`), and calculates tuition installments.
* **Course & Curriculum Matrix**: Clear breakdown of 3-Month Intensive and 6-Month Mastery tracks, highlighting enterprise AI Automation with n8n, Make.com, Zapier, and custom Webhooks.
* **Modern Dark-Mode AI Aesthetics**: Custom glassmorphism overlays, ambient glow orbs, responsive CSS Grid layout, and Google *Plus Jakarta Sans* typography.
* **Server-Side API Endpoints**:
  * `GET /api/programs`: Program matrix & course tracks.
  * `POST /api/pricing/calculate`: Real-time tuition & promo calculation.
  * `POST /api/enroll`: Live enrollment processing.
  * `POST /api/contact`: Support message ticket generation.
  * `GET /api/faqs`: Accordion FAQ entries.
  * `GET /api/stats`: Academy stats and graduate metrics.

---

## 📊 Programs & Tuition Matrix

Tuition fees are displayed in Nigerian Naira (**₦**):

| Program Track | Duration | Online Only | Hybrid (Online + Physical Hub) | Included Courses |
| :--- | :--- | :--- | :--- | :--- |
| **3-Month Intensive** | 12 Weeks | **₦70,000** | **₦100,000** | • AI Video Generation & Editing<br>• Web Application Development<br>• App Development Fundamentals |
| **6-Month Mastery** | 24 Weeks | **₦150,000** | **₦200,000** | • AI Video Generation & Editing<br>• Web Application Development<br>• App Development<br>• **AI Automation Systems (n8n, Make.com, Zapier)** |

---

## 🛠 Tech Stack & Dependencies

* **Node.js (v20+) & Express.js**: Server runtime, REST API route dispatching, and static file middleware.
* **HTML5**: Semantic markup for accessibility and structure.
* **Custom Vanilla CSS**: Responsive Dark-Mode AI styling, glassmorphism overlays, ambient radial glows, and CSS grid flex layouts.
* **FontAwesome / Lucide Icons**: Modern SVG icon set.
* **Asynchronous Fetch API**: Frontend client consuming Node.js REST endpoints without external frontend dependencies.
* **Google Fonts**: *Plus Jakarta Sans* tech typography.

---

## 📁 Project Structure

```text
aura-ai-academy/
├── package.json                   # Node.js project manifest & dependencies
├── server.js                      # Express.js server & REST API controller
├── aura_ai_academy_documentation.md # Updated project documentation
├── README.md                      # Quickstart guide
└── public/                        # Static web assets served by Node.js
    ├── index.html                 # Main web application single-page interface
    ├── css/
    │   └── styles.css             # Glassmorphism & AI dark theme stylesheet
    └── js/
        └── app.js                 # Frontend REST API client for Node.js engine
```

---

## ⚙️ How to Run

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start the Node.js Server**:
   ```bash
   npm start
   ```
   *For development with auto-reload:*
   ```bash
   npm run dev
   ```

3. **Access the Web App**:
   Open `http://localhost:3000` in your web browser.

---

## 📞 Support & Contact

* **Phone / WhatsApp**: +234 800 AURA AI (0800 2872 24)
* **Email**: admissions@auraai.academy
* **Location**: Lagos & Abuja Campus Hubs, Nigeria (Online & Physical Hub)
