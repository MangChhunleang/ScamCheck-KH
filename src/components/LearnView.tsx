import React, { useState } from 'react';
import { 
  Briefcase, Landmark, QrCode, Coins, Link as LinkIcon, 
  ShieldAlert, ShoppingBag, Search, ArrowLeft, Check, AlertCircle, ChevronRight
} from 'lucide-react';
import { Language } from '../types';

interface LearnViewProps {
  language: Language;
  onCheckNow?: () => void;
}

interface ActionStep {
  textKm: string;
  textEn: string;
}

interface ScamType {
  id: string;
  titleKm: string;
  titleEn: string;
  shortDescKm: string;
  shortDescEn: string;
  categoryTag: 'Job' | 'Bank' | 'Payment' | 'Link' | 'Investment' | 'Account' | 'Shopping';
  riskLevel: 'Low' | 'Medium' | 'High';
  icon: React.ComponentType<any>;
  whatItIsKm: string;
  whatItIsEn: string;
  warningSigns: ActionStep[];
  exampleKm: string;
  exampleEn: string;
  whatToDo: ActionStep[];
}

const SCAM_TYPES: ScamType[] = [
  {
    id: "fake-job",
    titleKm: "ការងារក្លែងក្លាយ (Fake Job Scam)",
    titleEn: "Fake Job Scam",
    shortDescKm: "បោកបញ្ឆោតឱ្យធ្វើការងារងាយៗបានចំណូលខ្ពស់ ប៉ុន្តែទាមទារឱ្យបង់ប្រាក់ចុះឈ្មោះ ឬកក់លុយមុន។",
    shortDescEn: "Offers easy, high-paying jobs but demands registration fees or deposits upfront.",
    categoryTag: "Job",
    riskLevel: "High",
    icon: Briefcase,
    whatItIsKm: "ជនបោកប្រាស់ផ្សព្វផ្សាយការងារងាយៗអនឡាញ (ដូចជាការចុច Likes, វាយអត្ថបទ ឬបំពេញភារកិច្ច) រួចតម្រូវឱ្យអ្នកបង់ថ្លៃចុះឈ្មោះ ថ្លៃទិញសម្ភារៈ ឬថ្លៃបណ្តុះបណ្តាលជាមុនទើបអាចចាប់ផ្តើមបាន។",
    whatItIsEn: "Scammers advertise easy online tasks (like liking videos, typing, or rating items) and demand upfront deposits, processing, or training fees before you can begin earning.",
    warningSigns: [
      { textKm: "សុំថ្លៃចុះឈ្មោះ ឬកក់ប្រាក់មុនពេលចូលធ្វើការ", textEn: "Demanding a registration fee or deposit before starting work" },
      { textKm: "សន្យាផ្តល់កម្រៃជើងសារខ្ពស់ខុសពីធម្មតាសម្រាប់ភារកិច្ចងាយៗ", textEn: "Promising extremely high payouts or commissions for trivial tasks" },
      { textKm: "ប្រើប្រាស់គណនី Email ទូទៅ (ដូចជា Gmail) និងមិនមានព័ត៌មានក្រុមហ៊ុនច្បាស់លាស់", textEn: "Communicating via personal emails (Gmail) with no verified company website" }
    ],
    exampleKm: "“បង! ត្រូវការបុគ្គលិកធ្វើការក្រៅម៉ោងពីផ្ទះ ចុច Like វីដេអូបានចំណូល $20-$50 ក្នុងមួយថ្ងៃ។ សូមបង់ថ្លៃចុះឈ្មោះ $5 តាម KHQR ឥឡូវនេះដើម្បីចាប់ផ្តើម!”",
    exampleEn: "“Hi! We are hiring remote part-time workers to like videos for $20-$50 daily. Pay a tiny $5 registration fee via KHQR now to reserve your spot!”",
    whatToDo: [
      { textKm: "កុំបង់ថ្លៃចុះឈ្មោះ ឬកក់ប្រាក់ដើម្បីទទួលបានការងារទោះជាក្នុងករណីណាក៏ដោយ", textEn: "Never pay any upfront fees, deposits, or registration charges to secure a job" },
      { textKm: "ស្វែងរក និងទាក់ទងក្រុមហ៊ុនផ្ទាល់តាមរយៈ Website ឬទំព័រផ្លូវការដែលមានសញ្ញាគ្រីស្បែកតាំង", textEn: "Verify jobs by contacting companies directly through blue-badge verified social channels" }
    ]
  },
  {
    id: "bank-otp",
    titleKm: "ធនាគារ ឬការលួច OTP (Bank / OTP Scam)",
    titleEn: "Bank / OTP Scam",
    shortDescKm: "បន្លំខ្លួនជាបុគ្គលិកធនាគារដើម្បីសុំលេខ OTP លេខកូដ PIN ឬឱ្យចូល Link ក្លែងក្លាយដើម្បីដោះស្រាយបញ្ហាគណនី។",
    shortDescEn: "Impersonates bank staff to steal your OTPs, PINs, or force login to fake portals.",
    categoryTag: "Bank",
    riskLevel: "High",
    icon: Landmark,
    whatItIsKm: "ជនខិលខូចទូរស័ព្ទមកដោយបន្លំជាបុគ្គលិកធនាគារ ហើយបំភ័យថាគណនីរបស់អ្នកត្រូវបានគេលួចចូល ឬបិទបណ្ដោះអាសន្ន រួចទាមទារលេខ OTP លេខកូដ PIN ឬឱ្យចុច Link ដើម្បីបំពេញព័ត៌មានឡើងវិញ។",
    whatItIsEn: "Scammers call posing as customer support representatives, claiming your account is blocked or hacked, then demand your OTP codes, PINs, or prompt you to log into cloned websites.",
    warningSigns: [
      { textKm: "សួររកលេខកូដ OTP លេខសម្ងាត់ PIN ឬ Password ធនាគាររបស់អ្នក", textEn: "Directly asking you for mobile bank app passwords, PINs, or SMS OTP codes" },
      { textKm: "គំរាមកំហែងថាគណនីរបស់អ្នកនឹងត្រូវបិទ ឬបង្កកប្រតិបត្តិការភ្លាមៗបើមិនសហការ", textEn: "Threatening immediate account suspension or legal action if you do not comply on the spot" }
    ],
    exampleKm: "“គណនី ABA របស់អ្នកត្រូវបានរកឃើញថាមិនមានសុវត្ថិភាព។ សូមប្រាប់លេខកូដ OTP ៦ខ្ទង់ដែលបានផ្ញើទៅទូរស័ព្ទរបស់លោកអ្នកឥឡូវនេះ ដើម្បីចៀសវាងការបិទគណនី។”",
    exampleEn: "“Your ABA account has been flagged for suspicious logins. Please read back the 6-digit OTP sent to your mobile phone right now to secure it.”",
    whatToDo: [
      { textKm: "រក្សាភាពស្ងប់ស្ងៀម និងបដិសេធរាល់ការសួររក OTP ឬ PIN (ធនាគារពិតប្រាកដមិនដែលសួរឡើយ)", textEn: "Never share OTPs or PINs. Legitimate bank staff will never ask for them" },
      { textKm: "ទាក់ទងមកកាន់លេខទូរស័ព្ទគាំទ្រផ្លូវការដែលមាននៅលើខ្នងកាតធនាគាររបស់អ្នកផ្ទាល់", textEn: "Call the official support hotline printed on the back of your physical banking card" }
    ]
  },
  {
    id: "khqr-payment",
    titleKm: "ការទូទាត់ ឬ KHQR (KHQR / Payment Scam)",
    titleEn: "KHQR / Payment Scam",
    shortDescKm: "ប្រើប្រាស់វិក្កយបត្រផ្ទេរប្រាក់ក្លែងក្លាយ ឬផ្ញើ KHQR បោកបញ្ឆោតដើម្បីឱ្យជនរងគ្រោះផ្ញើលុយ។",
    shortDescEn: "Uses edited payment receipts or deceptive KHQR codes to bypass actual fund verification.",
    categoryTag: "Payment",
    riskLevel: "High",
    icon: QrCode,
    whatItIsKm: "ជនបោកប្រាស់ផ្ញើរូបភាពវិក្កយបត្រផ្ទេរលុយដែលបានកាត់តរូបភាព (Screenshot) ដើម្បីឱ្យអ្នកជឿថាបានបង់លុយរួចហើយ ឬផ្ញើ KHQR ក្លែងក្លាយឱ្យអ្នកស្កេនទូទាត់ប្រាក់ទៅពួកគេជំនួសវិញ។",
    whatItIsEn: "Scammers send altered or cloned transfer screenshots to merchants to simulate a payment. They may also send deceptive payment KHQR codes that pull funds out of your account instead of depositing them.",
    warningSigns: [
      { textKm: "រូបភាព Screenshot ផ្ទេរប្រាក់មើលទៅចម្លែកៗ វៀចអក្សរ ឬមានស្នាមកាត់ត", textEn: "Transfer slip screenshots with blurry texts, misaligned fonts, or suspicious edits" },
      { textKm: "អ្នកទិញជម្រុញឱ្យផ្ញើទំនិញចេញភ្លាមៗមុនពេលអ្នកមានពេលពិនិត្យគណនីធនាគារ", textEn: "The buyer rushes delivery or cargo pickup before you can verify your bank app balance" }
    ],
    exampleKm: "“ខ្ញុំបានផ្ទេរប្រាក់ទៅបងរួចហើយ នេះជា Screenshot បង់ប្រាក់។ ឡានដឹកជញ្ជូនជិតចេញទៅហើយ សូមផ្ញើទំនិញឱ្យខ្ញុំឥឡូវនេះភ្លាម!”",
    exampleEn: "“I have transferred the money to your account, here is the receipt screenshot. The transport van is leaving, please load the package now!”",
    whatToDo: [
      { textKm: "តែងតែបើក App ធនាគាររបស់ខ្លួនផ្ទាល់ ដើម្បីផ្ទៀងផ្ទាត់ឈ្មោះ និងសមតុល្យទឹកប្រាក់ពិតប្រាកដ", textEn: "Always open your mobile banking application directly to verify that funds actually cleared" },
      { textKm: "កុំស្កេន KHQR ណាមួយដែលអ្នកមិនច្បាស់លាស់ពីប្រភព ឬគោលបំណង", textEn: "Do NOT scan arbitrary KHQR codes unless you understand what the payment is for" }
    ]
  },
  {
    id: "online-shopping",
    titleKm: "ទិញទំនិញអនឡាញ (Online Shopping Scam)",
    titleEn: "Online Shopping Scam",
    shortDescKm: "បង្កើតហាងអនឡាញក្លែងក្លាយ លក់ទំនិញតម្លៃថោកខ្លាំងខុសធម្មតា រួចគេចខ្លួនបាត់បន្ទាប់ពីទទួលបានលុយ។",
    shortDescEn: "Fake online pages selling items at deep discounts, escaping after collecting advanced payment.",
    categoryTag: "Shopping",
    riskLevel: "Medium",
    icon: ShoppingBag,
    whatItIsKm: "ជនបោកប្រាស់បង្កើតទំព័រហ្វេសប៊ុកលក់ទំនិញអនឡាញក្លែងក្លាយ ដោយការបញ្ចុះតម្លៃរហូតដល់ ៧០% ឬ ៨០% រួចតម្រូវឱ្យអ្នកផ្ទេរលុយមុនទាំងអស់ រួចហើយនឹងបិទគណនី ឬផ្ញើទំនិញខុសគុណភាព/ទំនិញខុសមកជំនួសវិញ។",
    whatItIsEn: "Scammers set up fake social media pages advertising high-value items at unrealistic discounts. They demand upfront transfers via KHQR and then block you or deliver counterfeit/damaged items.",
    warningSigns: [
      { textKm: "តម្លៃទំនិញថោកខ្លាំងខុសពីទីផ្សារធម្មតាឆ្ងាយខ្លាំងណាស់", textEn: "Product pricing is ridiculously cheap compared to standard market rates" },
      { textKm: "មិនព្រមផ្ញើទំនិញដោយប្រើសេវាបង់លុយពេលទំនិញដល់ដៃ (Cash on Delivery - COD)", textEn: "Refusing Cash on Delivery (COD) services even if you offer to cover delivery costs" }
    ],
    exampleKm: "“លក់បង្ហើយស្តុកបញ្ចុះតម្លៃពិសេស ៧០%! ទូរស័ព្ទ iPhone ១៥ តម្លៃត្រឹមតែ ១៥០ ដុល្លារប៉ុណ្ណោះ។ ផ្ទេរលុយមុន ផ្ញើជូនឥតគិតថ្លៃ។”",
    exampleEn: "“Clearance Sale 70% Off! iPhone 15 for only $150. Limited stock. Transfer upfront for free nationwide express delivery.”",
    whatToDo: [
      { textKm: "ជ្រើសរើសការទូទាត់ប្រាក់នៅពេលទំនិញមកដល់ដៃផ្ទាល់ (Cash on Delivery) ជានិច្ច", textEn: "Insist on Cash on Delivery (COD) so you can check the goods before paying" },
      { textKm: "ពិនិត្យកាលបរិច្ឆេទបង្កើតទំព័រ Facebook Page និងការវាយតម្លៃពីអតិថិជនពិតប្រាកដ", textEn: "Inspect page transparency settings, creation history, and real customer reviews" }
    ]
  },
  {
    id: "investment",
    titleKm: "វិនិយោគក្លែងក្លាយ (Investment Scam)",
    titleEn: "Investment / Crypto Scam",
    shortDescKm: "ធានាការផ្តល់ប្រាក់ចំណេញខ្ពស់ខុសធម្មតា ឬការទ្វេដងលុយក្នុងរយៈពេលខ្លីតាមរយៈ Crypto ឬ Trading។",
    shortDescEn: "Guarantees unrealistically high returns or doubled money in a short time.",
    categoryTag: "Investment",
    riskLevel: "High",
    icon: Coins,
    whatItIsKm: "ជនបោកប្រាស់អូសទាញអ្នកឱ្យចូលរួមក្រុម Telegram ឬ Facebook វិនិយោគ។ ពួកគេសន្យាថានឹងផ្តល់ប្រាក់ចំណេញខ្ពស់ និងគ្មានហានិភ័យឡើយ។ ដំបូងឡើយ ពួកគេអាចឱ្យអ្នកដកលុយចំណេញបន្តិចបន្តួចដើម្បីបង្កើតទំនុកចិត្ត បន្ទាប់មកនៅពេលអ្នកដាក់លុយច្រើន ពួកគេនឹងបិទគណនី និងរត់គេចខ្លួនបាត់។",
    whatItIsEn: "Scammers recruit victims into investment channels, promising guaranteed high returns. They might pay out small profits initially to lure you into depositing larger amounts, after which they freeze your account.",
    warningSigns: [
      { textKm: "ធានាថានឹងទទួលបានប្រាក់ចំណេញ ១០០% ដោយគ្មានហានិភ័យ", textEn: "Promising guaranteed daily payouts with absolutely zero financial risk" },
      { textKm: "តម្រូវឱ្យបង់លុយបន្ថែមដើម្បីអាចដកប្រាក់ចំណេញចាស់ចេញបាន", textEn: "Demanding further deposits or fees to 'unlock' and withdraw accumulated profits" }
    ],
    exampleKm: "“ឱកាសវិនិយោគពិសេស! ដាក់លុយ $100 ទទួលបាន $200 ត្រឡប់មកវិញក្នុងរយៈពេល ២៤ ម៉ោង។ ចំណេញពិតប្រាកដធានា ១០០%!”",
    exampleEn: "“Guaranteed high-yield investment! Invest $100 and receive $200 returns back in just 24 hours. Safe and 100% passive income!”",
    whatToDo: [
      { textKm: "ចងចាំថាការវិនិយោគពិតប្រាកដដែលមានចំណេញខ្ពស់តែងតែមកជាមួយហានិភ័យខ្ពស់ជានិច្ច", textEn: "Always remember that high-yield offers inevitably carry high financial risks" },
      { textKm: "ចាកចេញពីក្រុមជជែកតេឡេក្រាមចម្លែកៗ ដែលត្រូវបានបន្ថែមដោយគ្មានការអនុញ្ញាត", textEn: "Exit and block unrecognized Telegram groups that add you without your permission" }
    ]
  },
  {
    id: "suspicious-link",
    titleKm: "លីងគួរឱ្យសង្ស័យ (Suspicious Link)",
    titleEn: "Suspicious Link",
    shortDescKm: "ផ្ញើតំណភ្ជាប់ក្លែងក្លាយតាមរយៈ SMS, Telegram ឬ Email ដើម្បីលួចយកគណនី ឬចម្លងមេរោគចូលទូរស័ព្ទ។",
    shortDescEn: "Sends phishing links via chat or SMS to hijack social profiles or install spyware.",
    categoryTag: "Link",
    riskLevel: "High",
    icon: LinkIcon,
    whatItIsKm: "ជនខិលខូចផ្ញើសារភ្ជាប់ជាមួយ Link គួរឱ្យសង្ស័យ ដែលនាំអ្នកទៅកាន់វេបសាយក្លែងក្លាយ login ដើម្បីលួចយក Password, OTP ឬទាញយកកម្មវិធីចម្លែក (.apk) ដើម្បីគ្រប់គ្រងទូរស័ព្ទរបស់អ្នក។",
    whatItIsEn: "Scammers send deceptive hyperlinks via SMS or Telegram. Clicking them directs you to cloned login pages that harvest credentials, or downloads spyware APK files to control your phone.",
    warningSigns: [
      { textKm: "តំណភ្ជាប់មិនមែនជា Website ផ្លូវការរបស់ក្រុមហ៊ុន (ដូចជា .xyz, .top, .info ជំនួសឱ្យ .com)", textEn: "The URL ends with strange domains like .xyz, .info, .top, or matches a fake layout" },
      { textKm: "ឈ្មោះ Website មានសរសេរខុសអក្ខរាវិរុទ្ធ (ឧទាហរណ៍៖ telegram-safety-check.com)", textEn: "The link has slight typos or elongated domain spellings to mimic real services" }
    ],
    exampleKm: "“គណនី Facebook របស់អ្នកនឹងត្រូវបានបិទក្នុងរយៈពេល ២៤ ម៉ោងខាងមុខ។ សូមចុច Link នេះដើម្បី Login និងផ្ទៀងផ្ទាត់ឡើងវិញ៖ https://fb-security-verify.xyz/account”",
    exampleEn: "“Your Facebook account will be locked in 24 hours due to guidelines. Please click this link to verify ownership: https://fb-security-verify.xyz/account”",
    whatToDo: [
      { textKm: "កុំចុចលើតំណភ្ជាប់នោះ ប្រសិនបើអ្នកមិនប្រាកដពីប្រភពច្បាស់លាស់", textEn: "Do NOT click the link if you cannot confirm the authenticity of the sender" },
      { textKm: "ប្រសិនបើអ្នកចង់ផ្ទៀងផ្ទាត់ សូមចូលទៅកាន់ App ផ្លូវការផ្ទាល់ ឬវាយឈ្មោះ Website ដោយខ្លួនឯង", textEn: "To verify, open the official app directly or type the known correct URL yourself" }
    ]
  },
  {
    id: "account-security",
    titleKm: "បន្លំសុវត្ថិភាពគណនី (Account Security Scam)",
    titleEn: "Account Security Scam",
    shortDescKm: "ផ្ញើសារព្រមានក្លែងក្លាយថាគណនី Facebook, Telegram ឬ Google របស់អ្នកនឹងត្រូវលុបចោល បើមិនចុច Link បញ្ជាក់។",
    shortDescEn: "Sends fake security warnings claiming your social profiles will be disabled unless verified.",
    categoryTag: "Account",
    riskLevel: "High",
    icon: ShieldAlert,
    whatItIsKm: "ជនខិលខូចផ្ញើសារព្រមានក្លែងក្លាយដោយបន្លំជាប្រព័ន្ធសុវត្ថិភាព ដើម្បីបំភ័យថាគណនីរបស់អ្នកល្មើសច្បាប់ រួចតម្រូវឱ្យអ្នកចុច Link ឬផ្តល់លេខកូដសង្គ្រោះគណនីឡើងវិញ។",
    whatItIsEn: "Scammers draft fake compliance warnings formatted to look like official tech support. They threaten profile deactivation to force you into exposing 2FA codes or recovery keys.",
    warningSigns: [
      { textKm: "សារគំរាមកំហែងថានឹងបិទ ឬលុបគណនីចោលជាបន្ទាន់ (ក្នុងរយៈពេល ២៤ម៉ោង)", textEn: "Urgent scare tactics threatening account deactivation within 24 hours" },
      { textKm: "សារព្រមានផ្ញើចេញពីទំព័រធម្មតា ឬគណនី chat ធម្មតា (ដែលប្តូរឈ្មោះ និង Logo ក្រុមហ៊ុន)", textEn: "Alerts sent via direct messaging or ordinary profiles renamed with corporate logos" }
    ],
    exampleKm: "“គណនី Telegram របស់អ្នកត្រូវបានរកឃើញថាមិនមានសុវត្ថិភាព។ សូមផ្ទៀងផ្ទាត់ឡើងវិញតាមរយៈ link: https://telegram-safety-check.example.com ដើម្បីកុំឱ្យបាត់បង់គណនី។”",
    exampleEn: "“Your Telegram account has been flagged for security issues. Please verify your ownership via: https://telegram-safety-check.example.com to avoid lockout.”",
    whatToDo: [
      { textKm: "តែងតែបើកការផ្ទៀងផ្ទាត់ ២ ជំហាន (Two-Factor Authentication / 2FA) លើគណនីរបស់អ្នកជានិច្ច", textEn: "Always enable Two-Factor Authentication (2FA) directly inside official apps to protect yourself" },
      { textKm: "ពិនិត្យការកំណត់ឧបករណ៍ដែលកំពុង Login (Active Devices) នៅក្នុង App ផ្លូវការ រួចលុបឧបករណ៍ប្លែកៗចោល", textEn: "Inspect logged-in devices (Active Sessions) in your settings and revoke any unauthorized sessions" }
    ]
  }
];

export default function LearnView({ language, onCheckNow }: LearnViewProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const currentScam = SCAM_TYPES.find(item => item.id === selectedId);

  const filteredScamTypes = SCAM_TYPES.filter(item => {
    const query = searchQuery.toLowerCase();
    const title = (language === 'km' ? item.titleKm : item.titleEn).toLowerCase();
    const desc = (language === 'km' ? item.shortDescKm : item.shortDescEn).toLowerCase();
    return title.includes(query) || desc.includes(query);
  });

  return (
    <div id="learn-view-container" className="max-w-3xl mx-auto px-4 py-6 md:py-8">
      {selectedId && currentScam ? (
        /* Detailed View Mode */
        <div id="scam-detail-card" className="space-y-6">
          {/* Top Back Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 border border-slate-200 p-4 rounded-3xl">
            <button
              id="btn-back-to-library"
              onClick={() => setSelectedId(null)}
              className="flex items-center space-x-2 text-xs font-bold text-gray-700 bg-white border border-gray-200 px-4 py-2.5 rounded-xl hover:bg-slate-50 transition cursor-pointer self-start"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{language === 'km' ? 'ត្រឡប់ទៅបណ្ណាល័យ' : 'Back to Library'}</span>
            </button>

            {onCheckNow && (
              <button
                id="btn-check-scam-now"
                onClick={onCheckNow}
                className="flex items-center justify-center space-x-2 text-xs font-bold text-white bg-brand-blue px-4.5 py-2.5 rounded-xl hover:bg-slate-800 transition cursor-pointer"
              >
                <span>{language === 'km' ? 'ពិនិត្យសារសង្ស័យឥឡូវនេះ' : 'Check Suspicious Message Now'}</span>
              </button>
            )}
          </div>

          {/* Title Banner */}
          <div className="bg-white border-2 border-[#0F172A] rounded-3xl p-6 shadow-sm">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-slate-100 text-slate-800 rounded-2xl shrink-0">
                {React.createElement(currentScam.icon, { className: "w-6 h-6 stroke-[2.2px]" })}
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 font-mono tracking-widest block">
                  {language === 'km' ? `ប្រភេទ៖ ${currentScam.categoryTag}` : `Category: ${currentScam.categoryTag}`}
                </span>
                <h3 className="text-xl font-black text-[#0F172A] leading-tight">
                  {language === 'km' ? currentScam.titleKm : currentScam.titleEn}
                </h3>
              </div>
            </div>
          </div>

          {/* Short Explanation */}
          <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-sm">
            <h4 className="text-sm font-bold text-[#0F172A] mb-3 flex items-center space-x-2">
              <span className="text-blue-600 font-bold">ℹ</span>
              <span>{language === 'km' ? 'តើវាជាអ្វី?' : 'What is it?'}</span>
            </h4>
            <p className="text-xs md:text-sm text-gray-600 leading-relaxed font-medium">
              {language === 'km' ? currentScam.whatItIsKm : currentScam.whatItIsEn}
            </p>
          </div>

          {/* Warning Signs (Short bullet points) */}
          <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-sm">
            <h4 className="text-sm font-bold text-red-600 mb-3 flex items-center space-x-2">
              <span className="text-red-500 font-bold">⚠️</span>
              <span>{language === 'km' ? 'សញ្ញាព្រមាន (Warning Signs)' : 'Warning Signs'}</span>
            </h4>
            <ul className="space-y-2.5">
              {currentScam.warningSigns.map((sign, idx) => (
                <li key={idx} className="bg-red-50/10 border border-red-100 p-3.5 rounded-2xl text-xs md:text-sm text-gray-700 flex items-start space-x-2.5">
                  <span className="text-red-500 font-bold mt-0.5">•</span>
                  <span className="leading-relaxed font-semibold text-justify">
                    {language === 'km' ? sign.textKm : sign.textEn}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Example message */}
          <div className="bg-slate-50 border-2 border-slate-200 rounded-3xl p-6 shadow-sm">
            <h4 className="text-sm font-bold text-[#0F172A] mb-3 flex items-center space-x-2">
              <span className="text-amber-500 font-bold">💬</span>
              <span>{language === 'km' ? 'ឧទាហរណ៍សារបោកប្រាស់៖' : 'Example Message:'}</span>
            </h4>
            <div className="bg-white border border-slate-200 p-4 rounded-2xl text-xs md:text-sm font-medium text-gray-700 italic border-l-4 border-l-amber-500 leading-relaxed">
              {language === 'km' ? currentScam.exampleKm : currentScam.exampleEn}
            </div>
          </div>

          {/* What to do */}
          <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-sm">
            <h4 className="text-sm font-bold text-green-700 mb-3 flex items-center space-x-2">
              <span className="text-green-500 font-bold">✅</span>
              <span>{language === 'km' ? 'អ្វីដែលអ្នកគួរធ្វើ (What to Do)' : 'What to Do'}</span>
            </h4>
            <ul className="space-y-2.5">
              {currentScam.whatToDo.map((step, idx) => (
                <li key={idx} className="bg-green-50/20 border border-green-100 p-3.5 rounded-2xl text-xs md:text-sm text-gray-700 flex items-start space-x-2.5">
                  <span className="text-green-600 font-bold mt-0.5">✔</span>
                  <span className="leading-relaxed font-semibold text-justify">
                    {language === 'km' ? step.textKm : step.textEn}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick bottom back links */}
          <div className="flex justify-center pt-2">
            <button
              onClick={() => setSelectedId(null)}
              className="text-xs font-bold text-[#0F172A] border-b-2 border-[#0F172A] pb-0.5 hover:opacity-80 transition cursor-pointer"
            >
              ← {language === 'km' ? 'ត្រឡប់ទៅបណ្ណាល័យស្វែងយល់វិញ' : 'Back to Scam Type Library'}
            </button>
          </div>
        </div>
      ) : (
        /* List Mode */
        <div id="scam-library-list-mode" className="space-y-6">
          {/* Header text */}
          <div id="learn-header-block" className="text-center">
            <h2 className="text-2xl md:text-3xl font-black text-[#0F172A] tracking-tight">
              {language === 'km' ? 'បណ្ណាល័យយល់ដឹងពីការបោកប្រាស់' : 'Scam Awareness Library'}
            </h2>
            <p className="text-xs md:text-sm text-gray-500 mt-2 max-w-lg mx-auto leading-relaxed">
              {language === 'km'
                ? 'ស្វែងយល់ពីល្បិចបោកប្រាស់ទូទៅនៅកម្ពុជា សញ្ញាព្រមាន និងវិធីសាស្ត្រការពារខ្លួនឱ្យមានសុវត្ថិភាពខ្ពស់។'
                : 'Learn about popular scam techniques in Cambodia, their warning indicators, and how to safely navigate them.'}
            </p>
          </div>

          {/* Search bar */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              id="scam-library-search"
              placeholder={language === 'km' ? 'ស្វែងរកល្បិចបោកប្រាស់...' : 'Search scam types...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border-2 border-slate-200 text-gray-800 rounded-2xl py-3.5 pl-11 pr-4 text-xs font-bold placeholder:text-gray-400 focus:outline-none focus:border-[#0F172A] shadow-sm transition"
            />
          </div>

          {/* Scam Cards list */}
          <div id="scam-grid-list" className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredScamTypes.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  id={`scam-card-${item.id}`}
                  onClick={() => setSelectedId(item.id)}
                  className="bg-white rounded-3xl border-2 border-slate-200 hover:border-[#0F172A] hover:shadow-md transition-all duration-250 p-5 text-left cursor-pointer flex items-start space-x-4 group"
                >
                  <div className="p-3 bg-slate-100 text-slate-700 group-hover:bg-[#0F172A] group-hover:text-white rounded-2xl shrink-0 transition-colors">
                    <Icon className="w-5 h-5 stroke-[2.2px]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-[#0F172A] truncate">
                      {language === 'km' ? item.titleKm : item.titleEn}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {language === 'km' ? item.shortDescKm : item.shortDescEn}
                    </p>
                    <span className="inline-flex items-center text-[11px] font-bold text-brand-blue group-hover:text-amber-500 mt-3.5 border-b border-transparent group-hover:border-amber-500 pb-0.5 transition-all">
                      {language === 'km' ? 'ស្វែងយល់បន្ថែម →' : 'Learn More →'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
