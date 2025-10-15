## ✨ 功能特色

### 🎯 核心功能

- **儀表板分析**
  - 實時 KPI 監控（用戶數、車輛數、行程數）
  - 可自定義時間基準的成長趨勢分析
  - 營收趨勢圖表（日/月/年）
  - 付款方式分布統計（信用卡/點數）

- **用戶管理**
  - 乘客和車主資料管理
  - 用戶搜尋和篩選
  - 查看用戶詳細資訊
  - 關聯行程和車輛查詢

- **車輛管理**
  - 車輛狀態監控（可用/使用中/維護/已停用）
  - 電池狀態視覺化顯示
  - Google Maps 位置追蹤
  - 車輛狀態即時更新

- **行程詳細**
  - 完整行程列表
  - 多維度搜尋（行程ID、用戶、車輛、車牌、型號）
  - 起終點位置查看（Google Maps 整合）
  - 行程狀態統計

- **退款管理**
  - 退款申請處理
  - 支援核准、拒絕、暫緩三種處理方式
  - 可自定義退款金額和點數
  - 處理原因記錄



## 🛠️ 技術棧

### 前端
- **React 18.2.0** - UI 框架
- **React Router 6** - 路由管理
- **Recharts** - 數據視覺化
- **Axios** - HTTP 客戶端
- **Lucide React** - 圖標庫

### 後端
- **Node.js** - 運行環境
- **Express** - Web 框架
- **MySQL** - 資料庫
- **JSON Web Token** - 身份驗證
- **bcrypt** - 密碼加密
- **CORS** - 跨域資源共享

---

## 🏗️ 系統架構
```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│             │         │             │         │             │
│   React     │────────▶│   Express   │────────▶│    MySQL    │
│   Frontend  │  HTTP   │   Backend   │   SQL   │   Database  │
│             │◀────────│             │◀────────│             │
└─────────────┘  JSON   └─────────────┘  Data   └─────────────┘
      │
      │ JWT Token
      │
      ▼
┌─────────────┐
│             │
│  LocalStorage│
│   (Auth)    │
│             │
└─────────────┘
```

---

## 🚀 快速開始

### 前置需求

- Node.js >= 16.0.0
- MySQL >= 8.0
- npm 或 yarn

### 快速安裝
```bash
# 1. Clone 專案
git clone <repository-url>
cd taxi-admin-platform

# 2. 安裝依賴
cd backend && npm install
cd ../frontend && npm install

# 3. 設定資料庫（見下方詳細步驟）

# 4. 啟動應用
# Terminal 1 - 後端
cd backend && npm start

# Terminal 2 - 前端
cd frontend && npm start
```

---

## 📦 安裝步驟

### 1. 安裝後端依賴
```bash
cd backend
npm install
```

**依賴包清單：**
```json
{
  "express": "^4.18.2",
  "mysql2": "^3.6.0",
  "cors": "^2.8.5",
  "dotenv": "^16.3.1",
  "jsonwebtoken": "^9.0.2",
  "bcrypt": "^5.1.1"
}
```

### 2. 安裝前端依賴
```bash
cd frontend
npm install
```

**依賴包清單：**
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.14.2",
  "axios": "^1.4.0",
  "recharts": "^2.8.0",
  "lucide-react": "^0.263.1"
}
```

---


## ⚙️ 環境配置

### 後端環境變數

創建 `backend/.env` 檔案：
```env
# 伺服器設定
PORT=5000
NODE_ENV=development

# 資料庫設定
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=taxi_booking_db
DB_PORT=3306

# JWT 設定
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRES_IN=7d

# CORS 設定
ALLOWED_ORIGINS=http://localhost:3000
```

### 前端環境變數

創建 `frontend/.env` 檔案：
```env
REACT_APP_API_URL=http://localhost:5000/api
```

**⚠️ 重要提醒：**
- 請勿將 `.env` 檔案提交到 Git
- 生產環境請更換 `JWT_SECRET` 為安全的隨機字串
- 確保 `.gitignore` 包含 `.env` 檔案

---

## 🎬 啟動應用

### 方法一：分別啟動（推薦開發時使用）

**Terminal 1 - 啟動後端：**
```bash
cd backend
npm start
```
後端將運行在 `http://localhost:5000`

**Terminal 2 - 啟動前端：**
```bash
cd frontend
npm start
```
前端將自動開啟瀏覽器 `http://localhost:3000`

### 方法二：使用 nodemon（開發模式）

**後端使用 nodemon：**
```bash
cd backend
npm install -g nodemon
nodemon server.js
```

---

## 👤 創建管理員

系統首次啟動時需要創建管理員帳號。提供以下三種方法：

### 方法 1：使用瀏覽器 Console（最簡單）

1. 打開瀏覽器訪問 `http://localhost:3000`
2. 按 `F12` 打開開發者工具
3. 切換到 **Console** 標籤
4. 貼上以下代碼並按 Enter：
```javascript
fetch('http://localhost:5000/api/auth/create-admin', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'admin',
    password: 'admin123',
    email: 'admin@example.com',
    name: 'admin'
  })
})
.then(res => res.json())
.then(data => {
  console.log('✅ 創建成功:', data);
  alert('管理員創建成功！');
})
.catch(err => console.error('❌ 創建失敗:', err));
```

### 方法 2：使用 PowerShell
```powershell
$body = @{
    username = "admin"
    password = "admin123"
    email = "admin@example.com"
    name = "admin"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/create-admin" -Method POST -ContentType "application/json" -Body $body
```

### 方法 3：使用 curl（Mac/Linux）
```bash
curl -X POST http://localhost:5000/api/auth/create-admin \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123",
    "email": "admin@example.com",
    "name": "admin"
  }'
```

### 登入系統

創建完成後：
1. 訪問 `http://localhost:3000/login`
2. 輸入帳號密碼登入
   - 帳號：`admin`
   - 密碼：`admin123`

---

## 📖 功能說明

### 1. 儀表板（Dashboard）

**路徑：** `/dashboard`

**功能：**
- 📊 KPI 總覽卡片（用戶數、車主數、車輛數、行程數）
- 📈 成長趨勢分析
  - 可選擇時間類型（日/週/月/年）
  - 可自定義基準日期
  - 顯示行程數和營收增長百分比
- 💰 營收趨勢圖表
  - 支援日/月/年視圖
  - 互動式折線圖
- 💳 付款方式分布
  - 甜甜圈圖視覺化
  - 顯示信用卡和點數比例

**操作：**
1. 選擇時間類型（日/週/月/年）
2. 選擇基準日期（或使用今天）
3. 點擊「應用」按鈕查看數據

---

### 2. 退款管理（Refund Management）

**路徑：** `/refunds`

**功能：**
- 查看所有退款申請
- 狀態篩選（待處理/已核准/已拒絕/暫緩/已取消）
- 多種搜尋方式（用戶ID/行程ID/用戶名稱）
- 處理退款申請

**操作：**
1. 使用篩選器或搜尋功能查找退款申請
2. 點擊「處理」按鈕
3. 填寫核准金額、點數和處理原因
4. 選擇「核准」、「暫緩」或「拒絕」

---

### 3. 用戶管理（User Management）

**路徑：** `/users`

**功能：**
- 查看乘客和車主列表
- 類型切換（乘客/車主）
- 搜尋功能（ID/姓名/電話/郵箱）
- 查看用戶詳細資訊
- 查看關聯行程和車輛

**操作：**
1. 選擇用戶類型（乘客或車主）
2. 使用搜尋功能查找用戶
3. 點擊「查看詳細」查看完整資訊
4. 查看用戶的所有行程或車輛

---

### 4. 車輛管理（Vehicle Management）

**路徑：** `/vehicles`

**功能：**
- 車輛狀態統計卡片
- 狀態篩選（可用/使用中/維護/已停用）
- 搜尋功能（車牌/型號/車主）
- 電池狀態視覺化
- Google Maps 位置查看
- 即時更新車輛狀態

**操作：**
1. 使用篩選器或搜尋功能查找車輛
2. 點擊「查看地圖」查看車輛位置
3. 點擊「更新狀態」修改車輛狀態

---

### 5. 行程詳細（Trip Details）

**路徑：** `/trips`

**功能：**
- 行程統計卡片
- 狀態篩選
- 多維度搜尋（行程ID/用戶/車輛/車牌/型號）
- 查看行程詳細資訊
- Google Maps 起終點查看

**操作：**
1. 使用篩選器或搜尋功能查找行程
2. 點擊「查看」查看詳細資訊
3. 點擊地圖按鈕查看起終點位置

---

## 📁 目錄結構
```
taxi-admin-platform/
│
├── backend/                    # 後端目錄
│   ├── config/
│   │   └── db.js              # 資料庫連接配置
│   ├── middleware/
│   │   └── auth.js            # JWT 認證中間件
│   ├── routes/
│   │   ├── auth.js            # 認證路由
│   │   ├── dashboard.js       # 儀表板路由
│   │   ├── refunds.js         # 退款管理路由
│   │   ├── users.js           # 用戶管理路由
│   │   ├── vehicles.js        # 車輛管理路由
│   │   └── trips.js           # 行程管理路由
│   ├── .env                   # 環境變數
│   ├── .gitignore
│   ├── package.json
│   └── server.js              # 入口文件
│
├── frontend/                   # 前端目錄
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx     # 佈局組件
│   │   │   └── Sidebar.jsx    # 側邊欄組件
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx          # 儀表板頁面
│   │   │   ├── RefundManagement.jsx   # 退款管理頁面
│   │   │   ├── UserManagement.jsx     # 用戶管理頁面
│   │   │   ├── VehicleManagement.jsx  # 車輛管理頁面
│   │   │   ├── TripDetails.jsx        # 行程詳細頁面
│   │   │   ├── Login.jsx              # 登入頁面
│   │   │   └── CreateAdmin.jsx        # 創建管理員頁面
│   │   ├── services/
│   │   │   └── api.js         # API 服務
│   │   ├── App.js             # 根組件
│   │   ├── App.css            # 全局樣式
│   │   └── index.js           # 入口文件
│   ├── .env
│   ├── .gitignore
│   └── package.json
│
└── README.md                   # 本文件
```

---

## 🔌 API 文檔

### 認證 API

#### 登入
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

#### 創建管理員
```http
POST /api/auth/create-admin
Content-Type: application/json

{
  "username": "admin",
  "email": "admin@example.com",
  "password": "admin123",
  "name": "admin"
}
```

### 儀表板 API

#### 獲取總計數據
```http
GET /api/dashboard/totals
Authorization: Bearer <token>
```

#### 獲取營收數據
```http
GET /api/dashboard/revenue/:type?startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer <token>
```

#### 獲取成長趨勢
```http
GET /api/dashboard/growth/:type?baseDate=2024-01-15
Authorization: Bearer <token>
```

#### 獲取付款方式分布
```http
GET /api/dashboard/payment-distribution
Authorization: Bearer <token>
```

### 退款管理 API

#### 獲取所有退款
```http
GET /api/refunds?status=pending&search_type=user_id&search_value=123
Authorization: Bearer <token>
```

#### 更新退款狀態
```http
PUT /api/refunds/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "approved",
  "approved_refund_twd": 100,
  "approved_refund_points": 50,
  "decision_note": "核准退款"
}
```

### 用戶管理 API

#### 獲取用戶列表
```http
GET /api/users?type=rider
Authorization: Bearer <token>
```

#### 獲取用戶詳情
```http
GET /api/users/:type/:id
Authorization: Bearer <token>
```

### 車輛管理 API

#### 獲取車輛列表
```http
GET /api/vehicles?status=available&search_type=plate_number&search_value=ABC
Authorization: Bearer <token>
```

#### 更新車輛狀態
```http
PUT /api/vehicles/:id/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "maintenance"
}
```

### 行程管理 API

#### 獲取行程列表
```http
GET /api/trips?status=completed&search_type=trip_id&search_value=123
Authorization: Bearer <token>
```

#### 獲取行程詳情
```http
GET /api/trips/:id
Authorization: Bearer <token>
```

