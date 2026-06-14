import React, { useState, useMemo } from "react";
import { Compass, Search, MapPin, BadgeCheck, Phone, CheckCircle2, Navigation, ArrowRight, ShieldCheck, X, Clock, HelpCircle, UserCheck } from "lucide-react";
import { useStore } from "../store";
import { Pharmacy, Medicine } from "../types";

export default function NearbyPage() {
  const { 
    navigate, 
    pharmacies, 
    medicines, 
    selectedId, // Selected Pharmacy ID if navigating directly
    coords, 
    requestLocation,
    addToCart,
    setCartOrderType
  } = useStore();

  const [searchPin, setSearchPin] = useState("560001");
  const [activeShopId, setActiveShopId] = useState<string | null>(selectedId || null);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  
  // Inventory check modal sliding panel state
  const [inventoryShop, setInventoryShop] = useState<Pharmacy | null>(null);
  const [inventorySearch, setInventorySearch] = useState("");
  const [pickupConfirmed, setPickupConfirmed] = useState<string | null>(null);

  // Toggle filter tags
  const handlePillToggle = (filterTag: string) => {
    setActiveFilters((prev) =>
      prev.includes(filterTag)
        ? prev.filter((t) => t !== filterTag)
        : [...prev, filterTag]
    );
  };

  // Filter pharmacies lists dynamically
  const filteredPharmacies = useMemo(() => {
    let list = [...pharmacies];

    if (activeFilters.includes("24/7")) {
      list = list.filter((p) => p.hours.includes("00:00-24:00"));
    }
    if (activeFilters.includes("delivery")) {
      list = list.filter((p) => p.has_delivery);
    }
    if (activeFilters.includes("trust")) {
      list = list.filter((p) => p.trust_score >= 95);
    }
    if (activeFilters.includes("2km")) {
      list = list.filter((p) => p.distance <= 2);
    }

    return list;
  }, [pharmacies, activeFilters]);

  // Selected or nearest active pharmacy for popup highlights
  const activePharmacy = useMemo(() => {
    if (activeShopId) {
      return pharmacies.find((p) => p.id === activeShopId) || pharmacies[0];
    }
    return filteredPharmacies[0] || pharmacies[0];
  }, [activeShopId, filteredPharmacies, pharmacies]);

  // Available medicines specifically mapped conceptually to current pharmacy
  const shopInventory = useMemo(() => {
    if (!inventoryShop) return [];
    // Filter medicines that conceptually are at this store or scattered
    return medicines.filter((m) => {
      const matchesSearch = m.name.toLowerCase().includes(inventorySearch.toLowerCase()) || 
                            m.composition.toLowerCase().includes(inventorySearch.toLowerCase());
      return matchesSearch;
    });
  }, [inventoryShop, medicines, inventorySearch]);

  const triggerReserveForPickup = (shopName: string) => {
    const randomCode = "MT-PK-" + Math.floor(1000 + Math.random() * 9000);
    setPickupConfirmed(randomCode);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col h-[85vh]" id="nearby-view">
      
      {/* 1. Header Filters block */}
      <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm space-y-4 shrink-0 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h1 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <Compass className="w-5.5 h-5.5 text-[#0D7377]" /> Offline Pharmacy GPS Map Finder
            </h1>
            <p className="text-xs text-gray-550">
              Locate operating storefronts, find real-time local shelf inventory, and lock QR pickup code orders.
            </p>
          </div>

          {/* Quick inputs */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <MapPin className="absolute left-3 top-2.5 w-4.5 h-4.5 text-gray-400" />
              <input
                type="text"
                placeholder="Enter area or Pincode"
                value={searchPin}
                onChange={(e) => setSearchPin(e.target.value.replace(/\D/g, ""))}
                className="text-xs border border-gray-200 rounded-lg pl-9 pr-3 py-2 bg-gray-50 focus:bg-white focus:outline-none focus:border-[#0D7377]"
              />
            </div>
            <button
              onClick={requestLocation}
              className="px-4 py-2 bg-[#0D7377] hover:bg-[#14919B] text-white font-bold text-xs rounded-lg transition-colors uppercase tracking-wider flex items-center gap-1 shrink-0"
            >
              GPS Sync
            </button>
          </div>
        </div>

        {/* Filter Pills list */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-gray-50 text-[10px]">
          <span className="font-extrabold text-[#212121] uppercase">Filter Pills:</span>
          {([
            { id: "all", label: "Open Now" },
            { id: "24/7", label: "24/7 Emergency Stores" },
            { id: "delivery", label: "Home Delivery Available" },
            { id: "trust", label: "Trust Score 95+ Excellent" },
            { id: "2km", label: "Under 2 km distance" }
          ] as const).map((pill) => {
            const isAct = pill.id === "all" ? activeFilters.length === 0 : activeFilters.includes(pill.id);
            return (
              <button
                key={pill.id}
                onClick={() => pill.id === "all" ? setActiveFilters([]) : handlePillToggle(pill.id)}
                className={`px-3 py-1.5 rounded-full border font-bold transition-all ${isAct ? "bg-[#0D7377] text-white border-[#0D7377] shadow-sm" : "bg-gray-50 border-gray-100 text-gray-500 hover:bg-gray-100"}`}
              >
                {pill.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. SPLIT VIEWPORT MAP GRID */}
      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* LEFT VIEW: Map canvas (60% Width) */}
        <div className="lg:col-span-3 bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm relative flex flex-col min-h-[300px]">
          
          {/* MAP CANVAS GRIDBACKDROP */}
          <div className="flex-1 relative bg-slate-50 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-80"></div>
            
            {/* Center pulsing GPS representing user location */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
              <div className="w-5 h-5 bg-sky-500 rounded-full border-2 border-white ring-8 ring-sky-400/20 animate-ping absolute"></div>
              <div className="w-5 h-5 bg-sky-500 rounded-full border-2 border-white relative z-10 shadow-md"></div>
              <span className="text-[9px] font-extrabold text-sky-800 bg-sky-50 border border-sky-300 rounded-full px-2.5 py-0.5 mt-1.5 z-10 shadow-sm whitespace-nowrap">
                Current Position GPS
              </span>
            </div>

            {/* Pharmacies floating active pins */}
            {filteredPharmacies.map((p, idx) => {
              const isActive = p.id === activePharmacy?.id;
              // Absolute positions offsets
              const topOffset = idx === 0 ? "25%" : idx === 1 ? "75%" : idx === 2 ? "35%" : "70%";
              const leftOffset = idx === 0 ? "20%" : idx === 1 ? "80%" : idx === 2 ? "70%" : "30%";
              
              return (
                <div
                  key={p.id}
                  onClick={() => setActiveShopId(p.id)}
                  className="absolute cursor-pointer transition-transform duration-200 z-20 group"
                  style={{ top: topOffset, left: leftOffset }}
                >
                  <div className={`flex flex-col items-center ${isActive ? "scale-110" : "hover:scale-105"}`}>
                    <MapPin className={`w-8 h-8 filter drop-shadow-sm ${isActive ? "text-[#0D7377]" : "text-gray-400"}`} />
                    <span className={`text-[9px] font-extrabold rounded-lg px-2 py-0.5 border shadow-sm ${isActive ? "bg-[#0D7377] text-white border-[#0D7377]" : "bg-white text-gray-700 border-gray-100"}`}>
                      {p.name.split(" ")[0]} ({p.distance}km)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Persistent Selected Map Pin Details popup over mapping */}
          {activePharmacy && (
            <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-xl p-4 border border-teal-200 shadow-xl max-w-sm z-30 transition-all">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="font-extrabold text-sm text-gray-900">{activePharmacy.name}</h3>
                    <span className="bg-teal-50 text-emerald-700 border border-emerald-200 rounded px-1.5 py-0.5 text-[8px] font-bold">
                      Verified Shop
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-1">{activePharmacy.address}</p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-black text-[#0D7377] bg-teal-50 rounded px-2.5 py-1 block">
                    Trust {activePharmacy.trust_score}%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-gray-50 pt-3 mt-3">
                <span className="text-[10px] text-gray-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-gray-400" /> Open: {activePharmacy.hours}
                </span>
                <span className="text-[10px] font-bold text-gray-600">
                  Phone: {activePharmacy.phone}
                </span>
              </div>
            </div>
          )}

        </div>

        {/* RIGHT VIEW: Sidebar Lists (40% Width) */}
        <div className="lg:col-span-2 overflow-y-auto no-scrollbar max-h-full space-y-4">
          <div className="sticky top-0 bg-[#F8F9FA] pb-2 z-10">
            <span className="text-[10px] uppercase font-extrabold text-gray-400 tracking-wider">
              Offline Stores Sorted Nearest First:
            </span>
          </div>

          {filteredPharmacies.map((pharm) => {
            const isAct = pharm.id === activePharmacy?.id;
            return (
              <div
                key={pharm.id}
                onClick={() => setActiveShopId(pharm.id)}
                className={`bg-white rounded-2xl p-4 shadow-sm border cursor-pointer hover:shadow-md transition-all space-y-3 ${isAct ? "border-[#0D7377]" : "border-gray-100"}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm text-gray-900 truncate">{pharm.name}</h3>
                    <p className="text-[11px] text-gray-400 line-clamp-1">{pharm.address}</p>
                  </div>
                  <span className="text-xs font-black text-gray-800 shrink-0 whitespace-nowrap bg-gray-50 border rounded-lg px-2.5 py-1">
                    {pharm.distance} km
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 text-[9px] font-bold text-gray-400 uppercase">
                  <span className="bg-teal-50 text-emerald-700 border border-emerald-100 rounded px-2 py-0.5">
                    Ratings: {pharm.ratings}★
                  </span>
                  {pharm.has_delivery && (
                    <span className="bg-sky-50 text-sky-700 border border-sky-100 rounded px-2 py-0.5">
                      Delhivery Active
                    </span>
                  )}
                  {pharm.hours && (
                    <span className="bg-gray-50 border border-gray-100 rounded px-2 py-0.5">
                      Hrs: {pharm.hours}
                    </span>
                  )}
                </div>

                {/* Card Footers Buttons */}
                <div className="flex items-center gap-2 pt-2 border-t border-gray-50">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      alert(`Get Directions: Fetching maps API routing coordinate path to ${pharm.address}`);
                    }}
                    className="flex-1 py-2 bg-gray-50 hover:bg-gray-100 text-[#212121] font-bold text-[10px] uppercase rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    <Navigation className="w-3.5 h-3.5 text-[#0D7377]" /> Directions
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setInventoryShop(pharm);
                    }}
                    className="flex-1 py-2 bg-[#0D7377] hover:bg-[#14919B] text-white font-bold text-[10px] uppercase rounded-lg transition-colors flex items-center justify-center gap-1"
                  >
                    Buy from Shop
                  </button>
                </div>

              </div>
            );
          })}
        </div>

      </div>

      {/* 3. LOCAL INVENTORY CHECK PANEL (Slide over Modal) */}
      {inventoryShop && (
        <div className="fixed inset-0 z-50 flex items-center justify-end p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 h-[640px] flex flex-col">
            
            {/* Header info */}
            <div className="bg-[#0D7377] text-white p-5 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-teal-100 tracking-wider">
                  Store inventory audit checker
                </span>
                <h3 className="font-extrabold text-sm mt-0.5">{inventoryShop.name} Shelf STOCK-IN</h3>
              </div>
              <button 
                onClick={() => { setInventoryShop(null); setPickupConfirmed(null); }}
                className="text-teal-100 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Inventory controls search */}
            <div className="p-4 border-b border-gray-50 space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4.5 h-4.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Query current shelf active items..."
                  value={inventorySearch}
                  onChange={(e) => setInventorySearch(e.target.value)}
                  className="w-full text-xs border border-gray-200 pl-9 pr-3 py-2.5 bg-gray-50 rounded-lg focus:outline-none"
                />
              </div>
            </div>

            {/* Shelf listing details */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
              {pickupConfirmed ? (
                /* PICKUP RESERVATION QR CODE STATUS SUCCESS */
                <div className="py-8 text-center space-y-4 max-w-xs mx-auto">
                  <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100">
                    <UserCheck className="w-8 h-8" />
                  </div>
                  <h4 className="font-black text-gray-900 text-sm">Walk-In Pickup Reserved!</h4>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    Show this verified transaction QR checker path inside the pharmacy cashier counter to pay and checkout.
                  </p>
                  
                  {/* Mock QR Code display vectors frame */}
                  <div className="bg-white p-4 border rounded-xl w-44 h-44 flex items-center justify-center mx-auto shadow-sm">
                    {/* Retro QR mock pixel checker */}
                    <div className="w-36 h-36 border-4 border-gray-900 grid grid-cols-4 gap-1 p-1 bg-white">
                      <div className="bg-gray-950"></div><div className="bg-gray-150"></div><div className="bg-gray-950"></div><div className="bg-gray-950"></div>
                      <div className="bg-gray-150"></div><div className="bg-gray-950"></div><div className="bg-gray-150"></div><div className="bg-gray-150"></div>
                      <div className="bg-gray-950"></div><div className="bg-gray-150"></div><div className="bg-gray-950"></div><div className="bg-gray-950"></div>
                      <div className="bg-gray-950"></div><div className="bg-gray-950 font-bold flex items-center justify-center text-[10px] text-white">Verified</div><div className="bg-gray-150"></div><div className="bg-gray-950"></div>
                    </div>
                  </div>

                  <p className="text-xs font-black text-[#0D7377] select-all bg-teal-50 px-2 py-1.5 rounded">{pickupConfirmed}</p>
                </div>
              ) : shopInventory.length > 0 ? (
                shopInventory.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white border rounded-xl p-3 flex items-center justify-between gap-3 shadow-sm"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-11 h-11 bg-gray-50 p-1 flex items-center justify-center border rounded shrink-0">
                        <img src={item.images[0]} alt={item.name} className="max-h-full max-w-full object-contain" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-[11px] text-gray-900">{item.name}</h4>
                        <p className="text-[9px] text-[#0D7377] font-semibold">{item.brand} | In Stock: {item.stock}</p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => {
                        setCartOrderType("pickup", inventoryShop.id);
                        addToCart(item.id, 1);
                        triggerReserveForPickup(inventoryShop.name);
                      }}
                      className="px-2.5 py-1.5 bg-[#0D7377] hover:bg-[#14919B] text-white font-extrabold text-[9px] uppercase rounded-lg transition-colors flex items-center gap-1"
                    >
                      Reserve <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-400 text-xs">No matching medicines found on shelves.</div>
              )}
            </div>

            {/* Footer triggers */}
            <div className="p-4 border-t border-gray-150 bg-white">
              <button
                onClick={() => { setInventoryShop(null); setPickupConfirmed(null); }}
                className="w-full py-2.5 bg-gray-50 text-gray-500 font-bold text-xs rounded-xl"
              >
                Close Shelf Checker
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
