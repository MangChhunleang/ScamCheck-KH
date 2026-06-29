import React, { useState } from 'react';
import { ShieldAlert, Sparkles, Trash2, ShieldX, HelpCircle, Loader2 } from 'lucide-react';
import { Language, ScanResult } from '../types';

interface HomeViewProps {
  language: Language;
  onAnalyze: (text: string) => Promise<void>;
  isLoading: boolean;
}

interface ExampleTemplate {
  titleKm: string;
  titleEn: string;
  textKm: string;
  textEn: string;
  badge: string;
}

const EXAMPLES: ExampleTemplate[] = [
  {
    titleKm: "ការងារ Telegram (បង់ថ្លៃសេវា)",
    titleEn: "Telegram Job",
    badge: "Job",
    textKm: "ការងារ Telegram ធ្វើការពីផ្ទះបានប្រាក់ចំណូល $20-$50 ក្នុងមួយថ្ងៃយ៉ាងងាយស្រួល។ មិនបាច់មានបទពិសោធន៍! គ្រាន់តែបំពេញការងារងាយៗ។ ថ្លៃចុះឈ្មោះដំបូងគឺត្រឹមតែ $5 ប៉ុណ្ណោះដើម្បីធ្វើសកម្មភាពគណនីរបស់អ្នក។ សូមបង់ប្រាក់មុនមកកាន់គណនី ACLEDA លេខ 012345678។",
    textEn: "Telegram Job: Work from home and earn $20-$50 per day easily. No experience needed! Just complete simple tasks. Registration fee is only $5 to activate your account. Pay first to ACLEDA account 012345678."
  },
  {
    titleKm: "គណនីធនាគារជួបបញ្ហា & លីង",
    titleEn: "Bank OTP / Phishing",
    badge: "Bank",
    textKm: "ដំណឹងបន្ទាន់ពី ABA៖ គណនីរបស់អ្នកត្រូវបានផ្អាកជាបណ្តោះអាសន្នដោយសារការចូលប្រើប្រាស់គួរឱ្យសង្ស័យ។ សូមចុចលើតំណភ្ជាប់នេះ https://aba-bank-security.xyz/verify ដើម្បីផ្ទៀងផ្ត់អត្តសញ្ញាណរបស់អ្នក និងបញ្ចូលលេខកូដ OTP ធនាគាររបស់អ្នកជាបន្ទាន់ដើម្បីជៀសវាងការបិទជាអចិន្ត្រៃយ៍។",
    textEn: "ABA Notice: Your account has been suspended due to suspicious login attempts. Please click this link https://aba-bank-security.xyz/verify to verify your identity and enter your bank OTP code immediately to avoid permanent lock."
  },
  {
    titleKm: "លីងធនាគារក្លែងក្លាយ / Fake Bank Link",
    titleEn: "Suspicious Bank Link",
    badge: "Link",
    textKm: "គណនី ABA របស់អ្នកនឹងត្រូវបានបិទ។ សូមចុច Link នេះដើម្បីផ្ទៀងផ្ទាត់៖ http://aba-secure-login-free.example.com",
    textEn: "គណនី ABA របស់អ្នកនឹងត្រូវបានបិទ។ សូមចុច Link នេះដើម្បីផ្ទៀងផ្ទាត់៖ http://aba-secure-login-free.example.com"
  },
  {
    titleKm: "ការព្រមាន Facebook ក្លែងក្លាយ / Fake Facebook Warning",
    titleEn: "Fake Facebook Warning",
    badge: "Link",
    textKm: "Your Facebook page will be disabled. Login here to verify: https://facebook-security-check.example.com/login",
    textEn: "Your Facebook page will be disabled. Login here to verify: https://facebook-security-check.example.com/login"
  },
  {
    titleKm: "លីងខ្លីបញ្ឆោតរង្វាន់ / Shortened Reward Link",
    titleEn: "Shortened Reward Link",
    badge: "Link",
    textKm: "Congratulations! Claim your reward here: https://bit.ly/free-prize-now",
    textEn: "Congratulations! Claim your reward here: https://bit.ly/free-prize-now"
  },
  {
    titleKm: "លីងធម្មតាមានសុវត្ថិភាព / Safe Normal Link",
    titleEn: "Safe Normal Link",
    badge: "Link",
    textKm: "Here is our project document link: https://docs.google.com/document/example",
    textEn: "Here is our project document link: https://docs.google.com/document/example"
  },
  {
    titleKm: "លក់ទូរស័ព្ទតម្លៃថោក & KHQR",
    titleEn: "Shopping KHQR Scam",
    badge: "Shop",
    textKm: "លក់បញ្ចុះតម្លៃ 90%! ទូរស័ព្ទ iPhone 15 Pro Max ថ្មីប្រអប់ត្រឹមតែ $150 ប៉ុណ្ណោះ! ចំនួនមានកំណត់សម្រាប់អ្នកទិញ 5 នាក់ដំបូង! សូមវេរលុយមុនមកកាន់ KHQR របស់យើងដើម្បីកក់ទុកជាមុន។ យើងមានសេវាដឹកជញ្ជូនគ្រប់ខេត្តក្រុងក្នុងប្រទេសកម្ពុជា។ សូមថតរូបភាពវេរលុយបញ្ជាក់។",
    textEn: "Sale 90%! Brand new iPhone 15 Pro Max for only $150! Limited stock for 5 buyers only! First transfer money first to our KHQR to secure the deal. We ship to all provinces in Cambodia. Screenshot your payment receipt."
  },
  {
    titleKm: "វិនិយោគគ្រីបតូ (ធានាផលចំណេញ)",
    titleEn: "High-Yield Crypto Investment",
    badge: "Investment",
    textKm: "រកលុយបានទ្វេដងជាមួយការវិនិយោគ VIP Gold Crypto! ដាក់ប្រាក់ $100 ធានាទទួលបានប្រាក់ចំណេញ $15 រៀងរាល់ថ្ងៃ! គ្មានហានិភ័យ 100% មានច្បាប់អនុញ្ញាតនៅកម្ពុជា។ ណែនាំមិត្តភក្តិ 3 នាក់ទទួលបានប្រាក់បន្ថែម 20%។",
    textEn: "Earn double money with VIP Gold Crypto Investment! Deposit $100 and guarantee $15 profit every single day! 100% risk free, licensed in Cambodia. Invite 3 friends to get extra 20% commission bonus."
  }
];

export default function HomeView({ language, onAnalyze, isLoading }: HomeViewProps) {
  const [inputText, setInputText] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleCheck = () => {
    setValidationError('');
    if (!inputText.trim()) {
      setValidationError(
        language === 'km'
          ? 'សូមបិទភ្ជាប់សារជាមុនសិន។'
          : 'Please enter or paste a suspicious message first!'
      );
      return;
    }

    if (inputText.length > 2500) {
      setValidationError(
        language === 'km'
          ? 'សារវែងពេក។ សូមកាត់ឱ្យខ្លីជាងនេះ។'
          : 'Text is too long (maximum 2,500 characters)!'
      );
      return;
    }

    onAnalyze(inputText);
  };

  const handleClear = () => {
    setInputText('');
    setValidationError('');
  };

  const applyExample = (ex: ExampleTemplate) => {
    setInputText(language === 'km' ? ex.textKm : ex.textEn);
    setValidationError('');
  };

  return (
    <div id="home-view-container" className="max-w-3xl mx-auto px-4 py-6 md:py-8">
      {/* Brand Header */}
      <div id="brand-headline-block" className="text-center mb-8 md:mb-10">
        <div className="inline-flex items-center justify-center bg-brand-blue text-kh-gold p-3 rounded-2xl shadow-md mb-4 animate-bounce">
          <ShieldAlert className="w-8 h-8 stroke-[2.2px]" />
        </div>
        <h2 className="text-3xl font-extrabold text-brand-blue tracking-tight font-sans">
          ScamCheck KH
        </h2>
        <div className="flex flex-col items-center justify-center mt-1 space-y-0.5">
          <span className="text-sm font-semibold text-brand-blue/70">
            ឆែកមុនពេលជឿ
          </span>
          <span className="text-xs text-gray-400 uppercase tracking-widest font-mono font-bold">
            Check Before You Trust
          </span>
        </div>
      </div>

      {/* Main Checker Panel */}
      <div id="checker-editor-card" className="bg-white rounded-3xl shadow-sm border border-gray-200 p-5 sm:p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <label
            htmlFor="scam-checker-input"
            className="block text-sm font-bold text-brand-blue flex items-center space-x-1.5"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="font-bold text-[#0F172A] text-base">
              {language === 'km'
                ? 'តើអ្នកចង់ពិនិត្យសារអ្វី? '
                : 'What suspicious message or link do you want to check?'}
            </span>
          </label>
          <span className="text-[10px] uppercase tracking-widest bg-[#FDF8F1] border border-amber-200 text-amber-800 px-2 py-1 rounded-full font-bold">
            {language === 'km' ? 'ស្កេនស្វ័យប្រវត្តិ' : 'Auto Detect'}
          </span>
        </div>

        <textarea
          id="scam-checker-input"
          value={inputText}
          onChange={(e) => {
            setInputText(e.target.value);
            if (e.target.value) setValidationError('');
          }}
          disabled={isLoading}
          placeholder={
            language === 'km'
              ? 'បិទភ្ជាប់សារ ឬតំណភ្ជាប់គួរឱ្យសង្ស័យនៅទីនេះ...\nឧទាហរណ៍៖ "អ្នកបានឈ្នះរង្វាន់ឥតគិតថ្លៃ $500..."'
              : 'Paste suspicious message or link here...\nExample: "You won a free prize of $500! Click here..."'
          }
          className="w-full min-h-[150px] md:min-h-[200px] p-4 sm:p-5 text-base bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl focus:border-brand-blue focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30 resize-y transition-all placeholder:text-gray-400"
        />

        {validationError && (
          <p id="validation-error-msg" className="text-xs text-danger-red font-medium mt-1.5 flex items-center space-x-1">
            <span>⚠️</span>
            <span>{validationError}</span>
          </p>
        )}

        {/* Action Controls */}
        <div id="checker-action-buttons" className="flex items-center space-x-3 mt-4">
          <button
            id="btn-safety-check"
            onClick={handleCheck}
            disabled={isLoading}
            className="flex-1 bg-brand-blue hover:bg-[#1E293B] active:scale-[0.98] disabled:bg-gray-300 text-white font-bold text-base py-4 px-6 rounded-xl transition-all shadow-xl flex items-center justify-center space-x-2 cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin text-white" />
                <span>
                  {language === 'km' ? 'កំពុងវិភាគសុវត្ថិភាព...' : 'Analyzing Safety...'}
                </span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-5 h-5 text-amber-500" />
                <span>
                  {language === 'km' ? 'ពិនិត្យសុវត្ថិភាព' : 'Check Safety'}
                </span>
              </>
            )}
          </button>

          <button
            id="btn-clear-input"
            onClick={handleClear}
            disabled={isLoading || !inputText}
            className="bg-gray-100 hover:bg-gray-200 disabled:opacity-40 text-gray-600 px-6 py-4 rounded-xl font-bold transition-all cursor-pointer flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue"
            title={language === 'km' ? 'សម្អាត' : 'Clear'}
            aria-label={language === 'km' ? 'សម្អាតអត្ថបទ' : 'Clear input text'}
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>

        {/* Privacy Guard Alert */}
        <div id="privacy-guard-note" className="mt-5 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start space-x-2.5">
          <ShieldX className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold block mb-0.5">
              {language === 'km' ? 'ចំណាំសំខាន់អំពីសុវត្ថិភាព៖' : 'Important Safety Warning:'}
            </strong>
            <span className="block mb-1">
              {language === 'km'
                ? 'សូមកុំបញ្ចូលលេខ OTP ពាក្យសម្ងាត់ លេខកូដកាតធនាគារ ឬលេខអត្តសញ្ញាណប័ណ្ណផ្ទាល់ខ្លួន។'
                : 'Do not paste real OTP, password, bank PIN, ID number, or private bank account details.'}
            </span>
            <span className="block font-bold text-slate-800 border-t border-amber-200 pt-1.5 mt-1.5">
              {language === 'km'
                ? 'ScamCheck KH មិនស្នើសុំ OTP, Password, PIN ឬសិទ្ធិចូលប្រើគណនីធនាគាររបស់អ្នកទេ។'
                : 'ScamCheck KH never requests your OTP, Password, PIN, or bank account credentials.'}
            </span>
          </div>
        </div>
      </div>

      {/* Example Templates Section */}
      <div id="example-templates-block" className="bg-[#FDF8F1] rounded-3xl p-5 sm:p-6 border border-amber-200 shadow-sm">
        <h3 className="text-sm font-bold text-amber-950 mb-4 flex items-center space-x-2">
          <HelpCircle className="w-4 h-4 text-amber-600" />
          <span>
            {language === 'km' ? 'សាកល្បងឧទាហរណ៍' : 'Try Suspicious Examples'}
          </span>
        </h3>

        <div id="example-grid" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {EXAMPLES.map((ex, index) => {
            const title = language === 'km' ? ex.titleKm : ex.titleEn;
            const previewText = language === 'km' ? ex.textKm : ex.textEn;

            return (
              <button
                key={index}
                id={`example-card-${index}`}
                onClick={() => applyExample(ex)}
                disabled={isLoading}
                className="text-left bg-white p-4 rounded-xl border border-amber-200 hover:bg-amber-100/50 active:scale-[0.99] transition-all cursor-pointer group shadow-sm"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-brand-blue group-hover:text-blue-900">
                    {title}
                  </span>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-brand-blue text-[#FDF8F1] uppercase">
                    {ex.badge}
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
                  {previewText}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
