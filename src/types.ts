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
