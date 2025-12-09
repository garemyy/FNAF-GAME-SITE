import { useState, useCallback, useRef, useEffect } from 'react';
import { GameCanvas, GameCanvasRef } from './GameCanvas';
import { GameUI } from './GameUI';
import { WinScreen } from './WinScreen';
import { TitleScreen } from './TitleScreen';
import { VirtualJoystick } from './VirtualJoystick';
import { JumpscareScreen } from './JumpscareScreen';

const TOTAL_COINS = 7;

export const Game = () => {
  const [gameState, setGameState] = useState<'title' | 'playing' | 'won' | 'caught'>('title');
  const [coinsCollected, setCoinsCollected] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [gameKey, setGameKey] = useState(0);
  const gameCanvasRef = useRef<GameCanvasRef>(null);

  // 🎵 Riferimento alla musica di gioco
  const gameMusicRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Avvio musica quando si entra nello stato "playing"
  useEffect(() => {
    if (gameState === 'playing') {
      gameMusicRef.current = new Audio("/publica/musicgame.mp3");
      gameMusicRef.current.volume = 0.7;
      gameMusicRef.current.loop = true;

      gameMusicRef.current
        .play()
        .catch(() => {
          console.log("Autoplay bloccato, partirà al primo click");
        });
    } else {
      // Stop musica quando si esce dal playing
      if (gameMusicRef.current) {
        gameMusicRef.current.pause();
        gameMusicRef.current.currentTime = 0;
      }
    }
  }, [gameState]);

  const handleStart = useCallback(() => {
    setGameState('playing');
    setCoinsCollected(0);
    setGameKey(prev => prev + 1);
  }, []);

  const handleWin = useCallback(() => {
    setGameState('won');
  }, []);

  const handleCoinCollect = useCallback((total: number) => {
    setCoinsCollected(total);
  }, []);

  const handleCaught = useCallback(() => {
    setGameState('caught');
  }, []);

  const handleJumpscareComplete = useCallback(() => {
    handleStart();
  }, [handleStart]);

  const handleJoystickMove = useCallback((dx: number, dy: number) => {
    if (gameCanvasRef.current) {
      gameCanvasRef.current.movePlayer(dx, dy);
    }
  }, []);

  const handleJoystickStop = useCallback(() => {
    // Movement stops automatically
  }, []);

  if (gameState === 'title') {
    return <TitleScreen onStart={handleStart} />;
  }

  if (gameState === 'won') {
    return <WinScreen />;
  }

  if (gameState === 'caught') {
    return <JumpscareScreen onComplete={handleJumpscareComplete} />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-start md:justify-center p-2 md:p-4 relative overflow-hidden">
      <div className="crt-overlay" />
      
      <div className="text-center mb-2 md:mb-4 z-10">
        <h1 className="text-base md:text-2xl text-foreground retro-glow tracking-wider">
          FREDDY'S PIZZA HUNT
        </h1>
      </div>
      
      <div className="flex flex-col items-center gap-3 md:gap-6 z-10 w-full max-w-4xl">
        {/* Game UI - Top on mobile */}
        <div className="w-full md:hidden">
          <GameUI coins={coinsCollected} totalCoins={TOTAL_COINS} />
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-center md:items-start">
          <GameCanvas 
            key={gameKey}
            ref={gameCanvasRef}
            onWin={handleWin} 
            onCoinCollect={handleCoinCollect}
            onCaught={handleCaught}
          />
          
          {/* Game UI - Side on desktop */}
          <div className="hidden md:block">
            <GameUI coins={coinsCollected} totalCoins={TOTAL_COINS} />
          </div>
        </div>
        
        {/* Virtual Joystick for mobile */}
        {isMobile && (
          <div className="mt-2 md:mt-0">
            <VirtualJoystick 
              onMove={handleJoystickMove}
              onStop={handleJoystickStop}
            />
          </div>
        )}
      </div>
      
      <p className="mt-3 md:mt-6 text-[10px] md:text-xs text-muted-foreground/50 z-10">
        Find all {TOTAL_COINS} coins • Avoid the animatronics!
      </p>
    </div>
  );
};
