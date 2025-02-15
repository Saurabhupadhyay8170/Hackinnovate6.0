// components/StickyScroll.jsx
import React, { useRef, useState } from "react";
import { useMotionValueEvent, useScroll, motion } from "framer-motion";

const StickyScroll = ({ content }) => {
  const [activeCard, setActiveCard] = useState(0);
  const ref = useRef(null);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"]
  });

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    const currentSection = Math.floor(latest * content.length);
    setActiveCard(Math.min(currentSection, content.length - 1));
  });

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Content Container */}
      <div 
        ref={ref} 
        className="h-[400vh] relative"
      >
        {/* Fixed Content */}
        <div className="sticky top-0 h-screen flex items-center justify-center">
          <div className="max-w-7xl w-full mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center md:items-start gap-12 md:gap-0">
            {/* Text Section */}
            <div className="w-full md:w-1/2 md:pr-8">
              {content.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: activeCard === index ? 1 : 0,
                    y: activeCard === index ? 0 : 20,
                    display: activeCard === index ? 'block' : 'none',
                  }}
                  transition={{ duration: 0.5 }}
                  className="absolute w-full"
                >
                  <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent mb-8">
                    {item.title}
                  </h2>
                  <p className="text-xl md:text-2xl text-gray-200 leading-relaxed">
                    {item.description}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Visual Section */}
            <div className="w-full md:w-1/2 flex justify-center items-center">
              <motion.div
                animate={{
                  rotateY: activeCard * 60,
                }}
                transition={{ duration: 0.8 }}
                className="relative w-[300px] h-[300px] md:w-[600px] md:h-[600px]"
                style={{
                  perspective: "1000px",
                  transformStyle: "preserve-3d"
                }}
              >
                <motion.div
                  className="absolute inset-0 rounded-2xl"
                  style={{
                    background: "linear-gradient(145deg, #1e1b4b, #3b0764)",
                    boxShadow: `
                      0 0 0 1px rgba(255, 255, 255, 0.1),
                      0 10px 30px rgba(0, 0, 0, 0.4),
                      inset 0 0 0 1px rgba(255, 255, 255, 0.08)
                    `
                  }}
                >
                  <div className="absolute inset-[2px] rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-8">
                    <div className="relative w-full h-full flex items-center justify-center">
                      {/* Card Content */}
                      <motion.div
                        animate={{
                          scale: [1, 1.1, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="flex flex-col items-center gap-6"
                      >
                        <span className="text-6xl md:text-8xl">
                          {activeCard === 0 ? "✍️" : 
                           activeCard === 1 ? "🎭" :
                           activeCard === 2 ? "🤖" :
                           activeCard === 3 ? "⚡" :
                           activeCard === 4 ? "👥" : "🚀"}
                        </span>
                        <div className="h-1 w-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" />
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StickyScroll;
