// checkout.js - 天下茶屋智慧結帳系統邏輯
// 整合 LINE 推播與 Turso 雲端資料庫

// --- 配置區 ---
// 請將此處替換為你在 LINE Developers 取得的 User ID
const USER_ID = "U18507c677bd83702b4782655bc0a5c54";

// Turso 配置 (由 index.html 傳入或在此設定)
// 注意：前端露出 Token 有資安風險，實務上建議透過後端或 Edge Function
const TURSO_CONFIG = {
    url: "https://tenka-tea-db-a113222003.turso.io",
    token: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NDc3MzY4NzUsImlkIjoiYjY2ZDE5YjgtYjQ2NS00ZDYxLWE1YjAtYjY4Y2E5YjY4YjQ5In0.j0360101601010101010101010101010101010101010101010101010101010101"
};

const LINE_CONFIG = {
    accessToken: "YU7RBMN7RwHhYBow8Pk4Z3BBvdq9tUoLyB1edw/v70HYU4E4FWFOn7tfBYMTO51FC42ABHAtKm0b4Qtt2NvC7hFlp8rA4n9DacVWLObnxrkO5E84BcWrucgpUmjsFOOc49W+HMxzBQ9A8Kv0ru5dZwdB04t89/1O/w1cDnyilFU=",
    userId: "U18507c677bd83702b4782655bc0a5c54"
};

let db;
if (window.libsql) {
    db = window.libsql.createClient({
        url: TURSO_CONFIG.url,
        authToken: TURSO_CONFIG.token
    });
}

// Global 30 Stores Data
const GLOBAL_STORES = [
    { id: 1, name: "台北旗艦店", region: "台灣 (Taiwan)", city: "Taipei", lat: 25.0330, lon: 121.5654 },
    { id: 2, name: "東京銀座店", region: "日本 (Japan)", city: "Tokyo", lat: 35.6895, lon: 139.6917 },
    { id: 3, name: "紐約時代廣場店", region: "美國 (USA)", city: "New York", lat: 40.7128, lon: -74.0060 },
    { id: 4, name: "倫敦蘇活店", region: "英國 (UK)", city: "London", lat: 51.5074, lon: -0.1278 },
    { id: 5, name: "巴黎香榭店", region: "法國 (France)", city: "Paris", lat: 48.8566, lon: 2.3522 },
    { id: 6, name: "雪梨歌劇院店", region: "澳洲 (Australia)", city: "Sydney", lat: -33.8688, lon: 151.2093 },
    { id: 7, name: "曼谷暹羅店", region: "泰國 (Thailand)", city: "Bangkok", lat: 13.7563, lon: 100.5018 },
    { id: 8, name: "首爾明洞店", region: "韓國 (South Korea)", city: "Seoul", lat: 37.5665, lon: 126.9780 },
    { id: 9, name: "新加坡烏節店", region: "新加坡 (Singapore)", city: "Singapore", lat: 1.3521, lon: 103.8198 },
    { id: 10, name: "多倫多央街店", region: "加拿大 (Canada)", city: "Toronto", lat: 43.6510, lon: -79.3470 },
    { id: 11, name: "柏林十字山店", region: "德國 (Germany)", city: "Berlin", lat: 52.5200, lon: 13.4050 },
    { id: 12, name: "羅馬競技場店", region: "義大利 (Italy)", city: "Rome", lat: 41.9028, lon: 12.4964 },
    { id: 13, name: "馬德里主廣場店", region: "西班牙 (Spain)", city: "Madrid", lat: 40.4168, lon: -3.7038 },
    { id: 14, name: "杜拜哈里發店", region: "阿聯酋 (UAE)", city: "Dubai", lat: 25.2048, lon: 55.2708 },
    { id: 15, name: "孟買堡區店", region: "印度 (India)", city: "Mumbai", lat: 19.0760, lon: 72.8777 },
    { id: 16, name: "里約科帕卡巴納店", region: "巴西 (Brazil)", city: "Rio de Janeiro", lat: -22.9068, lon: -43.1729 },
    { id: 17, name: "開普敦桌山店", region: "南非 (South Africa)", city: "Cape Town", lat: -33.9249, lon: 18.4241 },
    { id: 18, name: "莫斯科紅場店", region: "俄羅斯 (Russia)", city: "Moscow", lat: 55.7558, lon: 37.6173 },
    { id: 19, name: "伊斯坦堡塔克西姆店", region: "土耳其 (Turkey)", city: "Istanbul", lat: 41.0082, lon: 28.9784 },
    { id: 20, name: "洛杉磯好萊塢店", region: "美國 (USA)", city: "Los Angeles", lat: 34.0522, lon: -118.2437 },
    { id: 21, name: "芝加哥千禧店", region: "美國 (USA)", city: "Chicago", lat: 41.8781, lon: -87.6298 },
    { id: 22, name: "溫哥華煤氣鎮店", region: "加拿大 (Canada)", city: "Vancouver", lat: 49.2827, lon: -123.1207 },
    { id: 23, name: "奧克蘭天空塔店", region: "紐西蘭 (New Zealand)", city: "Auckland", lat: -36.8485, lon: 174.7633 },
    { id: 24, name: "維也納內城店", region: "奧地利 (Austria)", city: "Vienna", lat: 48.2082, lon: 16.3738 },
    { id: 25, name: "阿姆斯特丹水壩店", region: "荷蘭 (Netherlands)", city: "Amsterdam", lat: 52.3676, lon: 4.9041 },
    { id: 26, name: "斯德哥爾摩老城店", region: "瑞典 (Sweden)", city: "Stockholm", lat: 59.3293, lon: 18.0686 },
    { id: 27, name: "奧斯陸阿克爾店", region: "挪威 (Norway)", city: "Oslo", lat: 59.9139, lon: 10.7522 },
    { id: 28, name: "赫爾辛基參議院店", region: "芬蘭 (Finland)", city: "Helsinki", lat: 60.1695, lon: 24.9354 },
    { id: 29, name: "北京王府井店", region: "中國 (China)", city: "Beijing", lat: 39.9042, lon: 116.4074 },
    { id: 30, name: "香港尖沙咀店", region: "香港 (Hong Kong)", city: "Hong Kong", lat: 22.3193, lon: 114.1694 },
    { id: 31, name: "雷克雅維克極光店", region: "冰島 (Iceland)", city: "Reykjavik", lat: 64.1466, lon: -21.9426 }
];

// Assign random busy status dynamically
GLOBAL_STORES.forEach(store => {
    const statuses = ["正常", "繁忙", "爆滿", "空閒"];
    store.busy = statuses[Math.floor(Math.random() * statuses.length)];
});

// System State
const AppState = {
    member: { isLoggedIn: false, phone: '' },
    inventory: { boba: 50, jelly: 50 },
    cart: [],
    inputs: { distance: 0, promoCode: '' },
    currentStore: GLOBAL_STORES[0]
};

// DOM Elements Cache
const el = {
    storeSelect: document.getElementById('globalStoreSelect'),
    storeList: document.getElementById('storeListContainer'),
    weatherText: document.getElementById('weatherText'),
    weatherSpinner: document.getElementById('weatherSpinner'),
    greetingTip: document.getElementById('greetingTip'),
    storeBusyStatus: document.getElementById('storeBusyStatus'),

    product: document.getElementById('product'),
    temperature: document.getElementById('temperature'),
    sweetness: document.getElementById('sweetness'),
    boba: document.getElementById('topping_boba'),
    jelly: document.getElementById('topping_jelly'),
    qty: document.getElementById('quantity'),
    addToCartBtn: document.getElementById('addToCartBtn'),
    errorMsg: document.getElementById('errorMessage'),
    invError: document.getElementById('inventoryError'),

    cartContent: document.getElementById('cartContent'),
    distance: document.getElementById('distance'),
    promo: document.getElementById('promo'),
    distError: document.getElementById('distanceError'),
    checkoutBtn: document.getElementById('checkoutBtn'),

    subtotal: document.getElementById('cartSubtotal'),
    memRow: document.getElementById('memberDiscountRow'),
    memDis: document.getElementById('memberDiscount'),
    promoRow: document.getElementById('promoDiscountRow'),
    promoDis: document.getElementById('promoDiscount'),
    total: document.getElementById('cartTotal'),
    historyList: document.getElementById('historyList')
};

// Initialize Store Selectors
function initStores() {
    let optionsHtml = '';
    let listHtml = '';
    GLOBAL_STORES.forEach((store, index) => {
        optionsHtml += `<option value="${index}">${store.name} - ${store.region}</option>`;
        listHtml += `
            <div style="padding: 10px; margin-bottom: 8px; background: #f9f9f9; border-radius: 8px; border-left: 4px solid var(--primary);">
                <strong>${store.name}</strong> (${store.region})<br>
                狀態：門市 ${store.busy} / 外送 正常<br>
                氣候座標：${store.city}
            </div>
        `;
    });
    el.storeSelect.innerHTML = optionsHtml;
    el.storeList.innerHTML = listHtml;

    // Fetch Initial Weather
    fetchWeather(AppState.currentStore);
}

// Handle Store Change
function changeStore() {
    const index = el.storeSelect.value;
    AppState.currentStore = GLOBAL_STORES[index];
    fetchWeather(AppState.currentStore);

    // Randomize inventory slightly on store change to simulate real life
    AppState.inventory.boba = Math.floor(Math.random() * 20) + 2;
    AppState.inventory.jelly = Math.floor(Math.random() * 20) + 2;
    document.getElementById('inventoryStatus').innerText = `珍珠(${AppState.inventory.boba}) 椰果(${AppState.inventory.jelly})`;
}

// Open-Meteo Weather Fetching & Recommendation Logic (Weather-Based Rules)
async function fetchWeather(store) {
    el.weatherText.innerText = `連線中...`;
    el.weatherSpinner.style.display = 'block';
    el.greetingTip.innerText = '正在為您擷取當地氣溫...';

    // Update Store Status Tag
    el.storeBusyStatus.innerText = `門市${store.busy}`;
    el.storeBusyStatus.style.background = store.busy === '正常' || store.busy === '空閒' ? '#e8f5e9' : '#ffe0b2';
    el.storeBusyStatus.style.color = store.busy === '正常' || store.busy === '空閒' ? '#2e7d32' : '#e65100';

    try {
        // Using actual Open-Meteo API for real-time weather
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${store.lat}&longitude=${store.lon}&current_weather=true`;
        const response = await fetch(url);
        const data = await response.json();

        const temp = data.current_weather.temperature;

        el.weatherSpinner.style.display = 'none';
        el.weatherText.innerText = `${store.city} ${temp}°C`;

        // apply rules: weather_recommendation.md
        if (temp > 28) {
            el.greetingTip.innerHTML = `當地氣溫高達 <strong>${temp}°C</strong>，天氣炎熱，推薦您來杯冰涼的 <strong>特調奶茶（冰）</strong>！ 🥤`;
            el.product.value = "55"; // Select Milk Tea
            el.temperature.value = "Ice";
        } else if (temp >= 15 && temp <= 28) {
            el.greetingTip.innerHTML = `當地氣溫 <strong>${temp}°C</strong>，氣候舒適，推薦您來杯招牌的 <strong>天下綠茶</strong> 或 <strong>天下紅茶</strong>！ 🍵`;
            el.product.value = "35"; // Select Green Tea
            el.temperature.value = "Less_Ice";
        } else {
            el.greetingTip.innerHTML = `當地氣溫僅 <strong>${temp}°C</strong>，天氣寒冷，來杯熱的 <strong>天下紅茶（熱）</strong> 暖暖身子吧！ ☕`;
            el.product.value = "40"; // Select Black Tea
            el.temperature.value = "Hot";
        }
        validateForm(); // Re-validate since we auto-selected options

    } catch (e) {
        el.weatherSpinner.style.display = 'none';
        el.weatherText.innerText = `${store.city} (離線)`;
        el.greetingTip.innerText = `無法取得當地氣溫，建議您來杯經典的特調奶茶！`;
    }
}

// Event Listeners for UI interaction
el.product.addEventListener('change', validateForm);
el.temperature.addEventListener('change', validateForm);
el.boba.addEventListener('change', validateForm);
el.jelly.addEventListener('change', validateForm);
el.qty.addEventListener('input', validateForm);
el.distance.addEventListener('input', () => { AppState.inputs.distance = parseFloat(el.distance.value) || 0; renderCart(); });
el.promo.addEventListener('input', () => { AppState.inputs.promoCode = el.promo.value.trim().toUpperCase(); renderCart(); });

// Modals function
function showModal(id) { document.getElementById(id).style.display = 'flex'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }

// Login Function
function login() {
    const phone = document.getElementById('loginPhone').value;
    if (phone.length >= 9) {
        AppState.member.isLoggedIn = true;
        AppState.member.phone = phone;
        document.getElementById('loginStatusBtn').innerText = '會員已登入';
        document.getElementById('loginStatusBtn').classList.add('primary-btn');
        closeModal('loginModal');
        renderCart(); // Recalculate discount
        alert('登入成功！您將享有會員 95 折優惠。');
    } else {
        alert('請輸入有效手機號碼');
    }
}

// Validation for Add to Cart
function validateForm() {
    const isHot = el.temperature.value === 'Hot';
    const hasBoba = el.boba.checked;
    const hasJelly = el.jelly.checked;
    const reqQty = parseInt(el.qty.value) || 1;

    let hasError = false;

    if (isHot && hasBoba) {
        el.errorMsg.style.display = 'block';
        hasError = true;
    } else {
        el.errorMsg.style.display = 'none';
    }

    let bobaNeeded = hasBoba ? reqQty : 0;
    let jellyNeeded = hasJelly ? reqQty : 0;

    if (bobaNeeded > AppState.inventory.boba || jellyNeeded > AppState.inventory.jelly) {
        el.invError.style.display = 'block';
        hasError = true;
    } else {
        el.invError.style.display = 'none';
    }

    el.addToCartBtn.disabled = hasError;
}

function addToCart() {
    if (el.addToCartBtn.disabled) return;

    const pOption = el.product.options[el.product.selectedIndex];
    const tOption = el.temperature.options[el.temperature.selectedIndex];
    const sOption = el.sweetness.options[el.sweetness.selectedIndex];

    let toppingCost = 0;
    let toppings = [];
    if (el.boba.checked) { toppings.push('珍珠'); toppingCost += 10; }
    if (el.jelly.checked) { toppings.push('椰果'); toppingCost += 10; }

    const qty = parseInt(el.qty.value) || 1;
    const basePrice = parseInt(pOption.value);
    const unitPrice = basePrice + toppingCost;

    if (el.boba.checked) AppState.inventory.boba -= qty;
    if (el.jelly.checked) AppState.inventory.jelly -= qty;
    document.getElementById('inventoryStatus').innerText = `珍珠(${AppState.inventory.boba}) 椰果(${AppState.inventory.jelly})`;

    const item = {
        id: Date.now(),
        name: pOption.getAttribute('data-name'),
        temp: tOption.text,
        sweet: sOption.text,
        toppings: toppings,
        qty: qty,
        unitPrice: unitPrice,
        totalPrice: unitPrice * qty
    };

    AppState.cart.push(item);
    renderCart();
    showModal('continueModal');

    el.qty.value = 1;
    el.boba.checked = false;
    el.jelly.checked = false;
    validateForm();
}

function removeItem(id) {
    const index = AppState.cart.findIndex(i => i.id === id);
    if (index > -1) {
        const item = AppState.cart[index];
        if (item.toppings.includes('珍珠')) AppState.inventory.boba += item.qty;
        if (item.toppings.includes('椰果')) AppState.inventory.jelly += item.qty;
        document.getElementById('inventoryStatus').innerText = `珍珠(${AppState.inventory.boba}) 椰果(${AppState.inventory.jelly})`;

        AppState.cart.splice(index, 1);
        renderCart();
    }
}

function renderCart() {
    if (AppState.cart.length === 0) {
        el.cartContent.innerHTML = '<div style="text-align: center; color: #999; padding: 20px;">購物車是空的</div>';
        el.checkoutBtn.disabled = true;
        updateTotals(0, 0, 0);
        return;
    }

    let html = '';
    let subtotal = 0;

    AppState.cart.forEach(item => {
        subtotal += item.totalPrice;
        html += `
            <div class="cart-item">
                <div class="cart-item-details">
                    <div class="cart-item-title">${item.name} x${item.qty}</div>
                    <div class="cart-item-sub">${item.temp} / ${item.sweet} ${item.toppings.length > 0 ? '+' + item.toppings.join(',') : ''}</div>
                </div>
                <div style="font-weight: bold; margin-right: 10px;">$${item.totalPrice}</div>
                <div class="cart-item-actions"><button onclick="removeItem(${item.id})">刪除</button></div>
            </div>
        `;
    });
    el.cartContent.innerHTML = html;

    let canCheckout = true;
    if (AppState.inputs.distance > 3) {
        el.distError.style.display = 'block';
        canCheckout = false;
    } else {
        el.distError.style.display = 'none';
    }

    el.checkoutBtn.disabled = !canCheckout;

    let memDisc = 0;
    let promoDisc = 0;
    let net = subtotal;

    if (AppState.member.isLoggedIn) {
        memDisc = Math.round(net * 0.05);
        net -= memDisc;
    }

    if (AppState.inputs.promoCode === 'TENKA_80') {
        let pDisc = Math.round(net * 0.2);
        promoDisc += pDisc;
        net -= pDisc;
    }

    if (net >= 1000) {
        let bulkDisc = Math.floor(net / 1000) * 100;
        promoDisc += bulkDisc;
        net -= bulkDisc;
    }

    updateTotals(subtotal, memDisc, promoDisc, net);
}

function updateTotals(sub, mem, promo, net) {
    el.subtotal.innerText = '$' + sub;

    if (mem > 0) { el.memRow.style.display = 'flex'; el.memDis.innerText = '-$' + mem; }
    else { el.memRow.style.display = 'none'; }

    if (promo > 0) { el.promoRow.style.display = 'flex'; el.promoDis.innerText = '-$' + promo; }
    else { el.promoRow.style.display = 'none'; }

    if (net === undefined) net = 0;
    el.total.innerText = '$' + net;
    document.getElementById('payTotalAmount').innerText = '$' + net;
}

function proceedToCheckout() {
    if (!AppState.member.isLoggedIn) {
        if (confirm("您尚未登入會員，現在登入可享95折優惠。是否前往登入？")) {
            showModal('loginModal');
            return;
        }
    }
    showModal('checkoutFlowModal');
}

function toggleInvoiceFields() {
    const v = document.getElementById('invoiceType').value;
    document.getElementById('carrierGroup').style.display = v === 'carrier' ? 'block' : 'none';
    document.getElementById('vatGroup').style.display = v === 'vat' ? 'block' : 'none';
}

function startPayment() {
    closeModal('checkoutFlowModal');
    showModal('paymentModal');

    document.getElementById('paymentStatus').style.display = 'block';
    document.getElementById('paymentResult').style.display = 'none';

    setTimeout(async () => {
        document.getElementById('paymentStatus').style.display = 'none';
        document.getElementById('paymentResult').style.display = 'block';

        const rand = Math.random();
        if (rand < 0.1) { // Reduced failure rate for testing
            document.getElementById('paymentMsg').innerHTML = '❌ 連線逾時 (Error: Timeout)';
            document.getElementById('retryPayBtn').style.display = 'inline-block';
            document.getElementById('changePayBtn').style.display = 'inline-block';
            document.getElementById('timeoutMsg').style.display = 'block';
        } else if (rand < 0.2) {
            document.getElementById('paymentMsg').innerHTML = '❌ 餘額不足或扣款失敗';
            document.getElementById('retryPayBtn').style.display = 'none';
            document.getElementById('changePayBtn').style.display = 'inline-block';
            document.getElementById('timeoutMsg').style.display = 'block';
        } else {
            document.getElementById('paymentMsg').innerHTML = '<h3 style="color: var(--primary);">✅ 結帳成功！</h3><p>訂單已成立，門市正在為您準備茶飲！</p><p style="font-size: 0.8rem; color: #666;">🔔 已透過 LINE 通知您囉！</p>';
            document.getElementById('retryPayBtn').style.display = 'none';
            document.getElementById('changePayBtn').style.display = 'none';
            document.getElementById('timeoutMsg').style.display = 'none';

            // Console log simulation of LINE Push as requested by CH06
            console.log("Sending LINE Push Message to:", LINE_CONFIG.userId);
            console.log("Message Content: 您好，天下茶屋已收到您的訂單！品項製作中。");

            // Real LINE Push Call
            sendRealLinePush("您好，天下茶屋已收到您的訂單！品項製作中。");

            // CH07: Save Order to Turso
            await saveOrderToCloud();

            AppState.cart = [];
            renderCart();
            setTimeout(() => closeModal('paymentModal'), 3000);
        }
    }, 2000);
}

// Real LINE Push function
async function sendRealLinePush(messageText) {
    try {
        const response = await fetch("https://api.line.me/v2/bot/message/push", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${LINE_CONFIG.accessToken}`
            },
            body: JSON.stringify({
                to: LINE_CONFIG.userId,
                messages: [{ type: "text", text: messageText }]
            })
        });
        const data = await response.json();
        console.log("LINE API Response:", data);
    } catch (err) {
        console.error("LINE Push Error:", err);
    }
}

// CH07: Persistence Logic
async function saveOrderToCloud() {
    if (!db) {
        console.error("Database not initialized");
        return;
    }

    const orderId = "TK-" + Date.now();
    try {
        // Create table if not exists (usually should be done once)
        await db.execute(`
            CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                order_id TEXT,
                item_name TEXT,
                qty INTEGER,
                unit_price INTEGER,
                subtotal INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Batch insert items
        for (const item of AppState.cart) {
            await db.execute({
                sql: "INSERT INTO orders (order_id, item_name, qty, unit_price, subtotal) VALUES (?, ?, ?, ?, ?)",
                args: [orderId, item.name, item.qty, item.unitPrice, item.totalPrice]
            });
        }
        console.log("Order saved to cloud successfully!");
        alert("您的訂單已安全存入雲端資料庫");
    } catch (err) {
        console.error("Cloud storage error:", err);
    }
}

// CH07: Query Logic
async function fetchOrderHistory() {
    if (!db) {
        console.error("Database not initialized");
        return;
    }

    el.historyList.innerHTML = '<div class="loading-spinner"></div>';

    try {
        const result = await db.execute("SELECT * FROM orders ORDER BY created_at DESC LIMIT 10");
        let html = '';
        if (result.rows.length === 0) {
            html = '<p style="text-align: center; color: #999;">尚無歷史訂單</p>';
        } else {
            result.rows.forEach(row => {
                html += `
                    <div style="background: #fdfbf7; padding: 10px; margin-bottom: 8px; border-radius: 8px; border: 1px solid #eee;">
                        <div style="font-weight: bold; display: flex; justify-content: space-between;">
                            <span>${row.item_name} x${row.qty}</span>
                            <span>$${row.subtotal}</span>
                        </div>
                        <div style="font-size: 0.75rem; color: #999;">訂單號: ${row.order_id} | 時間: ${row.created_at}</div>
                    </div>
                `;
            });
        }
        el.historyList.innerHTML = html;
    } catch (err) {
        console.error("History query error:", err);
        el.historyList.innerHTML = '<p style="color: red; text-align: center;">查詢失敗</p>';
    }
}

// Startup
initStores();
