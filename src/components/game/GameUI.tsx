interface GameUIProps {
  coins: number;
  totalCoins: number;
}

export const GameUI = ({ coins, totalCoins }: GameUIProps) => {
  return (
    <div className="flex flex-col gap-3 md:gap-4 p-3 md:p-4 bg-card border-2 border-secondary rounded-sm w-full md:w-auto md:min-w-[180px]">
      <div className="text-center">
        <h2 className="text-sm md:text-lg text-foreground retro-glow mb-2">COINS</h2>
        <div className="flex items-center justify-center gap-2">
          <span className="text-xl md:text-2xl text-primary">{coins}</span>
          <span className="text-muted-foreground">/</span>
          <span className="text-lg md:text-xl text-muted-foreground">{totalCoins}</span>
        </div>
      </div>
      
      <div className="w-full bg-muted rounded-sm h-3 md:h-4 overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-300 pulse-glow"
          style={{ width: `${(coins / totalCoins) * 100}%` }}
        />
      </div>
      
      <div className="hidden md:block text-xs text-muted-foreground text-center space-y-1">
        <p>WASD or Arrow Keys</p>
        <p>to move</p>
      </div>
      
      <div className="text-[10px] md:text-xs text-danger text-center mt-2">
        <p className="flicker">⚠️ AVOID THE ANIMATRONICS ⚠️</p>
      </div>
    </div>
  );
};
