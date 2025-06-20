// import React, { useState } from "react";
// import {
//   Home,
//   ArrowRightLeft,
//   BanknoteArrowDown,
//   User,
//   LogOut,
//   X,
//   Banknote,
//   Copy,
//   Eye,
//   EyeOff,
//   Wallet,
//   Menu,
//   Users,
// } from "lucide-react";
// import { useSelector } from "react-redux";
// import { useLocation, useNavigate } from "react-router-dom";
// import Sidebar from "../components/Sidebar";

// export default function DefaultLayout({ children }) {
//   const { user } = useSelector((state) => state.users);
//   const [showBalance, setShowBalance] = useState(true);
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);
//   const location = useLocation();
//   const [activeTab, setActiveTab] = useState(
//     location.pathname.split("/")[1] || "home"
//   );

//   const navigate = useNavigate();

//   const userMenu = [
//     {
//       id: "home",
//       icon: Home,
//       label: "Home",
//       onClick: () => navigate("/dashboard"),
//       path: "/dashboard",
//     },
//     {
//       id: "transactions",
//       icon: ArrowRightLeft,
//       label: "Transactions",
//       onClick: () => navigate("/transactions"),
//       path: "/transactions",
//     },
//     {
//       id: "requests",
//       icon: BanknoteArrowDown,
//       label: "Requests",
//       onClick: () => navigate("/requests"),
//       path: "/requests",
//     },
//     {
//       id: "profile",
//       icon: User,
//       label: "Profile",
//       onClick: () => navigate("/profile"),
//       path: "/profile",
//     },
//     {
//       id: "logout",
//       icon: LogOut,
//       label: "Logout",
//       onClick: () => navigate("/logout"),
//       path: "/logout",
//     },
//   ];

//   const adminMenu = [
//     {
//       id: "home",
//       icon: Home,
//       label: "Home",
//       onClick: () => navigate("/dashboard"),
//       path: "/dashboard",
//     },
//     {
//       id: "users",
//       icon: Users,
//       label: "Users",
//       onClick: () => navigate("/users"),
//       path: "/users",
//     },
//     {
//       id: "transactions",
//       icon: ArrowRightLeft,
//       label: "Transactions",
//       onClick: () => navigate("/transactions"),
//       path: "/transactions",
//     },
//     {
//       id: "requests",
//       icon: BanknoteArrowDown,
//       label: "Requests",
//       onClick: () => navigate("/requests"),
//       path: "/requests",
//     },
//     {
//       id: "profile",
//       icon: User,
//       label: "Profile",
//       onClick: () => navigate("/profile"),
//       path: "/profile",
//     },
//     {
//       id: "logout",
//       icon: LogOut,
//       label: "Logout",
//       onClick: () => navigate("/logout"),
//       path: "/logout",
//     },
//   ];

//   const menuToRender = user?.isAdmin ? adminMenu : userMenu;

//   const copyToClipboard = (text) => {
//     navigator.clipboard.writeText(text);
//     alert("Account number copied to clipboard!");
//   };

//   const handleMenuClick = (itemId) => {
//     if (itemId === "logout") {
//       alert("Logging out...");
//       return;
//     }
//     setActiveTab(itemId);
//     navigate(`/${itemId}`);
//     setIsSidebarOpen(false);
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex">
//       {/* <div className="">{children}</div> */}
//       {/* Mobile Overlay */}
//       {isSidebarOpen && (
//         <div
//           className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
//           onClick={() => setIsSidebarOpen(false)}
//         />
//       )}

//       {/* Sidebar */}
//       <Sidebar
//         isOpen={isSidebarOpen}
//         onClose={() => setIsSidebarOpen(false)}
//         menuItems={menuToRender}
//         activeTab={activeTab}
//         setActiveTab={setActiveTab}
//       />

//       {/* Main Content */}
//       <div className="flex-1 flex flex-col min-h-screen">
//         {/* Header */}
//         {/* <header className="bg-white shadow-sm border-b">
//           <div className="flex items-center justify-between px-6 py-4">
//             <div className="flex items-center">
//               <button
//                 onClick={() => setIsSidebarOpen(true)}
//                 className="lg:hidden mr-4 p-2 rounded-lg hover:bg-gray-100"
//               >
//                 <Menu className="w-6 h-6" />
//               </button>
//               <h2 className="text-2xl font-bold text-gray-800">
//                 SECUREPAY WALLET
//               </h2>
//             </div>
//             <div className="text-sm text-gray-600">
//               Role: <span className="font-semibold text-blue-600">User</span>
//             </div>
//           </div>
//         </header> */}

//         {/* Main Content Area */}
//         <main className="flex-1 p-6">
//           {/* Welcome Message */}
//           <div className="mb-8">
//             <h1 className="text-3xl font-bold text-gray-800 mb-16">
//               Hi {user?.firstName}, Welcome to SecurePay!
//             </h1>
//           </div>
//           <div className="max-w-5xl h-5xl mx-auto justify-center items-center">
//             {/* Account Info Card */}
//             <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
//               {/* Account Header */}
//               <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-6 text-white">
//                 <div className="flex items-center justify-between mb-4">
//                   <div>
//                     <h3 className="text-lg font-semibold mb-1">
//                       Account Number
//                     </h3>
//                     <div className="flex items-center">
//                       <span className="font-mono text-lg tracking-wider mr-3">
//                         {user?._id}
//                       </span>
//                       <button
//                         onClick={() => copyToClipboard(user?.accountNumber)}
//                         className="p-2 hover:bg-orange-400 hover:bg-opacity-20 rounded-lg transition-colors"
//                         title="Copy account number"
//                       >
//                         <Copy className="w-4 h-4" />
//                       </button>
//                     </div>
//                   </div>
//                 </div>

//                 <div className="flex items-center justify-between">
//                   <div>
//                     <h3 className="text-lg font-semibold mb-1">Balance</h3>
//                     <div className="flex items-center">
//                       <span className="text-3xl font-bold mr-3">
//                         {showBalance ? `Rs. ${user?.balance}` : "****"}
//                       </span>
//                       <button
//                         onClick={() => setShowBalance(!showBalance)}
//                         className="p-2 hover:bg-orange-400 hover:bg-opacity-20 rounded-lg transition-colors"
//                         title={showBalance ? "Hide balance" : "Show balance"}
//                       >
//                         {showBalance ? (
//                           <EyeOff className="w-5 h-5" />
//                         ) : (
//                           <Eye className="w-5 h-5" />
//                         )}
//                       </button>
//                     </div>
//                   </div>
//                   <Wallet className="w-16 h-16 opacity-20" />
//                 </div>
//               </div>

//               {/* User Details */}
//               <div className="p-6">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div className="space-y-4">
//                     <div className="flex items-center py-3 border-b border-gray-100">
//                       <span className="font-medium text-gray-600">
//                         First Name:&nbsp;
//                       </span>
//                       <span className="font-semibold text-gray-800">
//                         {user?.firstName}
//                       </span>
//                     </div>

//                     <div className="flex items-center py-3 border-b border-gray-100">
//                       <span className="font-medium text-gray-600">
//                         Last Name:&nbsp;
//                       </span>
//                       <span className="font-semibold text-gray-800">
//                         {user?.lastName}
//                       </span>
//                     </div>

//                     <div className="flex items-center py-3 border-b border-gray-100">
//                       <span className="font-medium text-gray-600">
//                         Email:&nbsp;
//                       </span>
//                       <span className="font-semibold text-gray-800 text-sm">
//                         {user?.email}
//                       </span>
//                     </div>
//                   </div>

//                   <div className="space-y-4">
//                     <div className="flex items-center py-3 border-b border-gray-100">
//                       <span className="font-medium text-gray-600">
//                         Contact No.:&nbsp;
//                       </span>
//                       <span className="font-semibold text-gray-800">
//                         {user?.contactNo}
//                       </span>
//                     </div>

//                     <div className="flex items-center py-3 border-b border-gray-100">
//                       <span className="font-medium text-gray-600">
//                         Identity:&nbsp;
//                       </span>
//                       <span className="font-semibold text-gray-800">
//                         {user?.identification}
//                       </span>
//                     </div>

//                     <div className="flex items-center py-3 border-b border-gray-100">
//                       <span className="font-medium text-gray-600">
//                         Id Number:&nbsp;
//                       </span>
//                       <span className="font-semibold text-gray-800">
//                         {user?.identificationNumber}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Quick Actions */}
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// }
