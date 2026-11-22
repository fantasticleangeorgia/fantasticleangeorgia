/**
 * FantastiClean Georgia - Core Application Engine
 * Handles State, i18n, Dynamic Catalog, B2B Calculator, One-Pager Offer Generator, and Interactions
 */

// Application State
const state = {
  lang: localStorage.getItem('fc_lang') || 'ge',
  activeCategory: 'all',
  clientType: 'b2b', // 'retail' or 'b2b'
  cart: [
    { id: 'fc-roll-36-detailing', qty: 1 },
    { id: 'fc-roll-75-multi', qty: 2 },
    { id: 'fc-roll-20-smooth', qty: 1 },
    { id: 'fc-car-1100', qty: 1 }
  ],
  clientInfo: {
    name: 'შპს "პრემიუმ ავტო გრუპი"',
    taxId: '405123987',
    person: 'გიორგი მაისურაძე',
    phone: '+995 599 12 34 56',
    email: 'info@premiumauto.ge',
    address: 'თბილისი, ა. ბელიაშვილის ქ. 45',
    notes: 'გთხოვთ მოგვაწოდოთ დღგ-ის ანგარიშ-ფაქტურა'
  },
  quoteNumber: 'FC-' + Math.floor(1000 + Math.random() * 9000),
  quoteDate: new Date().toLocaleDateString('ka-GE')
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  setupLanguage();
  renderProducts();
  setupCategoryFilters();
  setupCalculator();
  updateCalculatorUI();
  setupQuickChat();
  setupModals();
  setupContactForm();
  setupMobileMenu();
});

// ==========================================
// 1. Multilingual (i18n) Engine
// ==========================================
function setupLanguage() {
  const langToggleBtn = document.getElementById('lang-toggle-btn');
  const mobileLangToggleBtn = document.getElementById('mobile-lang-toggle-btn');

  if (langToggleBtn) {
    langToggleBtn.addEventListener('click', toggleLanguage);
  }
  if (mobileLangToggleBtn) {
    mobileLangToggleBtn.addEventListener('click', toggleLanguage);
  }

  applyTranslations();
}

function toggleLanguage() {
  state.lang = state.lang === 'ge' ? 'en' : 'ge';
  localStorage.setItem('fc_lang', state.lang);
  applyTranslations();
  renderProducts();
  updateCalculatorUI();
  showToast(state.lang === 'ge' ? 'ენა შეიცვალა: ქართული' : 'Language switched: English');
}

function applyTranslations() {
  const dict = translations[state.lang];
  document.documentElement.lang = state.lang === 'ge' ? 'ka' : 'en';

  // Update text of elements with data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const path = el.getAttribute('data-i18n');
    const val = getNestedValue(dict, path);
    if (val !== undefined) {
      el.textContent = val;
    }
  });

  // Update placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const path = el.getAttribute('data-i18n-placeholder');
    const val = getNestedValue(dict, path);
    if (val !== undefined) {
      el.placeholder = val;
    }
  });

  // Update HTML text if flagged
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const path = el.getAttribute('data-i18n-html');
    const val = getNestedValue(dict, path);
    if (val !== undefined) {
      el.innerHTML = val;
    }
  });

  // Update language button label
  const langLabel = document.getElementById('current-lang-label');
  if (langLabel) {
    langLabel.textContent = state.lang === 'ge' ? 'EN' : 'ქართ';
  }
  const mobileLangLabel = document.getElementById('mobile-current-lang-label');
  if (mobileLangLabel) {
    mobileLangLabel.textContent = state.lang === 'ge' ? 'EN' : 'ქართ';
  }

  // Update Cart Count Badge
  updateCartBadge();

  // Update calculator dropdown options
  const selector = document.getElementById('calc-add-product-select');
  if (selector) {
    selector.innerHTML = `
      <option value="">${state.lang === 'en' ? '-- Select a product to add --' : '-- აირჩიეთ პროდუქტი დასამატებლად --'}</option>
      ${productsData.map(p => `
        <option value="${p.id}">${state.lang === 'en' ? p.title_en : p.title_ge} (${p.price.toFixed(2)} ₾)</option>
      `).join('')}
    `;
  }
}

function getNestedValue(obj, path) {
  return path.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj);
}

// ==========================================
// 2. Product Catalog & SVG Renderers
// ==========================================
function getProductSvg(type) {
  switch (type) {
    case 'car-towel':
      return `
        <svg class="w-full h-48 transition-transform duration-300 group-hover:scale-105" viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="towelGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#1e293b"/>
              <stop offset="50%" stop-color="#0f172a"/>
              <stop offset="100%" stop-color="#334155"/>
            </linearGradient>
            <linearGradient id="towelEdge" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#0ea5e9"/>
              <stop offset="100%" stop-color="#10b981"/>
            </linearGradient>
            <pattern id="microfiberTexture" width="8" height="8" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1" fill="#475569" opacity="0.4"/>
              <circle cx="6" cy="6" r="1" fill="#0ea5e9" opacity="0.3"/>
            </pattern>
          </defs>
          <rect x="50" y="30" width="300" height="180" rx="20" fill="url(#towelGrad1)"/>
          <rect x="50" y="30" width="300" height="180" rx="20" fill="url(#microfiberTexture)"/>
          <!-- Silk Banded Edge -->
          <rect x="46" y="26" width="308" height="188" rx="24" stroke="url(#towelEdge)" stroke-width="6" fill="none"/>
          <!-- Folded Layer -->
          <path d="M50 120 C 120 140, 280 100, 350 130 L 350 210 L 50 210 Z" fill="#0284c7" opacity="0.25"/>
          <path d="M50 140 C 130 155, 270 125, 350 145" stroke="#38bdf8" stroke-width="3" stroke-dasharray="6 4" opacity="0.8"/>
          <!-- GSM Badge -->
          <g transform="translate(260, 45)">
            <rect width="78" height="30" rx="15" fill="#0ea5e9"/>
            <text x="39" y="20" text-anchor="middle" fill="#ffffff" font-size="12" font-weight="bold">1100 GSM</text>
          </g>
          <!-- Water Absorption Droplets -->
          <circle cx="95" cy="80" r="10" fill="#38bdf8" opacity="0.85"/>
          <path d="M95 65 L 102 77 Q 95 82 88 77 Z" fill="#38bdf8" opacity="0.85"/>
          <circle cx="130" cy="95" r="7" fill="#38bdf8" opacity="0.7"/>
          <path d="M130 84 L 135 93 Q 130 97 125 93 Z" fill="#38bdf8" opacity="0.7"/>
        </svg>
      `;

    case 'universal-cloth':
      return `
        <svg class="w-full h-48 transition-transform duration-300 group-hover:scale-105" viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="clothBlue" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#38bdf8"/>
              <stop offset="100%" stop-color="#0284c7"/>
            </linearGradient>
            <linearGradient id="clothGreen" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#34d399"/>
              <stop offset="100%" stop-color="#059669"/>
            </linearGradient>
          </defs>
          <!-- Second Stacked Cloth -->
          <rect x="75" y="45" width="260" height="160" rx="16" fill="url(#clothGreen)" transform="rotate(5 205 125)" opacity="0.85"/>
          <!-- Top Cloth -->
          <rect x="70" y="35" width="260" height="160" rx="16" fill="url(#clothBlue)"/>
          <!-- Ultrasonic Edgeless pattern -->
          <rect x="74" y="39" width="252" height="152" rx="14" stroke="#ffffff" stroke-width="2" stroke-dasharray="4 4" opacity="0.6"/>
          <!-- Eco Leaf Icon -->
          <g transform="translate(180, 85)">
            <circle cx="20" cy="20" r="28" fill="#ffffff" opacity="0.2"/>
            <path d="M20 5 C30 5, 35 20, 30 32 C20 35, 10 30, 10 20 C10 10, 15 5, 20 5 Z" fill="#ffffff"/>
            <path d="M20 5 L 20 35" stroke="#0284c7" stroke-width="2"/>
          </g>
          <!-- GSM Badge -->
          <g transform="translate(250, 45)">
            <rect width="68" height="26" rx="13" fill="#10b981"/>
            <text x="34" y="18" text-anchor="middle" fill="#ffffff" font-size="11" font-weight="bold">350 GSM</text>
          </g>
        </svg>
      `;

    case 'glass-cloth':
      return `
        <svg class="w-full h-48 transition-transform duration-300 group-hover:scale-105" viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="glassClothGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#7dd3fc"/>
              <stop offset="100%" stop-color="#0284c7"/>
            </linearGradient>
            <pattern id="diamondPattern" width="16" height="16" patternUnits="userSpaceOnUse">
              <path d="M8 0 L16 8 L8 16 L0 8 Z" fill="none" stroke="#ffffff" stroke-width="1.2" opacity="0.35"/>
            </pattern>
          </defs>
          <rect x="65" y="30" width="270" height="175" rx="18" fill="url(#glassClothGrad)"/>
          <rect x="65" y="30" width="270" height="175" rx="18" fill="url(#diamondPattern)"/>
          <rect x="65" y="30" width="270" height="175" rx="18" stroke="#ffffff" stroke-width="3" opacity="0.5"/>
          <!-- Sparkles -->
          <g transform="translate(110, 60)">
            <path d="M15 0 L18 10 L28 15 L18 20 L15 30 L12 20 L2 15 L12 10 Z" fill="#ffffff"/>
          </g>
          <g transform="translate(250, 130)">
            <path d="M12 0 L14 8 L22 12 L14 16 L12 24 L10 16 L2 12 L10 8 Z" fill="#ffffff" opacity="0.9"/>
          </g>
          <!-- GSM Badge -->
          <g transform="translate(255, 42)">
            <rect width="68" height="26" rx="13" fill="#0284c7"/>
            <text x="34" y="18" text-anchor="middle" fill="#ffffff" font-size="11" font-weight="bold">380 GSM</text>
          </g>
        </svg>
      `;

    case 'kitchen-cloth':
      return `
        <svg class="w-full h-48 transition-transform duration-300 group-hover:scale-105" viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="wafflePattern" width="12" height="12" patternUnits="userSpaceOnUse">
              <rect width="10" height="10" fill="none" stroke="#ffffff" stroke-width="1.5" opacity="0.3"/>
            </pattern>
          </defs>
          <!-- 3 Pack Stack -->
          <rect x="60" y="65" width="240" height="140" rx="14" fill="#94a3b8"/>
          <rect x="80" y="45" width="240" height="140" rx="14" fill="#fbbf24"/>
          <rect x="100" y="25" width="240" height="140" rx="14" fill="#14b8a6"/>
          <rect x="100" y="25" width="240" height="140" rx="14" fill="url(#wafflePattern)"/>
          <!-- Shield Icon -->
          <g transform="translate(195, 65)">
            <circle cx="20" cy="20" r="26" fill="#ffffff" opacity="0.25"/>
            <path d="M20 8 L32 13 V22 C32 29 27 34 20 37 C13 34 8 29 8 22 V13 L20 8 Z" fill="#ffffff"/>
            <path d="M16 22 L19 25 L25 18" stroke="#0f766e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          </g>
          <g transform="translate(260, 35)">
            <rect width="68" height="26" rx="13" fill="#0f766e"/>
            <text x="34" y="18" text-anchor="middle" fill="#ffffff" font-size="11" font-weight="bold">3 Pack</text>
          </g>
        </svg>
      `;

    case 'detailing-kit':
      return `
        <svg class="w-full h-48 transition-transform duration-300 group-hover:scale-105" viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="kitBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#1e1b4b"/>
              <stop offset="100%" stop-color="#312e81"/>
            </linearGradient>
          </defs>
          <rect x="50" y="25" width="300" height="185" rx="20" fill="url(#kitBg)"/>
          <!-- Towel Fold 1100 GSM -->
          <rect x="75" y="45" width="130" height="140" rx="12" fill="#0f172a" stroke="#0ea5e9" stroke-width="3"/>
          <text x="140" y="115" text-anchor="middle" fill="#38bdf8" font-size="12" font-weight="bold">1100 GSM</text>
          <text x="140" y="132" text-anchor="middle" fill="#94a3b8" font-size="9">DRYING TOWEL</text>
          <!-- Interior Edgeless Cloths -->
          <rect x="220" y="45" width="105" height="65" rx="8" fill="#059669"/>
          <text x="272" y="82" text-anchor="middle" fill="#ffffff" font-size="10" font-weight="bold">INTERIOR</text>
          <!-- Foam Applicator Puck -->
          <circle cx="272" cy="150" r="30" fill="#f59e0b" stroke="#ffffff" stroke-width="2"/>
          <text x="272" y="154" text-anchor="middle" fill="#ffffff" font-size="9" font-weight="bold">WAX PAD</text>
          <!-- Pro Badge -->
          <g transform="translate(70, 35)">
            <rect width="80" height="24" rx="12" fill="#6366f1"/>
            <text x="40" y="16" text-anchor="middle" fill="#ffffff" font-size="10" font-weight="bold">MASTER 5-IN-1</text>
          </g>
        </svg>
      `;

    case 'b2b-box':
    default:
      return `
        <svg class="w-full h-48 transition-transform duration-300 group-hover:scale-105" viewBox="0 0 400 240" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="boxGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#b45309"/>
              <stop offset="100%" stop-color="#78350f"/>
            </linearGradient>
          </defs>
          <!-- Kraft Carton Box -->
          <polygon points="120,40 280,40 330,85 170,85" fill="#d97706"/>
          <polygon points="70,85 170,85 170,205 70,205" fill="#b45309"/>
          <polygon points="170,85 330,85 330,205 170,205" fill="#92400e"/>
          <!-- Stack of Color-coded microfibers inside box -->
          <rect x="180" y="55" width="130" height="15" rx="4" fill="#38bdf8"/>
          <rect x="180" y="66" width="130" height="15" rx="4" fill="#34d399"/>
          <rect x="180" y="77" width="130" height="15" rx="4" fill="#fbbf24"/>
          <!-- FantastiClean Georgia Branding Stamp on Carton -->
          <rect x="195" y="115" width="110" height="55" rx="6" fill="#0f172a" opacity="0.85"/>
          <text x="250" y="137" text-anchor="middle" fill="#38bdf8" font-size="11" font-weight="bold">FantastiClean</text>
          <text x="250" y="152" text-anchor="middle" fill="#34d399" font-size="8" font-weight="bold">50 PCS BULK BOX</text>
        </svg>
      `;
  }
}

function renderProducts() {
  const container = document.getElementById('products-grid');
  if (!container) return;

  const isEn = state.lang === 'en';
  const filtered = state.activeCategory === 'all'
    ? productsData
    : productsData.filter(p => p.category === state.activeCategory || p.secondaryCategory === state.activeCategory);

  container.innerHTML = filtered.map(product => {
    const title = isEn ? product.title_en : product.title_ge;
    const subtitle = isEn ? product.subtitle_en : product.subtitle_ge;
    const badge = isEn ? product.badge_en : product.badge_ge;
    const features = isEn ? product.features_en : product.features_ge;
    const dimensions = isEn ? product.specs.dimensions_en : product.specs.dimensions;
    const cartItem = state.cart.find(c => c.id === product.id);
    const inCartQty = cartItem ? cartItem.qty : 0;
    const topPill = product.specs.sheets || product.specs.gsm || (isEn ? 'Roll' : 'რულონი');
    const secondPill = product.specs.length || product.specs.durability || product.specs.washing;

    return `
      <div class="glass-card rounded-2xl overflow-hidden flex flex-col group relative transition-all duration-300 hover:shadow-xl bg-white border border-slate-200" id="card-${product.id}">
        <!-- Top Badge -->
        <div class="absolute top-4 left-4 z-10">
          <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-white ${product.badgeColor} shadow-sm">
            ${badge}
          </span>
        </div>

        <!-- Sheets / GSM Pill -->
        <div class="absolute top-4 right-4 z-10">
          <span class="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-900 text-white shadow-xs">
            ${topPill}
          </span>
        </div>

        <!-- Product Visual Illustration / Real Photo -->
        <div class="pt-8 pb-4 px-6 bg-gradient-to-b from-sky-50/70 via-slate-50 to-white flex items-center justify-center cursor-pointer min-h-[200px]" onclick="openProductQuickView('${product.id}')">
          ${product.image ? `
            <img src="${product.image}" alt="${title}" class="h-44 w-auto object-contain transition-transform duration-300 group-hover:scale-105" loading="lazy" onerror="if(!this.dataset.t1){this.dataset.t1='1'; this.src='images/${product.image.split('/').pop()}';} else if(!this.dataset.t2){this.dataset.t2='1'; this.src='${product.image.split('/').pop()}';} else {this.onerror=null; this.src='logo.png';}" />
          ` : getProductSvg(product.svgType)}
        </div>

        <!-- Product Body -->
        <div class="p-6 flex-1 flex flex-col justify-between">
          <div>
            <div class="text-xs font-semibold text-sky-600 uppercase tracking-wider mb-1">
              ${product.category === 'rolls' ? (isEn ? 'Microfiber Rolls' : 'მიკროფიბრის რულონი') :
                product.category === 'car' ? (isEn ? 'Car Detailing Line' : 'ავტო დითეილინგი') :
                product.category === 'glass' ? (isEn ? 'Glass & Mirror' : 'მინა და სარკე') :
                product.category === 'b2b' ? (isEn ? 'B2B Wholesale' : 'B2B საბითუმო') :
                (isEn ? 'Home & Kitchen' : 'სახლი და სამზარეულო')}
            </div>
            <h3 class="text-lg font-bold text-slate-900 leading-snug group-hover:text-sky-600 transition-colors cursor-pointer" onclick="openProductQuickView('${product.id}')">
              ${title}
            </h3>
            <p class="text-sm text-slate-500 mt-1 line-clamp-2">
              ${subtitle}
            </p>

            <!-- Specs Grid Pills -->
            <div class="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <div class="flex items-center gap-1.5 truncate">
                <i class="fa-solid fa-ruler-combined text-sky-500 text-xs shrink-0"></i>
                <span class="truncate">${dimensions}</span>
              </div>
              <div class="flex items-center gap-1.5 truncate">
                <i class="fa-solid fa-scroll text-emerald-500 text-xs shrink-0"></i>
                <span class="truncate">${secondPill}</span>
              </div>
            </div>

            <!-- Key Feature Bullets -->
            <ul class="mt-3.5 space-y-1.5 text-xs text-slate-600">
              ${features.slice(0, 2).map(f => `
                <li class="flex items-start gap-1.5">
                  <i class="fa-solid fa-check text-emerald-500 mt-0.5 text-[11px] shrink-0"></i>
                  <span>${f}</span>
                </li>
              `).join('')}
            </ul>
          </div>

          <!-- Price & Actions Footer -->
          <div class="mt-6 pt-4 border-t border-slate-100 flex flex-col gap-3">
            <div class="flex items-baseline justify-between">
              <div>
                <span class="text-xs text-slate-400 font-medium">${isEn ? 'Price' : 'ფასი'}:</span>
                <div class="flex items-baseline gap-1">
                  <span class="text-2xl font-black text-slate-900">${product.price.toFixed(2)}</span>
                  <span class="text-sm font-bold text-sky-600">₾</span>
                </div>
              </div>
              <div class="text-right">
                <span class="text-[11px] text-emerald-600 font-medium block">
                  ${isEn ? 'B2B from ₾' + product.b2bWholesalePrice.toFixed(2) : 'B2B საბითუმო: ₾' + product.b2bWholesalePrice.toFixed(2)}
                </span>
                <span class="text-[11px] text-slate-400">
                  <i class="fa-solid fa-circle-check text-emerald-500 mr-0.5"></i> ${isEn ? 'In Stock' : 'მარაგშია'}
                </span>
              </div>
            </div>

            <!-- Add to Quote Control -->
            <div class="flex items-center gap-2">
              <div class="flex items-center border border-slate-200 rounded-xl bg-slate-50 px-2 py-1">
                <button type="button" class="w-7 h-7 flex items-center justify-center text-slate-500 hover:text-slate-900 text-sm font-bold active:scale-95" onclick="changeCatalogCardQty('${product.id}', -1)">-</button>
                <input type="number" id="qty-input-${product.id}" value="${inCartQty > 0 ? inCartQty : 1}" min="1" max="999" class="w-10 text-center bg-transparent text-sm font-bold text-slate-800 focus:outline-none" onchange="validateCardQtyInput('${product.id}')" />
                <button type="button" class="w-7 h-7 flex items-center justify-center text-slate-500 hover:text-slate-900 text-sm font-bold active:scale-95" onclick="changeCatalogCardQty('${product.id}', 1)">+</button>
              </div>

              <button type="button" onclick="addProductFromCatalog('${product.id}')" class="flex-1 py-2.5 px-4 bg-sky-600 hover:bg-sky-500 active:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-md shadow-sky-500/20 flex items-center justify-center gap-1.5 transition-all">
                <i class="fa-solid fa-cart-plus text-xs"></i>
                <span>${isEn ? 'Add to Quote' : 'შეკვეთაში დამატება'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function changeCatalogCardQty(productId, delta) {
  const input = document.getElementById(`qty-input-${productId}`);
  if (!input) return;
  let val = parseInt(input.value) || 1;
  val = Math.max(1, val + delta);
  input.value = val;
}

function validateCardQtyInput(productId) {
  const input = document.getElementById(`qty-input-${productId}`);
  if (!input) return;
  let val = parseInt(input.value) || 1;
  if (val < 1) val = 1;
  input.value = val;
}

function addProductFromCatalog(productId) {
  const input = document.getElementById(`qty-input-${productId}`);
  const qty = input ? parseInt(input.value) || 1 : 1;
  
  const existing = state.cart.find(c => c.id === productId);
  if (existing) {
    existing.qty += qty;
  } else {
    state.cart.push({ id: productId, qty: qty });
  }

  updateCalculatorUI();
  updateCartBadge();

  const prod = productsData.find(p => p.id === productId);
  const name = state.lang === 'en' ? prod.title_en : prod.title_ge;
  showToast(state.lang === 'en' ? `Added ${qty}x ${name} to Quote!` : `დაემატა ${qty} ცალი: ${name}`);

  // Button feedback animation
  const card = document.getElementById(`card-${productId}`);
  if (card) {
    card.classList.add('ring-2', 'ring-emerald-500');
    setTimeout(() => card.classList.remove('ring-2', 'ring-emerald-500'), 600);
  }
}

function setupCategoryFilters() {
  const buttons = document.querySelectorAll('.category-tab-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => {
        b.classList.remove('bg-sky-600', 'text-white', 'shadow-md');
        b.classList.add('bg-white', 'text-slate-600', 'border', 'border-slate-200');
      });
      btn.classList.remove('bg-white', 'text-slate-600', 'border', 'border-slate-200');
      btn.classList.add('bg-sky-600', 'text-white', 'shadow-md');

      state.activeCategory = btn.getAttribute('data-cat');
      renderProducts();
    });
  });
}

// ==========================================
// 3. Interactive B2B Order & Price Calculator
// ==========================================
function setupCalculator() {
  // Client Type Toggle Buttons (Retail vs B2B)
  const retailBtn = document.getElementById('btn-client-retail');
  const b2bBtn = document.getElementById('btn-client-b2b');

  if (retailBtn && b2bBtn) {
    retailBtn.addEventListener('click', () => {
      state.clientType = 'retail';
      retailBtn.classList.add('bg-sky-600', 'text-white');
      retailBtn.classList.remove('bg-slate-100', 'text-slate-700');
      b2bBtn.classList.remove('bg-sky-600', 'text-white');
      b2bBtn.classList.add('bg-slate-100', 'text-slate-700');
      updateCalculatorUI();
    });

    b2bBtn.addEventListener('click', () => {
      state.clientType = 'b2b';
      b2bBtn.classList.add('bg-sky-600', 'text-white');
      b2bBtn.classList.remove('bg-slate-100', 'text-slate-700');
      retailBtn.classList.remove('bg-sky-600', 'text-white');
      retailBtn.classList.add('bg-slate-100', 'text-slate-700');
      updateCalculatorUI();
    });
  }

  // Populate Quick Product Selector Dropdown in Calculator
  const selector = document.getElementById('calc-add-product-select');
  if (selector) {
    selector.innerHTML = `
      <option value="">${state.lang === 'en' ? '-- Select a product to add --' : '-- აირჩიეთ პროდუქტი დასამატებლად --'}</option>
      ${productsData.map(p => `
        <option value="${p.id}">${state.lang === 'en' ? p.title_en : p.title_ge} (${p.price.toFixed(2)} ₾)</option>
      `).join('')}
    `;
  }

  // Quick Add Button in Calculator
  const addBtn = document.getElementById('calc-add-product-btn');
  if (addBtn && selector) {
    addBtn.addEventListener('click', () => {
      const selectedId = selector.value;
      if (!selectedId) return;
      const existing = state.cart.find(c => c.id === selectedId);
      if (existing) {
        existing.qty += 1;
      } else {
        state.cart.push({ id: selectedId, qty: 1 });
      }
      selector.value = '';
      updateCalculatorUI();
      updateCartBadge();
      showToast(state.lang === 'en' ? 'Item added to quote table' : 'პროდუქტი დაემატა შეთავაზების ცხრილში');
    });
  }

  // Bind Client Input Fields
  bindClientInputs();

  // Export Actions
  const generateOfferBtn = document.getElementById('btn-generate-offer');
  if (generateOfferBtn) {
    generateOfferBtn.addEventListener('click', openPrintableOfferModal);
  }

  const sendWhatsAppBtn = document.getElementById('btn-send-whatsapp');
  if (sendWhatsAppBtn) {
    sendWhatsAppBtn.addEventListener('click', sendOrderToWhatsApp);
  }

  const copySummaryBtn = document.getElementById('btn-copy-summary');
  if (copySummaryBtn) {
    copySummaryBtn.addEventListener('click', copyOrderToClipboard);
  }
}

function bindClientInputs() {
  const fields = ['name', 'taxId', 'person', 'phone', 'email', 'address', 'notes'];
  fields.forEach(field => {
    const input = document.getElementById(`client-${field}`);
    if (input) {
      input.value = state.clientInfo[field] || '';
      input.addEventListener('input', (e) => {
        state.clientInfo[field] = e.target.value;
      });
    }
  });
}

function updateCalculatorUI() {
  const isEn = state.lang === 'en';
  const tableBody = document.getElementById('calc-items-tbody');
  const emptyState = document.getElementById('calc-empty-state');
  const tableContainer = document.getElementById('calc-table-container');

  if (!tableBody) return;

  if (state.cart.length === 0) {
    if (emptyState) emptyState.classList.remove('hidden');
    if (tableContainer) tableContainer.classList.add('hidden');
  } else {
    if (emptyState) emptyState.classList.add('hidden');
    if (tableContainer) tableContainer.classList.remove('hidden');

    tableBody.innerHTML = state.cart.map((item, idx) => {
      const prod = productsData.find(p => p.id === item.id);
      if (!prod) return '';

      const title = isEn ? prod.title_en : prod.title_ge;
      const unitPrice = prod.price;
      const lineTotal = unitPrice * item.qty;

      return `
        <tr class="border-b border-slate-100 hover:bg-slate-50/70 transition-colors">
          <td class="py-3 px-4 font-semibold text-slate-800 text-sm">
            <div class="flex items-center gap-2">
              <span class="w-6 h-6 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center text-xs font-bold">${idx + 1}</span>
              <div>
                <p class="font-bold text-slate-900">${title}</p>
                <span class="text-xs text-slate-400">${prod.specs.sheets || prod.specs.gsm} • ${isEn ? prod.specs.dimensions_en : prod.specs.dimensions}</span>
              </div>
            </div>
          </td>
          <td class="py-3 px-4 text-sm font-semibold text-slate-700 whitespace-nowrap">
            ${unitPrice.toFixed(2)} ₾
          </td>
          <td class="py-3 px-4">
            <div class="flex items-center border border-slate-200 rounded-lg bg-white px-2 py-0.5 w-28">
              <button type="button" class="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-800 text-xs font-bold" onclick="updateCartItemQty('${item.id}', -1)">-</button>
              <input type="number" min="1" max="9999" value="${item.qty}" class="w-12 text-center bg-transparent text-xs font-bold text-slate-800 focus:outline-none" onchange="setCartItemQty('${item.id}', this.value)" />
              <button type="button" class="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-800 text-xs font-bold" onclick="updateCartItemQty('${item.id}', 1)">+</button>
            </div>
          </td>
          <td class="py-3 px-4 text-sm font-extrabold text-slate-900 whitespace-nowrap">
            ${lineTotal.toFixed(2)} ₾
          </td>
          <td class="py-3 px-4 text-center">
            <button type="button" class="text-slate-400 hover:text-red-500 transition-colors p-1" onclick="removeCartItem('${item.id}')" title="${isEn ? 'Remove' : 'წაშლა'}">
              <i class="fa-solid fa-trash-can text-sm"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  // Calculate Totals & Discounts
  let subtotal = 0;
  let totalPieces = 0;

  state.cart.forEach(item => {
    const prod = productsData.find(p => p.id === item.id);
    if (prod) {
      subtotal += prod.price * item.qty;
      totalPieces += item.qty;
    }
  });

  let discountRate = 0;
  if (state.clientType === 'b2b') {
    if (totalPieces >= 200) {
      discountRate = 0.20; // 20%
    } else if (totalPieces >= 100) {
      discountRate = 0.15; // 15%
    } else if (totalPieces >= 50) {
      discountRate = 0.10; // 10%
    } else {
      discountRate = 0.05; // 5% B2B base discount
    }
  }

  const discountAmount = subtotal * discountRate;
  const finalTotal = subtotal - discountAmount;
  const vatAmount = finalTotal * (18 / 118); // 18% VAT included

  // Update Summary DOM
  const subtotalEl = document.getElementById('calc-summary-subtotal');
  const discountEl = document.getElementById('calc-summary-discount');
  const discountRateBadge = document.getElementById('calc-discount-badge');
  const vatEl = document.getElementById('calc-summary-vat');
  const totalEl = document.getElementById('calc-summary-total');

  if (subtotalEl) subtotalEl.textContent = subtotal.toFixed(2) + ' ₾';
  if (discountEl) discountEl.textContent = '-' + discountAmount.toFixed(2) + ' ₾';
  if (vatEl) vatEl.textContent = vatAmount.toFixed(2) + ' ₾';
  if (totalEl) totalEl.textContent = finalTotal.toFixed(2) + ' ₾';

  if (discountRateBadge) {
    if (discountRate > 0) {
      discountRateBadge.textContent = `-${(discountRate * 100).toFixed(0)}%`;
      discountRateBadge.classList.remove('hidden');
    } else {
      discountRateBadge.classList.add('hidden');
    }
  }

  // Update live piece count indicator
  const pieceCountEl = document.getElementById('calc-total-units');
  if (pieceCountEl) {
    pieceCountEl.textContent = totalPieces + ' ' + (isEn ? 'units' : 'ცალი');
  }

  updateCartBadge();
}

function updateCartItemQty(id, delta) {
  const item = state.cart.find(c => c.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    state.cart = state.cart.filter(c => c.id !== id);
  }
  updateCalculatorUI();
}

function setCartItemQty(id, newQty) {
  const item = state.cart.find(c => c.id === id);
  if (!item) return;
  const parsed = parseInt(newQty) || 1;
  item.qty = Math.max(1, parsed);
  updateCalculatorUI();
}

function removeCartItem(id) {
  state.cart = state.cart.filter(c => c.id !== id);
  updateCalculatorUI();
  showToast(state.lang === 'en' ? 'Item removed' : 'პროდუქტი წაიშალა');
}

function updateCartBadge() {
  const badge = document.getElementById('nav-cart-count');
  if (!badge) return;
  const totalQty = state.cart.reduce((sum, item) => sum + item.qty, 0);
  badge.textContent = totalQty;
  if (totalQty > 0) {
    badge.classList.remove('hidden');
  } else {
    badge.classList.add('hidden');
  }
}

// ==========================================
// 4. One-Pager Commercial Offer Generator & Print
// ==========================================
function openPrintableOfferModal() {
  const modal = document.getElementById('printable-offer-modal');
  const container = document.getElementById('printable-offer-doc');
  if (!modal || !container) return;

  const isEn = state.lang === 'en';
  const dict = translations[state.lang].offerDoc;

  // Calculate numbers
  let subtotal = 0;
  let totalPieces = 0;
  state.cart.forEach(item => {
    const prod = productsData.find(p => p.id === item.id);
    if (prod) {
      subtotal += prod.price * item.qty;
      totalPieces += item.qty;
    }
  });

  let discountRate = 0;
  if (state.clientType === 'b2b') {
    if (totalPieces >= 200) discountRate = 0.20;
    else if (totalPieces >= 100) discountRate = 0.15;
    else if (totalPieces >= 50) discountRate = 0.10;
    else discountRate = 0.05;
  }

  const discountAmount = subtotal * discountRate;
  const finalTotal = subtotal - discountAmount;
  const vatAmount = finalTotal * (18 / 118);

  const validityDate = new Date();
  validityDate.setDate(validityDate.getDate() + 14);

  // Generate Clean, Professional Commercial Offer HTML
  container.innerHTML = `
    <div class="bg-white p-6 sm:p-10 rounded-2xl max-w-4xl mx-auto text-slate-800 shadow-2xl border border-slate-200">
      
      <!-- Top Action Bar (hidden on print) -->
      <div class="no-print flex items-center justify-between pb-6 mb-6 border-b border-slate-200">
        <div class="flex items-center gap-2">
          <span class="w-3 h-3 rounded-full bg-emerald-500"></span>
          <span class="text-sm font-bold text-slate-800">${dict.docTitle}</span>
        </div>
        <div class="flex items-center gap-3">
          <button type="button" onclick="window.print()" class="py-2.5 px-5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-all">
            <i class="fa-solid fa-print"></i>
            <span>${dict.printBtn}</span>
          </button>
          <button type="button" onclick="closePrintableOfferModal()" class="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all">
            <i class="fa-solid fa-xmark mr-1"></i>
            <span>${dict.closeBtn}</span>
          </button>
        </div>
      </div>

      <!-- Offer Header with Logo & Identity -->
      <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b-2 border-slate-900">
        <div class="flex items-center gap-4">
          <img src="logo.png" alt="FantastiClean Georgia" class="h-16 w-16 sm:h-20 sm:w-20 object-contain shrink-0" onerror="this.onerror=null; this.src='images/logo.png';" />
          <div>
            <h1 class="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Fantasti<span class="text-sky-600">Clean</span> Georgia</h1>
            <p class="text-xs font-semibold text-emerald-600 tracking-wider uppercase">შპს "ფანტასტიკლინ ჯორჯია" • LLC</p>
          </div>
        </div>
        <div class="text-left sm:text-right">
          <span class="inline-block px-3 py-1 bg-slate-900 text-white text-xs font-extrabold rounded-md uppercase tracking-wider mb-1">
            ${isEn ? 'OFFICIAL QUOTATION' : 'ოფიციალური შეთავაზება'}
          </span>
          <div class="text-xs text-slate-600 space-y-0.5">
            <p><span class="font-bold">${dict.offerNo}</span> <span class="text-sky-700 font-mono font-bold">${state.quoteNumber}</span></p>
            <p><span class="font-bold">${dict.date}</span> ${state.quoteDate}</p>
            <p><span class="font-bold">${dict.validUntil}</span> ${validityDate.toLocaleDateString(isEn ? 'en-US' : 'ka-GE')}</p>
          </div>
        </div>
      </div>

      <!-- Vendor & Client Information 2-Column Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 text-xs border-b border-slate-200">
        <!-- Vendor Info -->
        <div class="bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
          <h4 class="font-extrabold text-slate-900 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5 text-sky-700">
            <i class="fa-solid fa-building text-sky-600"></i> ${dict.vendorTitle}
          </h4>
          <p class="font-bold text-slate-900">${dict.vendorCompany}</p>
          <p class="text-slate-600">${dict.vendorTaxId}</p>
          <p class="text-slate-600">${dict.vendorAddress}</p>
          <p class="text-slate-600">${dict.vendorPhone}</p>
          <p class="text-slate-600">${dict.vendorEmail}</p>
          <div class="mt-2 pt-2 border-t border-slate-200 text-[11px] text-slate-700">
            <p class="font-bold">${dict.vendorBank}</p>
            <p class="font-mono text-slate-900">${dict.vendorIban}</p>
          </div>
        </div>

        <!-- Client Info -->
        <div class="bg-sky-50/50 p-4 rounded-xl border border-sky-100">
          <h4 class="font-extrabold text-slate-900 text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5 text-sky-700">
            <i class="fa-solid fa-user-tie text-sky-600"></i> ${dict.clientTitle}
          </h4>
          <p class="font-bold text-slate-900 text-sm">${state.clientInfo.name || (isEn ? 'Individual Customer' : 'ფიზიკური პირი')}</p>
          <p class="text-slate-600"><span class="font-medium">${dict.clientTaxId}</span> ${state.clientInfo.taxId || 'N/A'}</p>
          <p class="text-slate-600"><span class="font-medium">${dict.clientPerson}</span> ${state.clientInfo.person || 'N/A'}</p>
          <p class="text-slate-600"><span class="font-medium">${dict.clientPhone}</span> ${state.clientInfo.phone || 'N/A'}</p>
          <p class="text-slate-600"><span class="font-medium">${dict.clientEmail}</span> ${state.clientInfo.email || 'N/A'}</p>
          <p class="text-slate-600"><span class="font-medium">${dict.clientAddress}</span> ${state.clientInfo.address || 'N/A'}</p>
        </div>
      </div>

      <!-- Itemized Table -->
      <div class="py-6">
        <table class="w-full text-xs text-left border-collapse">
          <thead>
            <tr class="bg-slate-900 text-white font-bold uppercase tracking-wider">
              <th class="py-2.5 px-3 rounded-l-lg">${dict.tableHeadItem}</th>
              <th class="py-2.5 px-3">${dict.tableHeadDesc}</th>
              <th class="py-2.5 px-3 text-center">${dict.tableHeadUnit}</th>
              <th class="py-2.5 px-3 text-center">${dict.tableHeadQty}</th>
              <th class="py-2.5 px-3 text-right">${dict.tableHeadUnitPrice}</th>
              <th class="py-2.5 px-3 rounded-r-lg text-right">${dict.tableHeadTotal}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200">
            ${state.cart.map((item, index) => {
              const prod = productsData.find(p => p.id === item.id);
              if (!prod) return '';
              const title = isEn ? prod.title_en : prod.title_ge;
              const specs = `${prod.specs.sheets || prod.specs.gsm} • ${isEn ? prod.specs.dimensions_en : prod.specs.dimensions}`;
              const lineTotal = prod.price * item.qty;
              return `
                <tr class="hover:bg-slate-50">
                  <td class="py-3 px-3 font-bold text-slate-500">${index + 1}</td>
                  <td class="py-3 px-3">
                    <p class="font-bold text-slate-900 text-xs">${title}</p>
                    <p class="text-[11px] text-slate-500">${specs}</p>
                  </td>
                  <td class="py-3 px-3 text-center text-slate-600">${isEn ? 'pcs' : 'ცალი'}</td>
                  <td class="py-3 px-3 text-center font-bold text-slate-800">${item.qty}</td>
                  <td class="py-3 px-3 text-right text-slate-700">${prod.price.toFixed(2)}</td>
                  <td class="py-3 px-3 text-right font-bold text-slate-900">${lineTotal.toFixed(2)}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>

      <!-- Financial Totals Block -->
      <div class="flex justify-end pt-2 pb-6 border-b border-slate-200">
        <div class="w-full sm:w-72 space-y-2 text-xs">
          <div class="flex justify-between text-slate-600">
            <span>${dict.subtotalLabel}</span>
            <span class="font-semibold">${subtotal.toFixed(2)} ₾</span>
          </div>
          ${discountRate > 0 ? `
            <div class="flex justify-between text-emerald-600 font-semibold">
              <span>${dict.discountLabel} (${(discountRate * 100).toFixed(0)}%)</span>
              <span>-${discountAmount.toFixed(2)} ₾</span>
            </div>
          ` : ''}
          <div class="flex justify-between text-slate-500 text-[11px]">
            <span>${dict.vatLabel}</span>
            <span>${vatAmount.toFixed(2)} ₾</span>
          </div>
          <div class="flex justify-between text-sm sm:text-base font-black text-slate-900 pt-2 border-t-2 border-slate-900">
            <span>${dict.grandTotalLabel}</span>
            <span class="text-sky-700">${finalTotal.toFixed(2)} ₾</span>
          </div>
        </div>
      </div>

      <!-- Terms & Signatures -->
      <div class="pt-6 space-y-6">
        <div>
          <h5 class="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">${dict.termsTitle}</h5>
          <ul class="text-[11px] text-slate-600 space-y-1">
            <li>${dict.term1}</li>
            <li>${dict.term2}</li>
            <li>${dict.term3}</li>
            <li>${dict.term4}</li>
            <li>${dict.term5}</li>
          </ul>
        </div>

        <!-- Signature Boxes -->
        <div class="grid grid-cols-2 gap-8 pt-8">
          <div>
            <p class="text-xs font-bold text-slate-800 mb-1">${dict.signVendor}</p>
            <p class="text-[11px] text-slate-500 mb-8">FantastiClean Georgia LLC</p>
            <div class="border-b border-slate-400 w-48"></div>
            <p class="text-[10px] text-slate-400 mt-1">${isEn ? 'Seal & Authorized Signature' : 'ხელმოწერა & ბეჭედი'}</p>
          </div>
          <div class="text-right">
            <p class="text-xs font-bold text-slate-800 mb-1">${dict.signBuyer}</p>
            <p class="text-[11px] text-slate-500 mb-8">${state.clientInfo.name || 'Client'}</p>
            <div class="border-b border-slate-400 w-48 ml-auto"></div>
            <p class="text-[10px] text-slate-400 mt-1">${isEn ? 'Acceptance Signature' : 'უფლებამოსილი წარმომადგენელი'}</p>
          </div>
        </div>

        <!-- Footer Stamp Note -->
        <div class="text-center pt-4 text-[10px] text-slate-400">
          <p>FantastiClean Georgia LLC • www.fantasticlean.ge • Tel: +995 599 77 39 99 • Email: info@fantasticlean.ge</p>
        </div>
      </div>
    </div>
  `;

  modal.classList.remove('hidden');
  modal.classList.add('active', 'flex');
  document.body.style.overflow = 'hidden';
}

function closePrintableOfferModal() {
  const modal = document.getElementById('printable-offer-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('active', 'flex');
    document.body.style.overflow = '';
  }
}

// ==========================================
// 5. WhatsApp & Quick Share Integration
// ==========================================
function sendOrderToWhatsApp() {
  const isEn = state.lang === 'en';
  let message = isEn
    ? `*New Order Inquiry - FantastiClean Georgia*\n`
    : `*ახალი შეკვეთა / შეთავაზების მოთხოვნა - FantastiClean Georgia*\n`;

  message += `━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `${isEn ? 'Client' : 'დამკვეთი'}: ${state.clientInfo.name || 'N/A'}\n`;
  if (state.clientInfo.taxId) message += `${isEn ? 'Tax ID' : 'ს/კ'}: ${state.clientInfo.taxId}\n`;
  if (state.clientInfo.person) message += `${isEn ? 'Contact' : 'საკონტაქტო'}: ${state.clientInfo.person}\n`;
  if (state.clientInfo.phone) message += `${isEn ? 'Phone' : 'ტელეფონი'}: ${state.clientInfo.phone}\n`;
  if (state.clientInfo.address) message += `${isEn ? 'Address' : 'მისამართი'}: ${state.clientInfo.address}\n`;
  message += `━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `${isEn ? 'Items in Order' : 'შეკვეთის პროდუქტები'}:\n`;

  let subtotal = 0;
  let totalPieces = 0;

  state.cart.forEach((item, idx) => {
    const prod = productsData.find(p => p.id === item.id);
    if (prod) {
      const title = isEn ? prod.title_en : prod.title_ge;
      const line = prod.price * item.qty;
      subtotal += line;
      totalPieces += item.qty;
      message += `${idx + 1}. ${title} x ${item.qty} ${isEn ? 'pcs' : 'ცალი'} = ${line.toFixed(2)} ₾\n`;
    }
  });

  let discountRate = 0;
  if (state.clientType === 'b2b') {
    if (totalPieces >= 200) discountRate = 0.20;
    else if (totalPieces >= 100) discountRate = 0.15;
    else if (totalPieces >= 50) discountRate = 0.10;
    else discountRate = 0.05;
  }

  const discountAmount = subtotal * discountRate;
  const finalTotal = subtotal - discountAmount;

  message += `━━━━━━━━━━━━━━━━━━━━━\n`;
  message += `${isEn ? 'Subtotal' : 'საწყისი ჯამი'}: ${subtotal.toFixed(2)} ₾\n`;
  if (discountRate > 0) {
    message += `${isEn ? 'Wholesale Discount' : 'საბითუმო ფასდაკლება'}: -${discountAmount.toFixed(2)} ₾ (-${(discountRate * 100).toFixed(0)}%)\n`;
  }
  message += `*${isEn ? 'Total Payable' : 'საბოლოო თანხა'}*: *${finalTotal.toFixed(2)} ₾*\n`;
  if (state.clientInfo.notes) {
    message += `\n${isEn ? 'Notes' : 'შენიშვნა'}: ${state.clientInfo.notes}\n`;
  }

  const phone = '995599773999';
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
}

function copyOrderToClipboard() {
  const isEn = state.lang === 'en';
  let text = `FantastiClean Georgia - Order Summary (${state.quoteNumber})\n`;
  text += `Client: ${state.clientInfo.name || 'Individual'}\n`;
  text += `Items:\n`;

  let subtotal = 0;
  state.cart.forEach((item, idx) => {
    const prod = productsData.find(p => p.id === item.id);
    if (prod) {
      const title = isEn ? prod.title_en : prod.title_ge;
      const line = prod.price * item.qty;
      subtotal += line;
      text += `${idx + 1}. ${title} (x${item.qty}) = ${line.toFixed(2)} GEL\n`;
    }
  });
  text += `Total: ${subtotal.toFixed(2)} GEL\nContact: +995 599 77 39 99 | info@fantasticlean.ge`;

  navigator.clipboard.writeText(text).then(() => {
    showToast(translations[state.lang].calculator.copiedNotice);
  }).catch(() => {
    showToast('Failed to copy');
  });
}

// ==========================================
// 6. Quick View & Delivery Partner Modals
// ==========================================
function openProductQuickView(productId) {
  const prod = productsData.find(p => p.id === productId);
  if (!prod) return;

  const modal = document.getElementById('product-modal');
  const modalContent = document.getElementById('product-modal-content');
  if (!modal || !modalContent) return;

  const isEn = state.lang === 'en';
  const title = isEn ? prod.title_en : prod.title_ge;
  const desc = isEn ? prod.desc_en : prod.desc_ge;
  const features = isEn ? prod.features_en : prod.features_ge;
  const specs = prod.specs;

  modalContent.innerHTML = `
    <div class="relative bg-white rounded-3xl overflow-hidden shadow-2xl max-w-2xl w-full border border-slate-200">
      <button type="button" onclick="closeProductQuickView()" class="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-all">
        <i class="fa-solid fa-xmark text-sm"></i>
      </button>

      <div class="p-6 sm:p-8 bg-gradient-to-b from-sky-50/60 to-white flex flex-col items-center justify-center">
        ${prod.image ? `
          <img id="modal-quick-img" src="${prod.image}" alt="${title}" class="h-52 w-auto object-contain transition-all duration-200" onerror="if(!this.dataset.t1){this.dataset.t1='1'; this.src='images/${prod.image.split('/').pop()}';} else if(!this.dataset.t2){this.dataset.t2='1'; this.src='${prod.image.split('/').pop()}';} else {this.onerror=null; this.src='logo.png';}" />
        ` : getProductSvg(prod.svgType)}
        ${prod.gallery ? `
          <div class="flex items-center gap-2 mt-4">
            ${prod.gallery.map((gImg, gIdx) => `
              <button type="button" onclick="document.getElementById('modal-quick-img').src='${gImg}'; this.parentElement.querySelectorAll('button').forEach(b=>b.classList.remove('ring-2','ring-sky-500')); this.classList.add('ring-2','ring-sky-500');" class="w-11 h-11 rounded-xl overflow-hidden border border-slate-200 bg-white p-0.5 hover:border-sky-500 transition-all ${gIdx===0?'ring-2 ring-sky-500':''}">
                <img src="${gImg}" class="w-full h-full object-contain" onerror="if(!this.dataset.t1){this.dataset.t1='1'; this.src='images/${gImg.split('/').pop()}';} else if(!this.dataset.t2){this.dataset.t2='1'; this.src='${gImg.split('/').pop()}';} else {this.onerror=null; this.src='logo.png';}" />
              </button>
            `).join('')}
          </div>
        ` : ''}
      </div>

      <div class="p-6 sm:p-8">
        <div class="flex items-center gap-2 mb-2">
          <span class="px-2.5 py-1 rounded-full text-xs font-bold text-white ${prod.badgeColor}">
            ${isEn ? prod.badge_en : prod.badge_ge}
          </span>
          <span class="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-800">
            ${specs.sheets || specs.gsm || (isEn ? 'Roll' : 'რულონი')}
          </span>
        </div>

        <h3 class="text-xl sm:text-2xl font-black text-slate-900 leading-tight mb-2">
          ${title}
        </h3>
        <p class="text-sm text-slate-600 leading-relaxed mb-6">
          ${desc}
        </p>

        <!-- Technical Specs Table -->
        <div class="bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-6 space-y-2 text-xs">
          ${specs.sheets ? `
            <div class="flex justify-between py-1 border-b border-slate-200/60">
              <span class="text-slate-500">${isEn ? 'Package / Sheets' : 'რაოდენობა რულონში'}:</span>
              <span class="font-bold text-slate-900">${isEn ? specs.sheets_en : specs.sheets}</span>
            </div>
          ` : ''}
          ${specs.dimensions ? `
            <div class="flex justify-between py-1 border-b border-slate-200/60">
              <span class="text-slate-500">${isEn ? 'Dimensions' : 'ზომა'}:</span>
              <span class="font-bold text-slate-900">${isEn ? specs.dimensions_en : specs.dimensions}</span>
            </div>
          ` : ''}
          ${specs.length ? `
            <div class="flex justify-between py-1 border-b border-slate-200/60">
              <span class="text-slate-500">${isEn ? 'Roll Length' : 'რულონის სიგრძე'}:</span>
              <span class="font-bold text-slate-900">${isEn ? specs.length_en : specs.length}</span>
            </div>
          ` : ''}
          ${specs.durability ? `
            <div class="flex justify-between py-1 border-b border-slate-200/60">
              <span class="text-slate-500">${isEn ? 'Durability' : 'გამძლეობა'}:</span>
              <span class="font-bold text-emerald-600">${isEn ? specs.durability_en : specs.durability}</span>
            </div>
          ` : ''}
          ${specs.washing ? `
            <div class="flex justify-between py-1 border-b border-slate-200/60">
              <span class="text-slate-500">${isEn ? 'Washing Care' : 'რეცხვის წესი'}:</span>
              <span class="font-bold text-slate-900">${isEn ? specs.washing_en : specs.washing}</span>
            </div>
          ` : ''}
          ${specs.color ? `
            <div class="flex justify-between py-1">
              <span class="text-slate-500">${isEn ? 'Colorways' : 'ფერები'}:</span>
              <span class="font-bold text-slate-900">${isEn ? specs.color_en : specs.color}</span>
            </div>
          ` : ''}
        </div>

        <!-- Add to Order Bar -->
        <div class="flex items-center justify-between gap-4 pt-4 border-t border-slate-100">
          <div>
            <span class="text-xs text-slate-400 block">${isEn ? 'Retail Price' : 'საცალო ფასი'}</span>
            <span class="text-2xl font-black text-slate-900">${prod.price.toFixed(2)} <span class="text-sky-600 text-sm font-bold">₾</span></span>
          </div>
          <button type="button" onclick="addProductFromCatalog('${prod.id}'); closeProductQuickView();" class="py-3 px-6 bg-sky-600 hover:bg-sky-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-sky-500/25 flex items-center gap-2 transition-all">
            <i class="fa-solid fa-cart-plus"></i>
            <span>${isEn ? 'Add to Quote' : 'შეკვეთაში დამატება'}</span>
          </button>
        </div>
      </div>
    </div>
  `;

  modal.classList.remove('hidden');
  modal.classList.add('flex');
  document.body.style.overflow = 'hidden';
}

function closeProductQuickView() {
  const modal = document.getElementById('product-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = '';
  }
}

function openDeliveryModal() {
  const modal = document.getElementById('delivery-modal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
  }
}

function closeDeliveryModal() {
  const modal = document.getElementById('delivery-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = '';
  }
}

function openFlyerModal() {
  const modal = document.getElementById('flyer-modal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    document.body.style.overflow = 'hidden';
  }
}

function closeFlyerModal() {
  const modal = document.getElementById('flyer-modal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    document.body.style.overflow = '';
  }
}

function setupModals() {
  // Close modals on backdrop click
  window.addEventListener('click', (e) => {
    const productModal = document.getElementById('product-modal');
    if (e.target === productModal) {
      closeProductQuickView();
    }
    const deliveryModal = document.getElementById('delivery-modal');
    if (e.target === deliveryModal) {
      closeDeliveryModal();
    }
    const offerModal = document.getElementById('printable-offer-modal');
    if (e.target === offerModal) {
      closePrintableOfferModal();
    }
    const flyerModal = document.getElementById('flyer-modal');
    if (e.target === flyerModal) {
      closeFlyerModal();
    }
  });

  // Wolt/Glovo triggers
  document.querySelectorAll('.open-delivery-modal-btn').forEach(btn => {
    btn.addEventListener('click', openDeliveryModal);
  });
}

// ==========================================
// 7. Floating Quick Chat & Contact Form
// ==========================================
function setupQuickChat() {
  const chatToggle = document.getElementById('floating-chat-toggle');
  const chatBox = document.getElementById('floating-chat-box');
  const chatClose = document.getElementById('floating-chat-close');

  if (chatToggle && chatBox) {
    chatToggle.addEventListener('click', () => {
      chatBox.classList.toggle('hidden');
    });
  }

  if (chatClose && chatBox) {
    chatClose.addEventListener('click', () => {
      chatBox.classList.add('hidden');
    });
  }
}

function setupContactForm() {
  const form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast(translations[state.lang].contact.formSuccess);
      form.reset();
    });
  }
}

function setupMobileMenu() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const closeBtn = document.getElementById('mobile-menu-close');

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      mobileMenu.classList.remove('hidden');
    });
  }

  if (closeBtn && mobileMenu) {
    closeBtn.addEventListener('click', () => {
      mobileMenu.classList.add('hidden');
    });
  }

  // Close on nav link click
  document.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', () => {
      if (mobileMenu) mobileMenu.classList.add('hidden');
    });
  });
}

// ==========================================
// 8. Toast Helper
// ==========================================
function showToast(msg) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast-msg';
  toast.innerHTML = `<i class="fa-solid fa-circle-info text-sky-400"></i><span>${msg}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    if (toast.parentNode) toast.parentNode.removeChild(toast);
  }, 3200);
}
