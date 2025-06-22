import React from "react";
import DashboardPC from "../assets/dashboard-pc.png";
import DashboardMobile from "../assets/dashboard-mobile.png";

const Mockup = () => {
  return (
    <div className="relative mb-12 sm:mb-16 md:mb-20 lg:mb-24 px-2 sm:px-4 ">
      {/* Main Container */}
      <div className="relative ">
        {/* Desktop Mockup */}
        <div className="relative z-10">
          {/* Monitor Frame */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-xl sm:rounded-2xl shadow-2xl">
            <div className="bg-gray-800/60 backdrop-blur-xl rounded-lg sm:rounded-xl border border-gray-600/30 overflow-hidden shadow-3xl shadow-[0_0_80px_rgba(59,130,170,0.6)] hover:shadow-[0_0_120px_rgba(59,130,170,0.6)] transition-all ease-in-out duration-300">
              {/* Top Bar */}
              <div className="bg-gray-700/50 px-1 sm:px-2 py-1 sm:py-1 flex items-center space-x-1 sm:space-x-2 border-b border-gray-600/30">
                <div className="flex space-x-1 sm:space-x-2">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-full"></div>
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="flex-1 mx-2 sm:mx-4">
                  <div className="bg-gray-600/40 rounded-md px-2 sm:px-3 py-1 text-xs text-gray-300 text-center">
                    transacto.onrender.com
                  </div>
                </div>
              </div>

              {/* Screen Content */}
              <div className=" bg-gradient-to-br from-slate-50 to-gray-100 flex items-center justify-center relative overflow-hidden">
                <img
                  src={DashboardPC}
                  alt="Desktop Dashboard"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Mockup - Overlapping - Responsive positioning */}
        <div
          className="absolute 
          -bottom-8 -right-4 sm:-bottom-12 sm:-right-6 md:-bottom-16 md:-right-8 lg:-bottom-6 lg:-right-6
          z-20 transform 
          hover:rotate-3 sm:hover:rotate-3 md:hover:rotate-3 lg:hover:rotate-3 
          transition-transform duration-500
          scale-75 sm:scale-85 md:scale-90 lg:scale-100 shadow-2xl"
        >
          {/* Phone Frame */}
          <div
            className="bg-gradient-to-br from-gray-900 to-black rounded-2xl sm:rounded-3xl p-1.5 sm:p-2 shadow-2xl 
            w-26 sm:w-32 md:w-40 lg:w-40 xl:w-46"
          >
            <div className=" rounded-xl sm:rounded-2xl overflow-hidden">
              {/* Phone Screen */}
              <div className=" bg-gray-700 relative overflow-hidden">
                {/* Notch - Responsive sizing */}
                <div
                  className="absolute top-0 left-1/2 transform -translate-x-1/2 
                  w-10 h-2 sm:w-16 sm:h-4 md:w-18 md:h-4 lg:w-22 lg:h-4 xl:w-24 xl:h-4 
                  bg-black rounded-b-xl sm:rounded-b-2xl z-10"
                ></div>

                {/* Screen Content */}
                <img
                  src={DashboardMobile}
                  alt="Mobile Dashboard"
                  className="w-full h-full object-cover pt-0 sm:pt-4 md:pt-4 lg:pt-4"
                />
              </div>
            </div>
          </div>

          {/* Phone Shadow */}
          <div className="absolute inset-0 bg-black/20 rounded-2xl sm:rounded-3xl blur-lg sm:blur-xl transform translate-y-2 sm:translate-y-3 md:translate-y-4 -z-10"></div>
        </div>

        {/* Background Glow Effects - Responsive sizing */}
        <div className="absolute inset-0 -z-10">
          <div
            className="absolute top-1/4 left-1/4 
            w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 
            bg-blue-500/10 rounded-full blur-2xl sm:blur-3xl"
          ></div>
          <div
            className="absolute bottom-1/4 right-1/4 
            w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 
            bg-purple-500/10 rounded-full blur-2xl sm:blur-3xl"
          ></div>
        </div>
      </div>

      {/* Optional floating elements - Responsive positioning and sizing */}
      <div
        className="absolute 
        top-4 left-4 sm:top-6 sm:left-6 md:top-8 md:left-8 
        w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 
        bg-blue-400 rounded-full animate-pulse opacity-60"
      ></div>
      <div
        className="absolute 
        top-8 right-8 sm:top-12 sm:right-12 md:top-16 md:right-16 
        w-1.5 h-1.5 sm:w-2 sm:h-2 
        bg-purple-400 rounded-full animate-pulse opacity-40"
      ></div>
      <div
        className="absolute 
        bottom-16 left-8 sm:bottom-20 sm:left-10 md:bottom-24 md:left-12 lg:bottom-32 lg:left-16 
        w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 
        bg-pink-400 rounded-full animate-pulse opacity-50"
      ></div>
    </div>
  );
};

export default Mockup;
