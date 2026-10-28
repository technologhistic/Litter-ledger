import { Language } from '../types';

export const TRANSLATIONS = {
  en: {
    // Nav tabs
    sellToday: 'Sell Today',
    itemsRates: 'Items & Rates',
    thisMonth: 'This Month',
    salesHistory: 'Sales History',
    dataSettings: 'Data & Settings',

    // Shifts
    morning: 'Morning',
    noon: 'Noon',
    evening: 'Evening',
    morningNp: 'बिहान',
    noonNp: 'दिउँसो',
    eveningNp: 'साँझ',

    // Sell View
    quickSalesEntry: 'Quick Sales Entry',
    selectItem: 'Select Liquid / Dairy Item',
    quantityLitres: 'Quantity (Litres)',
    ratePerLitre: 'Rate per Litre',
    totalAmount: 'Total Amount',
    customerOrNotes: 'Customer Name / Notes (Optional)',
    recordSale: 'Save & Record Sale',
    todaySummary: "Today's Summary",
    totalLitres: 'Total Litres',
    totalSales: 'Total Earnings',
    salesCount: 'Transactions',
    printDailySummary: 'Print Shift Summary',
    noSalesToday: 'No sales recorded today yet.',
    noItemsAvailable: 'No items in catalog. Add items in Items & Rates tab.',

    // Items View
    itemCatalog: 'Items & Price Catalog',
    itemCatalogDesc: 'Manage your liquid and dairy products, standard rate per litre, and catalog items.',
    addNewItem: 'Add a New Item',
    itemName: 'Item Name (e.g. Cow Milk, Buffalo Milk)',
    itemPrice: 'Price per Litre',
    addItemBtn: 'Add Item to Catalog',
    editPrice: 'Edit Rate',
    savePrice: 'Save Price',
    deleteItem: 'Delete Item',
    confirmDeleteItem: 'Are you sure you want to delete this item?',
    emptyCatalog: 'Your Item Catalog is Empty',
    emptyCatalogDesc: 'Add your genuine milk varieties or dairy products with their price per litre below.',

    // Month View
    monthlyAnalytics: 'Monthly Sales Analytics',
    monthlyDesc: 'Comprehensive volume tracking, daily breakdown, and monthly revenue.',
    monthlyTotals: 'Month Totals',
    dailyAverage: 'Daily Average',
    highestDay: 'Highest Day',
    calendarView: 'Calendar Breakdown',
    dayCol: 'Day',
    litresCol: 'Litres',
    amountCol: 'Amount',
    shiftCol: 'Shifts Logged',

    // History View
    historyTitle: 'Sales History & Records',
    historyDesc: 'Review past transactions, print receipts, and filter by date.',
    searchPlaceholder: 'Search customer name or item...',
    filterByShift: 'Filter Shift',
    allShifts: 'All Shifts',
    receiptBtn: 'Receipt',
    deleteSale: 'Delete',
    noHistory: 'No sales records found matching your filter.',

    // Settings View
    settingsTitle: 'Data Backup & App Settings',
    settingsDesc: 'Configure business profile, theme mode, language, and export local data.',
    appearanceAndLang: 'Appearance & Language',
    themeMode: 'Theme Mode',
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
    language: 'App Language',
    english: 'English',
    nepali: 'नेपाली (Nepali)',
    businessProfile: 'Business Profile & Receipts',
    businessName: 'Business / Dairy Name',
    phone: 'Contact Phone Number',
    address: 'Address / Location',
    currencySymbol: 'Currency Symbol',
    calendarSystem: 'Default Calendar System',
    saveSettingsBtn: 'Save Settings',
    exportBackup: 'Export JSON Backup',
    exportCsv: 'Export CSV Spreadsheet',
    importBackup: 'Import JSON Backup',
    resetDatabase: 'Reset All Ledger Data',

    // Receipt
    salesReceipt: 'SALES RECEIPT',
    billTo: 'Customer',
    date: 'Date',
    shift: 'Shift',
    rate: 'Rate',
    litres: 'Litres',
    total: 'Total',
    printBtn: 'Print Receipt',
    closeBtn: 'Close',
    shareWhatsapp: 'Share on WhatsApp',

    // Common
    update: 'Update',
    updateAvailable: 'Update Available',
    updating: 'Updating...',
    online: 'Online',
    offline: 'Offline (Saved Locally)',
    bsCalendar: 'BS Calendar',
    adCalendar: 'AD Calendar',
  },
  np: {
    // Nav tabs
    sellToday: 'आजको बिक्री',
    itemsRates: 'वस्तु तथा दर',
    thisMonth: 'यस महिना',
    salesHistory: 'बिक्री इतिहास',
    dataSettings: 'डाटा र सेटिङ',

    // Shifts
    morning: 'बिहान',
    noon: 'दिउँसो',
    evening: 'साँझ',
    morningNp: 'बिहान',
    noonNp: 'दिउँसो',
    eveningNp: 'साँझ',

    // Sell View
    quickSalesEntry: 'द्रुत बिक्री प्रविष्टि',
    selectItem: 'दूध / डेरी वस्तु छान्नुहोस्',
    quantityLitres: 'परिमाण (लिटर)',
    ratePerLitre: 'प्रति लिटर दर',
    totalAmount: 'जम्मा रकम',
    customerOrNotes: 'ग्राहकको नाम / कैफियत (ऐच्छिक)',
    recordSale: 'बिक्री सुरक्षित गर्नुहोस्',
    todaySummary: 'आजको सारांश',
    totalLitres: 'जम्मा लिटर',
    totalSales: 'जम्मा आम्दानी',
    salesCount: 'बिक्री संख्या',
    printDailySummary: 'शिफ्ट सारांश छाप्नुहोस्',
    noSalesToday: 'आज कुनै बिक्री रेकर्ड गरिएको छैन।',
    noItemsAvailable: 'कुनै वस्तु उपलब्ध छैन। वस्तु तथा दर ट्याबमा गएर थप्नुहोस्।',

    // Items View
    itemCatalog: 'वस्तु तथा मूल्य सूची',
    itemCatalogDesc: 'तपाईंका दूध, दुग्धजन्य वस्तुहरू र प्रति लिटर दर व्यवस्थापन गर्नुहोस्।',
    addNewItem: 'नयाँ वस्तु थप्नुहोस्',
    itemName: 'वस्तुको नाम (जस्तै: गाईको दूध, भैंसीको दूध)',
    itemPrice: 'प्रति लिटर दर',
    addItemBtn: 'सूचीमा थप्नुहोस्',
    editPrice: 'दर सम्पादन गर्नुहोस्',
    savePrice: 'दर सुरक्षित गर्नुहोस्',
    deleteItem: 'हटाउनुहोस्',
    confirmDeleteItem: 'के तपाईं यो वस्तु हटाउन निश्चित हुनुहुन्छ?',
    emptyCatalog: 'वस्तु सूची खाली छ',
    emptyCatalogDesc: 'तलको फारम प्रयोग गरी आफ्ना दूध तथा दुग्धजन्य उत्पादनहरू प्रति लिटर दरसहित थप्नुहोस्।',

    // Month View
    monthlyAnalytics: 'मासिक बिक्री विश्लेषण',
    monthlyDesc: 'मासिक बिक्री परिमाण, दैनिक विवरण र कुल आम्दानी।',
    monthlyTotals: 'महिनाको जम्मा',
    dailyAverage: 'दैनिक औसत',
    highestDay: 'सबैभन्दा धेरै बिक्री भएको दिन',
    calendarView: 'क्यालेन्डर अनुसार विवरण',
    dayCol: 'दिन / गते',
    litresCol: 'लिटर',
    amountCol: 'रकम',
    shiftCol: 'शिफ्टहरू',

    // History View
    historyTitle: 'बिक्री इतिहास तथा अभिलेख',
    historyDesc: 'विगतका कारोबारहरू हेर्नुहोस्, रसिद छाप्नुहोस् र मिति अनुसार खोज्नुहोस्।',
    searchPlaceholder: 'ग्राहकको नाम वा वस्तु खोज्नुहोस्...',
    filterByShift: 'शिफ्ट अनुसार फिल्टर',
    allShifts: 'सबै शिफ्ट',
    receiptBtn: 'रसिद',
    deleteSale: 'हटाउनुहोस्',
    noHistory: 'कुनै पनि बिक्री रेकर्ड फेला परेन।',

    // Settings View
    settingsTitle: 'डाटा ब्याकअप र एप सेटिङ',
    settingsDesc: 'डेरी विवरण, लाइट/डार्क मोड, भाषा र डाटा सुरक्षित गर्नुहोस्।',
    appearanceAndLang: 'रूपरेखा र भाषा सेटिङ (Appearance & Language)',
    themeMode: 'थिम मोड (Theme Mode)',
    lightMode: 'हल्का मोड (Light)',
    darkMode: 'गाढा मोड (Dark)',
    language: 'एपको भाषा (Language)',
    english: 'English (अंग्रेजी)',
    nepali: 'नेपाली (Nepali)',
    businessProfile: 'व्यवसाय / डेरी प्रोफाइल र रसिद',
    businessName: 'डेरी वा पसलको नाम',
    phone: 'सम्पर्क फोन नम्बर',
    address: 'ठेगाना / स्थान',
    currencySymbol: 'मुद्रा संकेत (Currency)',
    calendarSystem: 'मुख्य क्यालेन्डर प्रणाली',
    saveSettingsBtn: 'सेटिङ सुरक्षित गर्नुहोस्',
    exportBackup: 'JSON ब्याकअप डाउनलोड गर्नुहोस्',
    exportCsv: 'Excel / CSV फाइल डाउनलोड गर्नुहोस्',
    importBackup: 'JSON ब्याकअप लोड गर्नुहोस्',
    resetDatabase: 'सबै डाटा रिसेट गर्नुहोस्',

    // Receipt
    salesReceipt: 'बिक्री रसिद',
    billTo: 'ग्राहक',
    date: 'मिति',
    shift: 'शिफ्ट',
    rate: 'दर',
    litres: 'लिटर',
    total: 'जम्मा',
    printBtn: 'रसिद छाप्नुहोस्',
    closeBtn: 'बन्द गर्नुहोस्',
    shareWhatsapp: 'व्हाट्सएपमा पठाउनुहोस्',

    // Common
    update: 'अपडेट',
    updateAvailable: 'अपडेट उपलब्ध',
    updating: 'अपडेट हुँदैछ...',
    online: 'अनलाइन',
    offline: 'अफलाइन (यन्त्रमा सुरक्षित)',
    bsCalendar: 'वि.सं. क्यालेन्डर',
    adCalendar: 'ई.सं. क्यालेन्डर',
  },
};

export type TranslationKey = keyof typeof TRANSLATIONS.en;

export function getTranslation(lang: Language, key: TranslationKey): string {
  const currentLang = lang || 'en';
  return TRANSLATIONS[currentLang]?.[key] || TRANSLATIONS.en[key] || key;
}
