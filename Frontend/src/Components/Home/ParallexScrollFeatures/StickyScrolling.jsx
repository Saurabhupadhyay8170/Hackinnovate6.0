// components/StickyScroll.jsx
import React, { useEffect, useRef, useState } from "react";
import { useMotionValueEvent, useScroll, motion } from "framer-motion";
import { cn } from "./util";

const StickyScroll = ({
  content,
  contentClassName,
}) => {
  const [activeCard, setActiveCard] = React.useState(0);
  const [hasScrolledThrough, setHasScrolledThrough] = useState(false);
  const [viewedCards, setViewedCards] = useState(new Set());
  const ref = useRef(null);
  const containerRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    container: ref,
    offset: ["start start", "end start"],
  });

  const cardLength = content.length;

  const backgroundColors = [
    "rgba(255, 255, 255, 0.98)", // Consistent white background
    "rgba(255, 255, 255, 0.98)",
    "rgba(255, 255, 255, 0.98)",
  ];
  
  const linearGradients = [
    "linear-gradient(135deg, #1E40AF 0%, #0369A1 100%)", // Darker blue gradient
    "linear-gradient(135deg, #6D28D9 0%, #4F46E5 100%)", // Darker purple gradient
    "linear-gradient(135deg, #047857 0%, #0D9488 100%)", // Darker green gradient
  ];

  const [backgroundGradient, setBackgroundGradient] = useState(linearGradients[0]);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const cardsBreakpoints = content.map((_, index) => index / cardLength);
    const closestBreakpointIndex = cardsBreakpoints.reduce(
      (acc, breakpoint, index) => {
        const distance = Math.abs(latest - breakpoint);
        if (distance < Math.abs(latest - cardsBreakpoints[acc])) {
          return index;
        }
        return acc;
      },
      0
    );
    
    setActiveCard(closestBreakpointIndex);
    
    // Add current card to viewed cards
    setViewedCards(prev => new Set([...prev, closestBreakpointIndex]));
    
    // Only mark as scrolled through when we've viewed all cards and reached the end
    if (latest >= 0.99 && viewedCards.size >= cardLength) {
      setHasScrolledThrough(true);
    }
  });

  // Prevent main page scroll until all content is viewed
  useEffect(() => {
    const handleWheel = (e) => {
      if (!hasScrolledThrough && ref.current) {
        const container = ref.current;
        const isAtBottom = container.scrollHeight - container.scrollTop === container.clientHeight;
        
        if (e.deltaY > 0 && isAtBottom && viewedCards.size < cardLength) {
          e.preventDefault();
        }
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
    }

    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel);
      }
    };
  }, [hasScrolledThrough, viewedCards, cardLength]);

  useEffect(() => {
    setBackgroundGradient(linearGradients[activeCard % linearGradients.length]);
  }, [activeCard]);

  return (
    <div ref={containerRef} className="relative">
      <motion.div
        animate={{
          backgroundColor: backgroundColors[activeCard % backgroundColors.length],
        }}
        className="h-[85vh] overflow-y-auto flex justify-center relative space-x-20 rounded-2xl p-16 shadow-lg  backdrop-blur-sm scroll-smooth"
        ref={ref}
      >
        <div className="div relative flex items-start px-8">
          <div className="max-w-4xl">
            {content.map((item, index) => (
              <div key={item.title + index} className="my-32">
                <motion.h2
                  initial={{
                    opacity: 0,
                  }}
                  animate={{
                    opacity: activeCard === index ? 1 : 0.25,
                  }}
                  className="text-4xl font-bold text-slate-900 tracking-tight"
                >
                  {item.title}
                </motion.h2>
                <motion.p
                  initial={{
                    opacity: 0,
                  }}
                  animate={{
                    opacity: activeCard === index ? 1 : 0.25,
                  }}
                  className="text-lg text-slate-700 max-w-xl mt-14 leading-relaxed font-normal"
                >
                  {item.description}
                </motion.p>
              </div>
            ))}
            <div className="h-56" />
          </div>
        </div>
        <div
          style={{ 
            background: backgroundGradient,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), inset 0 0 80px rgba(255, 255, 255, 0.2)'
          }}
          className={cn(
            "hidden lg:block h-[450px] w-[500px] rounded-2xl sticky top-16 overflow-hidden transition-all duration-500 hover:scale-[1.02] border border-slate-200/50",
            contentClassName
          )}
        >
          {content[activeCard].content ?? null}
        </div>
      </motion.div>
    </div>
  );
};

export default StickyScroll;
