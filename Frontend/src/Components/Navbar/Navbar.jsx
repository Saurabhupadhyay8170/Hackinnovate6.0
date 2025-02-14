import React, { useState, useEffect } from "react";
import { Menu, X, LogOut, FileText, AlertCircle } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [visible, setVisible] = useState(true);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }
  }, []);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setShowLogoutConfirm(false);
    navigate('/');
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

  const navItems = user ? [
    { name: "Dashboard", path: "/dashboard", icon: FileText },
    { name: "Templates", path: "/templates", icon: FileText },
    { name: "Documents", path: "/documents", icon: FileText },
  ] : [
    { name: "Home", path: "/" },
    { name: "Features", path: "/features" },
    { name: "Pricing", path: "/pricing" },
  ];

  return (
    <>
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-[1000] transition-all duration-300 ease-in-out`}
      >
        <div className="bg-sky-50/80 backdrop-blur-sm shadow-lg border-b border-sky-100">
          <div className="w-[90%] mx-auto sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Logo */}
              <Link 
                to="/" 
                className="font-bold text-2xl md:text-3xl text-sky-900 hover:text-sky-700 transition-colors"
              >
                <motion.span
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2"
                >
                  <FileText className="h-8 w-8 text-sky-600" />
                  StoryMosaic
                </motion.span>
              </Link>

              {/* Desktop Navigation */}
              <div className="hidden lg:flex items-center space-x-8">
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
                        className="relative text-sky-800 hover:text-sky-600 group py-2"
                      >
                        <span className="relative z-10">{item.name}</span>
                        <span className={`absolute bottom-0 left-0 h-0.5 bg-sky-500 transition-all duration-300 
                          ${location.pathname === item.path ? "w-full" : "w-0 group-hover:w-full"}`} 
                        />
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* User Section */}
                <AnimatePresence>
                  {user ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                    >
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleLogoutClick}
                        className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-sky-600 text-white hover:bg-sky-700 transition-colors"
                      >
                        <LogOut className="h-5 w-5" />
                        <span>Logout</span>
                      </motion.button>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                    >
                      <Link
                        to="/login"
                        className="px-6 py-2 rounded-lg bg-sky-600 text-white hover:bg-sky-700 transition-colors"
                      >
                        Sign In
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Menu Button */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden p-2 text-sky-600 hover:text-sky-800 focus:outline-none"
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

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              initial={{ opacity: 0, x: '100%' }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: '100%' }}
              transition={{ type: 'tween' }}
              className="lg:hidden fixed inset-0 bg-sky-50/95 backdrop-blur-sm"
              style={{ top: '64px' }}
            >
              <div className="flex flex-col items-center pt-8 space-y-6">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      to={item.path}
                      className="text-sky-800 text-xl hover:text-sky-600 transition-colors duration-200"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.name}
                    </Link>
                  </motion.div>
                ))}
                {user ? (
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={handleLogoutClick}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-sky-600 text-white hover:bg-sky-700"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </motion.button>
                ) : (
                  <Link
                    to="/login"
                    className="px-6 py-2 rounded-lg bg-sky-600 text-white hover:bg-sky-700"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleLogoutCancel}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[1001]"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl p-6 z-[1002] w-[90%] max-w-md"
            >
              <div className="flex items-center gap-3 text-sky-900 mb-4">
                <AlertCircle className="h-6 w-6 text-sky-600" />
                <h3 className="text-xl font-semibold">Confirm Logout</h3>
              </div>
              
              <p className="text-gray-600 mb-6">
                Are you sure you want to log out? You'll need to sign in again to access your account.
              </p>
              
              <div className="flex items-center justify-end gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogoutCancel}
                  className="px-4 py-2 rounded-lg text-sky-600 hover:bg-sky-50 transition-colors"
                >
                  Cancel
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogoutConfirm}
                  className="px-4 py-2 rounded-lg bg-sky-600 text-white hover:bg-sky-700 transition-colors"
                >
                  Logout
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default Navbar;
