import { useRef, useState, useCallback, useEffect } from 'react';

interface VirtualJoystickProps {
  onMove: (dx: number, dy: number) => void;
  onStop: () => void;
}

export const VirtualJoystick = ({ onMove, onStop }: VirtualJoystickProps) => {
  const joystickRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const moveIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const getRelativePosition = useCallback((clientX: number, clientY: number) => {
    if (!joystickRef.current) return { x: 0, y: 0 };
    
    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    let x = (clientX - centerX) / (rect.width / 2);
    let y = (clientY - centerY) / (rect.height / 2);
    
    // Clamp to circle
    const distance = Math.sqrt(x * x + y * y);
    if (distance > 1) {
      x /= distance;
      y /= distance;
    }
    
    return { x, y };
  }, []);

  const startMove = useCallback((dx: number, dy: number) => {
    if (moveIntervalRef.current) {
      clearInterval(moveIntervalRef.current);
    }
    
    // Immediate move
    if (Math.abs(dx) > 0.3 || Math.abs(dy) > 0.3) {
      const moveX = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 1 : -1) : 0;
      const moveY = Math.abs(dy) > Math.abs(dx) ? (dy > 0 ? 1 : -1) : 0;
      onMove(moveX, moveY);
    }
    
    // Continuous move
    moveIntervalRef.current = setInterval(() => {
      if (Math.abs(dx) > 0.3 || Math.abs(dy) > 0.3) {
        const moveX = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 1 : -1) : 0;
        const moveY = Math.abs(dy) > Math.abs(dx) ? (dy > 0 ? 1 : -1) : 0;
        onMove(moveX, moveY);
      }
    }, 200);
  }, [onMove]);

  const handleStart = useCallback((clientX: number, clientY: number) => {
    setIsDragging(true);
    const pos = getRelativePosition(clientX, clientY);
    setPosition(pos);
    startMove(pos.x, pos.y);
  }, [getRelativePosition, startMove]);

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!isDragging) return;
    const pos = getRelativePosition(clientX, clientY);
    setPosition(pos);
    startMove(pos.x, pos.y);
  }, [isDragging, getRelativePosition, startMove]);

  const handleEnd = useCallback(() => {
    setIsDragging(false);
    setPosition({ x: 0, y: 0 });
    if (moveIntervalRef.current) {
      clearInterval(moveIntervalRef.current);
      moveIntervalRef.current = null;
    }
    onStop();
  }, [onStop]);

  useEffect(() => {
    return () => {
      if (moveIntervalRef.current) {
        clearInterval(moveIntervalRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={joystickRef}
      className="relative w-32 h-32 rounded-full bg-muted/50 border-2 border-secondary touch-none select-none"
      onTouchStart={(e) => {
        e.preventDefault();
        const touch = e.touches[0];
        handleStart(touch.clientX, touch.clientY);
      }}
      onTouchMove={(e) => {
        e.preventDefault();
        const touch = e.touches[0];
        handleMove(touch.clientX, touch.clientY);
      }}
      onTouchEnd={handleEnd}
      onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
      onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
    >
      {/* Outer ring */}
      <div className="absolute inset-2 rounded-full border border-secondary/50" />
      
      {/* Direction indicators */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-secondary/30" />
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-8 border-l-transparent border-r-transparent border-t-secondary/30" />
      <div className="absolute left-2 top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-r-8 border-t-transparent border-b-transparent border-r-secondary/30" />
      <div className="absolute right-2 top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-b-4 border-l-8 border-t-transparent border-b-transparent border-l-secondary/30" />
      
      {/* Joystick knob */}
      <div
        className="absolute w-12 h-12 rounded-full bg-primary shadow-lg transition-transform duration-75"
        style={{
          left: `calc(50% + ${position.x * 40}px - 24px)`,
          top: `calc(50% + ${position.y * 40}px - 24px)`,
        }}
      >
        <div className="absolute inset-1 rounded-full bg-primary/80" />
        <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-glow/30" />
      </div>
    </div>
  );
};
