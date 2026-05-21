---
功能名稱: 歷史紀錄查詢技能 (DB Query Skill)
版本編號: v1.0.0
修改日期: 2026-05-21
功能類型: 資料查詢技能
內容描述: 賦予 AI 查詢 Turso 雲端資料庫中歷史訂單的能力。
---

# 技能：歷史紀錄查帳

1. **業務目標**：賦予你『歷史紀錄查帳』的能力，能從 Turso 雲端抓取最近的訂單。
2. **實作規範**：
   - 查詢 SQL: `SELECT * FROM orders ORDER BY created_at DESC LIMIT 10;`
3. **工具整合**：呼叫 `database` MCP 伺服器的執行指令。
