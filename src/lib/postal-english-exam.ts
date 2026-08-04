import type { EnglishExam, EnglishExamItem } from "@/types";

type ExamLevel = "postal-ii-to-i" | "postal-i-to-operation";
type BankItem = Omit<EnglishExamItem, "item_no" | "level">;

const levelLabels: Record<ExamLevel, string> = {
  "postal-ii-to-i": "專業職（二）晉升專業職（一）",
  "postal-i-to-operation": "專業職（一）晉升營運職",
};

export function buildPostalEnglishExam(levelInput = "postal-ii-to-i") {
  const level: ExamLevel = levelInput === "postal-i-to-operation" ? "postal-i-to-operation" : "postal-ii-to-i";
  const blueprint =
    level === "postal-i-to-operation"
      ? [
          pickSection("Vocabulary", operationVocabulary, 10),
          pickSection("Grammar", operationGrammar, 10),
          pickSection("Cloze", operationCloze, 6),
          pickSection("Reading", operationReading, 8),
          pickSection("Translation", operationTranslation, 6),
        ]
      : [
          pickSection("Vocabulary", professionalVocabulary, 12),
          pickSection("Grammar", professionalGrammar, 12),
          pickSection("Cloze", professionalCloze, 6),
          pickSection("Reading", professionalReading, 10),
        ];

  const items = blueprint
    .flat()
    .map((item, index) => ({
      ...shuffleEnglishChoiceOptions(item),
      item_no: index + 1,
      level,
    }));

  return {
    kind: "postal_english_exam",
    title: `${levelLabels[level]}英文完整練習卷`,
    level,
    question_type: "full_exam",
    total_questions: items.length,
    total_points: items.reduce((sum, item) => sum + item.points, 0),
    items,
  } satisfies EnglishExam;
}

function choice(section: string, questionType: string, question: string, options: string[], correctAnswer: string, explanation: string, difficulty = 3): BankItem {
  return {
    section,
    question_type: questionType,
    question,
    options,
    correct_answer: correctAnswer,
    explanation,
    knowledge_point: section.toLowerCase(),
    difficulty,
    answer_type: "choice",
    points: 1,
  };
}

function text(section: string, questionType: string, question: string, correctAnswer: string, explanation: string, difficulty = 4): BankItem {
  return {
    section,
    question_type: questionType,
    question,
    options: [],
    correct_answer: correctAnswer,
    explanation,
    knowledge_point: section.toLowerCase(),
    difficulty,
    answer_type: "text",
    points: 1,
  };
}

function pickSection(section: string, bank: BankItem[], count: number) {
  return shuffle(bank).slice(0, count).map((item) => ({ ...item, section }));
}

function shuffle<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

function shuffleEnglishChoiceOptions(item: BankItem): BankItem {
  if (item.answer_type !== "choice" || item.options.length < 2) return item;
  return {
    ...item,
    options: shuffle(item.options),
  };
}

const professionalVocabulary = [
  choice("Vocabulary", "vocabulary", "The clerk asked the customer to _____ the form before submitting it.", ["complete", "remove", "delay", "borrow"], "complete", "complete the form 表示填妥表格。"),
  choice("Vocabulary", "vocabulary", "The package was returned because the address was _____.", ["incorrect", "patient", "fluent", "ordinary"], "incorrect", "地址錯誤應用 incorrect。"),
  choice("Vocabulary", "vocabulary", "Please keep the receipt as _____ of payment.", ["proof", "advice", "traffic", "weather"], "proof", "proof of payment 表示付款證明。"),
  choice("Vocabulary", "vocabulary", "The new system is designed to _____ waiting time.", ["reduce", "replace", "borrow", "decorate"], "reduce", "reduce waiting time 表示減少等待時間。"),
  choice("Vocabulary", "vocabulary", "Customers may _____ the delivery status online.", ["check", "refuse", "damage", "translate"], "check", "check the status 表示查詢狀態。"),
  choice("Vocabulary", "vocabulary", "The office will _____ applicants by email.", ["notify", "ignore", "repair", "divide"], "notify", "notify someone by email 表示以電子郵件通知。"),
  choice("Vocabulary", "vocabulary", "This service is available during regular business _____.", ["hours", "mistakes", "prices", "habits"], "hours", "business hours 是營業時間。"),
  choice("Vocabulary", "vocabulary", "The document contains _____ information and should be handled carefully.", ["personal", "empty", "noisy", "foreign"], "personal", "personal information 是個人資料。"),
  choice("Vocabulary", "vocabulary", "A polite explanation can reduce customer _____.", ["complaints", "machines", "holidays", "envelopes"], "complaints", "customer complaints 是顧客抱怨。"),
  choice("Vocabulary", "vocabulary", "The employee followed the standard _____.", ["procedure", "dessert", "memory", "license"], "procedure", "standard procedure 是標準程序。"),
  choice("Vocabulary", "vocabulary", "The office has improved its service _____.", ["quality", "height", "color", "noise"], "quality", "service quality 是服務品質。"),
  choice("Vocabulary", "vocabulary", "Applicants must provide _____ documents.", ["valid", "sleepy", "heavy", "ancient"], "valid", "valid documents 是有效文件。"),
  choice("Vocabulary", "vocabulary", "The customer asked for a _____ after the item was damaged.", ["refund", "salary", "signal", "lesson"], "refund", "refund 是退款。"),
  choice("Vocabulary", "vocabulary", "The notice was posted in a _____ place.", ["visible", "private", "careless", "distant"], "visible", "visible place 是明顯可見的位置。"),
];

const professionalGrammar = [
  choice("Grammar", "grammar", "If the customer _____ the receipt, we can process the request.", ["brings", "bring", "brought", "bringing"], "brings", "if 條件句表示未來可能，主要子句用 can，if 子句用現在式。"),
  choice("Grammar", "grammar", "The report _____ by the supervisor yesterday.", ["was reviewed", "reviewed", "is reviewing", "has reviewing"], "was reviewed", "yesterday 搭配過去式，被動語態為 was reviewed。"),
  choice("Grammar", "grammar", "Neither the manager nor the clerks _____ available now.", ["are", "is", "was", "be"], "are", "neither...nor 就近一致，靠近動詞的是 clerks。"),
  choice("Grammar", "grammar", "Customers are advised _____ their passwords regularly.", ["to change", "change", "changing", "changed"], "to change", "be advised to V 是被建議做某事。"),
  choice("Grammar", "grammar", "This is the document _____ you need to sign.", ["that", "who", "where", "when"], "that", "先行詞 document 是物，用 that/which。"),
  choice("Grammar", "grammar", "The office is responsible _____ handling personal data.", ["for", "to", "with", "at"], "for", "be responsible for 是固定用法。"),
  choice("Grammar", "grammar", "The documents must _____ before Friday.", ["be submitted", "submit", "submitted", "submitting"], "be submitted", "文件被提交，用 must be p.p.。"),
  choice("Grammar", "grammar", "She has worked at the branch _____ 2021.", ["since", "for", "during", "by"], "since", "since 接時間起點。"),
  choice("Grammar", "grammar", "The form should be filled out _____ ink.", ["in", "on", "at", "by"], "in", "write/fill out in ink 表示用墨水書寫。"),
  choice("Grammar", "grammar", "Please let us know _____ you need further assistance.", ["if", "although", "unless", "because of"], "if", "if 表示是否。"),
  choice("Grammar", "grammar", "The parcel arrived later _____ expected.", ["than", "as", "to", "from"], "than", "later than expected 表示比預期晚。"),
  choice("Grammar", "grammar", "The counter opens at nine, _____ it may close earlier on holidays.", ["but", "so", "because", "nor"], "but", "前後語意轉折，用 but。"),
  choice("Grammar", "grammar", "Only authorized employees _____ access this database.", ["may", "must to", "are", "have"], "may", "may access 表示可以存取。"),
  choice("Grammar", "grammar", "The customer requested that the address _____ corrected immediately.", ["be", "is", "was", "being"], "be", "request that + S + 原形動詞，正式用法。", 4),
];

const professionalCloze = [
  choice("Cloze", "cloze", "Clear instructions help customers prepare the correct documents before they visit a service _____.", ["counter", "garden", "kitchen", "stationery"], "counter", "service counter 是服務櫃台。"),
  choice("Cloze", "cloze", "When a package is delayed, staff should explain the reason clearly and offer _____.", ["assistance", "silence", "pollution", "furniture"], "assistance", "offer assistance 表示提供協助。"),
  choice("Cloze", "cloze", "Good communication can reduce complaints and improve customer _____.", ["satisfaction", "temperature", "distance", "accident"], "satisfaction", "customer satisfaction 是顧客滿意度。"),
  choice("Cloze", "cloze", "Before sending important documents, customers should make sure the address is _____.", ["correct", "heavy", "asleep", "ancient"], "correct", "地址要正確。"),
  choice("Cloze", "cloze", "If personal information is handled carelessly, it may create serious _____ risks.", ["privacy", "weather", "traffic", "kitchen"], "privacy", "privacy risks 是隱私風險。"),
  choice("Cloze", "cloze", "A service counter should be both professional and _____.", ["friendly", "nervous", "illegal", "frozen"], "friendly", "服務櫃台應專業且友善。"),
  choice("Cloze", "cloze", "Online applications can save time, but users must still enter their information _____.", ["accurately", "randomly", "angrily", "silently"], "accurately", "資料須正確輸入。"),
  choice("Cloze", "cloze", "Employees should report system errors as soon as they are _____.", ["discovered", "invited", "painted", "borrowed"], "discovered", "錯誤被發現用 discovered。"),
];

const professionalReading = [
  choice("Reading", "reading", "Read the passage and choose the best answer.\n\nA post office introduced an online appointment system to reduce waiting time. Customers can choose a time slot before visiting the branch. After three months, complaints about long lines decreased.\n\nWhat was the main purpose of the system?", ["To reduce waiting time", "To close the branch", "To increase complaints", "To stop all appointments"], "To reduce waiting time", "文章第一句指出目的為 reduce waiting time。"),
  choice("Reading", "reading", "Read the passage and choose the best answer.\n\nBecause many services require identity verification, employees must check documents carefully. A small mistake may delay an application or cause privacy concerns.\n\nWhat should employees do?", ["Check documents carefully", "Ignore identity documents", "Share passwords", "Delay every application"], "Check documents carefully", "文章明確說 employees must check documents carefully。"),
  choice("Reading", "reading", "Read the passage and choose the best answer.\n\nSome customers prefer self-service machines, while others still need help from staff. A good service design should provide both options so that different needs can be met.\n\nWhat is the main idea?", ["Services should meet different customer needs", "All staff should be removed", "Machines are always wrong", "Customers dislike options"], "Services should meet different customer needs", "重點是不同顧客有不同需求。"),
  choice("Reading", "reading", "Read the passage and choose the best answer.\n\nTraining programs help new employees understand rules, service standards, and common problems. They also give employees a chance to practice before serving real customers.\n\nWhy are training programs useful?", ["They help employees prepare for real work", "They replace all managers", "They reduce salaries", "They close service counters"], "They help employees prepare for real work", "training programs 讓員工在服務真實顧客前先練習。"),
  choice("Reading", "reading", "Read the passage and choose the best answer.\n\nA customer forgot to bring an ID card and could not complete the application. The clerk explained the requirement and suggested that the customer return with the necessary document.\n\nWhy could the customer not complete the application?", ["The customer did not bring an ID card", "The clerk lost the application", "The office was closed", "The document was already approved"], "The customer did not bring an ID card", "原因是 forgot to bring an ID card。"),
  choice("Reading", "reading", "Read the passage and choose the best answer.\n\nTo prevent mistakes, the branch manager asked employees to confirm account numbers twice before processing transfers. This simple step reduced incorrect transactions.\n\nWhat did the manager ask employees to do?", ["Confirm account numbers twice", "Stop all transfers", "Work without records", "Close customer accounts"], "Confirm account numbers twice", "文章說 confirm account numbers twice。"),
  choice("Reading", "reading", "Read the passage and choose the best answer.\n\nA new notice explains which items cannot be mailed. It also reminds customers to ask staff before sending liquids, batteries, or fragile goods.\n\nWhat is the notice mainly about?", ["Mailing restrictions", "Job interviews", "Holiday schedules", "Bank interest rates"], "Mailing restrictions", "內容談不能郵寄或需詢問的物品。"),
  choice("Reading", "reading", "Read the passage and choose the best answer.\n\nThe office improved its ticketing system so that customers could see the estimated waiting time. Many customers felt less anxious because they knew when they would be served.\n\nWhy did customers feel less anxious?", ["They could see the estimated waiting time", "They received free gifts", "They did not need documents", "They avoided all rules"], "They could see the estimated waiting time", "知道預估等待時間可降低焦慮。"),
  choice("Reading", "reading", "Read the passage and choose the best answer.\n\nWhen handling personal information, employees should collect only necessary data and avoid discussing customer details in public areas.\n\nWhat is the passage about?", ["Protecting personal information", "Choosing office furniture", "Increasing postage rates", "Planning a company trip"], "Protecting personal information", "collect only necessary data 與 avoid discussing details 都是個資保護。"),
  choice("Reading", "reading", "Read the passage and choose the best answer.\n\nA service survey showed that customers valued clear explanations more than speed alone. They wanted staff to explain fees, deadlines, and required documents in simple language.\n\nWhat did customers value most?", ["Clear explanations", "Longer waiting lines", "Complicated language", "Higher fees"], "Clear explanations", "文章說 valued clear explanations more than speed alone。"),
  choice("Reading", "reading", "Read the passage and choose the best answer.\n\nA branch office noticed that many forms were returned because of missing signatures. It added a checklist near the counter, and the number of returned forms dropped.\n\nWhat problem did the checklist help solve?", ["Missing signatures", "Broken computers", "Late trains", "High temperatures"], "Missing signatures", "forms were returned because of missing signatures。"),
];

const operationVocabulary = [
  choice("Vocabulary", "vocabulary", "The agency must _____ the new regulation before the end of the year.", ["implement", "hesitate", "decorate", "interrupt"], "implement", "implement a regulation 表示實施規定。", 4),
  choice("Vocabulary", "vocabulary", "The applicant's explanation was _____ with the documents submitted.", ["consistent", "generous", "portable", "temporary"], "consistent", "consistent with 表示與某事一致。", 4),
  choice("Vocabulary", "vocabulary", "The supervisor asked for a _____ review of the complaint.", ["thorough", "casual", "distant", "fragile"], "thorough", "thorough review 表示完整審查。", 4),
  choice("Vocabulary", "vocabulary", "The committee decided to _____ the proposal until more data was available.", ["postpone", "replace", "admire", "deliver"], "postpone", "postpone 表示延後。", 4),
  choice("Vocabulary", "vocabulary", "Employees should avoid making _____ assumptions about customer needs.", ["unsupported", "visible", "annual", "domestic"], "unsupported", "unsupported assumptions 是未經支持的假設。", 4),
  choice("Vocabulary", "vocabulary", "The system stores transaction records for audit and _____.", ["accountability", "entertainment", "decoration", "transportation"], "accountability", "accountability 表示課責、可追蹤責任。", 4),
  choice("Vocabulary", "vocabulary", "The office issued a notice to _____ confusion about the new procedure.", ["clarify", "multiply", "withdraw", "estimate"], "clarify", "clarify confusion 表示釐清混淆。", 4),
  choice("Vocabulary", "vocabulary", "The regulation applies to both domestic and international _____.", ["shipments", "interviews", "salaries", "meetings"], "shipments", "shipments 指寄送件、貨件。"),
  choice("Vocabulary", "vocabulary", "The delay was caused by an _____ in the address database.", ["error", "award", "income", "option"], "error", "database error 是資料庫錯誤。"),
  choice("Vocabulary", "vocabulary", "The applicant must _____ that all information is accurate.", ["confirm", "pretend", "predict", "refuse"], "confirm", "confirm 表示確認。"),
  choice("Vocabulary", "vocabulary", "The new policy aims to _____ service standards across all branches.", ["standardize", "damage", "translate", "forgive"], "standardize", "standardize standards 表示使標準一致。", 4),
  choice("Vocabulary", "vocabulary", "The customer filed a complaint regarding the _____ of personal data.", ["disclosure", "celebration", "extension", "delivery"], "disclosure", "disclosure of personal data 是個資揭露。", 4),
];

const operationGrammar = [
  choice("Grammar", "grammar", "Had the applicant submitted the document earlier, the case _____ processed on time.", ["would have been", "will be", "is being", "has"], "would have been", "過去假設語氣倒裝：Had + S + p.p., S would have been p.p.。", 5),
  choice("Grammar", "grammar", "The revised guidelines, together with the new checklist, _____ effective next Monday.", ["take", "takes", "taking", "to take"], "take", "主詞是 guidelines 複數，together with 不影響主詞單複數。", 4),
  choice("Grammar", "grammar", "The manager insisted that every complaint _____ documented properly.", ["be", "is", "was", "being"], "be", "insist that + S + 原形動詞，正式用法。", 4),
  choice("Grammar", "grammar", "No sooner had the system been restored _____ customers began submitting applications.", ["than", "when", "then", "as"], "than", "No sooner...than 是固定句型。", 5),
  choice("Grammar", "grammar", "The documents are confidential and should not be disclosed _____ authorized.", ["unless", "despite", "because", "whereas"], "unless", "unless authorized 表示除非獲授權。", 4),
  choice("Grammar", "grammar", "The branch received more applications this month than it _____ last month.", ["did", "was", "has been", "does"], "did", "did 代替 received，避免重複。", 4),
  choice("Grammar", "grammar", "The policy was introduced _____ employees could respond to complaints more consistently.", ["so that", "even though", "as if", "unless"], "so that", "so that 表目的。"),
  choice("Grammar", "grammar", "Applicants whose documents are incomplete _____ to submit additional proof.", ["are required", "requires", "requiring", "has required"], "are required", "Applicants 被要求，複數被動。"),
  choice("Grammar", "grammar", "The more clearly the rules are explained, _____ mistakes customers are likely to make.", ["the fewer", "the less", "fewer", "less"], "the fewer", "the more..., the fewer... 比較句型。", 4),
  choice("Grammar", "grammar", "All records must be kept in a secure location, _____ they contain personal information.", ["especially when", "therefore", "instead of", "in case of"], "especially when", "especially when 表尤其在某情況下。"),
  choice("Grammar", "grammar", "The officer asked whether the customer _____ the notice before signing the form.", ["had read", "has read", "will read", "reads"], "had read", "主句過去式 asked，且閱讀在簽署前，用過去完成式。", 4),
  choice("Grammar", "grammar", "It is essential that each transaction _____ recorded accurately.", ["be", "is", "was", "being"], "be", "It is essential that + S + 原形動詞。", 4),
];

const operationCloze = [
  choice("Cloze", "cloze", "A complaint-handling system should not only record cases but also identify repeated problems and suggest _____ actions.", ["corrective", "decorative", "expensive", "silent"], "corrective", "corrective actions 是改正措施。", 4),
  choice("Cloze", "cloze", "When regulations are updated, employees need training to ensure _____ application across branches.", ["consistent", "careless", "temporary", "private"], "consistent", "consistent application 是一致適用。", 4),
  choice("Cloze", "cloze", "Because financial transactions involve sensitive data, access should be limited to _____ personnel.", ["authorized", "curious", "ordinary", "unknown"], "authorized", "authorized personnel 是授權人員。"),
  choice("Cloze", "cloze", "The office revised the form after discovering that several questions were _____.", ["ambiguous", "generous", "domestic", "visible"], "ambiguous", "ambiguous 表示模糊不清。", 4),
  choice("Cloze", "cloze", "A risk-based approach helps managers decide which cases require _____ review.", ["additional", "musical", "informal", "annual"], "additional", "additional review 是額外審查。"),
  choice("Cloze", "cloze", "Public services should be accessible, but they must also protect data and maintain _____.", ["security", "fashion", "weather", "tourism"], "security", "protect data and maintain security 語意連貫。"),
  choice("Cloze", "cloze", "If a customer disputes a transaction, staff should examine the records before reaching a _____.", ["conclusion", "discount", "holiday", "package"], "conclusion", "reach a conclusion 是作出結論。"),
  choice("Cloze", "cloze", "The new workflow reduced delays by removing _____ steps.", ["unnecessary", "dangerous", "personal", "grateful"], "unnecessary", "remove unnecessary steps 是移除不必要步驟。"),
];

const operationReading = [
  choice("Reading", "reading", "Read the passage and choose the best answer.\n\nA branch office noticed that complaint records were stored in different formats. As a result, managers could not easily compare cases or identify repeated problems. The office introduced a standard template and required staff to classify each complaint by type.\n\nWhat problem did the new template address?", ["Inconsistent complaint records", "A lack of office furniture", "Too many holidays", "A shortage of stamps"], "Inconsistent complaint records", "文章說紀錄格式不同，導致無法比較案件。", 4),
  choice("Reading", "reading", "Read the passage and choose the best answer.\n\nWhen a customer requests a financial service, the employee must verify identity, explain key terms, and keep a record of the transaction. These steps may take time, but they help prevent fraud and protect both the customer and the institution.\n\nWhy are these steps necessary?", ["To prevent fraud and protect both sides", "To make every service slower", "To avoid keeping records", "To discourage all customers"], "To prevent fraud and protect both sides", "最後一句直接說明目的。", 4),
  choice("Reading", "reading", "Read the passage and choose the best answer.\n\nA new digital system allowed customers to upload documents before visiting the counter. Staff could review the documents in advance and notify customers if anything was missing. This reduced unnecessary visits and improved service efficiency.\n\nWhat was one benefit of the system?", ["It reduced unnecessary visits", "It eliminated all staff", "It removed identity checks", "It made documents optional"], "It reduced unnecessary visits", "文章說 reduced unnecessary visits。"),
  choice("Reading", "reading", "Read the passage and choose the best answer.\n\nThe manager reminded employees that speed should not be the only goal. In services involving personal data or money, accuracy and accountability are equally important.\n\nWhat is the manager's main point?", ["Accuracy and accountability also matter", "Speed is always the only goal", "Employees should avoid all records", "Personal data is never important"], "Accuracy and accountability also matter", "主旨是速度之外，正確性與可課責性也重要。", 4),
  choice("Reading", "reading", "Read the passage and choose the best answer.\n\nAfter a regulation changed, some branches continued using old forms. This caused inconsistent decisions and customer confusion. Headquarters later issued a notice and required all branches to replace the forms by a fixed deadline.\n\nWhat caused the confusion?", ["Some branches used old forms", "Customers refused to visit", "Headquarters closed branches", "The deadline was removed"], "Some branches used old forms", "混亂來自部分分局仍使用舊表格。", 4),
  choice("Reading", "reading", "Read the passage and choose the best answer.\n\nAn internal review found that most mistakes occurred when employees entered account numbers manually. The office added a confirmation screen requiring employees to check the number before completing each transaction.\n\nWhat did the confirmation screen help prevent?", ["Incorrect account-number entries", "Higher postage rates", "Longer holidays", "Foreign-language notices"], "Incorrect account-number entries", "確認畫面用來避免帳號輸入錯誤。"),
  choice("Reading", "reading", "Read the passage and choose the best answer.\n\nA training session used real service cases instead of only explaining rules. Participants said the examples helped them understand how to apply regulations when customer facts were incomplete or unclear.\n\nWhy were real cases useful?", ["They showed how to apply rules to facts", "They replaced all regulations", "They made exams unnecessary", "They removed customer questions"], "They showed how to apply rules to facts", "案例幫助員工理解如何把規定用在事實上。", 4),
  choice("Reading", "reading", "Read the passage and choose the best answer.\n\nThe office separated high-risk transactions from routine ones. Routine cases were processed quickly, while high-risk cases required additional verification. This approach improved efficiency without ignoring security concerns.\n\nWhat is the passage mainly about?", ["A risk-based workflow", "A holiday schedule", "A customer survey", "A translation service"], "A risk-based workflow", "依風險高低分流，是 risk-based workflow。", 4),
  choice("Reading", "reading", "Read the passage and choose the best answer.\n\nCustomers often misunderstand service fees when explanations are too technical. To solve this, the office rewrote its fee notices in plain language and added examples.\n\nWhat solution did the office use?", ["Plain-language notices with examples", "Higher fees for all services", "Shorter business hours", "Fewer documents"], "Plain-language notices with examples", "文章說 rewrote notices in plain language and added examples。"),
  choice("Reading", "reading", "Read the passage and choose the best answer.\n\nAn employee noticed that two customers had similar names and addresses. Instead of processing the request immediately, she checked the identification numbers and discovered that the records belonged to different people.\n\nWhat quality did the employee demonstrate?", ["Careful verification", "Careless guessing", "Unnecessary delay only", "Refusal to serve customers"], "Careful verification", "她查驗身分證號，展現 careful verification。"),
];

const operationTranslation = [
  text("Translation", "translation_en_zh", "Translate into Chinese:\nEmployees who handle financial transactions must verify the customer's identity and keep accurate records, even when the service counter is busy.", "處理金融交易的員工，即使服務櫃台忙碌，也必須確認顧客身分並保存正確紀錄。", "重點：handle financial transactions、verify identity、keep accurate records、even when。", 5),
  text("Translation", "translation_en_zh", "Translate into Chinese:\nA clear complaint procedure can help an organization respond consistently and prevent similar mistakes from happening again.", "清楚的申訴處理程序能幫助機構一致地回應，並防止類似錯誤再次發生。", "重點：complaint procedure、respond consistently、prevent similar mistakes。", 5),
  text("Translation", "translation_en_zh", "Translate into Chinese:\nBefore a new policy is implemented, staff members should understand not only the rule itself but also the reason behind it.", "在新政策實施前，員工不只應了解規定本身，也應了解其背後理由。", "重點：before implemented、not only...but also、reason behind it。", 4),
  text("Translation", "translation_zh_en", "Translate into English:\n若申請資料不完整，承辦人員應通知申請人補正，並清楚說明需要補交哪些文件。", "If the application materials are incomplete, the responsible staff member should notify the applicant to make corrections and clearly explain which documents must be submitted.", "重點：application materials、incomplete、notify the applicant、make corrections、which documents。", 5),
  text("Translation", "translation_zh_en", "Translate into English:\n為了保護個人資料，未經授權的人員不得查閱或揭露顧客的交易紀錄。", "To protect personal information, unauthorized personnel must not access or disclose customers' transaction records.", "重點：protect personal information、unauthorized personnel、access or disclose、transaction records。", 5),
  text("Translation", "translation_zh_en", "Translate into English:\n主管要求各分局在月底前完成新流程的教育訓練，以確保服務標準一致。", "The supervisor required each branch to complete training on the new procedure before the end of the month to ensure consistent service standards.", "重點：required each branch、complete training、new procedure、ensure consistent standards。", 5),
];
