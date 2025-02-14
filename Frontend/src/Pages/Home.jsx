import React from 'react';
import ContainerScroll from '../Components/Home/ContainerScrollScreen/ContainerScroll';

function Home() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <div className="relative pt-32 w-full min-h-[80vh] flex items-center pb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-5xl md:text-8xl text-center font-bold text-black mb-14 leading-tight">
              Core Banking software<br /> for Fintechs
            </h1>
            <p className="text-lg md:text-xl text-center text-gray-600 max-w-3xl mb-12">
              End-to-end Digital Core Banking software platform: an engine, API, web and 
              mobile front-ends, back-end with all payment functionalities in place, accounting 
              and reporting tools. SaaS or software license.
            </p>
            <div className="flex flex-wrap gap-6 justify-center">
              <button className="bg-blue-600 text-white px-8 py-4 rounded-full font-medium hover:bg-blue-700 transition-colors text-lg">
                Request Demo
              </button>
              <button className="border-2 border-blue-600 text-blue-600 px-8 py-4 rounded-full font-medium hover:bg-blue-50 transition-colors text-lg">
                Learn More
              </button>
            </div>
          </div>
        </div>
        
        {/* Background Decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-200 rounded-full blur-3xl opacity-20"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-200 rounded-full blur-3xl opacity-20"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-b from-transparent to-blue-50/30"></div>
        </div>
      </div>

      {/* Container Scroll Section */}
      <div className="relative z-20 -mt-32">
        <ContainerScroll
          titleComponent={
            <h2 className="text-4xl md:text-7xl font-bold text-center mb-16 text-white bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Our Banking Solutions
            </h2>
          }
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 px-8 pb-8 h-full">
            <div className="space-y-8">
              <h3 className="text-3xl font-bold text-white bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Core Features
              </h3>
              <ul className="space-y-6 text-lg">
                <li className="flex items-center gap-4 text-gray-200 hover:text-blue-400 transition-colors">
                  <span className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></span>
                  Digital Banking Platform
                </li>
                <li className="flex items-center gap-4 text-gray-200 hover:text-blue-400 transition-colors">
                  <span className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></span>
                  Payment Processing
                </li>
                <li className="flex items-center gap-4 text-gray-200 hover:text-blue-400 transition-colors">
                  <span className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></span>
                  API Integration
                </li>
              </ul>
            </div>
            <div className="space-y-8">
              <h3 className="text-3xl font-bold text-white bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Benefits
              </h3>
              <ul className="space-y-6 text-lg">
                <li className="flex items-center gap-4 text-gray-200 hover:text-blue-400 transition-colors">
                  <span className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></span>
                  Scalable Solution
                </li>
                <li className="flex items-center gap-4 text-gray-200 hover:text-blue-400 transition-colors">
                  <span className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></span>
                  24/7 Support
                </li>
                <li className="flex items-center gap-4 text-gray-200 hover:text-blue-400 transition-colors">
                  <span className="w-3 h-3 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></span>
                  Secure Infrastructure
                </li>
              </ul>
            </div>
          </div>
        </ContainerScroll>
      </div>
    </div>
  );
}

export default Home;
