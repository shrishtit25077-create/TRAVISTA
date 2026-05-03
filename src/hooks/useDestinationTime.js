import { useState, useEffect } from 'react';

export function useDestinationTime(timezoneOffsetSeconds) {
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    if (timezoneOffsetSeconds === undefined || timezoneOffsetSeconds === null) {
      setTimeStr('');
      return;
    }

    const updateTime = () => {
      try {
        const now = new Date();
        const localTime = new Date(now.getTime() + (now.getTimezoneOffset() * 60000) + (timezoneOffsetSeconds * 1000));
        
        const formatter = new Intl.DateTimeFormat('en-US', {
          timeZone: 'UTC',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        });
        setTimeStr(formatter.format(localTime));
      } catch (err) {
        setTimeStr('');
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [timezoneOffsetSeconds]);

  return timeStr;
}
