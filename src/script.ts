/// <reference types="leaflet" />

const ipInput = document.getElementById('searchInput') as HTMLInputElement;
const checkBtn = document.getElementById('searchBtn') as HTMLButtonElement;
const outputs: NodeListOf<HTMLElement> =
  document.querySelectorAll('.idInformaton');
console.log('Outputs:', outputs);

// Інтерфейс для відповіді API
interface IPApiResponse {
  ip: string;
  city: string;
  region_code: string;
  postal: string;
  latitude: string;
  longitude: string;
  utc_offset: string;
  org: string;
  error?: string;
}

var greenIcon = L.icon({
  iconUrl: './images/icon-location.svg',

  iconSize: [46, 56], // size of the icon
  iconAnchor: [23, 55], // point of the icon which will correspond to marker's location
});

let mapa: L.Map | null = null;
let marker: L.Marker | null = null;

async function showInformation(ipAddress: string): Promise<void> {
  if (!ipAddress) {
    showError('Введіть IP-адресу.');
    return;
  }

  try {
    const res: Response = await fetch(`https://ipapi.co/${ipAddress}/json/`);

    if (!res.ok) {
      throw new Error(`HTTP помилка: ${res.status}`);
    }

    const data: IPApiResponse = await res.json();
    const {
      ip: realIp,
      city,
      region_code,
      postal,
      latitude,
      longitude,
      utc_offset,
      org,
    } = data;

    // Перевірка на валідність відповіді
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
    setTimeout(() => mapa?.invalidateSize(), 100);
  } catch (error) {
    console.error('Помилка при запиті:', error);
    showError('Помилка з’єднання або невірний IP.');
  }
}

// Додаємо обробник події на кнопку, показуємо інформацію за заданим ІР
document.addEventListener('DOMContentLoaded', async () => {
  // Обробка кліку на кнопку
  checkBtn.addEventListener('click', async () => {
    const ip: string = ipInput.value.trim();
    checkBtn.disabled = true;
    await showInformation(ip);
    checkBtn.disabled = false;
  });

  // Автозавантаження інформації про поточного користувача
  try {
    const res = await fetch('https://ipapi.co/json/');
    if (!res.ok) throw new Error(`HTTP помилка: ${res.status}`);

    const data: IPApiResponse = await res.json();
    if (data && data.ip) {
      ipInput.value = data.ip;
      showInformation(data.ip);
    } else {
      showError('Не вдалося отримати дані користувача.');
    }
  } catch (err) {
    console.error('Помилка при автозавантаженні:', err);
    showError('Не вдалося отримати IP користувача.');
  }

  // Обробка натискання Enter в полі вводу
  ipInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      checkBtn.click();
    }
  });
});

// функція для відображення карти
function showMap(lat: string, lng: string): void {
  const latitude = parseFloat(lat);
  const longitude = parseFloat(lng);
  const center = [latitude, longitude] as [number, number];

  console.log(L);
  if (!mapa) {
    mapa = L.map('mapa', {
      zoomControl: false, // відключаємо за замовчуванням
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
  } else {
    mapa.setView(center, 10);
    if (!marker) {
      marker = L.marker(center, { icon: greenIcon }).addTo(mapa);
    }
    marker.setLatLng(center);
  }
}

// оновлення значень у .outputItem
function updateOutputs(values: string[]): void {
  const count = Math.min(outputs.length, values.length);
  for (let i = 0; i < count; i++) {
    outputs[i].textContent = values[i];
  }
  // Якщо менше значень, очистити залишки
  for (let i = count; i < outputs.length; i++) {
    outputs[i].textContent = '';
  }
}

// виведення помилки в усі output-поля
function showError(message: string): void {
  outputs.forEach((el) => {
    el.textContent = message;
  });
}

// 176.9.67.227
