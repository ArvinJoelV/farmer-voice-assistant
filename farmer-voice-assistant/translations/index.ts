/**
 * Translation strings for all supported languages
 */

// Helper to get English translations as fallback
const getEnglishTranslations = () => ({
  // Common
  'common.save': 'Save',
  'common.cancel': 'Cancel',
  'common.delete': 'Delete',
  'common.clear': 'Clear',
  'common.loading': 'Loading...',
  'common.error': 'Error',
  'common.success': 'Success',
  'common.confirm': 'Confirm',
  
  // Settings
  'settings.title': 'Settings',
  'settings.subtitle': 'Customize your farming assistant',
  'settings.language': 'Language Preference',
  'settings.backend': 'Backend Server',
  'settings.location': 'Your Location',
  'settings.preferences': 'App Preferences',
  'settings.voice': 'Voice Assistant',
  'settings.voiceDesc': 'Enable voice input/output',
  'settings.offline': 'Offline Mode',
  'settings.offlineDesc': 'Use cached responses when offline',
  'settings.notifications': 'Notifications',
  'settings.notificationsDesc': 'Get farming tips and alerts',
  'settings.dataManagement': 'Data Management',
  'settings.clearHistory': 'Clear Conversation History',
  'settings.export': 'Export Settings',
  'settings.logout': 'Logout',
  'settings.saveAll': 'Save All Settings',
  'settings.saved': 'Settings saved successfully!',
  'settings.saveError': 'Failed to save settings',
  
  // Smart Crop Advisor
  'crop.title': 'Smart Crop Advisor',
  'crop.helper': 'Enter your soil and weather values to get AI-powered crop suggestions tailored to your conditions.',
  'crop.soilNutrients': 'Soil Nutrients',
  'crop.weather': 'Weather Conditions',
  'crop.nitrogen': 'Nitrogen (N)',
  'crop.phosphorus': 'Phosphorus (P)',
  'crop.potassium': 'Potassium (K)',
  'crop.temperature': 'Temperature (°C)',
  'crop.humidity': 'Humidity (%)',
  'crop.ph': 'pH',
  'crop.rainfall': 'Rainfall (mm)',
  'crop.location': 'Location (Optional)',
  'crop.getRecommendation': 'Get Recommendation',
  'crop.recommended': 'Recommended Crop',
  'crop.confidence': 'Confidence',
  'crop.top3': 'Top 3 Recommendations',
  'crop.reasoning': 'Reasoning',
  
  // My Crops
  'crops.title': 'My Crops',
  'crops.add': 'Add Crop',
  'crops.empty': 'No crops yet',
  'crops.emptyDesc': 'Add your crops to get stage-wise advisory and weather alerts.',
  'crops.currentStage': 'Current Stage',
  'crops.nextAction': 'Next Action',
  'crops.due': 'Due',
  
  // Explore
  'explore.title': 'Explore',
  'explore.weather': 'Weather',
  'explore.suggestions': 'Smart Weather Suggestions',
  'explore.news': 'Latest Farming News',
  'explore.tip': 'Farming Tip of the Day',
  
  // Chat
  'chat.title': 'CROPWISE Assistant',
  'chat.placeholder': 'Ask about crops, weather, fertilizers...',
  'chat.newChat': 'New Conversation',
  'chat.welcome': 'Hello! I am your farming assistant. Ask me anything about farming and I will help you.',
  
  // Network
  'network.title': 'Farmer Network',
  'network.community': 'Community',
  'network.workers': 'Workers',
  'network.jobs': 'Jobs',
  
  // Schemes
  'schemes.title': 'Schemes & Subsidies',
  'schemes.search': 'Search schemes...',
  
  // History
  'history.title': 'Conversation History',
  'history.empty': 'No Conversations Yet',
  'history.emptyDesc': 'Start chatting with your farming assistant to see your conversation history here.',
  'history.clear': 'Clear All',
});

export const translations: Record<string, Record<string, string>> = {
  en: getEnglishTranslations(),
  
  hi: {
    // Common
    'common.save': 'सहेजें',
    'common.cancel': 'रद्द करें',
    'common.delete': 'हटाएं',
    'common.clear': 'साफ करें',
    'common.loading': 'लोड हो रहा है...',
    'common.error': 'त्रुटि',
    'common.success': 'सफल',
    'common.confirm': 'पुष्टि करें',
    
    // Settings
    'settings.title': 'सेटिंग्स',
    'settings.subtitle': 'अपने कृषि सहायक को अनुकूलित करें',
    'settings.language': 'भाषा वरीयता',
    'settings.backend': 'बैकएंड सर्वर',
    'settings.location': 'आपका स्थान',
    'settings.preferences': 'ऐप वरीयताएं',
    'settings.voice': 'वॉइस असिस्टेंट',
    'settings.voiceDesc': 'वॉइस इनपुट/आउटपुट सक्षम करें',
    'settings.offline': 'ऑफलाइन मोड',
    'settings.offlineDesc': 'ऑफलाइन होने पर कैश्ड प्रतिक्रियाएं उपयोग करें',
    'settings.notifications': 'सूचनाएं',
    'settings.notificationsDesc': 'कृषि सुझाव और अलर्ट प्राप्त करें',
    'settings.dataManagement': 'डेटा प्रबंधन',
    'settings.clearHistory': 'वार्तालाप इतिहास साफ करें',
    'settings.export': 'सेटिंग्स निर्यात करें',
    'settings.logout': 'लॉगआउट',
    'settings.saveAll': 'सभी सेटिंग्स सहेजें',
    'settings.saved': 'सेटिंग्स सफलतापूर्वक सहेजी गईं!',
    'settings.saveError': 'सेटिंग्स सहेजने में विफल',
    
    // Smart Crop Advisor
    'crop.title': 'स्मार्ट फसल सलाहकार',
    'crop.helper': 'अपनी मिट्टी और मौसम के मूल्य दर्ज करें ताकि आपकी स्थितियों के अनुरूप AI-संचालित फसल सुझाव प्राप्त कर सकें।',
    'crop.soilNutrients': 'मिट्टी के पोषक तत्व',
    'crop.weather': 'मौसम की स्थिति',
    'crop.nitrogen': 'नाइट्रोजन (N)',
    'crop.phosphorus': 'फॉस्फोरस (P)',
    'crop.potassium': 'पोटैशियम (K)',
    'crop.temperature': 'तापमान (°C)',
    'crop.humidity': 'आर्द्रता (%)',
    'crop.ph': 'pH',
    'crop.rainfall': 'वर्षा (mm)',
    'crop.location': 'स्थान (वैकल्पिक)',
    'crop.getRecommendation': 'सिफारिश प्राप्त करें',
    'crop.recommended': 'अनुशंसित फसल',
    'crop.confidence': 'आत्मविश्वास',
    'crop.top3': 'शीर्ष 3 सिफारिशें',
    'crop.reasoning': 'तर्क',
    
    // My Crops
    'crops.title': 'मेरी फसलें',
    'crops.add': 'फसल जोड़ें',
    'crops.empty': 'अभी तक कोई फसल नहीं',
    'crops.emptyDesc': 'चरण-वार सलाह और मौसम अलर्ट प्राप्त करने के लिए अपनी फसलें जोड़ें।',
    'crops.currentStage': 'वर्तमान चरण',
    'crops.nextAction': 'अगली कार्रवाई',
    'crops.due': 'नियत तारीख',
    
    // Explore
    'explore.title': 'अन्वेषण',
    'explore.weather': 'मौसम',
    'explore.suggestions': 'स्मार्ट मौसम सुझाव',
    'explore.news': 'नवीनतम कृषि समाचार',
    'explore.tip': 'दिन का कृषि सुझाव',
    
    // Chat
    'chat.title': 'CROPWISE सहायक',
    'chat.placeholder': 'फसलों, मौसम, उर्वरकों के बारे में पूछें...',
    'chat.newChat': 'नई बातचीत',
    'chat.welcome': 'नमस्ते! मैं आपका कृषि सहायक हूं। कृषि के बारे में कुछ भी पूछें और मैं आपकी मदद करूंगा।',
    
    // Network
    'network.title': 'किसान नेटवर्क',
    'network.community': 'समुदाय',
    'network.workers': 'कर्मचारी',
    'network.jobs': 'नौकरियां',
    
    // Schemes
    'schemes.title': 'योजनाएं और सब्सिडी',
    'schemes.search': 'योजनाएं खोजें...',
    
    // History
    'history.title': 'वार्तालाप इतिहास',
    'history.empty': 'अभी तक कोई वार्तालाप नहीं',
    'history.emptyDesc': 'अपना वार्तालाप इतिहास देखने के लिए अपने कृषि सहायक के साथ चैटिंग शुरू करें।',
    'history.clear': 'सभी साफ करें',
  },
  
  ta: {
    // Common
    'common.save': 'சேமி',
    'common.cancel': 'ரத்துசெய்',
    'common.delete': 'நீக்கு',
    'common.clear': 'அழி',
    'common.loading': 'ஏற்றுகிறது...',
    'common.error': 'பிழை',
    'common.success': 'வெற்றி',
    'common.confirm': 'உறுதிப்படுத்து',
    
    // Settings
    'settings.title': 'அமைப்புகள்',
    'settings.subtitle': 'உங்கள் விவசாய உதவியாளரைத் தனிப்பயனாக்கவும்',
    'settings.language': 'மொழி விருப்பம்',
    'settings.backend': 'பேக்கண்ட் சர்வர்',
    'settings.location': 'உங்கள் இடம்',
    'settings.preferences': 'ஆப் விருப்பங்கள்',
    'settings.voice': 'குரல் உதவியாளர்',
    'settings.voiceDesc': 'குரல் உள்ளீடு/வெளியீட்டை இயக்கவும்',
    'settings.offline': 'ஆஃப்லைன் மோட்',
    'settings.offlineDesc': 'ஆஃப்லைனில் இருக்கும்போது கேச் செய்யப்பட்ட பதில்களைப் பயன்படுத்தவும்',
    'settings.notifications': 'அறிவிப்புகள்',
    'settings.notificationsDesc': 'விவசாய குறிப்புகள் மற்றும் எச்சரிக்கைகளைப் பெறவும்',
    'settings.dataManagement': 'தரவு மேலாண்மை',
    'settings.clearHistory': 'உரையாடல் வரலாற்றை அழிக்கவும்',
    'settings.export': 'அமைப்புகளை ஏற்றுமதி செய்',
    'settings.logout': 'வெளியேறு',
    'settings.saveAll': 'அனைத்து அமைப்புகளையும் சேமி',
    'settings.saved': 'அமைப்புகள் வெற்றிகரமாக சேமிக்கப்பட்டன!',
    'settings.saveError': 'அமைப்புகளை சேமிக்க முடியவில்லை',
    
    // Smart Crop Advisor
    'crop.title': 'ஸ்மார்ட் பயிர் ஆலோசகர்',
    'crop.helper': 'AI-இயக்கப்பட்ட பயிர் பரிந்துரைகளைப் பெற உங்கள் மண் மற்றும் வானிலை மதிப்புகளை உள்ளிடவும்.',
    'crop.soilNutrients': 'மண் ஊட்டச்சத்துக்கள்',
    'crop.weather': 'வானிலை நிலைமைகள்',
    'crop.nitrogen': 'நைட்ரஜன் (N)',
    'crop.phosphorus': 'பாஸ்பரஸ் (P)',
    'crop.potassium': 'பொட்டாசியம் (K)',
    'crop.temperature': 'வெப்பநிலை (°C)',
    'crop.humidity': 'ஈரப்பதம் (%)',
    'crop.ph': 'pH',
    'crop.rainfall': 'மழை (mm)',
    'crop.location': 'இடம் (விருப்பமானது)',
    'crop.getRecommendation': 'பரிந்துரை பெறு',
    'crop.recommended': 'பரிந்துரைக்கப்பட்ட பயிர்',
    'crop.confidence': 'நம்பிக்கை',
    'crop.top3': 'முதல் 3 பரிந்துரைகள்',
    'crop.reasoning': 'காரணம்',
    
    // My Crops
    'crops.title': 'எனது பயிர்கள்',
    'crops.add': 'பயிர் சேர்',
    'crops.empty': 'இன்னும் பயிர்கள் இல்லை',
    'crops.emptyDesc': 'நிலை-வாரி ஆலோசனை மற்றும் வானிலை எச்சரிக்கைகளைப் பெற உங்கள் பயிர்களைச் சேர்க்கவும்.',
    'crops.currentStage': 'தற்போதைய நிலை',
    'crops.nextAction': 'அடுத்த செயல்',
    'crops.due': 'காலக்கெடு',
    
    // Explore
    'explore.title': 'ஆராய',
    'explore.weather': 'வானிலை',
    'explore.suggestions': 'ஸ்மார்ட் வானிலை பரிந்துரைகள்',
    'explore.news': 'சமீபத்திய விவசாய செய்திகள்',
    'explore.tip': 'நாள் விவசாய குறிப்பு',
    
    // Chat
    'chat.title': 'CROPWISE உதவியாளர்',
    'chat.placeholder': 'பயிர்கள், வானிலை, உரங்கள் பற்றி கேளுங்கள்...',
    'chat.newChat': 'புதிய உரையாடல்',
    'chat.welcome': 'வணக்கம்! நான் உங்கள் விவசாய உதவியாளர். விவசாயம் பற்றி எதையும் கேளுங்கள், நான் உங்களுக்கு உதவுவேன்.',
    
    // Network
    'network.title': 'விவசாயி நெட்வொர்க்',
    'network.community': 'சமூகம்',
    'network.workers': 'தொழிலாளர்கள்',
    'network.jobs': 'வேலைகள்',
    
    // Schemes
    'schemes.title': 'திட்டங்கள் மற்றும் மானியங்கள்',
    'schemes.search': 'திட்டங்களைத் தேடு...',
    
    // History
    'history.title': 'உரையாடல் வரலாறு',
    'history.empty': 'இன்னும் உரையாடல்கள் இல்லை',
    'history.emptyDesc': 'உங்கள் உரையாடல் வரலாற்றைக் காண உங்கள் விவசாய உதவியாளருடன் அரட்டை அடிக்கத் தொடங்கவும்.',
    'history.clear': 'அனைத்தையும் அழி',
  },
  
  // Add more languages as needed - using English as fallback for now
  te: getEnglishTranslations(),
  kn: getEnglishTranslations(),
  ml: getEnglishTranslations(),
  bn: getEnglishTranslations(),
  mr: getEnglishTranslations(),
  gu: getEnglishTranslations(),
};

