import React, { useState, useEffect } from "react";
import {
  Menu,
  X,
  LogOut,
  FileText,
  AlertCircle,
  BookOpen,
  Users,
  Pen,
  Compass,
  Feather,
  MessageSquare,
  Star,
  HelpCircle,
  Sparkles,
  Edit3
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import CollaborativeEditor from "../CollaborativeEditor/CollaborativeEditor";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [visible, setVisible] = useState(true);
  const [user, setUser] = useState(null);
  const [showCollaborativeEditor, setShowCollaborativeEditor] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Update user state when localStorage changes
  useEffect(() => {
    const checkUser = () => {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        setUser(JSON.parse(userStr));
      } else {
        setUser(null);
      }
    };

    // Check initially
    checkUser();

    // Listen for storage changes
    window.addEventListener('storage', checkUser);

    // Create an interval to check periodically
    const interval = setInterval(checkUser, 1000);

    return () => {
      window.removeEventListener('storage', checkUser);
      clearInterval(interval);
    };
  }, []);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = () => {
    localStorage.clear();
    setUser(null);
    setShowLogoutConfirm(false);
    window.location.href = '/';
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false);
  };

  // Handle scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.scrollY;

      // Determine scroll direction and visibility
      setVisible(
        (prevScrollPos > currentScrollPos) || // Scrolling up
        currentScrollPos < 10 // At top of page
      );

      setPrevScrollPos(currentScrollPos);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [prevScrollPos]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  const navItems = [
    { name: "Home", path: "/dashboard", icon: Sparkles },
    { name: "Templates", path: "/template", icon: Sparkles }
  ]

  // Toggle the collaborative editor
  const toggleCollaborativeEditor = () => {
    setShowCollaborativeEditor(!showCollaborativeEditor);
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-[1000] transition-all duration-300 ease-in-out`}
      >
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 backdrop-blur-sm border-b border-purple-500/20">
          <div className="w-[90%] mx-auto sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <Link
                to="/"
                className="font-bold text-2xl md:text-3xl text-white group"
              >
                <motion.span
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2"
                >
                  <motion.div
                    whileHover={{ rotate: 180 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Feather className="h-8 w-8 text-purple-400 group-hover:text-purple-300" />
                  </motion.div>
                  <span className="bg-gradient-to-r from-purple-400 to-pink-400 text-transparent bg-clip-text group-hover:from-purple-300 group-hover:to-pink-300">
                    Talespire
                  </span>
                </motion.span>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center space-x-8">
                {user && (
                  <div className="flex items-center space-x-8 text-lg">
                    {navItems.map((item, index) => (
                      <motion.div
                        key={item.name}
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Link
                          to={item.path}
                          className="relative text-gray-300 hover:text-purple-400 group py-2"
                        >
                          <span className="relative z-10">{item.name}</span>
                          <span className={`absolute bottom-0 left-0 h-0.5 bg-purple-500 transition-all duration-300 
                            ${location.pathname === item.path ? "w-full" : "w-0 group-hover:w-full"}`}
                          />
                        </Link>
                      </motion.div>
                    ))}

                    {/* Collaborative Writing Button */}
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: navItems.length * 0.1 }}
                    >
                      <button
                        onClick={toggleCollaborativeEditor}
                        className="relative text-gray-300 hover:text-purple-400 group py-2 flex items-center gap-2"
                      >
                        <Edit3 className="h-5 w-5" />
                        <span className="relative z-10">Collaborative Writing</span>
                        <span className={`absolute bottom-0 left-0 h-0.5 bg-purple-500 transition-all duration-300 
                          ${showCollaborativeEditor ? "w-full" : "w-0 group-hover:w-full"}`}
                        />
                      </button>
                    </motion.div>
                  </div>
                )}

                {/* User Section */}
                <AnimatePresence>
                  {user ? (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleLogoutClick}
                      className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-2 rounded-lg shadow-lg shadow-purple-500/20"
                    >
                      <span className="flex items-center gap-2">
                        <LogOut className="h-5 w-5" />
                        <span>Sign Out</span>
                      </span>
                    </motion.button>
                  ) : (
                    <Link
                      to="/login"
                      className="relative group"
                    >
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-50 group-hover:opacity-75 transition duration-200"></div>
                      <button className="relative bg-black px-6 py-2 rounded-lg text-white">
                        Start Creating
                      </button>
                    </Link>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Menu Button */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden p-2 text-purple-400 hover:text-purple-300 focus:outline-none"
                aria-label="Toggle menu"
              >
                {isOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile menu, show/hide based on menu state */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="lg:hidden fixed inset-0 z-50 pt-16 bg-gradient-to-b from-slate-900 to-black text-white overflow-y-auto"
          >
            <div className="px-6 py-8 space-y-8">
              {user ? (
                <div className="space-y-6 text-center">
                  <div className="space-y-2">
                    {navItems.map((item) => (
                      <motion.div
                        key={item.name}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="block py-3"
                      >
                        <Link
                          to={item.path}
                          className="flex items-center justify-center gap-3 text-xl font-medium"
                        >
                          <item.icon className="h-6 w-6 text-purple-400" />
                          {item.name}
                        </Link>
                      </motion.div>
                    ))}

                    {/* Collaborative Writing Button */}
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="block py-3"
                    >
                      <button
                        onClick={() => {
                          setIsOpen(false);
                          toggleCollaborativeEditor();
                        }}
                        className="flex items-center justify-center gap-3 text-xl font-medium w-full"
                      >
                        <Edit3 className="h-6 w-6 text-purple-400" />
                        Collaborative Writing
                      </button>
                    </motion.div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogoutClick}
                    className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-lg shadow-lg shadow-purple-500/20"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Sign Out</span>
                  </motion.button>
                </div>
              ) : (
                <div className="text-center">
                  <Link
                    to="/login"
                    className="inline-block relative group"
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur opacity-50 group-hover:opacity-75 transition duration-200"></div>
                    <button className="relative bg-black px-6 py-3 rounded-lg text-white">
                      Start Creating
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logout confirmation dialog */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 text-center"
            >
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Sign Out Confirmation
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to sign out? Any unsaved work may be lost.
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleLogoutCancel}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogoutConfirm}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collaborative Editor Component */}
      <CollaborativeEditor
        isOpen={showCollaborativeEditor}
        onClose={toggleCollaborativeEditor}
      />
    </>
  );
}

export default Navbar;
