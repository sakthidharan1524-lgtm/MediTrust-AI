import React, { useState } from "react";
import { ChevronRight, Star, Shield, Truck, Minus, Plus, Heart, HelpCircle, ShoppingCart, ArrowRight, ShieldCheck, RefreshCw, Layers } from "lucide-react";
import { useStore } from "../store";

export default function MedicineDetailPage() {
  const { selectedId, medicines, navigate, addToCart } = useStore();
  const [activeTab, setActiveTab] = useState<"description" | "salts" | "dosage" | "side_effects" | "reviews">("description");
  const [qty, setQty] = useState(1);
  const [pincode, setPincode] = useState("560001");
  const [pincodeCheckResult, setPincodeCheckResult] = useState<string | null>("Delivery by Tomorrow | Express Free Care");

  // Find targeted product
  const medicine = medicines.find((m) => m.id === selectedId) || medicines[0];

  if (!medicine) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-gray-500">
        Medicine Detail unavailable. Select another product from the search grid.
      </div>
    );
  }

  // Quick pincode shipping validation simulation
  const handlePincodeCheck = () => {
    if (!pincode.trim() || pincode.length < 6) {
      setPincodeCheckResult("Please enter a valid 6-digit pin");
      return;
    }
    const isExpress = pincode.startsWith("560"); // Bengalurus
    setPincodeCheckResult(isExpress ? "Delivery by Tomorrow, 10 AM | Express Delivery Free" : "Delivery in 2-3 Days | Standard Shipping");
  };

  // Frequently bought together bundle simulation
  const frequentlyBought = medicines.filter((m) => m.id !== medicine.id).slice(0, 3);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12 bg-[#F8F9FA]" id="detail-view">
      
      {/* 1. Breadcrumb navigation */}
      <nav className="flex items-center gap-2 text-xs text-gray-400 font-semibold uppercase tracking-wider">
        <button onClick={() => navigate("home")} className="hover:text-[#0D7377] transition-colors">Home</button>
        <ChevronRight className="w-3.5 h-3.5" />
        <button onClick={() => { navigate("search"); }} className="hover:text-[#0D7377] transition-colors">{medicine.category}</button>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-600 truncate">{medicine.name}</span>
      </nav>

      {/* 2. Primary Product Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-white border border-gray-100 rounded-2xl p-6 md:p-10 shadow-sm">
        
        {/* Left pane: Image Gallery */}
        <div className="space-y-6">
          <div className="h-96 w-full bg-gray-50 flex items-center justify-center p-8 rounded-xl border border-gray-50 relative group select-none">
            <img
              src={medicine.images[0]}
              alt={medicine.name}
              className="max-h-full max-w-full object-contain cursor-zoom-in transition-transform duration-300 hover:scale-105"
            />
            
            {/* Trust rating circle badge inside main hero card */}
            <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm border border-teal-200 rounded-xl p-3 shadow-md shadow-teal-900/5 text-center flex flex-col items-center shrink-0">
              <span className="text-[9px] uppercase font-bold text-gray-400">Trust rating</span>
              <div className="relative flex items-center justify-center w-12 h-12 mt-1 font-black text-[#0D7377] text-sm rounded-full border-4 border-teal-50 bg-teal-50/50">
                {medicine.trust_score}
              </div>
              <span className="text-[9px] font-bold text-[#0D7377] mt-1">Excellent</span>
            </div>
          </div>
        </div>

        {/* Right pane: Product Details info */}
        <div className="space-y-6">
          <div className="space-y-2">
            <span className="text-xs uppercase font-extrabold text-[#0D7377] tracking-widest block bg-teal-50 rounded px-2 py-0.5 w-fit">
              {medicine.brand} Manufacturer
            </span>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight leading-tight">
              {medicine.name}
            </h1>
            <p className="text-xs text-[#0D7377] font-semibold flex items-center gap-1">
              <Layers className="w-4 h-4" /> Active Salt: {medicine.composition}
            </p>
            <p className="text-xs text-gray-400">Dosage Form: {medicine.type} | Packed size: {medicine.pack_size}</p>
          </div>

          <hr className="border-gray-100" />

          {/* Prescription Required warning panel */}
          {medicine.requires_prescription && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start gap-3">
              <Shield className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-xs font-extrabold text-orange-850 uppercase tracking-wider">
                  Prescription Checklist Required
                </h4>
                <p className="text-[11px] text-orange-700/90 leading-relaxed">
                  This medication is classified as Schedule H and requires a valid physician stamp prescription to proceed with shipment from checkout. Add to cart to open our instant scan camera.
                </p>
              </div>
            </div>
          )}

          {/* Price Block */}
          <div className="space-y-2">
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-black text-gray-900">₹{medicine.price}</span>
              <span className="text-sm text-gray-400 line-through font-semibold">MRP ₹{medicine.mrp}</span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 rounded px-2 py-0.5">{medicine.discount_pct}% OFF</span>
            </div>
            <p className="text-[10px] font-semibold text-emerald-600">
              🎉 Smart Savings Guaranteed: You save ₹{medicine.mrp - medicine.price} per item order.
            </p>
          </div>

          {/* Delivery pincode checker */}
          <div className="space-y-2.5 p-4 bg-gray-50 border border-gray-100 rounded-xl">
            <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block">
              Shipment Availability Check
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Truck className="absolute left-3.5 top-2.5 w-4.5 h-4.5 text-gray-400" />
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Enter 6-digit Pincode"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                  className="w-full text-xs bg-white border border-gray-200 rounded-lg pl-10 pr-3 py-2.5 focus:outline-none focus:border-[#0D7377]"
                />
              </div>
              <button
                onClick={handlePincodeCheck}
                className="px-4 bg-[#0D7377] hover:bg-[#14919B] text-white font-bold text-xs rounded-lg transition-colors uppercase tracking-wider"
              >
                Check
              </button>
            </div>
            {pincodeCheckResult && (
              <p className={`text-[10px] font-bold ${pincodeCheckResult.includes("valid") ? "text-red-500" : "text-emerald-600"}`}>
                {pincodeCheckResult}
              </p>
            )}
          </div>

          {/* Quantity selector and Purchase buttons */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-gray-500 uppercase">Quantity:</span>
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="px-3 py-2 text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-4 text-xs font-bold text-gray-700">{qty}</span>
                <button
                  onClick={() => setQty(qty + 1)}
                  className="px-3 py-2 text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => { addToCart(medicine.id, qty); navigate("cart"); }}
                className="flex-1 py-3 bg-[#0D7377] hover:bg-[#14919B] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-teal-900/10 flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-4 h-4" /> Add to Shopping Cart
              </button>
              <button
                onClick={() => { addToCart(medicine.id, qty); navigate("cart"); }}
                className="flex-1 py-3 border border-[#0D7377] hover:bg-teal-50 text-[#0D7377] font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1"
              >
                Buy Selected Now <ArrowRight className="w-4 h-4 ml-1.5" />
              </button>
            </div>
          </div>

          {/* Trust assurances badges */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-50 text-center text-gray-400 text-[10px] font-bold uppercase tracking-wider">
            <div className="space-y-1.5 flex flex-col items-center">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>100% Genuine</span>
            </div>
            <div className="space-y-1.5 flex flex-col items-center border-x border-gray-100">
              <Truck className="w-5 h-5 text-[#0D7377]" />
              <span>Free Delivery</span>
            </div>
            <div className="space-y-1.5 flex flex-col items-center">
              <RefreshCw className="w-5 h-5 text-[#14919B]" />
              <span>Smart Return</span>
            </div>
          </div>

        </div>

      </div>

      {/* 3. Bottom Information Tabs */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden" id="info-tabs">
        <div className="flex border-b border-gray-100 bg-gray-50/50 overflow-x-auto no-scrollbar select-none">
          {([
            { id: "description", label: "Product Info" },
            { id: "salts", label: "Active salts / Composition" },
            { id: "dosage", label: "Usage & Dosage" },
            { id: "side_effects", label: "Warnings & Side Effects" },
            { id: "reviews", label: `User Reviews (${medicine.review_count})` }
          ] as const).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 text-xs font-bold uppercase tracking-wider border-b-2 whitespace-nowrap transition-colors ${activeTab === tab.id ? "border-[#0D7377] text-[#0D7377] bg-white" : "border-transparent text-gray-400 hover:text-gray-750"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6 md:p-8 text-xs text-gray-600 leading-relaxed space-y-4">
          
          {activeTab === "description" && (
            <div className="space-y-4">
              <h3 className="font-extrabold text-[#212121] uppercase text-sm">Product Description</h3>
              <p>
                {medicine.name} manufactured by {medicine.brand} is widely prescribed for symptoms associated with various conditions under category &quot;{medicine.category}&quot;. Built within WHO-GMP certified laboratories, each formulation batches undergoes standard quality verification tests.
              </p>
              <p>
                The molecular composition focuses on targeting specific therapeutic pathways, delivering reliable relief profiles while maintaining safety thresholds. Under WHO-GMP core regulations, package structures feature holographic micro-security elements to reduce counterfeiting impacts.
              </p>
            </div>
          )}

          {activeTab === "salts" && (
            <div className="space-y-4">
              <h3 className="font-extrabold text-[#212121] uppercase text-sm">SALT COMPOSITION ANALYTICS</h3>
              <div className="p-4 bg-teal-50 border border-teal-100 rounded-xl">
                <span className="text-xs font-bold text-[#0D7377] uppercase block">Extract Chemical Value:</span>
                <p className="mt-1 font-semibold text-[#212121]">{medicine.composition}</p>
                <p className="mt-2 text-[11px] text-teal-800 leading-relaxed">
                  Synthesized focusing on maximum bioavailability, the active compound is formulated to provide an optimal therapeutic index.
                </p>
              </div>
            </div>
          )}

          {activeTab === "dosage" && (
            <div className="space-y-4">
              <h3 className="font-extrabold text-[#212121] uppercase text-sm">INSTRUCTIONS FOR CONSUMPTION</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li>Take this medication in the dose and duration as advised by your medical practitioner or clinical specialist.</li>
                <li>Consume tablets whole without chewing or crushing them.</li>
                <li>Can be consumed with or without meals, but maintaining a stable daily timer is recommended.</li>
                <li>Store cool inside structural packaging blocks, away from direct sunlight bounds and children.</li>
              </ul>
            </div>
          )}

          {activeTab === "side_effects" && (
            <div className="space-y-4">
              <h3 className="font-extrabold text-[#212121] uppercase text-sm">Warning Signals & Side Effects Checklists</h3>
              <p>Most common side effects do not require clinical attention and fade naturally as the body adapts to the drug dosage:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Nausea or slight dizziness.</li>
                <li>Temporary headache or minor fatigue symptoms on initial days.</li>
              </ul>
              <div className="p-4 bg-red-50 border border-red-150 rounded-xl text-[#FF6B6B]">
                <span className="font-extrabold text-xs block text-[#FF6B6B] uppercase">Schedule Warning:</span>
                <p className="mt-1 text-[11px] leading-relaxed text-red-700 font-medium">
                  If severe hives, swelling of faces, extreme drowsiness, or respiratory distress develops, immediately suspend usage and consult your physician.
                </p>
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
            <div className="space-y-6">
              <div className="flex items-center gap-6 p-4 border border-gray-100 rounded-xl bg-gray-50/50 max-w-md">
                <div className="text-center space-y-1">
                  <span className="text-3xl font-black text-gray-900">{medicine.rating}</span>
                  <div className="flex items-center justify-center text-amber-500">
                    <Star className="w-4 h-4 fill-amber-500 stroke-amber-500" />
                    <Star className="w-4 h-4 fill-amber-500 stroke-amber-500" />
                    <Star className="w-4 h-4 fill-amber-500 stroke-amber-500" />
                    <Star className="w-4 h-4 fill-amber-500 stroke-amber-500" />
                    <Star className="w-4 h-4 fill-amber-500/30 stroke-amber-500" />
                  </div>
                  <span className="text-[10px] text-gray-400 font-medium block">Out of 5 stars</span>
                </div>
                <div className="flex-1 text-[10px] space-y-1.5 text-gray-500 font-bold">
                  <div className="flex items-center gap-2"><span>5 Star:</span><div className="flex-1 bg-gray-250 h-1.5 rounded-full overflow-hidden"><div className="bg-[#0D7377] h-full w-[85%]"></div></div><span>85%</span></div>
                  <div className="flex items-center gap-2"><span>4 Star:</span><div className="flex-1 bg-gray-250 h-1.5 rounded-full overflow-hidden"><div className="bg-[#0D7377] h-full w-[10%]"></div></div><span>10%</span></div>
                  <div className="flex items-center gap-2"><span>3 Star:</span><div className="flex-1 bg-gray-250 h-1.5 rounded-full overflow-hidden"><div className="bg-[#0D7377] h-full w-[5%]"></div></div><span>5%</span></div>
                </div>
              </div>

              {/* Individual Mock review blocks */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div className="space-y-1 bg-white p-4 rounded-xl border border-gray-50 shadow-sm max-w-2xl">
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-xs text-gray-900">Sakthidharan</span>
                    <span className="text-[10px] text-gray-400">14 May 2026</span>
                  </div>
                  <div className="flex text-amber-500"><Star className="w-3.5 h-3.5 fill-current" /><Star className="w-3.5 h-3.5 fill-current" /><Star className="w-3.5 h-3.5 fill-current" /><Star className="w-3.5 h-3.5 fill-current" /><Star className="w-3.5 h-3.5 fill-current" /></div>
                  <p className="text-[11px] text-gray-500 leading-relaxed pt-1">
                    Verified quality checks. Received package within 20 hrs with QR authenticity sticker intact. Extremely happy.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* 4. Frequently Bought Together strip */}
      <section className="space-y-6">
        <h3 className="text-base font-extrabold text-gray-900 uppercase tracking-wide">
          Frequently Bought Together Packages
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {frequentlyBought.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-all cursor-pointer"
              onClick={() => navigate("medicine", item.id)}
            >
              <div className="w-16 h-16 bg-gray-50 rounded p-1 shrink-0 flex items-center justify-center">
                <img
                  src={item.images[0]}
                  alt={item.name}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <h4 className="text-xs font-bold text-gray-800 truncate">{item.name}</h4>
                <p className="text-[10px] text-[#0D7377] font-semibold">{item.brand}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-gray-900">₹{item.price}</span>
                  <span className="text-[10px] text-gray-400 line-through">₹{item.mrp}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
