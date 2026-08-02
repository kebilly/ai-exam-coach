import type { EnglishExam, EnglishExamItem, EnglishQuestion } from "@/types";

export type PostalLawQuestion = {
  rubric_id?: string;
  verified: boolean;
  category: LawCategory;
  category_label: string;
  topic: string;
  difficulty: string;
  question: string;
  hint: string;
  reference_answer_outline: string[];
  grading_points: string[];
};

type LawSeed = {
  rubric_id?: string;
  verified?: boolean;
  topic: string;
  difficulty: string;
  scenarios: {
    question: string;
    hint: string;
    reference_answer_outline: string[];
    grading_points: string[];
  }[];
};

export type LawCategory = "all" | "general" | "unjust_enrichment" | "tort" | "sale_defect" | "property" | "inheritance";

export const lawCategoryOptions: { value: LawCategory; label: string; description: string }[] = [
  { value: "all", label: "全部已驗證題型", description: "從目前穩定題型中隨機抽題。" },
  { value: "general", label: "民法總則與意思表示", description: "錯誤、撤銷、法律行為基礎題。" },
  { value: "unjust_enrichment", label: "債編：不當得利", description: "誤匯款、無法律上原因與返還範圍。" },
  { value: "tort", label: "債編：侵權行為", description: "184、195、財產權與人格法益侵害。" },
  { value: "sale_defect", label: "債編：買賣瑕疵", description: "354、359、360、227 與瑕疵擔保。" },
  { value: "property", label: "物權：交易安全", description: "物權變動、無權處分、善意取得與返還請求。" },
  { value: "inheritance", label: "繼承：應繼分與特留分", description: "先支援應繼分、特留分及扣減基礎題。" },
];

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
    ],
  },
  {
    rubric_id: "civil_law_tort_credit_reputation",
    topic: "侵權行為",
    difficulty: "考古題同水準",
    scenarios: [
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
    rubric_id: "civil_law_transfer_good_faith",
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

const supplementalLawSeeds: LawSeed[] = [
  {
    rubric_id: "civil_law_unjust_enrichment_179",
    topic: "不當得利",
    difficulty: "基礎實例題",
    scenarios: [
      lawScenario("甲誤將租金二萬元匯入乙帳戶，乙明知非其款項仍拒絕返還。甲得向乙主張何種權利？", "注意第179條要件與第182條惡意受領效果。"),
      lawScenario("銀行系統錯誤將甲存款轉入乙帳戶，乙知悉後提領使用。甲得否請求乙返還？", "處理受利益、他人受損害、無法律上原因與返還範圍。"),
      lawScenario("甲原欲匯款給丙，卻因帳號輸入錯誤匯入乙帳戶。乙表示已花用完畢而拒絕返還。甲得如何主張？", "先成立不當得利，再討論善意或惡意受領。"),
    ],
  },
  {
    rubric_id: "civil_law_tort_184",
    topic: "侵權行為",
    difficulty: "基礎實例題",
    scenarios: [
      lawScenario("甲騎車未注意前方，撞倒乙之機車並造成車體毀損。乙得向甲主張何種權利？", "以第184條第1項前段分析過失、權利侵害、損害與因果關係。"),
      lawScenario("甲搬運貨物時未固定妥當，貨物掉落砸壞乙之筆記型電腦。乙得否向甲請求賠償？", "重點在所有權侵害與損害賠償範圍。"),
      lawScenario("甲在辦公室走廊奔跑，撞倒乙並使乙眼鏡破裂。乙得向甲主張何種權利？", "先判斷過失，再連結財產損害與因果關係。"),
    ],
  },
  {
    rubric_id: "civil_law_tort_credit_reputation",
    topic: "侵權行為",
    difficulty: "進階實例題",
    scenarios: [
      lawScenario("甲未查證即向乙之任職公司通報乙侵占公款，事後證明並無其事，乙因此遭停職調查。乙得否向甲請求損害賠償？", "注意名譽、信用等人格法益與第195條。"),
      lawScenario("甲在未確認資料真偽前，向多家合作廠商稱乙有詐欺紀錄，導致乙交易機會受阻。乙得向甲主張何種權利？", "分析不實陳述、過失、人格法益侵害與財產損害。"),
    ],
  },
  {
    rubric_id: "civil_law_article_88_error_revocation",
    topic: "意思表示",
    difficulty: "基礎實例題",
    scenarios: [
      lawScenario("甲誤認古董花瓶為真品而以高價向乙購買，事後發現為仿品。甲得否撤銷意思表示？", "區分物之性質錯誤、動機錯誤與表意人過失。"),
      lawScenario("甲誤認土地可供建築而向乙購買，事後發現依法不得建築。甲得否依錯誤撤銷？", "判斷交易上重要性與錯誤是否可歸責於表意人。"),
      lawScenario("甲誤將報價單金額多打一個零並寄給乙，乙立即表示承諾。甲得否撤銷其意思表示？", "注意意思表示內容錯誤與表意人是否有過失。"),
      lawScenario("甲誤認畫作為某名家親筆而向乙購買，事後鑑定並非真跡。甲得否撤銷買賣意思表示？", "處理物之性質在交易上是否重要。"),
    ],
  },
  {
    rubric_id: "civil_law_sale_defect",
    topic: "買賣瑕疵擔保",
    difficulty: "基礎實例題",
    scenarios: [
      lawScenario("甲向乙購買二手相機，乙保證功能正常，交付後發現快門故障無法拍攝。甲得向乙主張何種權利？", "分析第354、359、360與不完全給付。"),
      lawScenario("甲向乙購買中古機車，乙承諾車況良好，交付後發現引擎重大故障。甲得如何主張？", "注意瑕疵、保證品質、解除或減價及損害賠償。"),
      lawScenario("甲向乙購買辦公用印表機，乙稱可正常列印，交付後發現無法連線使用。甲得否解除契約或請求減少價金？", "把約定品質與通常效用連結到個案事實。"),
    ],
  },
  {
    rubric_id: "civil_law_inheritance_basic",
    topic: "繼承",
    difficulty: "基礎實例題",
    scenarios: [
      lawScenario("甲死亡，遺有配偶乙及子女丙、丁，遺產共新臺幣120萬元。乙、丙、丁之應繼分各為多少？", "先確認配偶與子女均為繼承人，再計算應繼分比例與金額。"),
      lawScenario("甲死亡，遺有配偶乙及父母丙、丁，遺產共新臺幣90萬元。乙、丙、丁之應繼分如何計算？", "注意配偶與父母同為繼承時的比例，不要誤用子女均分規則。"),
      lawScenario("甲死亡，遺有配偶乙及子女丙、丁。甲以遺囑將全部遺產給乙，丙、丁得否主張特留分？", "先算丙、丁的應繼分，再以應繼分為基礎計算特留分。"),
      lawScenario("甲死亡，遺有子女乙、丙二人，遺產共新臺幣200萬元。甲生前以遺囑將全部遺產給乙，丙得否請求扣減？", "重點在丙的應繼分、特留分，以及遺囑是否侵害特留分。"),
      lawScenario("甲死亡，遺有配偶乙及子女丙一人，遺產共新臺幣100萬元。甲遺囑指定全部遺產由丙取得，乙得否主張權利？", "乙仍為繼承人，需計算應繼分及特留分是否受侵害。"),
    ],
  },
  {
    rubric_id: "civil_law_transfer_good_faith",
    topic: "物權與交易安全",
    difficulty: "基礎實例題",
    scenarios: [
      lawScenario("甲將名錶借給乙展示，乙謊稱為自己所有，將名錶售予不知情之丙並交付。甲得否向丙請求返還？", "區分買賣契約、所有權移轉、無權處分與善意取得。"),
      lawScenario("甲將畫作交乙保管，乙擅自出售並交付給善意之丙。乙、丙間買賣及所有權移轉效力如何？甲得否請求返還？", "注意負擔行為有效與動產善意取得。"),
      lawScenario("甲將古董相機借給乙使用，乙將其賣給不知情且已受交付之丙。甲是否仍得依第767條向丙請求返還？", "判斷丙是否因善意受讓取得所有權。"),
      lawScenario("甲委託乙展售雕像，但未授權乙出售。乙仍將雕像售予善意丙並交付。甲得否向丙取回雕像？", "處理乙是否有處分權與丙之善意取得。"),
      lawScenario("甲將小提琴借給乙演出，乙謊稱所有而出售給不知情之丙。請說明買賣契約與物權行為效力。", "分別評價債權行為與處分行為。"),
      lawScenario("甲所有筆電由乙占有，乙未經同意出售並交付給善意買受人丙。甲得否主張所有物返還請求權？", "注意丙是否有權占有。"),
      lawScenario("甲將茶具借乙陳列，乙擅自賣給善意丙並完成交付。甲得否向丙請求返還茶具？", "本題核心是無權處分與善意取得。"),
      lawScenario("甲將珠寶交乙拍照，乙出售給不知情之丙並交付。甲對丙得主張何種權利？", "若丙善意取得，甲對丙返還請求將受影響。"),
      lawScenario("甲將腳踏車借乙，乙將車賣給不知情丙並交付。請判斷丙是否取得所有權。", "動產交付與善意受讓是關鍵。"),
      lawScenario("甲將攝影器材交乙保管，乙以自己名義出售給善意丙。甲得否依所有權請求返還？", "先確認物權是否已移轉給丙。"),
      lawScenario("甲將手工藝品借乙參展，乙出售給善意第三人丙。乙、丙間契約效力及甲之返還請求如何？", "契約效力與所有權移轉要分開寫。"),
      lawScenario("甲所有之郵票收藏由乙占有，乙擅自售予不知情丙並交付。甲得否向丙請求返還？", "處理占有公信力與交易安全。"),
      lawScenario("甲將公仔收藏借乙展示，乙出售給善意丙。請問甲是否喪失所有權？", "善意取得成立時，原所有人返還請求通常不成立。"),
      lawScenario("甲將鑽戒交乙保管，乙謊稱為所有權人而出售並交付予善意丙。請判斷各法律行為效力。", "分清負擔行為、處分行為與善意取得。"),
      lawScenario("甲將陶瓷作品借給乙展覽，乙擅自賣給善意丙並交付。甲得否向丙主張第767條？", "若丙取得所有權，甲已非所有人。"),
      lawScenario("甲所有樂器由乙合法占有，乙無權出售給不知情丙並交付。丙是否受保護？", "合法占有來源會影響是否屬遺失物或盜贓物問題。"),
      lawScenario("甲將限量模型借乙拍賣展示，乙未經授權即售予善意丙。甲得否請求返還？", "注意非基於盜贓或遺失而脫離占有。"),
      lawScenario("甲將手錶交乙修理，乙將手錶售予不知情丙並交付。甲得否向丙取回？", "同時處理占有委託與善意受讓。"),
      lawScenario("甲將藝術品交乙保管，乙擅自讓售並交付給善意丙。請說明所有權歸屬與甲之救濟。", "甲對丙與對乙的救濟要區分。"),
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

export function pickPostalLawQuestion(filters?: { topic?: string; difficulty?: string; verifiedOnly?: boolean; category?: LawCategory }) {
  const lawSeedPool = getLawSeedPool();
  const matched = lawSeedPool.filter((seed) => {
    if (filters?.verifiedOnly !== false && !seed.rubric_id && !seed.verified) return false;
    if (filters?.category && filters.category !== "all" && getLawSeedCategory(seed) !== filters.category) return false;
    if (filters?.topic && filters.topic !== "all" && !seed.topic.includes(filters.topic)) return false;
    if (filters?.difficulty && filters.difficulty !== "all" && seed.difficulty !== filters.difficulty) return false;
    return true;
  });
  const fallbackSeeds = (filters?.verifiedOnly === false ? lawSeedPool : lawSeedPool.filter((seed) => seed.rubric_id || seed.verified)).filter((seed) => {
    if (filters?.category && filters.category !== "all") return getLawSeedCategory(seed) === filters.category;
    return true;
  });
  const seed = pick(matched.length ? matched : fallbackSeeds);
  const scenario = pick(seed.scenarios);
  const category = getLawSeedCategory(seed);
  return {
    rubric_id: seed.rubric_id,
    verified: Boolean(seed.rubric_id || seed.verified),
    category,
    category_label: lawCategoryOptions.find((item) => item.value === category)?.label ?? "未分類",
    topic: seed.topic,
    difficulty: seed.difficulty,
    ...scenario,
  } satisfies PostalLawQuestion;
}

export function getPostalLawCategoryStats() {
  const lawSeedPool = getLawSeedPool();
  return lawCategoryOptions.map((category) => ({
    ...category,
    verified_questions:
      category.value === "all"
        ? lawSeedPool.filter((seed) => seed.rubric_id || seed.verified).reduce((sum, seed) => sum + seed.scenarios.length, 0)
        : lawSeedPool
            .filter((seed) => (seed.rubric_id || seed.verified) && getLawSeedCategory(seed) === category.value)
            .reduce((sum, seed) => sum + seed.scenarios.length, 0),
    target_questions: category.value === "all" ? null : 20,
  }));
}

function getLawSeedPool() {
  return [...lawSeeds, ...supplementalLawSeeds];
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

export function buildPostalEnglishExam(level = "postal-ii-to-i") {
  const itemPool =
    level === "postal-i-to-operation"
      ? postalEnglishExamBank
      : [...postalEnglishExamBank.filter((item) => item.section !== "Translation"), ...postalEnglishNonTranslationSupplement];
  const items = itemPool.map((item, index) => ({
    ...item,
    item_no: index + 1,
    level,
    difficulty: item.difficulty,
  }));

  return {
    kind: "postal_english_exam",
    title: "郵局內升英文每日完整練習卷",
    level,
    question_type: "full_exam",
    total_questions: items.length,
    total_points: items.reduce((sum, item) => sum + item.points, 0),
    items,
  } satisfies EnglishExam;
}

function getLawSeedCategory(seed: LawSeed): LawCategory {
  if (seed.rubric_id === "civil_law_transfer_good_faith") return "property";
  if (seed.rubric_id?.startsWith("civil_law_inheritance")) return "inheritance";
  if (seed.rubric_id === "civil_law_article_88_error_revocation") return "general";
  if (seed.rubric_id === "civil_law_unjust_enrichment_179") return "unjust_enrichment";
  if (seed.rubric_id === "civil_law_tort_184" || seed.rubric_id === "civil_law_tort_credit_reputation") return "tort";
  if (seed.rubric_id === "civil_law_sale_defect") return "sale_defect";
  return "general";
}

function lawScenario(question: string, hint: string) {
  return {
    question,
    hint,
    reference_answer_outline: [
      "先點出主要請求權基礎或法律依據。",
      "分別拆解核心要件，避免只寫結論。",
      "將題目事實逐一涵攝到法律要件。",
      "最後明確回答當事人得否主張權利及法律效果。",
    ],
    grading_points: ["爭點辨識", "法律依據", "要件拆解", "具體涵攝", "結論與法律效果"],
  };
}

const postalEnglishExamBank: Omit<EnglishExamItem, "item_no" | "level">[] = [
  ...makeChoiceSection("Vocabulary", "vocabulary", [
    ["The new employee was asked to _____ the application form before Friday.", ["submit", "destroy", "ignore", "borrow"], "submit", "submit 表示提交；application form 是申請表。"],
    ["The post office will _____ customers when the package arrives.", ["notify", "avoid", "delay", "damage"], "notify", "notify 表示通知，符合包裹抵達後通知顧客。"],
    ["Please keep this document _____ because it contains personal information.", ["confidential", "ordinary", "crowded", "temporary"], "confidential", "confidential 表示機密的，常用於個資或內部文件。"],
    ["The manager asked the team to find a more _____ way to handle complaints.", ["efficient", "careless", "silent", "narrow"], "efficient", "efficient 表示有效率的，適合處理客訴流程。"],
    ["The customer requested a _____ because the item was damaged.", ["refund", "schedule", "license", "receipt"], "refund", "refund 是退款；商品受損時常請求退款。"],
    ["Employees must follow safety _____ when working in the warehouse.", ["procedures", "desserts", "opinions", "memories"], "procedures", "safety procedures 是安全程序。"],
    ["The applicant has _____ experience in customer service.", ["extensive", "empty", "minor", "distant"], "extensive", "extensive experience 表示豐富經驗。"],
    ["The bank refused the loan because the information was _____.", ["incomplete", "comfortable", "valuable", "friendly"], "incomplete", "incomplete 表示不完整，會影響貸款審核。"],
    ["The office introduced a new system to _____ repeated mistakes.", ["reduce", "admire", "translate", "decorate"], "reduce", "reduce repeated mistakes 表示降低重複錯誤。"],
    ["A polite response can help _____ customer trust.", ["maintain", "announce", "confuse", "rent"], "maintain", "maintain trust 表示維持信任。"],
  ]),
  ...makeChoiceSection("Grammar", "grammar", [
    ["If the customer _____ the receipt, we can process the refund.", ["brings", "bring", "brought", "bringing"], "brings", "If 條件句表示未來可能，if 子句用現在式。"],
    ["The report _____ by the supervisor yesterday.", ["was reviewed", "reviewed", "is reviewing", "has reviewing"], "was reviewed", "yesterday 表過去，報告被審查，用過去被動。"],
    ["Neither the manager nor the clerks _____ available now.", ["are", "is", "was", "be"], "are", "主詞靠近 clerks，動詞用複數 are。"],
    ["The package has not arrived _____.", ["yet", "already", "still", "ever"], "yet", "否定完成式常用 yet 表示尚未。"],
    ["Customers are advised _____ their passwords regularly.", ["to change", "change", "changing", "changed"], "to change", "be advised to V 表示被建議做某事。"],
    ["This is the form _____ you need to sign.", ["that", "who", "where", "when"], "that", "先行詞 form 是物，用 that/which。"],
    ["The office is responsible _____ handling personal data carefully.", ["for", "to", "with", "at"], "for", "be responsible for 是固定用法。"],
    ["She speaks English more clearly _____ her colleague.", ["than", "as", "to", "from"], "than", "比較級 more clearly 後接 than。"],
    ["The documents must _____ before the deadline.", ["be submitted", "submit", "submitted", "submitting"], "be submitted", "must + be + p.p. 表示必須被提交。"],
    ["I have worked here _____ 2021.", ["since", "for", "during", "by"], "since", "since 接時間起點。"],
  ]),
  ...makeChoiceSection("Dialogue", "dialogue", [
    ["A: Could you check whether my parcel has arrived?\nB: _____. May I have your tracking number?", ["Certainly", "Never mind", "I disagree", "It is expensive"], "Certainly", "對方請求協助，回答 Certainly 最自然。"],
    ["A: I am sorry for the delay.\nB: _____. I understand the system is busy today.", ["That's all right", "You must leave", "It has no address", "I bought it yesterday"], "That's all right", "That's all right 可用來回應道歉。"],
    ["A: Would you like me to print another copy?\nB: _____. That would be very helpful.", ["Yes, please", "No, it is raining", "I work tomorrow", "The office is closed"], "Yes, please", "That would be helpful 表示接受協助。"],
    ["A: The counter is closed for lunch.\nB: _____. When will it reopen?", ["I see", "I mailed it", "It is broken", "No address"], "I see", "I see 表示理解，後面詢問重新開放時間。"],
    ["A: I cannot log in to the system.\nB: _____. Let's reset your password first.", ["Don't worry", "It tastes good", "I missed the bus", "The stamp is blue"], "Don't worry", "協助處理登入問題，用 Don't worry 合理。"],
    ["A: Do I need to bring my ID card?\nB: _____. It is required for verification.", ["Yes, you do", "No, I wasn't", "It depends on the weather", "I prefer tea"], "Yes, you do", "It is required 表示需要攜帶證件。"],
  ]),
  ...makeChoiceSection("Cloze", "cloze", [
    ["Postal services are changing quickly. Many customers now prefer online tracking because it is fast and _____.", ["convenient", "dangerous", "private", "empty"], "convenient", "線上查詢快速且方便。"],
    ["When a package is delayed, staff should explain the reason clearly and offer _____.", ["assistance", "silence", "pollution", "furniture"], "assistance", "延誤時應說明並提供協助。"],
    ["Good communication can reduce complaints and improve customer _____.", ["satisfaction", "temperature", "distance", "accident"], "satisfaction", "customer satisfaction 是顧客滿意度。"],
    ["Before sending important documents, customers should make sure the address is _____.", ["correct", "heavy", "asleep", "ancient"], "correct", "寄送重要文件前應確認地址正確。"],
    ["If personal information is handled carelessly, it may create serious _____ risks.", ["privacy", "weather", "traffic", "kitchen"], "privacy", "個資處理不慎會產生隱私風險。"],
    ["A service counter should be both professional and _____.", ["friendly", "nervous", "illegal", "frozen"], "friendly", "服務櫃檯應專業且友善。"],
  ]),
  ...makeChoiceSection("Reading", "reading", [
    ["Read the passage and choose the best answer.\n\nA company introduced an online appointment system to reduce waiting time. Customers can choose a time slot before visiting the office. After three months, the number of complaints about long lines decreased.\n\nWhat was the purpose of the system?", ["To reduce waiting time", "To close the office", "To increase complaints", "To stop appointments"], "To reduce waiting time", "文章第一句指出導入系統是為了 reduce waiting time。"],
    ["Read the passage and choose the best answer.\n\nBecause many services require identity verification, employees must check documents carefully. A small mistake may delay an application or cause privacy concerns.\n\nWhat should employees do?", ["Check documents carefully", "Ignore identity documents", "Share passwords", "Delay every application"], "Check documents carefully", "文章直接說 employees must check documents carefully。"],
    ["Read the passage and choose the best answer.\n\nSome customers prefer self-service machines, while others still need help from staff. A good service design should provide both options so that different needs can be met.\n\nWhat is the main idea?", ["Services should meet different customer needs", "All staff should be removed", "Machines are always wrong", "Customers dislike options"], "Services should meet different customer needs", "文章重點是同時提供兩種選項以滿足不同需求。"],
    ["Read the passage and choose the best answer.\n\nTraining programs help new employees understand rules, service standards, and common problems. They also give employees a chance to practice before serving real customers.\n\nWhy are training programs useful?", ["They help employees prepare for real work", "They replace all managers", "They reduce salaries", "They close service counters"], "They help employees prepare for real work", "訓練讓員工理解規則並先練習。"],
  ]),
  ...makeTextSection("Translation", "translation_en_zh", [
    ["Translate into Chinese:\nCustomers should be informed as soon as possible if their package is delayed.", "如果顧客的包裹延誤，應儘快通知顧客。", "重點是 as soon as possible 表示儘快，package is delayed 表示包裹延誤。"],
    ["Translate into Chinese:\nEmployees must protect personal information and avoid sharing it without permission.", "員工必須保護個人資料，並避免未經許可分享。", "protect personal information 是保護個資；without permission 是未經許可。"],
    ["Translate into English:\n主管要求員工在下班前完成報告。", "The supervisor asked the employees to finish the report before leaving work.", "要求某人做某事可用 ask someone to do something。"],
    ["Translate into English:\n這項新制度可以減少等待時間並提升服務品質。", "This new system can reduce waiting time and improve service quality.", "reduce waiting time 與 improve service quality 是常見搭配。"],
  ]),
];

const postalEnglishNonTranslationSupplement: Omit<EnglishExamItem, "item_no" | "level">[] = [
  ...makeChoiceSection("Vocabulary", "vocabulary", [
    ["The company will _____ the new policy next month.", ["implement", "forget", "borrow", "cancel"], "implement", "implement 表示實施政策。"],
    ["Please attach a copy of your ID for _____.", ["verification", "vacation", "decoration", "invitation"], "verification", "verification 表示驗證、核對身分。"],
  ]),
  ...makeChoiceSection("Reading", "reading", [
    ["Read the passage and choose the best answer.\n\nMany public offices encourage people to use online services for simple applications. However, staff members are still needed when cases are complicated or documents are incomplete.\n\nWhen are staff members still needed?", ["When cases are complicated", "When all offices close", "When no documents exist", "When applications are simple"], "When cases are complicated", "文章指出案件複雜或文件不完整時仍需要人員協助。"],
    ["Read the passage and choose the best answer.\n\nClear instructions help customers prepare the correct documents before they visit a service counter. This can save time for both customers and employees.\n\nWhat is one benefit of clear instructions?", ["They save time", "They remove all rules", "They make documents unnecessary", "They stop customer service"], "They save time", "文章最後一句說明清楚指示可以節省雙方時間。"],
  ]),
];

function makeChoiceSection(section: string, questionType: string, rows: [string, string[], string, string][]) {
  return rows.map(([question, options, correct_answer, explanation]) => ({
    section,
    question_type: questionType,
    question,
    options,
    correct_answer,
    explanation,
    knowledge_point: section.toLowerCase(),
    difficulty: 3,
    answer_type: "choice" as const,
    points: 1,
  }));
}

function makeTextSection(section: string, questionType: string, rows: [string, string, string][]) {
  return rows.map(([question, correct_answer, explanation]) => ({
    section,
    question_type: questionType,
    question,
    options: [],
    correct_answer,
    explanation,
    knowledge_point: section.toLowerCase(),
    difficulty: 4,
    answer_type: "text" as const,
    points: 1,
  }));
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
