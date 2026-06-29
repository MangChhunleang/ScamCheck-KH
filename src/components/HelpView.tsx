import React, { useState } from 'react';
import { AlertTriangle, Key, Landmark, Link, Skull, CheckSquare, Square, Clipboard, Check, ArrowLeft, Search } from 'lucide-react';
import { Language } from '../types';

interface HelpViewProps {
  language: Language;
  onCheckNow?: () => void;
}

interface ActionStep {
  textKm: string;
  textEn: string;
}

interface EmergencyOption {
  id: string;
  titleKm: string;
  titleEn: string;
  urgencyKm: string;
  urgencyEn: string;
  urgencyLevel: 'Medium' | 'High';
  icon: React.ComponentType<any>;
  descriptionKm: string;
  descriptionEn: string;
  doImmediately: ActionStep[];
  doNext: ActionStep[];
  evidenceToKeep: ActionStep[];
  whatNotToDo: ActionStep[];
}

const EMERGENCY_DATA: EmergencyOption[] = [
  {
    id: "otp",
    titleKm: "ខ្ញុំបានចែករំលែក OTP",
    titleEn: "I Shared My OTP",
    urgencyKm: "បន្ទាន់ខ្លាំង (High)",
    urgencyEn: "High Urgency",
    urgencyLevel: "High",
    icon: Key,
    descriptionKm: "ប្រសិនបើអ្នកបានផ្ញើ ឬប្រាប់លេខកូដសម្ងាត់ OTP ទៅកាន់អ្នកដទៃ។",
    descriptionEn: "If you have accidentally sent or revealed your OTP code to someone else.",
    doImmediately: [
      {
        textKm: "ប្តូរ Password គណនីភ្លាមៗ ប្រសិនបើអាចធ្វើបាន",
        textEn: "Change your account password immediately if possible"
      },
      {
        textKm: "ចេញពីគណនីលើឧបករណ៍ទាំងអស់",
        textEn: "Log out of all sessions/devices immediately"
      },
      {
        textKm: "ទាក់ទងធនាគារ ឬសេវាផ្លូវការ",
        textEn: "Contact your bank or official support service immediately"
      },
      {
        textKm: "បិទ ឬផ្អាកប្រតិបត្តិការបណ្ដោះអាសន្ន ប្រសិនបើពាក់ព័ន្ធនឹងធនាគារ",
        textEn: "Temporarily freeze or suspend transactions if banking apps are involved"
      },
      {
        textKm: "បើក Two-factor authentication",
        textEn: "Enable Two-factor authentication (2FA)"
      }
    ],
    doNext: [
      {
        textKm: "ពិនិត្យប្រវត្តិ Login",
        textEn: "Check active login history and devices"
      },
      {
        textKm: "ពិនិត្យប្រតិបត្តិការធនាគារ",
        textEn: "Monitor your recent bank transactions"
      },
      {
        textKm: "ប្រាប់មិត្តភក្តិ ឬគ្រួសារ ប្រសិនបើគណនីអាចត្រូវបានគេប្រើបោកប្រាស់",
        textEn: "Alert friends or family if your account is compromised to avoid downstream fraud"
      }
    ],
    evidenceToKeep: [
      {
        textKm: "Screenshot សារ",
        textEn: "Take screenshots of the messages"
      },
      {
        textKm: "លេខទូរស័ព្ទ ឬឈ្មោះគណនីអ្នកបោក",
        textEn: "Note down the scammer's phone number or account name"
      },
      {
        textKm: "Link ដែលបានផ្ញើមក",
        textEn: "Save the suspicious links received"
      },
      {
        textKm: "ម៉ោង និងថ្ងៃកើតហេតុ",
        textEn: "Record the date and time of the occurrence"
      }
    ],
    whatNotToDo: [
      {
        textKm: "កុំផ្ញើ OTP ថ្មីម្តងទៀត",
        textEn: "Do NOT share any new OTP codes"
      },
      {
        textKm: "កុំផ្ញើលុយបន្ថែម",
        textEn: "Do NOT send any additional money"
      },
      {
        textKm: "កុំលុបសារ ឬភស្តុតាង",
        textEn: "Do NOT delete messages or conversation histories"
      }
    ]
  },
  {
    id: "money",
    titleKm: "ខ្ញុំបានផ្ញើលុយ",
    titleEn: "I Sent Money",
    urgencyKm: "បន្ទាន់ខ្លាំង (High)",
    urgencyEn: "High Urgency",
    urgencyLevel: "High",
    icon: Landmark,
    descriptionKm: "ប្រសិនបើអ្នកបានចាញ់បោកគេ និងបានផ្ទេរប្រាក់តាមគណនីរួចរាល់។",
    descriptionEn: "If you have already transferred funds or paid upfront to scammers.",
    doImmediately: [
      {
        textKm: "ទាក់ទងធនាគារ ឬសេវាទូទាត់ដែលអ្នកបានប្រើ",
        textEn: "Contact the bank or payment provider you used immediately"
      },
      {
        textKm: "រក្សាទុកប្រវត្តិប្រតិបត្តិការ",
        textEn: "Save all transaction histories and transfer slips"
      },
      {
        textKm: "កុំផ្ញើលុយបន្ថែម",
        textEn: "Do NOT send any more money"
      },
      {
        textKm: "Block ឬ Report គណនីគួរឱ្យសង្ស័យ",
        textEn: "Block or report the suspicious account"
      },
      {
        textKm: "ប្រាប់គ្រួសារ ឬមិត្តជិតស្និទ្ធ ប្រសិនបើអ្នកត្រូវការជំនួយ",
        textEn: "Tell your family or close friends if you need assistance"
      }
    ],
    doNext: [
      {
        textKm: "រៀបចំភស្តុតាងទាំងអស់",
        textEn: "Prepare and compile all evidence"
      },
      {
        textKm: "រាយការណ៍ទៅ Platform ដែលកើតហេតុ ដូចជា Telegram, Facebook ឬ Messenger",
        textEn: "Report to the platform where it happened (Telegram, Facebook, Messenger)"
      },
      {
        textKm: "ប្រសិនបើចំនួនលុយធំ សូមស្វែងរកជំនួយផ្លូវការ",
        textEn: "If the amount is significant, seek formal legal or police assistance"
      }
    ],
    evidenceToKeep: [
      {
        textKm: "Transaction ID",
        textEn: "Save transaction IDs or reference numbers"
      },
      {
        textKm: "Screenshot ប្រតិបត្តិការ",
        textEn: "Take screenshots of the receipt or transaction status"
      },
      {
        textKm: "KHQR ឬលេខគណនីទទួលលុយ",
        textEn: "Record the receiver's bank account number or KHQR code"
      },
      {
        textKm: "Chat history",
        textEn: "Keep the complete chat history"
      },
      {
        textKm: "Profile link ឬលេខទូរស័ព្ទអ្នកបោក",
        textEn: "Save the scammer's profile link or phone number"
      }
    ],
    whatNotToDo: [
      {
        textKm: "កុំផ្ញើលុយបន្ថែម ដើម្បី “ដោះសោ” ឬ “ទាញលុយត្រឡប់”",
        textEn: "Do NOT send additional money to 'unlock' or 'recover' your funds"
      },
      {
        textKm: "កុំចរចាដោយខ្លួនឯងបន្ថែម ប្រសិនបើវាមានហានិភ័យ",
        textEn: "Do NOT negotiate on your own if there is an active safety risk"
      }
    ]
  },
  {
    id: "link",
    titleKm: "ខ្ញុំបានចុច Link គួរឱ្យសង្ស័យ",
    titleEn: "I Clicked Suspicious Link",
    urgencyKm: "មធ្យម ទៅ ខ្ពស់ (Medium to High)",
    urgencyEn: "Medium to High Urgency",
    urgencyLevel: "High",
    icon: Link,
    descriptionKm: "ប្រសិនបើអ្នកបានចុចលើលីង ឬបានទាញយកឯកសារអ្វីមួយមកដំឡើង។",
    descriptionEn: "If you clicked a random link or downloaded/installed a suspicious file/APK.",
    doImmediately: [
      {
        textKm: "កុំបញ្ចូលព័ត៌មានបន្ថែម",
        textEn: "Do NOT enter any additional information on the web page"
      },
      {
        textKm: "បិទទំព័រនោះភ្លាមៗ",
        textEn: "Close the page/browser immediately"
      },
      {
        textKm: "ប្តូរ Password ប្រសិនបើអ្នកបាន Login",
        textEn: "Change your password immediately if you logged in on that page"
      },
      {
        textKm: "ពិនិត្យ Activity ឬ Login history",
        textEn: "Check active sessions or login histories"
      },
      {
        textKm: "Scan ឧបករណ៍ ប្រសិនបើអ្នកបាន Download file",
        textEn: "Scan your device with security software if you downloaded any files"
      }
    ],
    doNext: [
      {
        textKm: "បើក Two-factor authentication",
        textEn: "Enable two-factor authentication (2FA)"
      },
      {
        textKm: "ចេញពីគណនីលើឧបករណ៍ផ្សេងៗ",
        textEn: "Log out of all other active sessions and devices"
      },
      {
        textKm: "ពិនិត្យ Email ឬលេខទូរស័ព្ទ Recovery",
        textEn: "Review your recovery email and phone number"
      },
      {
        textKm: "ប្រាប់មិត្តភក្តិ ប្រសិនបើគណនីអ្នកអាចផ្ញើសារ Scam",
        textEn: "Inform friends if your account starts sending scam messages"
      }
    ],
    evidenceToKeep: [
      {
        textKm: "Link",
        textEn: "Save the full suspicious URL"
      },
      {
        textKm: "Screenshot page",
        textEn: "Take screenshots of the landing page"
      },
      {
        textKm: "Chat message",
        textEn: "Save the chat message that contained the link"
      },
      {
        textKm: "Time clicked",
        textEn: "Note down the exact time clicked"
      }
    ],
    whatNotToDo: [
      {
        textKm: "កុំ Download file បន្ថែម",
        textEn: "Do NOT download or install any additional files or apps"
      },
      {
        textKm: "កុំបញ្ចូល OTP, Password, PIN ឬព័ត៌មានធនាគារ",
        textEn: "Do NOT enter your OTP, passwords, PINs, or banking details"
      }
    ]
  },
  {
    id: "hack",
    titleKm: "គណនីខ្ញុំត្រូវបានគេលួច",
    titleEn: "My Account Was Hacked",
    urgencyKm: "បន្ទាន់ខ្លាំង (High)",
    urgencyEn: "High Urgency",
    urgencyLevel: "High",
    icon: Skull,
    descriptionKm: "ប្រសិនបើអ្នកលែងអាចចូលប្រើគណនី Telegram ឬ Facebook របស់អ្នកបាន។",
    descriptionEn: "If you can no longer log in or access your Telegram, Facebook, or banking account.",
    doImmediately: [
      {
        textKm: "ប្រើមុខងារ Recover Account",
        textEn: "Use the built-in 'Recover Account' flow on the platform"
      },
      {
        textKm: "ប្តូរ Password",
        textEn: "Change your password immediately if you still have partial access"
      },
      {
        textKm: "ចេញពីគណនីលើឧបករណ៍ទាំងអស់",
        textEn: "Log out of all devices and active sessions"
      },
      {
        textKm: "បើក Two-factor authentication",
        textEn: "Enable two-factor authentication (2FA) immediately"
      },
      {
        textKm: "ប្រាប់មិត្តភក្តិ និងគ្រួសារថាគណនីអាចត្រូវបានគេប្រើបោកប្រាស់",
        textEn: "Alert your friends and family that your account has been hacked to avoid downstream scam attempts"
      }
    ],
    doNext: [
      {
        textKm: "ពិនិត្យ Email/Phone recovery",
        textEn: "Review recovery emails and linked phone numbers"
      },
      {
        textKm: "លុប App ឬ Device ដែលមិនស្គាល់",
        textEn: "Remove any unrecognized apps or unauthorized active devices"
      },
      {
        textKm: "ពិនិត្យសារ ឬ Post ដែលអ្នកមិនបានផ្ញើ",
        textEn: "Check sent messages or posts you didn't create"
      },
      {
        textKm: "Report ទៅ Platform",
        textEn: "Report the compromise to the platform support directly"
      }
    ],
    evidenceToKeep: [
      {
        textKm: "Screenshot សកម្មភាពចម្លែក",
        textEn: "Take screenshots of unusual activity"
      },
      {
        textKm: "Login alert",
        textEn: "Save any unauthorized login emails or alert notifications"
      },
      {
        textKm: "Chat scam sent from your account",
        textEn: "Save instances of scammers trying to message your contacts"
      },
      {
        textKm: "Date and time",
        textEn: "Log the date and time of the initial lockout"
      }
    ],
    whatNotToDo: [
      {
        textKm: "កុំបង់លុយឱ្យអ្នកណាដែលអះអាងថាជួយយកគណនីត្រឡប់",
        textEn: "Do NOT pay money to anyone claiming they can recover your account"
      },
      {
        textKm: "កុំចែក recovery code ឬ OTP",
        textEn: "Do NOT share recovery codes or verification OTPs with anyone"
      }
    ]
  }
];

export default function HelpView({ language, onCheckNow }: HelpViewProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [completedSteps, setCompletedSteps] = useState<{ [key: string]: boolean }>({});
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  // Evidence Checklist State (moved internally to detailed view)
  const [evidenceCheckState, setEvidenceCheckState] = useState<{ [key: number]: boolean }>({});

  const toggleCompleted = (stepKey: string) => {
    setCompletedSteps(prev => ({
      ...prev,
      [stepKey]: !prev[stepKey]
    }));
  };

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setCompletedSteps({});
    setEvidenceCheckState({});
    setCopySuccess(false);
  };

  const handleBack = () => {
    setSelectedId(null);
    setCompletedSteps({});
    setEvidenceCheckState({});
    setCopySuccess(false);
  };

  const currentOption = EMERGENCY_DATA.find(opt => opt.id === selectedId);

  const handleCopySteps = () => {
    if (!currentOption) return;

    let textToCopy = `=== ${language === 'km' ? currentOption.titleKm : currentOption.titleEn} ===\n`;
    textToCopy += `🚨 ${language === 'km' ? 'កម្រិតបន្ទាន់' : 'Urgency'}: ${language === 'km' ? currentOption.urgencyKm : currentOption.urgencyEn}\n\n`;

    textToCopy += `🔴 ${language === 'km' ? 'អ្វីដែលត្រូវធ្វើភ្លាមៗ' : 'Do Immediately'}:\n`;
    currentOption.doImmediately.forEach((item, idx) => {
      textToCopy += `${idx + 1}. ${language === 'km' ? item.textKm : item.textEn}\n`;
    });

    if (currentOption.doNext.length > 0) {
      textToCopy += `\n🟡 ${language === 'km' ? 'អ្វីដែលត្រូវធ្វើបន្ទាប់' : 'Do Next'}:\n`;
      currentOption.doNext.forEach((item, idx) => {
        textToCopy += `${idx + 1}. ${language === 'km' ? item.textKm : item.textEn}\n`;
      });
    }

    textToCopy += `\n📦 ${language === 'km' ? 'ភស្តុតាងដែលគួររក្សាទុក' : 'Evidence to Keep'}:\n`;
    textToCopy += language === 'km' 
      ? `• Screenshot សារ\n• Chat history\n• Link\n• លេខទូរស័ព្ទ ឬ username\n• Transaction ID ប្រសិនបើមាន\n• ថ្ងៃ និងម៉ោងកើតហេតុ\n`
      : `• Screenshot of messages\n• Chat history\n• Link\n• Phone number or username\n• Transaction ID (if any)\n• Date and time of incident\n`;

    if (currentOption.whatNotToDo.length > 0) {
      textToCopy += `\n❌ ${language === 'km' ? 'អ្វីដែលមិនគួរធ្វើ' : 'What Not to Do'}:\n`;
      currentOption.whatNotToDo.forEach((item, idx) => {
        textToCopy += `• ${language === 'km' ? item.textKm : item.textEn}\n`;
      });
    }

    textToCopy += `\n⚠️ ${
      language === 'km' 
        ? 'ឧបករណ៍នេះផ្តល់ការណែនាំសុវត្ថិភាពប៉ុណ្ណោះ។ ប្រសិនបើពាក់ព័ន្ធនឹងលុយ ធនាគារ ឬគណនីសំខាន់ សូមទាក់ទងប្រភពផ្លូវការភ្លាមៗ។' 
        : 'This tool gives safety guidance only. If money, banking, or important accounts are involved, contact official sources immediately.'
    }`;

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2500);
    }).catch(err => {
      console.error("Failed to copy text: ", err);
    });
  };

  const shortEvidenceItems = [
    { km: "Screenshot សារ", en: "Screenshot of messages" },
    { km: "Chat history", en: "Chat history" },
    { km: "Link", en: "Link / URL" },
    { km: "លេខទូរស័ព្ទ ឬ username", en: "Phone number or username" },
    { km: "Transaction ID ប្រសិនបើមាន", en: "Transaction ID (if any)" },
    { km: "ថ្ងៃ និងម៉ោងកើតហេតុ", en: "Date and time of incident" }
  ];

  return (
    <div id="help-view-container" className="max-w-3xl mx-auto px-4 py-6 md:py-8">
      {/* Detail View Mode */}
      {selectedId && currentOption ? (
        <div id="emergency-detail-view" className="space-y-6">
          {/* Top Bar Navigation inside details */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 border border-slate-200 p-4 rounded-3xl">
            <button
              id="btn-back-to-list"
              onClick={handleBack}
              className="flex items-center space-x-2 text-xs font-bold text-gray-700 bg-white border border-gray-200 px-4 py-2.5 rounded-xl hover:bg-slate-50 transition cursor-pointer self-start"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{language === 'km' ? 'ត្រឡប់ក្រោយ' : 'Back to Options'}</span>
            </button>

            {onCheckNow && (
              <button
                id="btn-check-message-now"
                onClick={onCheckNow}
                className="flex items-center justify-center space-x-2 text-xs font-bold text-white bg-[#0F172A] px-4.5 py-2.5 rounded-xl hover:bg-slate-800 transition cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>{language === 'km' ? 'ពិនិត្យសារឥឡូវនេះ' : 'Check a Message Now'}</span>
              </button>
            )}
          </div>

          {/* Core Info & Title Card */}
          <div className="bg-white rounded-3xl border-2 border-[#0F172A] p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-red-50 text-red-600 rounded-2xl shrink-0">
                  {React.createElement(currentOption.icon, { className: "w-6 h-6 stroke-[2.2px]" })}
                </div>
                <div>
                  <h3 className="text-xl font-black text-[#0F172A] leading-tight">
                    {language === 'km' ? currentOption.titleKm : currentOption.titleEn}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {language === 'km' ? currentOption.descriptionKm : currentOption.descriptionEn}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-xs px-3.5 py-1.5 rounded-full font-bold uppercase tracking-wider ${
                  currentOption.urgencyLevel === 'High' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  🚨 {language === 'km' ? currentOption.urgencyKm : currentOption.urgencyEn}
                </span>

                <button
                  id="btn-copy-emergency-steps"
                  onClick={handleCopySteps}
                  className="flex items-center space-x-1.5 text-xs font-bold text-slate-800 bg-slate-100 px-3.5 py-1.5 rounded-full hover:bg-slate-200 transition cursor-pointer"
                >
                  {copySuccess ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Clipboard className="w-3.5 h-3.5" />}
                  <span>{copySuccess ? (language === 'km' ? 'បានចម្លង!' : 'Copied!') : (language === 'km' ? 'ចម្លងជំហានទុក' : 'Copy Steps')}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Section: Do Immediately / អ្វីដែលត្រូវធ្វើភ្លាមៗ */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-red-600 uppercase tracking-wider flex items-center space-x-1.5">
              <span>🔴</span>
              <span>{language === 'km' ? 'អ្វីដែលត្រូវធ្វើភ្លាមៗ (Do Immediately)' : 'Do Immediately'}</span>
            </h4>
            <div className="grid grid-cols-1 gap-2.5">
              {currentOption.doImmediately.map((step, idx) => {
                const stepKey = `${currentOption.id}-imm-${idx}`;
                const isDone = !!completedSteps[stepKey];
                return (
                  <div
                    key={idx}
                    onClick={() => toggleCompleted(stepKey)}
                    className={`flex items-start space-x-3 p-4 rounded-2xl border transition-all cursor-pointer ${
                      isDone
                        ? 'bg-slate-50 border-slate-100 text-gray-400 opacity-60'
                        : 'bg-red-50/50 border-red-200 hover:bg-red-100/20 text-[#0F172A]'
                    }`}
                  >
                    <div className="shrink-0 mt-0.5">
                      {isDone ? (
                        <CheckSquare className="w-4 h-4 text-green-600" />
                      ) : (
                        <Square className="w-4 h-4 text-red-500" />
                      )}
                    </div>
                    <div>
                      <p className={`text-xs md:text-sm font-bold leading-relaxed ${isDone ? 'line-through text-gray-400' : ''}`}>
                        {step.textKm}
                      </p>
                      <p className={`text-[11px] mt-0.5 text-gray-500 font-medium ${isDone ? 'line-through text-gray-400' : ''}`}>
                        {step.textEn}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section: Do Next / អ្វីដែលត្រូវធ្វើបន្ទាប់ */}
          {currentOption.doNext.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-amber-600 uppercase tracking-wider flex items-center space-x-1.5">
                <span>🟡</span>
                <span>{language === 'km' ? 'អ្វីដែលត្រូវធ្វើបន្ទាប់ (Do Next)' : 'Do Next'}</span>
              </h4>
              <div className="grid grid-cols-1 gap-2.5">
                {currentOption.doNext.map((step, idx) => {
                  const stepKey = `${currentOption.id}-next-${idx}`;
                  const isDone = !!completedSteps[stepKey];
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleCompleted(stepKey)}
                      className={`flex items-start space-x-3 p-4 rounded-2xl border transition-all cursor-pointer ${
                        isDone
                          ? 'bg-slate-50 border-slate-100 text-gray-400 opacity-60'
                          : 'bg-amber-50/30 border-amber-200 hover:bg-amber-100/20 text-[#0F172A]'
                      }`}
                    >
                      <div className="shrink-0 mt-0.5">
                        {isDone ? (
                          <CheckSquare className="w-4 h-4 text-green-600" />
                        ) : (
                          <Square className="w-4 h-4 text-amber-600" />
                        )}
                      </div>
                      <div>
                        <p className={`text-xs md:text-sm font-bold leading-relaxed ${isDone ? 'line-through text-gray-400' : ''}`}>
                          {step.textKm}
                        </p>
                        <p className={`text-[11px] mt-0.5 text-gray-500 font-medium ${isDone ? 'line-through text-gray-400' : ''}`}>
                          {step.textEn}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Two lists for Evidence and What not to do */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Short Evidence Checklist (moved directly here) */}
            <div className="bg-white border-2 border-slate-100 rounded-3xl p-5 space-y-3 shadow-sm">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center space-x-1.5">
                <span>📦</span>
                <span>{language === 'km' ? 'ភស្តុតាងដែលគួររក្សាទុក' : 'Evidence to Keep'}</span>
              </h4>
              <div className="space-y-2">
                {shortEvidenceItems.map((item, idx) => {
                  const isChecked = !!evidenceCheckState[idx];
                  return (
                    <div
                      key={idx}
                      onClick={() => setEvidenceCheckState(prev => ({ ...prev, [idx]: !prev[idx] }))}
                      className={`flex items-start space-x-2.5 p-2.5 rounded-xl border transition-all cursor-pointer ${
                        isChecked 
                          ? 'bg-green-50/30 border-green-100 text-gray-400' 
                          : 'bg-slate-50/50 border-slate-150 hover:bg-slate-100/40 text-gray-800'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">
                        {isChecked ? (
                          <CheckSquare className="w-3.5 h-3.5 text-green-600" />
                        ) : (
                          <Square className="w-3.5 h-3.5 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className={`text-xs font-bold leading-normal ${isChecked ? 'line-through' : ''}`}>
                          {item.km}
                        </p>
                        <p className={`text-[10px] text-gray-500 font-medium ${isChecked ? 'line-through' : ''}`}>
                          {item.en}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section: What not to do */}
            {currentOption.whatNotToDo.length > 0 && (
              <div className="bg-white border-2 border-red-100 rounded-3xl p-5 space-y-3 shadow-sm">
                <h4 className="text-xs font-bold text-red-500 uppercase tracking-wider flex items-center space-x-1.5">
                  <span>❌</span>
                  <span>{language === 'km' ? 'អ្វីដែលមិនគួរធ្វើ' : 'What Not to Do'}</span>
                </h4>
                <ul className="space-y-2.5">
                  {currentOption.whatNotToDo.map((step, idx) => (
                    <li key={idx} className="bg-red-50/20 border border-red-100 px-3.5 py-2.5 rounded-xl text-xs flex flex-col gap-0.5">
                      <span className="font-bold text-red-700">✖ {step.textKm}</span>
                      <span className="text-[10px] text-red-600 font-medium">{step.textEn}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Prominent Safety Disclaimer */}
          <div className="bg-amber-50 border-2 border-amber-200 p-5 rounded-3xl text-xs flex items-start space-x-3.5 shadow-sm">
            <span className="text-xl mt-0.5">⚠️</span>
            <div className="space-y-1 text-amber-900 leading-relaxed font-bold">
              <p>ឧបករណ៍នេះផ្តល់ការណែនាំសុវត្ថិភាពប៉ុណ្ណោះ។ ប្រសិនបើពាក់ព័ន្ធនឹងលុយ ធនាគារ ឬគណនីសំខាន់ សូមទាក់ទងប្រភពផ្លូវការភ្លាមៗ។</p>
              <p className="text-[11px] text-amber-800 font-semibold mt-1">This tool gives safety guidance only. If money, banking, or important accounts are involved, contact official sources immediately.</p>
            </div>
          </div>

          {/* Quick back buttons */}
          <div className="flex justify-center pt-4">
            <button
              onClick={handleBack}
              className="text-xs font-bold text-[#0F172A] border-b-2 border-[#0F172A] pb-0.5 hover:opacity-80 transition cursor-pointer"
            >
              ← {language === 'km' ? 'ត្រឡប់ទៅមើលជម្រើសផ្សេងទៀត' : 'Back to Option Selection'}
            </button>
          </div>
        </div>
      ) : (
        <div id="emergency-options-grid-view" className="space-y-8">
          {/* Header Info */}
          <div id="help-header-block" className="text-center">
            <div className="inline-flex items-center justify-center bg-red-50 text-red-600 p-3.5 rounded-3xl mb-4 shadow-sm border border-red-100">
              <AlertTriangle className="w-7 h-7 stroke-[2.2px] animate-pulse" />
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-[#0F172A] tracking-tight">
              {language === 'km' ? 'ជំនួយសង្គ្រោះបន្ទាន់' : 'Emergency Safety Helpline'}
            </h2>
            <p className="text-xs md:text-sm text-gray-500 mt-2 max-w-lg mx-auto leading-relaxed">
              {language === 'km'
                ? 'តើអ្នកបានចាញ់បោកគេ ឬបានចែករំលែកព័ត៌មានសម្ងាត់រួចហើយមែនទេ? កុំបារម្ភ! សូមជ្រើសរើសជម្រើសខាងក្រោម ដើម្បីទទួលបានដំណោះស្រាយភ្លាមៗ។'
                : 'Did you make a mistake or share sensitive information? Choose from the emergency categories below to see urgent action items.'}
            </p>
          </div>

          {/* Main Options Grid */}
          <div id="emergency-options-list" className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {EMERGENCY_DATA.map((opt) => {
              const Icon = opt.icon;
              const title = language === 'km' ? opt.titleKm : opt.titleEn;
              const desc = language === 'km' ? opt.descriptionKm : opt.descriptionEn;

              return (
                <button
                  key={opt.id}
                  id={`emergency-card-${opt.id}`}
                  onClick={() => handleSelect(opt.id)}
                  className="bg-white rounded-3xl border-2 border-slate-200 hover:border-[#0F172A] transition-all duration-250 p-5 text-left cursor-pointer hover:shadow-md flex items-start space-x-4 group"
                >
                  <div className="p-3 bg-red-50 text-red-600 group-hover:bg-[#0F172A] group-hover:text-white rounded-2xl shrink-0 transition-colors">
                    <Icon className="w-5 h-5 stroke-[2.2px]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h3 className="text-base font-bold text-[#0F172A] truncate">
                        {title}
                      </h3>
                      <span className="text-[10px] uppercase font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md group-hover:bg-red-100 shrink-0">
                        {opt.urgencyLevel === 'High' ? 'High' : 'Medium'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {desc}
                    </p>
                    <span className="inline-flex items-center text-[11px] font-bold text-[#0F172A] mt-2.5 border-b border-transparent group-hover:border-[#0F172A] pb-0.5 transition-all">
                      {language === 'km' ? 'មើលដំណោះស្រាយបន្ទាន់ →' : 'View Action Plan →'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Police/Authority Contacts */}
          <div id="contacts-card" className="bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-sm">
            <h3 className="text-xs font-bold text-[#0F172A]/50 uppercase tracking-widest mb-4 font-mono">
              {language === 'km' ? 'លេខទូរស័ព្ទអាជ្ញាធរមានសមត្ថកិច្ច' : 'Official Cybersecurity Contacts'}
            </h3>
            
            <div className="space-y-3 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <p className="font-bold text-[#0F172A]">{language === 'km' ? 'នាយកដ្ឋានប្រឆាំងបទល្មើសបច្ចេកវិទ្យា' : 'Anti-Cybercrime Department'}</p>
                  <p className="text-gray-400 text-[10px]">Ministry of Interior (MOI)</p>
                </div>
                <a href="tel:023726822" className="bg-[#0F172A] text-white px-4 py-2.5 rounded-xl font-bold cursor-pointer hover:bg-slate-800 transition-all text-center">
                  023 726 822
                </a>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <p className="font-bold text-[#0F172A]">{language === 'km' ? 'លេខទូរស័ព្ទសង្គ្រោះបន្ទាន់ទូទៅ' : 'General Emergency Police'}</p>
                  <p className="text-gray-400 text-[10px]">National Emergency Line</p>
                </div>
                <a href="tel:117" className="bg-red-600 text-white px-5 py-2.5 rounded-xl font-bold cursor-pointer hover:bg-red-700 transition-all text-center">
                  117
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
