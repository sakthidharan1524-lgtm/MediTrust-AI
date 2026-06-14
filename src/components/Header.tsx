import React, { useState } from "react";
import { Shield, Activity, Search, ShieldCheck, BadgeCheck, HeartPulse, ShoppingCart, User, Headphones, MoreVertical, LogOut, Ticket, Heart, Settings, HelpCircle, X, MessageSquare, Send } from "lucide-react";
import { useStore } from "../store";

export default function Header() {
  const { navigate, user, cart, searchTerm, setSearchTerm, logout, activePage } = useStore();
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportMessage, setSupportMessage] = useState("");
  const [chatLog, setChatLog] = useState<{ sender: "user" | "bot"; text: string }[]>([
    { sender: "bot", text: "Hello! Welcome to MediTrust AI Support. How can we assist you with medicine verifications or order pickups today?" }
  ]);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleSupportSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportMessage.trim()) return;

    setChatLog((prev) => [...prev, { sender: "user", text: supportMessage }]);
    const currentMsg = supportMessage.toLowerCase();
    setSupportMessage("");

    setTimeout(() => {
      let reply = "Our support team is reviewing your query. If you uploaded a prescription under Cart, our automated AI engine is currently validating doctor licenses.";
      if (currentMsg.includes("verify") || currentMsg.includes("authentic")) {
        reply = "To check medicine package validity: Go to the 'Verify Package' tab from the upper menu. Upload photos of the front box, rear back packaging, and barcode. Our Gemini visual inspector checks typographic alignments in real-time.";
      } else if (currentMsg.includes("pickup") || currentMsg.includes("nearby") || currentMsg.includes("offline")) {
        reply = "To purchase from offline shops: Click 'Nearby Shops' from the homepage, search by pin-code, and choose 'Buy from Shop'. You can pick it up locally using a QR code.";
      } else if (currentMsg.includes("prescription") || currentMsg.includes("doctor")) {
        reply = "Our AI prescription scanning extracts Doctor registration credentials instantly. Upload JPEG or PNG files in the Cart checkout screen to unlock order placement.";
      }

      setChatLog((prev) => [...prev, { sender: "bot", text: reply }]);
    }, 1000);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white shadow-sm border-b border-gray-100">
      {/* Upper Brand Promo Marquee with SDG 3 message */}
      <div className="w-full bg-[#0D7377] text-white py-1.5 px-4 text-center text-xs font-medium tracking-wide">
        🌟 SDGs Goals Core Alliance: Supporting **UN SDG 3: Good Health & Well-Being** with 100% genuine medicine audits.
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Logo */}
          <div 
            onClick={() => { navigate("home"); setSearchTerm(""); }}
            className="flex items-center gap-3 cursor-pointer shrink-0 group"
          >
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-[#0D7377] to-[#14919B] text-white shadow-md shadow-teal-900/10 transition-transform duration-200 group-hover:scale-105">
              <Shield className="w-6 h-6 absolute" />
              <Activity className="w-4 h-4 text-[#FF6B6B] opacity-90 animate-pulse relative -top-0.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-[#0D7377] to-[#14919B] bg-clip-text text-transparent">
                MediTrust AI
              </span>
              <span className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider">
                SDG 3 Certified
              </span>
            </div>
          </div>

          {/* Large Search Bar (approx 55-60% width) */}
          <div className="flex-1 max-w-2xl relative">
            <div className="relative group">
              <input
                type="text"
                placeholder="Search medicines, brands, symptoms, or active ingredients..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (searchTerm.trim() !== "" && !["search"].includes(activePage)) {
                    navigate("search");
                  }
                }}
                onClick={() => {
                  if (activePage !== "search") navigate("search");
                }}
                className="w-full h-12 pl-12 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-[#212121] placeholder-gray-400 focus:outline-none focus:border-[#0D7377] focus:bg-white focus:ring-4 focus:ring-teal-700/5 transition-all duration-200"
              />
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400 group-focus-within:text-[#0D7377] transition-colors" />
              
              {/* Reset Search X */}
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm("")}
                  className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Action Icons Panel */}
          <div className="flex items-center gap-1 sm:gap-4 shrink-0">
            
            {/* User Login state */}
            {user ? (
              <button 
                onClick={() => navigate("orders")}
                className="flex flex-col items-center justify-center p-2 text-gray-600 hover:text-[#0D7377] rounded-lg transition-colors group"
                title={`Logged in as ${user.name}`}
              >
                <div className="w-8 h-8 rounded-full bg-teal-55 text-[#0D7377] flex items-center justify-center font-bold text-xs border border-teal-200 text-center uppercase">
                  {user.name.charAt(0)}
                </div>
                <span className="text-[10px] font-medium text-gray-500 mt-0.5 max-w-[64px] truncate text-center">
                  Account
                </span>
              </button>
            ) : (
              <button 
                onClick={() => navigate("login")}
                className="flex flex-col items-center justify-center p-2 text-gray-600 hover:text-[#0D7377] rounded-lg transition-colors group"
              >
                <User className="w-5 h-5 group-hover:scale-105 transition-transform" />
                <span className="text-[10px] font-medium text-gray-500 mt-0.5">Login</span>
              </button>
            )}

            {/* Support */}
            <button 
              onClick={() => setShowSupportModal(true)}
              className="flex flex-col items-center justify-center p-2 text-gray-600 hover:text-[#0D7377] rounded-lg transition-colors group"
            >
              <Headphones className="w-5 h-5 group-hover:scale-105 transition-transform" />
              <span className="text-[10px] font-medium text-gray-500 mt-0.5">Support</span>
            </button>

            {/* Cart with count badge */}
            <button 
              onClick={() => navigate("cart")}
              className="flex flex-col items-center justify-center p-2 text-gray-600 hover:text-[#0D7377] relative rounded-lg transition-colors group"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5 group-hover:scale-105 transition-transform" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-[#FF6B6B] text-white text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border border-white animate-pulse">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium text-gray-500 mt-0.5">Cart</span>
            </button>

            {/* Vertical Dot More Menu */}
            <div className="relative">
              <button 
                onClick={() => setShowMoreMenu(!showMoreMenu)}
                className={`p-2 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors focus:ring-2 focus:ring-teal-700/10 ${showMoreMenu ? 'bg-gray-100 text-gray-800' : ''}`}
              >
                <MoreVertical className="w-5 h-5" />
              </button>

              {/* Dropdown Menu */}
              {showMoreMenu && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setShowMoreMenu(false)} />
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-gray-100 shadow-xl overflow-hidden z-40 transform origin-top-right transition-all">
                    <div className="py-2.5">
                      <button 
                        onClick={() => { navigate("orders"); setShowMoreMenu(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                      >
                        <Ticket className="w-4 h-4 text-[#0D7377]" />
                        <span>Order History</span>
                      </button>
                      <button 
                        onClick={() => { navigate("verify"); setShowMoreMenu(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                      >
                        <ShieldCheck className="w-4 h-4 text-[#0D7377]" />
                        <span>Authenticity Audit</span>
                      </button>
                      <button 
                        onClick={() => { navigate("nearby"); setShowMoreMenu(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                      >
                        <HeartPulse className="w-4 h-4 text-[#FF6B6B]" />
                        <span>Offline Pharmacy Map</span>
                      </button>
                      <button 
                        onClick={() => { navigate("consult"); setShowMoreMenu(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                      >
                        <Headphones className="w-4 h-4 text-[#14919B]" />
                        <span>Consult Online</span>
                      </button>
                      <button 
                        onClick={() => { navigate("trainer"); setShowMoreMenu(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                      >
                        <Activity className="w-4 h-4 text-[#14919B]" />
                        <span>Rehab AI Trainer</span>
                      </button>
                      <button 
                        onClick={() => { navigate("originality"); setShowMoreMenu(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                      >
                        <BadgeCheck className="w-4 h-4 text-[#14919B]" />
                        <span>Originality Check</span>
                      </button>
                      
                      <hr className="my-1 border-gray-100" />
                      
                      {user && (
                        <button 
                          onClick={() => { logout(); setShowMoreMenu(false); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

          </div>

        </div>
      </div>

      {/* Support Chat Overlay Modal */}
      {showSupportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 flex flex-col h-[480px]">
            {/* Header */}
            <div className="bg-[#0D7377] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">MediTrust Interactive Care</h3>
                  <p className="text-[10px] text-teal-100 font-medium">Auto-Scanning assistance</p>
                </div>
              </div>
              <button 
                onClick={() => setShowSupportModal(false)}
                className="text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-gray-50">
              {chatLog.map((chat, idx) => (
                <div 
                  key={idx} 
                  className={`flex ${chat.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[80%] rounded-xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    chat.sender === "user" 
                      ? "bg-[#0D7377] text-white rounded-br-none" 
                      : "bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-none"
                  }`}>
                    {chat.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer Form */}
            <form onSubmit={handleSupportSend} className="p-3 border-t border-gray-100 bg-white flex gap-2">
              <input 
                type="text" 
                placeholder="Type your medicine or checkout query..." 
                value={supportMessage}
                onChange={(e) => setSupportMessage(e.target.value)}
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-[#0D7377] bg-gray-50 focus:bg-white transition-all"
              />
              <button 
                type="submit" 
                className="p-2.5 bg-[#0D7377] text-white rounded-xl hover:bg-[#14919B] transition-colors relative"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

    </header>
  );
}
