import { useEffect, useState } from 'react';

interface JumpscareScreenProps {
  onComplete: () => void;
}

export const JumpscareScreen = ({ onComplete }: JumpscareScreenProps) => {
  const [phase, setPhase] = useState<'scare' | 'static' | 'message'>('scare');

  useEffect(() => {
    const staticTimer = setTimeout(() => setPhase('static'), 800);
    const messageTimer = setTimeout(() => setPhase('message'), 1500);
    const completeTimer = setTimeout(onComplete, 4000);

    return () => {
      clearTimeout(staticTimer);
      clearTimeout(messageTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-background z-50 flex items-center justify-center overflow-hidden">
      {phase === 'scare' && (
        <div className="absolute inset-0 bg-danger animate-pulse flex items-center justify-center shake">
          <div className="text-[200px] md:text-[300px] animate-pulse">
            👁️
          </div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0ibm9uZSIvPjxsaW5lIHgxPSIwIiB5MT0iMCIgeDI9IjEwMCIgeTI9IjEwMCIgc3Ryb2tlPSJyZ2JhKDI1NSwwLDAsMC4zKSIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9zdmc+')] opacity-50" />
        </div>
      )}
      
      {phase === 'static' && (
        <div className="absolute inset-0 bg-background">
          <div className="absolute inset-0 opacity-80" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
            animation: 'noise 0.1s infinite'
          }} />
        </div>
      )}
      
      {phase === 'message' && (
        <div className="text-center space-y-6 fade-in p-4">
          <h1 className="text-3xl md:text-5xl text-danger retro-glow flicker">
            CAUGHT!
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground">
            The animatronic found you...
          </p>
          <p className="text-sm text-foreground/50">
            Restarting...
          </p>
        </div>
      )}
      
      <style>{`
        @keyframes noise {
          0%, 100% { transform: translate(0, 0); }
          10% { transform: translate(-5%, -5%); }
          20% { transform: translate(5%, 5%); }
          30% { transform: translate(-5%, 5%); }
          40% { transform: translate(5%, -5%); }
          50% { transform: translate(-5%, 0); }
          60% { transform: translate(5%, 0); }
          70% { transform: translate(0, 5%); }
          80% { transform: translate(0, -5%); }
          90% { transform: translate(5%, 5%); }
        }
      `}</style>
    </div>
  );
};
