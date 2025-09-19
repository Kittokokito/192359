// script.js (v4.5 - Robust Fee Calculation)
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwdp97QoGHa4ORidC00JdEhKlxsYaUOqJkaEocJrU9VqM3RpV1xIOoSKNUHBDGtB9AWJA/exec';

window.addEventListener('DOMContentLoaded', () => {
    // --- Element Declarations (No changes needed) ---
    const form = document.getElementById('order-form');
    // ... (and all other elements)
    
    let userLocation = null;
    let menuData = [];
    let currentOrderData = {};

    async function fetchMenu() {
        try {
            // **แก้ไข:** ใช้ doGet แบบเดิมสำหรับดึงเมนู
            const response = await fetch(WEB_APP_URL); 
            const result = await response.json();
            if (result.status === 'success') {
                menuData = result.data;
                renderMenu(menuData);
            } else { loadingMessage.textContent = 'ไม่สามารถโหลดเมนูได้'; }
        } catch (error) { loadingMessage.textContent = 'เกิดข้อผิดพลาดในการเชื่อมต่อ'; }
    }

    // --- renderMenu, addQuantityButtonListeners, updateTotals, collectOrderData (No changes needed) ---
    // ... (All these functions remain the same)

    // --- Event Listeners ---
    getLocationBtn.addEventListener('click', () => { /* ... No changes ... */ });

    reviewOrderBtn.addEventListener('click', async () => {
        // ... (Validation checks remain the same) ...
        
        currentOrderData = collectOrderData();

        // ... (Code to show modal and populate customer info remains the same) ...

        try {
            // **อัปเกรด:** เปลี่ยนเป็น "ส่งจดหมายถาม" (POST) แทนการ "ตะโกนถาม" (GET)
            const feeResponse = await fetch(WEB_APP_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'calculateFee',
                    lat: currentOrderData.latitude,
                    lng: currentOrderData.longitude
                })
            });
            const feeResult = await feeResponse.json();

            if (feeResult.status === 'success') {
                currentOrderData.deliveryFee = feeResult.fee;
                summaryDistance.textContent = `${feeResult.distance} กม.`;
                summaryDeliveryFee.textContent = `${feeResult.fee} บาท`;
                summaryFoodTotal.textContent = `${currentOrderData.totalPrice} บาท`;
                const grandTotal = currentOrderData.totalPrice + feeResult.fee;
                summaryGrandTotal.textContent = `${grandTotal} บาท`;
            } else {
                throw new Error(feeResult.message);
            }
        } catch(error) {
            alert(`เกิดข้อผิดพลาดในการคำนวณค่าส่ง: ${error.message}`);
            // ... (Error handling remains the same)
        } finally {
            // ... (Code to hide spinner and show buttons remains the same)
        }
    });

    editOrderBtn.addEventListener('click', () => { /* ... No changes ... */ });
    
    closeThankYouBtn.addEventListener('click', () => { /* ... No changes ... */ });

    confirmOrderBtn.addEventListener('click', () => {
        confirmOrderBtn.disabled = true;
        confirmOrderBtn.textContent = 'กำลังส่ง...';

        // **อัปเกรด:** เพิ่ม action: 'submitOrder' เพื่อความชัดเจน
        const finalOrderPayload = {
            ...currentOrderData,
            action: 'submitOrder'
        };

        fetch(WEB_APP_URL, {
            method: 'POST', 
            mode: 'no-cors', // Use no-cors for the final submission
            body: JSON.stringify(finalOrderPayload)
        })
        .then(() => {
            // ... (Code to show thank you modal remains the same)
        })
        .catch(error => { alert(`เกิดข้อผิดพลาดในการส่งออเดอร์: ${error}`); })
        .finally(() => {
            // ... (Code to reset button remains the same)
        });
    });

    fetchMenu();
});

