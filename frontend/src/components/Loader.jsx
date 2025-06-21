export default function Loader({
  words = ["your dashboard...", "your transactions...", "your requests..."],
}) {
  return (
    <div className="bg-black p-4 flex justify-center items-center h-screen w-screen">
      <div className="text-gray-400 font-medium text-2xl h-10 p-2 flex items-center">
        <span className="mr-2">loading</span>
        <div className="relative overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none z-20"
            style={{
              background:
                "linear-gradient(#000 10%, transparent 30%, transparent 70%, #000 90%)",
            }}
          />
          {words.map((word, index) => (
            <span
              key={index}
              className="block h-full pl-1 text-blue-400 "
              style={{
                animation: "spin_4991 4s infinite",
              }}
            >
              {word}
            </span>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes spin_4991 {
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
}
