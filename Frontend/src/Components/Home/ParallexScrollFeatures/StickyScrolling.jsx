// components/StickyScroll.jsx
import React, { useRef, useState } from "react";
import { useMotionValueEvent, useScroll, motion } from "framer-motion";

const StickyScroll = ({ content }) => {
  const [activeCard, setActiveCard] = useState(0);
  const containerRef = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const currentSection = Math.floor(latest * content.length);
    setActiveCard(Math.min(currentSection, content.length - 1));
  });

  return (
    <motion.div 
      ref={containerRef}
      className="relative w-full bg-slate-950"
    >
      {/* Spacer for scroll length */}
      <div className="h-[400vh]">
        {/* Sticky Container */}
        <div className="sticky top-0 h-screen flex items-center justify-center p-10">
          {/* Content Container */}
          <div className="max-w-7xl w-full mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr,1.5fr] gap-20">
              {/* Text Content */}
              <div className="relative">
                {content.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{
                      opacity: activeCard === index ? 1 : 0,
                      y: activeCard === index ? 0 : 20,
                      pointerEvents: activeCard === index ? "auto" : "none",
                    }}
                    transition={{
                      duration: 0.5,
                      ease: "easeOut"
                    }}
                    className="absolute inset-0"
                  >
                    <div className="space-y-6">
                      <h2 className="text-4xl font-bold text-white">
                        {item.title}
                      </h2>
                      <p className="text-lg text-slate-300 leading-relaxed max-w-2xl">
                        {item.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Visual Content */}
              <div className="h-[450px] w-full rounded-lg overflow-hidden bg-slate-900/40">
                {content.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{
                      opacity: activeCard === index ? 1 : 0,
                      x: activeCard === index ? 0 : 100,
                      pointerEvents: activeCard === index ? "auto" : "none",
                    }}
                    transition={{
                      duration: 0.5,
                      ease: "easeOut"
                    }}
                    className="absolute inset-0 h-full w-full"
                  >
                    <div className="h-full w-full rounded-lg overflow-hidden">
                      {index === 0 && (
                        <div className="h-full w-full bg-[linear-gradient(to_bottom_right,var(--tw-color-cyan-500),var(--tw-color-emerald-500))] flex items-center justify-center text-white text-2xl font-medium">
                          <span className="text-7xl">✍️</span>
                        </div>
                      )}
                      {index === 1 && (
                        <div className="h-full w-full bg-[linear-gradient(to_bottom_right,var(--tw-color-violet-500),var(--tw-color-purple-500))] flex items-center justify-center text-white text-2xl font-medium">
                          <span className="text-7xl">🎭</span>
                        </div>
                      )}
                      {index === 2 && (
                        <div className="h-full w-full bg-[linear-gradient(to_bottom_right,var(--tw-color-orange-500),var(--tw-color-yellow-500))] flex items-center justify-center text-white text-2xl font-medium">
                          <span className="text-7xl">🤖</span>
                        </div>
                      )}
                      {index === 3 && (
                        <div className="h-full w-full bg-[linear-gradient(to_bottom_right,var(--tw-color-pink-500),var(--tw-color-rose-500))] flex items-center justify-center text-white text-2xl font-medium">
                          <span className="text-7xl">⚡</span>
                        </div>
                      )}
                      {index === 4 && (
                        <div className="h-full w-full bg-[linear-gradient(to_bottom_right,var(--tw-color-blue-500),var(--tw-color-indigo-500))] flex items-center justify-center text-white text-2xl font-medium">
                          <span className="text-7xl">👥</span>
                        </div>
                      )}
                      {index === 5 && (
                        <div className="h-full w-full bg-[linear-gradient(to_bottom_right,var(--tw-color-teal-500),var(--tw-color-emerald-500))] flex items-center justify-center text-white text-2xl font-medium">
                          <span className="text-7xl">🚀</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <motion.div 
        className="fixed left-0 top-0 h-1 bg-gradient-to-r from-emerald-500 to-cyan-500"
        style={{
          width: scrollYProgress.get() * 100 + "%",
          zIndex: 1000
        }}
      />
    </motion.div>
  );
};

export default StickyScroll;
