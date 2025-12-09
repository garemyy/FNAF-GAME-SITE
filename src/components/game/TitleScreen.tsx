interface TitleScreenProps {
  onStart: () => void;
}

export const TitleScreen = ({ onStart }: TitleScreenProps) => {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative p-4">
      <div className="crt-overlay" />
      
      <div className="text-center space-y-6 md:space-y-8 z-10 max-w-md">
        <div className="space-y-3 md:space-y-4">
          <h1 className="text-2xl md:text-5xl text-foreground retro-glow tracking-wider">
            FREDDY'S
          </h1>
          <h2 className="text-lg md:text-3xl text-primary retro-glow tracking-widest">
            PIZZA HUNT
          </h2>
        </div>
        
        <div className="text-xs md:text-base text-muted-foreground space-y-2">
          <p>The pizzeria has been closed for years...</p>
          <p>But the coins are still hidden inside.</p>
          <p className="text-accent flicker">Collect them all... if you can survive.</p>
        </div>
        
        <div className="bg-card/50 border border-danger/50 p-3 md:p-4 rounded-sm">
          <p className="text-xs md:text-sm text-danger flicker">
            ⚠️ WARNING: Animatronics are still active!
          </p>
          <p className="text-[10px] md:text-xs text-muted-foreground mt-1">
            Don't let them see you...
          </p>
        </div>
        
        <button
          onClick={onStart}
          className="mt-6 md:mt-8 px-6 md:px-8 py-3 md:py-4 bg-secondary hover:bg-secondary/80 text-foreground border-2 border-primary rounded-sm transition-all duration-200 hover:scale-105 retro-glow text-base md:text-lg tracking-wider"
        >
          START GAME
        </button>
        
        <div className="mt-8 md:mt-12 space-y-1 text-[10px] md:text-xs text-muted-foreground">
          <p>PC: Use WASD or Arrow Keys</p>
          <p>Mobile: Use the joystick</p>
          <p className="text-primary">Find all 7 hidden coins to win!</p>
        </div>
        
        <div className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 text-[8px] md:text-xs text-muted-foreground/50">
          © 1987 FREDDY FAZBEAR'S PIZZA
        </div>
      </div>
    </div>
  );
};
