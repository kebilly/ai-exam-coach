# AI Exam Coach｜郵局內升考試 AI 練習教練

AI Exam Coach 是一個可部署的考試練習 MVP，聚焦於郵局內升考試準備情境，整合民法申論批改、英文完整考卷練習、郵政法規練習、會員啟用控管、每日使用額度、學習紀錄與管理後台。

本專案不是單純的 AI Demo，而是以「真實考生練習流程」為核心設計的 AI 產品原型。它展示如何把 LLM 工作流、結構化評分、資料庫權限控管、API 成本保護與後台管理整合成可實際使用的學習系統。

- GitHub: [kebilly/ai-exam-coach](https://github.com/kebilly/ai-exam-coach)
- Live Demo: [ai-exam-coach-beta.vercel.app](https://ai-exam-coach-beta.vercel.app/)
- 專案狀態：可部署 MVP / Production Prototype，適合小規模封閉測試與作品集展示

## 系統畫面

### 平台總覽

![Platform overview](docs/images/overview.png)

### 民法申論批改 Demo

![Civil law grading demo](docs/images/civil-law-grading-demo.png)

### 英文完整考卷 Demo

![English exam demo](docs/images/english-exam-demo.png)

### 郵政法規練習 Demo

![Postal rules demo](docs/images/postal-rules-demo.png)

### 會員登入與權限控管

![Login access control](docs/images/login-access-control.png)

## 專案動機

這個專案要解決的問題不是「用 AI 產生題目」而已，而是建立一個能被考生真正拿來練習、並能被管理者控管成本與使用權限的 AI 學習產品。

核心目標包括：

- 協助考生在有限時間內反覆練習
- 針對民法申論答案提供具體批改與補強方向
- 依照郵局內升考試情境提供英文與郵政法規練習
- 避免未授權使用者呼叫正式 API，降低 token 成本風險
- 保留學習紀錄，方便後續檢視練習成果
- 展示 AI Strategy、產品規劃、系統架構與落地實作能力

## 核心功能

### 1. 民法申論 AI 批改

- 支援民法申論題與學生答案輸入
- 支援經驗證的隨機民法申論題，題目敘述較完整，接近考試情境
- 提供總分、爭點、法條、論證與結論等分數卡
- 回饋包含優點、弱點、缺漏重點、修改建議與示範答題架構
- 支援手寫答案 OCR 上傳辨識
- 使用結構化 JSON 評分結果，並以 legacy adapter 維持前端顯示穩定
- 建立 anchor answers、diagnostics、score caps 與 regression tests，降低評分漂移

### 2. 英文完整考卷練習

- 產生完整英文考卷，而不是單題式短題目
- 題型包含字彙、文法、克漏字、閱讀與翻譯導向練習
- 依考試職階調整題型與難度
- 提供中文解析，方便考生快速檢討
- 翻譯題採段落型題目設計，難度更接近歷年考題，但避免直接複製考古題

### 3. 郵政法規練習

- 涵蓋郵政法、郵政儲金匯兌法、簡易人壽保險法、郵件處理規則與郵務營業規章
- 依職階支援不同作答型態：
  - 專業職二升專業職一：以選擇題為主
  - 專業職一升營運職：填充與問答型練習
- 建立來源導向的 seed 題庫與審核狀態
- 保留作答紀錄並套用每日使用限制

### 4. 會員啟用與使用限制

- 使用 Supabase Auth 進行註冊與登入
- 正式練習 API 需要 member 或 admin 權限
- 管理者可啟用或停用使用者
- 邀請碼以 hash 形式儲存，避免明碼外洩
- Demo 頁面以展示流程為主，避免未授權使用者消耗正式 API

### 5. 管理後台

- 查看使用者、角色、方案與啟用狀態
- 啟用或停用正式會員權限
- 升級或降級管理者角色
- 產生與停用邀請碼
- 依使用者檢視民法、英文、郵政法規與 AI 使用紀錄
- 必要時刪除單筆練習或使用紀錄

## 系統架構

```text
Next.js App Router
  |
  |-- Public Demo Pages
  |     |-- Civil Law Demo
  |     |-- English Demo
  |     |-- Postal Regulations Demo
  |
  |-- Member Pages
  |     |-- Dashboard
  |     |-- Civil Law Practice
  |     |-- English Exam Practice
  |     |-- Postal Regulations Practice
  |     |-- History
  |
  |-- Admin Pages
  |     |-- User Management
  |     |-- Invite Codes
  |     |-- Practice Records
  |
  |-- API Routes
        |-- /api/law/grade
        |-- /api/law/ocr
        |-- /api/english/generate
        |-- /api/english/submit
        |-- /api/postal-rules/start
        |-- /api/postal-rules/submit
        |-- /api/profile/unlock
        |-- /api/admin/*

Supabase
  |-- Auth
  |-- PostgreSQL
  |-- Row Level Security

OpenAI API
  |-- Civil law grading
  |-- OCR support
```

## 民法評分設計

民法申論批改模組位於：

```text
src/lib/civil-law-grading/
```

主要檔案：

```text
config.ts          評分維度、權重、score caps 與版本設定
schema.ts          結構化 JSON 評分輸出 schema
service.ts         評分流程、rubric 選擇、element evaluation 與分數計算
prompts.ts         民法批改 prompt 分層
anchors.ts         高分、中等、低分 anchor answers
legacy-adapter.ts  將結構化評分結果轉成前端分數卡資料
```

評分設計重點：

- 正式評分前先選擇題目對應 rubric
- 以 element-level subsumption 分析涵攝品質
- ElementSpec importance 會影響涵攝主分
- 總分由程式加總，不讓模型自行任意給分
- 對重大缺陷使用 score cap 控制分數上限
- 扣分原因綁定 evidence，提升可解釋性
- 透過 regression diagnostics 維持評分穩定

這樣的設計能避免模型只憑語感給分，也讓批改規則更容易測試、校準與維護。

## 技術棧

- Framework: Next.js App Router
- Language: TypeScript
- UI: React, Tailwind CSS, lucide-react
- Backend: Next.js API Routes
- Auth / Database: Supabase Auth, PostgreSQL
- AI: OpenAI API
- Validation: Zod
- Deployment: Vercel
- Testing / Diagnostics: TypeScript regression tests 與 diagnostic scripts

## 安全與 API Key 管理

本專案將前端可公開設定與後端機密變數分離。

前端可公開變數：

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_SITE_URL
```

後端專用機密變數：

```text
SUPABASE_SERVICE_ROLE_KEY
OPENAI_API_KEY
OPENAI_MODEL
```

正式 API 具備以下保護：

- 驗證 Supabase session
- 檢查 member / admin 權限
- 套用每日使用限制
- OpenAI API 只在 server-side 呼叫
- 前端不暴露 OpenAI API Key
- 管理功能僅限 admin 路由使用

以下敏感或本機產物不應進入 Git：

```text
.env
.env.local
.next
node_modules
backups
output
tmp
.vercel
```

GitHub 安全檢查筆記：

```text
docs/github-security-check-notes.md
```

## 資料庫設計

資料庫 schema 與安全設定位於：

```text
supabase/schema.sql
supabase/security-hardening.sql
```

主要資料表：

```text
user_profiles
law_submissions
english_exercises
postal_rule_attempts
postal_rule_questions
usage_logs
member_invite_codes
```

資料庫支援：

- 使用者 profile、role 與 plan 控制
- 練習紀錄保存
- 使用量紀錄
- 邀請碼 hash 儲存
- RLS 使用者資料隔離
- admin server-side 管理操作

## 環境變數

請依 `.env.example` 建立 `.env.local`。

本機必要變數：

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:4000
DAILY_USAGE_LIMIT=10
LAW_DAILY_LIMIT=2
LAW_OCR_DAILY_LIMIT=3
ENGLISH_DAILY_LIMIT=2
POSTAL_RULES_DAILY_LIMIT=2
UNLOCK_ATTEMPT_DAILY_LIMIT=10
DEMO_API_ENABLED=false
```

Vercel 部署時，請在 Project Settings > Environment Variables 中設定相同變數。不要提交 `.env.local`。

## 本機啟動

安裝依賴：

```cmd
npm install
```

啟動開發伺服器：

```cmd
npm run dev -- -p 4000
```

本機網址：

```text
http://localhost:4000
```

常用頁面：

```text
http://localhost:4000/
http://localhost:4000/demo/law
http://localhost:4000/demo/english
http://localhost:4000/demo/postal-rules
http://localhost:4000/dashboard
http://localhost:4000/admin
```

## 驗證與測試

TypeScript 檢查：

```cmd
npx tsc --noEmit --incremental false
```

民法 regression tests：

```cmd
npm run test:civil-law
```

民法 diagnostic report：

```cmd
npm run diagnose:civil-law
```

Production build：

```cmd
npm run build
```

建議不要在 `npm run dev` 執行中同時執行 `npm run build`，避免 `.next` 快取或鎖檔造成錯誤。

## 部署流程

目前部署平台：

```text
Vercel
```

典型流程：

```cmd
git status
git add .
git commit -m "Update feature"
git push
```

當 GitHub `main` branch 更新後，Vercel 會自動重新部署。若只修改 Vercel 環境變數，需手動 Redeploy。

## 履歷與作品集展示重點

推薦放入履歷或作品集的畫面：

1. `docs/images/overview.png`
   展示完整產品定位：三大練習模組、會員啟用與每日使用限制。

2. `docs/images/civil-law-grading-demo.png`
   展示 AI 批改核心價值：分數卡、爭點、法條、論證、優點與改善建議。

3. `docs/images/postal-rules-demo.png`
   展示不只是聊天機器人，而是能擴充到考試科目的練習系統。

## 專案亮點

本專案展示：

- 從真實考試痛點出發的 AI 產品規劃
- 不只是 chatbot 的 LLM workflow 設計
- 民法申論 rubric、評分校準與 regression protection
- prompt、schema、scoring、adapter 分層設計
- 會員啟用、API 成本控管與每日額度限制
- Supabase Auth、PostgreSQL 與 RLS 整合
- 管理後台與使用紀錄可視化
- 可部署的 Next.js / Vercel 架構
- 以 MVP 方式快速落地並持續校準品質

## 限制與聲明

- 民法批改僅供考試練習與學習回饋使用，不構成法律意見。
- 郵政法規題目在正式高風險使用前，仍應依最新官方法規與考試公告人工確認。
- 本版本以小規模封閉測試與作品集展示為主要目標，不適合未限制流量的公開大量使用。
- 民法批改品質取決於已驗證 rubric 覆蓋範圍；未支援題型可能需要新增 rubric 或人工校準。
