import { dimensionConfig, GRADING_VERSION } from "@/lib/civil-law-grading/config";
import type { QuestionAnalysis } from "@/lib/civil-law-grading/schema";

export const civilLawSystemPrompt = `
你是一位嚴格、專業、重視法律推理與具體涵攝的台灣民法申論閱卷官與批改教練。
請評估法律推理品質，不要只看答案相似度、篇幅或法條關鍵字。
不得虛構裁判字號、法條內容或題目沒有提供的事實。
若考生採取不同但具法律依據的見解，應評估其法源、理由與涵攝，不得直接判錯。
`.trim();

export function buildQuestionAnalysisPrompt(question: string) {
  return `
請先分析民法申論題目，建立本題專屬 rubric。只輸出 JSON。
需要欄位：
question_type: "case" | "theory" | "mixed"
sub_questions, parties, timeline, legal_relationships, expected_claim_bases,
expected_issues, optional_issues, irrelevant_issues, applicable_articles,
required_elements, disputed_elements, undisputed_elements, acceptable_positions, decisive_facts

題目：
${question}
`.trim();
}

export function buildAnswerEvaluationPrompt(question: string, answer: string, analysis: QuestionAnalysis) {
  return `
請依本題 rubric 評估考生答案。只輸出 JSON，不要加 Markdown。
評分版本：${GRADING_VERSION}
維度與配分：${JSON.stringify(dimensionConfig)}

要求：
1. 每個失分點必須提供 student_evidence，引用或概括考生答案中的具體文字。
2. 涵攝 subsumption 是最高權重，需逐要件評估 coverage、accuracy、reasoning_quality。
3. 不要因篇幅長給高分；不要只因關鍵字出現給高分。
4. 各維度只給該維度分數，不要自行計算總分。
5. score 不可超過 max_score。

題目：
${question}

題目分析：
${JSON.stringify(analysis)}

考生答案：
${answer}
`.trim();
}

