import { useEffect, useState } from "react";
import { Timer } from "lucide-react";

const AuctionTimer = ({ startTime, endTime, status }) => {
  const [timeDisplay, setTimeDisplay] = useState({ label: '', value: '' });
  
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      let targetTime, label;

      if (status === 'PENDING') {
        targetTime = new Date(startTime).getTime();
        label = 'Starts in';
      } else {
        targetTime = new Date(endTime).getTime();
        label = 'Ends in';
      }

      const distance = targetTime - now;
      
      if (distance < 0||status==='ENDED') {
        setTimeDisplay({ label: '', value: 'ENDED' });
        return;
      }
      
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      
      let timeString = '';
      if (days > 0) timeString += `${days}d `;
      if (hours > 0 || days > 0) timeString += `${hours}h `;
      timeString += `${minutes}m ${seconds}s`;
      
      setTimeDisplay({ label, value: timeString });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [startTime, endTime, status]);
  
  return (
    <div className="flex items-center gap-2 text-lg font-mono">
      <Timer className="w-5 h-5" />
      <span className={timeDisplay.value === 'ENDED' ? 'text-red-500' : 'text-blue-600'}>
        {timeDisplay.label} {timeDisplay.value}
      </span>
    </div>
  );
};

export default AuctionTimer;