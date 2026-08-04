export type LawFeedback = {
  score: number;
  issue_score: number;
  legal_basis_score: number;
  argument_score: number;
  conclusion_score: number;
  strengths: string[];
  weaknesses: string[];
  missing_points: string[];
  revision_advice: string;
  model_answer_outline: string;
  next_practice_focus: string[];
  confidence: "low" | "medium" | "high";
  terminology_suggestions?: {
    original_text: string;
    suggested_revision: string;
    reason: string;
  }[];
  bonus_points?: {
    topic: string;
    suggestion: string;
    estimated_points: string;
    reason: string;
  }[];
  grading_radar?: {
    label: string;
    stars: number;
    max_stars: 5;
  }[];
  score_breakdown?: {
    label: string;
    type: "credit" | "deduction";
    points: number;
    reason: string;
    evidence?: string;
  }[];
  feedback_items?: {
    student_evidence: string;
    issue_or_element: string;
    feedback_type: "missing" | "partial" | "complete" | "incorrect";
    analysis: string;
    suggested_revision: string;
  }[];
};

export type EnglishQuestion = {
  level: string;
  question_type: string;
  question: string;
  options: string[];
  correct_answer: string;
  explanation: string;
  knowledge_point: string;
  difficulty: number;
};

export type EnglishExamItem = EnglishQuestion & {
  item_no: number;
  section: string;
  answer_type: "choice" | "text";
  points: number;
};

export type EnglishExam = {
  kind: "postal_english_exam";
  title: string;
  level: string;
  question_type: "full_exam";
  total_questions: number;
  total_points: number;
  items: EnglishExamItem[];
};

export type PostalRuleQuestion = {
  id?: string;
  career_level: "professional_2_to_1" | "professional_1_to_operations";
  question_format: "single_choice" | "short_answer" | "case_analysis" | "fill_blank";
  law_area: "郵政法" | "郵政儲金匯兌法" | "簡易人壽保險法" | "郵件處理規則" | "郵務營業規章";
  difficulty: 1 | 2 | 3;
  question: string;
  options: { A: string; B: string; C: string; D: string } | null;
  answer: string;
  explanation: string;
  source_articles: { law_name: string; article_no: string; note: string }[];
  tags: string[];
  source_type: "seed" | "ai_generated_pending_review" | "ai_generated_reviewed";
  review_status: "pending" | "approved" | "rejected" | "needs_edit";
};

export type PostalRulesExam = {
  kind: "postal_rules_exam";
  title: string;
  career_level: PostalRuleQuestion["career_level"];
  total_questions: number;
  total_points: number;
  items: (PostalRuleQuestion & { item_no: number; points: number })[];
};
