/**
 * Private Alpha Analyzer QA Runner.
 *
 * Runs every sample in privateAlphaSamples.ts through the RULE-BASED analyzer
 * (Gemini is never used here) and reports pass/fail per sample, plus totals and
 * a clear list of failures.
 *
 * Run with:  npm run test:alpha
 */

import { analyzeThreat } from '../analyzer';
import { PRIVATE_ALPHA_SAMPLES, AlphaSample } from './privateAlphaSamples';

interface Result {
  sample: AlphaSample;
  actualType: string;
  actualRiskLevel: string;
  actualScore: number;
  typeOk: boolean;
  levelOk: boolean;
  passed: boolean;
}

function runOne(sample: AlphaSample): Result {
  const r = analyzeThreat(sample.text);
  const typeOk = r.detectedType === sample.expectedType;
  const levelOk = r.riskLevel === sample.expectedRiskLevel;
  return {
    sample,
    actualType: r.detectedType,
    actualRiskLevel: r.riskLevel,
    actualScore: r.riskScore,
    typeOk,
    levelOk,
    passed: typeOk && levelOk,
  };
}

function main(): void {
  const results = PRIVATE_ALPHA_SAMPLES.map(runOne);

  // eslint-disable-next-line no-console
  console.log('\n=== ScamCheck KH — Private Alpha Analyzer QA ===\n');

  for (const res of results) {
    const tag = res.passed ? 'PASS' : 'FAIL';
    if (res.passed) {
      // eslint-disable-next-line no-console
      console.log(`${tag} ${res.sample.id}`);
    } else {
      const problems: string[] = [];
      if (!res.typeOk) {
        problems.push(`expected ${res.sample.expectedType} but got ${res.actualType}`);
      }
      if (!res.levelOk) {
        problems.push(
          `expected ${res.sample.expectedRiskLevel} risk but got ${res.actualRiskLevel} (score ${res.actualScore})`
        );
      }
      // eslint-disable-next-line no-console
      console.log(`${tag} ${res.sample.id} — ${problems.join('; ')}`);
    }
  }

  const passed = results.filter((r) => r.passed).length;
  const failed = results.length - passed;

  // eslint-disable-next-line no-console
  console.log('\n------------------------------------------------');
  // eslint-disable-next-line no-console
  console.log(`Total: ${results.length} | Passed: ${passed} | Failed: ${failed}`);
  // eslint-disable-next-line no-console
  console.log('------------------------------------------------');

  if (failed > 0) {
    // eslint-disable-next-line no-console
    console.log('\nFailed cases (review for false positives / negatives):');
    for (const res of results.filter((r) => !r.passed)) {
      // eslint-disable-next-line no-console
      console.log(
        `  • ${res.sample.id}\n` +
          `      text:     ${res.sample.text}\n` +
          `      expected: ${res.sample.expectedType} / ${res.sample.expectedRiskLevel}\n` +
          `      actual:   ${res.actualType} / ${res.actualRiskLevel} (score ${res.actualScore})\n` +
          `      notes:    ${res.sample.notes}`
      );
    }
    // eslint-disable-next-line no-console
    console.log('');
  } else {
    // eslint-disable-next-line no-console
    console.log('\n✅ All private alpha samples passed.\n');
  }

  // Non-zero exit code on failure so CI / scripts can detect regressions.
  if (typeof process !== 'undefined' && failed > 0) {
    process.exitCode = 1;
  }
}

main();
