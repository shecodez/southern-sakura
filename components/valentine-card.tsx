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
    const maxDistanceFromCard = 200; // Maximum distance from card center
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Get button dimensions - use a reasonable estimate if not available
    let buttonWidth = 150; // Increased fallback to account for longer text
    let buttonHeight = 50;
    
    if (noButtonRef.current) {
      const rect = noButtonRef.current.getBoundingClientRect();
      // Use actual measured width/height, add buffer for safety
      buttonWidth = (rect.width || 150) + 20;
      buttonHeight = (rect.height || 50) + 5;
    }

    // Get card container position
    let cardCenterX = viewportWidth / 2;
    let cardCenterY = viewportHeight / 2;

    if (containerRef.current) {
      const cardRect = containerRef.current.getBoundingClientRect();
      cardCenterX = cardRect.left + cardRect.width / 2;
      cardCenterY = cardRect.top + cardRect.height / 2;
    }

    // Calculate bounds within maxDistanceFromCard of the card center
    // But also ensure button stays within viewport
    const minX = Math.max(padding, cardCenterX - maxDistanceFromCard - buttonWidth / 2);
    const maxX = Math.min(viewportWidth - buttonWidth - padding, cardCenterX + maxDistanceFromCard - buttonWidth / 2);
    const minY = Math.max(padding, cardCenterY - maxDistanceFromCard - buttonHeight / 2);
    const maxY = Math.min(viewportHeight - buttonHeight - padding - 100, cardCenterY + maxDistanceFromCard - buttonHeight / 2);

    // Constrain position within safe bounds
    const constrainedX = Math.max(minX, Math.min(x, maxX));
    const constrainedY = Math.max(minY, Math.min(y, maxY));

    // Final validation: ensure button stays within maxDistanceFromCard of card center
    const buttonCenterX = constrainedX + buttonWidth / 2;
    const buttonCenterY = constrainedY + buttonHeight / 2;
    const distanceFromCenter = Math.sqrt(
      Math.pow(buttonCenterX - cardCenterX, 2) +
      Math.pow(buttonCenterY - cardCenterY, 2)
    );

    if (distanceFromCenter > maxDistanceFromCard) {
      // Calculate angle from card center to constrained position
      const angle = Math.atan2(
        buttonCenterY - cardCenterY,
        buttonCenterX - cardCenterX
      );
      
      // Try to place button at maxDistanceFromCard distance from center
      let newX = cardCenterX + Math.cos(angle) * maxDistanceFromCard - buttonWidth / 2;
      let newY = cardCenterY + Math.sin(angle) * maxDistanceFromCard - buttonHeight / 2;
      
      // If this position is outside viewport, find the closest valid position
      // that's still within maxDistanceFromCard
      if (newX < padding || newX > viewportWidth - buttonWidth - padding ||
          newY < padding || newY > viewportHeight - buttonHeight - padding - 100) {
        // Try adjusting the angle slightly to find a valid position
        // This ensures we can still place the button on all sides
        const validAngles: number[] = [];
        for (let testAngle = 0; testAngle < Math.PI * 2; testAngle += Math.PI / 8) {
          const testX = cardCenterX + Math.cos(testAngle) * maxDistanceFromCard - buttonWidth / 2;
          const testY = cardCenterY + Math.sin(testAngle) * maxDistanceFromCard - buttonHeight / 2;
          if (testX >= padding && testX <= viewportWidth - buttonWidth - padding &&
              testY >= padding && testY <= viewportHeight - buttonHeight - padding - 100) {
            validAngles.push(testAngle);
          }
        }
        
        // Use the closest valid angle to the desired angle
        if (validAngles.length > 0) {
          let closestAngle = validAngles[0];
          let minDiff = Math.abs(angle - closestAngle);
          for (const validAngle of validAngles) {
            const diff = Math.abs(angle - validAngle);
            if (diff < minDiff) {
              minDiff = diff;
              closestAngle = validAngle;
            }
          }
          newX = cardCenterX + Math.cos(closestAngle) * maxDistanceFromCard - buttonWidth / 2;
          newY = cardCenterY + Math.sin(closestAngle) * maxDistanceFromCard - buttonHeight / 2;
        }
      }
      
      // Final viewport constraint
      const finalX = Math.max(padding, Math.min(newX, viewportWidth - buttonWidth - padding));
      const finalY = Math.max(padding, Math.min(newY, viewportHeight - buttonHeight - padding - 100));
      
      return { x: finalX, y: finalY };
    }

    return { x: constrainedX, y: constrainedY };
  }, []);

  const moveNoButton = useCallback(() => {
    if (!noButtonRef.current || !containerRef.current) return;

    const padding = 20;
    const maxDistanceFromCard = 200; // Maximum distance from card center
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Get actual button dimensions with buffer for safety
    const rect = noButtonRef.current.getBoundingClientRect();
    const buttonWidth = (rect.width || 150) + 20;
    const buttonHeight = (rect.height || 50) + 5;

    // Get card container position
    const cardRect = containerRef.current.getBoundingClientRect();
    const cardCenterX = cardRect.left + cardRect.width / 2;
    const cardCenterY = cardRect.top + cardRect.height / 2;

    // Calculate viewport bounds
    const minX = padding;
    const maxX = viewportWidth - buttonWidth - padding;
    const minY = padding;
    const maxY = viewportHeight - buttonHeight - padding - 100;

    // Generate random positions until we find one that's valid
    // This ensures equal probability for all directions around the card
    // Initialize with card center as fallback
    let newX = cardCenterX - buttonWidth / 2;
    let newY = cardCenterY - buttonHeight / 2;
    let attempts = 0;
    const maxAttempts = 100;
    let foundValid = false;

    while (attempts < maxAttempts && !foundValid) {
      // Generate random angle (full circle) and distance within maxDistanceFromCard
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * maxDistanceFromCard;
      
      // Calculate position relative to card center (button center position)
      const buttonCenterX = cardCenterX + Math.cos(angle) * distance;
      const buttonCenterY = cardCenterY + Math.sin(angle) * distance;
      
      // Convert to top-left corner position
      newX = buttonCenterX - buttonWidth / 2;
      newY = buttonCenterY - buttonHeight / 2;
      
      // Check if this position is within viewport bounds
      if (newX >= minX && newX <= maxX && newY >= minY && newY <= maxY) {
        foundValid = true;
      }
      
      attempts++;
    }

    // If we couldn't find a valid position, use constrainPosition to find closest valid one
    // This handles edge cases where the card is near viewport edges
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