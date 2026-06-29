import React from 'react';
import { ShieldCheck, Info, Heart, Landmark, ShieldAlert } from 'lucide-react';
import { Language } from '../types';

interface AboutViewProps {
  language: Language;
}

export default function AboutView({ language }: AboutViewProps) {
  return (
    <div id="about-view-container" className="max-w-2xl mx-auto px-4 py-6 md:py-8">
      {/* Brand Icon & Name */}
      <div id="about-brand-section" className="text-center mb-8">
        <div className="inline-flex items-center justify-center bg-[#0F172A] text-white p-4 rounded-3xl shadow-md mb-3">
          <ShieldCheck className="w-10 h-10 stroke-[2.2px] text-amber-500" />
        </div>
        <h2 className="text-2xl font-bold text-[#0F172A]">ScamCheck KH</h2>
        <p className="text-xs text-amber-600 font-bold uppercase tracking-wider font-mono mt-0.5">
          {language === 'km' ? 'ឆែកមុនពេលជឿ • ឧបករណ៍សុវត្ថិភាពឌីជីថល' : 'Check Before You Trust • Safety Safeguard'}
        </p>
      </div>

      <div id="about-content-stack" className="space-y-6">
        {/* Short introduction card */}
        <div id="intro-card" className="bg-white rounded-3xl border-2 border-gray-200 p-6 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-[#0F172A] flex items-center space-x-1.5 border-b border-gray-100 pb-2">
            <Info className="w-4 h-4 text-amber-500" />
            <span>{language === 'km' ? 'តើ ScamCheck KH គឺជាអ្វី?' : 'What is ScamCheck KH?'}</span>
          </h3>
          <p className="text-xs md:text-sm text-gray-600 leading-relaxed text-justify">
            {language === 'km'
              ? 'ScamCheck KH គឺជាគេហទំព័រដំបូងគេបង្អស់សម្រាប់ប្រទេសកម្ពុជា ដែលជួយប្រជាពលរដ្ឋស្វែងរក និងវាយតម្លៃសារគួរឱ្យសង្ស័យតាមប្រព័ន្ធអ៊ីនធឺណិត។ កម្មវិធីនេះដំណើរការជាលក្ខណៈគេហទំព័រគំរូ និងត្រូវបានរចនាឡើងដំបូងសម្រាប់ទូរស័ព្ទដៃ ដើម្បីឱ្យប្រជាពលរដ្ឋទូទៅងាយស្រួលចូលប្រើប្រាស់ពីគ្រប់ទីកន្លែង។'
              : 'ScamCheck KH is a dedicated Khmer-first web application designed to help Cambodian users identify and audit suspicious digital communications. Configured for mobile screens first, it functions beautifully on any smartphone, tablet, or desktop browser to help everyday users check threats instantly.'}
          </p>
        </div>

        {/* How it works */}
        <div id="how-it-works-card" className="bg-white rounded-3xl border-2 border-gray-200 p-6 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-[#0F172A] flex items-center space-x-1.5 border-b border-gray-100 pb-2">
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            <span>{language === 'km' ? 'តើវាដំណើរការយ៉ាងដូចម្តេច?' : 'How does it work?'}</span>
          </h3>
          <div className="grid grid-cols-1 gap-4 text-xs md:text-sm text-gray-600">
            <div className="flex items-start space-x-3">
              <span className="bg-[#0F172A] text-white font-mono font-bold text-xs w-6 h-6 rounded-full flex items-center justify-center shrink-0">1</span>
              <p className="leading-relaxed">
                {language === 'km'
                  ? 'អ្នកប្រើប្រាស់គ្រាន់តែបិទភ្ជាប់ (Paste) អត្ថបទសារ សារតេឡេក្រាម ឬលីងគួរឱ្យសង្ស័យ។'
                  : 'Users paste suspicious text, SMS, Telegram threads, or links into the input field.'}
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="bg-[#0F172A] text-white font-mono font-bold text-xs w-6 h-6 rounded-full flex items-center justify-center shrink-0">2</span>
              <p className="leading-relaxed">
                {language === 'km'
                  ? 'ប្រព័ន្ធឆ្លាតវៃធ្វើការស្កេនស្វែងរកសញ្ញាគ្រោះថ្នាក់ (Warning signals) និងកំណត់ពិន្ទុហានិភ័យភ្លាមៗ។'
                  : 'The automated engine scans the message for recognized cyber threat signals and computes a risk score.'}
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="bg-[#0F172A] text-white font-mono font-bold text-xs w-6 h-6 rounded-full flex items-center justify-center shrink-0">3</span>
              <p className="leading-relaxed">
                {language === 'km'
                  ? 'Gemini AI ជួយបង្កើតការពន្យល់យ៉ាងសាមញ្ញ ងាយស្រួលយល់ជាភាសាខ្មែរ និងអង់គ្លេស រួមជាមួយការណែនាំអំពីជំហានសុវត្ថិភាព។'
                  : 'The server leverages Gemini AI to generate customized, reassuring explanations in simple Khmer and English along with concrete safety actions.'}
              </p>
            </div>
          </div>
        </div>

        {/* Not replacing official advice */}
        <div id="official-advice-alert" className="p-5 rounded-3xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start space-x-3 shadow-sm">
          <Landmark className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <strong className="font-bold block text-sm">
              {language === 'km' ? 'ការបញ្ជាក់ច្បាស់លាស់ស្តីពីដំបូន្មានច្បាប់៖' : 'Not a Replacement for Official Advice:'}
            </strong>
            <p className="leading-relaxed text-[11px] md:text-xs text-justify">
              {language === 'km'
                ? 'កម្មវិធីនេះមិនតំណាងឱ្យស្ថាប័នរដ្ឋ ធនាគារជាតិ ក្រុមហ៊ុន ឬអាជ្ញាធរប៉ូលីសណាមួយឡើយ។ ព័ត៌មានដែលផ្តល់ជូនទាំងអស់មានគោលបំណងជាជំនួយស្វែងយល់ និងការប្រុងប្រយ័ត្នផ្ទាល់ខ្លួនប៉ុណ្ណោះ។ ប្រសិនបើលោកអ្នកសង្ស័យពីការបាត់បង់ប្រាក់ពិតប្រាកដ សូមទាក់ទងធនាគារផ្លូវការ ឬអាជ្ញាធរមានសមត្ថកិច្ចភ្លាមៗ។'
                : 'ScamCheck KH is an educational digital tool. It does not replace professional legal, banking, police, or corporate advice. If you suspect active financial theft, please contact your bank branch or the official cybercrime police directly.'}
            </p>
          </div>
        </div>

        {/* Made with love footnote */}
        <div id="civic-love-credit" className="flex items-center justify-center space-x-1.5 text-xs text-gray-400 py-4 font-medium">
          <span>{language === 'km' ? 'បង្កើតឡើងដោយក្តីស្រឡាញ់សម្រាប់ពលរដ្ឋកម្ពុជា' : 'Created with civic care for Cambodia'}</span>
          <Heart className="w-3.5 h-3.5 fill-red-400 text-red-400 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
