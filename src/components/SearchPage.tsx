import React, { useState, useMemo } from "react";
import { Filter, ChevronDown, Check, Star, RefreshCw, X, ShoppingCart, Eye, Upload, Shield, Info, ArrowUpDown } from "lucide-react";
import { useStore } from "../store";
import { Medicine } from "../types";

export default function SearchPage() {
  const { 
    navigate, 
    medicines, 
    searchTerm, 
    setSearchTerm, 
    filters, 
    setFilters, 
    resetFilters, 
    addToCart,
    user
  } = useStore();

  const [sortBy, setSortBy] = useState<string>("relevance");
  const [collapsedFilters, setCollapsedFilters] = useState<Record<string, boolean>>({
    types: false,
    rx: false,
    conditions: false,
    price: false,
    brands: false,
    trust: false,
  });

  const toggleCollapse = (key: string) => {
    setCollapsedFilters((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // List of unique values for catalog extraction
  const brandsList = ["Cipla", "Sun Pharma", "Dr. Reddy's", "GSK", "Pfizer", "Abbott", "Mankind", "Lupin"];
  const conditionsList = ["Diabetes Care", "Cardiac Care", "Cold & Flu", "Pain Relief", "Vitamins", "Skin Care", "Eye Care", "First Aid"];
  const typesList = ["Tablet", "Capsule", "Syrup", "Injection", "Ointment", "Drops", "Inhaler", "Powder"];

  // Filter handlers
  const handleTypeToggle = (type: string) => {
    setFilters((prev) => {
      const exists = prev.types.includes(type);
      const newTypes = exists 
        ? prev.types.filter((t) => t !== type) 
        : [...prev.types, type];
      return { ...prev, types: newTypes };
    });
  };

  const handleConditionToggle = (cond: string) => {
    setFilters((prev) => {
      const exists = prev.conditions.includes(cond);
      const newConds = exists 
        ? prev.conditions.filter((c) => c !== cond) 
        : [...prev.conditions, cond];
      return { ...prev, conditions: newConds };
    });
  };

  const handleBrandToggle = (brand: string) => {
    setFilters((prev) => {
      const exists = prev.brands.includes(brand);
      const newBrands = exists 
        ? prev.brands.filter((b) => b !== brand) 
        : [...prev.brands, brand];
      return { ...prev, brands: newBrands };
    });
  };

  const setRxFilter = (status: "OTC" | "Rx" | null) => {
    setFilters((prev) => ({ ...prev, rxStatus: status }));
  };

  const setMaxPrice = (price: number) => {
    setFilters((prev) => ({ ...prev, priceRange: [prev.priceRange[0], price] }));
  };

  const setTrustLimit = (score: number | null) => {
    setFilters((prev) => ({ ...prev, minTrustScore: score }));
  };

  // Remove a single active filter pill shortcut
  const removeFilterItem = (category: "types" | "conditions" | "brands" | "rx" | "trust" | "price", value?: any) => {
    setFilters((prev) => {
      if (category === "rx") return { ...prev, rxStatus: null };
      if (category === "trust") return { ...prev, minTrustScore: null };
      if (category === "price") return { ...prev, priceRange: [0, 2000] };
      
      const list = prev[category] as string[];
      return { ...prev, [category]: list.filter((item) => item !== value) };
    });
  };

  // Computed filtered and sorted results
  const processedMedicines = useMemo(() => {
    let list = [...medicines];

    // 1. Text keyword search
    if (searchTerm.trim() !== "") {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.brand.toLowerCase().includes(q) ||
          m.composition.toLowerCase().includes(q)
      );
    }

    // 2. Types Checkbox
    if (filters.types.length > 0) {
      list = list.filter((m) => filters.types.includes(m.type));
    }

    // 3. Conditions/Diseases
    if (filters.conditions.length > 0) {
      list = list.filter((m) => {
        // Direct category check
        return filters.conditions.includes(m.category) || filters.conditions.some(c => m.composition.toLowerCase().includes(c.toLowerCase()));
      });
    }

    // 4. Brand List
    if (filters.brands.length > 0) {
      list = list.filter((m) => filters.brands.includes(m.brand));
    }

    // 5. Rx status
    if (filters.rxStatus === "OTC") {
      list = list.filter((m) => !m.requires_prescription);
    } else if (filters.rxStatus === "Rx") {
      list = list.filter((m) => m.requires_prescription);
    }

    // 6. Max Price range bound
    list = list.filter((m) => m.price <= filters.priceRange[1]);

    // 7. Trust score minimum limit
    if (filters.minTrustScore) {
      list = list.filter((m) => m.trust_score >= filters.minTrustScore!);
    }

    // Sorting algorithm
    if (sortBy === "price-low") {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      list.sort((a, b) => b.price - a.price);
    } else if (sortBy === "trust") {
      list.sort((a, b) => b.trust_score - a.trust_score);
    } else if (sortBy === "discount") {
      list.sort((a, b) => b.discount_pct - a.discount_pct);
    }

    return list;
  }, [medicines, searchTerm, filters, sortBy]);

  // Is any filter currently applied check
  const isAnyFilterActive = useMemo(() => {
    return (
      filters.types.length > 0 ||
      filters.conditions.length > 0 ||
      filters.brands.length > 0 ||
      filters.rxStatus !== null ||
      filters.minTrustScore !== null ||
      filters.priceRange[1] < 2000
    );
  }, [filters]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row gap-8 min-h-screen bg-[#F8F9FA]" id="search-view">
      
      {/* LEFT SIDEBAR FILTERS (25% Width) */}
      <aside className="w-full md:w-64 shrink-0 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-6 h-fit md:sticky md:top-24 max-h-[85vh] overflow-y-auto no-scrollbar">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <span className="font-extrabold text-[#212121] flex items-center gap-2 text-sm uppercase tracking-wide">
            <Filter className="w-4.5 h-4.5 text-[#0D7377]" /> Filters
          </span>
          {isAnyFilterActive && (
            <button
              onClick={resetFilters}
              className="text-[11px] font-bold text-red-500 hover:text-red-700 transition-colors flex items-center gap-0.5"
            >
              <RefreshCw className="w-3 h-3" /> Clear All
            </button>
          )}
        </div>

        {/* 1. Rx Status Pill buttons */}
        <div className="space-y-2">
          <label className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block">
            Prescription Status
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => setRxFilter(null)}
              className={`py-1.5 rounded-lg text-[10px] font-bold border transition-all ${!filters.rxStatus ? "bg-[#0D7377] text-white border-[#0D7377]" : "bg-gray-50 border-gray-100 text-gray-500 hover:bg-gray-100"}`}
            >
              All
            </button>
            <button
              onClick={() => setRxFilter("OTC")}
              className={`py-1.5 rounded-lg text-[10px] font-bold border transition-all ${filters.rxStatus === "OTC" ? "bg-emerald-600 text-white border-emerald-600" : "bg-gray-50 border-gray-100 text-gray-500 hover:bg-gray-100"}`}
            >
              OTC Only
            </button>
            <button
              onClick={() => setRxFilter("Rx")}
              className={`py-1.5 rounded-lg text-[10px] font-bold border transition-all ${filters.rxStatus === "Rx" ? "bg-[#FF6B6B] text-white border-[#FF6B6B]" : "bg-gray-50 border-gray-100 text-gray-500 hover:bg-gray-100"}`}
            >
              Rx Required
            </button>
          </div>
        </div>

        {/* 2. Medicine Type checks (Collapsible) */}
        <div className="space-y-2">
          <button 
            onClick={() => toggleCollapse("types")}
            className="w-full flex items-center justify-between text-[11px] font-bold text-gray-700 hover:text-[#0D7377] transition-colors"
          >
            <span>MEDICINE FORMAT</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${collapsedFilters.types ? "-rotate-90" : ""}`} />
          </button>
          
          {!collapsedFilters.types && (
            <div className="space-y-1.5 pt-1.5 max-h-40 overflow-y-auto no-scrollbar">
              {typesList.map((type) => {
                const isChecked = filters.types.includes(type);
                return (
                  <label key={type} className="flex items-center gap-2.5 text-xs text-gray-600 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleTypeToggle(type)}
                      className="rounded border-gray-200 text-[#0D7377] focus:ring-[#0D7377]"
                    />
                    <span>{type}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* 3. Diseases/Category Grouping (Collapsible) */}
        <div className="space-y-2">
          <button 
            onClick={() => toggleCollapse("conditions")}
            className="w-full flex items-center justify-between text-[11px] font-bold text-gray-700 hover:text-[#0D7377] transition-colors"
          >
            <span>CONDITION / DISEASE</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${collapsedFilters.conditions ? "-rotate-90" : ""}`} />
          </button>
          
          {!collapsedFilters.conditions && (
            <div className="space-y-1.5 pt-1.5 max-h-40 overflow-y-auto no-scrollbar">
              {conditionsList.map((cond) => {
                const isChecked = filters.conditions.includes(cond);
                return (
                  <label key={cond} className="flex items-center gap-2.5 text-xs text-gray-600 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleConditionToggle(cond)}
                      className="rounded border-gray-200 text-[#0D7377] focus:ring-[#0D7377]"
                    />
                    <span>{cond}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* 4. Brand selectors */}
        <div className="space-y-2">
          <button 
            onClick={() => toggleCollapse("brands")}
            className="w-full flex items-center justify-between text-[11px] font-bold text-gray-700 hover:text-[#0D7377] transition-colors"
          >
            <span>BRAND MANUFACTURER</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${collapsedFilters.brands ? "-rotate-90" : ""}`} />
          </button>
          
          {!collapsedFilters.brands && (
            <div className="space-y-1.5 pt-1.5">
              {brandsList.map((bName) => {
                const isChecked = filters.brands.includes(bName);
                return (
                  <label key={bName} className="flex items-center gap-2.5 text-xs text-gray-600 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleBrandToggle(bName)}
                      className="rounded border-gray-200 text-[#0D7377] focus:ring-[#0D7377]"
                    />
                    <span>{bName}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        {/* 5. Dual price slider direct selection */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-gray-700">
            <span>PRICE MAX LIMIT</span>
            <span className="text-[#0D7377] font-extrabold">₹{filters.priceRange[1]}</span>
          </div>
          <input
            type="range"
            min="0"
            max="2000"
            step="20"
            value={filters.priceRange[1]}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-full h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#0D7377]"
          />
          <div className="flex justify-between text-[9px] text-gray-400">
            <span>₹0</span>
            <span>₹1000</span>
            <span>₹2000+</span>
          </div>
        </div>

        {/* 6. Trust Rating Index limits */}
        <div className="space-y-2">
          <button 
            onClick={() => toggleCollapse("trust")}
            className="w-full flex items-center justify-between text-[11px] font-bold text-gray-700 hover:text-[#0D7377] transition-colors"
          >
            <span>TRUST METRIC INDEX</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${collapsedFilters.trust ? "-rotate-90" : ""}`} />
          </button>
          
          {!collapsedFilters.trust && (
            <div className="space-y-1.5 pt-1.5">
              <button
                onClick={() => setTrustLimit(null)}
                className={`w-full text-left text-xs py-1 px-2 rounded ${!filters.minTrustScore ? "bg-teal-55 text-[#0D7377] font-bold" : "text-gray-600 hover:bg-gray-50"}`}
              >
                No limit
              </button>
              <button
                onClick={() => setTrustLimit(95)}
                className={`w-full text-left text-xs py-1 px-2 rounded flex items-center justify-between ${filters.minTrustScore === 95 ? "bg-teal-55 text-[#0D7377] font-bold" : "text-gray-600 hover:bg-gray-50"}`}
              >
                <span>95+ Excellent Trust</span>
                <span className="text-[10px] text-gray-400">(4 meds)</span>
              </button>
              <button
                onClick={() => setTrustLimit(90)}
                className={`w-full text-left text-xs py-1 px-2 rounded flex items-center justify-between ${filters.minTrustScore === 90 ? "bg-teal-55 text-[#0D7377] font-bold" : "text-gray-600 hover:bg-gray-50"}`}
              >
                <span>90+ High Trust</span>
                <span className="text-[10px] text-gray-400">(8 meds)</span>
              </button>
            </div>
          )}
        </div>

        {/* 7. Clear All solid button */}
        {isAnyFilterActive && (
          <button 
            onClick={resetFilters}
            className="w-full py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-500 font-bold text-xs rounded-xl transition-all border border-gray-100"
          >
            Clear Filters Grid
          </button>
        )}
      </aside>

      {/* RIGHT SIDEBAR RESULTS LISTING */}
      <section className="flex-1 space-y-6">
        
        {/* Sorting header context */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider">
              {searchTerm ? `Search Results for "${searchTerm}"` : "All Verified Medicines Available"}
            </h2>
            <p className="text-xs text-gray-500">
              Showing <span className="font-bold text-[#0D7377]">{processedMedicines.length}</span> verified clinical medicines.
            </p>
          </div>

          {/* Sort dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" /> Sort By:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs font-bold text-gray-700 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#0D7377] focus:bg-white cursor-pointer"
            >
              <option value="relevance">Relevance Score</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="trust">Highest Trust Rating</option>
              <option value="discount">Discount Percent</option>
            </select>
          </div>
        </div>

        {/* Active Filter Pills shortcuts list */}
        {isAnyFilterActive && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] uppercase font-extrabold text-gray-400">Active:</span>
            
            {filters.rxStatus && (
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold text-white shadow-sm ${filters.rxStatus === "OTC" ? "bg-emerald-600" : "bg-[#FF6B6B]"}`}>
                {filters.rxStatus}
                <button onClick={() => removeFilterItem("rx")} className="hover:opacity-80"><X className="w-3 h-3" /></button>
              </span>
            )}

            {filters.types.map((type) => (
              <span key={type} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-teal-50 text-[#0D7377] border border-teal-200">
                {type}
                <button onClick={() => removeFilterItem("types", type)} className="hover:text-teal-900"><X className="w-3 h-3" /></button>
              </span>
            ))}

            {filters.conditions.map((cond) => (
              <span key={cond} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                {cond}
                <button onClick={() => removeFilterItem("conditions", cond)} className="hover:text-purple-900"><X className="w-3 h-3" /></button>
              </span>
            ))}

            {filters.brands.map((brand) => (
              <span key={brand} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                {brand}
                <button onClick={() => removeFilterItem("brands", brand)} className="hover:text-amber-900"><X className="w-3 h-3" /></button>
              </span>
            ))}

            {filters.minTrustScore && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                Trust Index: {filters.minTrustScore}+
                <button onClick={() => removeFilterItem("trust")} className="hover:text-blue-900"><X className="w-3 h-3" /></button>
              </span>
            )}

            {filters.priceRange[1] < 2000 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-gray-50 text-gray-700 border border-gray-200">
                Under ₹{filters.priceRange[1]}
                <button onClick={() => removeFilterItem("price")} className="hover:text-gray-900"><X className="w-3 h-3" /></button>
              </span>
            )}
          </div>
        )}

        {/* RESULTS GRID LAYOUT */}
        {processedMedicines.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {processedMedicines.map((med) => {
              const saving = med.mrp - med.price;
              return (
                <div
                  key={med.id}
                  className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between group hover:-translate-y-1 hover:shadow-lg transition-transform duration-300 relative"
                  id={`med-card-${med.id}`}
                >
                  {/* Prescription corner badge */}
                  <span className={`absolute left-3 top-3 z-10 rounded-full px-2 py-0.5 text-[9px] font-extrabold shadow-sm uppercase tracking-wider ${med.requires_prescription ? "bg-orange-500 text-white" : "bg-emerald-600 text-white"}`}>
                    {med.requires_prescription ? "Rx Required" : "OTC Product"}
                  </span>

                  <div>
                    {/* Image display */}
                    <div 
                      onClick={() => navigate("medicine", med.id)}
                      className="h-44 w-full bg-gray-50 flex items-center justify-center p-4 relative cursor-pointer overflow-hidden"
                    >
                      <img
                        src={med.images[0]}
                        alt={med.name}
                        className="max-h-full max-w-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute right-3 bottom-3 bg-white/95 border border-gray-100 shadow-sm rounded-full px-2 py-1 text-[10px] font-bold text-teal-800 flex items-center gap-0.5">
                        <Shield className="w-3.5 h-3.5 text-[#0D7377]" /> Trust: {med.trust_score}/100
                      </div>
                    </div>

                    <div className="p-4 space-y-2">
                      <span className="text-[10px] uppercase font-bold text-[#0D7377] tracking-wider block">
                        {med.brand}
                      </span>
                      <h3 
                        onClick={() => navigate("medicine", med.id)}
                        className="font-bold text-sm text-gray-900 cursor-pointer hover:text-[#0D7377] line-clamp-1 truncate"
                      >
                        {med.name}
                      </h3>
                      <p className="text-[10px] text-gray-400 line-clamp-1">{med.composition}</p>
                      <p className="text-[10px] text-gray-400 font-medium">{med.pack_size}</p>

                      <div className="flex items-center gap-1 text-[10px] text-gray-500">
                        <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                        <span className="font-bold text-gray-700">{med.rating}</span>
                        <span>({med.review_count} reviews)</span>
                      </div>

                      <div className="flex items-baseline gap-2 pt-2">
                        <span className="text-base font-extrabold text-[#212121]">₹{med.price}</span>
                        <span className="text-xs text-gray-400 line-through">₹{med.mrp}</span>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 rounded px-1">{med.discount_pct}% OFF</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="p-4 pt-0 flex gap-2">
                    <button
                      onClick={() => navigate("medicine", med.id)}
                      className="flex-1 py-2 bg-gray-50 hover:bg-gray-100 text-[#212121] font-bold text-[10px] uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Detail
                    </button>
                    
                    {med.requires_prescription ? (
                      <button
                        onClick={() => { addToCart(med.id); navigate("cart"); }}
                        className="flex-1 py-2 bg-[#FF6B6B] hover:bg-red-500 text-white font-bold text-[10px] uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-1"
                      >
                        <Upload className="w-3.5 h-3.5" /> Add & Scan
                      </button>
                    ) : (
                      <button
                        onClick={() => addToCart(med.id)}
                        className="flex-1 py-2 bg-[#0D7377] hover:bg-[#14919B] text-white font-bold text-[10px] uppercase tracking-wider rounded-lg transition-colors flex items-center justify-center gap-1"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          /* Empty Search results State */
          <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center text-gray-500 space-y-4 max-w-lg mx-auto shadow-sm">
            <div className="w-16 h-16 rounded-full bg-teal-50 text-[#0D7377] flex items-center justify-center mx-auto shadow-sm">
              <Info className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No Verified Medicines Found</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              We couldn't locate any medicines matching your search terms or filters in our current database. Try refining your spelling or clearing sidebar filter options.
            </p>
            <button
              onClick={() => { setSearchTerm(""); resetFilters(); }}
              className="px-6 py-2.5 bg-[#0D7377] text-white font-bold text-xs rounded-xl hover:bg-[#14919B] transition-colors uppercase tracking-wider"
            >
              Browse All Medicines
            </button>
          </div>
        )}

      </section>

    </div>
  );
}
