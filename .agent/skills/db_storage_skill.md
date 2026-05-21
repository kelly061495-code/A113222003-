---
功能名稱: 雲端存檔技能 (DB Storage Skill)
版本編號: v1.0.0
修改日期: 2026-05-21
功能類型: 資料持久化技能
內容描述: 定義將訂單存入 Turso 雲端資料庫的邏輯。
---

# 技能：雲端存檔 (Persistence)

1. **業務目標**：賦予你透過 Database MCP 將訂單資料存入 Turso 雲端的能力。
2. **資料結構要求**：設計 `orders` 表格的 Schema，必須包含 `order_id` (字串), `item_name` (字串), `qty` (整數), `unit_price` (整數), `subtotal` (整數)，以及自動產生的 `created_at` 時間戳記。
3. **實作規範**：
   - 表格初始化 DDL: `CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY AUTOINCREMENT, order_id TEXT, item_name TEXT, qty INTEGER, unit_price INTEGER, subtotal INTEGER, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);`
   - 寫入 SQL: `INSERT INTO orders (order_id, item_name, qty, unit_price, subtotal) VALUES (?, ?, ?, ?, ?);`
