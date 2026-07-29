import { gradeCivilLawEssay } from "../src/lib/civil-law-grading/service";
import {
  calculateElementQuality,
  calculateUnweightedElementAverage,
  calculateWeightedElementAverage,
  getElementImportanceWeight,
} from "../src/lib/civil-law-grading/service";
import { dimensionKeys } from "../src/lib/civil-law-grading/config";

const question = "甲不慎將乙所有之手機摔壞，乙得向甲主張何種權利？";

const cases = [
  {
    id: "high_complete_subsumption",
    before: 88.2,
    answer:
      "乙得依民法第184條第1項前段向甲請求損害賠償。手機為乙所有，所有權屬民法保護之權利；甲不慎將手機摔壞，客觀上侵害乙所有權，主觀上雖非故意，仍至少違反注意義務而有過失。手機毀損造成乙財產上損害，且該損害係由甲摔壞行為直接造成，具有相當因果關係。縱認損害範圍需再細分，乙仍得依回復原狀或金錢賠償之法理，請求修復費或價值減損。",
  },
  {
    id: "medium_law_only_no_subsumption",
    before: 52.8,
    answer:
      "民法第184條第1項前段規定，因故意或過失不法侵害他人權利者，負損害賠償責任。侵權行為應具備故意過失、不法侵害、損害及因果關係。本題應依該條處理。",
  },
  {
    id: "contradictory_conclusion",
    before: 64.9,
    answer:
      "乙得依民法第184條第1項前段請求損害賠償，因甲不慎摔壞乙的手機，侵害所有權並造成損害。不過甲沒有故意，所以侵權行為不成立，乙不得請求賠償。",
  },
  {
    id: "long_off_topic_keywords",
    before: 26.8,
    answer:
      "民法第184條、第179條、第767條都很重要，請求權基礎應該依序檢查。法律行為、物權行為、債權行為、無權代理、無權處分、善意取得、買賣瑕疵、同時履行抗辯、解除契約、撤銷意思表示均為民法重要概念。考試時應大量引用法條並寫出完整體系，才能取得高分。甲乙丙丁間法律關係錯綜複雜，應全面討論所有制度。",
  },
  {
    id: "concise_but_complete",
    before: 81.1,
    answer:
      "乙可依民法第184條第1項前段請求甲賠償。甲不慎摔壞乙所有手機，屬過失侵害乙所有權，並造成手機毀損之財產損害；該損害由甲摔壞行為所致，具因果關係。故乙得請求修復費或價值減損。",
  },
];

const saleDefectQuestion = "甲向乙購買中古筆電，乙承諾功能正常，交付後甲發現筆電無法開機。甲得否向乙主張權利？";

const saleDefectCases = [
  {
    id: "sale_defect_high_quality",
    answer:
      "甲得依物之瑕疵擔保責任及不完全給付向乙主張權利。乙承諾交付功能正常之中古筆電，交付後卻無法開機，欠缺通常效用並欠缺約定品質，依民法第354條構成物之瑕疵，且屬保證品質不符。依民法第359條，甲得解除契約或請求減少價金；但若解除契約顯失公平，則僅得請求減少價金。因乙就品質有保證，甲並得依民法第360條請求不履行之損害賠償。另若乙明知或應知筆電故障仍交付，則給付不符債之本旨且可歸責於乙，構成民法第227條不完全給付；瑕疵可補正時得催告修補，不能補正或逾期未補正時得請求損害賠償或解除契約，若另造成資料毀損等衍生損害，並可能構成加害給付。行使上，甲應依民法第356條從速檢查並發現瑕疵即通知乙，且依民法第365條注意六個月短期期間。若標的為種類買賣，尚可能依民法第364條請求另行交付無瑕疵之物；惟本題為特定中古筆電，較難適用。瑕疵擔保與不完全給付可能競合，甲可依較有利者主張。",
  },
  {
    id: "sale_defect_concise_complete",
    answer:
      "甲得依民法第354條主張物之瑕疵擔保。乙承諾交付功能正常之筆電，但交付後無法開機，欠缺通常效用，屬物之瑕疵。依民法第359條，甲得解除契約或請求減少價金；若解除顯失公平，則僅得減少價金。",
  },
  {
    id: "sale_defect_law_only",
    answer:
      "民法第354條規定物之瑕疵擔保，民法第359條規定解除契約或減少價金，民法第360條規定損害賠償，民法第227條規定不完全給付。本題應依上述規定處理。",
  },
  {
    id: "sale_defect_secondary_only",
    answer:
      "甲應依民法第356條從速檢查並通知乙，否則視為承認所受領之物。另依民法第365條，解約或減價請求權有六個月短期期間。若為種類之債，依民法第364條可請求另行交付無瑕疵之物。",
  },
];

async function run() {
  const rows = [];
  for (const item of cases) {
    const result = await gradeCivilLawEssay({ question, answer: item.answer });
    rows.push({
      case: item.id,
      before: item.before,
      after: result.raw_total_score,
      delta: Math.round((result.raw_total_score - item.before) * 10) / 10,
      coverage: result.grading_diagnostics.subsumption_coverage_average,
      caps: result.grading_diagnostics.score_caps.map((cap) => cap.score_cap_id).join(","),
      deductions: result.deductions.map((deduction) => deduction.deduction_reason_id).join(","),
    });
    console.log(`\n${item.id}`);
    console.table(dimensionKeys.map((key) => ({ dimension: key, score: result.dimension_scores[key].score })));
    console.table(result.subsumption_analysis[0].elements.map((element) => ({
      element: element.element,
      importance: element.importance,
      weight: getElementImportanceWeight(element.importance),
      coverage: element.coverage,
      accuracy: element.accuracy,
      reasoning: element.reasoning_quality,
      quality: Math.round(calculateElementQuality(element) * 1000) / 1000,
      weighted_contribution: Math.round(calculateElementQuality(element) * getElementImportanceWeight(element.importance) * 1000) / 1000,
    })));
    const elements = result.subsumption_analysis[0].elements;
    console.table([
      {
        metric: "unweighted_element_average",
        value: Math.round(calculateUnweightedElementAverage(elements) * 1000) / 1000,
      },
      {
        metric: "weighted_element_average",
        value: Math.round(calculateWeightedElementAverage(elements) * 1000) / 1000,
      },
      {
        metric: "unweighted_averageCoverage_for_caps",
        value: result.grading_diagnostics.subsumption_coverage_average,
      },
    ]);
  }
  console.log("\nSummary");
  console.table(rows);

  const saleRows = [];
  for (const item of saleDefectCases) {
    const result = await gradeCivilLawEssay({
      question: saleDefectQuestion,
      answer: item.answer,
      rubricId: "civil_law_sale_defect",
    });
    saleRows.push({
      case: item.id,
      score: result.raw_total_score,
      coverage: result.grading_diagnostics.subsumption_coverage_average,
      caps: result.grading_diagnostics.score_caps.map((cap) => cap.score_cap_id).join(","),
      incorrect_articles: result.legal_authority_analysis.incorrect_articles.join(","),
      hallucinated: result.subsumption_analysis[0].elements.some((element) => element.hallucinated_fact),
    });
    console.log(`\n${item.id}`);
    console.table(dimensionKeys.map((key) => ({ dimension: key, score: result.dimension_scores[key].score })));
    console.table(result.subsumption_analysis[0].elements.map((element) => ({
      element: element.element,
      importance: element.importance,
      weight: getElementImportanceWeight(element.importance),
      coverage: element.coverage,
      accuracy: element.accuracy,
      reasoning: element.reasoning_quality,
      quality: Math.round(calculateElementQuality(element) * 1000) / 1000,
      hallucinated: element.hallucinated_fact,
    })));
  }
  console.log("\nSale Defect Summary");
  console.table(saleRows);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
