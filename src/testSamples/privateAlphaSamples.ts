/**
 * Private Alpha test dataset for the ScamCheck KH rule-based analyzer.
 *
 * PURPOSE: A repeatable, realistic set of Khmer / English / mixed messages used
 * to QA the rule-based analyzer before sharing the app with real users.
 *
 * PRIVACY RULE: These are FAKE examples only. They contain NO real OTPs, real
 * bank account numbers, real phone numbers, real national IDs, or any real
 * private data. All numbers/handles are obvious placeholders.
 *
 * The QA runner (runPrivateAlphaAnalyzerQA.ts) tests ONLY the rule-based
 * analyzer output — Gemini is never used for testing decisions.
 */

export type ExpectedType =
  | 'Fake Job Scam'
  | 'Bank / OTP Scam'
  | 'KHQR / Payment Scam'
  | 'Online Shopping Scam'
  | 'Investment Scam'
  | 'Suspicious Link'
  | 'Prize Scam'
  | 'Account Security Scam'
  | 'Normal Safe Message';

export type ExpectedRiskLevel = 'Low' | 'Medium' | 'High';

export interface AlphaSample {
  id: string;
  text: string;
  expectedType: ExpectedType;
  expectedRiskLevel: ExpectedRiskLevel;
  notes: string;
}

export const PRIVATE_ALPHA_SAMPLES: AlphaSample[] = [
  // ───────────────────────────── Fake Job Scam ─────────────────────────────
  {
    id: 'fake-job-001',
    text: 'ការងារ Telegram ធ្វើពីផ្ទះ ចំណូលខ្ពស់! ត្រូវបង់ថ្លៃចុះឈ្មោះ $5 បង់ប្រាក់មុនមកគណនី ACLEDA ដើម្បីចាប់ផ្តើម។',
    expectedType: 'Fake Job Scam',
    expectedRiskLevel: 'High',
    notes: 'KH job offer demanding registration fee + upfront payment.',
  },
  {
    id: 'fake-job-002',
    text: 'Work from home job, no experience needed. Registration fee only $10, pay first via ABA to activate your account.',
    expectedType: 'Fake Job Scam',
    expectedRiskLevel: 'High',
    notes: 'EN remote job with registration fee and pay-first demand.',
  },
  {
    id: 'fake-job-003',
    text: 'ការងារ part-time ល្អ salary guaranteed! សូមបង់ training fee មុនពេលចាប់ផ្តើមការងារ។',
    expectedType: 'Fake Job Scam',
    expectedRiskLevel: 'High',
    notes: 'Mixed KH/EN job with training fee + salary guaranteed.',
  },
  {
    id: 'fake-job-004',
    text: 'Easy job on Facebook! Deposit $20 first to reserve your slot. ការងារងាយស្រួល បង់ប្រាក់មុន។',
    expectedType: 'Fake Job Scam',
    expectedRiskLevel: 'High',
    notes: 'Mixed easy-job offer with deposit + upfront payment.',
  },
  {
    id: 'fake-job-005',
    text: 'ជ្រើសរើសបុគ្គលិកការងារ ត្រូវបង់ថ្លៃបណ្តុះបណ្តាល និងកក់លុយមុនទើបទទួលបាន។',
    expectedType: 'Fake Job Scam',
    expectedRiskLevel: 'High',
    notes: 'KH recruitment requiring training fee + deposit.',
  },

  // ──────────────────────────── Bank / OTP Scam ────────────────────────────
  {
    id: 'bank-otp-001',
    text: 'ABA ជូនដំណឹង៖ គណនីត្រូវបានបិទ។ សូមផ្ញើលេខកូដ OTP របស់អ្នកមកវិញ ដើម្បីបើកដំណើរការ។',
    expectedType: 'Bank / OTP Scam',
    expectedRiskLevel: 'High',
    notes: 'KH bank impersonation asking for OTP.',
  },
  {
    id: 'bank-otp-002',
    text: 'Your ACLEDA account has been suspended. Send your OTP code now to verify your account.',
    expectedType: 'Bank / OTP Scam',
    expectedRiskLevel: 'High',
    notes: 'EN account-suspended + OTP request (credential theft dominates).',
  },
  {
    id: 'bank-otp-003',
    text: 'Bakong support: please confirm your PIN and password to keep your account active. ផ្ញើ PIN មកវិញ។',
    expectedType: 'Bank / OTP Scam',
    expectedRiskLevel: 'High',
    notes: 'Mixed request for PIN + password.',
  },
  {
    id: 'bank-otp-004',
    text: 'ធនាគារ Wing៖ សូមប្រាប់លេខកូដ OTP និងពាក្យសម្ងាត់របស់អ្នកដើម្បីផ្ទៀងផ្ទាត់គណនី។',
    expectedType: 'Bank / OTP Scam',
    expectedRiskLevel: 'High',
    notes: 'KH asking for OTP + password.',
  },
  {
    id: 'bank-otp-005',
    text: 'Security alert: confirm your password and OTP immediately or your account will be locked.',
    expectedType: 'Bank / OTP Scam',
    expectedRiskLevel: 'High',
    notes: 'EN urgency + password/OTP request.',
  },

  // ─────────────────────────── Online Shopping Scam ────────────────────────
  {
    id: 'shopping-001',
    text: 'ហាងលក់អនឡាញ៖ iPhone តម្លៃ ថោកណាស់! ចំនួនមានកំណត់ សូមវេរលុយមុនដើម្បីកក់ទុក។',
    expectedType: 'Online Shopping Scam',
    expectedRiskLevel: 'High',
    notes: 'KH online shop, unusually cheap + transfer first to reserve.',
  },
  {
    id: 'shopping-002',
    text: 'Online shop sale! Cheap price, limited stock. Pay first and we add a small delivery fee.',
    expectedType: 'Online Shopping Scam',
    expectedRiskLevel: 'High',
    notes: 'EN cheap price + limited stock + pay first + delivery fee.',
  },
  {
    id: 'shopping-003',
    text: 'Facebook shop៖ pre-order ស្បែកជើងថ្មី តម្លៃ ថោកណាស់ សូមវេរលុយមុន គ្មាន COD ទេ។',
    expectedType: 'Online Shopping Scam',
    expectedRiskLevel: 'High',
    notes: 'Mixed pre-order, cheap, transfer first, no COD.',
  },
  {
    id: 'shopping-004',
    text: 'Online store clearance: cheap price, limited stock, delivery fee applies, transfer before we ship.',
    expectedType: 'Online Shopping Scam',
    expectedRiskLevel: 'High',
    notes: 'EN online store with cheap price + limited stock + delivery fee.',
  },
  {
    id: 'shopping-005',
    text: 'ហាងលក់អនឡាញ ៖ ទំនិញ ថោកណាស់ ចំនួនមានកំណត់ សូមវេរលុយមុនដើម្បីកក់ទុក។',
    expectedType: 'Online Shopping Scam',
    expectedRiskLevel: 'High',
    notes: 'KH online shop, cheap + transfer first to reserve.',
  },

  // ───────────────────────────── Investment Scam ───────────────────────────
  {
    id: 'investment-001',
    text: 'វិនិយោគ Crypto ធានាចំណេញ ១០០%! គ្មានហានិភ័យ ដាក់លុយថ្ងៃនេះ ទទួលប្រាក់ចំណេញទ្វេដង។',
    expectedType: 'Investment Scam',
    expectedRiskLevel: 'High',
    notes: 'KH crypto guaranteed profit, risk-free, double money.',
  },
  {
    id: 'investment-002',
    text: 'Crypto investment with guaranteed profit! Double money and earn daily passive income, risk free.',
    expectedType: 'Investment Scam',
    expectedRiskLevel: 'High',
    notes: 'EN guaranteed profit + double money + passive income.',
  },
  {
    id: 'investment-003',
    text: 'Forex investment group: passive income, earn daily. ការវិនិយោគ ធានាចំណេញខ្ពស់រាល់ថ្ងៃ។',
    expectedType: 'Investment Scam',
    expectedRiskLevel: 'High',
    notes: 'Mixed forex/investment with guaranteed daily profit.',
  },
  {
    id: 'investment-004',
    text: 'ដាក់លុយវិនិយោគជាមួយយើង ទទួលបានប្រាក់ចំណេញ ប្រចាំថ្ងៃ ធានាចំណេញ គ្មានហានិភ័យ។',
    expectedType: 'Investment Scam',
    expectedRiskLevel: 'High',
    notes: 'KH invest + daily profit + guaranteed + risk-free.',
  },
  {
    id: 'investment-005',
    text: 'Join our VIP investment scheme: guaranteed returns, double income, risk free crypto trading.',
    expectedType: 'Investment Scam',
    expectedRiskLevel: 'High',
    notes: 'EN VIP investment with guaranteed returns + double income.',
  },

  // ───────────────────────────── Suspicious Link ───────────────────────────
  {
    id: 'link-001',
    text: 'Please click this link to continue your registration: https://bit.ly/abc12345xyz',
    expectedType: 'Suspicious Link',
    expectedRiskLevel: 'High',
    notes: 'EN click-link + shortened bit.ly URL.',
  },
  {
    id: 'link-002',
    text: 'សូមចុចតំណនេះដើម្បីបន្ត៖ https://tinyurl.com/scamcheck-demo',
    expectedType: 'Suspicious Link',
    expectedRiskLevel: 'High',
    notes: 'KH click-link + shortened tinyurl.',
  },
  {
    id: 'link-003',
    text: 'Click this link to update your details: http://service-update.top/continue',
    expectedType: 'Suspicious Link',
    expectedRiskLevel: 'High',
    notes: 'EN click-link + untrusted .top domain over http.',
  },

  // ───────────────────────────────── Prize Scam ────────────────────────────
  {
    id: 'prize-001',
    text: 'Congratulations! You won a prize. Claim your reward now — free money is waiting for you!',
    expectedType: 'Prize Scam',
    expectedRiskLevel: 'High',
    notes: 'EN unsolicited prize + claim reward + free money.',
  },
  {
    id: 'prize-002',
    text: 'អបអរសាទរ! អ្នកបានឈ្នះរង្វាន់ធំ។ សូមទទួលរង្វាន់ឥឡូវនេះ មុនពេលផុតកំណត់។',
    expectedType: 'Prize Scam',
    expectedRiskLevel: 'High',
    notes: 'KH won a big prize + claim now.',
  },

  // ──────────────── Research-based samples (RESEARCH_SOURCES.md v3) ─────────
  {
    id: 'research-bank-phish-001',
    text: 'Your ABA account is blocked. Click https://aba-verify-kh.example to verify your account immediately.',
    expectedType: 'Account Security Scam',
    expectedRiskLevel: 'High',
    notes: 'Bank/account phishing: aba-verify hook + account blocked + verify your account. Uses reserved .example domain — no real domain, no private data.',
  },
  {
    id: 'research-fake-job-001',
    text: 'ការងារក្រៅម៉ោង ងាយស្រួល! រកលុយប្រចាំថ្ងៃ ដកលុយភ្លាមៗ គ្រាន់តែចុច Like វីដេអូ។',
    expectedType: 'Fake Job Scam',
    expectedRiskLevel: 'High',
    notes: 'KH task-commission scam wording: រកលុយប្រចាំថ្ងៃ + ដកលុយភ្លាមៗ. No private data.',
  },

  // ─────────────────────────── Normal / Safe Messages ──────────────────────
  {
    id: 'safe-001',
    text: 'Reminder: team meeting at 3pm today. ជួបគ្នានៅការិយាល័យ កុំភ្លេចណា។',
    expectedType: 'Normal Safe Message',
    expectedRiskLevel: 'Low',
    notes: 'Meeting reminder — no scam signals.',
  },
  {
    id: 'safe-002',
    text: 'Your parcel is out for delivery and will arrive today between 9 and 11 am. No action needed.',
    expectedType: 'Normal Safe Message',
    expectedRiskLevel: 'Low',
    notes: 'Delivery update with no payment request.',
  },
  {
    id: 'safe-003',
    text: 'ក្រុមហ៊ុនយើងកំពុងជ្រើសរើសបុគ្គលិកផ្នែកលក់។ សូមផ្ញើ CV តាមអ៊ីមែល។ មិនមានការប្រមូលប្រាក់ឡើយ។',
    expectedType: 'Normal Safe Message',
    expectedRiskLevel: 'Low',
    notes: 'Normal job announcement, explicitly no fees.',
  },
  {
    id: 'safe-004',
    text: 'ABA៖ សូមអរគុណដែលបានប្រើប្រាស់សេវាកម្មរបស់យើង។ សូមរក្សាសុវត្ថិភាពព័ត៌មានរបស់អ្នកជានិច្ច។',
    expectedType: 'Normal Safe Message',
    expectedRiskLevel: 'Low',
    notes: 'Normal bank thank-you reminder, no OTP request.',
  },
  {
    id: 'safe-005',
    text: 'Thanks for your order! Your items are ready and you can visit our shop anytime. Have a great day!',
    expectedType: 'Normal Safe Message',
    expectedRiskLevel: 'Low',
    notes: 'Normal shop message with no payment pressure.',
  },
  {
    id: 'safe-006',
    text: 'ACLEDA ៖ ប្រតិបត្តិការរបស់អ្នកបានជោគជ័យ។ សូមអរគុណសម្រាប់ការប្រើប្រាស់សេវាកម្ម ABA និង ACLEDA របស់យើង។',
    expectedType: 'Normal Safe Message',
    expectedRiskLevel: 'Low',
    notes: 'Bank names (ABA/ACLEDA) alone must NOT be High risk — no phishing hook, OTP, or verification request.',
  },
];
