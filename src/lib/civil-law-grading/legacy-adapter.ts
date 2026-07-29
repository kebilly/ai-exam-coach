import type { CivilLawGradingResult } from "@/lib/civil-law-grading/schema";
import type { LawFeedback } from "@/types";

export type LegacyLawFeedback = LawFeedback & {
  grading_result?: CivilLawGradingResult;
  mode?: string;
  warning?: string;
};

function scale(value: number, max: number, targetMax: number) {
  return Math.round((Math.max(0, Math.min(max, value)) / max) * targetMax);
}

export function toLegacyFeedback(result: CivilLawGradingResult, extra?: { mode?: string; warning?: string }): LegacyLawFeedback {
  const dimensions = result.dimension_scores;
  const issueScore = scale(dimensions.issue_spotting.score, dimensions.issue_spotting.max_score, 25);
  const legalScore = scale(
    dimensions.claim_basis_and_legal_authority.score,
    dimensions.claim_basis_and_legal_authority.max_score,
    25,
  );
  const argumentRaw =
    dimensions.rule_explanation_and_legal_reasoning.score +
    dimensions.subsumption.score +
    dimensions.logical_consistency.score;
  const argumentMax =
    dimensions.rule_explanation_and_legal_reasoning.max_score +
    dimensions.subsumption.max_score +
    dimensions.logical_consistency.max_score;
  const argumentScore = scale(argumentRaw, argumentMax, 30);
  const conclusionScore = scale(
    dimensions.conclusion.score + dimensions.writing_structure.score + dimensions.professional_terminology.score,
    dimensions.conclusion.max_score + dimensions.writing_structure.max_score + dimensions.professional_terminology.max_score,
    20,
  );
  const missingElements = result.subsumption_analysis
    .flatMap((analysis) => analysis.elements)
    .filter((element) => element.coverage === 0)
    .map((element) => element.element);
  const weakElements = result.subsumption_analysis
    .flatMap((analysis) => analysis.elements)
    .filter((element) => element.coverage > 0 && element.coverage < 0.75 && !isIntroductoryElementAlreadyMentioned(element))
    .map((element) => `可補強「${element.element}」`);
  const terminologyAdvice = result.terminology_suggestions
    .map((item) => `「${item.original_text}」可改為「${item.suggested_revision}」：${item.reason}`);
  const partialFeedback = result.feedback_items
    .filter((item) => item.feedback_type === "partial" && !/買賣契約關係|契約關係/.test(item.issue_or_element))
    .map((item) => `可補強「${item.issue_or_element}」`);
  const missingFeedback = result.feedback_items
    .filter((item) => item.feedback_type === "missing")
    .map((item) => item.issue_or_element);
  const mainWeakness =
    /法律用語/.test(result.overall_impression.main_weakness) && terminologyAdvice.length
      ? terminologyAdvice[0]
      : /法律用語/.test(result.overall_impression.main_weakness)
        ? partialFeedback[0] ?? result.priority_improvements[0] ?? neutralHighScoreImprovement(result)
      : result.overall_impression.main_weakness;
  const weaknesses = dedupeText([mainWeakness, ...partialFeedback, ...weakElements])
    .filter((item) => !isPositiveFeedback(item))
    .slice(0, 4);
  const nextPractice = dedupeText(result.priority_improvements.filter((item) => !weaknesses.includes(item))).slice(0, 4);
  const revisionAdvice = dedupeText([
    result.examiner_comment,
    ...buildRevisionSuggestions(result),
    ...terminologyAdvice,
  ]).slice(0, 5).join("\n\n");
  const missingPoints = dedupeText([
    ...missingFeedback,
    ...missingElements,
    ...result.legal_authority_analysis.missing_legal_bases,
  ]).slice(0, 5);

  return {
    score: Math.round(result.converted_score),
    issue_score: issueScore,
    legal_basis_score: legalScore,
    argument_score: argumentScore,
    conclusion_score: conclusionScore,
    strengths: result.strengths.length ? result.strengths : [result.overall_impression.main_strength],
    weaknesses,
    missing_points: missingPoints,
    revision_advice: revisionAdvice,
    model_answer_outline: result.suggested_answer_structure.join("\n"),
    next_practice_focus: nextPractice,
    confidence: result.confidence >= 0.75 ? "high" : result.confidence >= 0.45 ? "medium" : "low",
    terminology_suggestions: result.terminology_suggestions,
    bonus_points: result.bonus_points,
    grading_radar: result.grading_radar,
    score_breakdown: result.score_breakdown,
    feedback_items: result.feedback_items,
    grading_result: result,
    mode: extra?.mode,
    warning: extra?.warning,
  };
}

function dedupeText(items: string[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const normalized = item.trim();
    if (!normalized || seen.has(normalized)) return false;
    seen.add(normalized);
    return true;
  });
}

function isIntroductoryElementAlreadyMentioned(element: { element: string; student_evidence: string[] }) {
  return /買賣契約關係|契約關係/.test(element.element) && element.student_evidence.length > 0;
}

function isPositiveFeedback(item: string) {
  return /已具備|表現相對較好|完整申論雛形|已完整|足以支撐高分/.test(item);
}

function neutralHighScoreImprovement(result: CivilLawGradingResult) {
  if (result.raw_total_score >= 80) {
    return "可再精煉段落標題與爭點收束，讓閱卷者更快看到請求權基礎、涵攝與結論。";
  }
  return "可再補強法律用語與要件涵攝的連結，避免只寫結論而未說明理由。";
}

function buildRevisionSuggestions(result: CivilLawGradingResult) {
  return result.feedback_items
    .filter((item) => item.feedback_type === "partial" || item.feedback_type === "missing")
    .filter((item) => !/買賣契約關係|契約關係/.test(item.issue_or_element))
    .slice(0, 2)
    .map((item) => {
      if (item.feedback_type === "missing") {
        return `【補上${item.issue_or_element}】請新增一小段：${revisionPromptForElement(item.issue_or_element, false)}`;
      }
      return `【補強${item.issue_or_element}】你已寫到「${item.student_evidence}」。下一句請補成：${revisionPromptForElement(item.issue_or_element, true)}`;
    });
}

function revisionPromptForElement(element: string, alreadyMentioned: boolean) {
  const prefix = alreadyMentioned ? "承接該事實，" : "";
  if (/法律效果|救濟效果|返還範圍/.test(element)) {
    return `${prefix}明確寫出可主張的法律效果、範圍與限制，例如成立時得請求何種給付，或不成立時理由為何。`;
  }
  if (/可歸責|擔保責任/.test(element)) {
    return `${prefix}說明責任基礎為瑕疵擔保、債務不履行或其他規範，並交代為何該事實足以連到該責任。`;
  }
  if (/因果/.test(element)) {
    return `${prefix}說明該行為與損害之間的原因連結，避免只寫結論。`;
  }
  if (/過失|故意/.test(element)) {
    return `${prefix}把事實轉成注意義務違反或主觀狀態的法律評價。`;
  }
  if (/損害|受損害/.test(element)) {
    return `${prefix}指出財產或權利受損的具體內容，並說明其與請求範圍的關係。`;
  }
  return `${prefix}先寫要件，再接題目事實，最後用一句話說明本要件成立或不成立。`;
}
