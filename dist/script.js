"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const ipInput = document.getElementById('searchInput');
const checkBtn = document.getElementById('searchBtn');
const outputs = document.querySelectorAll('.idInformaton');
console.log('Outputs:', outputs);
var greenIcon = L.icon({
    iconUrl: './images/icon-location.svg',
    iconSize: [46, 56],
    iconAnchor: [23, 55],
});
let mapa = null;
let marker = null;
function showInformation(ipAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!ipAddress) {
            showError('Введіть IP-адресу.');
            return;
        }
        try {
            const res = yield fetch(`https://ipapi.co/${ipAddress}/json/`);
            if (!res.ok) {
                throw new Error(`HTTP помилка: ${res.status}`);
            }
            const data = yield res.json();
            const { ip: realIp, city, region_code, postal, latitude, longitude, utc_offset, org, } = data;
            if (!data || data.error || !data.latitude || !data.longitude) {
                showError('Упс, не вдалося знайти інформацію по цьому IP.');
                return;
            }
            updateOutputs([
                `${realIp}`,
                `${city}, ${region_code}, ${postal}`,
                `UTC${utc_offset}`,
                `${org}`,
            ]);
            showMap(latitude, longitude);
            setTimeout(() => mapa === null || mapa === void 0 ? void 0 : mapa.invalidateSize(), 100);
        }
        catch (error) {
            console.error('Помилка при запиті:', error);
            showError('Помилка з’єднання або невірний IP.');
        }
    });
}
document.addEventListener('DOMContentLoaded', () => __awaiter(void 0, void 0, void 0, function* () {
    checkBtn.addEventListener('click', () => __awaiter(void 0, void 0, void 0, function* () {
        const ip = ipInput.value.trim();
        checkBtn.disabled = true;
        yield showInformation(ip);
        checkBtn.disabled = false;
    }));
    try {
        const res = yield fetch('https://ipapi.co/json/');
        if (!res.ok)
            throw new Error(`HTTP помилка: ${res.status}`);
        const data = yield res.json();
        if (data && data.ip) {
            ipInput.value = data.ip;
            showInformation(data.ip);
        }
        else {
            showError('Не вдалося отримати дані користувача.');
        }
    }
    catch (err) {
        console.error('Помилка при автозавантаженні:', err);
        showError('Не вдалося отримати IP користувача.');
    }
    ipInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            checkBtn.click();
        }
    });
}));
function showMap(lat, lng) {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const center = [latitude, longitude];
    console.log(L);
    if (!mapa) {
        mapa = L.map('mapa', {
            zoomControl: false,
        }).setView(center, 10);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap',
        }).addTo(mapa);
        L.control
            .zoom({
            position: 'bottomleft',
        })
            .addTo(mapa);
        marker = L.marker(center, { icon: greenIcon }).addTo(mapa);
    }
    else {
        mapa.setView(center, 10);
        if (!marker) {
            marker = L.marker(center, { icon: greenIcon }).addTo(mapa);
        }
        marker.setLatLng(center);
    }
}
function updateOutputs(values) {
    const count = Math.min(outputs.length, values.length);
    for (let i = 0; i < count; i++) {
        outputs[i].textContent = values[i];
    }
    for (let i = count; i < outputs.length; i++) {
        outputs[i].textContent = '';
    }
}
function showError(message) {
    outputs.forEach((el) => {
        el.textContent = message;
    });
}
//# sourceMappingURL=script.js.map