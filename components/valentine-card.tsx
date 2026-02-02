"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

export function ValentineCard() {
  const { t } = useLanguage();
  const [yesPressed, setYesPressed] = useState(false);
  const [noCount, setNoCount] = useState(0);
  const [noPosition, setNoPosition] = useState({ x: 0, y: 0 });
  const [constrainedPosition, setConstrainedPosition] = useState({ x: 0, y: 0 });
  const [isRunning, setIsRunning] = useState(false);
  const noButtonRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const yesButtonSize = Math.min(1 + noCount * 0.2, 3);

  const constrainPosition = useCallback((x: number, y: number) => {
    const padding = 20;
    const rightPadding = 30; // Extra padding on right side to prevent overflow
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Get button dimensions - use a reasonable estimate if not available
    let buttonWidth = 150; // Increased fallback to account for longer text
    let buttonHeight = 50;
    
    if (noButtonRef.current) {
      const rect = noButtonRef.current.getBoundingClientRect();
      // Use actual measured width/height, add buffer for safety
      // Add extra buffer on width to account for text changes and padding
      buttonWidth = (rect.width || 150) + 20; // Increased buffer for right side
      buttonHeight = (rect.height || 50) + 5;
    }

    // Calculate safe bounds - ensure button stays fully visible
    // For fixed positioning, left position must ensure right edge doesn't go off-screen
    const minX = padding;
    const minY = padding;
    // maxX is the maximum left position where button's right edge stays within viewport
    // Use rightPadding to ensure button doesn't go off-screen on the right
    const maxX = Math.max(minX, viewportWidth - buttonWidth - rightPadding);
    const maxY = Math.max(minY, viewportHeight - buttonHeight - padding - 100); // Extra padding for petal pile

    // Constrain position within safe bounds
    const constrainedX = Math.max(minX, Math.min(x, maxX));
    const constrainedY = Math.max(minY, Math.min(y, maxY));

    // Final validation: ensure right edge is definitely on screen
    const rightEdge = constrainedX + buttonWidth;
    if (rightEdge > viewportWidth - rightPadding) {
      return { x: viewportWidth - buttonWidth - rightPadding, y: constrainedY };
    }

    return { x: constrainedX, y: constrainedY };
  }, []);

  const moveNoButton = useCallback(() => {
    if (!noButtonRef.current) return;

    const padding = 20;
    const rightPadding = 30; // Match constrainPosition
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Get actual button dimensions with buffer for safety
    const rect = noButtonRef.current.getBoundingClientRect();
    const buttonWidth = (rect.width || 150) + 20; // Match constrainPosition buffer
    const buttonHeight = (rect.height || 50) + 5;

    // Calculate safe area for random positioning
    const minX = padding;
    const minY = padding;
    // Ensure maxX accounts for button width so right edge stays on screen
    const maxX = Math.max(minX, viewportWidth - buttonWidth - rightPadding);
    const maxY = Math.max(minY, viewportHeight - buttonHeight - padding - 100);

    // Generate new position within safe bounds
    const newX = minX + Math.random() * Math.max(0, maxX - minX);
    const newY = minY + Math.random() * Math.max(0, maxY - minY);

    // Constrain to ensure it's within bounds (double-check)
    const constrained = constrainPosition(newX, newY);
    setNoPosition(constrained);
    setConstrainedPosition(constrained);
    setIsRunning(true);
  }, [constrainPosition]);

  useEffect(() => {
    if (isRunning) {
      const timer = setTimeout(() => setIsRunning(false), 150);
      return () => clearTimeout(timer);
    }
  }, [isRunning]);

  // Constrain button position when it changes
  useEffect(() => {
    if (noCount >= 3 && noPosition.x !== 0 && noPosition.y !== 0) {
      // Use a small delay to ensure button dimensions are measured correctly
      const timeoutId = setTimeout(() => {
        const constrained = constrainPosition(noPosition.x, noPosition.y);
        setConstrainedPosition(constrained);
        // Update the actual position if it was constrained
        if (constrained.x !== noPosition.x || constrained.y !== noPosition.y) {
          setNoPosition(constrained);
        }
      }, 0);
      return () => clearTimeout(timeoutId);
    } else if (noCount < 3) {
      const rafId = requestAnimationFrame(() => {
        setConstrainedPosition({ x: 0, y: 0 });
      });
      return () => cancelAnimationFrame(rafId);
    }
  }, [noPosition.x, noPosition.y, noCount, constrainPosition]);

  // Constrain button position on window resize
  useEffect(() => {
    if (noCount < 3) return;

    const handleResize = () => {
      setNoPosition((prevPos) => {
        if (prevPos.x === 0 && prevPos.y === 0) return prevPos;
        const constrained = constrainPosition(prevPos.x, prevPos.y);
        setConstrainedPosition(constrained);
        return constrained;
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [noCount, constrainPosition]);

  const handleNoHover = () => {
    if (noCount < 3) {
      setNoCount(noCount + 1);
      moveNoButton();
    } else {
      moveNoButton();
      setNoCount(noCount + 1);
    }
  };

  const handleNoClick = () => {
    setNoCount(noCount + 1);
    moveNoButton();
  };

  const getNoButtonText = () => {
    return t.noMessages[Math.min(noCount, t.noMessages.length - 1)];
  };

  const handleYesClick = () => {
    setYesPressed(true);
    
    // Get LINE ID from environment variable (optional)
    const lineId = process.env.NEXT_PUBLIC_LINE_ID;
    
    if (lineId) {
      // Open LINE chat with specific LINE ID
      // Try app first, fallback to web
      window.location.href = `line://ti/p/${lineId}`;
      
      // Fallback to web if app doesn't open (after a short delay)
      setTimeout(() => {
        window.open(`https://line.me/R/ti/p/${lineId}`, '_blank');
      }, 500);
    } else {
      // Just open LINE app directly
      window.location.href = 'line://';
      
       // Fallback to LINE web if app doesn't open
       setTimeout(() => {
        window.open('https://line.me/', '_blank');
      }, 500);
    }
  };

  if (yesPressed) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 animate-in fade-in zoom-in duration-500">
        <div className="text-6xl md:text-8xl animate-bounce">
          <Heart className="w-24 h-24 md:w-32 md:h-32 text-primary fill-primary" />
        </div>
        <h2 className="font-serif text-3xl md:text-5xl text-foreground text-center text-balance">
          {t.yesResponse}
        </h2>
        <p className="text-lg md:text-xl text-muted-foreground text-center">
          {t.yesSubtext}
        </p>
        <div className="flex gap-2 mt-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Heart
              key={i}
              className="w-6 h-6 text-primary fill-primary animate-pulse"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-md md:max-w-lg mx-auto min-h-[400px] md:min-h-[450px] flex flex-col items-center"
    >
      <div className="flex flex-col items-center gap-6 md:gap-8">
        <div className="text-5xl md:text-6xl">
          <Heart className="w-16 h-16 md:w-20 md:h-20 text-primary fill-primary animate-pulse" />
        </div>

        <h1 className="font-serif text-3xl md:text-5xl text-foreground text-center leading-tight text-balance">
          {t.title}
        </h1>

        <p className="text-muted-foreground text-center text-base md:text-lg max-w-sm">
          {t.subtitle}
        </p>

        <div className="flex gap-4 items-center mt-4 relative">
          <Button
            onClick={handleYesClick}
            className="font-sans text-lg md:text-xl px-6 md:px-8 py-4 md:py-6 bg-primary hover:bg-sakura-deep text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-300"
            style={{
              transform: `scale(${yesButtonSize})`,
            }}
          >
            {t.yesButton}
          </Button>

          <Button
            ref={noButtonRef}
            onMouseEnter={handleNoHover}
            onClick={handleNoClick}
            variant="outline"
            className="font-sans text-base md:text-lg px-4 md:px-6 py-3 md:py-4 border-primary/50 text-primary hover:bg-secondary transition-all duration-150 bg-transparent"
            style={{
              position: noCount >= 3 ? "fixed" : "relative",
              left: noCount >= 3 ? `${constrainedPosition.x}px` : "auto",
              top: noCount >= 3 ? `${constrainedPosition.y}px` : "auto",
              transform: isRunning ? "scale(0.95)" : "scale(1)",
              zIndex: noCount >= 3 ? 50 : "auto",
            }}
          >
            {getNoButtonText()}
          </Button>
        </div>

        {noCount > 0 && noCount < 5 && (
          <p className="text-sm text-muted-foreground animate-in fade-in duration-300 absolute bottom-0 left-0 right-0 text-center">
            {t.hintMild}
          </p>
        )}

        {noCount >= 5 && (
          <p className="text-sm text-muted-foreground animate-in fade-in duration-300 absolute bottom-0 left-0 right-0 text-center">
            {t.hintStrong}
          </p>
        )}
      </div>
    </div>
  );
}