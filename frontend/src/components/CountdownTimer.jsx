import React, { useState, useEffect } from "react";

export default function CountdownTimer({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  function calculateTimeLeft() {
    const difference = +new Date(targetDate) - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return timeLeft;
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearTimeout(timer);
  });

  const timerComponents = [];

  Object.keys(timeLeft).forEach((interval) => {
    if (!timeLeft[interval] && interval === "days") {
      return; // Skip days if 0
    }

    timerComponents.push(
      <div key={interval} className="flex flex-col items-center mx-1 md:mx-2">
        <div className="bg-white text-gray-900 font-bold text-lg md:text-2xl rounded-lg w-10 h-10 md:w-14 md:h-14 flex items-center justify-center shadow-md">
          {timeLeft[interval] < 10 ? `0${timeLeft[interval]}` : timeLeft[interval]}
        </div>
        <span className="text-[10px] md:text-xs font-semibold uppercase mt-1 text-white/90 tracking-wider">
          {interval}
        </span>
      </div>
    );
  });

  return (
    <div className="flex items-center">
      {timerComponents.length ? timerComponents : <span className="text-white font-bold text-xl">Sale Ended!</span>}
    </div>
  );
}
