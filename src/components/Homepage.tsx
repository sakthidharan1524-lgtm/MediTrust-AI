import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Stethoscope, FileText, Star, ShieldAlert, BadgeCheck, MapPin, Navigation, Compass, Sparkles, Building, ArrowRight, ShieldCheck, Activity } from "lucide-react";
import { useStore } from "../store";

export default function Homepage() {
  const { navigate, pharmacies, setFilters, selectedCategory, setSelectedCategory } = useStore();

  // Carousel slider state
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    {
      title: "Verify Your Medicine Authenticity",
      subtitle: "Protect your health from counterfeit drugs. Upload packaging photos of our orders to inspect microscopic print anomalies via our Gemini vision audit.",
      bg: "bg-gradient-to-r from-teal-900 via-[#0D7377] to-cyan-800 text-white",
      image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=600",
      badge: "Real-time AI Scan"
    },
    {
      title: "Trusted Offline Pharmacy Network",
      subtitle: "Order directly from verified brick-and-mortar storefronts near you. Reserve for walk-in pickup and scanning using secure QR checkouts.",
      bg: "bg-gradient-to-r from-indigo-900 via-[#14919B] to-teal-800 text-white",
      image: "https://images.unsplash.com/photo-1586015555751-63bb77f4322a?w=600",
      badge: "SDG 3 Certified"
    },
    {
      title: "UN SDG Goal 3: Good Health & Well-Being",
      subtitle: "Assuring digital parity, strict drug verification channels, and instant doctor telemedicine consultations to guarantee healthy lives across India.",
      bg: "bg-gradient-to-r from-[#0D7377] via-[#14919B] to-[#FF6B6B] text-white",
      image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=600",
      badge: "Global Compliance"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };
  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Categories list with pastel colors and exact matching names
  const categoriesList = [
    { name: "Diabetes Care", count: "2 meds", color: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 ring-emerald-100", label: "Diabetes Care", img: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=100&q=80" },
    { name: "Cardiac Care", count: "1 med", color: "bg-rose-50 text-rose-700 hover:bg-rose-100 ring-rose-100", label: "Cardiac Care", img: "https://images.unsplash.com/photo-1530497610245-94d3c16cdda4?w=100&q=80" },
    { name: "Cold & Flu", count: "1 med", color: "bg-sky-50 text-sky-700 hover:bg-sky-100 ring-sky-100", label: "Cold & Flu", img: "https://images.unsplash.com/photo-1584362917165-526a968579e8?w=100&q=80" },
    { name: "Pain Relief", count: "1 med", color: "bg-coral-50 text-[#FF6B6B] hover:bg-red-100 bg-red-50/50 ring-red-100", label: "Pain Relief", img: "https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=100&q=80" },
    { name: "Vitamins", count: "1 med", color: "bg-amber-50 text-amber-700 hover:bg-amber-100 ring-amber-100", label: "Vitamins & Health", img: "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=100&q=80" },
    { name: "Skin Care", count: "1 med", color: "bg-purple-50 text-purple-700 hover:bg-purple-100 ring-purple-100", label: "Skin Care", img: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=100&q=80" },
    { name: "Eye Care", count: "1 med", color: "bg-cyan-50 text-cyan-700 hover:bg-cyan-100 ring-cyan-100", label: "Eye Drops", img: "https://images.unsplash.com/photo-1589826359515-ae7befd70c4e?w=100&q=80" },
    { name: "Baby Care", count: "0 meds", color: "bg-pink-50 text-pink-700 hover:bg-pink-100 ring-pink-100", label: "Baby Wellness", img: "https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=100&q=80" },
    { name: "Elderly Care", count: "0 meds", color: "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 ring-indigo-100", label: "Elderly Care", img: "https://images.unsplash.com/photo-1516302752625-fcc3c50ae61f?w=100&q=80" },
    { name: "First Aid", count: "1 med", color: "bg-teal-50 text-teal-700 hover:bg-teal-100 ring-teal-100", label: "First Aid kit", img: "https://images.unsplash.com/photo-1583324113626-70df0f4deaab?w=100&q=80" }
  ];

  // Marquee brand logos
  const brands = [
    "Cipla", "Sun Pharma", "Dr. Reddy's", "Abbott", "Pfizer", "GSK", "Lupin", "Zydus", "Mankind", "Morepen"
  ];

  // Slice list of pharmacies near me helper
  const topPharmacies = pharmacies.slice(0, 3);

  const handleCategorySelect = (catName: string) => {
    // If we select the category, apply filter to search store and go to search page
    setSelectedCategory(catName);
    setFilters((prev) => ({
      ...prev,
      conditions: [catName],
    }));
    navigate("search");
  };

  return (
    <div className="space-y-12 pb-16 bg-[#F8F9FA]" id="home-view">
      
      {/* 1. Category Strip */}
      <section className="w-full bg-white py-6 border-b border-gray-100 shadow-sm overflow-x-auto select-none no-scrollbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-start gap-8 md:justify-between">
          {categoriesList.map((cat, idx) => {
            const isSel = selectedCategory === cat.name;
            return (
              <button
                key={idx}
                onClick={() => handleCategorySelect(cat.name)}
                className="flex flex-col items-center justify-center shrink-0 group transition-all"
                id={`cat-${idx}`}
              >
                <div className={`w-14 h-14 rounded-full flex items-center justify-center font-extrabold text-sm transition-all duration-300 transform group-hover:scale-110 shadow-sm overflow-hidden ${cat.color} ${isSel ? "ring-2 ring-[#0D7377] ring-offset-2 scale-105" : ""}`}>
                  <img src={cat.img} alt={cat.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <span className="text-[11px] font-semibold text-gray-700 mt-2.5 group-hover:text-[#0D7377] whitespace-nowrap transition-colors relative">
                  {cat.name}
                  <span className="absolute left-0 right-0 -bottom-1 h-0.5 bg-[#0D7377] scale-x-0 group-hover:scale-x-100 transition-transform origin-center" />
                </span>
                <span className="text-[9px] text-gray-400 mt-0.5">{cat.count}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 2. Hero Carousel Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl overflow-hidden shadow-lg border border-gray-100 h-96 group">
          {slides.map((slide, idx) => (
            <div
              key={idx}
              className={`absolute inset-0 w-full h-full flex flex-col md:flex-row items-center transition-opacity duration-700 ease-in-out ${idx === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"}`}
            >
              <div className={`w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center h-full space-y-4 ${slide.bg}`}>
                <span className="inline-block px-3 py-1 bg-white/20 text-white rounded-full text-[10px] font-bold uppercase tracking-wider w-fit">
                  {slide.badge}
                </span>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">
                  {slide.title}
                </h1>
                <p className="text-sm text-teal-50/90 leading-relaxed max-w-md">
                  {slide.subtitle}
                </p>
                <button 
                  onClick={() => navigate(idx === 0 ? "verify" : idx === 1 ? "nearby" : "consult")}
                  className="mt-2 px-5 py-2.5 bg-white text-[#0D7377] font-bold text-xs rounded-xl shadow-md hover:bg-teal-50 transition-colors uppercase tracking-wider w-fit"
                >
                  Get Started <ArrowRight className="inline-block w-4 h-4 ml-1.5 align-middle" />
                </button>
              </div>
              <div className="hidden md:block w-1/2 h-full relative">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/10" />
              </div>
            </div>
          ))}

          {/* Left/Right click triggers */}
          <button
            onClick={handlePrevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={handleNextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Indicators container */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-25 flex gap-2">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${idx === currentSlide ? "bg-white w-6" : "bg-white/50"}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 3. Primary Action Cards Grid (Horizontal Scroll) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto snap-x snap-mandatory gap-6 pb-6 w-full shrink-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        
        {/* Card 1 - Doctor Consult */}
        <div className="min-w-[85vw] sm:min-w-[400px] shrink-0 snap-center bg-gradient-to-br from-teal-500/10 to-[#14919B]/5 border border-teal-500/10 rounded-2xl p-6 shadow-sm flex items-start gap-5 hover:-translate-y-1 transition-all duration-300">
          <div className="w-14 h-14 rounded-xl bg-white text-[#0D7377] flex items-center justify-center shadow-md shadow-teal-700/5 shrink-0">
            <Stethoscope className="w-7 h-7" />
          </div>
          <div className="flex-1 space-y-2">
            <h3 className="text-lg font-bold text-gray-900 tracking-tight">Consult Online Doctors</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Instantly book digital consultations with national board registered specialists available 24/7 before purchasing meds.
            </p>
            <button 
              onClick={() => navigate("consult")}
              className="mt-2 px-4 py-2 bg-[#0D7377] text-white font-bold text-[11px] uppercase tracking-wider rounded-xl hover:bg-[#14919B] transition-colors"
            >
              Talk to Doctor
            </button>
          </div>
        </div>

        {/* Card 2 - Rehab AI Trainer */}
        <div className="min-w-[85vw] sm:min-w-[400px] shrink-0 snap-center bg-gradient-to-br from-indigo-500/10 to-blue-600/5 border border-indigo-500/10 rounded-2xl p-6 shadow-sm flex items-start gap-5 hover:-translate-y-1 transition-all duration-300">
          <div className="w-14 h-14 rounded-xl bg-white text-indigo-600 flex items-center justify-center shadow-md shadow-indigo-700/5 shrink-0">
            <Activity className="w-7 h-7" />
          </div>
          <div className="flex-1 space-y-2">
            <h3 className="text-lg font-bold text-gray-900 tracking-tight">Rehab AI Trainer</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Camera-based rehab coach that checks exercise form, scores repetitions, tracks adherence, and prevents injuries.
            </p>
            <button 
              onClick={() => navigate("trainer")}
              className="mt-2 px-4 py-2 bg-indigo-600 text-white font-bold text-[11px] uppercase tracking-wider rounded-xl hover:bg-indigo-700 transition-colors"
            >
              Start Rehab
            </button>
          </div>
        </div>

        {/* Card 3 - Upload Prescription / Verify */}
        <div className="min-w-[85vw] sm:min-w-[400px] shrink-0 snap-center bg-gradient-to-br from-red-500/5 to-[#FF6B6B]/15 border border-[#FF6B6B]/10 rounded-2xl p-6 shadow-sm flex items-start gap-5 hover:-translate-y-1 transition-all duration-300">
          <div className="w-14 h-14 rounded-xl bg-white text-[#FF6B6B] flex items-center justify-center shadow-md shadow-red-700/5 shrink-0">
            <FileText className="w-7 h-7" />
          </div>
          <div className="flex-1 space-y-2">
            <h3 className="text-lg font-bold text-gray-900 tracking-tight">Verify Prescription</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Require prescription medications? Our optical character recognition validates chemical formulas instantly.
            </p>
            <button 
              onClick={() => navigate("verify")}
              className="mt-2 px-4 py-2 bg-[#FF6B6B] text-white font-bold text-[11px] uppercase tracking-wider rounded-xl hover:bg-red-500 transition-colors"
            >
              Verify Now
            </button>
          </div>
        </div>

        {/* Card 4 - Originality Check */}
        <div className="min-w-[85vw] sm:min-w-[400px] shrink-0 snap-center bg-gradient-to-br from-amber-500/10 to-orange-600/5 border border-amber-500/10 rounded-2xl p-6 shadow-sm flex items-start gap-5 hover:-translate-y-1 transition-all duration-300">
          <div className="w-14 h-14 rounded-xl bg-white text-amber-600 flex items-center justify-center shadow-md shadow-amber-700/5 shrink-0">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div className="flex-1 space-y-2">
            <h3 className="text-lg font-bold text-gray-900 tracking-tight">Originality Check</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Verify pharmaceutical products from previous orders. Detect counterfeits and check expiry using AI search.
            </p>
            <button 
              onClick={() => navigate("originality")}
              className="mt-2 px-4 py-2 bg-amber-600 text-white font-bold text-[11px] uppercase tracking-wider rounded-xl hover:bg-amber-700 transition-colors"
            >
              Check Product
            </button>
          </div>
        </div>

      </section>

      {/* 4. Brand Marquee */}
      <section className="w-full bg-white py-8 border-y border-gray-100 select-none overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 mb-4 text-center">
          <span className="text-[10px] font-extrabold text-[#0D7377] tracking-widest uppercase">
            Trusted by Leading Brand Partners
          </span>
        </div>
        
        {/* Infinite scrolling block using keyframe animation-like design */}
        <div className="flex gap-16 overflow-hidden w-full max-w-7xl mx-auto py-2">
          <div className="flex gap-16 shrink-0 animate-scroll group">
            {brands.map((brand, bIdx) => (
              <div 
                key={bIdx}
                className="font-black text-xl text-gray-300 hover:text-[#0D7377] cursor-default filter grayscale hover:grayscale-0 transition-all uppercase tracking-widest shrink-0"
              >
                {brand}
              </div>
            ))}
          </div>
          <div className="flex gap-16 shrink-0 animate-scroll" aria-hidden="true">
            {brands.map((brand, bIdx) => (
              <div 
                key={`dup-${bIdx}`}
                className="font-black text-xl text-gray-300 hover:text-[#0D7377] cursor-default filter grayscale hover:grayscale-0 transition-all uppercase tracking-widest shrink-0"
              >
                {brand}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Top Trusted Pharmacies near me Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
              Top Trusted Offline Pharmacies Near You
            </h2>
            <p className="text-xs text-gray-500">
              Verified clinical licenses scattered and optimized inside a physical radius.
            </p>
          </div>
          <button 
            onClick={() => navigate("nearby")}
            className="text-xs font-bold text-[#0D7377] hover:text-[#14919B] flex items-center gap-1 group"
          >
            View Map Directory <Compass className="w-4 h-4 group-hover:rotate-45 transition-transform" />
          </button>
        </div>

        {/* Horizontal scrollable listing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topPharmacies.map((pharm, idx) => (
            <div
              key={pharm.id}
              className="bg-white border-t-4 border-[#0D7377] rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all"
              id={`ph-teaser-${idx}`}
            >
              <div>
                <div className="h-40 w-full relative">
                  <img
                    src={pharm.image}
                    alt={pharm.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute right-3 top-3 bg-white/95 backdrop-blur-sm shadow-sm rounded-full px-2.5 py-1 text-[10px] font-bold text-[#0D7377] flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" /> {pharm.ratings}
                  </div>
                  <span className="absolute left-3 bottom-3 bg-[#0D7377] text-white rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider">
                    {pharm.distance} km away
                  </span>
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-sm text-gray-900 truncate">{pharm.name}</h3>
                    <span className="bg-teal-50 text-emerald-700 border border-emerald-200 rounded px-1.5 py-0.5 text-[8px] font-bold flex items-center gap-0.5 shrink-0">
                      <BadgeCheck className="w-3 h-3" /> VERIFIED
                    </span>
                  </div>
                  
                  <p className="text-[11px] text-gray-400 line-clamp-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" /> {pharm.address}
                  </p>

                  <div className="flex items-center gap-2 pt-2 border-t border-gray-50">
                    <span className="text-[10px] text-gray-500">Trust Index:</span>
                    <div className="flex-1 bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-[#0D7377] h-full" style={{ width: `${pharm.trust_score}%` }}></div>
                    </div>
                    <span className="text-[10px] font-bold text-[#0D7377]">{pharm.trust_score}/100</span>
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0">
                <button
                  onClick={() => navigate("nearby", pharm.id)}
                  className="w-full py-2 bg-teal-50 hover:bg-[#0D7377] text-[#0D7377] hover:text-white font-bold text-xs rounded-lg transition-all"
                >
                  Locate & Buy Offline
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Nearby GPS Mapping teaser card */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-gray-100 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row items-center gap-8">
          <div className="w-full md:w-1/2 space-y-4">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-rose-50 text-coral-600 rounded-full text-[10px] font-bold uppercase tracking-wider text-[#FF6B6B]">
              <Sparkles className="w-3.5 h-3.5" /> Geolocation Map Integrated
            </span>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              Instant Offline Pharmacy Finder
            </h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              Give browser permission to track nearby clinical stores, compare live stock inventory levels, and lock local walk-in reservations securely. We scatter stores within driving bounds.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => navigate("nearby")}
                className="px-5 py-3 bg-[#0D7377] text-white font-bold text-xs rounded-xl hover:bg-[#14919B] transition-colors uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-teal-900/10"
              >
                <Compass className="w-4 h-4" /> Load Local Shops Map
              </button>
              <button
                onClick={() => navigate("search")}
                className="px-5 py-3 border border-[#0D7377] text-[#0D7377] hover:bg-teal-50 font-bold text-xs rounded-xl transition-all uppercase tracking-wider flex items-center justify-center gap-2"
              >
                Browse Medicines Catalog
              </button>
            </div>
          </div>

          {/* Placeholder grid for Map Pin illustrations */}
          <div className="w-full md:w-1/2 h-52 bg-slate-100 rounded-xl relative border border-gray-200 overflow-hidden flex items-center justify-center">
            {/* Mock satellite vector street map backdrop */}
            <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] opacity-70"></div>
            
            {/* Center Pin representing user */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
              <div className="w-4 h-4 bg-sky-500 rounded-full border-2 border-white ring-4 ring-sky-400/20 animate-ping absolute"></div>
              <div className="w-4 h-4 bg-sky-500 rounded-full border-2 border-white relative z-10 shadow-sm"></div>
              <span className="text-[9px] font-bold text-sky-600 bg-sky-50 border border-sky-200 rounded px-1.5 py-0.5 mt-1 relative z-10 shadow-sm">My GPS</span>
            </div>

            {/* Pharmacies floating mock pins */}
            <div className="absolute top-1/4 left-1/3 flex flex-col items-center hover:scale-105 transition-transform cursor-pointer" onClick={() => navigate("nearby", "ph-1")}>
              <MapPin className="w-6 h-6 text-[#0D7377]" />
              <span className="text-[8px] font-bold text-white bg-[#0D7377] px-1 py-0.5 rounded shadow-sm">Apollo</span>
            </div>
            
            <div className="absolute bottom-1/4 right-1/4 flex flex-col items-center hover:scale-105 transition-transform cursor-pointer" onClick={() => navigate("nearby", "ph-2")}>
              <MapPin className="w-6 h-6 text-[#14919B]" />
              <span className="text-[8px] font-bold text-white bg-[#14919B] px-1 py-0.5 rounded shadow-sm">MedPlus</span>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="bg-white border-t border-gray-200 pt-12 pb-6 select-none shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          
          <div className="space-y-4">
            <h4 className="font-extrabold text-xs text-gray-900 tracking-wider uppercase">
              About MediTrust AI
            </h4>
            <ul className="space-y-2 text-xs text-gray-500">
              <li><button onClick={() => navigate("home")} className="hover:text-[#0D7377]">UN SDG 3 Goals Compliance</button></li>
              <li><button onClick={() => navigate("verify")} className="hover:text-[#0D7377]">Gemini Computer Vision Audit</button></li>
              <li><button onClick={() => navigate("nearby")} className="hover:text-[#0D7377]">Verifiable Clinical Licenses</button></li>
              <li><button onClick={() => navigate("consult")} className="hover:text-[#0D7377]">Affordable Health Ingress</button></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-extrabold text-xs text-gray-900 tracking-wider uppercase">
              Help & Support
            </h4>
            <ul className="space-y-2 text-xs text-gray-500">
              <li><button onClick={() => navigate("orders")} className="hover:text-[#0D7377]">Track Local Pickups</button></li>
              <li><button onClick={() => navigate("cart")} className="hover:text-[#0D7377]">Doctor Registration Scan</button></li>
              <li><a href="#" className="hover:text-[#0D7377]">Refund Policies</a></li>
              <li><a href="#" className="hover:text-[#0D7377]">Store Inventory Statuses</a></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-extrabold text-xs text-gray-900 tracking-wider uppercase">
              Policy & Legal
            </h4>
            <ul className="space-y-2 text-xs text-gray-500">
              <li><a href="#" className="hover:text-[#0D7377]">Privacy Regulations</a></li>
              <li><a href="#" className="hover:text-[#0D7377]">Terms and SLA Contracts</a></li>
              <li><a href="#" className="hover:text-[#0D7377]">OTC Delivery Guidelines</a></li>
              <li><a href="#" className="hover:text-[#0D7377]">FDA Compliance Policies</a></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-extrabold text-xs text-gray-900 tracking-wider uppercase">
              Connect With Us
            </h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              MediTrust Head Office: 3rd Cross Sector, HSR Layout, Bengaluru - 560102.<br />Support: care@meditrust.ai
            </p>
            <div className="flex gap-2">
              <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-xs text-gray-500 border border-gray-200 uppercase">
                IN
              </span>
              <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-xs text-gray-500 border border-gray-200 uppercase">
                EN
              </span>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-gray-400">
          <div>
            &copy; 2026 MediTrust AI Inc. All rights reserved. Supporting sustainable development.
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-extrabold text-teal-700 bg-teal-50 border border-teal-200 rounded px-2 py-0.5 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% AUTHENTICITY ASSURED
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}
