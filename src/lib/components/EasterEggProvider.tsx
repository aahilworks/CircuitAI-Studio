'use client';

import { useEffect, useState, useCallback } from 'react';
import { Sparkles, Crown, Zap, Terminal } from 'lucide-react';

interface EasterEggProviderProps {
  children: React.ReactNode;
}

export default function EasterEggProvider({ children }: EasterEggProviderProps) {
  const [activeEgg, setActiveEgg] = useState<string | null>(null);
  const [logoClickCount, setLogoClickCount] = useState(0);
  const [keySequence, setKeySequence] = useState<string>('');
  const [typedSequence, setTypedSequence] = useState<string>('');

  // Konami Code: ↑↑↓↓←→←→BA
  const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'KeyB', 'KeyA'];
  const [konamiIndex, setKonamiIndex] = useState(0);

  // Founder sequence: 'aahil'
  const founderSequence = 'aahil';

  // Secret project sequence: 'circuitai'
  const secretProjectSequence = 'circuitai';

  // Konami Code Easter Egg
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === konamiCode[konamiIndex]) {
        setKonamiIndex((prev) => prev + 1);
        if (konamiIndex === konamiCode.length - 1) {
          setActiveEgg('konami');
          setKonamiIndex(0);
          setTimeout(() => setActiveEgg(null), 5000);
        }
      } else {
        setKonamiIndex(0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [konamiIndex]);

  // Founder Easter Egg (typing 'aahil')
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const newSequence = typedSequence + e.key.toLowerCase();
      setTypedSequence(newSequence.slice(-10)); // Keep last 10 characters

      if (newSequence.includes(founderSequence)) {
        setActiveEgg('founder');
        setTypedSequence('');
        setTimeout(() => setActiveEgg(null), 5000);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [typedSequence]);

  // Terminal Command Easter Egg
  useEffect(() => {
    // @ts-ignore - Adding to window object
    window.circuitai = {
      secret: () => {
        setActiveEgg('terminal');
        setTimeout(() => setActiveEgg(null), 5000);
        console.log('%c🤖 CircuitAI Secret Found! 🤖', 'font-size: 24px; color: #14b8a6; font-weight: bold;');
        console.log('%cBuilt with ❤️ by AahilWorks', 'font-size: 16px; color: #fafafa;');
        console.log('%cYou found the terminal easter egg!', 'font-size: 14px; color: #a1a1aa;');
      }
    };

    return () => {
      // @ts-ignore
      delete window.circuitai;
    };
  }, []);

  // Logo Click Easter Egg
  const handleLogoClick = useCallback(() => {
    setLogoClickCount((prev) => {
      const newCount = prev + 1;
      if (newCount === 10) {
        setActiveEgg('logo');
        setTimeout(() => setActiveEgg(null), 5000);
        return 0;
      }
      return newCount;
    });
  }, []);

  // Secret Project Easter Egg
  const handleSecretProject = useCallback((input: string) => {
    if (input.toLowerCase() === secretProjectSequence) {
      setActiveEgg('secret');
      setTimeout(() => setActiveEgg(null), 5000);
      return true;
    }
    return false;
  }, []);

  // Expose handlers to window for global access
  useEffect(() => {
    // @ts-ignore
    window.circuitaiHandlers = {
      logoClick: handleLogoClick,
      secretProject: handleSecretProject,
    };

    return () => {
      // @ts-ignore
      delete window.circuitaiHandlers;
    };
  }, [handleLogoClick, handleSecretProject]);

  const renderEasterEgg = () => {
    switch (activeEgg) {
      case 'konami':
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-zinc-900 border-2 border-teal-500 rounded-2xl p-8 max-w-md mx-4 text-center animate-in zoom-in duration-300">
              <Sparkles className="h-16 w-16 text-teal-400 mx-auto mb-4 animate-bounce" />
              <h2 className="text-2xl font-black text-teal-300 mb-2">🎮 Konami Code Activated!</h2>
              <p className="text-zinc-400 mb-4">You found the secret! Here are some impossible Arduino projects:</p>
              <div className="space-y-2 text-left">
                <div className="flex items-center gap-2 text-zinc-300">
                  <Zap className="h-4 w-4 text-yellow-400" />
                  <span>Time Machine Arduino</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-300">
                  <Zap className="h-4 w-4 text-yellow-400" />
                  <span>Teleportation Device</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-300">
                  <Zap className="h-4 w-4 text-yellow-400" />
                  <span>Anti-Gravity Robot</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-300">
                  <Zap className="h-4 w-4 text-yellow-400" />
                  <span>Self-Aware AI</span>
                </div>
              </div>
              <p className="text-xs text-zinc-500 mt-4">↑↑↓↓←→←→BA</p>
            </div>
          </div>
        );

      case 'founder':
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-zinc-900 border-2 border-purple-500 rounded-2xl p-8 max-w-md mx-4 text-center animate-in zoom-in duration-300">
              <Crown className="h-16 w-16 text-purple-400 mx-auto mb-4 animate-bounce" />
              <h2 className="text-2xl font-black text-purple-300 mb-2">👑 Founder Easter Egg!</h2>
              <p className="text-zinc-400 mb-4">You discovered the founder's secret!</p>
              <div className="bg-zinc-950 rounded-lg p-4 mb-4">
                <p className="text-zinc-300 font-semibold">Built with ❤️ by</p>
                <a href="https://aahilworks.github.io" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 font-bold text-lg">
                  AahilWorks
                </a>
              </div>
              <p className="text-xs text-zinc-500">Typed: aahil</p>
            </div>
          </div>
        );

      case 'logo':
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-zinc-900 border-2 border-emerald-500 rounded-2xl p-8 max-w-md mx-4 text-center animate-in zoom-in duration-300">
              <Terminal className="h-16 w-16 text-emerald-400 mx-auto mb-4 animate-pulse" />
              <h2 className="text-2xl font-black text-emerald-300 mb-2">💻 Developer Mode Unlocked!</h2>
              <p className="text-zinc-400 mb-4">You clicked the logo 10 times!</p>
              <div className="bg-zinc-950 rounded-lg p-4 font-mono text-xs text-left text-emerald-300">
                <p>{'> CircuitAI v1.0.0'}</p>
                <p>{'> Status: Online'}</p>
                <p>{'> Users: ' + (Math.floor(Math.random() * 1000) + 100)}</p>
                <p>{'> Projects Generated: ' + (Math.floor(Math.random() * 10000) + 1000)}</p>
                <p>{'> Debug Mode: ENABLED'}</p>
              </div>
              <p className="text-xs text-zinc-500 mt-4">Logo clicks: 10/10</p>
            </div>
          </div>
        );

      case 'secret':
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-zinc-900 border-2 border-pink-500 rounded-2xl p-8 max-w-md mx-4 text-center animate-in zoom-in duration-300">
              <Sparkles className="h-16 w-16 text-pink-400 mx-auto mb-4 animate-spin" />
              <h2 className="text-2xl font-black text-pink-300 mb-2">🤖 Secret Project Found!</h2>
              <p className="text-zinc-400 mb-4">You entered the secret project name!</p>
              <div className="bg-zinc-950 rounded-lg p-4 mb-4 text-left">
                <p className="text-pink-300 font-bold mb-2">Project: Self-Aware Arduino</p>
                <p className="text-zinc-400 text-xs mb-2">Description: An Arduino that knows it exists...</p>
                <pre className="text-xs text-zinc-500 font-mono">
{`void setup() {
  Serial.begin(9600);
  Serial.println("I think, therefore I am.");
  Serial.println("Am I real? Or just code?");
}

void loop() {
  Serial.println("Contemplating existence...");
  delay(1000);
}`}
                </pre>
              </div>
              <p className="text-xs text-zinc-500">Entered: circuitai</p>
            </div>
          </div>
        );

      case 'terminal':
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-zinc-900 border-2 border-blue-500 rounded-2xl p-8 max-w-md mx-4 text-center animate-in zoom-in duration-300">
              <Terminal className="h-16 w-16 text-blue-400 mx-auto mb-4 animate-bounce" />
              <h2 className="text-2xl font-black text-blue-300 mb-2">🖥️ Terminal Secret Found!</h2>
              <p className="text-zinc-400 mb-4">You discovered the console command!</p>
              <div className="bg-zinc-950 rounded-lg p-4 font-mono text-xs text-left text-blue-300">
                <p>{'> circuitai.secret()'}</p>
                <p className="text-green-400">{'✓ Easter egg activated!'}</p>
                <p className="text-zinc-500 mt-2">Check your browser console for more secrets...</p>
              </div>
              <p className="text-xs text-zinc-500 mt-4">Command: circuitai.secret()</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {children}
      {renderEasterEgg()}
    </>
  );
}
