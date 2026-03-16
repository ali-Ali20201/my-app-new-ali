import { useState, useEffect } from 'react';

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowBanner(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response: ${outcome}`);
    setDeferredPrompt(null);
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    /* الخلفية الزرقاء التي تغطي كامل الشاشة كما في الصورة */
    <div className="fixed inset-0 bg-[#4f46e5] z-[100] flex flex-col items-center justify-center p-8 animate-in fade-in duration-500" dir="rtl">
      
      <div className="flex flex-col items-center w-full max-w-sm text-center">
        
        {/* المربع الذي يحتوي على أيقونة التطبيق (icon.png) */}
        <div className="w-48 h-48 bg-white/10 backdrop-blur-sm rounded-[40px] shadow-2xl flex items-center justify-center mb-10 border border-white/20">
          <img 
            src="icon.png" 
            alt="Ali Cash Icon" 
            className="w-32 h-32 object-contain"
          />
        </div>

        {/* النصوص المطابقة للصورة تماماً */}
        <h1 className="text-white text-4xl font-bold mb-4 tracking-tight">
          مرحباً بك في علي كاش
        </h1>
        
        <p className="text-indigo-100 text-lg mb-12 leading-relaxed">
          ثبت التطبيق الآن للوصول السريع والتنبيهات الفورية
        </p>

        {/* زر التثبيت بتصميم متناسق مع الخلفية */}
        <button
          onClick={handleInstall}
          className="w-full bg-white text-[#4f46e5] py-4 rounded-2xl text-xl font-bold shadow-xl hover:bg-indigo-50 transition-all active:scale-95"
        >
          تثبيت التطبيق
        </button>

      </div>
    </div>
  );
}
