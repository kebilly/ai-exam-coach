export const GRADING_VERSION = "civil-law-rubric-v1.0";

export const dimensionConfig = {
  question_understanding: { maxScore: 8, label: "題意掌握" },
  issue_spotting: { maxScore: 16, label: "爭點辨識" },
  claim_basis_and_legal_authority: { maxScore: 16, label: "請求權基礎與法律依據" },
  rule_explanation_and_legal_reasoning: { maxScore: 14, label: "大前提與法理推論" },
  subsumption: { maxScore: 30, label: "涵攝" },
  logical_consistency: { maxScore: 6, label: "邏輯一致性" },
  conclusion: { maxScore: 4, label: "結論" },
  writing_structure: { maxScore: 4, label: "架構與版面" },
  professional_terminology: { maxScore: 2, label: "法律用語" },
} as const;

export type DimensionKey = keyof typeof dimensionConfig;

export const dimensionKeys = Object.keys(dimensionConfig) as DimensionKey[];

export const rawMaxScore = dimensionKeys.reduce((sum, key) => sum + dimensionConfig[key].maxScore, 0);

export const defaultConvertedMaxScore = 100;

export function clampScore(value: number, max: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(max, Math.round(value * 10) / 10));
}

