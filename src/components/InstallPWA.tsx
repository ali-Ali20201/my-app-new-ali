import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI notify the user they can add to home screen
      setShowBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowBanner(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    // Show the prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);

    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    /* التعديل: جعل الحاوية تمتد بكامل عرض الشاشة وتلتصق بالأسفل */
    <div className="fixed bottom-0 left-0 right-0 z-[100] animate-in fade-in slide-in-from-bottom-4 duration-300" dir="rtl">
      
      {/* التعديل: المستطيل الأبيض يعبي العرض بالكامل مع توزيع العناصر في المنتصف عمودياً */}
      <div className="bg-white p-6 border-t border-indigo-100 flex flex-col items-center justify-center gap-4 relative">
        
        {/* زر الإغلاق تم وضعه في الزاوية لكي لا يخرب التوسيط */}
        <button
          onClick={() => setShowBanner(false)}
          className="absolute top-4 left-4 p-2 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>

        {/* النص المطلوب إضافته فوق الزر */}
        <h3 className="font-bold text-gray-900 text-lg">حمل تطبيق علي كاش</h3>

        {/* زر التثبيت في منتصف الشاشة */}
        <button
          onClick={handleInstall}
          className="bg-indigo-600 text-white px-12 py-3 rounded-xl text-md font-bold shadow-md hover:bg-indigo-700 transition-colors whitespace-nowrap"
        >
          تثبيت
        </button>

      </div>
    </div>
  );
}
