import React from "react";
import { Banknote, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Sidebar({
  isOpen,
  onClose,
  menuItems,
  activeTab,
  setActiveTab,
}) {
  const navigate = useNavigate();

  const handleClick = (item) => {
    setActiveTab(item.id);
    navigate(item.path);
    if (onClose) onClose(); // close on mobile
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      <div
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-transparent backdrop-blur-3xl border-r-2 border-gray-800 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 transition-transform duration-300 ease-in-out`}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-2 text-white lg:hidden hover:bg-slate-600 p-2 rounded-lg cursor-pointer"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex flex-col h-full">
          <div className="bg-black p-4 border-b border-slate-600">
            <div className="bg-black flex items-center">
              <h1
                onClick={() => navigate("/")}
                className="text-3xl mx-4 font-bold text-white cursor-pointer"
              >
                Transacto
              </h1>
            </div>
          </div>
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <li key={item.id}>
                    <button
                      onClick={() => handleClick(item)}
                      className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200 cursor-pointer ${
                        isActive
                          ? "bg-white/10 text-white shadow-lg"
                          : "text-slate-300 hover:bg-white/10 hover:text-white transition-all duration-300 ease-in-out"
                      }`}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      {item.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
}
