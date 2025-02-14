import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [visible, setVisible] = useState(true);
  const location = useLocation();

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

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[1000] transition-all duration-300 ease-in-out`}>
      <div className="bg-white/90 backdrop-blur-sm shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="font-bold text-2xl text-[#4338CA]">
              advapay
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              <div className="flex space-x-8">
                {[
                  { name: "Core Banking", dropdown: true },
                  { name: "BaaS", dropdown: false },
                  { name: "Licensing & Consulting", dropdown: true },
                  { name: "Insights", dropdown: true },
                  { name: "Company", dropdown: true }
                ].map((item) => (
                  <div key={item.name} className="relative group">
                    <button className="flex items-center space-x-1 text-gray-600 hover:text-[#4338CA] py-2">
                      <span>{item.name}</span>
                      {item.dropdown && (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </button>
                  </div>
                ))}
              </div>
              
              {/* Language Selector */}
              <button className="text-gray-600 hover:text-[#4338CA]">ES</button>
              
              {/* Contact Button */}
              <Link
                to="/contact"
                className="bg-[#4338CA] text-white px-6 py-2 rounded-full hover:bg-[#4338CA]/90 transition-colors"
              >
                Contact Us
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 text-gray-600 hover:text-[#4338CA]"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden fixed inset-0 bg-white transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ top: "80px" }}
      >
        <div className="flex flex-col px-4 pt-2 space-y-3">
          {[
            "Core Banking",
            "BaaS",
            "Licensing & Consulting",
            "Insights",
            "Company"
          ].map((item) => (
            <button
              key={item}
              className="text-left text-gray-600 hover:text-[#4338CA] py-2 text-lg"
            >
              {item}
            </button>
          ))}
          <Link
            to="/contact"
            className="bg-[#4338CA] text-white px-6 py-2 rounded-full text-center hover:bg-[#4338CA]/90 transition-colors"
          >
            Contact Us
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
