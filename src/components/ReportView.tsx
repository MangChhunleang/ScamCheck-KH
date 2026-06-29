import React, { useState } from 'react';
import { Flag, ShieldX, Loader2, CheckCircle2 } from 'lucide-react';
import { Language } from '../types';
import { sanitizeReportDescription } from '../lib/sanitize';

interface ReportViewProps {
  language: Language;
  onSubmitReport: (data: {
    scamType: string;
    platform: string;
    descriptionPreview: string;
    contact?: string;
  }) => Promise<void>;
}

const SCAM_TYPES_KM = [
  'ការបោកប្រាស់ការងារ (Fake Job)',
  'ការបោកប្រាស់ OTP / ធនាគារ (Bank / OTP)',
  'ការបោកប្រាស់ KHQR / ទូទាត់ (Payment)',
  'ការបោកប្រាស់ទិញទំនិញ (Shopping)',
  'ការបោកប្រាស់វិនិយោគ (Investment)',
  'ការបោកប្រាស់រង្វាន់ (Prize)',
  'ការបោកប្រាស់គណនីសន្តិសុខ (Account)',
  'តំណភ្ជាប់គួរឱ្យសង្ស័យ (Suspicious Link)',
  'ផ្សេងៗ (Other)',
];

const SCAM_TYPES_EN = [
  'Fake Job Scam',
  'Bank / OTP Scam',
  'KHQR / Payment Scam',
  'Online Shopping Scam',
  'Investment Scam',
  'Prize Scam',
  'Account Security Scam',
  'Suspicious Link',
  'Other',
];

const PLATFORMS_KM = ['Telegram', 'Facebook', 'Messenger', 'SMS', 'Website', 'ផ្សេងៗ (Other)'];
const PLATFORMS_EN = ['Telegram', 'Facebook', 'Messenger', 'SMS', 'Website', 'Other'];

export default function ReportView({ language, onSubmitReport }: ReportViewProps) {
  const [scamType, setScamType] = useState('');
  const [platform, setPlatform] = useState('');
  const [description, setDescription] = useState('');
  const [contact, setContact] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const scamTypes = language === 'km' ? SCAM_TYPES_KM : SCAM_TYPES_EN;
  const platforms = language === 'km' ? PLATFORMS_KM : PLATFORMS_EN;

  const handleSubmit = async () => {
    setError('');

    if (!scamType) {
      setError(language === 'km' ? 'សូមជ្រើសប្រភេទការបោកប្រាស់។' : 'Please select a scam type.');
      return;
    }
    if (!platform) {
      setError(language === 'km' ? 'សូមជ្រើស Platform ។' : 'Please select a platform.');
      return;
    }
    if (!description.trim()) {
      setError(
        language === 'km'
          ? 'សូមពិពណ៌នាពីការបោកប្រាស់ដែលអ្នកជួបប្រទះ។'
          : 'Please describe what happened.'
      );
      return;
    }
    if (description.length > 1000) {
      setError(
        language === 'km'
          ? 'ការពិពណ៌នាវែងពេក (អតិបរិមា ១០០០ តួអក្សរ)។'
          : 'Description is too long (max 1000 characters).'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      // Sanitize before storing — remove OTP, PIN, password, bank data, IDs
      const sanitized = sanitizeReportDescription(description);
      const preview = sanitized.length > 300 ? sanitized.substring(0, 300) + '...' : sanitized;

      // Map display label back to canonical English value for storage
      const canonicalScamType =
        SCAM_TYPES_EN[language === 'km' ? SCAM_TYPES_KM.indexOf(scamType) : SCAM_TYPES_EN.indexOf(scamType)] ||
        scamType;
      const canonicalPlatform =
        PLATFORMS_EN[language === 'km' ? PLATFORMS_KM.indexOf(platform) : PLATFORMS_EN.indexOf(platform)] ||
        platform;

      await onSubmitReport({
        scamType: canonicalScamType,
        platform: canonicalPlatform,
        descriptionPreview: preview,
        contact: contact.trim() || undefined,
      });

      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setError(
        language === 'km'
          ? 'មានបញ្ហាក្នុងការដាក់ស្នើ។ សូមព្យាយាមម្តងទៀត។'
          : 'Submission failed. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setScamType('');
    setPlatform('');
    setDescription('');
    setContact('');
    setError('');
    setSubmitted(false);
  };

  if (submitted) {
    return (
      <div id="report-success-screen" className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="inline-flex items-center justify-center bg-green-50 p-4 rounded-3xl mb-4 border border-green-200">
          <CheckCircle2 className="w-10 h-10 text-green-600 stroke-[2px]" />
        </div>
        <h2 className="text-xl font-black text-[#0F172A] mb-2">
          {language === 'km' ? 'អរគុណ! បានដាក់ស្នើរបាយការណ៍ ✓' : 'Report Submitted! ✓'}
        </h2>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed max-w-xs mx-auto">
          {language === 'km'
            ? 'របាយការណ៍របស់អ្នកនឹងជួយការពារប្រជាពលរដ្ឋកម្ពុជាពីការបោកប្រាស់ប្រភេទនេះ។'
            : 'Your report helps protect other Cambodians from this type of scam.'}
        </p>
        <button
          onClick={handleReset}
          className="bg-brand-blue text-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-[#1E293B] transition-all"
        >
          {language === 'km' ? 'ដាក់ស្នើរបាយការណ៍ម្តងទៀត' : 'Submit Another Report'}
        </button>
      </div>
    );
  }

  return (
    <div id="report-view-container" className="max-w-2xl mx-auto px-4 py-6 md:py-8">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center bg-red-50 text-red-600 p-3 rounded-2xl mb-3 border border-red-200">
          <Flag className="w-6 h-6 stroke-[2.2px]" />
        </div>
        <h2 className="text-2xl font-black text-[#0F172A]">
          {language === 'km' ? 'រាយការណ៍ការបោកប្រាស់' : 'Report a Scam'}
        </h2>
        <p className="text-xs text-gray-500 mt-1.5 max-w-sm mx-auto">
          {language === 'km'
            ? 'ជួយការពារអ្នកដទៃពីការបោកប្រាស់ ដោយដាក់ស្នើរបាយការណ៍ខ្លី។'
            : 'Help protect others by submitting a brief report about the scam.'}
        </p>
      </div>

      {/* Privacy warning */}
      <div className="mb-5 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start space-x-3 text-xs text-amber-800">
        <ShieldX className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold block mb-0.5">
            {language === 'km' ? 'ការព្រមានៈ' : 'Warning:'}
          </strong>
          {language === 'km'
            ? 'សូមកុំដាក់ OTP ពាក្យសម្ងាត់ PIN លេខអត្តសញ្ញាណ ឬព័ត៌មានគណនីធនាគារ ក្នុងការពិពណ៌នានេះ។'
            : 'Do not include OTP, password, PIN, ID number, or private bank account details in the description.'}
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-200 p-5 sm:p-6 shadow-sm space-y-5">
        {/* Scam Type */}
        <div>
          <label htmlFor="report-scam-type" className="block text-sm font-bold text-[#0F172A] mb-2">
            {language === 'km' ? 'ប្រភេទការបោកប្រាស់' : 'Scam Type'}{' '}
            <span className="text-red-500">*</span>
          </label>
          <select
            id="report-scam-type"
            value={scamType}
            onChange={(e) => setScamType(e.target.value)}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:border-brand-blue focus-visible:ring-2 focus-visible:ring-brand-blue transition bg-white"
          >
            <option value="">
              {language === 'km' ? '-- ជ្រើសរើស --' : '-- Select --'}
            </option>
            {scamTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Platform */}
        <div>
          <span id="report-platform-label" className="block text-sm font-bold text-[#0F172A] mb-2">
            {language === 'km' ? 'កើតឡើងនៅ Platform ណា?' : 'Platform'}{' '}
            <span className="text-red-500">*</span>
          </span>
          <div className="flex flex-wrap gap-2" role="group" aria-labelledby="report-platform-label">
            {platforms.map((p) => (
              <button
                key={p}
                type="button"
                aria-pressed={platform === p}
                onClick={() => setPlatform(p)}
                className={`text-xs font-bold px-4 py-2.5 rounded-xl border-2 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue ${
                  platform === p
                    ? 'bg-brand-blue text-white border-brand-blue'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="report-description" className="block text-sm font-bold text-[#0F172A] mb-2">
            {language === 'km' ? 'ពិពណ៌នាខ្លី (ត្រឹម ៣០០ តួអក្សរ)' : 'Brief Description (max 300 chars)'}{' '}
            <span className="text-red-500">*</span>
          </label>
          <textarea
            id="report-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            maxLength={1000}
            placeholder={
              language === 'km'
                ? 'ពណ៌នាពីអ្វីដែលបានកើតឡើង... (កុំដាក់ OTP PIN ឬព័ត៌មានស្ងាត់)'
                : 'Describe what happened... (Do not include OTP, PIN, or private details)'
            }
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:border-brand-blue focus-visible:ring-2 focus-visible:ring-brand-blue transition resize-none"
          />
          <p className="text-xs text-gray-400 mt-1 text-right">
            {description.length} / 1000
          </p>
        </div>

        {/* Optional contact */}
        <div>
          <label htmlFor="report-contact" className="block text-sm font-bold text-[#0F172A] mb-2">
            {language === 'km'
              ? 'លេខទូរស័ព្ទ ឬគណនីអ្នកបោក (ស្រេចចិត្ត)'
              : 'Scammer Phone/Account (optional)'}
          </label>
          <input
            id="report-contact"
            type="text"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            maxLength={100}
            placeholder={
              language === 'km'
                ? 'ឧ. +855 12 345 678 ឬ @username'
                : 'e.g. +855 12 345 678 or @username'
            }
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 focus:outline-none focus:border-brand-blue focus-visible:ring-2 focus-visible:ring-brand-blue transition"
          />
        </div>

        {/* Error */}
        {error && (
          <p className="text-xs text-red-600 font-bold flex items-center space-x-1">
            <span>⚠️</span>
            <span>{error}</span>
          </p>
        )}

        {/* Submit button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center space-x-2 shadow-md cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{language === 'km' ? 'កំពុងដាក់ស្នើ...' : 'Submitting...'}</span>
            </>
          ) : (
            <>
              <Flag className="w-4 h-4" />
              <span>{language === 'km' ? 'ដាក់ស្នើរបាយការណ៍' : 'Submit Report'}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
