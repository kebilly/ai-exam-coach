from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import PageBreak, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

OUT_DIR = Path("output/pdf")
OUT_DIR.mkdir(parents=True, exist_ok=True)
PDF_PATH = OUT_DIR / "localhost-troubleshooting-notes.pdf"

FONT = r"C:\Windows\Fonts\msjh.ttc"
FONT_BOLD = r"C:\Windows\Fonts\msjhbd.ttc"
pdfmetrics.registerFont(TTFont("MSJH", FONT))
pdfmetrics.registerFont(TTFont("MSJH-Bold", FONT_BOLD))

styles = getSampleStyleSheet()
base = ParagraphStyle(
    "BaseZH",
    parent=styles["Normal"],
    fontName="MSJH",
    fontSize=10.5,
    leading=16,
    textColor=colors.HexColor("#1e293b"),
    spaceAfter=6,
)
title = ParagraphStyle(
    "TitleZH",
    parent=base,
    fontName="MSJH-Bold",
    fontSize=22,
    leading=28,
    alignment=TA_CENTER,
    textColor=colors.HexColor("#0f172a"),
    spaceAfter=10,
)
subtitle = ParagraphStyle(
    "SubtitleZH",
    parent=base,
    fontSize=11.5,
    leading=18,
    alignment=TA_CENTER,
    textColor=colors.HexColor("#475569"),
    spaceAfter=16,
)
h1 = ParagraphStyle(
    "H1ZH",
    parent=base,
    fontName="MSJH-Bold",
    fontSize=15,
    leading=22,
    textColor=colors.HexColor("#075985"),
    spaceBefore=10,
    spaceAfter=8,
)
h2 = ParagraphStyle(
    "H2ZH",
    parent=base,
    fontName="MSJH-Bold",
    fontSize=12,
    leading=18,
    textColor=colors.HexColor("#0f172a"),
    spaceBefore=6,
    spaceAfter=4,
)
small = ParagraphStyle("SmallZH", parent=base, fontSize=9, leading=13, textColor=colors.HexColor("#64748b"))
code = ParagraphStyle(
    "CodeZH",
    parent=base,
    fontName="Courier",
    fontSize=9.2,
    leading=13.5,
    textColor=colors.HexColor("#0f172a"),
    backColor=colors.HexColor("#f1f5f9"),
    borderPadding=6,
    spaceBefore=4,
    spaceAfter=8,
)


def p(text, style=base):
    return Paragraph(text.replace("\n", "<br/>"), style)


def bullets(items):
    return [p("• " + item, base) for item in items]


def codeblock(text):
    return p(text, code)


def footer(canvas, doc):
    canvas.saveState()
    canvas.setFont("MSJH", 8)
    canvas.setFillColor(colors.HexColor("#64748b"))
    canvas.drawString(18 * mm, 12 * mm, "AI Exam Coach 本機 localhost 筆記")
    canvas.drawRightString(192 * mm, 12 * mm, f"Page {doc.page}")
    canvas.restoreState()


story = []
story.append(p("本機 localhost 連線與 Next.js 快取排查筆記", title))
story.append(p("適用專案：C:\\Projects\\LAW_KK｜網址：http://localhost:4000", subtitle))
story.append(p("這份筆記整理目前最常遇到的狀況：突然連不上、一直載入中、Cannot find module ./xxx.js、以及 dev/build 使用規則。"))

story.append(p("一、每天開發時的標準啟動流程", h1))
story.append(p("打開新的 terminal，依序輸入："))
story.append(codeblock("cd /d C:\\Projects\\LAW_KK\nset NODE_OPTIONS=--use-system-ca\nnpm run dev -- -p 4000"))
story.append(p("啟動成功後，開："))
story.append(codeblock("http://localhost:4000/login"))
story.append(p("不要開 3000。這個專案目前固定用 4000 來避開 Windows port 問題。"))

story.append(p("二、為什麼會突然連不上？", h1))
story.extend(
    bullets(
        [
            "dev server 沒有在跑：terminal 關掉、電腦重開、程序當掉，都會讓 localhost 無法連線。",
            "同時跑 dev 和 build：Next.js 會共用 .next 資料夾，容易造成 chunk 遺失。",
            ".next 快取壞掉：常見錯誤是 Cannot find module ./331.js 或 ./xxx.js。",
            "防毒軟體掃描 .next 或 node_modules：可能造成暫存檔被鎖住或隔離。",
            "舊的 node 程序殘留：看起來有 server，但其實已經壞掉或拿到舊 bundle。",
        ]
    )
)

story.append(p("三、快速判斷 server 有沒有活著", h1))
story.append(codeblock("curl -I http://localhost:4000/"))
story.append(p("如果看到 HTTP/1.1 200 OK，代表 server 有回應。如果 Failed to connect，代表 4000 沒有服務在跑。"))

story.append(p("四、連不上時的安全修復流程", h1))
story.append(p("先找出這個專案自己的 Next/node 程序："))
story.append(
    codeblock(
        "Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like '*C:\\Projects\\LAW_KK*' -and ($_.CommandLine -like '*next*' -or $_.CommandLine -like '*npm*') } | Select-Object ProcessId,CommandLine"
    )
)
story.append(p("確認 ProcessId 屬於 C:\\Projects\\LAW_KK 後，再停止對應 PID："))
story.append(codeblock("Stop-Process -Id 12345,67890 -Force"))
story.append(p("再清除 .next 快取並重啟："))
story.append(codeblock("cd /d C:\\Projects\\LAW_KK\nrmdir /s /q .next\nset NODE_OPTIONS=--use-system-ca\nnpm run dev -- -p 4000"))

story.append(PageBreak())
story.append(p("五、看到 Cannot find module ./xxx.js 怎麼辦？", h1))
story.append(p("這幾乎就是 .next 快取或 dev/build 衝突。照下面做："))
story.extend(
    bullets(
        [
            "先停止本專案的 dev server。",
            "刪除 C:\\Projects\\LAW_KK\\.next。",
            "重新啟動 npm run dev -- -p 4000。",
            "瀏覽器按 Ctrl + F5 強制重新整理。",
        ]
    )
)
story.append(p("重點：這通常不是程式碼本身壞掉，而是 Next.js 開發快取壞掉。"))

story.append(p("六、dev 與 build 的使用規則", h1))
data = [
    ["情境", "正確做法"],
    ["本機開發、測 UI", "只跑 npm run dev -- -p 4000"],
    ["要測部署前 build", "先停 dev server，再跑 npm run build"],
    ["build 完要繼續開發", "重新跑 npm run dev -- -p 4000"],
    ["看到缺 chunk", "停 dev、刪 .next、重新 dev"],
]
table = Table(data, colWidths=[45 * mm, 120 * mm])
table.setStyle(
    TableStyle(
        [
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#dbeafe")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#0f172a")),
            ("FONTNAME", (0, 0), (-1, 0), "MSJH-Bold"),
            ("FONTNAME", (0, 1), (-1, -1), "MSJH"),
            ("FONTSIZE", (0, 0), (-1, -1), 9.5),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f8fafc")]),
            ("TOPPADDING", (0, 0), (-1, -1), 7),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ]
    )
)
story.append(table)

story.append(p("七、防毒軟體建議", h1))
story.append(p("不要關掉整套防毒。若常常在 build 或 dev 時出現缺檔，可以只把下列資料夾加入排除清單："))
story.append(codeblock("C:\\Projects\\LAW_KK\\.next\nC:\\Projects\\LAW_KK\\node_modules"))
story.append(p("較保守的做法是只排除這兩個資料夾，不要整台電腦都關防護。"))

story.append(p("八、部署到 Zeabur 後會改善什麼？", h1))
story.extend(
    bullets(
        [
            "正式網址不需要你本機一直開著 dev server。",
            "同事使用 Zeabur 網址時，不會受你本機 terminal 關閉影響。",
            "Zeabur 會用 production build，比本機 dev server 穩定。",
            "本機仍可作為開發與測試環境。",
        ]
    )
)

story.append(p("九、一句話記法", h1))
story.append(p("本機連不上，先看 4000 有沒有 server；看到 Cannot find module，就停 dev、刪 .next、重開。要 build 前先停 dev。", h2))

story.append(Spacer(1, 8))
story.append(p("版本：本機開發筆記 v1｜整理給 AI Exam Coach MVP 使用", small))

doc = SimpleDocTemplate(
    str(PDF_PATH),
    pagesize=A4,
    leftMargin=18 * mm,
    rightMargin=18 * mm,
    topMargin=18 * mm,
    bottomMargin=18 * mm,
    title="localhost troubleshooting notes",
)
doc.build(story, onFirstPage=footer, onLaterPages=footer)
print(PDF_PATH.resolve())
