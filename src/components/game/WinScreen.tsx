import { useEffect, useState } from 'react';

export const WinScreen = () => {
  const [showNumber, setShowNumber] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  // 🎵 Musica della schermata finale
  useEffect(() => {
    const winMusic = new Audio("/publica/win.mp3");
    winMusic.volume = 0.7;
    winMusic.play();

    return () => {
      winMusic.pause();
      winMusic.currentTime = 0;
    };
  }, []); // <-- qui termina useEffect

  useEffect(() => {
    const numberTimer = setTimeout(() => setShowNumber(true), 2000);
    const messageTimer = setTimeout(() => setShowMessage(true), 4000);
    const instructionsTimer = setTimeout(() => setShowInstructions(true), 6000);

    return () => {
      clearTimeout(numberTimer);
      clearTimeout(messageTimer);
      clearTimeout(instructionsTimer);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center z-50 fade-in p-4">
      <div className="crt-overlay" />
      
      <div className="text-center space-y-8 md:space-y-12 max-w-lg">
        <h1 className="text-xl md:text-4xl text-foreground retro-glow flicker tracking-wider">
          YOU WIN!
        </h1>
        
        <div className="space-y-6 md:space-y-8">
          <p className="text-sm md:text-xl text-muted-foreground">
            You escaped the pizzeria with all the coins...
          </p>
          
          {showNumber && (
            <div className="fade-in space-y-4">
              <p className="text-base md:text-lg text-accent-foreground">
                Text this number:
              </p>
              <p className="text-xl md:text-4xl text-primary retro-glow tracking-widest font-bold">
              +1 (782) 603-1615
              </p>
            </div>
          )}
          
          {showMessage && (
            <div className="fade-in space-y-4 mt-6 md:mt-8">
              <div className="bg-card/50 border border-secondary p-4 md:p-6 rounded-sm">
                <p className="text-sm md:text-lg text-foreground mb-4">
                  Send a message saying:
                </p>
                <p className="text-base md:text-xl text-primary retro-glow italic">
                  "I WON THE GAME!"
                </p>
              </div>
            </div>
          )}
          
          {showInstructions && (
            <div className="fade-in space-y-3 mt-4 md:mt-6">
              <div className="border-t border-secondary pt-4 md:pt-6">
                <p className="text-sm md:text-base text-accent flicker">
                  Don't forget to send a screenshot as proof!
                </p>
                <p className="text-xs md:text-sm text-muted-foreground mt-2">
                  Take a photo of this screen and send it with your message.
                </p>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-8 md:mt-16 space-y-2">
          <div className="w-48 md:w-64 h-1 bg-secondary mx-auto opacity-50" />
          <p className="text-[10px] md:text-xs text-muted-foreground">
            FREDDY'S PIZZA • EST. 1987
          </p>
        </div>
      </div>
    </div>
  );
};
