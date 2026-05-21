---
功能名稱: LINE 推播發送技能 (LINE Messaging Skill)
版本編號: v1.0.0
修改日期: 2026-05-21
功能類型: 外部通知技能
內容描述: 使用 LINE Messaging API 發送推播訊息。
---

# 技能：LINE 推播發送

| 設定項目 | 內容說明 |
| :--- | :--- |
| **核心能力** | 對指定 LINE 用戶發送文字訊息 |
| **呼叫對象** | 呼叫名為 `line` 的 MCP 伺服器 |
| **使用工具** | 使用 `push_message` 工具（也就是 LINE 官方提供的「主動發送推播」功能） |
| **發送對象 (to)** | 系統自動讀取 `.env` 裡的 `DESTINATION_USER_ID`，不需要手動指定 |
| **發送內容 (text)** | 由流程 (Workflow) 傳入剛剛 Persona 產生的推播訊息文字 |
