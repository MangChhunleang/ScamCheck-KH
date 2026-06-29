import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { analyzeThreat } from "./src/analyzer";

// Load environment variables. Vite auto-loads .env.local for VITE_ vars on the
// frontend, but the Node server uses dotenv — which only reads `.env` by default.
// Load `.env.local` first (it wins), then `.env`, so server-side secrets like
// GEMINI_API_KEY placed in .env.local are picked up. In production (e.g.
// DigitalOcean) env vars are injected by the platform and these files are absent,
// which is harmless.
dotenv.config({ path: [".env.local", ".env"] });

const app = express();
// Use the platform-provided port in production (e.g. DigitalOcean App Platform
// injects PORT); fall back to 3000 for local development.
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize Gemini SDK with User-Agent for tracking
const geminiApiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (geminiApiKey) {
  ai = new GoogleGenAI({
    apiKey: geminiApiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
} else {
  console.warn("WARNING: GEMINI_API_KEY environment variable is missing. Running in rule-based fallback mode.");
}

/**
 * Sanitizes the user content before sending it to Gemini, replacing sensitive information
 * like OTPs, PINs, passwords, emails, phone numbers, bank details, or ID numbers with placeholders.
 */
export function sanitizeForAI(content: string): string {
  if (!content) return "";
  let sanitized = content;

  // 1. Email addresses
  sanitized = sanitized.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, '[REDACTED_EMAIL]');

  // 2. Passwords with labels (e.g. password: 123, pass: abc, លេខសម្ងាត់: xyz, សម្ងាត់ = abc)
  sanitized = sanitized.replace(/(password|pass|លេខសម្ងាត់|សម្ងាត់)\s*[:=៖\-]\s*\S+/gi, (match, label) => {
    return `${label}: [REDACTED_PASSWORD]`;
  });

  // 3. PIN numbers with labels (e.g. pin: 1234, pin = 5555)
  sanitized = sanitized.replace(/(pin)\s*[:=៖\-]\s*\S+/gi, (match, label) => {
    return `${label}: [REDACTED_PIN]`;
  });

  // 4. OTP codes with labels (e.g. otp: 123456, code: 9999, កូដ: 111, លេខកូដ: 222)
  sanitized = sanitized.replace(/(otp|code|កូដ|លេខកូដ)\s*[:=៖\-]\s*\S+/gi, (match, label) => {
    return `${label}: [REDACTED_OTP]`;
  });

  // 5. Phone numbers (e.g. standard Cambodian +855 or 0 followed by 8-9 digits)
  sanitized = sanitized.replace(/(?:\+855|0)\s*\d{1,3}\s*\d{3,4}\s*\d{3,4}\b/g, '[REDACTED_PHONE]');
  // Also match generic international or standalone phone sequences of 8-12 digits that might be phone numbers
  sanitized = sanitized.replace(/\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g, '[REDACTED_PHONE]');

  // 6. Standalone 4-digit and 6-digit number patterns (common for PINs and OTPs)
  sanitized = sanitized.replace(/\b\d{6}\b/g, '[REDACTED_OTP]');
  sanitized = sanitized.replace(/\b\d{4}\b/g, '[REDACTED_PIN]');
  sanitized = sanitized.replace(/\b\d{5,8}\b/g, '[REDACTED_OTP]');

  // 7. Long ID-like numbers (9-10 digits)
  sanitized = sanitized.replace(/\b\d{9,10}\b/g, '[REDACTED_ID]');

  // 8. Long bank-account-like numbers (11-18 digits)
  sanitized = sanitized.replace(/\b\d{11,18}\b/g, '[REDACTED_BANK_INFO]');

  return sanitized;
}

// Helper for offline/fallback rule-based explanations in both languages
function getFallbackExplanations(detectedType: string) {
  let summary_km = "សារនេះហាក់បីដូចជាធម្មតា ប៉ុន្តែសូមបន្តប្រុងប្រយ័ត្នជានិច្ច។";
  let summary_en = "This message appears normal, but please continue to stay alert.";
  let reasons_km = ["ប្រព័ន្ធស្វ័យប្រវត្តិតាមច្បាប់ដំបូងមិនបានរកឃើញសញ្ញាគួរឱ្យសង្ស័យណាមួយទេ។"];
  let reasons_en = ["The automated scanner did not find any immediate warning signals."];
  let safe_next_steps_km = [
    "កុំផ្ញើលុយ ឬកក់ប្រាក់មុនឱ្យសោះ។",
    "កុំចែករំលែកលេខកូដសម្ងាត់ OTP, កូដ PIN ឬលេខសម្ងាត់ធនាគារ។",
    "ទាក់ទងទៅធនាគារ ឬក្រុមហ៊ុនផ្លូវការដើម្បីផ្ទៀងផ្ទាត់។"
  ];
  let safe_next_steps_en = [
    "Do not send money or prepay any fees.",
    "Do not share OTP codes, bank PINs, or passwords.",
    "Verify directly through the bank or company's official channels."
  ];

  if (detectedType === "Bank / OTP Scam") {
    summary_km = "គណនីធនាគាររបស់អ្នកអាចនឹងស្ថិតក្នុងគ្រោះថ្នាក់! សារនេះសួររកព័ត៌មានសម្ងាត់គណនី។";
    summary_en = "Your bank account might be in danger! This message asks for highly private credentials.";
    reasons_km = ["សារនេះសួររកលេខកូដសម្ងាត់ OTP លេខ PIN ឬព័ត៌មានគណនីធនាគារ ដែលធនាគារពិតប្រាកដមិនដែលសួររកឡើយ។"];
    reasons_en = ["This message asks for OTP, PIN, or bank credentials, which real banks never request via SMS or chat."];
    safe_next_steps_km = [
      "កុំផ្ញើលេខកូដ OTP ឬលេខសម្ងាត់ទៅឱ្យនរណាម្នាក់ឡើយ។",
      "ទាក់ទងធនាគាររបស់អ្នកភ្លាមៗតាមរយៈលេខទូរស័ព្ទផ្លូវការ។",
      "កុំចុចលើតំណភ្ជាប់ណាដែលផ្ញើមកជាមួយសារនេះ។",
      "កុំចែករំលែក OTP, Password ឬ PIN"
    ];
    safe_next_steps_en = [
      "NEVER share OTP codes or passwords with anyone.",
      "Contact your bank immediately via their official customer service number.",
      "Do not click on any links sent with this message.",
      "Never share OTP, password, or PIN"
    ];
  } else if (detectedType === "Fake Job Scam") {
    summary_km = "នេះជាការផ្តល់ការងារគួរឱ្យសង្ស័យ ដែលទាមទារឱ្យអ្នកបង់ប្រាក់ជាមុន។";
    summary_en = "This is a highly suspicious job offer requesting upfront fees before you begin.";
    reasons_km = ["ក្រុមហ៊ុនពិតប្រាកដមិនដែលតម្រូវឱ្យបង់ថ្លៃចុះឈ្មោះ ថ្លៃបណ្តុះបណ្តាល ឬកក់ប្រាក់មុនឡើយ។"];
    reasons_en = ["Legitimate employers never ask for registration fees, training fees, or upfront deposits."];
    safe_next_steps_km = [
      "កុំផ្ញើប្រាក់ដើម្បីទទួលបានការងារធ្វើឡើយ។",
      "សួររកអ៊ីមែលផ្លូវការ និងអាសយដ្ឋានពិតប្រាកដរបស់ក្រុមហ៊ុន។",
      "ស្វែងរកព័ត៌មានក្រុមហ៊ុននៅលើទំព័រផ្លូវការ ឬសួរមិត្តភក្តិ។",
      "កុំចែករំលែក OTP, Password ឬ PIN"
    ];
    safe_next_steps_en = [
      "Do not send any money to secure a job.",
      "Ask for the official company email and physical address.",
      "Research the company on official registration websites or official social media.",
      "Never share OTP, password, or PIN"
    ];
  } else if (detectedType === "KHQR / Payment Scam") {
    summary_km = "សូមប្រុងប្រយ័ត្នជាមួយ Screenshot ទូទាត់លុយនេះ! វាអាចជារូបភាពកាត់ត ឬក្លែងក្លាយ។";
    summary_en = "Be careful with this payment receipt screenshot! It might be edited or fake.";
    reasons_km = [
      "វាអាចជារូបភាពកាត់តតាមកម្មវិធីដើម្បីបោកប្រាស់អ្នកលក់។",
      "ការផ្ញើតែរូបភាព Screenshot មិនមែនជាការធានាថាប្រាក់បានចូលគណនីរួចរាល់នោះទេ។"
    ];
    reasons_en = [
      "It might be a receipt image edited with software to deceive the seller.",
      "Sending only a screenshot does not guarantee that the money has entered your account."
    ];
    safe_next_steps_km = [
      "ចូលពិនិត្យកម្មវិធីធនាគាររបស់អ្នកផ្ទាល់ ដើម្បីដឹងថាប្រាក់បានចូលពិតប្រាកដ។",
      "កុំផ្ញើទំនិញភ្លាមៗមុនពេលផ្ទៀងផ្ទាត់សមតុល្យគណនីធនាគារឡើងវិញ។",
      "កុំចែករំលែក OTP, Password ឬ PIN"
    ];
    safe_next_steps_en = [
      "Always open and verify with your bank app directly to see if the money has cleared.",
      "Do not ship the items until your real bank statement balance is verified.",
      "Never share OTP, password, or PIN"
    ];
  } else if (detectedType === "Online Shopping Scam") {
    summary_km = "ការទិញទំនិញអនឡាញដែលមានហានិភ័យខ្ពស់ ព្រោះតម្រូវឱ្យវេរលុយកក់មុន។";
    summary_en = "A high-risk online purchase scenario requiring upfront non-refundable payment.";
    reasons_km = ["ការទាមទារឱ្យវេរលុយមុនពេលដឹកជញ្ជូន ដោយគ្មានប្រព័ន្ធធានាសុវត្ថិភាព អាចមានហានិភ័យខ្ពស់។"];
    reasons_en = ["Sellers asking for upfront payment before shipping without trusted escrow carries a high risk."];
    safe_next_steps_km = [
      "ជ្រើសរើសការទូទាត់ពេលទំនិញមកដល់ (Cash on Delivery)។",
      "ពិនិត្យមើលប្រវត្តិនៃការលក់របស់ទំព័រនោះ មតិយោបល់ និងថ្ងៃបង្កើតទំព័រ។",
      "កុំទិញទំនិញដែលមានតម្លៃថោកខុសពីធម្មតាពេក។",
      "កុំចែករំលែក OTP, Password ឬ PIN"
    ];
    safe_next_steps_en = [
      "Choose Cash on Delivery (COD) whenever possible.",
      "Check the shop's page creation history, reviews, and client feedback.",
      "Be highly suspicious of items priced far below market rate.",
      "Never share OTP, password, or PIN"
    ];
  } else if (detectedType === "Investment Scam") {
    summary_km = "នេះជាសញ្ញានៃការវិនិយោគបោកប្រាស់ ដែលសន្យាផ្តល់ការចំណេញទ្វេដងគ្មានហានិភ័យ។";
    summary_en = "This is a classic high-yield investment scam promising guaranteed profit with zero risk.";
    reasons_km = ["ការសន្យាផ្តល់ការចំណេញខ្ពស់ទ្វេដង ឬប្រាក់ចំណូលធានាប្រចាំថ្ងៃ គឺជាសញ្ញានៃការបោកប្រាស់។"];
    reasons_en = ["Promises of guaranteed high returns or daily passive income are classic financial fraud signals."];
    safe_next_steps_km = [
      "កុំចូលរួមក្រុមវិនិយោគតេឡេក្រាម ឬផ្ញើលុយសាកល្បង។",
      "ចងចាំថា៖ ប្រសិនបើវាស្តាប់ទៅល្អពេក គ្មានការប្រឹងប្រែង នោះវាគឺជាការបោកប្រាស់។",
      "កុំចែករំលែកព័ត៌មានហិរញ្ញវត្ថុផ្ទាល់ខ្លួនរបស់អ្នក។",
      "កុំចែករំលែក OTP, Password ឬ PIN"
    ];
    safe_next_steps_en = [
      "Do not join Telegram investment groups or send 'test' money.",
      "Remember: if it sounds too good to be true, it almost certainly is.",
      "Never share your private financial details with strangers.",
      "Never share OTP, password, or PIN"
    ];
  } else if (detectedType === "Prize Scam") {
    summary_km = "ការឈ្នះរង្វាន់ដោយមិនបានចូលរួមលេង គឺជាការបោកប្រាស់យកថ្លៃសេវា។";
    summary_en = "Winning a prize/lottery without ever joining is a standard fee-advancement scam.";
    reasons_km = ["ការឈ្នះរង្វាន់ដោយមិនបានចូលរួមលេង ឬតម្រូវឱ្យបង់ថ្លៃសេវាដើម្បីបើករង្វាន់ គឺជាការបោកប្រាស់។"];
    reasons_en = ["Unsolicited lottery winnings or prize notifications that demand a delivery/processing fee are scams."];
    safe_next_steps_km = [
      "កុំផ្ញើប្រាក់ថ្លៃសេវា ឬកក់ប្រាក់ដើម្បីបើករង្វាន់ឡើយ។",
      "ពិនិត្យផ្ទៀងផ្ទាត់ដោយផ្ទាល់ជាមួយទំព័រផ្លូវការរបស់ក្រុមហ៊ុន។",
      "កុំផ្តល់ព័ត៌មានអត្តសញ្ញាណប័ណ្ណ ឬគណនីធនាគារ។",
      "កុំចែករំលែក OTP, Password ឬ PIN"
    ];
    safe_next_steps_en = [
      "Do not send any 'processing' or 'delivery' fees to claim a prize.",
      "Verify directly with the brand's verified (blue badge) social media profiles.",
      "Never share pictures of your ID card or banking details.",
      "Never share OTP, password, or PIN"
    ];
  } else if (detectedType === "Account Security Scam") {
    summary_km = "ការគំរាមចាក់សោគណនីបន្ទាន់ ដើម្បីបន្លាចអ្នកឱ្យភ័យខ្លាចរួចធ្វើតាមពួកគេ។";
    summary_en = "An urgent warning threat of account suspension designed to make you panic.";
    reasons_km = ["ការព្រមានបន្ទាន់ឱ្យចាក់សោគណនី ឬគណនីត្រូវខ្ទាស់ គឺជាបច្ចេកទេសបន្លាចដើម្បីឱ្យអ្នកភ័យស្លន់ស្លោ។"];
    reasons_en = ["Urgent warnings about frozen or locked accounts designed to cause panic are standard phishing tactics."];
    safe_next_steps_km = [
      "កុំចុចលើតំណភ្ជាប់ក្នុងសារបន្ទាន់នោះឡើយ។",
      "ចូលទៅកាន់កម្មវិធីផ្លូវការ ឬវាយវិបសាយផ្លូវការដោយផ្ទាល់ដើម្បីពិនិត្យ។",
      "ទាក់ទងផ្នែកបំរើអតិថិជនរបស់ធនាគារ ឬក្រុមហ៊ុនដើម្បីសួរនាំ។",
      "កុំចែករំលែក OTP, Password ឬ PIN"
    ];
    safe_next_steps_en = [
      "Do not click on links in urgent or threatening text messages.",
      "Log into the official app or website directly, never through the message link.",
      "Call the service provider's official support line to verify.",
      "Never share OTP, password, or PIN"
    ];
  } else if (detectedType === "Suspicious Link") {
    summary_km = "សារនេះមានផ្ទុកតំណភ្ជាប់គួរឱ្យសង្ស័យ ដែលអាចលួចគណនីរបស់អ្នក។";
    summary_en = "This message contains a suspicious link that might attempt to hijack your account.";
    reasons_km = ["សារនេះមានផ្ទុកតំណភ្ជាប់មិនច្បាស់លាស់ ដែលអាចនាំទៅរកការលួចគណនី ឬចម្លងមេរោគ។"];
    reasons_en = ["The message contains unsolicited hyperlinks which could lead to phishing sites or malware downloads."];
    safe_next_steps_km = [
      "ជៀសវាងការចុចលើតំណភ្ជាប់នោះ។ ពិនិត្យមើលអក្ខរាវិរុទ្ធឈ្មោះវិបសាយឱ្យបានហ្មត់ចត់។",
      "កុំតំឡើងកម្មវិធី APK ណាមួយ ឬចុះឈ្មោះលេខទូរស័ព្ទលើវិបសាយមិនស្គាល់អត្តសញ្ញាណ។",
      "លុបសារនោះចោលដើម្បីសុវត្ថិភាព។",
      "កុំចែករំលែក OTP, Password ឬ PIN"
    ];
    safe_next_steps_en = [
      "Avoid clicking the link. Carefully inspect the spelling of the domain name.",
      "Do not install any APK files or register your phone number on unknown sites.",
      "Delete the message to prevent accidental clicks.",
      "Never share OTP, password, or PIN"
    ];
  } else if (detectedType === "Normal Safe Message") {
    summary_km = "សារនេះហាក់ដូចជាមានសុវត្ថិភាព និងជាសារធម្មតា។";
    summary_en = "This message seems safe and normal, with no scam signals detected.";
    reasons_km = ["មិនមានសញ្ញាគួរឱ្យសង្ស័យ ឬពាក្យគន្លឹះបោកប្រាស់ត្រូវបានរកឃើញឡើយ។"];
    reasons_en = ["No warning words, critical bank threats, or deposit demands were detected."];
    safe_next_steps_km = [
      "អ្នកអាចឆ្លើយតបធម្មតា ប៉ុន្តែសូមកុំផ្តល់ព័ត៌មានផ្ទាល់ខ្លួនដែលមិនចាំបាច់។",
      "កុំចែករំលែក OTP, Password ឬ PIN"
    ];
    safe_next_steps_en = [
      "You may reply normally, but remain careful and never share private codes.",
      "Never share OTP, password, or PIN"
    ];
  }

  return {
    summary_km,
    summary_en,
    reasons_km,
    reasons_en,
    safe_next_steps_km,
    safe_next_steps_en,
    disclaimer_km: "ឧបករណ៍នេះផ្តល់ការណែនាំសុវត្ថិភាពប៉ុណ្ណោះ មិនមែនជាសេចក្តីសម្រេចផ្លូវច្បាប់ ធនាគារ ឬប៉ូលីសទេ។ សូមផ្ទៀងផ្ទាត់ជាមួយប្រភពផ្លូវការជានិច្ច។",
    disclaimer_en: "This tool gives safety guidance only. It is not a final legal, banking, or police decision. Always verify with official sources."
  };
}

// API endpoint to analyze a message
app.post("/api/check", async (req, res) => {
  try {
    const { content, lang } = req.body;

    if (typeof content !== "string") {
      return res.status(400).json({ error: "Content must be a string." });
    }
    if (!content || content.trim() === "") {
      return res.status(400).json({ error: "Content cannot be empty." });
    }
    if (content.length > 2500) {
      return res.status(400).json({ error: "Content is too long. Maximum length is 2500 characters." });
    }

    // Validate language parameter if supplied
    if (lang !== undefined && lang !== "km" && lang !== "en") {
      return res.status(400).json({ error: "Language must be either 'km' or 'en'." });
    }

    // 1. Run rule-based threat assessment first to decide risk level, score, signals, and category
    const ruleResult = analyzeThreat(content);

    // Rule-based confidence is decided entirely by the analyzer
    const confidenceVal: 'Low' | 'Medium' | 'High' = ruleResult.confidence;

    // 2. Build the combined response helper
    const buildResponse = (
      explanation: {
        summary_km: string; summary_en: string;
        reasons_km: string[]; reasons_en: string[];
        safe_next_steps_km: string[]; safe_next_steps_en: string[];
        disclaimer_km: string; disclaimer_en: string;
      },
      source: 'gemini' | 'fallback'
    ) => ({
      detected_type: ruleResult.detectedType,
      risk_level: ruleResult.riskLevel,
      risk_score: ruleResult.riskScore,
      confidence: confidenceVal,
      detected_signals: ruleResult.detectedSignals,
      explanation_source: source, // 'gemini' = AI-worded, 'fallback' = built-in text
      // What the USER sees (may be Gemini-worded):
      summary_km: explanation.summary_km || "",
      summary_en: explanation.summary_en || "",
      reasons_km: explanation.reasons_km || [],
      reasons_en: explanation.reasons_en || [],
      safe_next_steps_km: explanation.safe_next_steps_km || [],
      safe_next_steps_en: explanation.safe_next_steps_en || [],
      disclaimer_km: explanation.disclaimer_km || "ឧបករណ៍នេះផ្តល់ការណែនាំសុវត្ថិភាពប៉ុណ្ណោះ មិនមែនជាសេចក្តីសម្រេចផ្លូវច្បាប់ ធនាគារ ឬប៉ូលីសទេ។ សូមផ្ទៀងផ្ទាត់ជាមួយប្រភពផ្លូវការជានិច្ច។",
      disclaimer_en: explanation.disclaimer_en || "This tool gives safety guidance only. It is not a final legal, banking, or police decision. Always verify with official sources.",
      // Deterministic RULE-BASED explanation — safe to store in the database
      // (never AI-generated, identical for the same detected type):
      rule_reasons_en: ruleResult.reasonsEn,
      rule_safe_next_steps_en: ruleResult.safeNextStepsEn,
      link_analysis: ruleResult.linkAnalysis
    });

    // 3. If Gemini is not configured, use built-in bilingual fallback explanations immediately.
    //    The rule-based result (type, score, level, signals) is always returned either way.
    if (!ai) {
      console.info("[ScamCheck KH] explanation_source=fallback (Gemini not configured)");
      return res.json(buildResponse(getFallbackExplanations(ruleResult.detectedType), 'fallback'));
    }

    // 4. Gemini is configured — ask it to explain the rule-based result in friendly Khmer + English.
    //    Gemini does NOT change the risk decision. On any Gemini failure, fall through to fallback.
    const sanitizedContent = sanitizeForAI(content);
    const systemInstruction = `
You are "ScamCheck KH" (ឆែកមុនពេលជឿ), an expert public safety digital cybersecurity assistant for Cambodian citizens.
Your only job is to explain the threat assessment results in simple, reassuring, and non-technical language in both Khmer and English.

Do NOT make the decision about the risk score, risk level, confidence, or detected category. Those are decided by our automated security rules.
Here are the scanner results:
- Suspicious text: "${sanitizedContent}"
- Detected category: ${ruleResult.detectedType}
- Risk Level: ${ruleResult.riskLevel}
- Risk Score: ${ruleResult.riskScore}/100
- Matching warning signals: ${ruleResult.detectedSignals.join(", ") || "None"}
- Detected Links: ${ruleResult.linkAnalysis?.detectedLinks.join(", ") || "None"}
- Link Warning Signs: ${ruleResult.linkAnalysis?.linkWarningSignalsEn.join(", ") || "None"}

Your instructions:
1. Explain why this message is suspicious or safe based on the scanner's results. Keep the language humble, simple, comforting, and tailored to Cambodian citizens who are not tech-savvy.
2. Provide a short summary in Khmer ("summary_km") and English ("summary_en").
3. Provide simple, easy-to-understand explanations/reasons in Khmer ("reasons_km") and English ("reasons_en"). Provide 3 to 5 clear reasons.
4. Provide actionable safety advice/steps in Khmer ("safe_next_steps_km") and English ("safe_next_steps_en") tailored to the scan result category. Provide 3 to 5 clear steps. Include "កុំចែករំលែក OTP, Password ឬ PIN" in the Khmer steps.
5. Set "disclaimer_km" to "ឧបករណ៍នេះផ្តល់ការណែនាំសុវត្ថិភាពប៉ុណ្ណោះ មិនមែនជាសេចក្តីសម្រេចផ្លូវច្បាប់ ធនាគារ ឬប៉ូលីសទេ។ សូមផ្ទៀងផ្ទាត់ជាមួយប្រភពផ្លូវការជានិច្ច។"
6. Set "disclaimer_en" to "This tool gives safety guidance only. It is not a final legal, banking, or police decision. Always verify with official sources."

Strictly return a JSON object that adheres exactly to this schema:
{
  "summary_km": string, // Short comforting summary explanation in Khmer
  "summary_en": string, // Short summary explanation in English
  "reasons_km": string[], // list of explanations in simple, clear, comforting Khmer (3 to 5 reasons)
  "reasons_en": string[], // list of explanations in simple English (3 to 5 reasons)
  "safe_next_steps_km": string[], // list of clear safety next steps in Khmer (3 to 5 steps)
  "safe_next_steps_en": string[], // list of clear safety next steps in English (3 to 5 steps)
  "disclaimer_km": string, // "ឧបករណ៍នេះផ្តល់ការណែនាំសុវត្ថិភាពប៉ុណ្ណោះ មិនមែនជាសេចក្តីសម្រេចផ្លូវច្បាប់ ធនាគារ ឬប៉ូលីសទេ។ សូមផ្ទៀងផ្ទាត់ជាមួយប្រភពផ្លូវការជានិច្ច។"
  "disclaimer_en": string // "This tool gives safety guidance only. It is not a final legal, banking, or police decision. Always verify with official sources."
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Analyze and explain the scanner threat results.",
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary_km:         { type: Type.STRING },
            summary_en:         { type: Type.STRING },
            reasons_km:         { type: Type.ARRAY, items: { type: Type.STRING } },
            reasons_en:         { type: Type.ARRAY, items: { type: Type.STRING } },
            safe_next_steps_km: { type: Type.ARRAY, items: { type: Type.STRING } },
            safe_next_steps_en: { type: Type.ARRAY, items: { type: Type.STRING } },
            disclaimer_km:      { type: Type.STRING },
            disclaimer_en:      { type: Type.STRING }
          },
          required: [
            "summary_km", "summary_en",
            "reasons_km", "reasons_en",
            "safe_next_steps_km", "safe_next_steps_en",
            "disclaimer_km", "disclaimer_en"
          ]
        }
      }
    });

    const parsed = JSON.parse(response.text?.trim() || "{}");

    // Validate Gemini returned a usable response; if not, fall through to the built-in fallback.
    if (
      parsed.summary_km && parsed.summary_en &&
      Array.isArray(parsed.reasons_km) && parsed.reasons_km.length > 0 &&
      Array.isArray(parsed.reasons_en) && parsed.reasons_en.length > 0
    ) {
      console.info("[ScamCheck KH] explanation_source=gemini (AI explanation used)");
      return res.json(buildResponse(parsed, 'gemini'));
    }

    console.warn("[ScamCheck KH] explanation_source=fallback (Gemini returned incomplete response)");
    return res.json(buildResponse(getFallbackExplanations(ruleResult.detectedType), 'fallback'));

  } catch (error) {
    console.error("Analysis route error: ", error);
    // Any failure (Gemini call, JSON parse, network, quota) — always return the rule-based
    // result with built-in bilingual explanations so the user still gets a useful answer.
    try {
      const content = req.body?.content || "";
      const ruleResult = analyzeThreat(content);
      const confidenceVal: 'Low' | 'Medium' | 'High' = ruleResult.confidence;
      const explanation = getFallbackExplanations(ruleResult.detectedType);
      console.warn("[ScamCheck KH] explanation_source=fallback (Gemini call/parse failed)");
      return res.json({
        detected_type: ruleResult.detectedType,
        risk_level: ruleResult.riskLevel,
        risk_score: ruleResult.riskScore,
        confidence: confidenceVal,
        detected_signals: ruleResult.detectedSignals,
        explanation_source: 'fallback',
        summary_km: explanation.summary_km,
        summary_en: explanation.summary_en,
        reasons_km: explanation.reasons_km,
        reasons_en: explanation.reasons_en,
        safe_next_steps_km: explanation.safe_next_steps_km,
        safe_next_steps_en: explanation.safe_next_steps_en,
        disclaimer_km: explanation.disclaimer_km,
        disclaimer_en: explanation.disclaimer_en,
        rule_reasons_en: ruleResult.reasonsEn,
        rule_safe_next_steps_en: ruleResult.safeNextStepsEn,
        link_analysis: ruleResult.linkAnalysis
      });
    } catch (fallbackError) {
      console.error("Fallback generator error: ", fallbackError);
      return res.status(500).json({ error: "Failed to analyze suspicious content. Please try again later." });
    }
  }
});

// Setup Vite middleware in development or static hosting in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
