/**
 * Rule-based threat analyzer for ScamCheck KH
 */

import { LinkAnalysisResult } from "./types";

export interface AnalyzerResult {
  riskScore: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  detectedType: string;
  detectedSignals: string[];
  confidence: 'Low' | 'Medium' | 'High';
  reasons: string[];        // English (kept for backward compatibility)
  safeNextSteps: string[];  // English (kept for backward compatibility)
  reasonsKm: string[];
  reasonsEn: string[];
  safeNextStepsKm: string[];
  safeNextStepsEn: string[];
  linkAnalysis?: LinkAnalysisResult;
}

interface SignalKeyword {
  keyword: string;
  label: string;
  weight: number;
  category: string;
}

const WARNING_SIGNALS: SignalKeyword[] = [
  // Bank / OTP Scam
  { keyword: "otp", label: "OTP (One-Time Password)", weight: 45, category: "Bank / OTP Scam" },
  { keyword: "one-time password", label: "One-Time Password", weight: 45, category: "Bank / OTP Scam" },
  { keyword: "លេខកូដ otp", label: "លេខកូដ OTP", weight: 45, category: "Bank / OTP Scam" },
  { keyword: "pin", label: "PIN Code (លេខកូដសម្ងាត់)", weight: 40, category: "Bank / OTP Scam" },
  { keyword: "password", label: "Password (លេខសម្ងាត់)", weight: 40, category: "Bank / OTP Scam" },
  { keyword: "លេខសម្ងាត់", label: "លេខសម្ងាត់ (Password/PIN)", weight: 40, category: "Bank / OTP Scam" },
  { keyword: "login code", label: "Login Code (កូដចូលប្រើ)", weight: 35, category: "Bank / OTP Scam" },
  { keyword: "កូដចូល", label: "លេខកូដចូលគណនី (Login Code)", weight: 35, category: "Bank / OTP Scam" },
  { keyword: "លេខកូដចូល", label: "លេខកូដចូលគណនី", weight: 35, category: "Bank / OTP Scam" },
  { keyword: "aba", label: "ABA Bank", weight: 15, category: "Bank / OTP Scam" },
  { keyword: "acleda", label: "ACLEDA Bank", weight: 15, category: "Bank / OTP Scam" },
  { keyword: "bakong", label: "Bakong (បាគង)", weight: 15, category: "Bank / OTP Scam" },
  { keyword: "wing", label: "Wing Bank", weight: 15, category: "Bank / OTP Scam" },

  // Fake Job Scam
  { keyword: "registration fee", label: "Registration Fee (ថ្លៃចុះឈ្មោះ)", weight: 35, category: "Fake Job Scam" },
  { keyword: "register fee", label: "Register Fee (ថ្លៃចុះឈ្មោះ)", weight: 35, category: "Fake Job Scam" },
  { keyword: "ថ្លៃចុះឈ្មោះ", label: "ទាមទារថ្លៃចុះឈ្មោះ (Registration Fee)", weight: 35, category: "Fake Job Scam" },
  { keyword: "training fee", label: "Training Fee (ថ្លៃបណ្តុះបណ្តាល)", weight: 35, category: "Fake Job Scam" },
  { keyword: "ថ្លៃបណ្តុះបណ្តាល", label: "ទាមទារថ្លៃបណ្តុះបណ្តាល (Training Fee)", weight: 35, category: "Fake Job Scam" },
  { keyword: "ថ្លៃរៀន", label: "ទាមទារថ្លៃរៀនការងារ", weight: 30, category: "Fake Job Scam" },
  { keyword: "pay first", label: "Pay upfront (បង់ប្រាក់មុន)", weight: 40, category: "Fake Job Scam" },
  { keyword: "បង់ប្រាក់មុន", label: "បង់ប្រាក់មុន (Pay first)", weight: 40, category: "Fake Job Scam" },
  { keyword: "បង់លុយមុន", label: "បង់លុយមុន (Pay first)", weight: 40, category: "Fake Job Scam" },
  { keyword: "deposit first", label: "Deposit First (កក់លុយមុន)", weight: 40, category: "Fake Job Scam" },
  { keyword: "កក់មុន", label: "តម្រូវឱ្យកក់ប្រាក់មុន (Deposit first)", weight: 40, category: "Fake Job Scam" },
  { keyword: "កក់ប្រាក់មុន", label: "តម្រូវឱ្យកក់ប្រាក់មុន", weight: 40, category: "Fake Job Scam" },
  { keyword: "កក់លុយមុន", label: "តម្រូវឱ្យកក់លុយមុន", weight: 40, category: "Fake Job Scam" },
  { keyword: "easy job", label: "Easy Job Proposal (ការងារងាយស្រួល)", weight: 20, category: "Fake Job Scam" },
  { keyword: "work from home", label: "Work From Home (ការងារធ្វើពីផ្ទះ)", weight: 15, category: "Fake Job Scam" },
  { keyword: "ការងារ", label: "ការងារ (Job/Work)", weight: 15, category: "Fake Job Scam" },

  // KHQR / Payment Scam
  { keyword: "khqr", label: "KHQR Transaction Mention", weight: 20, category: "KHQR / Payment Scam" },
  { keyword: "payment screenshot", label: "Payment Screenshot Indicator", weight: 25, category: "KHQR / Payment Scam" },
  { keyword: "payment slip", label: "Payment Slip Mention", weight: 25, category: "KHQR / Payment Scam" },
  { keyword: "screenshot only", label: "Screenshot Proof Only", weight: 30, category: "KHQR / Payment Scam" },
  { keyword: "តែ screenshot", label: "ផ្ញើតែរូបភាព Screenshot ទូទាត់", weight: 30, category: "KHQR / Payment Scam" },
  { keyword: "តែរូបភាព", label: "ផ្ញើតែរូបភាពទូទាត់", weight: 25, category: "KHQR / Payment Scam" },
  { keyword: "វិក្កយបត្រ", label: "រូបភាពវិក្កយបត្រ/ផ្ទេរលុយ (Payment Slip)", weight: 25, category: "KHQR / Payment Scam" },
  { keyword: "រូបភាពវេរលុយ", label: "រូបភាពវេរលុយ (Payment Screenshot)", weight: 25, category: "KHQR / Payment Scam" },
  { keyword: "រូបភាពផ្ទេរប្រាក់", label: "រូបភាពផ្ទេរប្រាក់", weight: 25, category: "KHQR / Payment Scam" },
  { keyword: "already paid", label: "Already Paid Claim", weight: 25, category: "KHQR / Payment Scam" },
  { keyword: "បង់ប្រាក់រួច", label: "អះអាងថាបង់ប្រាក់រួច (Already Paid)", weight: 25, category: "KHQR / Payment Scam" },
  { keyword: "បង់លុយរួច", label: "អះអាងថាបង់លុយរួច", weight: 25, category: "KHQR / Payment Scam" },
  { keyword: "វេររួច", label: "វេរលុយរួចហើយ", weight: 25, category: "KHQR / Payment Scam" },
  { keyword: "ផ្ញើទំនិញ", label: "បង្ខំឱ្យផ្ញើទំនិញ (Send goods now)", weight: 25, category: "KHQR / Payment Scam" },
  { keyword: "send goods now", label: "Send Goods Urgently", weight: 25, category: "KHQR / Payment Scam" },
  { keyword: "ship now", label: "Ship Now Request", weight: 25, category: "KHQR / Payment Scam" },
  { keyword: "screenshot", label: "Screenshot Mention", weight: 20, category: "KHQR / Payment Scam" },

  // Online Shopping Scam
  { keyword: "online shop", label: "Online Shop Reference", weight: 10, category: "Online Shopping Scam" },
  { keyword: "online store", label: "Online Store Reference", weight: 10, category: "Online Shopping Scam" },
  { keyword: "ហាងលក់អនឡាញ", label: "ហាងលក់អនឡាញ (Online Shop)", weight: 10, category: "Online Shopping Scam" },
  { keyword: "cash on delivery", label: "Cash on Delivery", weight: 5, category: "Online Shopping Scam" },
  { keyword: "cod", label: "COD Payment Mention", weight: 5, category: "Online Shopping Scam" },
  { keyword: "deliver fee", label: "Delivery Fee Demand", weight: 20, category: "Online Shopping Scam" },
  { keyword: "វេរមុន", label: "តម្រូវឱ្យវេរលុយមុន (Transfer first)", weight: 30, category: "Online Shopping Scam" },
  { keyword: "ថោកណាស់", label: "តម្លៃថោកខុសពីធម្មតា (Unusually cheap)", weight: 20, category: "Online Shopping Scam" },

  // Investment Scam
  { keyword: "guaranteed profit", label: "Guaranteed Profit (ធានាប្រាក់ចំណេញ)", weight: 45, category: "Investment Scam" },
  { keyword: "guaranteed returns", label: "Guaranteed Returns", weight: 45, category: "Investment Scam" },
  { keyword: "ធានាចំណេញ", label: "ធានាចំណេញ (Guaranteed Profit)", weight: 45, category: "Investment Scam" },
  { keyword: "ធានាទទួលបាន", label: "ធានាទទួលបានចំណេញខ្ពស់", weight: 40, category: "Investment Scam" },
  { keyword: "guaranteed income", label: "Guaranteed Income (ធានាចំណូល)", weight: 45, category: "Investment Scam" },
  { keyword: "ធានាចំណូល", label: "ធានាចំណូលប្រចាំថ្ងៃ/ខែ", weight: 45, category: "Investment Scam" },
  { keyword: "double money", label: "Double Money Offer (ចំណេញទ្វេដង)", weight: 40, category: "Investment Scam" },
  { keyword: "double income", label: "Double Income Promise", weight: 40, category: "Investment Scam" },
  { keyword: "ចំណេញទ្វេដង", label: "ការសន្យាចំណេញទ្វេដង (Double Money)", weight: 40, category: "Investment Scam" },
  { keyword: "ចំណេញពីរដង", label: "ទទួលបានប្រាក់ចំណេញពីរដង", weight: 40, category: "Investment Scam" },
  { keyword: "crypto investment", label: "Crypto Investment Scheme", weight: 30, category: "Investment Scam" },
  { keyword: "crypto", label: "Crypto Currency Mention", weight: 20, category: "Investment Scam" },
  { keyword: "bitcoin", label: "Bitcoin Mention", weight: 20, category: "Investment Scam" },
  { keyword: "btc", label: "BTC Mention", weight: 20, category: "Investment Scam" },
  { keyword: "វិនិយោគ crypto", label: "ការវិនិយោគកាក់គ្រីបតូ (Crypto)", weight: 30, category: "Investment Scam" },
  { keyword: "forex", label: "Forex Trading Mention", weight: 25, category: "Investment Scam" },
  { keyword: "វិនិយោគ", label: "វិនិយោគ (Invest)", weight: 35, category: "Investment Scam" },
  { keyword: "ការវិនិយោគ", label: "ការវិនិយោគ (Investment)", weight: 35, category: "Investment Scam" },
  { keyword: "ប្រាក់ពីរដង", label: "ទទួលបានប្រាក់ពីរដង (Double Money)", weight: 45, category: "Investment Scam" },
  { keyword: "ទទួលបានប្រាក់ពីរដង", label: "ទទួលបានប្រាក់ពីរដង (Get Double Money)", weight: 45, category: "Investment Scam" },
  { keyword: "ចំណេញធានា", label: "ចំណេញធានា (Guaranteed Profit)", weight: 45, category: "Investment Scam" },
  { keyword: "ចំណេញ 100%", label: "ចំណេញ 100% (100% Profit)", weight: 45, category: "Investment Scam" },
  { keyword: "គ្មានហានិភ័យ", label: "គ្មានហានិភ័យ (Risk Free)", weight: 45, category: "Investment Scam" },
  { keyword: "risk free", label: "Risk Free (គ្មានហានិភ័យ)", weight: 45, category: "Investment Scam" },
  { keyword: "ប្រាក់ចំណេញប្រចាំថ្ងៃ", label: "ប្រាក់ចំណេញប្រចាំថ្ងៃ (Daily Profit)", weight: 40, category: "Investment Scam" },
  { keyword: "daily profit", label: "Daily Profit (ប្រាក់ចំណេញប្រចាំថ្ងៃ)", weight: 40, category: "Investment Scam" },
  { keyword: "VIP investment", label: "VIP Investment Scheme", weight: 35, category: "Investment Scam" },

  // Suspicious Link
  { keyword: "click link", label: "Click Link Request", weight: 25, category: "Suspicious Link" },
  { keyword: "click this link", label: "Click This Link", weight: 25, category: "Suspicious Link" },
  { keyword: "ចុចលីង", label: "ចុចលើលីងដើម្បីបន្ត (Click Link)", weight: 30, category: "Suspicious Link" },
  { keyword: "ចុចតំណនេះ", label: "ចុចលើតំណភ្ជាប់នេះ (Click Link)", weight: 30, category: "Suspicious Link" },
  { keyword: "ចុចតំណភ្ជាប់", label: "ចុចតំណភ្ជាប់ខាងក្រោម", weight: 30, category: "Suspicious Link" },
  { keyword: "suspicious link", label: "Suspicious Web Hyperlink", weight: 30, category: "Suspicious Link" },
  { keyword: "http", label: "Hyperlink detected", weight: 20, category: "Suspicious Link" },
  { keyword: "www.", label: "Web domain link detected", weight: 20, category: "Suspicious Link" },
  { keyword: ".xyz", label: "Untrusted XYZ domain extension", weight: 35, category: "Suspicious Link" },
  { keyword: ".top", label: "Untrusted TOP domain extension", weight: 35, category: "Suspicious Link" },
  { keyword: "t.me", label: "Telegram link (t.me)", weight: 20, category: "Suspicious Link" },
  { keyword: "telegram.me", label: "Telegram Chat Invitation", weight: 20, category: "Suspicious Link" },

  // Prize Scam
  { keyword: "prize", label: "Prize Offer", weight: 35, category: "Prize Scam" },
  { keyword: "won", label: "Won Announcement", weight: 35, category: "Prize Scam" },
  { keyword: "reward", label: "Reward Notification", weight: 30, category: "Prize Scam" },
  { keyword: "claim reward", label: "Claim Reward Invitation", weight: 30, category: "Prize Scam" },
  { keyword: "free money", label: "Free Money Promise", weight: 35, category: "Prize Scam" },
  { keyword: "រង្វាន់", label: "ការផ្តល់រង្វាន់ (Prize notification)", weight: 35, category: "Prize Scam" },
  { keyword: "ឈ្នះរង្វាន់", label: "ឈ្នះរង្វាន់ធំ (Won grand prize)", weight: 35, category: "Prize Scam" },
  { keyword: "ឈ្នះឡាន", label: "ឈ្នះឡានថ្មីស្រឡាង (Won car)", weight: 40, category: "Prize Scam" },
  { keyword: "ឈ្នះម៉ូតូ", label: "ឈ្នះម៉ូតូ (Won motorcycle)", weight: 40, category: "Prize Scam" },
  { keyword: "lucky draw", label: "Lucky Draw Sweepstakes", weight: 25, category: "Prize Scam" },
  { keyword: "ទទួលរង្វាន់", label: "ចុចទទួលរង្វាន់ឥតគិតថ្លៃ", weight: 35, category: "Prize Scam" },
  { keyword: "ទទួលលុយហ្វ្រី", label: "ទទួលបានទឹកប្រាក់ឥតគិតថ្លៃ (Free money)", weight: 35, category: "Prize Scam" },
  { keyword: "លុយហ្វ្រី", label: "ទទួលបានលុយហ្វ្រី (Free money)", weight: 35, category: "Prize Scam" },

  // Account Security Scam
  { keyword: "account blocked", label: "Account Blocked Alert", weight: 35, category: "Account Security Scam" },
  { keyword: "suspended", label: "Account Suspended Alert", weight: 35, category: "Account Security Scam" },
  { keyword: "locked", label: "Account Locked Alert", weight: 35, category: "Account Security Scam" },
  { keyword: "គណនីត្រូវបិទ", label: "គណនីធនាគារត្រូវបិទជាបណ្តោះអាសន្ន", weight: 35, category: "Account Security Scam" },
  { keyword: "បិទគណនី", label: "ការគំរាមបិទគណនី (Block Account)", weight: 35, category: "Account Security Scam" },
  { keyword: "គណនីត្រូវបានចាក់សោ", label: "គណនីត្រូវបានចាក់សោ (Locked Account)", weight: 35, category: "Account Security Scam" },
  { keyword: "frozen", label: "Frozen Account Panic", weight: 35, category: "Account Security Scam" },
  { keyword: "បង្កក", label: "បង្កកគណនីធនាគារ (Frozen bank account)", weight: 35, category: "Account Security Scam" },
  { keyword: "ចាក់សោ", label: "ចាក់សោគណនី (Locked profile)", weight: 30, category: "Account Security Scam" },
  { keyword: "verify account", label: "Verify Account Call", weight: 30, category: "Account Security Scam" },
  { keyword: "ផ្ទៀងផ្ទាត់", label: "ការផ្ទៀងផ្ទាត់គណនី (Verification Required)", weight: 25, category: "Account Security Scam" },
  { keyword: "ផ្ទៀងផ្ទាត់គណនី", label: "តម្រូវឱ្យផ្ទៀងផ្ទាត់គណនីភ្លាមៗ", weight: 30, category: "Account Security Scam" },
  { keyword: "urgent", label: "Urgent pressure warning", weight: 20, category: "Account Security Scam" },
  { keyword: "immediate", label: "Immediate Action Required", weight: 20, category: "Account Security Scam" },
  { keyword: "បន្ទាន់", label: "ស្ថានភាពបន្ទាន់បំផុត (Urgent notice)", weight: 20, category: "Account Security Scam" },
  { keyword: "ប្រញាប់", label: "ធ្វើដោយប្រញាប់ (Immediate request)", weight: 15, category: "Account Security Scam" },
  { keyword: "ឥឡូវនេះ", label: "ធ្វើឥឡូវនេះ (Do it now)", weight: 15, category: "Account Security Scam" },
  { keyword: "limited time", label: "Limited Time Opportunity", weight: 15, category: "Account Security Scam" },
  { keyword: "time limit", label: "Time Limit Threat", weight: 15, category: "Account Security Scam" },
  { keyword: "រយៈពេលកំណត់", label: "រយៈពេលកំណត់ត្រឹមថ្ងៃនេះ (Limited time)", weight: 15, category: "Account Security Scam" },

  // ===================================================================
  // Strengthened signal groups (v2) — stronger Khmer + English coverage
  // ===================================================================

  // Group 1: OTP / Bank Scam (high-risk credential theft)
  { keyword: "លេខកូដ", label: "លេខកូដផ្ទៀងផ្ទាត់ (Verification Code)", weight: 30, category: "Bank / OTP Scam" },
  { keyword: "កូដសម្ងាត់", label: "កូដសម្ងាត់ (Secret Code)", weight: 40, category: "Bank / OTP Scam" },
  { keyword: "ពាក្យសម្ងាត់", label: "ពាក្យសម្ងាត់ (Password)", weight: 40, category: "Bank / OTP Scam" },
  { keyword: "គណនីត្រូវបានបិទ", label: "គណនីត្រូវបានបិទ (Account Blocked)", weight: 40, category: "Account Security Scam" },
  { keyword: "verify your account", label: "Verify Your Account Request", weight: 35, category: "Account Security Scam" },

  // Group 2: Fake Job Scam
  { keyword: "deposit", label: "Deposit Demand (តម្រូវឱ្យកក់ប្រាក់)", weight: 30, category: "Fake Job Scam" },
  { keyword: "salary guaranteed", label: "Salary Guaranteed (ធានាប្រាក់ខែ)", weight: 35, category: "Fake Job Scam" },
  { keyword: "ធានាប្រាក់ខែ", label: "ធានាប្រាក់ខែខ្ពស់ (Salary Guaranteed)", weight: 35, category: "Fake Job Scam" },
  { keyword: "no experience needed", label: "No Experience Needed (មិនត្រូវការបទពិសោធន៍)", weight: 20, category: "Fake Job Scam" },
  { keyword: "មិនត្រូវការបទពិសោធន៍", label: "មិនត្រូវការបទពិសោធន៍ (No Experience Needed)", weight: 20, category: "Fake Job Scam" },

  // Group 3: Investment Scam
  { keyword: "ប្រាក់ចំណេញ", label: "ប្រាក់ចំណេញខ្ពស់ (High Profit Claim)", weight: 30, category: "Investment Scam" },
  { keyword: "investment", label: "Investment Offer", weight: 25, category: "Investment Scam" },
  { keyword: "passive income", label: "Passive Income Promise", weight: 30, category: "Investment Scam" },
  { keyword: "ចំណូលប្រចាំថ្ងៃ", label: "ចំណូលប្រចាំថ្ងៃ (Daily Income)", weight: 35, category: "Investment Scam" },
  { keyword: "earn daily", label: "Earn Daily Promise", weight: 30, category: "Investment Scam" },

  // Group 4: Online Shopping Scam
  { keyword: "ផ្ញើស្លីប", label: "ផ្ញើស្លីបទូទាត់ (Send Payment Slip)", weight: 25, category: "Online Shopping Scam" },
  { keyword: "delivery fee", label: "Delivery Fee Demand (ថ្លៃដឹកជញ្ជូន)", weight: 20, category: "Online Shopping Scam" },
  { keyword: "pre-order", label: "Pre-order Upfront Payment", weight: 10, category: "Online Shopping Scam" },
  { keyword: "cheap price", label: "Unusually Cheap Price", weight: 15, category: "Online Shopping Scam" },
  { keyword: "limited stock", label: "Limited Stock Pressure", weight: 15, category: "Online Shopping Scam" },
  { keyword: "វេរលុយមុន", label: "តម្រូវឱ្យវេរលុយមុន (Transfer money first)", weight: 30, category: "Online Shopping Scam" },
  { keyword: "ចំនួនមានកំណត់", label: "ចំនួនមានកំណត់ (Limited stock pressure)", weight: 15, category: "Online Shopping Scam" },

  // Group 5: Suspicious Link
  { keyword: "ចុចតំណ", label: "ចុចលើតំណភ្ជាប់ (Click Link)", weight: 30, category: "Suspicious Link" },
  { keyword: "bit.ly", label: "Shortened bit.ly Link", weight: 30, category: "Suspicious Link" },
  { keyword: "tinyurl", label: "Shortened TinyURL Link", weight: 30, category: "Suspicious Link" },
  { keyword: "shortened link", label: "Shortened Link Indicator", weight: 25, category: "Suspicious Link" },

  // ===================================================================
  // Research-based rules (v3) — see RESEARCH_SOURCES.md → Rule Changes Log
  // ===================================================================

  // R1: Bank/account phishing link hooks (NOT proof by themselves — combination
  //     with verification/OTP/urgency signals is what elevates risk; see Rule 3b)
  { keyword: "aba-verify", label: "ABA phishing-style link hook (aba-verify)", weight: 30, category: "Suspicious Link" },
  { keyword: "acleda-update", label: "ACLEDA phishing-style link hook (acleda-update)", weight: 30, category: "Suspicious Link" },

  // R2: Fake job / task commission scam wording (Khmer)
  { keyword: "រកលុយប្រចាំថ្ងៃ", label: "រកលុយប្រចាំថ្ងៃ (Earn money daily — task scam)", weight: 30, category: "Fake Job Scam" },
  { keyword: "ដកលុយភ្លាមៗ", label: "ដកលុយភ្លាមៗ (Withdraw money instantly — task scam)", weight: 30, category: "Fake Job Scam" }
];

/**
 * Returns bilingual (Khmer + English) reasons and safe next steps for a given
 * detected scam type. These are decided entirely by the rule-based engine —
 * Gemini only rewords them, it never changes the decision.
 */
function buildExplanations(detectedType: string): {
  reasonsKm: string[];
  reasonsEn: string[];
  safeNextStepsKm: string[];
  safeNextStepsEn: string[];
} {
  const NEVER_SHARE_KM = "កុំចែករំលែក OTP, Password ឬ PIN ទៅឱ្យនរណាម្នាក់ឡើយ។";
  const NEVER_SHARE_EN = "Never share your OTP, password, or PIN with anyone.";

  switch (detectedType) {
    case "Bank / OTP Scam":
      return {
        reasonsKm: [
          "សារនេះសុំ OTP, លេខ PIN, ពាក្យសម្ងាត់ ឬព័ត៌មានគណនីធនាគារ ដែលធនាគារពិតប្រាកដមិនដែលសុំឡើយ។",
          "អ្នកបោកប្រាស់ប្រើពាក្យបន្ទាន់ ដើម្បីឱ្យអ្នកប្រញាប់ផ្ញើលេខកូដសម្ងាត់។"
        ],
        reasonsEn: [
          "This message asks for an OTP, PIN, password, or bank details — things a real bank never requests by chat or SMS.",
          "Scammers use urgency so you send your secret code before thinking."
        ],
        safeNextStepsKm: [
          "កុំផ្ញើលេខកូដ OTP ឬលេខសម្ងាត់ទៅឱ្យនរណាម្នាក់ឡើយ។",
          "ទាក់ទងធនាគាររបស់អ្នកដោយផ្ទាល់តាមលេខទូរស័ព្ទផ្លូវការ។",
          NEVER_SHARE_KM
        ],
        safeNextStepsEn: [
          "Do not send the OTP, PIN, or password to anyone.",
          "Contact your bank directly using their official hotline number.",
          NEVER_SHARE_EN
        ]
      };

    case "Fake Job Scam":
      return {
        reasonsKm: [
          "ការងារនេះតម្រូវឱ្យបង់ថ្លៃចុះឈ្មោះ ថ្លៃបណ្តុះបណ្តាល ឬកក់ប្រាក់មុន។",
          "ក្រុមហ៊ុនពិតប្រាកដមិនដែលសុំលុយពីបេក្ខជនមុនពេលធ្វើការឡើយ។"
        ],
        reasonsEn: [
          "This job demands a registration fee, training fee, or upfront deposit.",
          "Legitimate employers never ask candidates to pay money before working."
        ],
        safeNextStepsKm: [
          "កុំបង់លុយដើម្បីទទួលបានការងារឡើយ។",
          "Block និងរាយការណ៍គណនីអ្នកជ្រើសរើសភ្លាមៗ។",
          NEVER_SHARE_KM
        ],
        safeNextStepsEn: [
          "Do not pay any money to get a job.",
          "Block and report the recruiter account immediately.",
          NEVER_SHARE_EN
        ]
      };

    case "KHQR / Payment Scam":
      return {
        reasonsKm: [
          "សារនេះមាន KHQR ឬស្លីបទូទាត់ ដែលអាចជារូបភាពកាត់ត ឬក្លែងក្លាយ។",
          "ការផ្ញើតែ Screenshot មិនបញ្ជាក់ថាប្រាក់បានចូលគណនីពិតប្រាកដទេ។"
        ],
        reasonsEn: [
          "This contains a KHQR code or payment slip that may be edited or fake.",
          "A screenshot alone does not prove money actually reached your account."
        ],
        safeNextStepsKm: [
          "បើក App ធនាគាររបស់អ្នកផ្ទាល់ ដើម្បីផ្ទៀងផ្ទាត់សមតុល្យពិតប្រាកដ។",
          "កុំផ្ញើទំនិញ ឬប្រាក់ មុនពេលឃើញប្រាក់ចូលក្នុង App ធនាគារ។",
          NEVER_SHARE_KM
        ],
        safeNextStepsEn: [
          "Open your own bank app to confirm the real balance first.",
          "Do not send goods or money until you see the funds in your bank app.",
          NEVER_SHARE_EN
        ]
      };

    case "Online Shopping Scam":
      return {
        reasonsKm: [
          "អ្នកលក់តម្រូវឱ្យបង់ប្រាក់មុន ឬមានតម្លៃថោកខុសធម្មតា ដើម្បីទាក់ទាញ។",
          "ការបង្ខំឱ្យទិញរហ័ស (Stock មានកំណត់) គឺជាល្បិចបោកប្រាស់។"
        ],
        reasonsEn: [
          "The seller demands upfront payment or offers an unusually cheap price as bait.",
          "Pressure to buy fast (\"limited stock\") is a common scam tactic."
        ],
        safeNextStepsKm: [
          "ប្រើការទូទាត់ពេលទំនិញមកដល់ (Cash on Delivery) ប្រសិនបើអាច។",
          "ពិនិត្យកាលបរិច្ឆេទបង្កើតទំព័រ និងមតិយោបល់អតិថិជនពិតប្រាកដ។",
          NEVER_SHARE_KM
        ],
        safeNextStepsEn: [
          "Use Cash on Delivery (COD) whenever possible.",
          "Check the page's creation date and real customer reviews.",
          NEVER_SHARE_EN
        ]
      };

    case "Investment Scam":
      return {
        reasonsKm: [
          "សារនេះសន្យាផ្តល់ប្រាក់ចំណេញធានា ចំណូលប្រចាំថ្ងៃ ឬប្រាក់ទ្វេដង។",
          "ការវិនិយោគពិតប្រាកដគ្មានការធានាចំណេញ ១០០% ដោយគ្មានហានិភ័យឡើយ។"
        ],
        reasonsEn: [
          "This promises guaranteed profit, daily income, or double money.",
          "Real investments never guarantee 100% profit with zero risk."
        ],
        safeNextStepsKm: [
          "កុំផ្ញើលុយ ឬចូលរួមក្រុមវិនិយោគតេឡេក្រាមចម្លែកៗ។",
          "ចងចាំ៖ បើវាស្តាប់ទៅល្អពេក នោះវាជាការបោកប្រាស់។",
          NEVER_SHARE_KM
        ],
        safeNextStepsEn: [
          "Do not send money or join unknown Telegram investment groups.",
          "Remember: if it sounds too good to be true, it is a scam.",
          NEVER_SHARE_EN
        ]
      };

    case "Prize Scam":
      return {
        reasonsKm: [
          "ការឈ្នះរង្វាន់ដោយមិនបានចូលរួមលេង ហើយតម្រូវឱ្យបង់ថ្លៃសេវា គឺជាការបោកប្រាស់។"
        ],
        reasonsEn: [
          "Winning a prize you never entered, then being asked to pay a fee, is a scam."
        ],
        safeNextStepsKm: [
          "កុំបង់ថ្លៃសេវា ឬកក់ប្រាក់ដើម្បីបើករង្វាន់ឡើយ។",
          "ផ្ទៀងផ្ទាត់ដោយផ្ទាល់ជាមួយទំព័រផ្លូវការរបស់ក្រុមហ៊ុន។",
          NEVER_SHARE_KM
        ],
        safeNextStepsEn: [
          "Do not pay any processing or delivery fee to claim a prize.",
          "Verify directly with the brand's official verified page.",
          NEVER_SHARE_EN
        ]
      };

    case "Account Security Scam":
      return {
        reasonsKm: [
          "សារនេះគំរាមថាគណនីត្រូវបានបិទ ឬផ្អាក ដើម្បីបន្លាចឱ្យអ្នកធ្វើតាមភ្លាមៗ។",
          "តម្រូវឱ្យផ្ទៀងផ្ទាត់គណនីតាម Link គឺជាល្បិចលួចគណនី (Phishing)។"
        ],
        reasonsEn: [
          "This threatens that your account is blocked or suspended to make you panic.",
          "Asking you to verify via a link is a common phishing tactic to steal accounts."
        ],
        safeNextStepsKm: [
          "កុំចុចលើ Link ក្នុងសារបន្ទាន់នោះឡើយ។",
          "ចូលទៅ App ឬ Website ផ្លូវការដោយផ្ទាល់ដើម្បីពិនិត្យ។",
          NEVER_SHARE_KM
        ],
        safeNextStepsEn: [
          "Do not click links inside urgent or threatening messages.",
          "Log in to the official app or website directly to check.",
          NEVER_SHARE_EN
        ]
      };

    case "Suspicious Link":
      return {
        reasonsKm: [
          "សារនេះមាន Link គួរឱ្យសង្ស័យ ដែលអាចនាំទៅគេហទំព័រលួចគណនី ឬមេរោគ។",
          "Link ខ្លី (bit.ly, tinyurl) អាចលាក់គេហទំព័រពិតប្រាកដ។"
        ],
        reasonsEn: [
          "This message contains a suspicious link that may lead to phishing or malware.",
          "Shortened links (bit.ly, tinyurl) can hide the real destination website."
        ],
        safeNextStepsKm: [
          "ជៀសវាងការចុច Link។ ពិនិត្យអក្ខរាវិរុទ្ធឈ្មោះ Domain ឱ្យបានច្បាស់។",
          "កុំតំឡើងកម្មវិធី (APK) ឬបញ្ចូលលេខទូរស័ព្ទលើ Website មិនស្គាល់។",
          NEVER_SHARE_KM
        ],
        safeNextStepsEn: [
          "Avoid clicking the link. Check the domain spelling carefully.",
          "Do not install APK files or enter your phone number on unknown sites.",
          NEVER_SHARE_EN
        ]
      };

    case "Normal Safe Message":
      return {
        reasonsKm: [
          "មិនមានសញ្ញាគួរឱ្យសង្ស័យ ឬពាក្យគន្លឹះបោកប្រាស់ត្រូវបានរកឃើញឡើយ។"
        ],
        reasonsEn: [
          "No known scam warning signals were detected in this message."
        ],
        safeNextStepsKm: [
          "អ្នកអាចឆ្លើយតបធម្មតា ប៉ុន្តែសូមកុំចែករំលែកព័ត៌មានផ្ទាល់ខ្លួនដែលមិនចាំបាច់។",
          NEVER_SHARE_KM
        ],
        safeNextStepsEn: [
          "You may reply normally, but avoid sharing unnecessary personal information.",
          NEVER_SHARE_EN
        ]
      };

    default:
      return {
        reasonsKm: [
          "ប្រព័ន្ធបានរកឃើញលំនាំគួរឱ្យសង្ស័យ ឬពាក្យបន្ទាន់មួយចំនួន។"
        ],
        reasonsEn: [
          "The system detected some suspicious patterns or urgent wording."
        ],
        safeNextStepsKm: [
          "ផ្ទៀងផ្ទាត់អត្តសញ្ញាណអ្នកផ្ញើតាមមធ្យោបាយផ្សេងមុនពេលជឿ។",
          NEVER_SHARE_KM
        ],
        safeNextStepsEn: [
          "Verify the sender's identity through another channel before trusting it.",
          NEVER_SHARE_EN
        ]
      };
  }
}

export function analyzeThreat(text: string): AnalyzerResult {
  if (!text || text.trim() === "") {
    return {
      riskScore: 0,
      riskLevel: "Low",
      detectedType: "Normal Safe Message",
      detectedSignals: [],
      confidence: "Low",
      reasons: [],
      safeNextSteps: [],
      reasonsKm: [],
      reasonsEn: [],
      safeNextStepsKm: [],
      safeNextStepsEn: []
    };
  }

  const cleanText = text.toLowerCase();
  const detectedSignals: string[] = [];
  let scoreSum = 0;

  // Track category weights to find dominant one
  const categoryHits: { [key: string]: number } = {
    "Fake Job Scam": 0,
    "Bank / OTP Scam": 0,
    "KHQR / Payment Scam": 0,
    "Online Shopping Scam": 0,
    "Investment Scam": 0,
    "Suspicious Link": 0,
    "Prize Scam": 0,
    "Account Security Scam": 0
  };

  // Track how many distinct signals matched per category (used for confidence)
  const categorySignalCount: { [key: string]: number } = {
    "Fake Job Scam": 0,
    "Bank / OTP Scam": 0,
    "KHQR / Payment Scam": 0,
    "Online Shopping Scam": 0,
    "Investment Scam": 0,
    "Suspicious Link": 0,
    "Prize Scam": 0,
    "Account Security Scam": 0
  };

  for (const sig of WARNING_SIGNALS) {
    if (cleanText.includes(sig.keyword)) {
      if (!detectedSignals.includes(sig.label)) {
        detectedSignals.push(sig.label);
        scoreSum += sig.weight;
      }
      categoryHits[sig.category] += sig.weight;
      categorySignalCount[sig.category] += 1;
    }
  }

  // Adjust score based on multiple category cross-matches
  const categoriesMatched = Object.values(categoryHits).filter(v => v > 0).length;
  if (categoriesMatched > 1) {
    scoreSum += (categoriesMatched - 1) * 8;
  }

  // Enforce score limit and categorize
  let riskScore = Math.min(scoreSum, 100);

  // Identify primary detected type
  let detectedType = "Unknown";
  let maxWeight = 0;
  for (const [cat, weight] of Object.entries(categoryHits)) {
    if (weight > maxWeight) {
      maxWeight = weight;
      detectedType = cat;
    }
  }

  // ---------------- Priority Overrides ----------------
  
  // Rule 1: If contains BOTH payment/transfer and job/recruitment keywords, classify as Fake Job Scam
  const hasPaymentWords = cleanText.includes("khqr") || cleanText.includes("screenshot") || cleanText.includes("slip") || cleanText.includes("វិក្កយបត្រ") || cleanText.includes("បង់") || cleanText.includes("វេរ") || cleanText.includes("pay") || cleanText.includes("fee") || cleanText.includes("លុយ") || cleanText.includes("ប្រាក់") || cleanText.includes("ដុល្លារ") || cleanText.includes("$");
  const hasJobWords = cleanText.includes("ការងារ") || cleanText.includes("job") || cleanText.includes("recruiter") || cleanText.includes("ជាប់ការងារ") || cleanText.includes("រក្សាតំណែង") || cleanText.includes("តំណែង") || cleanText.includes("ថ្លៃចុះឈ្មោះ") || cleanText.includes("registration fee") || cleanText.includes("register fee") || cleanText.includes("training fee") || cleanText.includes("ថ្លៃបណ្តុះបណ្តាល");

  if (hasJobWords && hasPaymentWords) {
    detectedType = "Fake Job Scam";
    // Boost risk score to ensure Fake Job scams are High Risk when money transfer is demanded
    riskScore = Math.max(riskScore, 75);
  }

  // Rule 2: If contains payment screenshot / screenshot / already paid / send goods now, classify as KHQR / Payment Scam or Online Shopping Scam
  const hasScreenshotWords = cleanText.includes("payment screenshot") || cleanText.includes("screenshot") || cleanText.includes("already paid") || cleanText.includes("បង់ប្រាក់រួច") || cleanText.includes("បង់លុយរួច") || cleanText.includes("វេររួច") || cleanText.includes("ផ្ញើទំនិញ") || cleanText.includes("send goods") || cleanText.includes("ship now") || cleanText.includes("slip");

  if (hasScreenshotWords && detectedType !== "Fake Job Scam" && detectedType !== "Bank / OTP Scam") {
    // Classify as KHQR / Payment Scam as standard
    detectedType = "KHQR / Payment Scam";
    riskScore = Math.max(riskScore, 55); // Ensure medium/high risk
  }

  // Rule 3: If contains OTP, PIN, password, login code, account blocked, or verify account, classify as Bank / OTP Scam or Account Security Scam
  const hasOtpOrCredentials = cleanText.includes("otp") || cleanText.includes("pin") || cleanText.includes("password") || cleanText.includes("login code") || cleanText.includes("លេខកូដ otp") || cleanText.includes("លេខសម្ងាត់") || cleanText.includes("កូដចូល") || cleanText.includes("លេខកូដចូល") || cleanText.includes("លេខកូដសម្ងាត់");
  const hasSecurityThreats = cleanText.includes("account blocked") || cleanText.includes("suspended") || cleanText.includes("locked") || cleanText.includes("verify account") || cleanText.includes("គណនីត្រូវបិទ") || cleanText.includes("បិទគណនី") || cleanText.includes("គណនីត្រូវបានចាក់សោ") || cleanText.includes("បង្កក") || cleanText.includes("ចាក់សោ") || cleanText.includes("ផ្ទៀងផ្ទាត់") || cleanText.includes("ផ្ទៀងផ្ទាត់គណនី");

  if (hasOtpOrCredentials && detectedType !== "Fake Job Scam") {
    detectedType = "Bank / OTP Scam";
    riskScore = Math.max(riskScore, 85); // Critical credential theft is always high risk
  } else if (hasSecurityThreats && detectedType !== "Fake Job Scam" && detectedType !== "Bank / OTP Scam") {
    detectedType = "Account Security Scam";
    riskScore = Math.max(riskScore, 65);
  }

  // Rule 3b: Bank/account phishing link hooks (research-based — RESEARCH_SOURCES.md).
  // The hook alone is suspicious but NOT absolute proof. Risk is elevated more
  // strongly when combined with account-verification / OTP / urgency signals.
  // A normal "ABA"/"ACLEDA" message (without these hooks) is unaffected.
  const hasBankPhishingHook = cleanText.includes("aba-verify") || cleanText.includes("acleda-update");
  if (hasBankPhishingHook && detectedType !== "Fake Job Scam") {
    const hasVerifyOrUrgency =
      cleanText.includes("verify account") || cleanText.includes("verify your account") ||
      cleanText.includes("ផ្ទៀងផ្ទាត់") || cleanText.includes("click link") ||
      cleanText.includes("click this link") || cleanText.includes("ចុចតំណ") ||
      cleanText.includes("urgent") || cleanText.includes("immediate") ||
      cleanText.includes("បន្ទាន់");

    if (hasOtpOrCredentials) {
      // Credential harvesting via a fake bank link → Bank / OTP Scam.
      detectedType = "Bank / OTP Scam";
      riskScore = Math.max(riskScore, 85);
    } else if (hasSecurityThreats || hasVerifyOrUrgency) {
      // Account-verification phishing link → Account Security Scam.
      detectedType = "Account Security Scam";
      riskScore = Math.max(riskScore, 75);
    } else {
      // The phishing link pattern is the main signal on its own.
      detectedType = "Suspicious Link";
      riskScore = Math.max(riskScore, 50);
    }
  }

  // Rule 4: Handle Investment Scam special detection and ensure High Risk
  const isInvestmentText = cleanText.includes("វិនិយោគ") || cleanText.includes("ការវិនិយោគ") || cleanText.includes("ប្រាក់ពីរដង") || cleanText.includes("ទទួលបានប្រាក់ពីរដង") || cleanText.includes("ចំណេញធានា") || cleanText.includes("ចំណេញ 100%") || cleanText.includes("គ្មានហានិភ័យ") || cleanText.includes("ប្រាក់ចំណេញប្រចាំថ្ងៃ") || cleanText.includes("guaranteed profit") || cleanText.includes("guaranteed income") || cleanText.includes("double money") || cleanText.includes("risk free") || cleanText.includes("daily profit") || cleanText.includes("crypto investment") || cleanText.includes("vip investment");

  if (isInvestmentText) {
    detectedType = "Investment Scam";
    // If multiple investment signals are matched, make sure it's High Risk
    let investKeywordsMatched = 0;
    const investWords = ["វិនិយោគ", "ចំណេញ", "ពីរដង", "guaranteed", "double", "profit", "returns", "risk free", "គ្មានហានិភ័យ", "100%"];
    for (const w of investWords) {
      if (cleanText.includes(w)) {
        investKeywordsMatched++;
      }
    }
    if (investKeywordsMatched >= 2) {
      riskScore = Math.max(riskScore, 80);
    } else {
      riskScore = Math.max(riskScore, 40);
    }
  }

  // Fallback for hyperlinks if no specific category was dominant but links exist
  if (detectedType === "Unknown" && (
    cleanText.includes("http") || 
    cleanText.includes("www.") || 
    cleanText.includes(".xyz") || 
    cleanText.includes(".top") || 
    cleanText.includes("t.me") || 
    cleanText.includes("telegram.me")
  )) {
    detectedType = "Suspicious Link";
    riskScore = Math.max(riskScore, 35);
  }

  // Separate Link Analysis Check
  const linkAnalysis = analyzeLinksInText(text);

  if (linkAnalysis.hasLink) {
    // Combine standard scam score with link risk score
    riskScore = Math.min(riskScore + linkAnalysis.linkRiskScore, 100);

    // Merge warning signals
    for (const sig of linkAnalysis.linkWarningSignalsEn) {
      if (!detectedSignals.includes(sig)) {
        detectedSignals.push(sig);
      }
    }

    // Adjust type if it was normal but now has suspicious links
    if ((detectedType === "Unknown" || detectedType === "Normal Safe Message") && riskScore >= 25) {
      detectedType = "Suspicious Link";
    }
  }

  // If no warning signals are found or if the message lacks critical scam intent, classify as Normal Safe Message (Low Risk, Score 0)
  // Let's check for Test 5: "សួស្តីបង ស្អែកព្រឹកម៉ោង 9 ដល់ 10 អាចជួបពិភាក្សាការងារបន្តិចបានទេ?"
  // It has "ការងារ" which has weight 15. But there are absolutely no scam indicator words (no "បង់", "កក់", "លុយ", "ថ្លៃ", etc.).
  // Therefore, it is a perfectly normal safe message!
  const hasCriticalScamIndicators = hasOtpOrCredentials || hasSecurityThreats || hasScreenshotWords || isInvestmentText ||
                                    cleanText.includes("ថ្លៃចុះឈ្មោះ") || cleanText.includes("registration fee") || cleanText.includes("register fee") || cleanText.includes("training fee") || cleanText.includes("ថ្លៃបណ្តុះបណ្តាល") ||
                                    cleanText.includes("បង់ប្រាក់មុន") || cleanText.includes("បង់លុយមុន") || cleanText.includes("deposit first") || cleanText.includes("pay first") || cleanText.includes("deposit") || cleanText.includes("កក់មុន") || cleanText.includes("កក់ប្រាក់មុន") || cleanText.includes("កក់លុយមុន") ||
                                    cleanText.includes("salary guaranteed") || cleanText.includes("ធានាប្រាក់ខែ") || cleanText.includes("passive income") || cleanText.includes("earn daily") || cleanText.includes("investment") || cleanText.includes("ចំណូលប្រចាំថ្ងៃ") || cleanText.includes("ប្រាក់ចំណេញ") ||
                                    cleanText.includes("limited stock") || cleanText.includes("cheap price") || cleanText.includes("delivery fee") || cleanText.includes("deliver fee") || cleanText.includes("pre-order") || cleanText.includes("ផ្ញើស្លីប") || cleanText.includes("វេរមុន") || cleanText.includes("វេរលុយមុន") || cleanText.includes("ចំនួនមានកំណត់") || cleanText.includes("ថោកណាស់") ||
                                    cleanText.includes("verify your account") || cleanText.includes("គណនីត្រូវបានបិទ") ||
                                    cleanText.includes("aba-verify") || cleanText.includes("acleda-update") ||
                                    cleanText.includes("រកលុយប្រចាំថ្ងៃ") || cleanText.includes("ដកលុយភ្លាមៗ") ||
                                    cleanText.includes("click link") || cleanText.includes("ចុចតំណ") || cleanText.includes("bit.ly") || cleanText.includes("tinyurl") ||
                                    cleanText.includes("prize") || cleanText.includes("won") || cleanText.includes("reward") || cleanText.includes("claim reward") || cleanText.includes("free money") || cleanText.includes("រង្វាន់") || cleanText.includes("ឈ្នះរង្វាន់") || cleanText.includes("ឈ្នះឡាន") || cleanText.includes("ឈ្នះម៉ូតូ") || cleanText.includes("lucky draw") || cleanText.includes("លុយហ្វ្រី") ||
                                    cleanText.includes("http") || cleanText.includes("www.") || cleanText.includes(".xyz") || cleanText.includes(".top") ||
                                    linkAnalysis.hasLink;

  if (!hasCriticalScamIndicators || riskScore < 25) {
    detectedType = "Normal Safe Message";
    riskScore = 0;
  }

  // Map to risk levels according to strict rules:
  // Low: 0–24, Medium: 25–54, High: 55–100
  let riskLevel: 'Low' | 'Medium' | 'High' = 'Low';
  if (riskScore >= 55) {
    riskLevel = 'High';
  } else if (riskScore >= 25) {
    riskLevel = 'Medium';
  }

  // ---------------- Confidence calculation ----------------
  // High   : many signals concentrated in one dominant scam type, or very high score
  // Medium : a few signals, or signals mixed across multiple categories
  // Low    : few / weak signals only
  let confidence: 'Low' | 'Medium' | 'High' = 'Low';
  if (detectedType !== "Normal Safe Message") {
    const dominantSignals = categorySignalCount[detectedType] || 0;
    const totalSignals = detectedSignals.length;

    if (dominantSignals >= 3 || (categoriesMatched === 1 && dominantSignals >= 2) || riskScore >= 80) {
      confidence = 'High';
    } else if (totalSignals >= 2 || dominantSignals >= 1 || riskScore >= 40) {
      confidence = 'Medium';
    } else {
      confidence = 'Low';
    }
  }

  // Generate bilingual rule-based explanations (Khmer + English)
  const explain = buildExplanations(detectedType);
  const reasonsKm = explain.reasonsKm;
  const reasonsEn = explain.reasonsEn;
  const safeNextStepsKm = explain.safeNextStepsKm;
  const safeNextStepsEn = explain.safeNextStepsEn;

  return {
    riskScore,
    riskLevel,
    detectedType,
    detectedSignals,
    confidence,
    reasons: reasonsEn,
    safeNextSteps: safeNextStepsEn,
    reasonsKm,
    reasonsEn,
    safeNextStepsKm,
    safeNextStepsEn,
    linkAnalysis
  };
}

export function analyzeLinksInText(text: string): LinkAnalysisResult {
  if (!text) {
    return {
      hasLink: false,
      detectedLinks: [],
      domains: [],
      linkRiskScore: 0,
      linkRiskLevel: "Low",
      linkWarningSignalsKm: [],
      linkWarningSignalsEn: [],
      linkSafeAdviceKm: [],
      linkSafeAdviceEn: []
    };
  }

  // Regex to detect links inside text (including shortened links)
  const urlRegex = /(https?:\/\/[^\s<>"]+|www\.[^\s<>"]+|\b[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}(?:\/[^\s<>"]*)?\b)/gi;
  const matches = text.match(urlRegex) || [];

  const detectedLinks: string[] = [];
  const domains: string[] = [];

  for (const m of matches) {
    let cleaned = m;
    // Clean trailing markdown/punctuation symbols
    while (cleaned.length > 0 && /[)\]}.,?!;:\/]$/.test(cleaned)) {
      cleaned = cleaned.slice(0, -1);
    }

    // Skip empty, emails, or numeric false positives
    if (!cleaned || cleaned.includes("@") || /^\d+$/.test(cleaned) || /^\d+%\+?$/.test(cleaned) || cleaned.length < 4) {
      continue;
    }

    // Ensure it contains a dot (domain format) or protocol
    if (!cleaned.includes(".") && !cleaned.startsWith("http")) {
      continue;
    }

    if (!detectedLinks.includes(cleaned)) {
      detectedLinks.push(cleaned);

      // Parse domain
      let domain = "";
      let lowerUrl = cleaned.toLowerCase();
      if (lowerUrl.startsWith("http://")) {
        const w = cleaned.substring(7);
        const s = w.indexOf("/");
        domain = s === -1 ? w : w.substring(0, s);
      } else if (lowerUrl.startsWith("https://")) {
        const w = cleaned.substring(8);
        const s = w.indexOf("/");
        domain = s === -1 ? w : w.substring(0, s);
      } else {
        const s = cleaned.indexOf("/");
        domain = s === -1 ? cleaned : cleaned.substring(0, s);
      }

      // Strip port if any
      const portIdx = domain.indexOf(":");
      if (portIdx !== -1) {
        domain = domain.substring(0, portIdx);
      }

      if (domain && !domains.includes(domain)) {
        domains.push(domain);
      }
    }
  }

  const hasLink = detectedLinks.length > 0;
  if (!hasLink) {
    return {
      hasLink: false,
      detectedLinks: [],
      domains: [],
      linkRiskScore: 0,
      linkRiskLevel: "Low",
      linkWarningSignalsKm: [],
      linkWarningSignalsEn: [],
      linkSafeAdviceKm: [],
      linkSafeAdviceEn: []
    };
  }

  let linkRiskScore = 0;
  const linkWarningSignalsKm: string[] = [];
  const linkWarningSignalsEn: string[] = [];

  // 1. http instead of https
  const hasHttp = detectedLinks.some(l => l.toLowerCase().startsWith("http://"));
  if (hasHttp) {
    linkRiskScore += 15;
    linkWarningSignalsKm.push("Link នេះប្រើ http មិនមែន https");
    linkWarningSignalsEn.push("This link uses http instead of https");
  }

  // 2. shortened link
  const hasShortened = domains.some(d => /bit\.ly|tinyurl|t\.co|cutt\.ly/i.test(d));
  if (hasShortened) {
    linkRiskScore += 25;
    linkWarningSignalsKm.push("Link នេះជាប្រភេទ shortened link ដូច្នេះគេអាចលាក់ Website ពិត");
    linkWarningSignalsEn.push("This link is a shortened URL, which can hide the real destination website");
  }

  // 3. suspicious login/verify words
  const hasLoginVerifyWords = detectedLinks.some(l => /login|verify|account|secure/i.test(l));
  if (hasLoginVerifyWords) {
    linkRiskScore += 25;
    linkWarningSignalsKm.push("Link នេះមើលទៅដូចជាសុំ Login ឬ Verify account");
    linkWarningSignalsEn.push("This link looks like a login or account verification request");
  }

  // 4. bank/payment words in domain or path
  const hasBankWords = detectedLinks.some(l => /bank|aba|acleda|bakong|khqr/i.test(l));
  if (hasBankWords) {
    linkRiskScore += 25;
    linkWarningSignalsKm.push("Domain មានពាក្យពាក់ព័ន្ធនឹងធនាគារ ឬការទូទាត់");
    linkWarningSignalsEn.push("The domain or path contains bank or payment-related words");
  }

  // 5. OTP/password words
  const hasOtpPassword = detectedLinks.some(l => /otp|password/i.test(l));
  if (hasOtpPassword) {
    linkRiskScore += 35;
    linkWarningSignalsKm.push("Link មានពាក្យពាក់ព័ន្ធនឹង OTP ឬលេខសម្ងាត់");
    linkWarningSignalsEn.push("The link contains OTP or password-related words");
  }

  // 6. urgent wording with link
  const hasUrgent = /urgent|immediate|បន្ទាន់|ប្រញាប់|ឥឡូវនេះ/i.test(text);
  if (hasUrgent) {
    linkRiskScore += 20;
    linkWarningSignalsKm.push("សារនេះប្រើពាក្យបន្ទាន់ជាមួយ Link");
    linkWarningSignalsEn.push("This message uses urgent wording alongside a link");
  }

  // 7. very long domain (length > 25)
  const hasVeryLongDomain = domains.some(d => d.replace(/^www\./i, "").length > 25);
  if (hasVeryLongDomain) {
    linkRiskScore += 15;
    linkWarningSignalsKm.push("Domain មើលទៅវែងខុសធម្មតា ដែលអាចជាការក្លែងបន្លំ");
    linkWarningSignalsEn.push("The domain is unusually long, which is a common tactic to impersonate real sites");
  }

  // 8. many hyphens in domain
  const hasManyHyphens = domains.some(d => (d.match(/-/g) || []).length >= 2);
  if (hasManyHyphens) {
    linkRiskScore += 10;
    linkWarningSignalsKm.push("Domain មានសញ្ញា (-) ច្រើនខុសពីធម្មតា");
    linkWarningSignalsEn.push("The domain contains an abnormally high number of hyphens");
  }

  // 9. suspicious reward/free/claim words
  const hasRewardWords = detectedLinks.some(l => /free|gift|reward|claim|bonus/i.test(l));
  if (hasRewardWords) {
    linkRiskScore += 20;
    linkWarningSignalsKm.push("Link មានពាក្យទាក់ទាញពីរង្វាន់ ឬការផ្តល់ជូនឥតគិតថ្លៃ");
    linkWarningSignalsEn.push("The link contains reward, free prize, or claim keywords");
  }

  // Cap link risk score at 100
  linkRiskScore = Math.min(linkRiskScore, 100);

  let linkRiskLevel: 'Low' | 'Medium' | 'High' = 'Low';
  if (linkRiskScore >= 55) {
    linkRiskLevel = 'High';
  } else if (linkRiskScore >= 25) {
    linkRiskLevel = 'Medium';
  }

  const linkSafeAdviceKm = [
    "កុំចុច Link ប្រសិនបើអ្នកមិនប្រាកដប្រភព។",
    "កុំបញ្ចូល OTP, Password, PIN ឬព័ត៌មានធនាគារ។",
    "បើវាអះអាងថាមកពីធនាគារ សូមបើក App ធនាគារផ្ទាល់ ឬទាក់ទងលេខផ្លូវការ។",
    "ពិនិត្យឈ្មោះ Domain ឱ្យច្បាស់ មុនពេល Login។",
    "ប្រសិនបើអ្នកបានចុចរួច សូមប្តូរ Password និងពិនិត្យគណនីភ្លាមៗ។"
  ];

  const linkSafeAdviceEn = [
    "Do not click the link if you are not sure about the source.",
    "Do not enter OTP, password, PIN, or bank information.",
    "If it claims to be from a bank, open the official bank app or contact the official number.",
    "Check the domain carefully before logging in.",
    "If you already clicked it, change your password and check your account immediately."
  ];

  return {
    hasLink: true,
    detectedLinks,
    domains,
    linkRiskScore,
    linkRiskLevel,
    linkWarningSignalsKm,
    linkWarningSignalsEn,
    linkSafeAdviceKm,
    linkSafeAdviceEn
  };
}
