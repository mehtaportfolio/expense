import { useState, useEffect, useCallback } from 'react';
import { Expense, SalaryDetail } from '../types/database';

// Helper to convert VAPID key
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;
const PUSH_SERVER_URL = '/api/subscribe'; 

export function useNotifications(expenses: Expense[], salaryDetails?: SalaryDetail[]) {
  const [isEnabled, setIsEnabled] = useState(() => {
    return localStorage.getItem('notifications_enabled') === 'true';
  });

  const [isMonthlyEnabled, setIsMonthlyEnabled] = useState(() => {
    return localStorage.getItem('monthly_notifications_enabled') === 'true';
  });

  const subscribeToPush = async () => {
    if (!VAPID_PUBLIC_KEY || !PUSH_SERVER_URL) {
      console.warn('VAPID_PUBLIC_KEY or PUSH_SERVER_URL is not configured');
      return;
    }
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push messaging is not supported');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      const userId = localStorage.getItem('push_user_id') || `user-${Math.random().toString(36).substring(2, 11)}`;
      localStorage.setItem('push_user_id', userId);

      // Request periodic sync if supported (for offline fallbacks)
      if ('periodicSync' in registration) {
        try {
          // @ts-ignore
          const status = await navigator.permissions.query({
            // @ts-ignore
            name: 'periodic-background-sync',
          });
          
          if (status.state === 'granted') {
            // @ts-ignore
            await registration.periodicSync.register('daily-summary', {
              minInterval: 24 * 60 * 60 * 1000, // 24 hours
            });
          }
        } catch (e) {
          // Silently fail for periodic sync
        }
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });

      // Send subscription to backend server
      console.log('Sending subscription to server:', PUSH_SERVER_URL);
      const response = await fetch(PUSH_SERVER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription,
          userId,
          preferences: {
            daily: true,
            monthly: true,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
          }
        }),
      });
      const result = await response.json();
      console.log('Server response:', result);

      console.log('Push subscription successful');
    } catch (err) {
      console.error('Failed to subscribe to push notifications:', err);
    }
  };

  const unsubscribeFromPush = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        // Notify backend
        await fetch('/api/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: subscription.endpoint })
        });
      }
    } catch (err) {
      console.error('Failed to unsubscribe:', err);
    }
  };

  // Subscribe on mount if enabled
  useEffect(() => {
    if (isEnabled || isMonthlyEnabled) {
      subscribeToPush();
    }
  }, []);

  const calculateDailyTotals = useCallback(() => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentMonth = now.toISOString().substring(0, 7); // YYYY-MM

    const todayTotal = expenses
      .filter(exp => exp.date.split('T')[0] === today && exp.expense_type !== 'income')
      .reduce((sum, exp) => sum + exp.amount, 0);

    const monthTotal = expenses
      .filter(exp => exp.date.substring(0, 7) === currentMonth && exp.expense_type !== 'income')
      .reduce((sum, exp) => sum + exp.amount, 0);

    return { todayTotal, monthTotal };
  }, [expenses]);

  const calculateMonthlySummary = useCallback(() => {
    if (!salaryDetails) return null;

    const now = new Date();
    // Get last month and its year
    let lastMonth = now.getMonth() - 1;
    let year = now.getFullYear();
    if (lastMonth < 0) {
      lastMonth = 11;
      year -= 1;
    }

    const lastMonthStr = `${year}-${String(lastMonth + 1).padStart(2, '0')}`;

    const monthExpenses = expenses
      .filter(exp => exp.date.substring(0, 7) === lastMonthStr && exp.expense_type !== 'income')
      .reduce((sum, exp) => sum + exp.amount, 0);

    const monthSalary = salaryDetails.find(s => {
      const d = new Date(s.date);
      return d.getMonth() === lastMonth && d.getFullYear() === year;
    });

    if (!monthSalary) return null;

    const grossSalary = monthSalary.gross_salary;
    const directSaving = (monthSalary.epf || 0) + (monthSalary.mf || 0) + (monthSalary.vpf || 0) + (monthSalary.etf || 0);
    const balanceAmount = grossSalary - directSaving - monthExpenses;
    const savingPercentage = grossSalary > 0 ? ((grossSalary - monthExpenses) / grossSalary) * 100 : 0;

    return {
      grossSalary,
      expenses: monthExpenses,
      directSaving,
      balanceAmount,
      savingPercentage,
      monthName: new Date(year, lastMonth).toLocaleString('default', { month: 'long' })
    };
  }, [expenses, salaryDetails]);

  const showDailyNotification = useCallback(() => {
    if (!isEnabled) return;
    
    // Check if we already showed it recently to avoid duplicates if re-rendered or multiple timers
    const now = new Date();
    const lastShownTime = localStorage.getItem('last_daily_notification_time');
    if (lastShownTime) {
      const lastDate = new Date(parseInt(lastShownTime));
      // If it was shown less than 1 hour ago, skip
      if (now.getTime() - lastDate.getTime() < 60 * 60 * 1000) {
        return;
      }
    }
    
    localStorage.setItem('last_daily_notification_time', now.getTime().toString());

    const { todayTotal, monthTotal } = calculateDailyTotals();
    const formatCurrency = (amount: number) => 
      new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
      }).format(amount);

    const title = 'Daily Expense Summary';
    const body = `Today's Total: ${formatCurrency(todayTotal)}\nMonth's Total: ${formatCurrency(monthTotal)}`;

    if ('serviceWorker' in navigator && Notification.permission === 'granted') {
      navigator.serviceWorker.ready.then(registration => {
        registration.showNotification(title, {
          body,
          icon: '/icon-192x192.png',
          badge: '/icon-192x192.png',
          tag: 'daily-summary',
          renotify: true
        });
      });
    } else if (Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/icon-192x192.png' });
    }
  }, [isEnabled, calculateDailyTotals]);

  const showMonthlyNotification = useCallback(() => {
    if (!isMonthlyEnabled) return;

    const summary = calculateMonthlySummary();
    if (!summary) return;

    const formatCurrency = (amount: number) => 
      new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
      }).format(amount);

    const title = `Monthly Summary - ${summary.monthName}`;
    const body = `Gross Salary: ${formatCurrency(summary.grossSalary)}\n` +
                 `Total Expenses: ${formatCurrency(summary.expenses)}\n` +
                 `Direct Saving: ${formatCurrency(summary.directSaving)}\n` +
                 `Balance: ${formatCurrency(summary.balanceAmount)}\n` +
                 `Saving %: ${summary.savingPercentage.toFixed(2)}%`;

    if ('serviceWorker' in navigator && Notification.permission === 'granted') {
      navigator.serviceWorker.ready.then(registration => {
        registration.showNotification(title, {
          body,
          icon: '/icon-192x192.png',
          badge: '/icon-192x192.png',
          tag: 'monthly-summary',
          renotify: true
        });
      });
    } else if (Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/icon-192x192.png' });
    }
  }, [isMonthlyEnabled, calculateMonthlySummary]);

  const toggleNotifications = async () => {
    if (isEnabled) {
      if (window.confirm('Do you want to disable daily notifications?')) {
        setIsEnabled(false);
        localStorage.setItem('notifications_enabled', 'false');
        if (!isMonthlyEnabled) {
          await unsubscribeFromPush();
        }
      }
    } else {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setIsEnabled(true);
        localStorage.setItem('notifications_enabled', 'true');
        await subscribeToPush();
        alert('Daily notifications enabled for every 4 hours!');
      } else {
        alert('Notification permission denied.');
      }
    }
  };

  const showTestNotification = () => {
    const { todayTotal, monthTotal } = calculateDailyTotals();
    const formatCurrency = (amount: number) => 
      new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
      }).format(amount);

    const title = 'Expense Tracker Summary';
    const body = `Today's Total: ${formatCurrency(todayTotal)}\nMonth's Total: ${formatCurrency(monthTotal)}`;
    
    if ('serviceWorker' in navigator && Notification.permission === 'granted') {
      navigator.serviceWorker.ready.then(registration => {
        registration.showNotification(title, {
          body,
          icon: '/icon-192x192.png',
          badge: '/icon-192x192.png',
          tag: 'test-notification',
          renotify: true
        });
      });
    } else if (Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/icon-192x192.png' });
    } else {
      alert('Notification permission not granted. Please enable notifications first.');
    }
  };

  const toggleMonthlyNotifications = async () => {
    if (isMonthlyEnabled) {
      if (window.confirm('Do you want to disable monthly salary notifications?')) {
        setIsMonthlyEnabled(false);
        localStorage.setItem('monthly_notifications_enabled', 'false');
        if (!isEnabled) {
          await unsubscribeFromPush();
        }
      }
    } else {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setIsMonthlyEnabled(true);
        localStorage.setItem('monthly_notifications_enabled', 'true');
        await subscribeToPush();
        alert('Monthly notifications enabled for 1st of every month at 9 AM!');
      } else {
        alert('Notification permission denied.');
      }
    }
  };

  // Daily Timers (8 AM and 10 PM)
  useEffect(() => {
    if (!isEnabled) return;

    // Check for missed or upcoming notifications immediately on mount
    const checkImmediately = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();

      // If we are within the first 30 mins of an 4-hour interval (0, 4, 8, 12, 16, 20), show now if missed
      if (hours % 4 === 0 && minutes < 30) {
        showDailyNotification();
      }
    };

    checkImmediately();

    const interval = setInterval(() => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();

      // Check every 4 hours (at minute 0)
      if (hours % 4 === 0 && minutes === 0) {
        showDailyNotification();
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [isEnabled, showDailyNotification]);

  // Monthly Timer
  useEffect(() => {
    if (!isMonthlyEnabled) return;

    const scheduleNextMonthly = () => {
      const now = new Date();
      const scheduledTime = new Date();
      scheduledTime.setDate(1); // 1st of month
      scheduledTime.setHours(9, 0, 0, 0);

      if (now > scheduledTime) {
        // If today is 1st but past 9 AM, or today is after 1st, schedule for next month
        scheduledTime.setMonth(scheduledTime.getMonth() + 1);
      }

      const delay = scheduledTime.getTime() - now.getTime();
      const timer = setTimeout(() => {
        showMonthlyNotification();
        scheduleNextMonthly();
      }, delay);

      return timer;
    };

    const timerId = scheduleNextMonthly();
    return () => clearTimeout(timerId);
  }, [isMonthlyEnabled, showMonthlyNotification]);

  return { 
    isEnabled, 
    isMonthlyEnabled, 
    toggleNotifications, 
    toggleMonthlyNotifications,
    showTestNotification
  };
}

