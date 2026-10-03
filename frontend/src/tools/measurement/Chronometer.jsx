"use client";
import { useState, useRef, useEffect } from "react";
import Button from "@/components/ui/Button";

function formatTime(ms) {
  const minutes = String(Math.floor(ms / 60000)).padStart(2, "0");
  const seconds = String(Math.floor((ms % 60000) / 1000)).padStart(2, "0");
  const millis = String(ms % 1000).padStart(3, "0");
  return `${minutes}:${seconds}.${millis}`;
}

export default function Chronometer() {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);

  const handleStartStop = () => {
    if (running) {
      setRunning(false);
      clearInterval(intervalRef.current);
    } else {
      setRunning(true);
      startTimeRef.current = Date.now() - elapsed;
      intervalRef.current = setInterval(() => {
        setElapsed(Date.now() - startTimeRef.current);
      }, 10);
    }
  };

  const handleReset = () => {
    setRunning(false);
    setElapsed(0);
    clearInterval(intervalRef.current);
  };

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  return (
    <div className="space-y-4 flex flex-col items-center">
      <span className="font-mono text-3xl">{formatTime(elapsed)}</span>
      <div className="flex gap-4">
      <Button
          onClick={handleStartStop}
          className={running ? "bg-orange-300 hover:bg-orange-400 text-white" : ""}
        >
          {running ? "Stop" : "Start"}
        </Button>
        <Button onClick={handleReset} className="bg-red-500">
          Reset
        </Button>
      </div>
    </div>
  );
}