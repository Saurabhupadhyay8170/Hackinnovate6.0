import React from "react";
import { Link } from "react-router-dom";
import { FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";
import { 
  BookOpen, 
  Feather, 
  Users, 
  Mail, 
  MapPin, 
  FileText, 
  MessageSquare, 
  Star, 
  HelpCircle,
  Sparkles
} from "lucide-react";
import { motion } from "framer-motion";

function Footer() {
  // Define the feature items array
  const featureItems = [
    { name: "Collaborative Writing", icon: Users },
    { name: "Story Templates", icon: FileText },
    { name: "Writing Workshops", icon: BookOpen },
    { name: "AI Assistance", icon: Sparkles }
  ];

  // Define the resource items array
  const resourceItems = [
    { name: "Writing Guide", icon: BookOpen },
    { name: "Community Forum", icon: MessageSquare },
    { name: "Success Stories", icon: Star },
    { name: "Help Center", icon: HelpCircle }
  ];

  // Define social media items
  const socialMediaItems = [
    { icon: FaTwitter, link: "#" },
    { icon: FaInstagram, link: "#" },
    { icon: FaLinkedinIn, link: "#" }
  ];

  // Define contact items
  const contactItems = [
    { 
      icon: MapPin, 
      text: "Writers' Hub, Creative District",
      link: "https://maps.google.com"
    },
    { 
      icon: Mail, 
      text: "create@StoryMosaic.com",
      link: "mailto:create@StoryMosaic.com"
    }
  ];

  return (
    <footer className="bg-gradient-to-b from-slate-900 to-black text-white relative mt-auto z-0">
      <div className="relative z-20 w-[90%] mx-auto px-4 sm:px-6 md:px-8 pt-16 sm:pt-20 md:pt-24 pb-8 border-t border-purple-500/20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Section */}
          <div className="lg:col-span-1 flex flex-col items-center sm:items-start">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 mb-6"
            >
              <Feather className="h-8 w-8 text-purple-400" />
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
                StoryMosaic
              </span>
            </motion.div>
            <p className="text-gray-400 mb-6 text-center sm:text-left">
              Where words come alive. Join our community of storytellers, collaborate on narratives, and bring your creative visions to life.
            </p>
            <div className="flex gap-4">
              {socialMediaItems.map((item, index) => (
                <motion.a
                  key={index}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  href={item.link}
                  className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 flex items-center justify-center hover:from-purple-500/20 hover:to-pink-500/20 transition-all duration-300"
                >
                  <item.icon className="w-5 h-5 text-purple-400" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="flex flex-col items-center sm:items-start">
            <h4 className="text-xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
              Features
            </h4>
            <ul className="space-y-4">
              {featureItems.map((item) => (
                <motion.li 
                  key={item.name}
                  whileHover={{ x: 5 }}
                  className="group"
                >
                  <Link
                    to={`/${item.name.toLowerCase().replace(' ', '-')}`}
                    className="text-gray-400 hover:text-purple-400 transition-colors duration-200 flex items-center gap-2"
                  >
                    <item.icon className="w-4 h-4 group-hover:text-pink-400" />
                    <span>{item.name}</span>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div className="flex flex-col items-center sm:items-start">
            <h4 className="text-xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
              Resources
            </h4>
            <ul className="space-y-4">
              {resourceItems.map((item) => (
                <motion.li 
                  key={item.name}
                  whileHover={{ x: 5 }}
                  className="group"
                >
                  <Link
                    to={`/${item.name.toLowerCase().replace(' ', '-')}`}
                    className="text-gray-400 hover:text-purple-400 transition-colors duration-200 flex items-center gap-2"
                  >
                    <item.icon className="w-4 h-4 group-hover:text-pink-400" />
                    <span>{item.name}</span>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="flex flex-col items-center sm:items-start">
            <h4 className="text-xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text">
              Get in Touch
            </h4>
            <ul className="space-y-4">
              {contactItems.map((item, index) => (
                <motion.li 
                  key={index}
                  whileHover={{ x: 5 }}
                  className="flex items-center gap-3 text-gray-400 group"
                >
                  <item.icon className="text-purple-400 w-5 h-5 group-hover:text-pink-400" />
                  <a href={item.link} className="hover:text-purple-400 transition-colors">
                    {item.text}
                  </a>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-purple-500/20 pt-6">
          <p className="text-gray-400 text-center">
            © {new Date().getFullYear()} StoryMosaic. codePirates - Vishv Boda, Deep Patel, Subrat Jain, Nirav Shah
          </p>
        </div>
      </div>

      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-gradient-to-r from-purple-600/30 to-pink-600/30 rounded-full filter blur-[128px] opacity-20 animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-600/30 to-pink-600/30 rounded-full filter blur-[128px] opacity-20 animate-pulse" />
      </div>
    </footer>
  );
}

export default Footer;
