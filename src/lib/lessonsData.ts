export interface Lesson {
  id: string;
  titleKm: string;
  titleEn: string;
  contentKm: string;
  contentEn: string;
  category: string;
  categoryEn: string;
}

export const SEEDED_LESSONS: Lesson[] = [
  {
    id: "lesson_1",
    titleKm: "កុំចែករំលែកលេខកូដសម្ងាត់ OTP ឱ្យសោះ",
    titleEn: "Never Share OTP",
    category: "លេខសម្ងាត់ OTP",
    categoryEn: "OTP Security",
    contentKm: `លេខកូដ OTP (One-Time Password) គឺជាសោចុងក្រោយសម្រាប់បើកគណនីធនាគារ ឬគណនីបណ្តាញសង្គមរបស់អ្នក។ 

**ការណែនាំសុវត្ថិភាពសំខាន់ៗ៖**
១. ភ្នាក់ងារធនាគារពិតប្រាកដ ឬបុគ្គលិក Telegram/Facebook នឹងមិនសុំលេខកូដ OTP ពីអ្នកជាដាច់ខាត។
២. ប្រសិនបើមាននរណាម្នាក់ទូរស័ព្ទមកសុំលេខកូដដើម្បីទទួលបានរង្វាន់ ឬដោះស្រាយបញ្ហាគណនី នោះជាអ្នកបោកប្រាស់ហើយ!
៣. កុំផ្ញើរូបភាពអេក្រង់ (Screenshot) ដែលមានលេខកូដ OTP ឱ្យអ្នកដទៃទស្សនា ឬមើលឃើញ។
៤. ប្រសិនបើអ្នកបានចែករំលែកលេខកូដ OTP ដោយអចេតនា សូមប្រញាប់ផ្លាស់ប្តូរលេខសម្ងាត់ភ្លាមៗ និងទាក់ទងធនាគាររបស់អ្នកដើម្បីបិទគណនីជាបណ្តោះអាសន្ន។`,
    contentEn: `An OTP (One-Time Password) is the final key to access your bank account or social media accounts.

**Important Safety Guidelines:**
1. Real bank representatives or official customer support will NEVER ask for your OTP.
2. If someone calls asking for an OTP to unlock a prize or fix your account, they are 100% scammers.
3. Never send screenshots that display active OTP codes to anyone.
4. If you have mistakenly shared your OTP, change your password immediately and contact your bank to freeze your account.`
  },
  {
    id: "lesson_2",
    titleKm: "ការបោកប្រាស់ជ្រើសរើសបុគ្គលិក (តម្រូវឱ្យបង់ប្រាក់មុន)",
    titleEn: "Fake Job Scam Fees",
    category: "ការងារបោកប្រាស់",
    categoryEn: "Job Scams",
    contentKm: `អ្នកបោកប្រាស់តែងតែផ្សព្វផ្សាយការងារងាយស្រួល ធ្វើការពីផ្ទះ ចំណូលខ្ពស់ (១០$-៥០$ ក្នុងមួយថ្ងៃ) តាមរយៈ Telegram ឬ Facebook។

**សញ្ញាព្រមាននៃការបោកប្រាស់ការងារ៖**
១. តម្រូវឱ្យអ្នកបង់លុយជាមុនសម្រាប់ "ថ្លៃចុះឈ្មោះ" "ថ្លៃឯកសារ" ឬ "ថ្លៃបណ្តុះបណ្តាល"។
២. ឱ្យអ្នកចូលរួមក្រុមការងារទិញទំនិញ ឬវិនិយោគលុយដើម្បីបង្កើនចំណាត់ថ្នាក់របស់ហាង (Task scams)។
៣. មិនមានសម្ភាសន៍ត្រឹមត្រូវ គ្មានកិច្ចសន្យាការងារច្បាស់លាស់ ឬព័ត៌មានក្រុមហ៊ុនពិតប្រាកដឡើយ។
៤. ចាំជានិច្ចថា៖ ការងារពិតប្រាកដគឺគេបង់លុយឱ្យយើង មិនមែនយើងបង់លុយឱ្យគេដើម្បីបានធ្វើការនោះទេ!`,
    contentEn: `Scammers often advertise easy work-from-home jobs with unusually high salaries ($10-$50/day) on Telegram or Facebook.

**Job Scam Warning Signals:**
1. They require you to pay upfront for "registration fees", "training materials", or "document processing".
2. They ask you to complete tasks like transferring money to buy shop ratings (Task scams).
3. No formal interview process, no physical contract, and no verifiable company profile.
4. Always remember: A real job pays you; you never have to pay to get a job.`
  },
  {
    id: "lesson_3",
    titleKm: "រូបភាពវេរលុយ និង QR កូដក្លែងក្លាយ",
    titleEn: "Fake KHQR and Screenshots",
    category: "ការទិញទំនិញអនឡាញ",
    categoryEn: "Shopping Safety",
    contentKm: `ការទិញលក់អនឡាញកំពុងតែពេញនិយម ប៉ុន្តែអ្នកបោកប្រាស់អាចបង្កើតរូបភាពវេរលុយ (Screenshot) ក្លែងក្លាយ ឬប្រើប្រាស់ KHQR ក្លែងបន្លំ។

**វិធីការពារសម្រាប់អ្នកលក់ និងអ្នកទិញ៖**
១. សម្រាប់អ្នកលក់៖ កុំទាន់ប្រគល់ទំនិញគ្រាន់តែឃើញរូបភាពបញ្ជាក់ការវេរលុយ។ ត្រូវតែពិនិត្យមើលសមតុល្យទឹកប្រាក់ក្នុងកម្មវិធីធនាគារ (ABA, Acleda, Bakong) របស់អ្នកជាមុនសិន។
២. ប្រើប្រាស់មុខងារស្កេនពិនិត្យ ឬការជូនដំណឹងសំឡេងភ្លាមៗពីកម្មវិធីធនាគាររបស់លោកអ្នក។
៣. សម្រាប់អ្នកទិញ៖ កុំវេរលុយទៅកាន់គណនីផ្ទាល់ខ្លួនដែលមិនស្គាល់អត្តសញ្ញាណច្បាស់លាស់ គួរទិញពីហាងដែលមានការវាយតម្លៃល្អ និងអាសយដ្ឋានច្បាស់លាស់។`,
    contentEn: `Online shopping is highly popular, but scammers can easily forge bank transfer screenshots or swap official KHQR codes.

**Protection Methods for Sellers and Buyers:**
1. For Sellers: Never hand over products solely based on a transfer screenshot. Always verify the actual balance inside your banking app (ABA, ACLEDA, Bakong) first.
2. Rely on real-time transaction history logs or active banking notification sounds.
3. For Buyers: Avoid pre-transferring funds to anonymous individual accounts. Shop from highly-reviewed sellers with physical retail addresses.`
  },
  {
    id: "lesson_4",
    titleKm: "តំណភ្ជាប់ (លីង) គួរឱ្យសង្ស័យ",
    titleEn: "Suspicious Web Links",
    category: "តំណភ្ជាប់គួរឱ្យសង្ស័យ",
    categoryEn: "Web Safety",
    contentKm: `អ្នកបោកប្រាស់ច្រើនផ្ញើសារ SMS ឬសារតេឡេក្រាមដែលមានផ្ទុកតំណភ្ជាប់ក្លែងក្លាយ ដើម្បីលួចយកគណនី ឬគណនីធនាគាររបស់អ្នក។

**របៀបសម្គាល់តំណភ្ជាប់ក្លែងក្លាយ៖**
១. ឈ្មោះគេហទំព័រខុសពីឈ្មោះផ្លូវការបន្តិចបន្តួច (ឧទាហរណ៍៖ \`aba-bank-kh.com\` ឬ \`telegram-gift.xyz\` ជំនួសឱ្យ \`ababank.com\`)។
២. សារដែលភ្ជាប់មកជាមួយច្រើនជាសារបង្ខំ ឬបន្ទាន់ (ឧទាហរណ៍៖ "គណនីរបស់អ្នកត្រូវបានបិទ សូមចុចលីងនេះដើម្បីបើកឡើងវិញ")។
៣. កុំវាយបញ្ចូលលេខសម្ងាត់ លេខកាត ឬលេខទូរស័ព្ទរបស់អ្នកទៅក្នុងគេហទំព័រដែលបើកចេញពីតំណភ្ជាប់ក្នុងសារទាំងនោះជាដាច់ខាត។`,
    contentEn: `Scammers often send SMS or Telegram messages containing malicious links designed to steal your accounts or banking credentials (phishing).

**How to Identify Fake Links:**
1. Check the domain spelling carefully. It might look slightly different (e.g., \`aba-bank-kh.com\` or \`telegram-gift.xyz\` instead of official \`ababank.com\`).
2. The message uses urgent pressure (e.g., "Your account is locked. Click here to verify now").
3. NEVER input your account passwords, bank card numbers, or phone credentials into web links received via unverified SMS or messages.`
  },
  {
    id: "lesson_5",
    titleKm: "ការលួចគ្រប់គ្រងគណនីតេឡេក្រាម ឬបណ្តាញសង្គម",
    titleEn: "Account Hijack Prevention",
    category: "សុវត្ថិភាពគណនី",
    categoryEn: "Account Security",
    contentKm: `បច្ចុប្បន្នមានការបោកប្រាស់បន្លំជាមិត្តភក្តិ ឬក្រុមហ៊ុន ដើម្បីសុំលេខកូដចុះឈ្មោះបណ្តាញសង្គមរបស់លោកអ្នក ជាពិសេស Telegram។

**វិធីការពារគណនីរបស់អ្នក៖**
១. ត្រូវតែបើកដំណើរការមុខងារ **Two-Step Verification (ការផ្ទៀងផ្ទាត់ពីរជំហាន)** នៅក្នុងការកំណត់សុវត្ថិភាព Telegram, Facebook និង WhatsApp។
២. កុំផ្ញើលេខកូដចុះឈ្មោះ ៥ខ្ទង់ ឬលេខកូដផ្ទៀងផ្ទាត់ដែលទទួលបានតាមសារ SMS ឱ្យអ្នកដទៃជាដាច់ខាត ទោះបីជាគេប្រាប់ថាជាសាច់ញាតិ ឬមិត្តភក្តិក៏ដោយ។
៣. ប្រសិនបើមានគណនីមិត្តភក្តិឆាតមកខ្ចីលុយ ឬសុំលេខទូរស័ព្ទ ត្រូវទាក់ទងទៅសួរមិត្តភក្តិម្នាក់នោះដោយផ្ទាល់តាមរយៈការតេអូឌីយ៉ូ ឬជួបផ្ទាល់ ដើម្បីបញ្ជាក់អត្តសញ្ញាណ។`,
    contentEn: `Scammers frequently compromise Telegram or Facebook accounts and then message friends pretending to borrow money or request login codes.

**How to Protect Your Account:**
1. Always enable **Two-Step Verification (2FA)** in your Telegram, Facebook, and WhatsApp security settings.
2. NEVER share the 5-digit registration codes or confirmation codes received via SMS, even if the request seems to come from friends or family.
3. If a friend messages you on Telegram asking to borrow money, call them directly over voice/video call or meet them physically to verify their identity.`
  },
  {
    id: "lesson_6",
    titleKm: "ការវិនិយោគបោកប្រាស់ (ធានាចំណេញខ្ពស់)",
    titleEn: "Investment Scams",
    category: "ការវិនិយោគបោកប្រាស់",
    categoryEn: "Investments",
    contentKm: `ការសន្យាថានឹងទទួលបានការចំណេញរាល់ថ្ងៃ ចំណេញទ្វេដង ឬការវិនិយោគដោយមិនបាច់ធ្វើអ្វីសោះ សុទ្ធតែជាការបោកប្រាស់ដ៏គ្រោះថ្នាក់។

**សញ្ញាសម្គាល់ការវិនិយោគបោកប្រាស់៖**
១. ធានាចំណូលជានិច្ច គ្មានការខាតបង់ (ឧទាហរណ៍៖ "ដាក់លុយ ១០០$ ទទួលបានចំណេញ ១០$ រាល់ថ្ងៃ")។
២. តម្រូវឱ្យណែនាំមនុស្សបន្ថែម (សមាជិកបន្ត) ដើម្បីទទួលបានប្រាក់រង្វាន់កម្រៃជើងសារខ្ពស់ (Ponzi/Pyramid scheme)។
៣. គ្មានអាជ្ញាប័ណ្ណត្រឹមត្រូវពីគណៈកម្មការមូលបត្រកម្ពុជា (SERC) ឬអាជ្ញាធរពាក់ព័ន្ធឡើយ។
៤. ក្នុងពិភពពិត៖ គ្មានការវិនិយោគណាដែលទទួលបានផលចំណេញខ្ពស់បំផុតដោយគ្មានការប្រថុយប្រថាននោះឡើយ!`,
    contentEn: `Promises of guaranteed daily income, double money schemes, or zero-risk investments are highly dangerous financial scams.

**Warning Signs of Investment Scams:**
1. Absolute guarantees of continuous daily profits (e.g., "Deposit $100, receive $10 daily return").
2. Mandatory recruiting of more friends/members to unlock high referral commission fees (Ponzi/Pyramid scheme).
3. The platform lacks legal operating licenses from the Securities and Exchange Regulator of Cambodia (SERC).
4. Remember: No legitimate high-return investment exists without risk!`
  }
];
