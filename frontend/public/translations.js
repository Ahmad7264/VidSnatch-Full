/* ============================================================
   VidSnatch Translation System
   File: frontend/public/translations.js
   ============================================================ */

(() => {
  "use strict";

  /* ==========================================================
     LANGUAGES
     ========================================================== */

  const LANGUAGES = {
    en: {
      name: "English",
      nativeName: "English",
      direction: "ltr",
    },

    hi: {
      name: "Hindi",
      nativeName: "हिन्दी",
      direction: "ltr",
    },

    fr: {
      name: "French",
      nativeName: "Français",
      direction: "ltr",
    },

    te: {
      name: "Telugu",
      nativeName: "తెలుగు",
      direction: "ltr",
    },

    ta: {
      name: "Tamil",
      nativeName: "தமிழ்",
      direction: "ltr",
    },

    kn: {
      name: "Kannada",
      nativeName: "ಕನ್ನಡ",
      direction: "ltr",
    },

    ar: {
      name: "Arabic",
      nativeName: "العربية",
      direction: "rtl",
    },

    bn: {
      name: "Bengali",
      nativeName: "বাংলা",
      direction: "ltr",
    },

    es: {
      name: "Spanish",
      nativeName: "Español",
      direction: "ltr",
    },

    pt: {
      name: "Portuguese",
      nativeName: "Português",
      direction: "ltr",
    },

    de: {
      name: "German",
      nativeName: "Deutsch",
      direction: "ltr",
    },

    it: {
      name: "Italian",
      nativeName: "Italiano",
      direction: "ltr",
    },

    tr: {
      name: "Turkish",
      nativeName: "Türkçe",
      direction: "ltr",
    },

    id: {
      name: "Indonesian",
      nativeName: "Bahasa Indonesia",
      direction: "ltr",
    },

    vi: {
      name: "Vietnamese",
      nativeName: "Tiếng Việt",
      direction: "ltr",
    },

    ja: {
      name: "Japanese",
      nativeName: "日本語",
      direction: "ltr",
    },

    ko: {
      name: "Korean",
      nativeName: "한국어",
      direction: "ltr",
    },

    zh: {
      name: "Chinese",
      nativeName: "中文",
      direction: "ltr",
    },

    ru: {
      name: "Russian",
      nativeName: "Русский",
      direction: "ltr",
    },

    ur: {
      name: "Urdu",
      nativeName: "اردو",
      direction: "rtl",
    },
  };

  /* ==========================================================
     TRANSLATIONS
     ========================================================== */

  const TRANSLATIONS = {
    en: {
      "nav.home": "Home",
      "nav.youtube": "YouTube",
      "nav.instagram": "Instagram",
      "nav.facebook": "Facebook",
      "nav.tiktok": "TikTok",
      "nav.twitter": "X / Twitter",
      "nav.reddit": "Reddit",
      "nav.threads": "Threads",
      "nav.pinterest": "Pinterest",
      "nav.snapchat": "Snapchat",

      "hero.badge": "Fast & Free Video Downloader",

      "hero.youtube.title": "YouTube Video Downloader",
      "hero.instagram.title": "Instagram Video Downloader",
      "hero.facebook.title": "Facebook Video Downloader",
      "hero.tiktok.title": "TikTok Video Downloader",
      "hero.twitter.title": "Twitter Video Downloader",
      "hero.reddit.title": "Reddit Video Downloader",
      "hero.threads.title": "Threads Video Downloader",
      "hero.pinterest.title": "Pinterest Video Downloader",
      "hero.snapchat.title": "Snapchat Video Downloader",

      "hero.description":
        "Download videos quickly and easily in high quality. Paste your video link below to get started.",

      "input.placeholder": "Paste video URL here...",

      "button.fetch": "Get Video",
      "button.download": "Download Video",
      "button.audio": "Download MP3",
      "button.copy": "Copy URL",
      "button.clear": "Clear",

      "loading.fetching": "Fetching video information...",
      "loading.preparing": "Preparing download...",
      "loading.processing": "Processing your download...",

      "status.ready": "Download ready.",
      "status.success": "Your download is ready.",

      "quality.title": "Available Quality",
      "quality.video": "Available Video",

      "result.detected": "Detected",
      "result.duration": "Duration",
      "result.views": "Views",
      "result.author": "Author",

      "error.empty": "Please paste a video URL first.",
      "error.unsupported": "This URL does not belong to a supported platform.",
      "error.fetch": "Unable to fetch video information.",
      "error.download": "Download failed. Please try again.",
      "error.busy": "Another download is already being prepared.",
      "error.timeout": "The download is taking too long. Please try again.",

      "faq.title": "Frequently Asked Questions",

      "footer.disclaimer":
        "VidSnatch is an independent download service and is not affiliated with the platforms mentioned.",
    },

    hi: {
      "nav.home": "होम",
      "nav.youtube": "YouTube",
      "nav.instagram": "Instagram",
      "nav.facebook": "Facebook",
      "nav.tiktok": "TikTok",
      "nav.twitter": "X / Twitter",
      "nav.reddit": "Reddit",
      "nav.threads": "Threads",
      "nav.pinterest": "Pinterest",
      "nav.snapchat": "Snapchat",

      "hero.badge": "तेज़ और मुफ़्त वीडियो डाउनलोडर",

      "hero.youtube.title": "YouTube वीडियो डाउनलोडर",
      "hero.instagram.title": "Instagram वीडियो डाउनलोडर",
      "hero.facebook.title": "Facebook वीडियो डाउनलोडर",
      "hero.tiktok.title": "TikTok वीडियो डाउनलोडर",
      "hero.twitter.title": "Twitter वीडियो डाउनलोडर",
      "hero.reddit.title": "Reddit वीडियो डाउनलोडर",
      "hero.threads.title": "Threads वीडियो डाउनलोडर",
      "hero.pinterest.title": "Pinterest वीडियो डाउनलोडर",
      "hero.snapchat.title": "Snapchat वीडियो डाउनलोडर",

      "hero.description":
        "वीडियो को तेज़ी और आसानी से हाई क्वालिटी में डाउनलोड करें। शुरू करने के लिए नीचे अपना वीडियो लिंक पेस्ट करें।",

      "input.placeholder": "वीडियो URL यहाँ पेस्ट करें...",

      "button.fetch": "वीडियो प्राप्त करें",
      "button.download": "वीडियो डाउनलोड करें",
      "button.audio": "MP3 डाउनलोड करें",
      "button.copy": "URL कॉपी करें",
      "button.clear": "साफ़ करें",

      "loading.fetching": "वीडियो की जानकारी प्राप्त की जा रही है...",
      "loading.preparing": "डाउनलोड तैयार किया जा रहा है...",
      "loading.processing": "आपका डाउनलोड प्रोसेस किया जा रहा है...",

      "status.ready": "डाउनलोड तैयार है।",
      "status.success": "आपका डाउनलोड तैयार है।",

      "quality.title": "उपलब्ध क्वालिटी",
      "quality.video": "उपलब्ध वीडियो",

      "result.detected": "पहचाना गया",
      "result.duration": "अवधि",
      "result.views": "व्यूज़",
      "result.author": "लेखक",

      "error.empty": "कृपया पहले वीडियो URL पेस्ट करें।",
      "error.unsupported": "यह URL किसी समर्थित प्लेटफ़ॉर्म का नहीं है।",
      "error.fetch": "वीडियो की जानकारी प्राप्त नहीं हो सकी।",
      "error.download": "डाउनलोड विफल हुआ। कृपया दोबारा प्रयास करें।",
      "error.busy": "एक और डाउनलोड पहले से तैयार किया जा रहा है।",
      "error.timeout":
        "डाउनलोड में बहुत अधिक समय लग रहा है। कृपया दोबारा प्रयास करें।",

      "faq.title": "अक्सर पूछे जाने वाले प्रश्न",

      "footer.disclaimer":
        "VidSnatch एक स्वतंत्र डाउनलोड सेवा है और उल्लिखित प्लेटफ़ॉर्म से संबद्ध नहीं है।",
    },

    fr: {
      "nav.home": "Accueil",
      "nav.youtube": "YouTube",
      "nav.instagram": "Instagram",
      "nav.facebook": "Facebook",
      "nav.tiktok": "TikTok",
      "nav.twitter": "X / Twitter",
      "nav.reddit": "Reddit",
      "nav.threads": "Threads",
      "nav.pinterest": "Pinterest",
      "nav.snapchat": "Snapchat",

      "hero.badge": "Téléchargeur vidéo rapide et gratuit",

      "hero.youtube.title": "Téléchargeur vidéo YouTube",
      "hero.instagram.title": "Téléchargeur vidéo Instagram",
      "hero.facebook.title": "Téléchargeur vidéo Facebook",
      "hero.tiktok.title": "Téléchargeur vidéo TikTok",
      "hero.twitter.title": "Téléchargeur vidéo Twitter",
      "hero.reddit.title": "Téléchargeur vidéo Reddit",
      "hero.threads.title": "Téléchargeur vidéo Threads",
      "hero.pinterest.title": "Téléchargeur vidéo Pinterest",
      "hero.snapchat.title": "Téléchargeur vidéo Snapchat",

      "hero.description":
        "Téléchargez des vidéos rapidement et facilement en haute qualité. Collez votre lien vidéo ci-dessous pour commencer.",

      "input.placeholder": "Collez l'URL de la vidéo ici...",

      "button.fetch": "Obtenir la vidéo",
      "button.download": "Télécharger la vidéo",
      "button.audio": "Télécharger MP3",
      "button.copy": "Copier l'URL",
      "button.clear": "Effacer",

      "loading.fetching": "Récupération des informations vidéo...",
      "loading.preparing": "Préparation du téléchargement...",
      "loading.processing": "Traitement de votre téléchargement...",

      "status.ready": "Téléchargement prêt.",
      "status.success": "Votre téléchargement est prêt.",

      "quality.title": "Qualité disponible",
      "quality.video": "Vidéo disponible",

      "result.detected": "Détecté",
      "result.duration": "Durée",
      "result.views": "Vues",
      "result.author": "Auteur",

      "error.empty": "Veuillez d'abord coller une URL vidéo.",
      "error.unsupported":
        "Cette URL ne provient pas d'une plateforme prise en charge.",
      "error.fetch": "Impossible de récupérer les informations de la vidéo.",
      "error.download": "Échec du téléchargement. Veuillez réessayer.",
      "error.busy": "Un autre téléchargement est déjà en préparation.",
      "error.timeout":
        "Le téléchargement prend trop de temps. Veuillez réessayer.",

      "faq.title": "Questions fréquentes",

      "footer.disclaimer":
        "VidSnatch est un service de téléchargement indépendant et n'est affilié à aucune des plateformes mentionnées.",
    },

    te: {
      "nav.home": "హోమ్",
      "nav.youtube": "YouTube",
      "nav.instagram": "Instagram",
      "nav.facebook": "Facebook",
      "nav.tiktok": "TikTok",
      "nav.twitter": "X / Twitter",
      "nav.reddit": "Reddit",
      "nav.threads": "Threads",
      "nav.pinterest": "Pinterest",
      "nav.snapchat": "Snapchat",

      "hero.badge": "వేగవంతమైన & ఉచిత వీడియో డౌన్‌లోడర్",

      "hero.youtube.title": "YouTube వీడియో డౌన్‌లోడర్",
      "hero.instagram.title": "Instagram వీడియో డౌన్‌లోడర్",
      "hero.facebook.title": "Facebook వీడియో డౌన్‌లోడర్",
      "hero.tiktok.title": "TikTok వీడియో డౌన్‌లోడర్",
      "hero.twitter.title": "Twitter వీడియో డౌన్‌లోడర్",
      "hero.reddit.title": "Reddit వీడియో డౌన్‌లోడర్",
      "hero.threads.title": "Threads వీడియో డౌన్‌లోడర్",
      "hero.pinterest.title": "Pinterest వీడియో డౌన్‌లోడర్",
      "hero.snapchat.title": "Snapchat వీడియో డౌన్‌లోడర్",

      "hero.description":
        "వీడియోలను అధిక నాణ్యతతో వేగంగా మరియు సులభంగా డౌన్‌లోడ్ చేయండి. ప్రారంభించడానికి మీ వీడియో లింక్‌ను క్రింద పేస్ట్ చేయండి.",

      "input.placeholder": "వీడియో URL ను ఇక్కడ పేస్ట్ చేయండి...",

      "button.fetch": "వీడియో పొందండి",
      "button.download": "వీడియో డౌన్‌లోడ్",
      "button.audio": "MP3 డౌన్‌లోడ్",
      "button.copy": "URL కాపీ",
      "button.clear": "క్లియర్",

      "loading.fetching": "వీడియో సమాచారం పొందుతోంది...",
      "loading.preparing": "డౌన్‌లోడ్ సిద్ధం చేస్తోంది...",
      "loading.processing": "మీ డౌన్‌లోడ్ ప్రాసెస్ చేస్తోంది...",

      "status.ready": "డౌన్‌లోడ్ సిద్ధంగా ఉంది.",
      "status.success": "మీ డౌన్‌లోడ్ సిద్ధంగా ఉంది.",

      "quality.title": "అందుబాటులో ఉన్న నాణ్యత",
      "quality.video": "అందుబాటులో ఉన్న వీడియో",

      "result.detected": "గుర్తించబడింది",
      "result.duration": "వ్యవధి",
      "result.views": "వీక్షణలు",
      "result.author": "రచయిత",

      "error.empty": "దయచేసి ముందుగా వీడియో URL పేస్ట్ చేయండి.",
      "error.unsupported": "ఈ URL మద్దతు ఉన్న ప్లాట్‌ఫారమ్‌కు చెందినది కాదు.",
      "error.fetch": "వీడియో సమాచారం పొందలేకపోయాము.",
      "error.download": "డౌన్‌లోడ్ విఫలమైంది. దయచేసి మళ్లీ ప్రయత్నించండి.",
      "error.busy": "మరో డౌన్‌లోడ్ ఇప్పటికే సిద్ధమవుతోంది.",
      "error.timeout":
        "డౌన్‌లోడ్‌కు చాలా సమయం పడుతోంది. దయచేసి మళ్లీ ప్రయత్నించండి.",

      "faq.title": "తరచుగా అడిగే ప్రశ్నలు",

      "footer.disclaimer":
        "VidSnatch ఒక స్వతంత్ర డౌన్‌లోడ్ సేవ మరియు పేర్కొన్న ప్లాట్‌ఫారమ్‌లతో అనుబంధం లేదు.",
    },

    ta: {
      "nav.home": "முகப்பு",
      "nav.youtube": "YouTube",
      "nav.instagram": "Instagram",
      "nav.facebook": "Facebook",
      "nav.tiktok": "TikTok",
      "nav.twitter": "X / Twitter",
      "nav.reddit": "Reddit",
      "nav.threads": "Threads",
      "nav.pinterest": "Pinterest",
      "nav.snapchat": "Snapchat",

      "hero.badge": "வேகமான மற்றும் இலவச வீடியோ டவுன்லோடர்",

      "hero.youtube.title": "YouTube வீடியோ டவுன்லோடர்",
      "hero.instagram.title": "Instagram வீடியோ டவுன்லோடர்",
      "hero.facebook.title": "Facebook வீடியோ டவுன்லோடர்",
      "hero.tiktok.title": "TikTok வீடியோ டவுன்லோடர்",
      "hero.twitter.title": "Twitter வீடியோ டவுன்லோடர்",
      "hero.reddit.title": "Reddit வீடியோ டவுன்லோடர்",
      "hero.threads.title": "Threads வீடியோ டவுன்லோடர்",
      "hero.pinterest.title": "Pinterest வீடியோ டவுன்லோடர்",
      "hero.snapchat.title": "Snapchat வீடியோ டவுன்லோடர்",

      "hero.description":
        "உயர்தரத்தில் வீடியோக்களை விரைவாகவும் எளிதாகவும் பதிவிறக்கவும். தொடங்க கீழே உங்கள் வீடியோ இணைப்பை ஒட்டவும்.",

      "input.placeholder": "வீடியோ URL-ஐ இங்கே ஒட்டவும்...",

      "button.fetch": "வீடியோ பெறுக",
      "button.download": "வீடியோ பதிவிறக்க",
      "button.audio": "MP3 பதிவிறக்க",
      "button.copy": "URL நகலெடுக்க",
      "button.clear": "அழிக்க",

      "loading.fetching": "வீடியோ தகவலைப் பெறுகிறது...",
      "loading.preparing": "பதிவிறக்கத்தைத் தயாரிக்கிறது...",
      "loading.processing": "உங்கள் பதிவிறக்கம் செயலாக்கப்படுகிறது...",

      "status.ready": "பதிவிறக்கம் தயாராக உள்ளது.",
      "status.success": "உங்கள் பதிவிறக்கம் தயாராக உள்ளது.",

      "quality.title": "கிடைக்கும் தரம்",
      "quality.video": "கிடைக்கும் வீடியோ",

      "result.detected": "கண்டறியப்பட்டது",
      "result.duration": "கால அளவு",
      "result.views": "பார்வைகள்",
      "result.author": "ஆசிரியர்",

      "error.empty": "முதலில் வீடியோ URL-ஐ ஒட்டவும்.",
      "error.unsupported": "இந்த URL ஆதரிக்கப்படும் தளத்தைச் சேர்ந்தது அல்ல.",
      "error.fetch": "வீடியோ தகவலைப் பெற முடியவில்லை.",
      "error.download": "பதிவிறக்கம் தோல்வியடைந்தது. மீண்டும் முயற்சிக்கவும்.",
      "error.busy": "மற்றொரு பதிவிறக்கம் ஏற்கனவே தயாராகிறது.",
      "error.timeout":
        "பதிவிறக்கம் அதிக நேரம் எடுக்கிறது. மீண்டும் முயற்சிக்கவும்.",

      "faq.title": "அடிக்கடி கேட்கப்படும் கேள்விகள்",

      "footer.disclaimer":
        "VidSnatch ஒரு சுயாதீன பதிவிறக்க சேவையாகும் மற்றும் குறிப்பிடப்பட்ட தளங்களுடன் இணைக்கப்படவில்லை.",
    },

    kn: {
      "nav.home": "ಮುಖಪುಟ",
      "nav.youtube": "YouTube",
      "nav.instagram": "Instagram",
      "nav.facebook": "Facebook",
      "nav.tiktok": "TikTok",
      "nav.twitter": "X / Twitter",
      "nav.reddit": "Reddit",
      "nav.threads": "Threads",
      "nav.pinterest": "Pinterest",
      "nav.snapchat": "Snapchat",

      "hero.badge": "ವೇಗದ ಮತ್ತು ಉಚಿತ ವೀಡಿಯೊ ಡೌನ್‌ಲೋಡರ್",

      "hero.youtube.title": "YouTube ವೀಡಿಯೊ ಡೌನ್‌ಲೋಡರ್",
      "hero.instagram.title": "Instagram ವೀಡಿಯೊ ಡೌನ್‌ಲೋಡರ್",
      "hero.facebook.title": "Facebook ವೀಡಿಯೊ ಡೌನ್‌ಲೋಡರ್",
      "hero.tiktok.title": "TikTok ವೀಡಿಯೊ ಡೌನ್‌ಲೋಡರ್",
      "hero.twitter.title": "Twitter ವೀಡಿಯೊ ಡೌನ್‌ಲೋಡರ್",
      "hero.reddit.title": "Reddit ವೀಡಿಯೊ ಡೌನ್‌ಲೋಡರ್",
      "hero.threads.title": "Threads ವೀಡಿಯೊ ಡೌನ್‌ಲೋಡರ್",
      "hero.pinterest.title": "Pinterest ವೀಡಿಯೊ ಡೌನ್‌ಲೋಡರ್",
      "hero.snapchat.title": "Snapchat ವೀಡಿಯೊ ಡೌನ್‌ಲೋಡರ್",

      "hero.description":
        "ಉತ್ತಮ ಗುಣಮಟ್ಟದಲ್ಲಿ ವೀಡಿಯೊಗಳನ್ನು ವೇಗವಾಗಿ ಮತ್ತು ಸುಲಭವಾಗಿ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ. ಪ್ರಾರಂಭಿಸಲು ಕೆಳಗೆ ನಿಮ್ಮ ವೀಡಿಯೊ ಲಿಂಕ್ ಅನ್ನು ಅಂಟಿಸಿ.",

      "input.placeholder": "ವೀಡಿಯೊ URL ಅನ್ನು ಇಲ್ಲಿ ಅಂಟಿಸಿ...",

      "button.fetch": "ವೀಡಿಯೊ ಪಡೆಯಿರಿ",
      "button.download": "ವೀಡಿಯೊ ಡೌನ್‌ಲೋಡ್",
      "button.audio": "MP3 ಡೌನ್‌ಲೋಡ್",
      "button.copy": "URL ನಕಲಿಸಿ",
      "button.clear": "ತೆರವುಗೊಳಿಸಿ",

      "loading.fetching": "ವೀಡಿಯೊ ಮಾಹಿತಿ ಪಡೆಯಲಾಗುತ್ತಿದೆ...",
      "loading.preparing": "ಡೌನ್‌ಲೋಡ್ ಸಿದ್ಧಪಡಿಸಲಾಗುತ್ತಿದೆ...",
      "loading.processing": "ನಿಮ್ಮ ಡೌನ್‌ಲೋಡ್ ಪ್ರಕ್ರಿಯೆಗೊಳಿಸಲಾಗುತ್ತಿದೆ...",

      "status.ready": "ಡೌನ್‌ಲೋಡ್ ಸಿದ್ಧವಾಗಿದೆ.",
      "status.success": "ನಿಮ್ಮ ಡೌನ್‌ಲೋಡ್ ಸಿದ್ಧವಾಗಿದೆ.",

      "quality.title": "ಲಭ್ಯವಿರುವ ಗುಣಮಟ್ಟ",
      "quality.video": "ಲಭ್ಯವಿರುವ ವೀಡಿಯೊ",

      "result.detected": "ಪತ್ತೆಯಾಗಿದೆ",
      "result.duration": "ಅವಧಿ",
      "result.views": "ವೀಕ್ಷಣೆಗಳು",
      "result.author": "ಲೇಖಕ",

      "error.empty": "ದಯವಿಟ್ಟು ಮೊದಲು ವೀಡಿಯೊ URL ಅಂಟಿಸಿ.",
      "error.unsupported": "ಈ URL ಬೆಂಬಲಿತ ಪ್ಲಾಟ್‌ಫಾರ್ಮ್‌ಗೆ ಸೇರಿಲ್ಲ.",
      "error.fetch": "ವೀಡಿಯೊ ಮಾಹಿತಿ ಪಡೆಯಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.",
      "error.download": "ಡೌನ್‌ಲೋಡ್ ವಿಫಲವಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
      "error.busy": "ಮತ್ತೊಂದು ಡೌನ್‌ಲೋಡ್ ಈಗಾಗಲೇ ಸಿದ್ಧವಾಗುತ್ತಿದೆ.",
      "error.timeout":
        "ಡೌನ್‌ಲೋಡ್ ಹೆಚ್ಚು ಸಮಯ ತೆಗೆದುಕೊಳ್ಳುತ್ತಿದೆ. ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",

      "faq.title": "ಪದೇ ಪದೇ ಕೇಳಲಾಗುವ ಪ್ರಶ್ನೆಗಳು",

      "footer.disclaimer":
        "VidSnatch ಒಂದು ಸ್ವತಂತ್ರ ಡೌನ್‌ಲೋಡ್ ಸೇವೆಯಾಗಿದ್ದು ಉಲ್ಲೇಖಿಸಲಾದ ಪ್ಲಾಟ್‌ಫಾರ್ಮ್‌ಗಳೊಂದಿಗೆ ಸಂಬಂಧ ಹೊಂದಿಲ್ಲ.",
    },

    ar: {
      "nav.home": "الرئيسية",
      "nav.youtube": "YouTube",
      "nav.instagram": "Instagram",
      "nav.facebook": "Facebook",
      "nav.tiktok": "TikTok",
      "nav.twitter": "X / Twitter",
      "nav.reddit": "Reddit",
      "nav.threads": "Threads",
      "nav.pinterest": "Pinterest",
      "nav.snapchat": "Snapchat",

      "hero.badge": "أداة تنزيل فيديو سريعة ومجانية",

      "hero.youtube.title": "تنزيل فيديو YouTube",
      "hero.instagram.title": "تنزيل فيديو Instagram",
      "hero.facebook.title": "تنزيل فيديو Facebook",
      "hero.tiktok.title": "تنزيل فيديو TikTok",
      "hero.twitter.title": "تنزيل فيديو Twitter",
      "hero.reddit.title": "تنزيل فيديو Reddit",
      "hero.threads.title": "تنزيل فيديو Threads",
      "hero.pinterest.title": "تنزيل فيديو Pinterest",
      "hero.snapchat.title": "تنزيل فيديو Snapchat",

      "hero.description":
        "قم بتنزيل مقاطع الفيديو بسرعة وسهولة بجودة عالية. الصق رابط الفيديو أدناه للبدء.",

      "input.placeholder": "الصق رابط الفيديو هنا...",

      "button.fetch": "الحصول على الفيديو",
      "button.download": "تنزيل الفيديو",
      "button.audio": "تنزيل MP3",
      "button.copy": "نسخ الرابط",
      "button.clear": "مسح",

      "loading.fetching": "جارٍ الحصول على معلومات الفيديو...",
      "loading.preparing": "جارٍ تجهيز التنزيل...",
      "loading.processing": "جارٍ معالجة التنزيل...",

      "status.ready": "التنزيل جاهز.",
      "status.success": "التنزيل الخاص بك جاهز.",

      "quality.title": "الجودة المتاحة",
      "quality.video": "الفيديو المتاح",

      "result.detected": "تم الاكتشاف",
      "result.duration": "المدة",
      "result.views": "المشاهدات",
      "result.author": "المؤلف",

      "error.empty": "يرجى لصق رابط الفيديو أولاً.",
      "error.unsupported": "هذا الرابط لا ينتمي إلى منصة مدعومة.",
      "error.fetch": "تعذر الحصول على معلومات الفيديو.",
      "error.download": "فشل التنزيل. حاول مرة أخرى.",
      "error.busy": "هناك تنزيل آخر قيد التجهيز.",
      "error.timeout": "يستغرق التنزيل وقتًا طويلاً. حاول مرة أخرى.",

      "faq.title": "الأسئلة الشائعة",

      "footer.disclaimer":
        "VidSnatch خدمة تنزيل مستقلة وليست تابعة للمنصات المذكورة.",
    },

    bn: {
      "nav.home": "হোম",
      "nav.youtube": "YouTube",
      "nav.instagram": "Instagram",
      "nav.facebook": "Facebook",
      "nav.tiktok": "TikTok",
      "nav.twitter": "X / Twitter",
      "nav.reddit": "Reddit",
      "nav.threads": "Threads",
      "nav.pinterest": "Pinterest",
      "nav.snapchat": "Snapchat",

      "hero.badge": "দ্রুত ও বিনামূল্যের ভিডিও ডাউনলোডার",

      "hero.youtube.title": "YouTube ভিডিও ডাউনলোডার",
      "hero.instagram.title": "Instagram ভিডিও ডাউনলোডার",
      "hero.facebook.title": "Facebook ভিডিও ডাউনলোডার",
      "hero.tiktok.title": "TikTok ভিডিও ডাউনলোডার",
      "hero.twitter.title": "Twitter ভিডিও ডাউনলোডার",
      "hero.reddit.title": "Reddit ভিডিও ডাউনলোডার",
      "hero.threads.title": "Threads ভিডিও ডাউনলোডার",
      "hero.pinterest.title": "Pinterest ভিডিও ডাউনলোডার",
      "hero.snapchat.title": "Snapchat ভিডিও ডাউনলোডার",

      "hero.description":
        "উচ্চ মানের ভিডিও দ্রুত এবং সহজে ডাউনলোড করুন। শুরু করতে নিচে ভিডিও লিঙ্ক পেস্ট করুন।",

      "input.placeholder": "ভিডিও URL এখানে পেস্ট করুন...",

      "button.fetch": "ভিডিও নিন",
      "button.download": "ভিডিও ডাউনলোড",
      "button.audio": "MP3 ডাউনলোড",
      "button.copy": "URL কপি করুন",
      "button.clear": "পরিষ্কার",

      "loading.fetching": "ভিডিওর তথ্য নেওয়া হচ্ছে...",
      "loading.preparing": "ডাউনলোড প্রস্তুত করা হচ্ছে...",
      "loading.processing": "আপনার ডাউনলোড প্রক্রিয়াকরণ হচ্ছে...",

      "status.ready": "ডাউনলোড প্রস্তুত।",
      "status.success": "আপনার ডাউনলোড প্রস্তুত।",

      "quality.title": "উপলব্ধ মান",
      "quality.video": "উপলব্ধ ভিডিও",

      "result.detected": "শনাক্ত হয়েছে",
      "result.duration": "সময়কাল",
      "result.views": "ভিউ",
      "result.author": "লেখক",

      "error.empty": "প্রথমে একটি ভিডিও URL পেস্ট করুন।",
      "error.unsupported": "এই URL একটি সমর্থিত প্ল্যাটফর্মের নয়।",
      "error.fetch": "ভিডিওর তথ্য পাওয়া যায়নি।",
      "error.download": "ডাউনলোড ব্যর্থ হয়েছে। আবার চেষ্টা করুন।",
      "error.busy": "অন্য একটি ডাউনলোড ইতিমধ্যে প্রস্তুত হচ্ছে।",
      "error.timeout": "ডাউনলোডে বেশি সময় লাগছে। আবার চেষ্টা করুন।",

      "faq.title": "সাধারণ প্রশ্ন",

      "footer.disclaimer":
        "VidSnatch একটি স্বাধীন ডাউনলোড পরিষেবা এবং উল্লেখিত প্ল্যাটফর্মগুলোর সঙ্গে যুক্ত নয়।",
    },

    es: {
      "nav.home": "Inicio",
      "nav.youtube": "YouTube",
      "nav.instagram": "Instagram",
      "nav.facebook": "Facebook",
      "nav.tiktok": "TikTok",
      "nav.twitter": "X / Twitter",
      "nav.reddit": "Reddit",
      "nav.threads": "Threads",
      "nav.pinterest": "Pinterest",
      "nav.snapchat": "Snapchat",

      "hero.badge": "Descargador de vídeos rápido y gratuito",

      "hero.youtube.title": "Descargador de vídeos de YouTube",
      "hero.instagram.title": "Descargador de vídeos de Instagram",
      "hero.facebook.title": "Descargador de vídeos de Facebook",
      "hero.tiktok.title": "Descargador de vídeos de TikTok",
      "hero.twitter.title": "Descargador de vídeos de Twitter",
      "hero.reddit.title": "Descargador de vídeos de Reddit",
      "hero.threads.title": "Descargador de vídeos de Threads",
      "hero.pinterest.title": "Descargador de vídeos de Pinterest",
      "hero.snapchat.title": "Descargador de vídeos de Snapchat",

      "hero.description":
        "Descarga vídeos de forma rápida y sencilla en alta calidad. Pega el enlace del vídeo abajo para comenzar.",

      "input.placeholder": "Pega aquí la URL del vídeo...",

      "button.fetch": "Obtener vídeo",
      "button.download": "Descargar vídeo",
      "button.audio": "Descargar MP3",
      "button.copy": "Copiar URL",
      "button.clear": "Limpiar",

      "loading.fetching": "Obteniendo información del vídeo...",
      "loading.preparing": "Preparando la descarga...",
      "loading.processing": "Procesando tu descarga...",

      "status.ready": "Descarga lista.",
      "status.success": "Tu descarga está lista.",

      "quality.title": "Calidad disponible",
      "quality.video": "Vídeo disponible",

      "result.detected": "Detectado",
      "result.duration": "Duración",
      "result.views": "Visualizaciones",
      "result.author": "Autor",

      "error.empty": "Pega primero una URL de vídeo.",
      "error.unsupported": "Esta URL no pertenece a una plataforma compatible.",
      "error.fetch": "No se pudo obtener la información del vídeo.",
      "error.download": "La descarga falló. Inténtalo de nuevo.",
      "error.busy": "Ya se está preparando otra descarga.",
      "error.timeout":
        "La descarga está tardando demasiado. Inténtalo de nuevo.",

      "faq.title": "Preguntas frecuentes",

      "footer.disclaimer":
        "VidSnatch es un servicio de descarga independiente y no está afiliado a las plataformas mencionadas.",
    },

    pt: {
      "nav.home": "Início",
      "nav.youtube": "YouTube",
      "nav.instagram": "Instagram",
      "nav.facebook": "Facebook",
      "nav.tiktok": "TikTok",
      "nav.twitter": "X / Twitter",
      "nav.reddit": "Reddit",
      "nav.threads": "Threads",
      "nav.pinterest": "Pinterest",
      "nav.snapchat": "Snapchat",

      "hero.badge": "Downloader de vídeos rápido e gratuito",

      "hero.youtube.title": "Downloader de vídeos do YouTube",
      "hero.instagram.title": "Downloader de vídeos do Instagram",
      "hero.facebook.title": "Downloader de vídeos do Facebook",
      "hero.tiktok.title": "Downloader de vídeos do TikTok",
      "hero.twitter.title": "Downloader de vídeos do Twitter",
      "hero.reddit.title": "Downloader de vídeos do Reddit",
      "hero.threads.title": "Downloader de vídeos do Threads",
      "hero.pinterest.title": "Downloader de vídeos do Pinterest",
      "hero.snapchat.title": "Downloader de vídeos do Snapchat",

      "hero.description":
        "Baixe vídeos de forma rápida e fácil em alta qualidade. Cole o link do vídeo abaixo para começar.",

      "input.placeholder": "Cole o URL do vídeo aqui...",

      "button.fetch": "Obter vídeo",
      "button.download": "Baixar vídeo",
      "button.audio": "Baixar MP3",
      "button.copy": "Copiar URL",
      "button.clear": "Limpar",

      "loading.fetching": "Obtendo informações do vídeo...",
      "loading.preparing": "Preparando o download...",
      "loading.processing": "Processando seu download...",

      "status.ready": "Download pronto.",
      "status.success": "Seu download está pronto.",

      "quality.title": "Qualidade disponível",
      "quality.video": "Vídeo disponível",

      "result.detected": "Detectado",
      "result.duration": "Duração",
      "result.views": "Visualizações",
      "result.author": "Autor",

      "error.empty": "Cole primeiro um URL de vídeo.",
      "error.unsupported": "Este URL não pertence a uma plataforma compatível.",
      "error.fetch": "Não foi possível obter as informações do vídeo.",
      "error.download": "O download falhou. Tente novamente.",
      "error.busy": "Outro download já está sendo preparado.",
      "error.timeout": "O download está demorando muito. Tente novamente.",

      "faq.title": "Perguntas frequentes",

      "footer.disclaimer":
        "O VidSnatch é um serviço independente de download e não é afiliado às plataformas mencionadas.",
    },

    de: {
      "nav.home": "Startseite",
      "nav.youtube": "YouTube",
      "nav.instagram": "Instagram",
      "nav.facebook": "Facebook",
      "nav.tiktok": "TikTok",
      "nav.twitter": "X / Twitter",
      "nav.reddit": "Reddit",
      "nav.threads": "Threads",
      "nav.pinterest": "Pinterest",
      "nav.snapchat": "Snapchat",

      "hero.badge": "Schneller & kostenloser Video-Downloader",

      "hero.youtube.title": "YouTube Video Downloader",
      "hero.instagram.title": "Instagram Video Downloader",
      "hero.facebook.title": "Facebook Video Downloader",
      "hero.tiktok.title": "TikTok Video Downloader",
      "hero.twitter.title": "Twitter Video Downloader",
      "hero.reddit.title": "Reddit Video Downloader",
      "hero.threads.title": "Threads Video Downloader",
      "hero.pinterest.title": "Pinterest Video Downloader",
      "hero.snapchat.title": "Snapchat Video Downloader",

      "hero.description":
        "Lade Videos schnell und einfach in hoher Qualität herunter. Füge deinen Videolink unten ein, um zu beginnen.",

      "input.placeholder": "Video-URL hier einfügen...",

      "button.fetch": "Video abrufen",
      "button.download": "Video herunterladen",
      "button.audio": "MP3 herunterladen",
      "button.copy": "URL kopieren",
      "button.clear": "Löschen",

      "loading.fetching": "Videoinformationen werden abgerufen...",
      "loading.preparing": "Download wird vorbereitet...",
      "loading.processing": "Download wird verarbeitet...",

      "status.ready": "Download bereit.",
      "status.success": "Dein Download ist bereit.",

      "quality.title": "Verfügbare Qualität",
      "quality.video": "Verfügbares Video",

      "result.detected": "Erkannt",
      "result.duration": "Dauer",
      "result.views": "Aufrufe",
      "result.author": "Autor",

      "error.empty": "Bitte füge zuerst eine Video-URL ein.",
      "error.unsupported":
        "Diese URL stammt nicht von einer unterstützten Plattform.",
      "error.fetch": "Videoinformationen konnten nicht abgerufen werden.",
      "error.download": "Download fehlgeschlagen. Bitte versuche es erneut.",
      "error.busy": "Ein anderer Download wird bereits vorbereitet.",
      "error.timeout":
        "Der Download dauert zu lange. Bitte versuche es erneut.",

      "faq.title": "Häufig gestellte Fragen",

      "footer.disclaimer":
        "VidSnatch ist ein unabhängiger Download-Dienst und nicht mit den genannten Plattformen verbunden.",
    },

    it: {
      "nav.home": "Home",
      "nav.youtube": "YouTube",
      "nav.instagram": "Instagram",
      "nav.facebook": "Facebook",
      "nav.tiktok": "TikTok",
      "nav.twitter": "X / Twitter",
      "nav.reddit": "Reddit",
      "nav.threads": "Threads",
      "nav.pinterest": "Pinterest",
      "nav.snapchat": "Snapchat",

      "hero.badge": "Downloader video veloce e gratuito",

      "hero.youtube.title": "Downloader video YouTube",
      "hero.instagram.title": "Downloader video Instagram",
      "hero.facebook.title": "Downloader video Facebook",
      "hero.tiktok.title": "Downloader video TikTok",
      "hero.twitter.title": "Downloader video Twitter",
      "hero.reddit.title": "Downloader video Reddit",
      "hero.threads.title": "Downloader video Threads",
      "hero.pinterest.title": "Downloader video Pinterest",
      "hero.snapchat.title": "Downloader video Snapchat",

      "hero.description":
        "Scarica video rapidamente e facilmente in alta qualità. Incolla il link del video qui sotto per iniziare.",

      "input.placeholder": "Incolla qui l'URL del video...",

      "button.fetch": "Recupera video",
      "button.download": "Scarica video",
      "button.audio": "Scarica MP3",
      "button.copy": "Copia URL",
      "button.clear": "Cancella",

      "loading.fetching": "Recupero delle informazioni del video...",
      "loading.preparing": "Preparazione del download...",
      "loading.processing": "Elaborazione del download...",

      "status.ready": "Download pronto.",
      "status.success": "Il tuo download è pronto.",

      "quality.title": "Qualità disponibile",
      "quality.video": "Video disponibile",

      "result.detected": "Rilevato",
      "result.duration": "Durata",
      "result.views": "Visualizzazioni",
      "result.author": "Autore",

      "error.empty": "Incolla prima un URL video.",
      "error.unsupported":
        "Questo URL non appartiene a una piattaforma supportata.",
      "error.fetch": "Impossibile recuperare le informazioni del video.",
      "error.download": "Download non riuscito. Riprova.",
      "error.busy": "Un altro download è già in preparazione.",
      "error.timeout": "Il download sta richiedendo troppo tempo. Riprova.",

      "faq.title": "Domande frequenti",

      "footer.disclaimer":
        "VidSnatch è un servizio di download indipendente e non è affiliato alle piattaforme menzionate.",
    },

    tr: {
      "nav.home": "Ana Sayfa",
      "nav.youtube": "YouTube",
      "nav.instagram": "Instagram",
      "nav.facebook": "Facebook",
      "nav.tiktok": "TikTok",
      "nav.twitter": "X / Twitter",
      "nav.reddit": "Reddit",
      "nav.threads": "Threads",
      "nav.pinterest": "Pinterest",
      "nav.snapchat": "Snapchat",

      "hero.badge": "Hızlı ve Ücretsiz Video İndirici",

      "hero.youtube.title": "YouTube Video İndirici",
      "hero.instagram.title": "Instagram Video İndirici",
      "hero.facebook.title": "Facebook Video İndirici",
      "hero.tiktok.title": "TikTok Video İndirici",
      "hero.twitter.title": "Twitter Video İndirici",
      "hero.reddit.title": "Reddit Video İndirici",
      "hero.threads.title": "Threads Video İndirici",
      "hero.pinterest.title": "Pinterest Video İndirici",
      "hero.snapchat.title": "Snapchat Video İndirici",

      "hero.description":
        "Videoları yüksek kalitede hızlı ve kolay bir şekilde indirin. Başlamak için video bağlantınızı aşağıya yapıştırın.",

      "input.placeholder": "Video URL'nizi buraya yapıştırın...",

      "button.fetch": "Videoyu Getir",
      "button.download": "Videoyu İndir",
      "button.audio": "MP3 İndir",
      "button.copy": "URL'yi Kopyala",
      "button.clear": "Temizle",

      "loading.fetching": "Video bilgileri alınıyor...",
      "loading.preparing": "İndirme hazırlanıyor...",
      "loading.processing": "İndirmeniz işleniyor...",

      "status.ready": "İndirme hazır.",
      "status.success": "İndirmeniz hazır.",

      "quality.title": "Mevcut Kalite",
      "quality.video": "Mevcut Video",

      "result.detected": "Algılandı",
      "result.duration": "Süre",
      "result.views": "Görüntülenme",
      "result.author": "Yazar",

      "error.empty": "Lütfen önce bir video URL'si yapıştırın.",
      "error.unsupported": "Bu URL desteklenen bir platforma ait değil.",
      "error.fetch": "Video bilgileri alınamadı.",
      "error.download": "İndirme başarısız oldu. Lütfen tekrar deneyin.",
      "error.busy": "Başka bir indirme zaten hazırlanıyor.",
      "error.timeout": "İndirme çok uzun sürüyor. Lütfen tekrar deneyin.",

      "faq.title": "Sık Sorulan Sorular",

      "footer.disclaimer":
        "VidSnatch bağımsız bir indirme hizmetidir ve belirtilen platformlarla bağlantılı değildir.",
    },

    id: {
      "nav.home": "Beranda",
      "nav.youtube": "YouTube",
      "nav.instagram": "Instagram",
      "nav.facebook": "Facebook",
      "nav.tiktok": "TikTok",
      "nav.twitter": "X / Twitter",
      "nav.reddit": "Reddit",
      "nav.threads": "Threads",
      "nav.pinterest": "Pinterest",
      "nav.snapchat": "Snapchat",

      "hero.badge": "Pengunduh Video Cepat & Gratis",

      "hero.youtube.title": "Pengunduh Video YouTube",
      "hero.instagram.title": "Pengunduh Video Instagram",
      "hero.facebook.title": "Pengunduh Video Facebook",
      "hero.tiktok.title": "Pengunduh Video TikTok",
      "hero.twitter.title": "Pengunduh Video Twitter",
      "hero.reddit.title": "Pengunduh Video Reddit",
      "hero.threads.title": "Pengunduh Video Threads",
      "hero.pinterest.title": "Pengunduh Video Pinterest",
      "hero.snapchat.title": "Pengunduh Video Snapchat",

      "hero.description":
        "Unduh video dengan cepat dan mudah dalam kualitas tinggi. Tempelkan tautan video Anda di bawah untuk memulai.",

      "input.placeholder": "Tempel URL video Anda di sini...",

      "button.fetch": "Ambil Video",
      "button.download": "Unduh Video",
      "button.audio": "Unduh MP3",
      "button.copy": "Salin URL",
      "button.clear": "Hapus",

      "loading.fetching": "Mengambil informasi video...",
      "loading.preparing": "Menyiapkan unduhan...",
      "loading.processing": "Memproses unduhan Anda...",

      "status.ready": "Unduhan siap.",
      "status.success": "Unduhan Anda siap.",

      "quality.title": "Kualitas Tersedia",
      "quality.video": "Video Tersedia",

      "result.detected": "Terdeteksi",
      "result.duration": "Durasi",
      "result.views": "Tayangan",
      "result.author": "Pembuat",

      "error.empty": "Tempel URL video terlebih dahulu.",
      "error.unsupported": "URL ini bukan dari platform yang didukung.",
      "error.fetch": "Tidak dapat mengambil informasi video.",
      "error.download": "Unduhan gagal. Silakan coba lagi.",
      "error.busy": "Unduhan lain sedang disiapkan.",
      "error.timeout": "Unduhan terlalu lama. Silakan coba lagi.",

      "faq.title": "Pertanyaan yang Sering Diajukan",

      "footer.disclaimer":
        "VidSnatch adalah layanan pengunduh independen dan tidak berafiliasi dengan platform yang disebutkan.",
    },

    vi: {
      "nav.home": "Trang chủ",
      "nav.youtube": "YouTube",
      "nav.instagram": "Instagram",
      "nav.facebook": "Facebook",
      "nav.tiktok": "TikTok",
      "nav.twitter": "X / Twitter",
      "nav.reddit": "Reddit",
      "nav.threads": "Threads",
      "nav.pinterest": "Pinterest",
      "nav.snapchat": "Snapchat",

      "hero.badge": "Trình tải video nhanh và miễn phí",

      "hero.youtube.title": "Trình tải video YouTube",
      "hero.instagram.title": "Trình tải video Instagram",
      "hero.facebook.title": "Trình tải video Facebook",
      "hero.tiktok.title": "Trình tải video TikTok",
      "hero.twitter.title": "Trình tải video Twitter",
      "hero.reddit.title": "Trình tải video Reddit",
      "hero.threads.title": "Trình tải video Threads",
      "hero.pinterest.title": "Trình tải video Pinterest",
      "hero.snapchat.title": "Trình tải video Snapchat",

      "hero.description":
        "Tải video nhanh chóng và dễ dàng với chất lượng cao. Dán liên kết video bên dưới để bắt đầu.",

      "input.placeholder": "Dán URL video của bạn tại đây...",

      "button.fetch": "Lấy video",
      "button.download": "Tải video",
      "button.audio": "Tải MP3",
      "button.copy": "Sao chép URL",
      "button.clear": "Xóa",

      "loading.fetching": "Đang lấy thông tin video...",
      "loading.preparing": "Đang chuẩn bị tải xuống...",
      "loading.processing": "Đang xử lý video của bạn...",

      "status.ready": "Tải xuống đã sẵn sàng.",
      "status.success": "Video của bạn đã sẵn sàng.",

      "quality.title": "Chất lượng khả dụng",
      "quality.video": "Video khả dụng",

      "result.detected": "Đã phát hiện",
      "result.duration": "Thời lượng",
      "result.views": "Lượt xem",
      "result.author": "Tác giả",

      "error.empty": "Vui lòng dán URL video trước.",
      "error.unsupported": "URL này không thuộc nền tảng được hỗ trợ.",
      "error.fetch": "Không thể lấy thông tin video.",
      "error.download": "Tải xuống thất bại. Vui lòng thử lại.",
      "error.busy": "Một lượt tải xuống khác đang được chuẩn bị.",
      "error.timeout": "Tải xuống mất quá nhiều thời gian. Vui lòng thử lại.",

      "faq.title": "Câu hỏi thường gặp",

      "footer.disclaimer":
        "VidSnatch là dịch vụ tải xuống độc lập và không liên kết với các nền tảng được đề cập.",
    },

    ja: {
      "nav.home": "ホーム",
      "nav.youtube": "YouTube",
      "nav.instagram": "Instagram",
      "nav.facebook": "Facebook",
      "nav.tiktok": "TikTok",
      "nav.twitter": "X / Twitter",
      "nav.reddit": "Reddit",
      "nav.threads": "Threads",
      "nav.pinterest": "Pinterest",
      "nav.snapchat": "Snapchat",

      "hero.badge": "高速・無料の動画ダウンローダー",

      "hero.youtube.title": "YouTube動画ダウンローダー",
      "hero.instagram.title": "Instagram動画ダウンローダー",
      "hero.facebook.title": "Facebook動画ダウンローダー",
      "hero.tiktok.title": "TikTok動画ダウンローダー",
      "hero.twitter.title": "Twitter動画ダウンローダー",
      "hero.reddit.title": "Reddit動画ダウンローダー",
      "hero.threads.title": "Threads動画ダウンローダー",
      "hero.pinterest.title": "Pinterest動画ダウンローダー",
      "hero.snapchat.title": "Snapchat動画ダウンローダー",

      "hero.description":
        "高画質の動画をすばやく簡単にダウンロードできます。開始するには下に動画リンクを貼り付けてください。",

      "input.placeholder": "動画URLをここに貼り付けてください...",

      "button.fetch": "動画を取得",
      "button.download": "動画をダウンロード",
      "button.audio": "MP3をダウンロード",
      "button.copy": "URLをコピー",
      "button.clear": "クリア",

      "loading.fetching": "動画情報を取得しています...",
      "loading.preparing": "ダウンロードを準備しています...",
      "loading.processing": "ダウンロードを処理しています...",

      "status.ready": "ダウンロードの準備ができました。",
      "status.success": "ダウンロードの準備ができました。",

      "quality.title": "利用可能な画質",
      "quality.video": "利用可能な動画",

      "result.detected": "検出",
      "result.duration": "再生時間",
      "result.views": "再生回数",
      "result.author": "投稿者",

      "error.empty": "まず動画URLを貼り付けてください。",
      "error.unsupported":
        "このURLは対応しているプラットフォームのものではありません。",
      "error.fetch": "動画情報を取得できませんでした。",
      "error.download": "ダウンロードに失敗しました。もう一度お試しください。",
      "error.busy": "別のダウンロードを準備中です。",
      "error.timeout":
        "ダウンロードに時間がかかっています。もう一度お試しください。",

      "faq.title": "よくある質問",

      "footer.disclaimer":
        "VidSnatchは独立したダウンロードサービスであり、記載されているプラットフォームとは提携していません。",
    },

    ko: {
      "nav.home": "홈",
      "nav.youtube": "YouTube",
      "nav.instagram": "Instagram",
      "nav.facebook": "Facebook",
      "nav.tiktok": "TikTok",
      "nav.twitter": "X / Twitter",
      "nav.reddit": "Reddit",
      "nav.threads": "Threads",
      "nav.pinterest": "Pinterest",
      "nav.snapchat": "Snapchat",

      "hero.badge": "빠르고 무료인 동영상 다운로더",

      "hero.youtube.title": "YouTube 동영상 다운로더",
      "hero.instagram.title": "Instagram 동영상 다운로더",
      "hero.facebook.title": "Facebook 동영상 다운로더",
      "hero.tiktok.title": "TikTok 동영상 다운로더",
      "hero.twitter.title": "Twitter 동영상 다운로더",
      "hero.reddit.title": "Reddit 동영상 다운로더",
      "hero.threads.title": "Threads 동영상 다운로더",
      "hero.pinterest.title": "Pinterest 동영상 다운로더",
      "hero.snapchat.title": "Snapchat 동영상 다운로더",

      "hero.description":
        "고화질 동영상을 빠르고 쉽게 다운로드하세요. 시작하려면 아래에 동영상 링크를 붙여넣으세요.",

      "input.placeholder": "동영상 URL을 여기에 붙여넣으세요...",

      "button.fetch": "동영상 가져오기",
      "button.download": "동영상 다운로드",
      "button.audio": "MP3 다운로드",
      "button.copy": "URL 복사",
      "button.clear": "지우기",

      "loading.fetching": "동영상 정보를 가져오는 중...",
      "loading.preparing": "다운로드 준비 중...",
      "loading.processing": "다운로드 처리 중...",

      "status.ready": "다운로드 준비 완료.",
      "status.success": "다운로드가 준비되었습니다.",

      "quality.title": "사용 가능한 화질",
      "quality.video": "사용 가능한 동영상",

      "result.detected": "감지됨",
      "result.duration": "재생 시간",
      "result.views": "조회수",
      "result.author": "작성자",

      "error.empty": "먼저 동영상 URL을 붙여넣으세요.",
      "error.unsupported": "지원되지 않는 플랫폼의 URL입니다.",
      "error.fetch": "동영상 정보를 가져올 수 없습니다.",
      "error.download": "다운로드에 실패했습니다. 다시 시도하세요.",
      "error.busy": "다른 다운로드가 이미 준비 중입니다.",
      "error.timeout": "다운로드에 너무 오래 걸리고 있습니다. 다시 시도하세요.",

      "faq.title": "자주 묻는 질문",

      "footer.disclaimer":
        "VidSnatch는 독립적인 다운로드 서비스이며 위에 언급된 플랫폼과 제휴하지 않습니다.",
    },

    zh: {
      "nav.home": "首页",
      "nav.youtube": "YouTube",
      "nav.instagram": "Instagram",
      "nav.facebook": "Facebook",
      "nav.tiktok": "TikTok",
      "nav.twitter": "X / Twitter",
      "nav.reddit": "Reddit",
      "nav.threads": "Threads",
      "nav.pinterest": "Pinterest",
      "nav.snapchat": "Snapchat",

      "hero.badge": "快速免费的在线视频下载器",

      "hero.youtube.title": "YouTube 视频下载器",
      "hero.instagram.title": "Instagram 视频下载器",
      "hero.facebook.title": "Facebook 视频下载器",
      "hero.tiktok.title": "TikTok 视频下载器",
      "hero.twitter.title": "Twitter 视频下载器",
      "hero.reddit.title": "Reddit 视频下载器",
      "hero.threads.title": "Threads 视频下载器",
      "hero.pinterest.title": "Pinterest 视频下载器",
      "hero.snapchat.title": "Snapchat 视频下载器",

      "hero.description":
        "快速轻松地以高质量下载视频。将视频链接粘贴到下面即可开始。",

      "input.placeholder": "在此粘贴视频 URL...",

      "button.fetch": "获取视频",
      "button.download": "下载视频",
      "button.audio": "下载 MP3",
      "button.copy": "复制 URL",
      "button.clear": "清除",

      "loading.fetching": "正在获取视频信息...",
      "loading.preparing": "正在准备下载...",
      "loading.processing": "正在处理您的下载...",

      "status.ready": "下载已准备好。",
      "status.success": "您的下载已准备好。",

      "quality.title": "可用画质",
      "quality.video": "可用视频",

      "result.detected": "已检测",
      "result.duration": "时长",
      "result.views": "观看次数",
      "result.author": "作者",

      "error.empty": "请先粘贴视频 URL。",
      "error.unsupported": "此 URL 不属于受支持的平台。",
      "error.fetch": "无法获取视频信息。",
      "error.download": "下载失败，请重试。",
      "error.busy": "另一个下载正在准备中。",
      "error.timeout": "下载时间过长，请重试。",

      "faq.title": "常见问题",

      "footer.disclaimer": "VidSnatch 是独立的下载服务，与上述平台没有关联。",
    },

    ru: {
      "nav.home": "Главная",
      "nav.youtube": "YouTube",
      "nav.instagram": "Instagram",
      "nav.facebook": "Facebook",
      "nav.tiktok": "TikTok",
      "nav.twitter": "X / Twitter",
      "nav.reddit": "Reddit",
      "nav.threads": "Threads",
      "nav.pinterest": "Pinterest",
      "nav.snapchat": "Snapchat",

      "hero.badge": "Быстрый и бесплатный загрузчик видео",

      "hero.youtube.title": "Загрузчик видео YouTube",
      "hero.instagram.title": "Загрузчик видео Instagram",
      "hero.facebook.title": "Загрузчик видео Facebook",
      "hero.tiktok.title": "Загрузчик видео TikTok",
      "hero.twitter.title": "Загрузчик видео Twitter",
      "hero.reddit.title": "Загрузчик видео Reddit",
      "hero.threads.title": "Загрузчик видео Threads",
      "hero.pinterest.title": "Загрузчик видео Pinterest",
      "hero.snapchat.title": "Загрузчик видео Snapchat",

      "hero.description":
        "Быстро и легко скачивайте видео в высоком качестве. Вставьте ссылку на видео ниже, чтобы начать.",

      "input.placeholder": "Вставьте URL видео сюда...",

      "button.fetch": "Получить видео",
      "button.download": "Скачать видео",
      "button.audio": "Скачать MP3",
      "button.copy": "Копировать URL",
      "button.clear": "Очистить",

      "loading.fetching": "Получение информации о видео...",
      "loading.preparing": "Подготовка загрузки...",
      "loading.processing": "Обработка загрузки...",

      "status.ready": "Загрузка готова.",
      "status.success": "Ваш файл готов к загрузке.",

      "quality.title": "Доступное качество",
      "quality.video": "Доступное видео",

      "result.detected": "Обнаружено",
      "result.duration": "Длительность",
      "result.views": "Просмотры",
      "result.author": "Автор",

      "error.empty": "Сначала вставьте URL видео.",
      "error.unsupported": "Этот URL не относится к поддерживаемой платформе.",
      "error.fetch": "Не удалось получить информацию о видео.",
      "error.download": "Ошибка загрузки. Попробуйте снова.",
      "error.busy": "Другая загрузка уже готовится.",
      "error.timeout":
        "Загрузка занимает слишком много времени. Попробуйте снова.",

      "faq.title": "Часто задаваемые вопросы",

      "footer.disclaimer":
        "VidSnatch — независимый сервис загрузки и не связан с указанными платформами.",
    },

    ur: {
      "nav.home": "ہوم",
      "nav.youtube": "YouTube",
      "nav.instagram": "Instagram",
      "nav.facebook": "Facebook",
      "nav.tiktok": "TikTok",
      "nav.twitter": "X / Twitter",
      "nav.reddit": "Reddit",
      "nav.threads": "Threads",
      "nav.pinterest": "Pinterest",
      "nav.snapchat": "Snapchat",

      "hero.badge": "تیز اور مفت ویڈیو ڈاؤن لوڈر",

      "hero.youtube.title": "YouTube ویڈیو ڈاؤن لوڈر",
      "hero.instagram.title": "Instagram ویڈیو ڈاؤن لوڈر",
      "hero.facebook.title": "Facebook ویڈیو ڈاؤن لوڈر",
      "hero.tiktok.title": "TikTok ویڈیو ڈاؤن لوڈر",
      "hero.twitter.title": "Twitter ویڈیو ڈاؤن لوڈر",
      "hero.reddit.title": "Reddit ویڈیو ڈاؤن لوڈر",
      "hero.threads.title": "Threads ویڈیو ڈاؤن لوڈر",
      "hero.pinterest.title": "Pinterest ویڈیو ڈاؤن لوڈر",
      "hero.snapchat.title": "Snapchat ویڈیو ڈاؤن لوڈر",

      "hero.description":
        "ویڈیوز کو اعلیٰ معیار میں تیزی اور آسانی سے ڈاؤن لوڈ کریں۔ شروع کرنے کے لیے نیچے ویڈیو لنک پیسٹ کریں۔",

      "input.placeholder": "اپنا ویڈیو URL یہاں پیسٹ کریں...",

      "button.fetch": "ویڈیو حاصل کریں",
      "button.download": "ویڈیو ڈاؤن لوڈ کریں",
      "button.audio": "MP3 ڈاؤن لوڈ کریں",
      "button.copy": "URL کاپی کریں",
      "button.clear": "صاف کریں",

      "loading.fetching": "ویڈیو کی معلومات حاصل کی جا رہی ہیں...",
      "loading.preparing": "ڈاؤن لوڈ تیار کیا جا رہا ہے...",
      "loading.processing": "آپ کا ڈاؤن لوڈ تیار کیا جا رہا ہے...",

      "status.ready": "ڈاؤن لوڈ تیار ہے۔",
      "status.success": "آپ کا ڈاؤن لوڈ تیار ہے۔",

      "quality.title": "دستیاب معیار",
      "quality.video": "دستیاب ویڈیو",

      "result.detected": "شناخت شدہ",
      "result.duration": "دورانیہ",
      "result.views": "ویوز",
      "result.author": "مصنف",

      "error.empty": "براہ کرم پہلے ویڈیو URL پیسٹ کریں۔",
      "error.unsupported": "یہ URL کسی معاون پلیٹ فارم کا نہیں ہے۔",
      "error.fetch": "ویڈیو کی معلومات حاصل نہیں ہو سکیں۔",
      "error.download": "ڈاؤن لوڈ ناکام ہوگیا۔ دوبارہ کوشش کریں۔",
      "error.busy": "ایک اور ڈاؤن لوڈ پہلے ہی تیار ہو رہا ہے۔",
      "error.timeout":
        "ڈاؤن لوڈ میں بہت زیادہ وقت لگ رہا ہے۔ دوبارہ کوشش کریں۔",

      "faq.title": "اکثر پوچھے گئے سوالات",

      "footer.disclaimer":
        "VidSnatch ایک آزاد ڈاؤن لوڈ سروس ہے اور مذکورہ پلیٹ فارمز سے وابستہ نہیں ہے۔",
    },
  };

  /* ==========================================================
     STORAGE
     ========================================================== */

  const STORAGE_KEY = "vidsnatch-language";

  function getStoredLanguage() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  }

  function storeLanguage(language) {
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch {}
  }

  /* ==========================================================
     V4 CORE HOME TRANSLATIONS
     ========================================================== */

  const CORE_TRANSLATIONS = {"en": {"hero.badge": "Fast & Free Video Downloader", "hero.title": "Download Videos", "hero.titleAccent": "From Anywhere", "hero.subtitle": "Paste a public video link from a supported social platform and download available video formats with VidSnatch.", "downloader.placeholder": "Paste YouTube, Instagram, TikTok, Facebook, X, Reddit or other supported URL...", "downloader.clear": "Clear URL", "supported.title": "Supported:"}, "hi": {"hero.badge": "तेज़ और मुफ़्त वीडियो डाउनलोडर", "hero.title": "वीडियो डाउनलोड करें", "hero.titleAccent": "कहीं से भी", "hero.subtitle": "किसी समर्थित सोशल प्लेटफ़ॉर्म का सार्वजनिक वीडियो लिंक पेस्ट करें और उपलब्ध वीडियो फ़ॉर्मैट VidSnatch से डाउनलोड करें।", "downloader.placeholder": "YouTube, Instagram, TikTok, Facebook, X, Reddit या अन्य समर्थित URL पेस्ट करें...", "downloader.clear": "URL साफ़ करें", "supported.title": "समर्थित:"}, "fr": {"hero.badge": "Téléchargeur vidéo rapide et gratuit", "hero.title": "Téléchargez des vidéos", "hero.titleAccent": "de partout", "hero.subtitle": "Collez le lien d’une vidéo publique d’une plateforme prise en charge et téléchargez les formats disponibles avec VidSnatch.", "downloader.placeholder": "Collez une URL YouTube, Instagram, TikTok, Facebook, X, Reddit ou autre URL prise en charge...", "downloader.clear": "Effacer l’URL", "supported.title": "Pris en charge :"}, "te": {"hero.badge": "వేగవంతమైన & ఉచిత వీడియో డౌన్\u200cలోడర్", "hero.title": "వీడియోలను డౌన్\u200cలోడ్ చేయండి", "hero.titleAccent": "ఎక్కడి నుంచైనా", "hero.subtitle": "మద్దతు ఉన్న సోషల్ ప్లాట్\u200cఫారమ్\u200cలోని పబ్లిక్ వీడియో లింక్\u200cను పేస్ట్ చేసి, అందుబాటులో ఉన్న వీడియో ఫార్మాట్\u200cలను VidSnatchతో డౌన్\u200cలోడ్ చేయండి.", "downloader.placeholder": "YouTube, Instagram, TikTok, Facebook, X, Reddit లేదా ఇతర మద్దతు ఉన్న URLను పేస్ట్ చేయండి...", "downloader.clear": "URL క్లియర్ చేయండి", "supported.title": "మద్దతు ఉన్నవి:"}, "ta": {"hero.badge": "வேகமான & இலவச வீடியோ டவுன்லோடர்", "hero.title": "வீடியோக்களை பதிவிறக்குங்கள்", "hero.titleAccent": "எங்கிருந்தும்", "hero.subtitle": "ஆதரிக்கப்படும் சமூக தளத்தின் பொது வீடியோ இணைப்பை ஒட்டி, கிடைக்கும் வீடியோ வடிவங்களை VidSnatch மூலம் பதிவிறக்குங்கள்.", "downloader.placeholder": "YouTube, Instagram, TikTok, Facebook, X, Reddit அல்லது ஆதரிக்கப்படும் URL-ஐ ஒட்டுங்கள்...", "downloader.clear": "URL அழிக்கவும்", "supported.title": "ஆதரிக்கப்படுபவை:"}, "kn": {"hero.badge": "ವೇಗದ ಮತ್ತು ಉಚಿತ ವೀಡಿಯೊ ಡೌನ್\u200cಲೋಡರ್", "hero.title": "ವೀಡಿಯೊಗಳನ್ನು ಡೌನ್\u200cಲೋಡ್ ಮಾಡಿ", "hero.titleAccent": "ಎಲ್ಲಿಂದ ಬೇಕಾದರೂ", "hero.subtitle": "ಬೆಂಬಲಿತ ಸಾಮಾಜಿಕ ವೇದಿಕೆಯ ಸಾರ್ವಜನಿಕ ವೀಡಿಯೊ ಲಿಂಕ್ ಅನ್ನು ಅಂಟಿಸಿ ಮತ್ತು ಲಭ್ಯವಿರುವ ವೀಡಿಯೊ ಫಾರ್ಮ್ಯಾಟ್\u200cಗಳನ್ನು VidSnatch ಮೂಲಕ ಡೌನ್\u200cಲೋಡ್ ಮಾಡಿ.", "downloader.placeholder": "YouTube, Instagram, TikTok, Facebook, X, Reddit ಅಥವಾ ಇತರ ಬೆಂಬಲಿತ URL ಅಂಟಿಸಿ...", "downloader.clear": "URL ತೆರವುಗೊಳಿಸಿ", "supported.title": "ಬೆಂಬಲಿತ:"}, "ar": {"hero.badge": "أداة تنزيل فيديو سريعة ومجانية", "hero.title": "تنزيل الفيديوهات", "hero.titleAccent": "من أي مكان", "hero.subtitle": "الصق رابط فيديو عام من منصة اجتماعية مدعومة وقم بتنزيل صيغ الفيديو المتاحة باستخدام VidSnatch.", "downloader.placeholder": "الصق رابط YouTube أو Instagram أو TikTok أو Facebook أو X أو Reddit أو أي رابط مدعوم...", "downloader.clear": "مسح الرابط", "supported.title": "المنصات المدعومة:"}, "bn": {"hero.badge": "দ্রুত ও বিনামূল্যের ভিডিও ডাউনলোডার", "hero.title": "ভিডিও ডাউনলোড করুন", "hero.titleAccent": "যেকোনো জায়গা থেকে", "hero.subtitle": "সমর্থিত সামাজিক প্ল্যাটফর্মের একটি পাবলিক ভিডিও লিংক পেস্ট করুন এবং VidSnatch দিয়ে উপলভ্য ভিডিও ফরম্যাট ডাউনলোড করুন।", "downloader.placeholder": "YouTube, Instagram, TikTok, Facebook, X, Reddit বা অন্য সমর্থিত URL পেস্ট করুন...", "downloader.clear": "URL পরিষ্কার করুন", "supported.title": "সমর্থিত:"}, "es": {"hero.badge": "Descargador de vídeos rápido y gratuito", "hero.title": "Descarga vídeos", "hero.titleAccent": "desde cualquier lugar", "hero.subtitle": "Pega el enlace de un vídeo público de una plataforma compatible y descarga los formatos disponibles con VidSnatch.", "downloader.placeholder": "Pega una URL de YouTube, Instagram, TikTok, Facebook, X, Reddit u otra compatible...", "downloader.clear": "Borrar URL", "supported.title": "Compatible:"}, "pt": {"hero.badge": "Downloader de vídeo rápido e gratuito", "hero.title": "Baixe vídeos", "hero.titleAccent": "de qualquer lugar", "hero.subtitle": "Cole um link de vídeo público de uma plataforma compatível e baixe os formatos disponíveis com o VidSnatch.", "downloader.placeholder": "Cole uma URL do YouTube, Instagram, TikTok, Facebook, X, Reddit ou outra compatível...", "downloader.clear": "Limpar URL", "supported.title": "Compatível:"}, "de": {"hero.badge": "Schneller und kostenloser Video-Downloader", "hero.title": "Videos herunterladen", "hero.titleAccent": "von überall", "hero.subtitle": "Füge einen öffentlichen Videolink einer unterstützten Plattform ein und lade verfügbare Videoformate mit VidSnatch herunter.", "downloader.placeholder": "YouTube-, Instagram-, TikTok-, Facebook-, X-, Reddit- oder andere unterstützte URL einfügen...", "downloader.clear": "URL löschen", "supported.title": "Unterstützt:"}, "it": {"hero.badge": "Downloader video veloce e gratuito", "hero.title": "Scarica video", "hero.titleAccent": "da qualsiasi luogo", "hero.subtitle": "Incolla il link di un video pubblico da una piattaforma supportata e scarica i formati disponibili con VidSnatch.", "downloader.placeholder": "Incolla un URL YouTube, Instagram, TikTok, Facebook, X, Reddit o altro URL supportato...", "downloader.clear": "Cancella URL", "supported.title": "Supportati:"}, "tr": {"hero.badge": "Hızlı ve ücretsiz video indirici", "hero.title": "Videoları indir", "hero.titleAccent": "her yerden", "hero.subtitle": "Desteklenen bir sosyal platformdaki herkese açık video bağlantısını yapıştırın ve mevcut video formatlarını VidSnatch ile indirin.", "downloader.placeholder": "YouTube, Instagram, TikTok, Facebook, X, Reddit veya desteklenen başka bir URL yapıştırın...", "downloader.clear": "URL’yi temizle", "supported.title": "Desteklenen:"}, "id": {"hero.badge": "Pengunduh Video Cepat & Gratis", "hero.title": "Unduh Video", "hero.titleAccent": "Dari Mana Saja", "hero.subtitle": "Tempel tautan video publik dari platform sosial yang didukung dan unduh format video yang tersedia dengan VidSnatch.", "downloader.placeholder": "Tempel URL YouTube, Instagram, TikTok, Facebook, X, Reddit atau URL lain yang didukung...", "downloader.clear": "Hapus URL", "supported.title": "Didukung:"}, "vi": {"hero.badge": "Trình tải video nhanh & miễn phí", "hero.title": "Tải video", "hero.titleAccent": "từ mọi nơi", "hero.subtitle": "Dán liên kết video công khai từ nền tảng xã hội được hỗ trợ và tải các định dạng video có sẵn bằng VidSnatch.", "downloader.placeholder": "Dán URL YouTube, Instagram, TikTok, Facebook, X, Reddit hoặc URL được hỗ trợ khác...", "downloader.clear": "Xóa URL", "supported.title": "Được hỗ trợ:"}, "ja": {"hero.badge": "高速・無料の動画ダウンローダー", "hero.title": "動画をダウンロード", "hero.titleAccent": "どこからでも", "hero.subtitle": "対応しているソーシャルプラットフォームの公開動画リンクを貼り付け、VidSnatchで利用可能な動画形式をダウンロードできます。", "downloader.placeholder": "YouTube、Instagram、TikTok、Facebook、X、Redditなどの対応URLを貼り付けてください...", "downloader.clear": "URLをクリア", "supported.title": "対応:"}, "ko": {"hero.badge": "빠르고 무료인 동영상 다운로더", "hero.title": "동영상 다운로드", "hero.titleAccent": "어디서나", "hero.subtitle": "지원되는 소셜 플랫폼의 공개 동영상 링크를 붙여 넣고 VidSnatch에서 사용 가능한 동영상 형식을 다운로드하세요.", "downloader.placeholder": "YouTube, Instagram, TikTok, Facebook, X, Reddit 또는 지원되는 URL을 붙여 넣으세요...", "downloader.clear": "URL 지우기", "supported.title": "지원:"}, "zh": {"hero.badge": "快速免费的在线视频下载器", "hero.title": "下载视频", "hero.titleAccent": "随时随地", "hero.subtitle": "粘贴受支持社交平台的公开视频链接，并使用 VidSnatch 下载可用的视频格式。", "downloader.placeholder": "粘贴 YouTube、Instagram、TikTok、Facebook、X、Reddit 或其他受支持的 URL...", "downloader.clear": "清除 URL", "supported.title": "支持的平台:"}, "ru": {"hero.badge": "Быстрый и бесплатный загрузчик видео", "hero.title": "Скачивайте видео", "hero.titleAccent": "откуда угодно", "hero.subtitle": "Вставьте общедоступную ссылку на видео с поддерживаемой социальной платформы и скачайте доступные форматы с VidSnatch.", "downloader.placeholder": "Вставьте URL YouTube, Instagram, TikTok, Facebook, X, Reddit или другой поддерживаемый URL...", "downloader.clear": "Очистить URL", "supported.title": "Поддерживается:"}, "ur": {"hero.badge": "تیز اور مفت ویڈیو ڈاؤن لوڈر", "hero.title": "ویڈیوز ڈاؤن لوڈ کریں", "hero.titleAccent": "کہیں سے بھی", "hero.subtitle": "کسی معاون سوشل پلیٹ فارم کی عوامی ویڈیو کا لنک پیسٹ کریں اور VidSnatch سے دستیاب ویڈیو فارمیٹس ڈاؤن لوڈ کریں۔", "downloader.placeholder": "YouTube، Instagram، TikTok، Facebook، X، Reddit یا کسی معاون URL کو پیسٹ کریں...", "downloader.clear": "URL صاف کریں", "supported.title": "معاون پلیٹ فارمز:"}};

  Object.entries(CORE_TRANSLATIONS).forEach(([language, values]) => {
    if (TRANSLATIONS[language]) {
      Object.assign(TRANSLATIONS[language], values);
    }
  });

  /* ==========================================================
     BROWSER LANGUAGE
     ========================================================== */

  function detectBrowserLanguage() {
    const browser = navigator.language || navigator.userLanguage || "en";

    const code = browser.toLowerCase().split("-")[0];

    return TRANSLATIONS[code] ? code : "en";
  }

  /* ==========================================================
     CURRENT LANGUAGE
     ========================================================== */

  let currentLanguage = getStoredLanguage();

  if (!currentLanguage || !TRANSLATIONS[currentLanguage]) {
    currentLanguage = detectBrowserLanguage();
  }

  /* ==========================================================
     TRANSLATION LOOKUP
     ========================================================== */

  function translate(key) {
    const current = TRANSLATIONS[currentLanguage];

    if (current && Object.prototype.hasOwnProperty.call(current, key)) {
      return current[key];
    }

    if (
      TRANSLATIONS.en &&
      Object.prototype.hasOwnProperty.call(TRANSLATIONS.en, key)
    ) {
      return TRANSLATIONS.en[key];
    }

    return key;
  }

  /* ==========================================================
     ELEMENT HELPER
     ========================================================== */

  function getElements(root, selector) {
    if (!root) {
      return [];
    }

    const elements = [];

    if (root.nodeType === Node.ELEMENT_NODE && root.matches(selector)) {
      elements.push(root);
    }

    elements.push(...root.querySelectorAll(selector));

    return elements;
  }

  /* ==========================================================
     SHARED NAVBAR TRANSLATION
     ========================================================== */

  function updateSharedNavbarTranslations() {
    document
      .querySelectorAll(".vs-shared-header .nav-platform")
      .forEach((link) => {
        const platform = link.dataset.platform;

        if (!platform) {
          return;
        }

        const label = translate(`nav.${platform}`);

        if (!label || label === `nav.${platform}`) {
          return;
        }

        /*
         * Keep icon untouched.
         * Only update the text node after the icon.
         */
        const icon = link.querySelector(":scope > span");

        if (icon) {
          Array.from(link.childNodes)
            .filter((node) => node.nodeType === Node.TEXT_NODE)
            .forEach((node, index) => {
              node.nodeValue = index === 0 ? ` ${label}` : "";
            });
        } else {
          link.textContent = label;
        }
      });
  }

  /* ==========================================================
     DATA ATTRIBUTES
     ========================================================== */

  function applyTranslations(root = document) {
    getElements(root, "[data-i18n]").forEach((element) => {
      const key = element.dataset.i18n;

      if (!key) {
        return;
      }

      const value = translate(key);
      if (value !== key) element.textContent = value;
    });

    getElements(root, "[data-i18n-placeholder]").forEach((element) => {
      const key = element.dataset.i18nPlaceholder;

      if (!key) {
        return;
      }

      const value = translate(key);
      if (value !== key) element.setAttribute("placeholder", value);
    });

    getElements(root, "[data-i18n-title]").forEach((element) => {
      const key = element.dataset.i18nTitle;

      if (!key) {
        return;
      }

      const value = translate(key);
      if (value !== key) element.setAttribute("title", value);
    });

    getElements(root, "[data-i18n-aria-label]").forEach((element) => {
      const key = element.dataset.i18nAriaLabel;

      if (!key) {
        return;
      }

      const value = translate(key);
      if (value !== key) element.setAttribute("aria-label", value);
    });

  }

  /* ==========================================================
     DOCUMENT LANGUAGE / DIRECTION
     ========================================================== */

  function applyDocumentLanguage() {
    const language = LANGUAGES[currentLanguage] || LANGUAGES.en;

    document.documentElement.lang = currentLanguage;

    document.documentElement.dir = language.direction;
  }

  /* ==========================================================
     PLATFORM FROM PAGE
     ========================================================== */

  function getPlatformFromPage() {
    const body = document.body;

    if (!body) {
      return "";
    }

    return (
      body.dataset.platform ||
      document.documentElement.dataset.platform ||
      ""
    ).toLowerCase();
  }

  /* ==========================================================
     DYNAMIC PAGE TITLE
     ========================================================== */

  function updatePageTitle() {
    const platform = getPlatformFromPage();

    const key = platform ? `hero.${platform}.title` : "";

    const translatedTitle =
      key && translate(key) !== key ? translate(key) : "VidSnatch";

    document.title = `${translatedTitle} | VidSnatch`;
  }

  /* ==========================================================
     LANGUAGE SELECT
     ========================================================== */

  function populateLanguageSelect(select) {
    if (!select) {
      return;
    }

    const current = select.value || currentLanguage;

    select.innerHTML = "";

    Object.entries(LANGUAGES).forEach(([code, language]) => {
      const option = document.createElement("option");

      option.value = code;
      option.textContent = language.nativeName;

      select.appendChild(option);
    });

    select.value = LANGUAGES[current] ? current : currentLanguage;
  }

  function setupLanguageSelectors() {
    const selectors = document.querySelectorAll("[data-language-select]");

    selectors.forEach((select) => {
      populateLanguageSelect(select);

      if (select.dataset.translationBound === "true") {
        select.value = currentLanguage;
        return;
      }

      select.dataset.translationBound = "true";

      select.addEventListener("change", () => {
        setLanguage(select.value);
      });
    });
  }

  /* ==========================================================
     SET LANGUAGE
     ========================================================== */

  function setLanguage(language) {
    if (!TRANSLATIONS[language]) {
      language = "en";
    }

    currentLanguage = language;

    storeLanguage(currentLanguage);

    applyDocumentLanguage();

    applyTranslations();

    updatePageTitle();

    document.querySelectorAll("[data-language-select]").forEach((select) => {
      select.value = currentLanguage;
    });

    window.dispatchEvent(
      new CustomEvent("vidsnatch:languagechange", {
        detail: {
          language: currentLanguage,
        },
      }),
    );
  }

  /* ==========================================================
     PUBLIC API
     ========================================================== */

  window.VidSnatchTranslations = {
    languages: LANGUAGES,

    translations: TRANSLATIONS,

    getLanguage() {
      return currentLanguage;
    },

    setLanguage,

    translate,

    apply: applyTranslations,

    getLanguageInfo() {
      return LANGUAGES[currentLanguage] || LANGUAGES.en;
    },
  };

  /* ==========================================================
     INIT
     ========================================================== */

  function init() {
    applyDocumentLanguage();

    setupLanguageSelectors();

    applyTranslations();

    updatePageTitle();

    /*
     * site-ui.js is responsible for refreshing the shared navbar
     * after it injects it. Do not use a MutationObserver here: 
     * applyTranslations() changes text nodes, which would trigger
     * an observer again and can lock the browser in an infinite
     * mutation loop.
     */

    /*
     * Keep everything synchronized when another
     * VidSnatch component changes the language.
     */
    window.addEventListener("vidsnatch:languagechange", () => {
      applyDocumentLanguage();
      applyTranslations();
      updatePageTitle();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
