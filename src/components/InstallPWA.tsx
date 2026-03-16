import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

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
    console.log(`User response to the install prompt: ${outcome}`);
    setDeferredPrompt(null);
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    /* التعديل: fixed inset-0 تجعل المستطيل يملأ الشاشة بالكامل بالطول والعرض */
    <div className="fixed inset-0 bg-white z-[100] flex flex-col items-center justify-center p-6 animate-in fade-in duration-300" dir="rtl">
      
      {/* زر الإغلاق في الزاوية العلوية */}
      <button
        onClick={() => setShowBanner(false)}
        className="absolute top-6 left-6 p-2 text-gray-400 hover:text-gray-600"
      >
        <X size={32} />
      </button>

      {/* المحتوى المتمركز في وسط الشاشة تماماً */}
      <div className="text-center flex flex-col items-center gap-6">
        
        {/* النص المطلوب أعلاه */}
        <h2 className="text-2xl font-bold text-gray-900">حمل تطبيق علي كاش</h2>

        {/* زر التثبيت الأزرق (النيلي) في المنتصف */}
        <button
          onClick={handleInstall}
          className="bg-indigo-600 text-white px-16 py-4 rounded-2xl text-xl font-bold shadow-2xl hover:bg-indigo-700 transition-all active:scale-95"
        >
          تثبيت
        </button>
        
      </div>
    </div>
  );
}
