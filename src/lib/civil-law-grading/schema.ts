import { z } from "zod";
import { dimensionConfig, dimensionKeys } from "@/lib/civil-law-grading/config";

const evidenceSchema = z.array(z.string()).default([]);

const dimensionScoreSchema = z.object({
  score: z.number(),
  max_score: z.number(),
  reason: z.string(),
  evidence: evidenceSchema,
});

const dimensionScoresShape = Object.fromEntries(
  dimensionKeys.map((key) => [key, dimensionScoreSchema.extend({ max_score: z.literal(dimensionConfig[key].maxScore) })]),
) as unknown as Record<(typeof dimensionKeys)[number], typeof dimensionScoreSchema>;

export const questionAnalysisSchema = z.object({
  question_type: z.enum(["case", "theory", "mixed"]),
  sub_questions: z.array(z.string()).default([]),
  parties: z.array(z.string()).default([]),
  timeline: z.array(z.string()).default([]),
  legal_relationships: z.array(z.string()).default([]),
  expected_claim_bases: z.array(z.string()).default([]),
  expected_issues: z.array(z.string()).default([]),
  optional_issues: z.array(z.string()).default([]),
  irrelevant_issues: z.array(z.string()).default([]),
  applicable_articles: z.array(z.string()).default([]),
  required_elements: z.array(z.string()).default([]),
  disputed_elements: z.array(z.string()).default([]),
  undisputed_elements: z.array(z.string()).default([]),
  acceptable_positions: z.array(z.string()).default([]),
  decisive_facts: z.array(z.string()).default([]),
});

export const elementEvaluationSchema = z.object({
  element: z.string(),
  importance: z.enum(["high", "medium", "low"]),
  relevant_facts: z.array(z.string()).default([]),
  student_evidence: z.array(z.string()).default([]),
  coverage: z.number().min(0).max(1),
  accuracy: z.number().min(0).max(1),
  reasoning_quality: z.number().min(0).max(1),
  hallucinated_fact: z.boolean(),
  comment: z.string(),
});

export const civilLawGradingResultSchema = z.object({
  grading_version: z.string(),
  question_type: z.enum(["case", "theory", "mixed"]),
  raw_total_score: z.number(),
  raw_max_score: z.number(),
  converted_score: z.number(),
  converted_max_score: z.number(),
  confidence: z.number().min(0).max(1),
  overall_impression: z.object({
    summary: z.string(),
    main_strength: z.string(),
    main_weakness: z.string(),
  }),
  dimension_scores: z.object(dimensionScoresShape),
  question_analysis: questionAnalysisSchema.pick({
    sub_questions: true,
    parties: true,
    timeline: true,
    legal_relationships: true,
    expected_claim_bases: true,
    decisive_facts: true,
  }),
  issue_analysis: z.object({
    expected_issues: z.array(z.string()).default([]),
    identified_issues: z.array(z.string()).default([]),
    missing_core_issues: z.array(z.string()).default([]),
    missing_secondary_issues: z.array(z.string()).default([]),
    irrelevant_discussion: z.array(z.string()).default([]),
  }),
  legal_authority_analysis: z.object({
    correct_articles: z.array(z.string()).default([]),
    incorrect_articles: z.array(z.string()).default([]),
    missing_legal_bases: z.array(z.string()).default([]),
    unverified_cases_or_doctrines: z.array(z.string()).default([]),
  }),
  subsumption_analysis: z.array(
    z.object({
      issue: z.string(),
      importance: z.enum(["core", "secondary"]),
      legal_basis: z.array(z.string()).default([]),
      student_position: z.string(),
      elements: z.array(elementEvaluationSchema),
      issue_score: z.number(),
      issue_max_score: z.number(),
    }),
  ),
  layout_review: z.object({
    questions_answers_alignment: z.string(),
    heading_hierarchy: z.string(),
    paragraph_readability: z.string(),
    specific_corrections: z.array(z.string()).default([]),
  }),
  deductions: z.array(
    z.object({
      deduction_reason_id: z.string(),
      severity: z.enum(["fatal", "major", "moderate", "minor", "style"]),
      dimension: z.string(),
      points: z.number(),
      reason: z.string(),
      student_evidence: z.string(),
    }),
  ),
  grading_diagnostics: z.object({
    subsumption_coverage_average: z.number().min(0).max(1),
    advanced_depth_score: z.number().min(0),
    calibration_flags: z.array(z.string()).default([]),
    score_caps: z.array(
      z.object({
        score_cap_id: z.string(),
        applied: z.boolean(),
        cap: z.number(),
        reason: z.string(),
      }),
    ).default([]),
  }),
  terminology_suggestions: z.array(
    z.object({
      original_text: z.string(),
      suggested_revision: z.string(),
      reason: z.string(),
    }),
  ).default([]),
  bonus_points: z.array(
    z.object({
      topic: z.string(),
      suggestion: z.string(),
      estimated_points: z.string(),
      reason: z.string(),
    }),
  ).default([]),
  grading_radar: z.array(
    z.object({
      label: z.string(),
      stars: z.number().min(0).max(5),
      max_stars: z.literal(5),
    }),
  ).default([]),
  score_breakdown: z.array(
    z.object({
      label: z.string(),
      type: z.enum(["credit", "deduction"]),
      points: z.number(),
      reason: z.string(),
      evidence: z.string().optional(),
    }),
  ).default([]),
  feedback_items: z.array(
    z.object({
      student_evidence: z.string(),
      issue_or_element: z.string(),
      feedback_type: z.enum(["missing", "partial", "complete", "incorrect"]),
      analysis: z.string(),
      suggested_revision: z.string(),
    }),
  ).default([]),
  strengths: z.array(z.string()).default([]),
  priority_improvements: z.array(z.string()).default([]),
  examiner_comment: z.string(),
  coach_rewrite: z.object({
    target_problem: z.string(),
    why_this_section_was_selected: z.string(),
    rewritten_paragraph: z.string(),
  }),
  suggested_answer_structure: z.array(z.string()).default([]),
});

export type QuestionAnalysis = z.infer<typeof questionAnalysisSchema>;
export type CivilLawGradingResult = z.infer<typeof civilLawGradingResultSchema>;
