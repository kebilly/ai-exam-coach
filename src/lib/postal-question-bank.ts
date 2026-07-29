import type { EnglishQuestion } from "@/types";

export type PostalLawQuestion = {
  rubric_id?: string;
  topic: string;
  difficulty: string;
  question: string;
  hint: string;
  reference_answer_outline: string[];
  grading_points: string[];
};

type LawSeed = {
  rubric_id?: string;
  topic: string;
  difficulty: string;
  scenarios: {
    question: string;
    hint: string;
    reference_answer_outline: string[];
    grading_points: string[];
  }[];
};

type EnglishSeed = {
  level: string;
  question_type: string;
  knowledge_point: string;
  difficulty: number;
  variants: Omit<EnglishQuestion, "level" | "question_type" | "knowledge_point" | "difficulty">[];
};

const lawSeeds: LawSeed[] = [
  {
    rubric_id: "civil_law_unjust_enrichment_179",
    topic: "不當得利",
    difficulty: "考古題同水準",
    scenarios: [
      {
        question: "甲至郵局臨櫃辦理轉帳，因誤填帳號，將新臺幣一萬元匯入乙之帳戶。乙知悉該款項非其所有，仍拒絕返還。甲得向乙主張何種權利？請附理由說明。",
        hint: "重點不是背條號，而是說明乙受有利益、甲受有損害、欠缺法律上原因及返還範圍。",
        reference_answer_outline: [
          "甲得依不當得利規定請求乙返還一萬元。",
          "乙帳戶增加一萬元，屬受有利益；甲財產減少，屬受有損害。",
          "該款項係誤匯，乙無法律上原因保有利益。",
          "乙知情後拒絕返還，可補充返還範圍或惡意受領效果。",
        ],
        grading_points: ["不當得利請求權", "受有利益", "他人受損害", "無法律上原因", "返還範圍"],
      },
      {
        question: "甲公司因系統錯誤，將同一筆貨款三萬元重複匯給乙商店。乙發現後仍表示該款項已入帳，不願返還。甲公司得否請求乙商店返還？請說明理由。",
        hint: "可用重複付款情境練習不當得利，不必拘泥是否精確寫出條號。",
        reference_answer_outline: [
          "甲公司得依不當得利規定請求乙返還重複收受之三萬元。",
          "乙多收一筆貨款而受有利益，甲公司則受有財產減少之損害。",
          "第二次付款欠缺法律上原因，乙不得保有。",
          "乙知悉後仍拒絕返還，返還義務更明確。",
        ],
        grading_points: ["重複付款", "受有利益", "財產減少", "欠缺法律上原因", "返還結論"],
      },
    ],
  },
  {
    rubric_id: "civil_law_tort_184",
    topic: "侵權行為",
    difficulty: "考古題同水準",
    scenarios: [
      {
        question: "甲為公司櫃檯人員，整理寄存物品時未依規定固定貨架，致貨架倒塌壓毀乙寄存之筆記型電腦。乙得否向甲請求損害賠償？請附理由說明。",
        hint: "請檢查權利侵害、過失、損害與因果關係。若未寫精確條號，但要件清楚，仍屬有效作答。",
        reference_answer_outline: [
          "乙得依侵權行為規定向甲請求損害賠償。",
          "筆記型電腦所有權受侵害，乙受有修復費或價值減損之損害。",
          "甲未依規定固定貨架，至少具有過失。",
          "貨架倒塌與電腦毀損間具因果關係。",
        ],
        grading_points: ["權利侵害", "過失", "損害", "因果關係", "損害賠償範圍"],
      },
      {
        question: "甲未查證即向多家金融機構通報乙偽造申請文件，事後證明該文件並非偽造，乙因此申辦信用卡及貸款均遭拒絕。乙得否向甲主張侵權行為損害賠償？",
        hint: "此題情境較接近考古題，重點在人格權、信用受損、過失與因果關係。",
        reference_answer_outline: [
          "乙可主張甲侵害其名譽或信用等人格法益，請求損害賠償。",
          "甲未查證即通報，可能構成過失。",
          "乙因錯誤通報而遭金融機構拒絕，須說明損害及因果關係。",
          "若能補充非財產上損害或信用損害，答案更完整。",
        ],
        grading_points: ["人格權或信用利益", "過失", "損害", "因果關係", "法律效果"],
      },
    ],
  },
  {
    topic: "負擔行為與處分行為",
    difficulty: "考古題同水準",
    scenarios: [
      {
        question: "甲將名家茶具一組借給乙展覽，乙謊稱為自己所有，將該茶具售予不知情之丙並交付。請說明乙、丙間買賣契約及所有權移轉行為之效力，並判斷甲得否向丙請求返還。",
        hint: "先區分負擔行為與處分行為，再處理無權處分、善意取得及所有物返還。",
        reference_answer_outline: [
          "買賣契約屬負擔行為，原則上不因乙無所有權而無效。",
          "所有權移轉屬處分行為，乙無處分權，須檢討善意取得。",
          "若丙善意且受讓動產占有，可能取得所有權。",
          "若丙已取得所有權，甲對丙返還請求無理由；甲可另向乙主張責任。",
        ],
        grading_points: ["負擔行為", "處分行為", "無權處分", "善意取得", "所有物返還請求"],
      },
    ],
  },
  {
    topic: "繼承分配",
    difficulty: "考古題同水準",
    scenarios: [
      {
        question: "甲已婚，配偶為乙，育有婚生子丙、丁。甲另與 A 女育有一子 B，並立遺囑將全部財產遺贈予 A。甲死亡後遺有存款一千萬元。乙、丙、丁、A、B 得否取得遺產？其範圍如何？",
        hint: "請先判斷繼承人資格，再處理遺贈及特留分。計算正確比背出條號更重要。",
        reference_answer_outline: [
          "乙為配偶，丙、丁及 B 為子女，原則上均為繼承人；A 非當然繼承人。",
          "遺贈予 A 原則有效，但不得侵害繼承人特留分。",
          "應先計算法定應繼分，再檢查特留分。",
          "若遺贈侵害特留分，繼承人得主張扣減。",
        ],
        grading_points: ["繼承人資格", "非婚生子女", "配偶與子女應繼分", "遺贈", "特留分"],
      },
    ],
  },
  {
    rubric_id: "civil_law_sale_defect",
    topic: "買賣瑕疵擔保",
    difficulty: "考古題同水準",
    scenarios: [
      {
        question: "甲向乙購買二手投影機一台，乙承諾可正常播放簡報，惟交付後發現無法開機。甲得向乙主張何種權利？請附理由說明。",
        hint: "請處理物之瑕疵、約定品質、解除或減少價金、損害賠償及不完全給付。",
        reference_answer_outline: [
          "投影機無法開機，欠缺約定品質及通常效用，屬物之瑕疵。",
          "甲得主張解除契約或減少價金，解除顯失公平時僅得減價。",
          "乙曾承諾可正常播放，可能構成品質保證並導出損害賠償。",
          "若乙可歸責，亦可檢討不完全給付。",
        ],
        grading_points: ["物之瑕疵", "約定品質", "解除或減少價金", "品質保證", "不完全給付"],
      },
    ],
  },
];

const englishSeeds: EnglishSeed[] = [
  {
    level: "postal-ii-to-i",
    question_type: "vocabulary",
    knowledge_point: "context vocabulary",
    difficulty: 3,
    variants: [
      {
        question: "Choose the best answer: The clerk looked _____ because he did not understand the new office rule.",
        options: ["confused", "delighted", "prepared", "ordinary"],
        correct_answer: "confused",
        explanation: "confused 表示「感到困惑、不了解」。題幹的 did not understand 是關鍵線索，所以應選 confused。",
      },
      {
        question: "Choose the best answer: The parking spaces near the entrance are reserved for the _____.",
        options: ["handicapped", "fascinated", "endangered", "twisted"],
        correct_answer: "handicapped",
        explanation: "reserved for the handicapped 是常見用法，表示「保留給身心障礙者使用」，通常用於無障礙停車位。",
      },
    ],
  },
  {
    level: "postal-ii-to-i",
    question_type: "dialogue",
    knowledge_point: "conversation completion",
    difficulty: 3,
    variants: [
      {
        question: "Choose the best response.\nA: Can you give me a hand tomorrow evening?\nB: Sure. What do you need?\nA: I have to attend my son's school performance.\nB: _____.",
        options: ["No problem. I can take your shift.", "It is too expensive.", "The weather is getting colder.", "I already mailed the letter."],
        correct_answer: "No problem. I can take your shift.",
        explanation: "對話中 A 因為要參加孩子的學校表演而請 B 幫忙，因此最合理的回應是願意代班：I can take your shift。",
      },
      {
        question: "Choose the best response.\nA: What time do you close on weekends?\nB: We close at 10 p.m. every day.\nA: _____.\nB: Yes, same hours as weekdays.",
        options: ["Are you open on Saturdays and Sundays?", "Can I borrow your umbrella?", "How long is the flight?", "Did you finish the report?"],
        correct_answer: "Are you open on Saturdays and Sundays?",
        explanation: "B 回答的是週末營業時間是否與平日相同，因此 A 的問題應該是在問週六、週日是否營業。",
      },
    ],
  },
  {
    level: "postal-i-to-operation",
    question_type: "reading",
    knowledge_point: "reading detail and inference",
    difficulty: 4,
    variants: [
      {
        question: "Read the passage and choose the best answer.\n\nMany companies now use video-based AI interviews to evaluate job applicants. Applicants answer questions on camera within a few minutes, and the system analyzes their communication skills, problem-solving ability, attitude, and professionalism. Supporters say this process saves time, but critics worry that applicants may not know how their scores are produced.\n\nWhat is one concern mentioned in the passage?",
        options: ["Applicants may not understand how the AI evaluates them.", "AI interviews always require face-to-face meetings.", "Companies cannot save time with AI interviews.", "Applicants no longer need to answer questions."],
        correct_answer: "Applicants may not understand how the AI evaluates them.",
        explanation: "文章最後一句提到，批評者擔心應徵者可能不知道 AI 分數如何產生，因此答案是應徵者不了解 AI 如何評估他們。",
      },
      {
        question: "Read the passage and choose the best answer.\n\nPeople who change jobs frequently are viewed differently across cultures. In some workplaces, job-hopping may suggest flexibility and ambition. In others, it may be considered a sign of disloyalty. Recently, services that help employees resign politely have become more common in countries where leaving a job can be socially difficult.\n\nWhat is the main idea of the passage?",
        options: ["Attitudes toward job-changing differ by culture.", "Employees should never change jobs.", "All companies encourage job-hopping.", "Resignation services are illegal everywhere."],
        correct_answer: "Attitudes toward job-changing differ by culture.",
        explanation: "本文主旨是在比較不同文化對頻繁換工作的看法，後面提到代辦離職服務只是用來補充說明文化差異。",
      },
    ],
  },
  {
    level: "postal-i-to-operation",
    question_type: "translation_zh_en",
    knowledge_point: "Chinese to English translation",
    difficulty: 4,
    variants: [
      {
        question: "Translate into English:\n隨著人工智慧逐漸應用於面試流程，企業可以更快速地篩選求職者。然而，求職者也擔心評分標準不夠透明，可能影響公平性。",
        options: [],
        correct_answer: "As artificial intelligence is gradually applied to the interview process, companies can screen job applicants more quickly. However, applicants are also concerned that the scoring standards may not be transparent enough and may affect fairness.",
        explanation: "翻譯時要保留三個重點：AI 被應用在面試流程、公司能更快篩選求職者，以及求職者擔心評分標準不夠透明並影響公平性。",
      },
    ],
  },
  {
    level: "postal-i-to-operation",
    question_type: "translation_en_zh",
    knowledge_point: "English to Chinese translation",
    difficulty: 4,
    variants: [
      {
        question: "Translate into Chinese:\nRemote work has changed the way many companies manage their employees. While it offers flexibility, it also requires clear communication and trust between managers and workers.",
        options: [],
        correct_answer: "遠距工作改變了許多公司管理員工的方式。雖然它提供彈性，但也需要主管與員工之間有清楚的溝通與信任。",
        explanation: "翻譯時要正確呈現 remote work（遠距工作）、flexibility（彈性）、clear communication（清楚溝通）與 trust（信任）這幾個核心概念。",
      },
    ],
  },
];

export function pickPostalLawQuestion(filters?: { topic?: string; difficulty?: string }) {
  const matched = lawSeeds.filter((seed) => {
    if (filters?.topic && filters.topic !== "all" && !seed.topic.includes(filters.topic)) return false;
    if (filters?.difficulty && filters.difficulty !== "all" && seed.difficulty !== filters.difficulty) return false;
    return true;
  });
  const seed = pick(matched.length ? matched : lawSeeds);
  const scenario = pick(seed.scenarios);
  return {
    rubric_id: seed.rubric_id,
    topic: seed.topic,
    difficulty: seed.difficulty,
    ...scenario,
  } satisfies PostalLawQuestion;
}

export function pickPostalEnglishQuestion(filters?: { level?: string; question_type?: string; topic?: string }) {
  const matched = englishSeeds.filter((seed) => {
    if (filters?.level && filters.level !== "all" && seed.level !== filters.level && !isLegacyLevelMatch(filters.level, seed.level)) return false;
    if (filters?.question_type && filters.question_type !== "random" && seed.question_type !== filters.question_type && !isLegacyTypeMatch(filters.question_type, seed.question_type)) return false;
    return true;
  });
  const seed = pick(matched.length ? matched : englishSeeds);
  const variant = pick(seed.variants);
  return {
    level: seed.level,
    question_type: seed.question_type,
    question: variant.question,
    options: variant.options,
    correct_answer: variant.correct_answer,
    explanation: variant.explanation,
    knowledge_point: seed.knowledge_point,
    difficulty: seed.difficulty,
  } satisfies EnglishQuestion;
}

function isLegacyLevelMatch(requested: string, seedLevel: string) {
  if (requested === "upper-intermediate") return seedLevel === "postal-i-to-operation";
  if (requested === "intermediate") return true;
  if (requested === "beginner") return seedLevel === "postal-ii-to-i";
  return false;
}

function isLegacyTypeMatch(requested: string, seedType: string) {
  if (requested === "grammar") return seedType === "dialogue" || seedType === "vocabulary";
  if (requested === "cloze") return seedType === "vocabulary" || seedType === "reading";
  return false;
}

function pick<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}
