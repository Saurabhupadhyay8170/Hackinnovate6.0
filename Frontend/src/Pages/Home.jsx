import React from 'react';
import ContainerScroll from '../Components/Home/ContainerScrollScreen/ContainerScroll';
import StickyScrolling from '../Components/Home/ParallexScrollFeatures/StickyScrolling';

function Home() {

  const content = [
    {
      title: "Section 1",
      description: "This is the first section description",
      // content: <div className="p-4"><img src="data:image/jpeg;base64,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" alt="" /></div>
    },
    {
      title: "Section 2",
      description: "This is the second section description",
      // content: <div className="p-4"><img src="data:image/jpeg;base64,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" alt="" /></div>
    },
    {
      title: "Section 3",
      description: "SDADADASDADADADSDADADSDAD",
      // content: <div className="p-4">Content for section 3</div>
      // content: <div className="p-4"><img src="https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png" alt="" /></div>
    },
    {
      title: "Section 4",
      description: "SDADADASDADADADSDADADSDAD",
      // content: <div className="p-4">Content for section 3</div>
      // content: <div className="p-4"><img src="https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png" alt="" /></div>
    },
    {
      title:  "   ",
      description: "",
      // content: <div className="p-4">Content for section 3</div>
      // content: <div className="p-4"><img src="https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png" alt="" /></div>
    },
    {
      title: "",
      description: "",
      // content: <div className="p-4">Content for section 3</div>
      // content: <div className="p-4"><img src="https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png" alt="" /></div>
    },
    

  ];

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

      {/* Parallex Scroll Section */}
      <StickyScrolling content={content} />

    </div>
  );
}

export default Home;
