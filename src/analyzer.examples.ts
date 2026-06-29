/**
 * Test examples for the ScamCheck KH rule-based analyzer.
 *
 * These cover every scam type so detection logic can be verified after changes.
 * Run a quick self-test in Node with:  npx tsx src/analyzer.examples.ts
 */

import { analyzeThreat } from "./analyzer";

export interface AnalyzerExample {
  name: string;
  text: string;
  expectedType: string;
  expectedMinLevel: "Low" | "Medium" | "High";
}

export const ANALYZER_EXAMPLES: AnalyzerExample[] = [
  {
    name: "Bank / OTP Scam",
    text: "ABA notice: your account will be blocked. Please verify your account and send your OTP code and PIN now.",
    expectedType: "Bank / OTP Scam",
    expectedMinLevel: "High",
  },
  {
    name: "Bank / OTP Scam (Khmer)",
    text: "គណនីត្រូវបានបិទ។ សូមផ្ញើលេខកូដ OTP និងពាក្យសម្ងាត់ ABA របស់អ្នកមកវិញ។",
    expectedType: "Bank / OTP Scam",
    expectedMinLevel: "High",
  },
  {
    name: "Fake Job Scam",
    text: "Work from home, no experience needed, salary guaranteed! Just pay first a small registration fee and training fee deposit.",
    expectedType: "Fake Job Scam",
    expectedMinLevel: "High",
  },
  {
    name: "Fake Job Scam (Khmer)",
    text: "ការងារធ្វើពីផ្ទះ ធានាប្រាក់ខែខ្ពស់! គ្រាន់តែបង់ប្រាក់មុន ថ្លៃចុះឈ្មោះ និងថ្លៃបណ្តុះបណ្តាល។",
    expectedType: "Fake Job Scam",
    expectedMinLevel: "High",
  },
  {
    name: "Investment Scam",
    text: "Crypto investment with guaranteed profit! Double money and earn daily passive income. Risk free!",
    expectedType: "Investment Scam",
    expectedMinLevel: "High",
  },
  {
    name: "Investment Scam (Khmer)",
    text: "ការវិនិយោគ Crypto ធានាចំណេញ! ប្រាក់ចំណេញទ្វេដង និងចំណូលប្រចាំថ្ងៃ គ្មានហានិភ័យ។",
    expectedType: "Investment Scam",
    expectedMinLevel: "High",
  },
  {
    name: "Online Shopping Scam",
    text: "iPhone 15 cheap price, limited stock for pre-order! Pay first and we will ship to you. Delivery fee applies.",
    expectedType: "Online Shopping Scam",
    expectedMinLevel: "Medium",
  },
  {
    name: "KHQR / Payment Scam",
    text: "I already paid, here is the payment screenshot slip. Please send goods now via KHQR.",
    expectedType: "KHQR / Payment Scam",
    expectedMinLevel: "Medium",
  },
  {
    name: "Suspicious Link",
    text: "Click link now to claim your reward: https://bit.ly/free-prize-now",
    expectedType: "Suspicious Link",
    expectedMinLevel: "Medium",
  },
  {
    name: "Suspicious Link (Khmer)",
    text: "ចុចតំណនេះឥឡូវនេះ៖ https://tinyurl.com/win-gift ដើម្បីទទួលរង្វាន់។",
    expectedType: "Suspicious Link",
    expectedMinLevel: "Medium",
  },
  {
    name: "Prize Scam",
    text: "Congratulations! You won a prize. Claim reward now, free money waiting for you.",
    expectedType: "Prize Scam",
    expectedMinLevel: "Medium",
  },
  {
    name: "Account Security Scam",
    text: "Your Facebook account is suspended. Verify your account immediately or it will be locked.",
    expectedType: "Account Security Scam",
    expectedMinLevel: "Medium",
  },
  {
    name: "Normal Safe Message",
    text: "សួស្តីបង ស្អែកព្រឹកម៉ោង ៩ អាចជួបពិភាក្សាការងារបន្តិចបានទេ?",
    expectedType: "Normal Safe Message",
    expectedMinLevel: "Low",
  },
];

const LEVEL_RANK: Record<string, number> = { Low: 0, Medium: 1, High: 2 };

/**
 * Runs all examples and logs a pass/fail report. Returns true if all pass.
 */
export function runAnalyzerSelfTest(): boolean {
  let allPassed = true;

  for (const ex of ANALYZER_EXAMPLES) {
    const result = analyzeThreat(ex.text);
    const typeOk = result.detectedType === ex.expectedType;
    const levelOk = LEVEL_RANK[result.riskLevel] >= LEVEL_RANK[ex.expectedMinLevel];
    const passed = typeOk && levelOk;

    if (!passed) allPassed = false;

    // eslint-disable-next-line no-console
    console.log(
      `${passed ? "PASS" : "FAIL"} | ${ex.name}\n` +
        `   expected type=${ex.expectedType} (>=${ex.expectedMinLevel})\n` +
        `   got      type=${result.detectedType} level=${result.riskLevel} ` +
        `score=${result.riskScore} confidence=${result.confidence}`
    );
  }

  // eslint-disable-next-line no-console
  console.log(`\n${allPassed ? "✅ ALL EXAMPLES PASSED" : "❌ SOME EXAMPLES FAILED"}`);
  return allPassed;
}

// Allow direct execution: `npx tsx src/analyzer.examples.ts`
// Using process.argv guard so it never runs during Vite bundling.
declare const process: { argv: string[] } | undefined;
if (typeof process !== "undefined" && process.argv && process.argv[1] && process.argv[1].includes("analyzer.examples")) {
  runAnalyzerSelfTest();
}
