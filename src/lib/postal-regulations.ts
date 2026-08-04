import { z } from "zod";

export const postalCareerLevels = [
  { value: "professional_2_to_1", label: "專業職（二）晉升專業職（一）" },
  { value: "professional_1_to_operations", label: "專業職（一）晉升營運職" },
] as const;

export const postalQuestionFormats = [
  { value: "single_choice", label: "單選題" },
  { value: "short_answer", label: "簡答題" },
  { value: "case_analysis", label: "情境題" },
  { value: "fill_blank", label: "填充題" },
] as const;

export const postalLawAreas = ["郵政法", "郵政儲金匯兌法", "簡易人壽保險法", "郵件處理規則", "郵務營業規章"] as const;

export type PostalCareerLevel = (typeof postalCareerLevels)[number]["value"];
export type PostalQuestionFormat = (typeof postalQuestionFormats)[number]["value"];
export type PostalLawArea = (typeof postalLawAreas)[number];

export type PostalRuleQuestion = {
  id?: string;
  career_level: PostalCareerLevel;
  question_format: PostalQuestionFormat;
  law_area: PostalLawArea;
  difficulty: 1 | 2 | 3;
  question: string;
  options: { A: string; B: string; C: string; D: string } | null;
  answer: string;
  explanation: string;
  source_articles: { law_name: PostalLawArea; article_no: string; note: string }[];
  tags: string[];
  source_type: "seed" | "ai_generated_pending_review" | "ai_generated_reviewed";
  review_status: "pending" | "approved" | "rejected" | "needs_edit";
};

export type PostalRulesExam = {
  kind: "postal_rules_exam";
  title: string;
  career_level: PostalCareerLevel;
  total_questions: number;
  total_points: number;
  items: (PostalRuleQuestion & { item_no: number; points: number })[];
};

export const postalRuleQuestionSchema = z.object({
  career_level: z.enum(["professional_2_to_1", "professional_1_to_operations"]),
  question_format: z.enum(["single_choice", "short_answer", "case_analysis", "fill_blank"]),
  law_area: z.enum(postalLawAreas),
  difficulty: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  question: z.string().min(8),
  options: z
    .object({
      A: z.string().min(1),
      B: z.string().min(1),
      C: z.string().min(1),
      D: z.string().min(1),
    })
    .nullable(),
  answer: z.string().min(1),
  explanation: z.string().min(8),
  source_articles: z
    .array(
      z.object({
        law_name: z.enum(postalLawAreas),
        article_no: z.string().min(1),
        note: z.string().min(1),
      }),
    )
    .min(1),
  tags: z.array(z.string()).default([]),
  source_type: z.enum(["seed", "ai_generated_pending_review", "ai_generated_reviewed"]).default("ai_generated_pending_review"),
  review_status: z.enum(["pending", "approved", "rejected", "needs_edit"]).default("pending"),
});

export const postalGeneratedQuestionsSchema = z.object({
  questions: z.array(postalRuleQuestionSchema).min(1).max(20),
});

export function validatePostalQuestion(question: PostalRuleQuestion) {
  const errors: string[] = [];
  if (question.question_format === "single_choice") {
    if (!question.options) errors.push("單選題必須提供 A-D 四個選項。");
    if (!["A", "B", "C", "D"].includes(question.answer.trim().toUpperCase())) errors.push("單選題答案必須為 A、B、C 或 D。");
    if (question.options) {
      const unique = new Set(Object.values(question.options).map((item) => item.trim()));
      if (unique.size < 4) errors.push("四個選項內容不得重複。");
    }
  }
  for (const source of question.source_articles) {
    if (!postalLawAreas.includes(source.law_name)) {
      errors.push(`來源法規不在允許範圍內：${source.law_name}`);
    }
  }
  return errors;
}

export const postalSourcePacks: Record<PostalLawArea, string[]> = {
  郵政法: [
    "出題範圍：郵政服務、郵件、郵政專營、郵件補償、郵政機關權限與相關罰則。",
    "出題提醒：避免虛構條號；若不確定條號，應以法規名稱與制度概念呈現，並標記需人工審核。",
  ],
  郵政儲金匯兌法: [
    "出題範圍：郵政儲金、匯兌、帳戶、利息、資料保密、交易限制與主管機關規範。",
    "出題提醒：題目應測驗法規理解，不要只考冷僻數字記憶。",
  ],
  簡易人壽保險法: [
    "出題範圍：簡易人壽保險契約、保險金、要保人、被保險人、受益人與除外責任。",
    "出題提醒：情境題應清楚交代身分、事故、請求內容與爭點。",
  ],
  郵件處理規則: [
    "出題範圍：郵件種類、收寄、投遞、退回、查詢、補償、禁寄與處理程序。",
    "出題提醒：選項應互斥，避免多個答案同時成立。",
  ],
  郵務營業規章: [
    "出題範圍：郵務營業項目、收寄限制、資費、服務流程、郵件處理與客戶申辦事項。",
    "出題提醒：題目可結合櫃台作業情境，但不得虛構未驗證的內部流程。",
  ],
};

export const seedPostalQuestions: PostalRuleQuestion[] = [
  {
    career_level: "professional_2_to_1",
    question_format: "single_choice",
    law_area: "郵政法",
    difficulty: 1,
    question: "依郵政法規範，下列何者最能說明郵政法中郵件服務制度的核心目的？",
    options: {
      A: "保障郵政服務公共性，並規範郵件收寄、遞送及相關責任",
      B: "只規範郵局員工的考績與升遷程序",
      C: "只規範私人快遞業者之公司登記程序",
      D: "只處理郵政機關辦公廳舍的財產管理",
    },
    answer: "A",
    explanation: "郵政法的重點在於郵政服務、郵件處理、權利義務與相關責任，不是人事或單純財產管理規範。",
    source_articles: [{ law_name: "郵政法", article_no: "總則與郵件服務相關規定", note: "需依最新版法規人工校對條號。" }],
    tags: ["郵政法", "制度目的"],
    source_type: "seed",
    review_status: "approved",
  },
  {
    career_level: "professional_2_to_1",
    question_format: "single_choice",
    law_area: "郵件處理規則",
    difficulty: 2,
    question: "郵件於投遞過程發生無法投交之情形時，下列處理方向何者較符合郵件處理規則的制度精神？",
    options: {
      A: "郵局得任意銷毀，無須留下任何處理紀錄",
      B: "應依郵件種類、收件資料與規定程序辦理改投、退回或其他處理",
      C: "一律交由投遞人自行決定是否保管",
      D: "一律視為收件人拋棄郵件所有權",
    },
    answer: "B",
    explanation: "無法投交郵件應依規定程序處理，不能任意銷毀或由個人自由決定。",
    source_articles: [{ law_name: "郵件處理規則", article_no: "投遞、改投、退回相關規定", note: "需依最新版法規人工校對條號。" }],
    tags: ["郵件處理", "投遞", "退回"],
    source_type: "seed",
    review_status: "approved",
  },
  {
    career_level: "professional_2_to_1",
    question_format: "single_choice",
    law_area: "郵政儲金匯兌法",
    difficulty: 2,
    question: "關於郵政儲金匯兌業務，下列敘述何者較符合郵政儲金匯兌法的規範重點？",
    options: {
      A: "郵政儲金匯兌業務完全不受任何法規限制",
      B: "其重點包含儲金、匯兌、帳戶管理及客戶資料保護等事項",
      C: "只規範郵票圖樣設計，不涉及金融性服務",
      D: "只規範郵件包裝方式",
    },
    answer: "B",
    explanation: "郵政儲金匯兌法主要規範郵政儲金與匯兌等金融性服務，以及相關管理與保護事項。",
    source_articles: [{ law_name: "郵政儲金匯兌法", article_no: "業務範圍與管理相關規定", note: "需依最新版法規人工校對條號。" }],
    tags: ["郵政儲金", "匯兌", "帳戶"],
    source_type: "seed",
    review_status: "approved",
  },
  {
    career_level: "professional_1_to_operations",
    question_format: "single_choice",
    law_area: "簡易人壽保險法",
    difficulty: 2,
    question: "關於簡易人壽保險法之出題方向，下列何者最適合作為情境題測驗重點？",
    options: {
      A: "要保人、被保險人、受益人身分與保險金請求關係",
      B: "郵局建築物樓層配置",
      C: "郵票收藏市場價格",
      D: "員工制服顏色",
    },
    answer: "A",
    explanation: "簡易人壽保險法常見考點包含保險契約當事人、受益人、保險事故與保險金請求。",
    source_articles: [{ law_name: "簡易人壽保險法", article_no: "保險契約與保險金相關規定", note: "需依最新版法規人工校對條號。" }],
    tags: ["簡易壽險", "保險金", "受益人"],
    source_type: "seed",
    review_status: "approved",
  },
  {
    career_level: "professional_1_to_operations",
    question_format: "single_choice",
    law_area: "郵務營業規章",
    difficulty: 1,
    question: "郵務營業規章題目若設計為櫃台作業情境，下列何者最重要？",
    options: {
      A: "情境應對應郵務營業規章的服務流程或限制，並提供可判斷的事實",
      B: "題目越長越好，即使與法規無關也可以",
      C: "不得出現任何郵務服務情境",
      D: "答案不需要解析",
    },
    answer: "A",
    explanation: "郵務營業規章題目可使用實務情境，但必須能對應法規依據與明確判斷點。",
    source_articles: [{ law_name: "郵務營業規章", article_no: "郵務營業服務流程相關規定", note: "需依最新版規章人工校對條號。" }],
    tags: ["郵務營業", "櫃台作業", "情境題"],
    source_type: "seed",
    review_status: "approved",
  },
];

export function buildPostalRulesPrompt(input: {
  careerLevel: PostalCareerLevel;
  questionFormat: PostalQuestionFormat;
  lawArea: PostalLawArea;
  count: number;
}) {
  const careerLabel = postalCareerLevels.find((item) => item.value === input.careerLevel)?.label ?? input.careerLevel;
  const formatLabel = postalQuestionFormats.find((item) => item.value === input.questionFormat)?.label ?? input.questionFormat;

  return [
    "你是郵局內升考試的郵政法規出題老師。請產生可人工審核的練習題，且只能輸出 JSON。",
    "重要限制：不得虛構精確條號、裁罰金額或法條文字。若題目需要精確條號，請在 source_articles.note 標記需人工校對。",
    "題目應模擬考試語氣，選項需互斥，解析需用繁體中文說明為何正確答案成立。",
    `職階：${careerLabel}`,
    `題型：${formatLabel}`,
    `法規類別：${input.lawArea}`,
    `題數：${input.count}`,
    `出題參考：${postalSourcePacks[input.lawArea].join(" ")}`,
    'JSON 格式：{ "questions": [ { "career_level", "question_format", "law_area", "difficulty", "question", "options", "answer", "explanation", "source_articles", "tags", "source_type", "review_status" } ] }',
    "single_choice 的 options 必須是 {A,B,C,D}，answer 必須是 A/B/C/D；非選擇題 options 請填 null。",
    "source_type 固定填 ai_generated_pending_review；review_status 固定填 pending。",
  ].join("\n");
}

export function buildPostalExam(questions: PostalRuleQuestion[], careerLevel: PostalCareerLevel): PostalRulesExam {
  const items = questions.map((item, index) => ({
    ...item,
    item_no: index + 1,
    points: Math.round(100 / Math.max(questions.length, 1)),
  }));
  return {
    kind: "postal_rules_exam",
    title: careerLevel === "professional_2_to_1" ? "郵政法規概要練習題" : "郵政法規練習題",
    career_level: careerLevel,
    total_questions: items.length,
    total_points: 100,
    items,
  };
}
