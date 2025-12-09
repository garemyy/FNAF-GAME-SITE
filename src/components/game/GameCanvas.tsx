import { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from 'react';

// Bigger map: 0 = floor, 1 = wall, 2 = coin (hidden in corners and dead ends)
const INITIAL_MAP = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1],
  [1, 0, 1, 2, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 1, 2, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1, 0, 0, 0, 1],
  [1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1],
  [1, 2, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 2, 1],
  [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

const TILE_SIZE = 28;
const PLAYER_SIZE = 22;
const MAP_WIDTH = INITIAL_MAP[0].length;
const MAP_HEIGHT = INITIAL_MAP.length;

interface Enemy {
  x: number;
  y: number;
  direction: { x: number; y: number };
  changeChance: number; // Random chance to change direction
}

interface GameCanvasProps {
  onWin: () => void;
  onCoinCollect: (total: number) => void;
  onCaught: () => void;
}

export interface GameCanvasRef {
  movePlayer: (dx: number, dy: number) => void;
}

export const GameCanvas = forwardRef<GameCanvasRef, GameCanvasProps>(({ onWin, onCoinCollect, onCaught }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playerPosRef = useRef({ x: 1, y: 1 });
  const gameMapRef = useRef(INITIAL_MAP.map(row => [...row]));
  const coinsCollectedRef = useRef(0);
  const totalCoins = INITIAL_MAP.flat().filter(cell => cell === 2).length;
  const enemiesRef = useRef<Enemy[]>([
    { x: 10, y: 5, direction: { x: 1, y: 0 }, changeChance: 0.3 },
    { x: 5, y: 15, direction: { x: 0, y: -1 }, changeChance: 0.4 },
    { x: 15, y: 10, direction: { x: -1, y: 0 }, changeChance: 0.25 },
  ]);
  
  const animationFrameRef = useRef<number>();
  const keysPressed = useRef<Set<string>>(new Set());
  const lastMoveTime = useRef(0);
  const lastEnemyMoveTime = useRef(0);
  const gameActiveRef = useRef(true);
  const [, forceRender] = useState(0);

  const canMove = useCallback((x: number, y: number) => {
    return x >= 0 && x < MAP_WIDTH && y >= 0 && y < MAP_HEIGHT && gameMapRef.current[y]?.[x] !== 1;
  }, []);

  const checkEnemyCollision = useCallback((px: number, py: number) => {
    for (const enemy of enemiesRef.current) {
      const distance = Math.abs(enemy.x - px) + Math.abs(enemy.y - py);
      if (distance <= 1) {
        gameActiveRef.current = false;
        onCaught();
        return true;
      }
    }
    return false;
  }, [onCaught]);

  const movePlayer = useCallback((dx: number, dy: number) => {
    if (!gameActiveRef.current) return;
    
    const now = performance.now();
    if (now - lastMoveTime.current < 120) return;
    lastMoveTime.current = now;

    const prev = playerPosRef.current;
    const newX = prev.x + dx;
    const newY = prev.y + dy;
    
    if (canMove(newX, newY)) {
      playerPosRef.current = { x: newX, y: newY };
      
      // Collect coin
      if (gameMapRef.current[newY][newX] === 2) {
        gameMapRef.current[newY][newX] = 0;
        coinsCollectedRef.current++;
        onCoinCollect(coinsCollectedRef.current);
        
        if (coinsCollectedRef.current >= totalCoins) {
          gameActiveRef.current = false;
          setTimeout(onWin, 500);
        }
      }
      
      checkEnemyCollision(newX, newY);
    }
  }, [canMove, checkEnemyCollision, onCoinCollect, onWin, totalCoins]);

  useImperativeHandle(ref, () => ({
    movePlayer
  }), [movePlayer]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.key.toLowerCase());
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key.toLowerCase());
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Single unified game loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let coinAnimTime = 0;

    const gameLoop = (timestamp: number) => {
      if (!gameActiveRef.current) {
        animationFrameRef.current = requestAnimationFrame(gameLoop);
        return;
      }

      // Handle input
      const keys = keysPressed.current;
      if (keys.has('w') || keys.has('arrowup')) movePlayer(0, -1);
      else if (keys.has('s') || keys.has('arrowdown')) movePlayer(0, 1);
      else if (keys.has('a') || keys.has('arrowleft')) movePlayer(-1, 0);
      else if (keys.has('d') || keys.has('arrowright')) movePlayer(1, 0);

      // Move enemies with random behavior
      if (timestamp - lastEnemyMoveTime.current > 350) {
        lastEnemyMoveTime.current = timestamp;
        
        enemiesRef.current = enemiesRef.current.map(enemy => {
          // Random chance to change direction even if can continue
          const shouldRandomChange = Math.random() < enemy.changeChance;
          
          const newX = enemy.x + enemy.direction.x;
          const newY = enemy.y + enemy.direction.y;
          
          // Check if caught player
          const playerPos = playerPosRef.current;
          if (Math.abs(newX - playerPos.x) + Math.abs(newY - playerPos.y) <= 1) {
            gameActiveRef.current = false;
            setTimeout(() => onCaught(), 50);
          }
          
          if (canMove(newX, newY) && !shouldRandomChange) {
            return { ...enemy, x: newX, y: newY };
          } else {
            // Get all valid directions
            const directions = [
              { x: 1, y: 0 },
              { x: -1, y: 0 },
              { x: 0, y: 1 },
              { x: 0, y: -1 },
            ].filter(d => canMove(enemy.x + d.x, enemy.y + d.y));
            
            if (directions.length > 0) {
              // Pick random direction
              const newDir = directions[Math.floor(Math.random() * directions.length)];
              const movedX = enemy.x + newDir.x;
              const movedY = enemy.y + newDir.y;
              return { 
                ...enemy, 
                x: movedX, 
                y: movedY, 
                direction: newDir,
                changeChance: 0.15 + Math.random() * 0.35 // Randomize change chance
              };
            }
            return enemy;
          }
        });
      }

      // RENDER
      coinAnimTime = timestamp / 200;
      
      ctx.fillStyle = '#0d0d0d';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const gameMap = gameMapRef.current;
      const enemies = enemiesRef.current;
      const playerPos = playerPosRef.current;

      // Draw map (optimized - no gradients on every tile)
      for (let y = 0; y < MAP_HEIGHT; y++) {
        for (let x = 0; x < MAP_WIDTH; x++) {
          const cell = gameMap[y][x];
          const drawX = x * TILE_SIZE;
          const drawY = y * TILE_SIZE;

          if (cell === 1) {
            ctx.fillStyle = '#2d1f14';
            ctx.fillRect(drawX, drawY, TILE_SIZE, TILE_SIZE);
            ctx.strokeStyle = '#1a1209';
            ctx.lineWidth = 1;
            ctx.strokeRect(drawX + 1, drawY + 1, TILE_SIZE - 2, TILE_SIZE / 2 - 1);
          } else {
            ctx.fillStyle = (x + y) % 2 === 0 ? '#1a1510' : '#15120d';
            ctx.fillRect(drawX, drawY, TILE_SIZE, TILE_SIZE);

            if (cell === 2) {
              const coinX = drawX + TILE_SIZE / 2;
              const coinY = drawY + TILE_SIZE / 2;
              const scale = 0.7 + Math.sin(coinAnimTime + x + y) * 0.2;
              
              ctx.fillStyle = '#ffc832';
              ctx.beginPath();
              ctx.arc(coinX, coinY, 6 * scale, 0, Math.PI * 2);
              ctx.fill();
              
              ctx.fillStyle = '#ffdb4d';
              ctx.beginPath();
              ctx.arc(coinX - 2, coinY - 2, 2 * scale, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      }

      // Draw enemies
      for (const enemy of enemies) {
        const ex = enemy.x * TILE_SIZE + (TILE_SIZE - PLAYER_SIZE) / 2;
        const ey = enemy.y * TILE_SIZE + (TILE_SIZE - PLAYER_SIZE) / 2;
        
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(ex, ey, PLAYER_SIZE, PLAYER_SIZE);
        
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(ex + 4, ey + 5, 5, 5);
        ctx.fillRect(ex + PLAYER_SIZE - 9, ey + 5, 5, 5);
        
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(ex + 5, ey + 14, 3, 4);
        ctx.fillRect(ex + 10, ey + 14, 3, 4);
        ctx.fillRect(ex + PLAYER_SIZE - 8, ey + 14, 3, 4);
      }

      // Draw player
      const px = playerPos.x * TILE_SIZE + (TILE_SIZE - PLAYER_SIZE) / 2;
      const py = playerPos.y * TILE_SIZE + (TILE_SIZE - PLAYER_SIZE) / 2;

      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillRect(px + 2, py + 2, PLAYER_SIZE, PLAYER_SIZE);

      ctx.fillStyle = '#7c3aed';
      ctx.fillRect(px, py, PLAYER_SIZE, PLAYER_SIZE);

      ctx.fillStyle = '#4c1d95';
      ctx.fillRect(px + 4, py + 5, 5, 5);
      ctx.fillRect(px + PLAYER_SIZE - 9, py + 5, 5, 5);
      ctx.fillRect(px + 6, py + 14, PLAYER_SIZE - 12, 3);

      ctx.fillStyle = '#a78bfa';
      ctx.fillRect(px + 2, py + 2, PLAYER_SIZE - 4, 2);
      ctx.fillRect(px + 2, py + 2, 2, PLAYER_SIZE - 4);

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [movePlayer, canMove, onCaught]);

  return (
    <canvas
      ref={canvasRef}
      width={MAP_WIDTH * TILE_SIZE}
      height={MAP_HEIGHT * TILE_SIZE}
      className="pixel-perfect border-4 border-secondary rounded-sm max-w-full"
      style={{ maxHeight: '70vh', objectFit: 'contain' }}
    />
  );
});

GameCanvas.displayName = 'GameCanvas';
