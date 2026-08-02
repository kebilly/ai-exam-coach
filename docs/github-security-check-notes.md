# GitHub Push 前安全檢查筆記

這份筆記用來確認敏感資料沒有被 commit 或 push 到 GitHub。

## 1. 先看目前 Git 狀態

```cmd
cd /d C:\Projects\LAW_KK
git status
```

確認不要看到以下檔案或資料夾被加入：

```text
.env.local
.env
.next
node_modules
backups
output
```

如果這些檔案沒有出現在 `Changes to be committed`，通常就是安全的。

## 2. 確認敏感檔案沒有被 Git 追蹤

```cmd
git ls-files .env .env.local .next node_modules backups output
```

安全結果：沒有任何輸出。

## 3. 檢查 .gitignore 是否有生效

```cmd
git check-ignore -v .env.local .env .next node_modules backups output
```

安全結果：每一行都會顯示被 `.gitignore` 哪一條規則忽略。

## 4. 掃描目前版本是否有 API Key

```cmd
git grep -n -I "sk-proj" HEAD
git grep -n -I "eyJhbGci" HEAD
```

安全結果：沒有任何真正 key 輸出。

注意：看到以下文字是正常的，這只是環境變數名稱，不是 key：

```text
process.env.OPENAI_API_KEY
process.env.SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

## 5. 掃描完整 Git 歷史

```cmd
git log --oneline -5
```

確認最近 commit 正確。

進階掃描：

```cmd
git grep -n -I "sk-proj" $(git rev-list --all)
git grep -n -I "eyJhbGci" $(git rev-list --all)
```

安全結果：沒有任何真正 key 輸出。

## 6. 確認本機和 GitHub 遠端一致

```cmd
git fetch origin
git status
```

安全結果：

```text
Your branch is up to date with 'origin/main'.
```

確認遠端 main commit：

```cmd
git ls-remote origin main
git rev-parse main
```

兩個 commit hash 一樣，代表 GitHub 遠端和本機 main 一致。

## 7. 檢查 GitHub 遠端分支是否包含敏感檔

```cmd
git ls-tree -r --name-only origin/main | findstr /i ".env .next node_modules backups output"
```

安全結果：沒有任何輸出。

## 8. 用 GitHub 網頁檢查

打開 repo：

```text
https://github.com/kebilly/ai-exam-coach
```

檢查檔案列表不要有：

```text
.env.local
.env
.next
node_modules
backups
output
```

再用 GitHub 搜尋：

```text
sk-proj
eyJhbGci
OPENAI_API_KEY
SUPABASE_SERVICE_ROLE_KEY
```

看到變數名稱正常；看到真正長串 key 才是外洩。

## 9. 若不小心外洩怎麼辦

不要只刪檔案重新 commit，因為 key 可能仍在 Git 歷史。

應立即：

1. 到 OpenAI / Supabase 後台撤銷舊 key。
2. 建立新的 key。
3. 更新 Vercel Environment Variables。
4. 必要時清理 Git 歷史。
5. 重新部署。

最安全原則：只要真正 key 曾經 push 到公開 GitHub，就當成已外洩處理。
