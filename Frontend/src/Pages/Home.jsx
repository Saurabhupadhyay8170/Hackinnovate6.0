import React, { useState, useEffect } from 'react';
import { motion, useScroll } from 'framer-motion';
import ContainerScroll from '../Components/Home/ContainerScrollScreen/ContainerScroll';
import StickyScrolling from '../Components/Home/ParallexScrollFeatures/StickyScrolling';
import FeatureShowcase from '../Components/Home/FeatureShowcase/FeatureShowcase';

function Home() {
  const [showNav, setShowNav] = useState(true);
  const { scrollY } = useScroll();

  useEffect(() => {
    return scrollY.onChange((latest) => {
      // Calculate when to hide navbar based on hero section height
      setShowNav(latest < window.innerHeight);
    });
  }, [scrollY]);

  const content = [
    {
      title: "Craft Your Story",
      description: "Step into a world where your imagination knows no bounds. Our real-time collaborative platform brings writers together, allowing you to weave tales with fellow storytellers while seeing their creative process unfold before your eyes.",
    },
    {
      title: "Shape the Narrative",
      description: "Create branching storylines where readers' choices matter. Watch as your audience becomes part of the story, voting on plot twists and character decisions that shape the narrative in unexpected ways.",
    },
    {
      title: "AI Story Companion",
      description: "Let our advanced AI assist you in developing rich character arcs, maintaining consistent plot threads, and suggesting creative directions when you need inspiration. It's like having a writing partner who's always there to help.",
    },
    {
      title: "Professional Writing Tools",
      description: "Access a suite of tools designed for storytellers - from genre-specific templates that help structure your narrative, to advanced editing features that polish your prose to perfection.",
    },
    {
      title: "Vibrant Community",
      description: "Join a thriving ecosystem of writers, readers, and creative minds. Share your work, receive constructive feedback, and collaborate with others who share your passion for storytelling.",
    },
    {
      title: "Share Your Vision",
      description: "When your story is ready, publish it your way. Export in multiple formats, perfect for self-publishing or sharing with your audience. Your stories, your rules, your success.",
    },
  ];

  return (
    <div className="relative bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Consistent Background Gradient */}
      <div className="fixed inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900" />

      {/* Animated Background Elements */}
      <div className="fixed inset-0">
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] bg-purple-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -bottom-1/4 -left-1/4 w-[800px] h-[800px] bg-pink-500/20 rounded-full blur-3xl"
        />
      </div>

      {/* Navbar Control */}
      <motion.div
        className="fixed top-0 left-0 right-0 z-50"
        animate={{
          y: showNav ? 0 : -100,
          opacity: showNav ? 1 : 0
        }}
        transition={{ duration: 0.3 }}
      >
        {/* Your Navbar Component */}
      </motion.div>

      <div className="relative z-10">
        {/* Hero Content */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="min-h-screen pt-20 flex items-center"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32">
            <div className="flex flex-col items-center justify-center">
              <motion.h1 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-5xl md:text-8xl text-center font-bold mb-14 leading-tight bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 text-transparent bg-clip-text"
              >
                Where Stories Come<br />Alive Together
              </motion.h1>
              <motion.p 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-lg md:text-xl text-center text-gray-300 max-w-3xl mb-12"
              >
                Transform your writing experience with our collaborative storytelling platform. 
                Create, collaborate, and captivate audiences with interactive narratives powered 
                by real-time collaboration and AI assistance.
              </motion.p>
              <motion.div 
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap gap-6 justify-center"
              >
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-4 rounded-full font-medium"
                >
                  Start Writing
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="border-2 border-purple-500 text-purple-400 px-8 py-4 rounded-full font-medium hover:bg-purple-500/10"
                >
                  Watch Demo
                </motion.button>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Container Scroll */}
        <ContainerScroll
          titleComponent={
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
              className="space-y-4"
            >
              <h2 className="text-4xl md:text-7xl font-bold text-center bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
                Collaborative Writing Reimagined
              </h2>
              <p className="text-gray-400 text-xl max-w-3xl mx-auto text-center">
                Experience the future of storytelling with our innovative tools and features
              </p>
            </motion.div>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8">
            <div className="space-y-6">
              <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                For Writers
              </h3>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-gray-300">
                  <span className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full" />
                  Real-time collaboration
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <span className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full" />
                  AI-powered assistance
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <span className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full" />
                  Story templates
                </li>
              </ul>
            </div>
            <div className="space-y-6">
              <h3 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
                For Readers
              </h3>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-gray-300">
                  <span className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full" />
                  Interactive choices
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <span className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full" />
                  Vote on plot twists
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <span className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full" />
                  Connect with authors
                </li>
              </ul>
            </div>
          </div>
        </ContainerScroll>

        {/* Feature Showcase */}
        <FeatureShowcase content={content} />
      </div>
    </div>
  );
}

export default Home;
