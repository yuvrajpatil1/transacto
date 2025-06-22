import React from "react";

const Loader = () => {
  return (
    <div className="flex justify-center items-center h-screen w-screen bg-black">
      <div className="bg-black p-4 lg:p-8 rounded-xl">
        <div className="text-gray-400 text-lg lg:text-2xl font-medium flex items-center h-10 px-2 rounded-lg">
          <span className="mr-2">loading your</span>
          <div className="relative overflow-hidden h-full">
            <div
              className="flex flex-col h-full animate-spin-words"
              style={{
                animation: "spinWords 3s infinite",
              }}
            >
              <span className="block h-full pl-1 text-orange-500 leading-10">
                dashboard...
              </span>
              <span className="block h-full pl-1 text-orange-500 leading-10">
                requests...
              </span>
              <span className="block h-full pl-1 text-orange-500 leading-10">
                transactions...
              </span>
              <span className="block h-full pl-1 text-orange-500 leading-10">
                dashboard...
              </span>
            </div>
            <div
              className="absolute inset-0 pointer-events-none z-10"
              style={{
                background:
                  "linear-gradient(to bottom, #000 10%, transparent 30%, transparent 70%, #000 90%)",
              }}
            ></div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes spinWords {
          10% {
            transform: translateY(-102%);
          }
          25% {
            transform: translateY(-100%);
          }
          35% {
            transform: translateY(-202%);
          }
          50% {
            transform: translateY(-200%);
          }
          60% {
            transform: translateY(-302%);
          }
          75% {
            transform: translateY(-300%);
          }
          85% {
            transform: translateY(-402%);
          }
          100% {
            transform: translateY(-400%);
          }
        }
      `}</style>
    </div>
  );
};

export default Loader;
