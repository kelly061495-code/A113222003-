---
功能名稱: 會員專屬折扣規則 (Member Discount)
版本編號: v1.0.0
修改日期: 2026-04-30
功能類型: 業務執行規則
內容描述: 定義顧客登入會員後所享有的固定折扣比例。
---

# 業務規則：會員折扣 (Member Discount)

## 1. 基礎實作規劃

為了提升會員忠誠度，系統需判斷會員登入狀態以給予折扣：

- **登入判斷**：顧客於結帳前可輸入手機號碼進行會員登入。
- **折扣內容**：確認為登入會員後，全單享 **95 折** 優惠 (5% off)。

## 2. 進階實作規格 (AI好理解版)

### 折扣運算矩陣 (Discount Logic)

| 條件 (Condition) | 計算公式 (Formula) | 優先級 (Priority) |
| :--- | :--- | :--- |
| `member.isLoggedIn == true` | `Net_Total = Net_Total * 0.95` | 高 (於促銷碼之前計算) |
| `member.isLoggedIn == false`| `Net_Total = Net_Total * 1.00` | 無 |
