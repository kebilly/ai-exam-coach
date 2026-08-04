# GitHub Push 前安全檢查筆記

這份筆記用來確認專案推上 GitHub 前，沒有把本機機密、建置產物或暫存資料一起提交。

## 1. 確認 Git 狀態

```cmd
cd /d C:\Projects\LAW_KK
git status
```

請確認下列檔案或資料夾不要出現在 `Changes to be committed`：

```text
.env.local
.env
.next
node_modules
backups
output
tmp
```

如果它們只出現在 `Ignored files`，代表目前是安全的。

## 2. 確認機密檔沒有被 Git 追蹤

```cmd
git ls-files .env .env.local .next node_modules backups output tmp
```

正常情況應該沒有輸出。

## 3. 確認 .gitignore 有生效

```cmd
git check-ignore -v .env.local .env .next node_modules backups output tmp
```

正常情況會看到每一項都被 `.gitignore` 規則擋住。

## 4. 掃描目前 commit 是否有 API Key

```cmd
git grep -n -I "<OPENAI_KEY_PREFIX>" HEAD
git grep -n -I "<JWT_PREFIX>" HEAD
```

也可以搜尋環境變數名稱，但只出現變數名稱是正常的，不代表 key 外洩：

```text
process.env.OPENAI_API_KEY
process.env.SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

真正危險的是完整 key 值、JWT token、service_role key 或 `.env.local` 被提交。

## 5. 檢查 Git 歷史

```cmd
git log --oneline -5
```

如果要檢查所有歷史 commit：

```cmd
git grep -n -I "<OPENAI_KEY_PREFIX>" $(git rev-list --all)
git grep -n -I "<JWT_PREFIX>" $(git rev-list --all)
```

正常情況應該沒有實際 key 值輸出。

## 6. 確認本機與 GitHub 遠端一致

```cmd
git fetch origin
git status
```

如果看到：

```text
Your branch is up to date with 'origin/main'.
```

代表本機 main 與 GitHub main 同步。

也可以比較 commit hash：

```cmd
git ls-remote origin main
git rev-parse main
```

兩邊 hash 一致時，代表 GitHub 上的 main 就是本機這版。

## 7. 檢查 GitHub 遠端是否包含不該上傳的檔案

```cmd
git ls-tree -r --name-only origin/main | findstr /i ".env .next node_modules backups output tmp"
```

正常情況應該沒有輸出。

## 8. 用 GitHub 網頁檢查

打開 repo：

```text
https://github.com/kebilly/ai-exam-coach
```

確認檔案清單中沒有：

```text
.env.local
.env
.next
node_modules
backups
output
tmp
```

也可以用 GitHub 搜尋框搜尋：

```text
OPENAI_API_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

只看到 README 或程式中的變數名稱是正常的；如果看到完整 key 值，才是外洩。

## 9. 如果不小心提交 key 怎麼辦

只從檔案刪掉不夠，因為 key 可能還留在 Git 歷史中。請立即：

1. 到 OpenAI / Supabase 後台撤銷外洩 key。
2. 產生新的 key。
3. 更新 Vercel Environment Variables。
4. 視情況清理 Git 歷史。
5. 重新部署。

重點：只要真正的 key 曾經 push 到 GitHub，就應該視為已外洩並立刻換 key。
