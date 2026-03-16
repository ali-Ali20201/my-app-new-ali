import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { App as CapacitorApp } from '@capacitor/app';
import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { useSocket } from '../hooks/useSocket';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { apiFetch } from '../utils/api';

let lastBackPressTime = 0;

export default function MobileAppHandler() {
  const navigate = useNavigate();
  const location = useLocation();
  const socket = useSocket();
  const { user } = useAuth();
  const [showExitToast, setShowExitToast] = useState(false);

  // Handle Hardware Back Button
  useEffect(() => {
    let listenerHandle: any = null;

    const setupListener = async () => {
      // Capacitor Handling
      if (Capacitor.isNativePlatform()) {
        try {
          listenerHandle = await CapacitorApp.addListener('backButton', async () => {
            if (location.pathname === '/' || location.pathname === '/admin') {
              const now = Date.now();
              if (now - lastBackPressTime < 2000) {
                await CapacitorApp.exitApp();
              } else {
                lastBackPressTime = now;
                setShowExitToast(true);
                setTimeout(() => setShowExitToast(false), 2000);
              }
            } else {
              if (window.history.length > 1) {
                navigate(-1);
              } else {
                navigate('/', { replace: true });
              }
            }
          });
        } catch (e) {
          console.error('Error setting up back button listener', e);
        }
      }

      // Median.co (GoNative) Handling
      if ((window as any).gonative) {
        (window as any).gonative.on('backButton', () => {
          if (location.pathname === '/' || location.pathname === '/admin') {
            const now = Date.now();
            if (now - lastBackPressTime < 2000) {
              window.location.href = 'gonative://app/exit';
            } else {
              lastBackPressTime = now;
              setShowExitToast(true);
              setTimeout(() => setShowExitToast(false), 2000);
            }
          } else {
            navigate(-1);
          }
        });
      }
    };

    setupListener();

    return () => {
      if (listenerHandle) {
        listenerHandle.remove();
      }
    };
  }, [location.pathname, navigate]);

  // Request Notification Permissions
  useEffect(() => {
    const requestPermissions = async () => {
      // Capacitor
      if (Capacitor.isNativePlatform()) {
        try {
          const permStatus = await LocalNotifications.checkPermissions();
          if (permStatus.display !== 'granted') {
            await LocalNotifications.requestPermissions();
          }
        } catch (e) {
          console.error('LocalNotifications not available', e);
        }
      }

      // Median.co
      if ((window as any).gonative) {
        window.location.href = 'gonative://push/register';
      }
    };
    requestPermissions();
  }, []);

  // Web Push Subscription
  useEffect(() => {
    const subscribeUser = async () => {
      try {
        if (Capacitor.isNativePlatform()) {
          let permStatus = await LocalNotifications.checkPermissions();
          
          if (permStatus.display === 'prompt' || permStatus.display === 'prompt-with-rationale') {
            permStatus = await LocalNotifications.requestPermissions();
          }
          
          if (permStatus.display !== 'granted') {
            console.log('Native notification permission denied');
            return;
          }
          
          // Note: Native push notifications require @capacitor/push-notifications and FCM setup.
          // This just requests the local notification permission so the prompt works.
          return;
        }

        // Web Push Logic
        const isWebView = 
          (window as any).gonative || 
          (window as any).webkit?.messageHandlers || 
          navigator.userAgent.includes('wv') ||
          navigator.userAgent.includes('WebView');

        if (isWebView) {
          // WebViews often handle push notifications natively through their own SDKs
          // We don't need to register a service worker for them
          return;
        }

        if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;
        if (Notification.permission === 'denied') return;

        // Request permission first
        if (Notification.permission === 'default') {
          const permission = await Notification.requestPermission();
          if (permission !== 'granted') {
            console.log('Notification permission denied');
            return;
          }
        }

        // Register service worker
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });
        
        // Wait for service worker to be ready
        await navigator.serviceWorker.ready;

        // Check for existing subscription
        let subscription = await registration.pushManager.getSubscription();
        
        if (!subscription) {
          // Get public key from server
          const response = await apiFetch('/api/push/vapid-public-key');
          const { publicKey } = await response.json();
          
          if (!publicKey) return;

          // Subscribe user
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: publicKey
          });
        }

        // Send subscription to server ONLY IF USER IS LOGGED IN
        if (user) {
          await apiFetch('/api/push/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user.id, subscription })
          });
        }
      } catch (err) {
        console.error('Push subscription failed:', err);
      }
    };

    subscribeUser();

    const handleManualSubscribe = () => {
      subscribeUser();
    };

    window.addEventListener('subscribe-push', handleManualSubscribe);

    return () => {
      window.removeEventListener('subscribe-push', handleManualSubscribe);
    };
  }, [user]);

  // Handle Socket Events for Notifications
  useEffect(() => {
    if (!socket || !user) return;

    const playBeep = () => {
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;
        
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
        
        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + 0.5);
        
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
      } catch (e) {
        console.error('Audio play failed', e);
      }
    };

    const showNotification = async (title: string, body: string) => {
      console.log('Attempting to show notification:', title, body);
      // Median.co Local Notification
      if ((window as any).gonative) {
        (window as any).gonative.notifications.local.create({
          title,
          body,
          icon: 'default'
        });
        playBeep();
        return;
      }

      // Capacitor Local Notification
      try {
        playBeep(); // Play sound immediately in foreground
        console.log('Scheduling local notification...');
        await LocalNotifications.schedule({
          notifications: [
            {
              title,
              body,
              id: Math.floor(Math.random() * 2147483647),
              schedule: { at: new Date(Date.now() + 100) },
              sound: 'default',
              actionTypeId: '',
              extra: null
            }
          ]
        });
        console.log('Notification scheduled successfully');
      } catch (e) {
        console.error('Failed to schedule notification', e);
      }
    };

    if (user.role === 'admin') {
      socket.on('order_created', () => {
        console.log('Received order_created event');
        showNotification('طلب منتج جديد', 'يوجد طلب شراء جديد بانتظار المراجعة');
      });

      socket.on('recharge_requested', () => {
        console.log('Received recharge_requested event');
        showNotification('طلب شحن جديد', 'يوجد طلب شحن رصيد جديد بانتظار المراجعة');
      });
    }

    socket.on('order_updated', (data: any) => {
      console.log('Received order_updated event', data);
      if (data && data.userId === user.id) {
        showNotification('تحديث حالة الطلب', 'تم تحديث حالة طلبك، يرجى مراجعة قائمة الطلبات');
      }
    });

    socket.on('recharge_updated', (data: any) => {
      console.log('Received recharge_updated event', data);
      if (data && data.userId === user.id) {
        showNotification('تحديث حالة الشحن', 'تم تحديث حالة طلب الشحن الخاص بك');
      }
    });

    return () => {
      socket.off('order_created');
      socket.off('recharge_requested');
      socket.off('order_updated');
      socket.off('recharge_updated');
    };
  }, [socket, user]);

  return (
    <AnimatePresence>
      {showExitToast && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[9999] bg-gray-900/90 text-white px-6 py-3 rounded-full text-sm font-medium shadow-lg backdrop-blur-sm border border-white/10"
        >
          اضغط مرة أخرى للخروج
        </motion.div>
      )}
    </AnimatePresence>
  );
}
