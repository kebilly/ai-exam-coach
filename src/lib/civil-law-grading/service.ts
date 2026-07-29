import {
  clampScore,
  defaultConvertedMaxScore,
  dimensionConfig,
  dimensionKeys,
  GRADING_VERSION,
  rawMaxScore,
  type DimensionKey,
} from "@/lib/civil-law-grading/config";
import { anchorAnswers } from "@/lib/civil-law-grading/anchors";
import {
  civilLawGradingResultSchema,
  type CivilLawGradingResult,
  type QuestionAnalysis,
} from "@/lib/civil-law-grading/schema";

type GradeInput = {
  question: string;
  answer: string;
  convertedMaxScore?: number;
  rubricId?: string;
};

type ElementSpec = {
  element: string;
  importance: "high" | "medium" | "low";
  keywords: RegExp[];
  facts: RegExp[];
};

type ElementImportance = ElementSpec["importance"];

type ElementQualityInput = {
  importance: ElementImportance;
  coverage: number;
  accuracy: number;
  reasoning_quality: number;
};

type Rubric = QuestionAnalysis & {
  primaryIssue: string;
  elementSpecs: ElementSpec[];
  rubricId?: string;
};

type DimensionDraft = {
  score: number;
  reason: string;
  evidence: string[];
};

type ScoreCapDiagnostic = {
  score_cap_id: string;
  applied: boolean;
  cap: number;
  reason: string;
};

type EvaluationContext = {
  advancedDepthScore: number;
  averageCoverage: number;
  hasConclusionOnlySubsumption: boolean;
  majorContradiction: boolean;
  protectedContradiction: boolean;
  scoreCaps: ScoreCapDiagnostic[];
  flags: string[];
};

const commonConnectors = [/因為/, /因此/, /故/, /所以/, /足認/, /可認/, /本件/, /依上開/, /綜上/];
const structureMarkers = [/一、/, /二、/, /三、/, /（一）/, /\(一\)/, /1\./, /首先/, /其次/, /最後/];

export const ELEMENT_IMPORTANCE_WEIGHTS: Record<ElementImportance, number> = {
  high: 1,
  medium: 0.55,
  low: 0.25,
};

export async function gradeCivilLawEssay(input: GradeInput): Promise<CivilLawGradingResult> {
  const convertedMaxScore = input.convertedMaxScore ?? defaultConvertedMaxScore;
  const rubric = buildQuestionRubric(input.question, input.rubricId);
  const elementEvaluations = evaluateElements(input.answer, rubric.elementSpecs);
  const context = buildEvaluationContext(input.answer, elementEvaluations);
  const dimensions = evaluateDimensions(input.question, input.answer, rubric, elementEvaluations, context);
  applyScoreCaps(dimensions, context);
  const deductions = buildDeductions(dimensions, elementEvaluations, rubric, input.answer, context);
  const rawTotal = dimensionKeys.reduce((sum, key) => sum + dimensions[key].score, 0);
  const convertedScore = Math.round((rawTotal / rawMaxScore) * convertedMaxScore * 10) / 10;
  const anchorWarning = calibrateWithAnchors(input.question, input.answer, rawTotal);

  const result: CivilLawGradingResult = {
    grading_version: GRADING_VERSION,
    question_type: rubric.question_type,
    raw_total_score: Math.round(rawTotal * 10) / 10,
    raw_max_score: rawMaxScore,
    converted_score: convertedScore,
    converted_max_score: convertedMaxScore,
    confidence: 0.72,
    overall_impression: buildOverallImpression(rawTotal, dimensions, anchorWarning),
    dimension_scores: Object.fromEntries(
      dimensionKeys.map((key) => [
        key,
        {
          score: clampScore(dimensions[key].score, dimensionConfig[key].maxScore),
          max_score: dimensionConfig[key].maxScore,
          reason: dimensions[key].reason,
          evidence: dimensions[key].evidence,
        },
      ]),
    ) as CivilLawGradingResult["dimension_scores"],
    question_analysis: {
      sub_questions: rubric.sub_questions,
      parties: rubric.parties,
      timeline: rubric.timeline,
      legal_relationships: rubric.legal_relationships,
      expected_claim_bases: rubric.expected_claim_bases,
      decisive_facts: rubric.decisive_facts,
    },
    issue_analysis: {
      expected_issues: rubric.expected_issues,
      identified_issues: dimensions.issue_spotting.evidence,
      missing_core_issues: missingCoreIssues(rubric, input.answer),
      missing_secondary_issues: [],
      irrelevant_discussion: detectIrrelevantDiscussion(input.answer, rubric),
    },
    legal_authority_analysis: {
      correct_articles: extractCorrectArticles(input.answer, rubric),
      incorrect_articles: detectIncorrectArticles(input.answer, rubric),
      missing_legal_bases: missingLegalBases(rubric, input.answer),
      unverified_cases_or_doctrines: detectUnverifiedCases(input.answer),
    },
    subsumption_analysis: [
      {
        issue: rubric.primaryIssue,
        importance: "core",
        legal_basis: rubric.expected_claim_bases,
        student_position: extractStudentPosition(input.answer),
        elements: elementEvaluations,
        issue_score: dimensions.subsumption.score,
        issue_max_score: dimensionConfig.subsumption.maxScore,
      },
    ],
    layout_review: {
      questions_answers_alignment: rubric.sub_questions.length > 1 ? "本題可能包含多個子問題，應依題目順序分段回答。" : "本題主要為單一法律關係分析。",
      heading_hierarchy: structureMarkers.some((pattern) => pattern.test(input.answer)) ? "可見基本標號或段落標示。" : "未見明確標號；若內容清楚，不宜大幅扣分，但考場上建議分層。",
      paragraph_readability: input.answer.length > 260 && !/[\n。]/.test(input.answer) ? "答案偏長且缺少分段，閱讀負擔較高。" : "段落可讀性尚可。",
      specific_corrections: structureMarkers.some((pattern) => pattern.test(input.answer)) ? [] : ["建議使用「一、（一）1.」等層級呈現請求權與要件。"],
    },
    deductions,
    grading_diagnostics: {
      subsumption_coverage_average: context.averageCoverage,
      advanced_depth_score: context.advancedDepthScore,
      calibration_flags: context.flags,
      score_caps: context.scoreCaps,
    },
    terminology_suggestions: buildTerminologySuggestions(input.answer),
    bonus_points: buildBonusPoints(rubric, input.answer, dimensions, elementEvaluations),
    grading_radar: buildGradingRadar(dimensions),
    score_breakdown: buildScoreBreakdown(dimensions, elementEvaluations, deductions),
    feedback_items: buildFeedbackItems(rubric, elementEvaluations),
    strengths: buildStrengths(dimensions, elementEvaluations),
    priority_improvements: buildPriorityImprovements(dimensions, elementEvaluations),
    examiner_comment: buildExaminerComment(rawTotal, dimensions, elementEvaluations, rubric, input.answer),
    coach_rewrite: buildCoachRewrite(rubric, elementEvaluations),
    suggested_answer_structure: buildSuggestedStructure(rubric),
  };

  return civilLawGradingResultSchema.parse(result);
}

function buildQuestionRubric(question: string, rubricId?: string): Rubric {
  const normalizedRubricId = rubricId?.trim();
  if (
    normalizedRubricId === "civil_law_article_88_error_revocation" ||
    (!normalizedRubricId && /88|錯誤|誤認|撤銷意思表示|撤銷.*意思表示|意思表示.*撤銷|重大誤認|動機錯誤|物之性質/.test(question))
  ) {
    return {
      question_type: "case",
      primaryIssue: "表意人得否依民法第88條撤銷錯誤意思表示",
      sub_questions: [],
      parties: extractParties(question),
      timeline: extractTimeline(question),
      legal_relationships: ["甲乙間可能成立因錯誤而撤銷意思表示之法律關係"],
      expected_claim_bases: ["民法第88條錯誤意思表示撤銷權"],
      expected_issues: ["意思表示錯誤", "內容錯誤與動機錯誤區分", "交易上重要性", "表意人無過失", "撤銷法律效果"],
      optional_issues: ["民法第91條信賴利益損害賠償", "相對人是否明知錯誤"],
      irrelevant_issues: ["買賣瑕疵擔保若無瑕疵給付事實，不宜作為主軸", "侵權行為若無加害事實，不宜作為主軸"],
      applicable_articles: ["民法第88條", "民法第91條"],
      required_elements: ["意思表示內容錯誤", "錯誤具交易上重要性", "表意人無過失", "撤銷法律效果"],
      disputed_elements: ["價格錯誤是否僅屬動機錯誤", "物之性質錯誤是否具交易重要性", "表意人是否有過失"],
      undisputed_elements: ["甲已為購買意思表示"],
      acceptable_positions: ["價格誤認原則上可能屬動機錯誤", "若涉及物之性質或交易上重要資格錯誤，得評價為內容錯誤"],
      decisive_facts: ["重大誤認商品真實價格", "表示願以高價購買", "事後發現錯誤"],
      elementSpecs: [
        element("意思表示內容錯誤", "high", [/意思表示|錯誤|內容錯誤|表意人|撤銷|民法第?\s*88\s*條|88條/], [/重大誤認|真實價格|高價購買|事後發現錯誤/]),
        element("動機錯誤與物之性質錯誤區分", "high", [/動機錯誤|物之性質|商品.*性質|資格|交易上.*重要|內容錯誤/], [/價格|真實價值|商品|高價/]),
        element("交易上重要性", "high", [/重要|交易上|若知.*不會|重大|第?\s*88\s*條.*2項|88條第2項/], [/重大誤認|高價|商品|真實價格|真實價值/]),
        element("表意人無過失", "high", [/無過失|不能有過失|非由.*過失|注意義務|查證|誤導|標示/], [/甲|看錯|查證|乙|誤導|包裝|標示/]),
        element("撤銷法律效果", "medium", [/撤銷|自始無效|民法第?\s*91\s*條|91條|信賴利益|損害賠償/], [/契約|乙|信賴|高價購買/]),
      ],
    };
  }

  if (
    normalizedRubricId === "civil_law_unjust_enrichment_179" ||
    (!normalizedRubricId && /誤將|匯入|返還|不當得利/.test(question))
  ) {
    return {
      question_type: "case",
      primaryIssue: "不當得利返還請求是否成立",
      sub_questions: [],
      parties: extractParties(question),
      timeline: extractTimeline(question),
      legal_relationships: ["甲乙間可能成立不當得利返還關係"],
      expected_claim_bases: ["民法第179條不當得利返還請求權"],
      expected_issues: ["受有利益", "致他人受損害", "無法律上原因", "返還範圍"],
      optional_issues: ["善意或惡意受領人的返還範圍"],
      irrelevant_issues: ["侵權行為若無故意過失事實不宜過度展開"],
      applicable_articles: ["民法第179條"],
      required_elements: ["受有利益", "他人受有損害", "利益與損害間關聯", "無法律上原因"],
      disputed_elements: ["無法律上原因", "返還範圍"],
      undisputed_elements: ["受領金錢利益"],
      acceptable_positions: ["給付型不當得利"],
      decisive_facts: ["誤匯一萬元", "乙知情後拒絕返還"],
      elementSpecs: [
        element("受有利益", "high", [/受有利益|取得利益|受領|入帳|一萬元/], [/匯入|帳戶|一萬元/]),
        element("他人受損害", "high", [/受損害|損失|財產減少/], [/甲|一萬元|匯出/]),
        element("無法律上原因", "high", [/無法律上原因|誤匯|沒有原因|無原因/], [/誤將|誤匯/]),
        element("返還範圍", "medium", [/返還|利益返還|一萬元/], [/拒絕返還|一萬元/]),
      ],
    };
  }

  if (
    normalizedRubricId === "civil_law_sale_defect" ||
    (!normalizedRubricId && /購買|買賣|筆電|無法開機|瑕疵/.test(question))
  ) {
    return {
      question_type: "case",
      rubricId: "civil_law_sale_defect",
      primaryIssue: "買受人得否主張瑕疵或債務不履行救濟",
      sub_questions: [],
      parties: extractParties(question),
      timeline: extractTimeline(question),
      legal_relationships: ["甲乙間成立買賣契約"],
      expected_claim_bases: ["買賣契約瑕疵擔保或債務不履行救濟"],
      expected_issues: ["物之瑕疵與約定品質", "解除契約或減少價金", "品質保證與損害賠償", "不完全給付"],
      optional_issues: ["檢查與通知義務", "權利行使期間", "種類買賣另行交付", "瑕疵擔保與不完全給付競合"],
      irrelevant_issues: ["侵權行為除非另有加害事實，不宜作為主軸"],
      applicable_articles: ["民法第354條", "民法第356條", "民法第359條", "民法第360條", "民法第364條", "民法第365條", "民法第227條"],
      required_elements: ["物之瑕疵與約定品質", "解除契約或減少價金", "品質保證與損害賠償", "不完全給付"],
      disputed_elements: ["瑕疵是否達欠缺通常或約定效用", "解除、減價、損害賠償或不完全給付救濟選擇"],
      undisputed_elements: ["買賣關係"],
      acceptable_positions: ["瑕疵擔保", "不完全給付"],
      decisive_facts: ["承諾功能正常", "交付後無法開機"],
      elementSpecs: [
        element("物之瑕疵與約定品質", "high", [/民法第?\s*354\s*條|354\s*條|物之瑕疵|瑕疵|欠缺通常效用|欠缺約定效用|欠缺約定品質|保證品質|品質保證|承諾功能正常|無法開機|不能正常使用|無法啟動|開不了機/], [/承諾.*功能正常|功能正常|無法開機|不能正常使用|無法啟動|開不了機|中古筆電/]),
        element("解除契約或減少價金", "high", [/民法第?\s*359\s*條|359\s*條|解除契約|解除買賣契約|減少價金|減價|顯失公平|僅得.*減價/], [/無法開機|瑕疵|欠缺通常效用|功能正常|筆電/]),
        element("品質保證與損害賠償", "high", [/民法第?\s*360\s*條|360\s*條|保證品質|品質保證|不履行之損害賠償|損害賠償|品質不符.*損害|品質不符所生/], [/承諾.*功能正常|保證|品質|無法開機|品質不符/]),
        element("不完全給付", "high", [/民法第?\s*227\s*條|227\s*條|不完全給付|不符債之本旨|可歸責|明知|應知|可補正|不能補正|不可補正|加害給付|衍生損害/], [/無法開機|故障|瑕疵|交付|明知|應知/]),
        element("檢查與通知義務", "medium", [/民法第?\s*356\s*條|356\s*條|從速檢查|發現.*通知|通知義務|視為承認所受領之物/], [/交付|發現瑕疵|無法開機|受領/]),
        element("權利行使期間", "medium", [/民法第?\s*365\s*條|365\s*條|六個月|6個月|短期期間|儘速主張|解約或減價請求權/], [/瑕疵|解約|減價|發現/]),
        element("種類買賣另行交付", "low", [/民法第?\s*364\s*條|364\s*條|種類買賣|種類之債|另行交付無瑕疵之物|另行交付|特定.*中古筆電.*難適用/], [/中古筆電|特定|另行交付|無瑕疵/]),
        element("買賣契約關係", "low", [/買賣|契約|購買|出賣人|買受人/], [/購買|交付|中古筆電/]),
      ],
    };
  }

  return {
    question_type: "case",
    primaryIssue: "侵權行為損害賠償請求是否成立",
    sub_questions: [],
    parties: extractParties(question),
    timeline: extractTimeline(question),
    legal_relationships: ["甲乙間可能成立侵權行為損害賠償關係"],
    expected_claim_bases: ["民法第184條第1項前段侵權行為損害賠償請求權"],
    expected_issues: ["權利侵害", "故意或過失", "損害", "因果關係", "損害賠償範圍"],
    optional_issues: ["回復原狀或金錢賠償"],
    irrelevant_issues: ["不當得利若無受利益事實，不宜作為主軸"],
    applicable_articles: ["民法第184條第1項前段"],
    required_elements: ["權利侵害", "故意或過失", "損害", "因果關係"],
    disputed_elements: ["過失", "損害範圍"],
    undisputed_elements: ["手機所有權歸屬"],
    acceptable_positions: ["以侵權行為作為主要請求權基礎"],
    decisive_facts: ["甲不慎摔壞手機", "手機為乙所有"],
    elementSpecs: [
      element("權利侵害", "high", [/所有權|權利侵害|侵害|財產權/], [/乙所有|手機|摔壞/]),
      element("故意或過失", "high", [/故意|過失|不慎|注意義務/], [/不慎/]),
      element("損害", "high", [/損害|毀損|修復費|價值減損|賠償/], [/手機|摔壞|毀損/]),
      element("因果關係", "high", [/因果關係|相當因果|造成|導致/], [/甲|摔壞|手機/]),
      element("法律效果", "medium", [/損害賠償|回復原狀|金錢賠償|修復費/], [/修復|價值|手機/]),
      element("損害賠償方法與範圍", "low", [/民法第?\s*196\s*條|196條|民法第?\s*213\s*條|213條|民法第?\s*215\s*條|215條|回復原狀|價值減損|金錢賠償/], [/修復|價值|手機|不能回復|顯有重大困難/]),
    ],
  };
}

function element(elementName: string, importance: "high" | "medium" | "low", keywords: RegExp[], facts: RegExp[]): ElementSpec {
  return { element: elementName, importance, keywords, facts };
}

export function calculateElementQuality(element: Pick<ElementQualityInput, "coverage" | "accuracy" | "reasoning_quality">) {
  return (element.coverage + element.accuracy + element.reasoning_quality) / 3;
}

export function getElementImportanceWeight(importance: ElementImportance) {
  return ELEMENT_IMPORTANCE_WEIGHTS[importance];
}

export function calculateUnweightedElementAverage(elements: ElementQualityInput[]) {
  return average(elements.map((item) => calculateElementQuality(item)));
}

export function calculateWeightedElementAverage(elements: ElementQualityInput[]) {
  const totalWeight = elements.reduce((sum, item) => sum + getElementImportanceWeight(item.importance), 0);
  if (!elements.length || totalWeight <= 0) return 0;
  const weightedSum = elements.reduce(
    (sum, item) => sum + calculateElementQuality(item) * getElementImportanceWeight(item.importance),
    0,
  );
  return weightedSum / totalWeight;
}

function evaluateElements(answer: string, specs: ElementSpec[]) {
  return specs.map((spec) => {
    const keywordEvidence = findEvidence(answer, spec.keywords);
    const factEvidence = findEvidence(answer, spec.facts);
    const linkedEvidence = findLinkedEvidence(answer, spec.keywords, spec.facts, spec);
    const connectorEvidence = findEvidence(linkedEvidence.join("。") || answer, commonConnectors);
    const legalEvaluationEvidence = isSaleDefectElement(spec) ? findLegalEvaluationEvidence(answer, spec.keywords, spec.facts) : [];
    const effectiveLinkedEvidence = unique([...linkedEvidence, ...legalEvaluationEvidence]);
    const effectiveConnectorEvidence = unique([...connectorEvidence, ...legalEvaluationEvidence]);
    const conclusionOnly = isConclusionOnlySubsumption(answer, spec, keywordEvidence, factEvidence, effectiveLinkedEvidence);
    const neutralCoverage = saleDefectNeutralCoverage(spec, keywordEvidence, factEvidence);
    const coverage = neutralCoverage ?? (conclusionOnly
      ? 0.25
      : effectiveLinkedEvidence.length && effectiveConnectorEvidence.length
        ? 1
        : effectiveLinkedEvidence.length
          ? 0.75
          : keywordEvidence.length && factEvidence.length
            ? 0.5
            : keywordEvidence.length || factEvidence.length
              ? 0.25
              : 0);
    const accuracy = neutralCoverage !== undefined ? 0.5 : keywordEvidence.length && factEvidence.length ? 0.9 : keywordEvidence.length ? 0.7 : factEvidence.length ? 0.45 : 0.1;
    const reasoningQuality = neutralCoverage !== undefined
      ? 0.5
      : conclusionOnly
      ? 0.2
      : effectiveLinkedEvidence.length && effectiveConnectorEvidence.length
        ? 0.9
        : effectiveLinkedEvidence.length
          ? 0.7
          : keywordEvidence.length && factEvidence.length
            ? 0.45
            : keywordEvidence.length || factEvidence.length
              ? 0.2
              : 0.1;
    const hallucinatedFact = hasHallucinatedFact(answer, spec);

    return {
      element: spec.element,
      importance: spec.importance,
      relevant_facts: spec.facts.map((pattern) => pattern.source),
      student_evidence: [...effectiveLinkedEvidence, ...keywordEvidence, ...factEvidence].slice(0, 4),
      coverage,
      accuracy,
      reasoning_quality: reasoningQuality,
      hallucinated_fact: hallucinatedFact,
      comment: coverage >= 0.75 ? "有將要件與題目事實連結。" : coverage >= 0.5 ? "有要件與事實，但理由連結仍可更清楚。" : coverage >= 0.25 ? "多為法條、要件或結論式涵攝，欠缺具體理由。" : "未具體處理此要件。",
    };
  });
}

function evaluateDimensions(
  question: string,
  answer: string,
  rubric: Rubric,
  elements: ReturnType<typeof evaluateElements>,
  context: EvaluationContext,
): Record<DimensionKey, DimensionDraft> {
  const elementAverage = calculateWeightedElementAverage(elements);
  const issueEvidence = findEvidence(answer, issuePatternsForRubric(rubric));
  const claimEvidence = findEvidence(answer, rubric.expected_claim_bases.flatMap((basis) => basisToPatterns(basis)));
  const decisiveFactEvidence = findEvidence(answer, rubric.decisive_facts.map((fact) => new RegExp(escapeRegExp(fact.slice(0, 3)))));
  const ruleEvidence = findEvidence(answer, rulePatternsForRubric(rubric));
  const conclusionEvidence = findEvidence(answer, [/得向.*請求/, /不得.*請求/, /成立/, /不成立/, /賠償/, /返還/, /解除/, /撤銷/]);
  const structureEvidence = findEvidence(answer, structureMarkers);
  const irrelevant = detectIrrelevantDiscussion(answer, rubric);
  const contradiction = context.majorContradiction;
  const correctArticles = extractCorrectArticles(answer, rubric);
  const connectorEvidence = findEvidence(
    answer,
    rubric.rubricId === "civil_law_sale_defect" ? [...commonConnectors, ...legalEvaluationConnectors()] : commonConnectors,
  );
  const terminologyPatterns = [/請求權|侵權|不當得利|瑕疵|債務不履行|不完全給付|擔保責任|保證品質|品質保證|減少價金|所有權|因果關係|構成要件|故意|過失|不法|損害|意思表示|撤銷|動機錯誤|內容錯誤|表意人|信賴利益/];
  const terminologyEvidence = findEvidence(answer, terminologyPatterns);
  const reasoningSupport = elementAverage >= 0.75 ? 1 : elementAverage >= 0.55 ? 0.55 : elementAverage >= 0.35 ? 0.25 : 0;
  const advancedDepthBonus = Math.min(4, context.advancedDepthScore);

  return {
    question_understanding: dim(
      8,
      Math.min(8, 2.5 + decisiveFactEvidence.length * 1.4 + reasoningSupport * 3 + (answer.length > 20 ? 0.8 : 0) - irrelevant.length * 1.2),
      "依是否掌握當事人、標的、時間與題目要求評分。",
      decisiveFactEvidence,
    ),
    issue_spotting: dim(
      16,
      Math.min(16, issueEvidence.length * 3 + claimEvidence.length * 1.5 + reasoningSupport * 4 + Math.min(2, advancedDepthBonus * 0.5) + (irrelevant.length ? -3 : 0)),
      "依核心爭點、前置爭點與不相關討論評分。",
      issueEvidence,
    ),
    claim_basis_and_legal_authority: dim(
      16,
      Math.min(16, claimEvidence.length * 5 + correctArticles.length * 4 + reasoningSupport * 4),
      "依請求權基礎、法條或規範內容是否正確評分。",
      claimEvidence,
    ),
    rule_explanation_and_legal_reasoning: dim(
      14,
      Math.min(14, ruleEvidence.length * 2.2 + connectorEvidence.length * 1.2 + reasoningSupport * 3 + advancedDepthBonus * 1.45),
      "依構成要件、法律效果與必要定義評分。",
      ruleEvidence,
    ),
    subsumption: dim(
      30,
      elementAverage * 30 + (context.averageCoverage >= 0.75 ? 0.5 : 0),
      "依各要件是否具體對應題目事實評分。此項為最高權重。",
      elements.flatMap((item) => item.student_evidence).slice(0, 8),
    ),
    logical_consistency: dim(
      6,
      contradiction ? 2 : Math.min(6, 4 + (conclusionEvidence.length ? 1 : 0) + (elementAverage > 0.6 ? 1 : 0)),
      contradiction ? "答案前後結論或法律效果可能互相矛盾。" : "法條、涵攝與結論大致一致。",
      contradiction ? [answer.slice(0, 90)] : conclusionEvidence,
    ),
    conclusion: dim(
      4,
      Math.min(4, conclusionEvidence.length ? 3 + (claimEvidence.length ? 1 : 0) : 0.5),
      "依是否明確回答誰得向誰主張何種權利或法律效果評分。",
      conclusionEvidence,
    ),
    writing_structure: dim(
      4,
      Math.min(4, structureEvidence.length ? 3.5 : answer.length > 180 && !/[。\n]/.test(answer) ? 1.5 : 2.5),
      "依可觀察標號、分段與三段論呈現評分，低權重。",
      structureEvidence,
    ),
    professional_terminology: dim(
      2,
      Math.min(2, terminologyEvidence.length * 0.5 + Math.min(1, countPatternHits(answer, terminologyPatterns) * 0.25) + advancedDepthBonus * 0.15),
      "依法學用語精準度評分。",
      terminologyEvidence,
    ),
  };
}

function dim(max: number, score: number, reason: string, evidence: string[]): DimensionDraft {
  return { score: clampScore(score, max), reason, evidence: unique(evidence).slice(0, 6) };
}

function buildEvaluationContext(answer: string, elements: ReturnType<typeof evaluateElements>): EvaluationContext {
  const averageCoverage = average(elements.map((item) => item.coverage));
  const protectedContradiction = /若採|如採|甲說|乙說|丙說|通說|有力說|實務|備位|退步言|縱認|即使|條件/.test(answer);
  const contradictionPattern = /(得請求|成立)[\s\S]{0,60}(不得請求|不成立)|(不得請求|不成立)[\s\S]{0,60}(得請求|成立)/;
  const majorContradiction = contradictionPattern.test(answer) && !protectedContradiction;
  const hasConclusionOnlySubsumption = elements.some((item) => item.coverage <= 0.25 && item.student_evidence.length > 0);
  const advancedDepthScore = Math.min(4, detectAdvancedDepthScore(answer) + (protectedContradiction ? 1 : 0));
  const flags = [
    hasConclusionOnlySubsumption ? "conclusion_only_or_keyword_only_subsumption" : "",
    majorContradiction ? "major_contradiction" : "",
    protectedContradiction ? "protected_multi_position_reasoning" : "",
    advancedDepthScore > 0 ? "advanced_depth_detected" : "",
  ].filter(Boolean);

  return {
    advancedDepthScore,
    averageCoverage,
    hasConclusionOnlySubsumption,
    majorContradiction,
    protectedContradiction,
    scoreCaps: [],
    flags,
  };
}

function applyScoreCaps(dimensions: Record<DimensionKey, DimensionDraft>, context: EvaluationContext) {
  const coreMissing = context.averageCoverage < 0.35;
  if (coreMissing) {
    capDimension(dimensions, "subsumption", 12);
    context.scoreCaps.push({
      score_cap_id: "subsumption_core_missing_cap",
      applied: true,
      cap: 12,
      reason: "核心要件多為關鍵字或結論式帶過，涵攝分數設上限。",
    });
  }

  if (context.hasConclusionOnlySubsumption && context.averageCoverage < 0.55) {
    capDimension(dimensions, "subsumption", 16);
    context.scoreCaps.push({
      score_cap_id: "conclusion_only_subsumption_cap",
      applied: true,
      cap: 16,
      reason: "答案有法條或要件，但缺少題目事實與要件間的理由連結。",
    });
  }

  if (context.majorContradiction) {
    capDimension(dimensions, "logical_consistency", 1);
    capDimension(dimensions, "conclusion", 1);
    capDimension(dimensions, "rule_explanation_and_legal_reasoning", 7);
    capDimension(dimensions, "issue_spotting", 9);
    context.scoreCaps.push({
      score_cap_id: "major_contradiction_dimension_cap",
      applied: true,
      cap: 65,
      reason: "主要法律效果前後矛盾，非甲乙說或備位論證，限制一致性、結論與推理分數。",
    });
    capTotalScore(dimensions, 65);
  }
}

function capDimension(dimensions: Record<DimensionKey, DimensionDraft>, key: DimensionKey, cap: number) {
  if (dimensions[key].score > cap) dimensions[key].score = cap;
}

function capTotalScore(dimensions: Record<DimensionKey, DimensionDraft>, cap: number) {
  let total = dimensionKeys.reduce((sum, key) => sum + dimensions[key].score, 0);
  const reductionOrder: DimensionKey[] = ["rule_explanation_and_legal_reasoning", "issue_spotting", "claim_basis_and_legal_authority"];
  for (const key of reductionOrder) {
    if (total <= cap) return;
    const reducible = Math.min(dimensions[key].score, total - cap);
    dimensions[key].score = clampScore(dimensions[key].score - reducible, dimensionConfig[key].maxScore);
    total = dimensionKeys.reduce((sum, item) => sum + dimensions[item].score, 0);
  }
}

function buildDeductions(
  dimensions: Record<DimensionKey, DimensionDraft>,
  elements: ReturnType<typeof evaluateElements>,
  rubric: Rubric,
  answer: string,
  context: EvaluationContext,
): CivilLawGradingResult["deductions"] {
  const deductions: CivilLawGradingResult["deductions"] = [];
  for (const key of dimensionKeys) {
    const max = dimensionConfig[key].maxScore;
    const lost = Math.round((max - dimensions[key].score) * 10) / 10;
    if (lost <= 0.5) continue;
    deductions.push({
      deduction_reason_id: `${key}-loss`,
      severity: lost >= max * 0.55 ? "major" : lost >= max * 0.25 ? "moderate" : "minor",
      dimension: key,
      points: lost,
      reason: dimensions[key].reason,
      student_evidence: dimensions[key].evidence[0] ?? answer.slice(0, 90),
    });
  }

  for (const item of elements) {
    if (item.coverage < 0.5) {
      deductions.push({
        deduction_reason_id: `subsumption-${slug(item.element)}`,
        severity: item.importance === "high" ? "major" : "moderate",
        dimension: "subsumption",
        points: item.importance === "high" ? 3 : 1.5,
        reason: `未充分涵攝「${item.element}」。`,
        student_evidence: item.student_evidence[0] ?? answer.slice(0, 90),
      });
    }
  }

  if (context.hasConclusionOnlySubsumption) {
    deductions.push({
      deduction_reason_id: "conclusion_only_subsumption",
      severity: "major",
      dimension: "subsumption",
      points: 0,
      reason: "答案多停留在法條、要件或『本案符合』，沒有具體說明題目事實如何滿足要件。",
      student_evidence: answer.slice(0, 90),
    });
  }

  if (context.majorContradiction) {
    deductions.push({
      deduction_reason_id: "major_contradiction",
      severity: "fatal",
      dimension: "logical_consistency",
      points: 0,
      reason: "主要法律效果前後矛盾，且未以甲乙說、備位論證或條件式結論清楚區分。",
      student_evidence: answer.slice(0, 90),
    });
  }

  if (deductions.length === 0) {
    deductions.push({
      deduction_reason_id: "minor-polish",
      severity: "style",
      dimension: "writing_structure",
      points: 0,
      reason: "可再提升標題與分層表達。",
      student_evidence: "整體答案仍可更清楚分段。",
    });
  }

  return deductions.slice(0, 12);
}

function buildOverallImpression(rawTotal: number, dimensions: Record<DimensionKey, DimensionDraft>, anchorWarning?: string) {
  const weakest = [...dimensionKeys].sort((a, b) => dimensions[a].score / dimensionConfig[a].maxScore - dimensions[b].score / dimensionConfig[b].maxScore)[0];
  const strongest = [...dimensionKeys].sort((a, b) => dimensions[b].score / dimensionConfig[b].maxScore - dimensions[a].score / dimensionConfig[a].maxScore)[0];
  return {
    summary: `${rawTotal >= 80 ? "答案已具備完整申論雛形" : rawTotal >= 55 ? "答案方向大致可取，但仍有明顯補強空間" : "答案尚未形成完整法律論證"}。${anchorWarning ?? ""}`.trim(),
    main_strength: `${dimensionConfig[strongest].label}表現相對較好。`,
    main_weakness: `最需要補強的是${dimensionConfig[weakest].label}。`,
  };
}

function buildStrengths(dimensions: Record<DimensionKey, DimensionDraft>, elements: ReturnType<typeof evaluateElements>) {
  const strengths = [];
  if (dimensions.claim_basis_and_legal_authority.score >= 10) strengths.push("能點出主要請求權基礎或法律依據。");
  if (dimensions.subsumption.score >= 20) strengths.push("能將主要法律要件與題目事實作具體連結。");
  if (dimensions.conclusion.score >= 3) strengths.push("結論大致明確，能回應題目要求。");
  if (elements.some((item) => item.reasoning_quality >= 0.75)) strengths.push("部分要件已有接近三段論的推理。");
  return strengths.length ? strengths : ["已嘗試回應題目事實。"];
}

function buildPriorityImprovements(dimensions: Record<DimensionKey, DimensionDraft>, elements: ReturnType<typeof evaluateElements>) {
  const improvements = [];
  const partialElement = elements.find((item) => item.coverage > 0 && item.coverage < 0.75 && !isIntroductoryElementAlreadyMentioned(item));
  const missingElement = elements.find((item) => item.coverage === 0);
  if (partialElement) {
    improvements.push(`可補強「${partialElement.element}」：已提到相關概念，但還要寫出題目事實如何符合該要件。`);
  } else if (missingElement) {
    improvements.push(`補上「${missingElement.element}」：目前答案沒有清楚處理此核心要件。`);
  } else if (dimensions.subsumption.score < 26) {
    improvements.push("涵攝已具雛形，下一步可把每個要件拆成「法條要件、題目事實、因此結論」三句。");
  }
  if (dimensions.claim_basis_and_legal_authority.score < 10) improvements.push("開頭先明確寫出請求權基礎或撤銷權依據，再進入要件分析。");
  if (dimensions.rule_explanation_and_legal_reasoning.score < 9) improvements.push("大前提可再補完整：先列要件，再說明本題真正有爭議的要件。");
  return unique(improvements).slice(0, 4);
}

function isIntroductoryElementAlreadyMentioned(element: ReturnType<typeof evaluateElements>[number]) {
  return /買賣契約關係|契約關係/.test(element.element) && element.student_evidence.length > 0;
}

function buildExaminerComment(rawTotal: number, dimensions: Record<DimensionKey, DimensionDraft>, elements: ReturnType<typeof evaluateElements>, rubric: Rubric, answer: string) {
  const level = rawTotal >= 85 ? "已達中上至高分水準" : rawTotal >= 75 ? "已具備中上程度" : rawTotal >= 60 ? "方向大致正確，但申論完整度仍需加強" : "目前仍偏向片段式作答";
  const strongest = [...dimensionKeys].sort((a, b) => dimensions[b].score / dimensionConfig[b].maxScore - dimensions[a].score / dimensionConfig[a].maxScore)[0];
  const weakestElement = elements.find((item) => item.coverage < 0.75 && !isIntroductoryElementAlreadyMentioned(item));
  const nextStep = buildConcreteNextStep(rubric, weakestElement, answer);
  return `本題${rubric.expected_claim_bases[0] ?? "主要法律依據"}掌握情形：${level}。最大優點是${dimensionConfig[strongest].label}相對穩定，能看出基本解題方向。最大缺點是${weakestElement ? `「${weakestElement.element}」的涵攝仍可更精準` : "細部法理與段落層次仍可提升"}。${nextStep}`;
}

function buildCoachRewrite(rubric: Rubric, elements: ReturnType<typeof evaluateElements>) {
  const target = elements.find((item) => item.coverage < 0.75) ?? elements[0];
  return {
    target_problem: target?.element ?? rubric.primaryIssue,
    why_this_section_was_selected: "此段通常最影響閱卷者對涵攝能力的判斷。",
    rewritten_paragraph: `${rubric.expected_claim_bases[0] ?? "相關請求權"}之成立，應先確認其構成要件，再將題目事實逐一涵攝。本題中，應特別說明「${target?.element ?? "核心要件"}」如何由題目事實支持，最後再作成是否成立及其法律效果之結論。`,
  };
}

function buildConcreteNextStep(rubric: Rubric, weakElement: ReturnType<typeof evaluateElements>[number] | undefined, answer: string) {
  const basis = rubric.expected_claim_bases[0] ?? "主要法律依據";
  if (/184|侵權/.test(basis)) {
    if (!/所有權.{0,12}(保護|權利|侵害)|權利侵害/.test(answer)) {
      return "若能於184部分先說明「所有權屬民法第184條保護之權利」，再分析行為人是否具有過失、損害與因果關係，通常可再多拿2至5分。";
    }
    if (!/196|213|215|回復原狀|價值減損|修復費/.test(answer)) {
      return "若能在184成立後接續說明修復費、價值減損，並銜接民法第196、213或215條，法律效果會更完整。";
    }
    return "若再提升，可把段落標題改成結論前置式，例如先寫「乙得依民法第184條第1項前段向甲請求損害賠償」，讓閱卷者更快看到結論。";
  }
  if (/88|錯誤|撤銷/.test(basis)) {
    return "若能先區分「價格錯誤原則上屬動機錯誤」與「物之性質錯誤例外視為內容錯誤」，再具體判斷甲是否無過失，答案會更接近高分擬答。";
  }
  if (/179|不當得利/.test(basis)) {
    return "若能逐一寫出受有利益、他人受損害、無法律上原因與返還範圍，並把誤匯與拒絕返還事實接上要件，通常可再多拿2至5分。";
  }
  if (weakElement) {
    return `下一次可把「${weakElement.element}」拆成一小段：先寫規範要件，再引用題目事實，最後用「故」作成法律效果結論。`;
  }
  return answer.length > 260 ? "若再提升，可把段落標題改成結論前置式，讓閱卷者更快看到請求權基礎、爭點與結論。" : "若再提升，可補一至兩句核心法理，讓簡潔答案仍保有完整三段論。";
}

function buildTerminologySuggestions(answer: string): CivilLawGradingResult["terminology_suggestions"] {
  const rules = [
    { pattern: /不慎/g, suggested: "具有過失", reason: "「不慎」是事實描述，考場上可轉換為民法評價用語「過失」。" },
    { pattern: /賠錢/g, suggested: "負損害賠償責任", reason: "「賠錢」過於口語，應改用法律效果用語。" },
    { pattern: /搞錯/g, suggested: "意思表示錯誤或動機錯誤", reason: "「搞錯」應具體化為第88條下的錯誤類型。" },
    { pattern: /完全沒有過失/g, suggested: "非由表意人自己之過失", reason: "第88條但書的精準用語是「非由表意人自己之過失」。" },
    { pattern: /不能隨便撤銷/g, suggested: "原則上不得僅以動機錯誤撤銷意思表示", reason: "可把生活化表述改為法律判斷標準。" },
    { pattern: /叫.+負責/g, suggested: "得請求損害賠償或返還", reason: "需明確指出請求內容與法律效果。" },
  ];
  const suggestions = [];
  for (const rule of rules) {
    const match = answer.match(rule.pattern);
    if (!match?.[0]) continue;
    suggestions.push({
      original_text: match[0],
      suggested_revision: rule.suggested,
      reason: rule.reason,
    });
  }
  return uniqueBy(suggestions, (item) => item.original_text).slice(0, 4);
}

function buildBonusPoints(rubric: Rubric, answer: string, dimensions: Record<DimensionKey, DimensionDraft>, elements: ReturnType<typeof evaluateElements>): CivilLawGradingResult["bonus_points"] {
  if (dimensions.subsumption.score < 18) return [];
  const suggestions: CivilLawGradingResult["bonus_points"] = [];
  const basis = rubric.expected_claim_bases.join("、");
  if (/184|侵權/.test(basis)) {
    if (!/196|213|215|回復原狀|價值減損|修復費/.test(answer)) {
      suggestions.push({
        topic: "損害賠償方法與範圍",
        suggestion: "補充民法第213條回復原狀、第215條不能回復時金錢賠償，並說明手機修復費或價值減損。",
        estimated_points: "+2~4",
        reason: "本題若已完成184構成要件，法律效果細分可提升答案完整度。",
      });
    }
  }
  if (/88|錯誤|撤銷/.test(basis)) {
    if (!/91|信賴利益/.test(answer)) {
      suggestions.push({
        topic: "撤銷後信賴利益",
        suggestion: "補充民法第91條：撤銷後若相對人不知其錯誤，表意人可能負信賴利益損害賠償責任。",
        estimated_points: "+2~3",
        reason: "第88條題目常以撤銷效果與第91條作為高分延伸。",
      });
    }
  }
  if (rubric.optional_issues.length && elements.every((item) => item.coverage >= 0.75) && !/學說|實務|通說|有力說|少數說/.test(answer)) {
    suggestions.push({
      topic: "高分延伸",
      suggestion: `可視題目補充：${rubric.optional_issues.slice(0, 2).join("、")}。`,
      estimated_points: "+2~5",
      reason: "主要要件已具備時，相關且精準的延伸討論有助於拉開高分差距。",
    });
  }
  return suggestions.slice(0, 3);
}

function buildGradingRadar(dimensions: Record<DimensionKey, DimensionDraft>): CivilLawGradingResult["grading_radar"] {
  return [
    radarItem("爭點辨識", dimensions.issue_spotting.score, dimensionConfig.issue_spotting.maxScore),
    radarItem("法律依據", dimensions.claim_basis_and_legal_authority.score, dimensionConfig.claim_basis_and_legal_authority.maxScore),
    radarItem("事實涵攝", dimensions.subsumption.score, dimensionConfig.subsumption.maxScore),
    radarItem(
      "法理推論",
      dimensions.rule_explanation_and_legal_reasoning.score + dimensions.logical_consistency.score,
      dimensionConfig.rule_explanation_and_legal_reasoning.maxScore + dimensionConfig.logical_consistency.maxScore,
    ),
    radarItem(
      "書寫表達",
      dimensions.writing_structure.score + dimensions.professional_terminology.score,
      dimensionConfig.writing_structure.maxScore + dimensionConfig.professional_terminology.maxScore,
    ),
  ];
}

function radarItem(label: string, score: number, max: number) {
  return { label, stars: Math.max(0, Math.min(5, Math.round((score / max) * 5))), max_stars: 5 as const };
}

function buildScoreBreakdown(
  dimensions: Record<DimensionKey, DimensionDraft>,
  elements: ReturnType<typeof evaluateElements>,
  deductions: CivilLawGradingResult["deductions"],
): CivilLawGradingResult["score_breakdown"] {
  const credits = [
    {
      label: "請求權基礎或法律依據",
      type: "credit" as const,
      points: Math.round(dimensions.claim_basis_and_legal_authority.score),
      reason: "依答案是否點出正確法條、請求權基礎或撤銷權依據給分。",
      evidence: dimensions.claim_basis_and_legal_authority.evidence[0],
    },
    ...elements.map((item) => ({
      label: item.element,
      type: "credit" as const,
      points: Math.round(((item.coverage + item.accuracy + item.reasoning_quality) / 3) * (item.importance === "high" ? 8 : 4)),
      reason: item.comment,
      evidence: item.student_evidence[0],
    })),
  ];
  const deductionRows = deductions
    .filter((item) => item.points > 0 && (item.dimension === "subsumption" || item.severity === "fatal" || item.severity === "major"))
    .slice(0, 5)
    .map((item) => ({
      label: item.deduction_reason_id,
      type: "deduction" as const,
      points: -Math.round(item.points),
      reason: item.reason,
      evidence: item.student_evidence,
    }));
  return [...credits, ...deductionRows].slice(0, 12);
}

function buildFeedbackItems(rubric: Rubric, elements: ReturnType<typeof evaluateElements>): CivilLawGradingResult["feedback_items"] {
  return elements.map((item) => {
    const evidence = item.student_evidence[0] ?? "";
    if (item.coverage === 0) {
      return {
        student_evidence: "",
        issue_or_element: item.element,
        feedback_type: "missing" as const,
        analysis: `答案未具體處理「${item.element}」。`,
        suggested_revision: "可在相應段落補上此要件，再依題目事實作簡短涵攝。",
      };
    }
    if (item.coverage < 0.75) {
      return {
        student_evidence: evidence,
        issue_or_element: item.element,
        feedback_type: "partial" as const,
        analysis: `已提到「${item.element}」相關內容，但仍可把法律要件與題目事實連結得更清楚。`,
        suggested_revision: "可補一句說明該事實為何符合此要件，避免只停留在名詞或結論。",
      };
    }
    return {
      student_evidence: evidence,
      issue_or_element: item.element,
      feedback_type: "complete" as const,
      analysis: `此處已能看出「${item.element}」與題目事實的連結，不應再列為缺漏或弱點。`,
      suggested_revision: "維持此寫法即可。",
    };
  });
}

function buildSuggestedStructure(rubric: Rubric) {
  const basis = rubric.expected_claim_bases.join("、");
  if (rubric.rubricId === "civil_law_sale_defect") {
    return [
      "一、甲得依民法第354條向乙主張物之瑕疵擔保責任",
      "（一）乙承諾交付功能正常之筆電，交付後無法開機，應先認定欠缺約定品質及通常效用。",
      "（二）甲得依民法第359條解除契約或請求減少價金，並注意解除是否顯失公平。",
      "（三）因乙曾保證品質，可進一步說明民法第360條損害賠償是否成立。",
      "二、甲亦可檢討民法第227條不完全給付",
      "（一）若乙明知或可得而知瑕疵仍交付，應說明可歸責性與給付不符債之本旨。",
      "（二）若另生資料毀損等衍生損害，再檢討加害給付之賠償。",
      "三、最後補充行使限制：第356條檢查通知義務、第365條期間；第364條僅在種類買賣時作為延伸。",
    ];
  }
  if (/184|侵權/.test(basis)) {
    return [
      "一、乙得依民法第184條第1項前段向甲請求損害賠償",
      "（一）乙所有之手機遭摔壞，應先說明所有權受侵害。",
      "（二）甲不慎摔壞手機，需判斷其是否具有過失。",
      "（三）手機毀損與甲之行為間須具備相當因果關係。",
      "（四）損害範圍可接續說明修復費、價值減損，並視答案需要銜接第196、213、215條。",
      "二、結論應明確寫出乙得向甲請求損害賠償及其範圍。",
    ];
  }
  if (/179|不當得利/.test(basis)) {
    return [
      "一、甲得依民法第179條向乙請求返還不當得利",
      "（一）乙帳戶增加一萬元，屬受有利益。",
      "（二）甲帳戶減少一萬元，屬他人受有損害。",
      "（三）該匯款係誤匯，乙保有利益欠缺法律上原因。",
      "（四）乙知情後拒絕返還時，可補充惡意受領及返還範圍。",
      "二、結論應寫明甲得請求乙返還一萬元及可能附隨利益。",
    ];
  }
  if (/88|錯誤|撤銷/.test(basis)) {
    return [
      "一、甲得否依民法第88條撤銷其購買之意思表示",
      "（一）先區分價格錯誤原則上屬動機錯誤，未必當然得撤銷。",
      "（二）若錯誤涉及商品性質、資格或交易上重要事項，才可能評價為內容錯誤。",
      "（三）再檢查甲是否非因自己過失而陷於錯誤。",
      "（四）若得撤銷，應補充撤銷後自始無效及第91條信賴利益問題。",
      "二、結論應依題目事實明確寫出得撤銷或不得撤銷，而非只寫抽象條件。",
    ];
  }
  const elementLines = rubric.required_elements.slice(0, 6).map((elementName, index) => {
    const label = ["（一）", "（二）", "（三）", "（四）", "（五）", "（六）"][index] ?? `（${index + 1}）`;
    return `${label}${elementName}：先寫要件，再接題目事實，最後作小結。`;
  });
  if (elementLines.length) {
    return [
      `一、請求權基礎或法律依據：${rubric.expected_claim_bases[0] ?? "依題目法律關係選擇請求權"}`,
      ...elementLines,
      `二、爭點收束：${rubric.expected_issues.slice(0, 3).join("、") || rubric.primaryIssue}`,
      "三、結論：明確寫出成立與否、誰得向誰主張何種權利或法律效果。",
    ];
  }
  return [
    `一、確認請求權基礎：${rubric.expected_claim_bases[0] ?? "依題目法律關係選擇請求權"}`,
    `二、列出核心爭點：${rubric.expected_issues.slice(0, 3).join("、")}`,
    "三、依各構成要件逐一涵攝題目事實",
    "四、明確作成成立與否及法律效果之結論",
  ];
}

function calibrateWithAnchors(question: string, answer: string, score: number) {
  if (!/手機|摔壞|184|侵權/.test(question + answer)) return undefined;
  const closest = anchorAnswers
    .map((anchor) => ({ anchor, similarity: lexicalSimilarity(answer, anchor.answer) }))
    .sort((a, b) => b.similarity - a.similarity)[0];
  if (!closest || closest.similarity < 0.25) return undefined;
  const [min, max] = closest.anchor.expectedRange;
  if (score < min - 15 || score > max + 15) {
    return `錨點校準提醒：本答案接近「${closest.anchor.label}」，目前分數可能需人工複核。`;
  }
  return undefined;
}

function lexicalSimilarity(a: string, b: string) {
  const aSet = new Set((a.match(/[\u4e00-\u9fa5]{2,}|[a-zA-Z]+|\d+/g) ?? []).map((token) => token.toLowerCase()));
  const bSet = new Set((b.match(/[\u4e00-\u9fa5]{2,}|[a-zA-Z]+|\d+/g) ?? []).map((token) => token.toLowerCase()));
  const intersection = [...aSet].filter((token) => bSet.has(token)).length;
  const union = new Set([...aSet, ...bSet]).size || 1;
  return intersection / union;
}

function extractParties(question: string) {
  return unique(question.match(/[甲乙丙丁]/g) ?? []);
}

function extractTimeline(question: string) {
  return question
    .split(/[，。；]/)
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 6);
}

function findEvidence(text: string, patterns: RegExp[]) {
  const sentences = text.split(/(?<=[。！？；\n])/).map((part) => part.trim()).filter(Boolean);
  const source = sentences.length ? sentences : [text];
  const evidence: string[] = [];
  for (const pattern of patterns) {
    const match = source.find((sentence) => pattern.test(sentence));
    if (match) evidence.push(match.slice(0, 90));
  }
  return unique(evidence);
}

function basisToPatterns(basis: string) {
  if (/184|侵權/.test(basis)) return [/民法第?184條|184條|侵權|損害賠償/];
  if (/179|不當得利/.test(basis)) return [/民法第?179條|179條|不當得利|返還/];
  if (/88|錯誤|撤銷/.test(basis)) return [/民法第?\s*88\s*條|88\s*條|意思表示.*錯誤|錯誤.*意思表示|撤銷/];
  if (/91|信賴利益/.test(basis)) return [/民法第?\s*91\s*條|91\s*條|信賴利益/];
  if (/買賣|瑕疵|債務不履行/.test(basis)) return [/瑕疵擔保|不完全給付|債務不履行|民法第?\s*354\s*條|民法第?\s*359\s*條|解除契約|減少價金|損害賠償/];
  return [new RegExp(escapeRegExp(basis.slice(0, 4)))];
}

function issuePatternsForRubric(rubric: Rubric) {
  if (rubric.rubricId === "civil_law_sale_defect") {
    return [
      /標的物瑕疵|物之瑕疵|欠缺通常效用|欠缺約定品質|欠缺約定效用|無法開機|品質不符|不能正常使用|保證品質|品質保證/,
      /民法第?\s*359\s*條|359\s*條|解除契約|解除買賣契約|減少價金|減價|顯失公平/,
      /民法第?\s*360\s*條|360\s*條|保證品質|品質保證|不履行之損害賠償|品質不符.*損害/,
      /民法第?\s*227\s*條|227\s*條|不完全給付|不符債之本旨|可歸責|加害給付/,
    ];
  }
  return rubric.expected_issues.map((issue) => new RegExp(escapeRegExp(issue.slice(0, 4))));
}

function rulePatternsForRubric(rubric: Rubric) {
  if (rubric.rubricId === "civil_law_sale_defect") {
    return [
      /民法第?\s*354\s*條|354\s*條|物之瑕疵|欠缺通常效用|欠缺約定效用|保證品質|品質保證/,
      /民法第?\s*359\s*條|359\s*條|解除契約|減少價金|顯失公平/,
      /民法第?\s*360\s*條|360\s*條|不履行之損害賠償|品質不符.*損害/,
      /民法第?\s*227\s*條|227\s*條|不完全給付|不符債之本旨|可歸責|加害給付/,
      /民法第?\s*356\s*條|356\s*條|從速檢查|通知義務|視為承認所受領之物/,
      /民法第?\s*365\s*條|365\s*條|六個月|短期期間/,
      /民法第?\s*364\s*條|364\s*條|種類之債|另行交付/,
    ];
  }
  return rubric.required_elements.map((item) => new RegExp(escapeRegExp(item.slice(0, 4))));
}

function extractCorrectArticles(answer: string, rubric: Rubric) {
  return rubric.applicable_articles.filter((article) => {
    if (rubric.rubricId === "civil_law_sale_defect" && /356|364|365/.test(article)) return false;
    if (/184/.test(article)) return /184\s*條|第\s*184\s*條|§\s*184/.test(answer);
    if (/179/.test(article)) return /179\s*條|第\s*179\s*條|§\s*179/.test(answer);
    if (/88/.test(article)) return /88\s*條|第\s*88\s*條|§\s*88/.test(answer);
    if (/91/.test(article)) return /91\s*條|第\s*91\s*條|§\s*91/.test(answer);
    if (/354/.test(article)) return /354\s*條|第\s*354\s*條|§\s*354/.test(answer);
    if (/356/.test(article)) return /356\s*條|第\s*356\s*條|§\s*356/.test(answer);
    if (/359/.test(article)) return /359\s*條|第\s*359\s*條|§\s*359/.test(answer);
    if (/360/.test(article)) return /360\s*條|第\s*360\s*條|§\s*360/.test(answer);
    if (/364/.test(article)) return /364\s*條|第\s*364\s*條|§\s*364/.test(answer);
    if (/365/.test(article)) return /365\s*條|第\s*365\s*條|§\s*365/.test(answer);
    if (/227/.test(article)) return /227\s*條|第\s*227\s*條|§\s*227/.test(answer);
    return basisToPatterns(article).some((pattern) => pattern.test(answer));
  });
}

function detectIncorrectArticles(answer: string, rubric: Rubric) {
  const articleMatches = unique(answer.match(/第?\d+條|§\d+|\d{2,4}條/g) ?? []);
  const applicableArticleNumbers = unique(rubric.applicable_articles.flatMap((article) => article.match(/\d{2,4}/g) ?? []));
  return articleMatches.filter((article) => {
    const articleNumber = article.match(/\d{2,4}/)?.[0];
    return !articleNumber || !applicableArticleNumbers.includes(articleNumber);
  });
}

function missingLegalBases(rubric: Rubric, answer: string) {
  return rubric.expected_claim_bases.filter((basis) => !basisToPatterns(basis).some((pattern) => pattern.test(answer)));
}

function missingCoreIssues(rubric: Rubric, answer: string) {
  if (rubric.rubricId === "civil_law_sale_defect") {
    return rubric.expected_issues.filter((issue) => {
      const patterns = saleDefectIssuePatternsByIssue(issue);
      return patterns.length ? !patterns.some((pattern) => pattern.test(answer)) : !new RegExp(escapeRegExp(issue.slice(0, 4))).test(answer);
    }).slice(0, 5);
  }
  return rubric.expected_issues.filter((issue) => !new RegExp(escapeRegExp(issue.slice(0, 4))).test(answer)).slice(0, 5);
}

function saleDefectIssuePatternsByIssue(issue: string) {
  if (/物之瑕疵|約定品質/.test(issue)) {
    return [/標的物瑕疵|物之瑕疵|欠缺通常效用|欠缺約定品質|無法開機|品質不符|保證品質|品質保證/];
  }
  if (/解除|減少價金/.test(issue)) {
    return [/民法第?\s*359\s*條|359\s*條|解除契約|解除買賣契約|減少價金|減價|顯失公平/];
  }
  if (/品質保證|損害賠償/.test(issue)) {
    return [/民法第?\s*360\s*條|360\s*條|保證品質|品質保證|不履行之損害賠償|品質不符.*損害|損害賠償/];
  }
  if (/不完全給付/.test(issue)) {
    return [/民法第?\s*227\s*條|227\s*條|不完全給付|不符債之本旨|可歸責|加害給付/];
  }
  return [];
}

function detectIrrelevantDiscussion(answer: string, rubric: Rubric) {
  return rubric.irrelevant_issues.filter((issue) => {
    if (/不當得利/.test(issue)) return /不當得利|179/.test(answer);
    if (/侵權/.test(issue)) return /侵權|184/.test(answer) && !rubric.expected_claim_bases.some((basis) => /侵權|184/.test(basis));
    return false;
  });
}

function detectUnverifiedCases(answer: string) {
  return answer.match(/\d{2,3}年台上字第\d+號|最高法院.*判決|決議/g) ?? [];
}

function extractStudentPosition(answer: string) {
  const conclusion = findEvidence(answer, [/得向.*請求/, /不得.*請求/, /成立/, /不成立/, /賠償/, /返還/, /解除/, /撤銷/])[0];
  return conclusion ?? "答案未明確呈現法律立場。";
}

function findLinkedEvidence(text: string, keywordPatterns: RegExp[], factPatterns: RegExp[], spec?: ElementSpec) {
  const sentences = text.split(/(?<=[。！？；\n])/).map((part) => part.trim()).filter(Boolean);
  const source = sentences.length ? sentences : [text];
  const sameSentenceEvidence = source.filter(
      (sentence) =>
        keywordPatterns.some((pattern) => pattern.test(sentence)) &&
        factPatterns.some((pattern) => pattern.test(sentence)),
    ).map((sentence) => sentence.slice(0, 90));
  if (!spec || !isSaleDefectElement(spec)) return unique(sameSentenceEvidence);
  const adjacentEvidence = source.flatMap((sentence, index) => {
    const previous = index > 0 ? source[index - 1] : "";
    const next = index < source.length - 1 ? source[index + 1] : "";
    const hasKeyword = keywordPatterns.some((pattern) => pattern.test(sentence));
    const nearbyFact = [previous, next].find((item) => factPatterns.some((pattern) => pattern.test(item)));
    return hasKeyword && nearbyFact ? [`${nearbyFact}${sentence}`.slice(0, 90)] : [];
  });
  return unique([...sameSentenceEvidence, ...adjacentEvidence]);
}

function legalEvaluationConnectors() {
  return [/欠缺[\s\S]{0,18}屬/, /構成/, /不符[\s\S]{0,18}構成/, /具有[\s\S]{0,18}故/, /因[\s\S]{0,24}而/, /若[\s\S]{0,30}則/, /符合/, /應認/, /可認/];
}

function findLegalEvaluationEvidence(text: string, keywordPatterns: RegExp[], factPatterns: RegExp[]) {
  const sentences = text.split(/(?<=[。！？；\n])/).map((part) => part.trim()).filter(Boolean);
  return unique(
    sentences.filter((sentence) => {
      const hasKeyword = keywordPatterns.some((pattern) => pattern.test(sentence));
      const hasFact = factPatterns.some((pattern) => pattern.test(sentence));
      const hasLegalEvaluation = legalEvaluationConnectors().some((pattern) => pattern.test(sentence));
      return hasKeyword && hasFact && hasLegalEvaluation;
    }).map((sentence) => sentence.slice(0, 90)),
  );
}

function isConclusionOnlySubsumption(
  answer: string,
  spec: ElementSpec,
  keywordEvidence: string[],
  factEvidence: string[],
  linkedEvidence: string[],
) {
  if (!keywordEvidence.length) return false;
  if (!factEvidence.length || !linkedEvidence.length) return true;
  if (isSaleDefectElement(spec) && findLegalEvaluationEvidence(answer, spec.keywords, spec.facts).length) return false;
  const elementMention = new RegExp(`${escapeRegExp(spec.element)}.{0,8}(成立|符合|具備)|本(案|題).{0,12}(成立|符合|具備)`);
  return elementMention.test(answer) && linkedEvidence.every((item) => !/因為|因此|故|所以|由於|可認|足認|造成|導致|所致|侵害|毀損/.test(item));
}

function hasHallucinatedFact(answer: string, spec: ElementSpec) {
  const normalizedAnswer = answer
    .replace(/保證品質|品質保證|品質.{0,4}保證|保證.{0,4}品質|承諾功能正常|承諾交付功能正常/g, "")
    .replace(/保證其物具有正常運作之品質/g, "");
  return /車禍|刀|毒品|借款|保證|結婚|遺產/.test(normalizedAnswer) && !/車禍|刀|毒品|借款|保證|結婚|遺產/.test(spec.facts.join(""));
}

function saleDefectNeutralCoverage(spec: ElementSpec, keywordEvidence: string[], factEvidence: string[]) {
  const contextDependentOrOptional = /品質保證與損害賠償|不完全給付|檢查與通知義務|權利行使期間|種類買賣另行交付|買賣契約關係/.test(spec.element);
  if (!contextDependentOrOptional) return undefined;
  if (keywordEvidence.length) return undefined;
  if (!factEvidence.length || spec.importance !== "high") return 0.5;
  return 0.5;
}

function isSaleDefectElement(spec: ElementSpec) {
  return /物之瑕疵與約定品質|解除契約或減少價金|品質保證與損害賠償|不完全給付|檢查與通知義務|權利行使期間|種類買賣另行交付|買賣契約關係/.test(spec.element);
}

function detectAdvancedDepthScore(answer: string) {
  const markers = [
    /甲說|乙說|通說|實務|學說|見解|有力說/,
    /縱認|即使|退步言|備位|反對見解|相反見解/,
    /制度目的|規範目的|保護範圍|相當因果關係/,
    /回復原狀|金錢賠償|價值減損|民法第196條|196條|民法第213條|213條|民法第215條|215條/,
    /民法第356條|356條|從速檢查|通知義務|民法第365條|365條|六個月|短期期間|民法第364條|364條|種類之債|另行交付|競合/,
  ];
  return Math.min(4, markers.reduce((sum, pattern) => sum + (pattern.test(answer) ? 1 : 0), 0));
}

function average(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function countPatternHits(text: string, patterns: RegExp[]) {
  return patterns.reduce((sum, pattern) => sum + (pattern.test(text) ? 1 : 0), 0);
}

function unique<T>(values: T[]) {
  return [...new Set(values.filter(Boolean))];
}

function uniqueBy<T>(values: T[], getKey: (value: T) => string) {
  const seen = new Set<string>();
  return values.filter((value) => {
    const key = getKey(value);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function slug(value: string) {
  return value.replace(/\s+/g, "-").toLowerCase();
}
