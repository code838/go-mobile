import { useEffect, useState } from 'react';

interface CountdownState {
  hours: number;
  minutes: number;
  seconds: number;
  isFinished: boolean;
}

/**
 * 倒计时 Hook
 * 
 * @param endTime - 结束时间戳（毫秒）
 * @returns CountdownState - 倒计时状态
 * 
 * 使用示例：
 * ```tsx
 * const countdown = useCountdown(Date.now() + 60000); // 一分钟倒计时
 * console.log(countdown.hours, countdown.minutes, countdown.seconds);
 * ```
 */
export function useCountdown(endTime?: number): CountdownState {
  const [countdown, setCountdown] = useState<CountdownState>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    isFinished: true,
  });

  useEffect(() => {
    if (!endTime) {
      setCountdown({ hours: 0, minutes: 0, seconds: 0, isFinished: true });
      return;
    }

    const updateCountdown = () => {
      const timeLeft = endTime - Date.now();
      
      if (timeLeft <= 0) {
        setCountdown({ hours: 0, minutes: 0, seconds: 0, isFinished: true });
        return;
      }
      
      const hours = Math.floor(timeLeft / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
      
      setCountdown({ hours, minutes, seconds, isFinished: false });
    };

    // 初始更新
    updateCountdown();

    // 设置定时器
    const timer = setInterval(updateCountdown, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  return countdown;
}