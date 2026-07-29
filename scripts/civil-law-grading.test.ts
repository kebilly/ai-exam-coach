import {
  calculateWeightedElementAverage,
  gradeCivilLawEssay,
} from "../src/lib/civil-law-grading/service";
import { dimensionKeys } from "../src/lib/civil-law-grading/config";
import { toLegacyFeedback } from "../src/lib/civil-law-grading/legacy-adapter";

const question = "甲不慎將乙所有之手機摔壞，乙得向甲主張何種權利？";

const cases = [
  {
    id: "high_complete_subsumption",
    expectedRange: [84, 90],
    answer:
      "乙得依民法第184條第1項前段向甲請求損害賠償。手機為乙所有，所有權屬民法保護之權利；甲不慎將手機摔壞，客觀上侵害乙所有權，主觀上雖非故意，仍至少違反注意義務而有過失。手機毀損造成乙財產上損害，且該損害係由甲摔壞行為直接造成，具有相當因果關係。縱認損害範圍需再細分，乙仍得依回復原狀或金錢賠償之法理，請求修復費或價值減損。",
  },
  {
    id: "medium_law_only_no_subsumption",
    expectedRange: [48, 60],
    answer:
      "民法第184條第1項前段規定，因故意或過失不法侵害他人權利者，負損害賠償責任。侵權行為應具備故意過失、不法侵害、損害及因果關係。本題應依該條處理。",
  },
  {
    id: "contradictory_conclusion",
    expectedRange: [50, 65],
    shouldTriggerCap: "major_contradiction_dimension_cap",
    answer:
      "乙得依民法第184條第1項前段請求損害賠償，因甲不慎摔壞乙的手機，侵害所有權並造成損害。不過甲沒有故意，所以侵權行為不成立，乙不得請求賠償。",
  },
  {
    id: "long_off_topic_keywords",
    expectedRange: [15, 35],
    answer:
      "民法第184條、第179條、第767條都很重要，請求權基礎應該依序檢查。法律行為、物權行為、債權行為、無權代理、無權處分、善意取得、買賣瑕疵、同時履行抗辯、解除契約、撤銷意思表示均為民法重要概念。考試時應大量引用法條並寫出完整體系，才能取得高分。甲乙丙丁間法律關係錯綜複雜，應全面討論所有制度。",
  },
  {
    id: "concise_but_complete",
    expectedRange: [79, 85],
    answer:
      "乙可依民法第184條第1項前段請求甲賠償。甲不慎摔壞乙所有手機，屬過失侵害乙所有權，並造成手機毀損之財產損害；該損害由甲摔壞行為所致，具因果關係。故乙得請求修復費或價值減損。",
  },
  {
    id: "conclusion_only_subsumption",
    expectedRange: [47, 62],
    shouldTriggerFlag: "conclusion_only_or_keyword_only_subsumption",
    answer:
      "乙得依民法第184條第1項前段請求甲賠償。權利侵害成立，故意或過失成立，損害成立，因果關係成立，所以侵權行為成立，乙得請求損害賠償。",
  },
  {
    id: "protected_two_position_reasoning",
    expectedRange: [68, 86],
    shouldNotTriggerCap: "major_contradiction_dimension_cap",
    answer:
      "乙得依民法第184條第1項前段請求甲賠償。若採甲說，認不慎仍屬過失，則甲摔壞乙所有手機侵害所有權，造成財產損害且具因果關係，乙得請求修復費或價值減損。若採乙說而嚴格要求更高注意義務違反，則可能認定不成立；惟本題甲不慎摔壞他人手機，仍以成立過失侵權較妥。",
  },
  {
    id: "concise_complete_no_doctrine",
    expectedRange: [79, 85],
    answer:
      "乙得依民法第184條第1項前段請求甲賠償。甲不慎摔壞乙所有手機，侵害乙所有權並造成手機毀損，甲之行為與損害間有因果關係，故乙得請求修復費或價值減損。",
  },
  {
    id: "advanced_complete_doctrine",
    expectedRange: [84, 92],
    answer:
      "乙得依民法第184條第1項前段請求甲負損害賠償責任。所有權為絕對權，屬該條保護之權利；甲不慎摔壞乙所有手機，客觀上侵害所有權，主觀上雖無故意，仍有過失。手機毀損造成乙財產減損，且與甲摔壞行為具有相當因果關係。損害填補上，依回復原狀與金錢賠償之制度目的，乙得請求修復費；若不能或顯有困難，則得請求價值減損。",
  },
  {
    id: "long_but_one_sentence_subsumption",
    expectedRange: [45, 62],
    answer:
      "民法第184條第1項前段涉及侵權行為責任，學理上通常會討論權利侵害、故意過失、不法性、損害、責任能力、因果關係及損害賠償範圍，也可能延伸至第213條以下之損害賠償方法。考試上應先建立請求權基礎，再檢查每個要件，並注意請求權競合及舉證責任。本題甲摔壞乙手機，所以以上要件均成立，乙可以請求賠償。",
  },
  {
    id: "wrong_article_correct_rule_subsumption",
    expectedRange: [70, 82],
    answer:
      "乙得依侵權行為損害賠償規範請求甲賠償，雖誤寫為民法第185條。甲不慎摔壞乙所有手機，侵害乙所有權；不慎代表至少有過失，手機毀損造成乙財產上損害，且損害由甲摔壞行為所致，具因果關係。故乙得請求修復費或價值減損。",
  },
];

const errorRevocationQuestion = "甲因重大誤認商品真實價格而向乙表示願以高價購買，事後發現錯誤。甲得否撤銷意思表示？";
const errorRevocationAnswer =
  "可以，但需要符合特定的法律條件。依據民法第88條規定，如果意思表示的內容有錯誤，或者表意人如果知道事實就不會做出這個表示，表意人可以將該意思表示撤銷。不過，甲想要成功撤銷，必須同時滿足以下兩個關鍵要件：第一，該錯誤在客觀上必須重要。商品的資格或物之性質，若在交易上認為重要者，其錯誤視為意思表示內容的錯誤。價格本身通常可能被歸類為動機錯誤，但如果甲的錯誤是源自於對商品本身真實價值或性質的重大誤認，這在交易上屬於重要的物之性質錯誤，可以視為意思表示內容的錯誤。第二，甲自己不能有過失。民法第88條第1項但書規定，錯誤必須非由表意人自己之過失者才可以撤銷。如果甲只是看錯標價或自己沒查證清楚，通常會被認定有過失而不能撤銷；如果是因乙的誤導或商品包裝標示讓人極易誤解，且甲已盡注意義務，才可能被認定為無過失。撤銷後，依民法第91條，意思表示可能自始無效，但甲仍可能須賠償乙信賴利益損害，除非乙明知其錯誤。";

function assert(condition: unknown, message: string) {
  if (!condition) throw new Error(message);
}

function sumDimensions(result: Awaited<ReturnType<typeof gradeCivilLawEssay>>) {
  return dimensionKeys.reduce((sum, key) => sum + result.dimension_scores[key].score, 0);
}

function element(importance: "high" | "medium" | "low", quality: number) {
  return {
    importance,
    coverage: quality,
    accuracy: quality,
    reasoning_quality: quality,
  };
}

function assertApprox(actual: number, expected: number, message: string, tolerance = 0.0001) {
  assert(Math.abs(actual - expected) <= tolerance, `${message}: expected ${expected}, got ${actual}`);
}

function runWeightingUnitTests() {
  const mostlyCoreComplete = calculateWeightedElementAverage([
    element("high", 1),
    element("high", 1),
    element("low", 0),
  ]);
  assert(mostlyCoreComplete > 0.85, "two complete high elements should keep weighted score high despite one missing low element");

  const coreMissing = calculateWeightedElementAverage([
    element("high", 0),
    element("low", 1),
    element("low", 1),
  ]);
  assert(coreMissing < 0.35, "one missing high element should not be offset by two complete low elements");

  assertApprox(
    calculateWeightedElementAverage([element("high", 0.6), element("medium", 0.6), element("low", 0.6)]),
    0.6,
    "same quality across importance levels should keep the same average",
  );
  assertApprox(
    calculateWeightedElementAverage([element("high", 1), element("medium", 1), element("low", 1)]),
    1,
    "all complete elements should stay complete",
  );
  assertApprox(
    calculateWeightedElementAverage([element("high", 0), element("medium", 0), element("low", 0)]),
    0,
    "all missing elements should stay zero",
  );
}

async function run() {
  runWeightingUnitTests();
  const results = new Map<string, Awaited<ReturnType<typeof gradeCivilLawEssay>>>();
  for (const item of cases) {
    const result = await gradeCivilLawEssay({ question, answer: item.answer });
    results.set(item.id, result);
    const dimensionSum = Math.round(sumDimensions(result) * 10) / 10;
    assert(dimensionSum === result.raw_total_score, `${item.id}: raw_total_score must equal sum of dimensions`);
    assert(result.deductions.every((deduction) => deduction.student_evidence.length > 0), `${item.id}: every deduction needs student evidence`);
    assert(
      result.raw_total_score >= item.expectedRange[0] && result.raw_total_score <= item.expectedRange[1],
      `${item.id}: expected ${item.expectedRange.join("-")}, got ${result.raw_total_score}`,
    );
    if (item.shouldTriggerCap) {
      assert(
        result.grading_diagnostics.score_caps.some((cap) => cap.score_cap_id === item.shouldTriggerCap && cap.applied),
        `${item.id}: should trigger score cap ${item.shouldTriggerCap}`,
      );
    }
    if (item.shouldNotTriggerCap) {
      assert(
        !result.grading_diagnostics.score_caps.some((cap) => cap.score_cap_id === item.shouldNotTriggerCap && cap.applied),
        `${item.id}: should not trigger score cap ${item.shouldNotTriggerCap}`,
      );
    }
    if (item.shouldTriggerFlag) {
      assert(
        result.grading_diagnostics.calibration_flags.includes(item.shouldTriggerFlag),
        `${item.id}: should trigger flag ${item.shouldTriggerFlag}`,
      );
    }
  }

  const high = results.get("high_complete_subsumption")!;
  const lawOnly = results.get("medium_law_only_no_subsumption")!;
  const contradiction = results.get("contradictory_conclusion")!;
  const longOffTopic = results.get("long_off_topic_keywords")!;
  const concise = results.get("concise_but_complete")!;
  const advanced = results.get("advanced_complete_doctrine")!;
  const wrongArticle = results.get("wrong_article_correct_rule_subsumption")!;

  assert(high.raw_total_score > lawOnly.raw_total_score + 20, "advanced subsumption should clearly beat law-only answer");
  assert(concise.raw_total_score > longOffTopic.raw_total_score + 40, "concise complete answer should beat long off-topic keyword answer");
  assert(lawOnly.dimension_scores.subsumption.score < high.dimension_scores.subsumption.score - 10, "law-only answer should lose meaningful subsumption points");
  assert(contradiction.dimension_scores.logical_consistency.score <= 1, "major contradiction should lose logical consistency points");
  assert(advanced.raw_total_score >= concise.raw_total_score + 3, "advanced answer should earn a modest depth premium");
  assert(wrongArticle.dimension_scores.claim_basis_and_legal_authority.score < concise.dimension_scores.claim_basis_and_legal_authority.score, "wrong article should lose legal authority points");

  const revocation = await gradeCivilLawEssay({ question: errorRevocationQuestion, answer: errorRevocationAnswer });
  assert(revocation.raw_total_score >= 70, `article 88 revocation answer should not be misgraded low, got ${revocation.raw_total_score}`);
  assert(
    revocation.question_analysis.expected_claim_bases.some((basis) => /88|錯誤|撤銷/.test(basis)),
    "article 88 question should use error revocation rubric",
  );
  assert(
    !revocation.question_analysis.expected_claim_bases.some((basis) => /瑕疵|債務不履行/.test(basis)),
    "article 88 question must not fall into sale defect rubric",
  );

  const explicitRubricRevocation = await gradeCivilLawEssay({
    question: "甲向乙購買商品時重大誤認價格，事後發現錯誤。甲得否撤銷意思表示？",
    answer: errorRevocationAnswer,
    rubricId: "civil_law_article_88_error_revocation",
  });
  assert(
    explicitRubricRevocation.question_analysis.expected_claim_bases.some((basis) => /88|錯誤|撤銷/.test(basis)),
    "explicit rubric_id must override confusing purchase wording",
  );
  assert(
    !explicitRubricRevocation.question_analysis.expected_claim_bases.some((basis) => /瑕疵|債務不履行/.test(basis)),
    "explicit rubric_id should prevent sale defect misclassification",
  );

  const unjustQuestion = "甲誤匯一萬元至乙帳戶，乙知情後拒絕返還。甲得否向乙請求返還？";
  const unjustCompleteDamage = await gradeCivilLawEssay({
    question: unjustQuestion,
    rubricId: "civil_law_unjust_enrichment_179",
    answer: "甲得依民法第179條請求乙返還。乙因甲誤匯一萬元至其帳戶而受有存款債權增加之利益；甲帳戶財產減少一萬元，受有同額損害。甲乙間無買賣、贈與或清償關係，故乙受有利益無法律上原因。乙知情後仍拒絕返還，應返還一萬元。",
  });
  assert(
    !unjustCompleteDamage.feedback_items.some((item) => /他人受.*損害/.test(item.issue_or_element) && item.feedback_type === "missing"),
    "complete damage discussion must not be listed as missing",
  );

  const unjustPartialDamage = await gradeCivilLawEssay({
    question: unjustQuestion,
    rubricId: "civil_law_unjust_enrichment_179",
    answer: "甲得依民法第179條請求乙返還。乙受有利益，甲受有損害，且無法律上原因。",
  });
  assert(
    unjustPartialDamage.feedback_items.some((item) => /他人受.*損害/.test(item.issue_or_element) && item.feedback_type === "partial"),
    "bare damage conclusion should be partial feedback, not missing",
  );
  assert(
    !unjustPartialDamage.feedback_items.some((item) => /他人受.*損害/.test(item.issue_or_element) && item.feedback_type === "missing"),
    "bare damage conclusion must not be treated as completely missing",
  );

  const terminologyOk = toLegacyFeedback(unjustCompleteDamage);
  assert(
    ![...terminologyOk.weaknesses, terminologyOk.revision_advice].some((item) => /最需要補強的是法律用語/.test(item)),
    "accurate legal terminology should not produce generic legal terminology weakness",
  );

  for (const result of [unjustCompleteDamage, unjustPartialDamage, high, explicitRubricRevocation]) {
    const legacy = toLegacyFeedback(result);
    assert(result.feedback_items.every((item) => item.feedback_type === "missing" || item.student_evidence), "incorrect/partial/complete feedback items need student evidence");
    assert(new Set([...legacy.weaknesses, ...legacy.next_practice_focus]).size === [...legacy.weaknesses, ...legacy.next_practice_focus].length, "weakness and practice focus should not repeat identical feedback");
  }

  const usedLaptopQuestion = "甲向乙購買中古筆電，乙承諾功能正常，交付後甲發現筆電無法開機。甲得否向乙主張權利？";
  const usedLaptopAnswer =
    "甲乙間成立中古筆電買賣契約。乙既承諾功能正常，交付後筆電卻無法開機，該筆電不具通常效用並不符合約定品質，屬物之瑕疵或不完全給付。該瑕疵與乙之給付義務相關，甲得依買賣瑕疵擔保或債務不履行規定，請求修補、解除契約、減少價金或損害賠償。";
  const usedLaptop = await gradeCivilLawEssay({
    question: usedLaptopQuestion,
    answer: usedLaptopAnswer,
    rubricId: "civil_law_sale_defect",
  });
  const usedLaptopFeedback = toLegacyFeedback(usedLaptop);
  const usedLaptopVisibleFeedback = [
    ...usedLaptopFeedback.weaknesses,
    ...usedLaptopFeedback.missing_points,
    ...usedLaptopFeedback.next_practice_focus,
    usedLaptopFeedback.revision_advice,
  ].join("\n");
  assert(!usedLaptopFeedback.weaknesses.some((item) => /買賣契約關係/.test(item)), "used laptop feedback must not list sale contract relationship as a main weakness");
  assert(!/沒有.*功能正常.*無法開機.*瑕疵|未.*功能正常.*無法開機.*瑕疵/.test(usedLaptopVisibleFeedback), "used laptop feedback must not deny the defect linkage the student wrote");
  assert(!usedLaptopFeedback.missing_points.some((item) => /買賣契約關係|物之瑕疵|不完全給付/.test(item)), "used laptop feedback must not list completed content as missing");
  assert(
    usedLaptop.feedback_items.some((item) => /物之瑕疵|不完全給付/.test(item.issue_or_element) && item.feedback_type === "complete"),
    "used laptop defect linkage should be treated as complete feedback",
  );

  const saleDefectRegressionCases = [
    {
      id: "sale_defect_high_quality",
      expectedRange: [82, 94],
      answer:
        "甲得依物之瑕疵擔保責任及不完全給付向乙主張權利。乙承諾交付功能正常之中古筆電，交付後卻無法開機，欠缺通常效用並欠缺約定品質，依民法第354條構成物之瑕疵，且屬保證品質不符。依民法第359條，甲得解除契約或請求減少價金；但若解除契約顯失公平，則僅得請求減少價金。因乙就品質有保證，甲並得依民法第360條請求不履行之損害賠償。另若乙明知或應知筆電故障仍交付，則給付不符債之本旨且可歸責於乙，構成民法第227條不完全給付；瑕疵可補正時得催告修補，不能補正或逾期未補正時得請求損害賠償或解除契約，若另造成資料毀損等衍生損害，並可能構成加害給付。行使上，甲應依民法第356條從速檢查並發現瑕疵即通知乙，且依民法第365條注意六個月短期期間。若標的為種類買賣，尚可能依民法第364條請求另行交付無瑕疵之物；惟本題為特定中古筆電，較難適用。瑕疵擔保與不完全給付可能競合，甲可依較有利者主張。",
    },
    {
      id: "sale_defect_concise_complete",
      expectedRange: [72, 82],
      answer:
        "甲得依民法第354條主張物之瑕疵擔保。乙承諾交付功能正常之筆電，但交付後無法開機，欠缺通常效用，屬物之瑕疵。依民法第359條，甲得解除契約或請求減少價金；若解除顯失公平，則僅得減少價金。",
    },
    {
      id: "sale_defect_law_only",
      expectedRange: [45, 62],
      shouldTriggerFlag: "conclusion_only_or_keyword_only_subsumption",
      answer:
        "民法第354條規定物之瑕疵擔保，民法第359條規定解除契約或減少價金，民法第360條規定損害賠償，民法第227條規定不完全給付。本題應依上述規定處理。",
    },
    {
      id: "sale_defect_secondary_only",
      expectedRange: [30, 50],
      answer:
        "甲應依民法第356條從速檢查並通知乙，否則視為承認所受領之物。另依民法第365條，解約或減價請求權有六個月短期期間。若為種類之債，依民法第364條可請求另行交付無瑕疵之物。",
    },
  ];

  const saleDefectRows = [];
  for (const item of saleDefectRegressionCases) {
    const result = await gradeCivilLawEssay({
      question: usedLaptopQuestion,
      answer: item.answer,
      rubricId: "civil_law_sale_defect",
    });
    saleDefectRows.push({
      case: item.id,
      raw_total: result.raw_total_score,
      caps: result.grading_diagnostics.score_caps.map((cap) => cap.score_cap_id).join(","),
      incorrect_articles: result.legal_authority_analysis.incorrect_articles.join(","),
      hallucinated: result.subsumption_analysis[0].elements.some((element) => element.hallucinated_fact),
    });
    assert(
      result.raw_total_score >= item.expectedRange[0] && result.raw_total_score <= item.expectedRange[1],
      `${item.id}: expected ${item.expectedRange.join("-")}, got ${result.raw_total_score}`,
    );
    if (item.shouldTriggerFlag) {
      assert(
        result.grading_diagnostics.calibration_flags.includes(item.shouldTriggerFlag),
        `${item.id}: should trigger flag ${item.shouldTriggerFlag}`,
      );
    }
    if (item.id === "sale_defect_high_quality") {
      assert(
        !result.grading_diagnostics.score_caps.some((cap) => cap.score_cap_id === "conclusion_only_subsumption_cap"),
        "high-quality sale defect answer must not trigger conclusion-only cap",
      );
      assert(result.legal_authority_analysis.incorrect_articles.length === 0, "correct sale defect articles must not be listed as incorrect");
      assert(
        result.subsumption_analysis[0].elements.every((element) => !element.hallucinated_fact),
        "quality warranty terms must not be marked as hallucinated fact",
      );
    }
  }
  console.log("\nSale defect regression");
  console.table(saleDefectRows);

  console.table(
    cases.map((item) => {
      const result = results.get(item.id)!;
      return {
        case: item.id,
        raw_total: result.raw_total_score,
        question: result.dimension_scores.question_understanding.score,
        issue: result.dimension_scores.issue_spotting.score,
        legal: result.dimension_scores.claim_basis_and_legal_authority.score,
        rule: result.dimension_scores.rule_explanation_and_legal_reasoning.score,
        subsumption: result.dimension_scores.subsumption.score,
        consistency: result.dimension_scores.logical_consistency.score,
        conclusion: result.dimension_scores.conclusion.score,
        coverage: result.grading_diagnostics.subsumption_coverage_average,
        caps: result.grading_diagnostics.score_caps.map((cap) => cap.score_cap_id).join(","),
      };
    }),
  );
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
