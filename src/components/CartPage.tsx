import React, { useState, useRef, useMemo } from "react";
import { ShoppingCart, Upload, ShieldCheck, BadgeCheck, FileText, AlertTriangle, HelpCircle, Truck, FileCheck, CheckCircle2, X, Sparkles, LogIn, Activity, Edit3, ShieldAlert, ArrowRight, CornerDownRight, Camera, XCircle } from "lucide-react";
import { useStore } from "../store";
import { Medicine } from "../types";

export default function CartPage() {
  const {
    cart,
    medicines,
    user,
    activePrescription,
    prescriptionLoading,
    uploadAndScanPrescription,
    resetPrescription,
    updateCartQuantity,
    removeFromCart,
    cartOrderType,
    setCartOrderType,
    pharmacies,
    createOrder,
    navigate
  } = useStore();

  const [deliveryAddress, setDeliveryAddress] = useState(user?.address || "Flat 402, Sunshine Heights, Koramangala, Bangalore");
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  
  // Drag and Drop files upload refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string; preview: string } | null>(null);

  // Map cart items with details
  const cartWithMeds = useMemo(() => {
    return cart.map((item) => {
      const med = medicines.find((m) => m.id === item.medicineId);
      return {
        ...item,
        med: med as Medicine,
      };
    }).filter(item => item.med !== undefined);
  }, [cart, medicines]);

  // Is prescription / medicine bill verification required for the checkout
  const isPrescriptionRequired = useMemo(() => {
    // Orders cannot be placed without verifying the medicine bill or doctor's prescription
    return cart.length > 0;
  }, [cart]);

  // Is checkout currently locked
  const isCheckoutLocked = isPrescriptionRequired && (!activePrescription || activePrescription.status !== "verified");

  // Calculations
  const grossMRP = useMemo(() => {
    return cartWithMeds.reduce((acc, item) => acc + (item.med.mrp * item.quantity), 0);
  }, [cartWithMeds]);

  const discountVal = useMemo(() => {
    return cartWithMeds.reduce((acc, item) => acc + ((item.med.mrp - item.med.price) * item.quantity), 0);
  }, [cartWithMeds]);

  const netTotal = grossMRP - discountVal;
  const deliveryFee = cartOrderType === "pickup" ? 0 : (netTotal >= 500 ? 0 : 40);
  const finalPrice = netTotal - (couponApplied ? 50 : 0) + deliveryFee;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    if (!file) return;
    
    const sizeStr = (file.size / (1024 * 1024)).toFixed(2) + " MB";
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64String = event.target?.result as string;
      setUploadedFile({
        name: file.name,
        size: sizeStr,
        preview: base64String
      });
      // Immediately start parsing recipe using actual Gemini
      await uploadAndScanPrescription(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  // Quick interactive sandbox preset prescription upload helpers
  // This loads a real base64 image or simulated base64 block so is easily parseable.
  const uploadPresetPrescription = async (type: "valid" | "forged") => {
    setUploadedFile({
      name: type === "valid" ? "Dr_Catherine_Howard_Rx_512.jpg" : "Altered_Signature_MCI_Fake_Rx.png",
      size: "1.2 MB",
      preview: "preset_image_block_simulated"
    });

    // Simulated base64 loaded payload (different sizes trigger different behaviors in backend)
    const base64Stub = type === "valid" ? "MOCKED_VALID_BASE64_STRING_LENGTH_ODD" : "MOCKED_FORGED_BASE64_STRING_LENGTH_EVEN_BY_SEVEN";
    await uploadAndScanPrescription(base64Stub);
  };

  const handlePlaceOrder = async () => {
    if (isCheckoutLocked) {
      alert("Order placing blocked: Please upload and verify your medicine bill or doctor's prescription first to authorize checkout.");
      scrollToPrescriptionGate();
      return;
    }
    try {
      const order = await createOrder(deliveryAddress);
      navigate("orders");
    } catch (err) {
      alert("Order compilation failed. Try again.");
    }
  };

  const handleCouponApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.toUpperCase() === "MEDITRUST50") {
      setCouponApplied(true);
    } else {
      alert("Invalid Code. Try applying 'MEDITRUST50' for a ₹50 flat discount.");
    }
  };

  const scrollToPrescriptionGate = () => {
    const element = document.getElementById("prescription-gate");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-[#F8F9FA]" id="cart-view">
      
      {/* 1. Header tabs info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <ShoppingCart className="w-6.5 h-6.5 text-[#0D7377]" /> My Checkout Cart
          </h1>
          <p className="text-xs text-gray-550">
            Compare prices and verification channels from local offline pharmacy operators.
          </p>
        </div>
        <button
          onClick={() => navigate("search")}
          className="text-xs font-bold text-[#0D7377] hover:text-[#14919B] transition-colors uppercase tracking-wider"
        >
          Add More Medicines +
        </button>
      </div>

      {cart.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT CART ITEMS LIST (65% Width) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Delivery address banner */}
            <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm flex items-start gap-4">
              <Truck className="w-5 h-5 text-[#0D7377] shrink-0 mt-1" />
              <div className="flex-1 space-y-1">
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                  SHIPPING DETAILS & METHOD
                </span>
                {isEditingAddress ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 text-xs border border-gray-200 rounded px-2 py-1 bg-gray-50 focus:bg-white"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                    />
                    <button 
                      onClick={() => setIsEditingAddress(false)} 
                      className="bg-[#0D7377] text-white px-2.5 py-1 rounded text-[11px] font-bold"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-gray-700">{deliveryAddress}</p>
                    <button 
                      onClick={() => setIsEditingAddress(true)}
                      className="text-gray-400 hover:text-[#0D7377]"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                
                {/* Method selector pills */}
                <div className="flex gap-4 pt-2.5">
                  <label className="flex items-center gap-1.5 text-[11px] font-bold text-gray-600 cursor-pointer select-none">
                    <input
                      type="radio"
                      checked={cartOrderType === "delivery"}
                      onChange={() => setCartOrderType("delivery", null)}
                      className="text-[#0D7377] focus:ring-[#0D7377]"
                    />
                    <span>Home Delivery (Free above ₹500)</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-[11px] font-bold text-gray-600 cursor-pointer select-none">
                    <input
                      type="radio"
                      checked={cartOrderType === "pickup"}
                      onChange={() => setCartOrderType("pickup", pharmacies[0]?.id || "ph-1")}
                      className="text-[#0D7377] focus:ring-[#0D7377]"
                    />
                    <span>Local Walk-In Pickup (QR scan)</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Shopping List Stack */}
            <div className="space-y-4">
              {cartWithMeds.map((item) => {
                const isRx = item.med.requires_prescription;
                return (
                  <div
                    key={item.medicineId}
                    className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row items-center gap-5 justify-between relative overflow-hidden"
                    id={`cart-item-${item.medicineId}`}
                  >
                    
                    {/* Corner require rx warning badge */}
                    {isRx && (
                      <span className="absolute top-0 right-0 bg-gradient-to-l from-orange-500 to-amber-500 text-white rounded-bl-xl px-3 py-1 text-[9px] font-extrabold uppercase tracking-wide flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-white" /> Rx Locked
                      </span>
                    )}

                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div className="w-16 h-16 bg-gray-50 flex items-center justify-center p-1 rounded-xl shrink-0">
                        <img
                          src={item.med.images[0]}
                          alt={item.med.name}
                          className="max-h-full max-w-full object-contain mix-blend-multiply"
                        />
                      </div>
                      <div className="min-w-0 space-y-1">
                        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                          {item.med.brand}
                        </span>
                        <h3 className="font-extrabold text-xs text-gray-900 truncate">
                          {item.med.name}
                        </h3>
                        <p className="text-[10px] text-gray-400 line-clamp-1">{item.med.composition}</p>
                        <div className="flex items-center gap-1 text-[9px] text-[#0D7377] font-bold">
                          <BadgeCheck className="w-3.5 h-3.5 text-[#0D7377]" /> Trust Score: {item.med.trust_score}/100 verified
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-50">
                      
                      {/* Quantity Operator */}
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                        <button
                          onClick={() => updateCartQuantity(item.medicineId, item.quantity - 1)}
                          className="px-2 py-1 text-gray-500 hover:bg-gray-200 transition-colors"
                        >
                          -
                        </button>
                        <span className="px-3 text-xs font-bold text-gray-700">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.medicineId, item.quantity + 1)}
                          className="px-2 py-1 text-gray-500 hover:bg-gray-200 transition-colors"
                        >
                          +
                        </button>
                      </div>

                      {/* Pricing block */}
                      <div className="text-right space-y-0.5 shrink-0">
                        <span className="text-sm font-extrabold text-gray-950 block">
                          ₹{item.med.price * item.quantity}
                        </span>
                        <span className="text-[10px] text-gray-400 line-through">
                          MRP ₹{item.med.mrp * item.quantity}
                        </span>
                      </div>
                      
                      <button
                        onClick={() => removeFromCart(item.medicineId)}
                        className="text-[10px] font-bold text-rose-500 hover:text-rose-700 transition-colors"
                      >
                        Remove item
                      </button>

                    </div>

                  </div>
                );
              })}
            </div>

          </div>

          {/* RIGHT ORDER SUMMARY (35% Width) */}
          <aside className="space-y-6">
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm space-y-4 h-fit sticky top-24">
              <h3 className="font-extrabold text-xs text-gray-900 uppercase tracking-widest border-b border-gray-50 pb-2.5">
                ORDER VALUE DETAILS
              </h3>
              
              <div className="text-[11px] space-y-2.5 text-gray-500 font-bold">
                <div className="flex justify-between">
                  <span>Gross Basket MRP:</span>
                  <span className="text-gray-900">₹{grossMRP}</span>
                </div>
                <div className="flex justify-between text-emerald-600">
                  <span>Basket Discount:</span>
                  <span>- ₹{discountVal}</span>
                </div>
                {couponApplied && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Coupon flat MEDITRUST50:</span>
                    <span>- ₹50</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Delivery Shipping Fare:</span>
                  <span className="text-[#0D7377]">
                    {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                  </span>
                </div>
              </div>

              <hr className="border-gray-50" />

              <div className="flex justify-between items-baseline pt-1">
                <span className="text-sm font-extrabold text-gray-900 uppercase tracking-wider">
                  Total Payable Amount:
                </span>
                <span className="text-xl font-black text-[#0D7377]">
                  ₹{finalPrice}
                </span>
              </div>

              <div className="bg-emerald-50 text-emerald-700 p-2.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 border border-emerald-100">
                ⭐ You are saving ₹{discountVal + (couponApplied ? 50 : 0)} with this order transaction.
              </div>

              {/* Coupon code checkform */}
              <form onSubmit={handleCouponApply} className="flex gap-2 pt-2">
                <input
                  type="text"
                  placeholder="Promo Code (MEDITRUST50)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 text-xs border border-gray-200 bg-gray-50 rounded-lg px-2.5 py-2 uppercase placeholder-gray-400 focus:outline-none focus:border-[#0D7377]"
                  disabled={couponApplied}
                />
                <button
                  type="submit"
                  className="px-3 bg-teal-50 hover:bg-[#0D7377] text-[#0D7377] hover:text-white font-extrabold text-[10px] rounded-lg border border-[#0D7377] transition-all"
                  disabled={couponApplied}
                >
                  {couponApplied ? "Applied" : "Apply"}
                </button>
              </form>

              {/* CHECKOUT MASTER BUTTON (Locked/Unlocked depending on Rx Verification Status) */}
              {isCheckoutLocked ? (
                <button
                  onClick={scrollToPrescriptionGate}
                  className="w-full py-3.5 bg-gradient-to-r from-orange-400 to-[#FF6B6B] hover:opacity-95 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md flex items-center justify-center gap-2 animate-bounce"
                >
                  Verify Medicine Bill / Prescription &rarr;
                </button>
              ) : (
                <button
                  onClick={handlePlaceOrder}
                  className="w-full py-3.5 bg-[#0D7377] hover:bg-[#14919B] text-white font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md shadow-teal-900/10 flex items-center justify-center gap-2"
                >
                  Place Order Confirmed
                </button>
              )}

              <p className="text-[9px] text-gray-400 leading-relaxed text-center">
                🔒 HIPAA Compliant. SSL securely handles healthcare transactional channels.
              </p>
            </div>
          </aside>

        </div>
      ) : (
        /* Empty Basket state */
        <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center text-gray-500 space-y-4 max-w-md mx-auto shadow-sm">
          <div className="w-16 h-16 rounded-full bg-teal-50 text-[#0D7377] flex items-center justify-center mx-auto shadow-sm">
            <ShoppingCart className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Your Cart is Empty</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Browse our WHO-GMP verified medicines catalog, or check nearby active offline medical storefront inventories to reserve order pickups.
          </p>
          <button
            onClick={() => navigate("search")}
            className="px-6 py-2.5 bg-[#0D7377] text-white font-bold text-xs rounded-xl hover:bg-[#14919B] transition-colors uppercase tracking-wider"
          >
            Load Medicines Catalog
          </button>
        </div>
      )}

      {/* PRESCRIPTION GATE ZONE (Full Width at bottom) */}
      {isPrescriptionRequired && (
        <div
          id="prescription-gate"
          className="bg-gradient-to-b from-orange-50/50 to-white/95 rounded-2xl border border-orange-500/10 p-6 md:p-8 space-y-6"
        >
          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-[#FF6B6B] shadow-sm">
              <FileCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
                UN SDG-Compliance: Medicine Bill / Prescription Verification Required
              </h2>
              <p className="text-xs text-gray-500">
                All order checkout transactions require uploading and verifying your medicine bill or doctor's prescription invoice.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Step 1: Upload Zone */}
            <div className="md:col-span-1 space-y-4 bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-orange-600 block">
                STEP 1: Upload Medicine Bill / Rx Recommendation
              </span>
              
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${dragActive ? "border-[#0D7377] bg-teal-50" : "border-gray-200 hover:border-[#0D7377]"}`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileInput}
                  className="hidden"
                  accept="image/png, image/jpeg, application/pdf"
                />
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-gray-800">Drag & drop or Click to browse</p>
                <p className="text-[10px] text-gray-400 mt-1">Supports PNG, JPEG, PDF up to 5MB</p>
              </div>

              {/* Presets buttons for extreme convenience */}
              <div className="space-y-2 pt-2 border-t border-gray-50">
                <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block">
                  Quick Sandbox Testing Presets:
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => uploadPresetPrescription("valid")}
                    className="py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[9px] rounded-lg border border-emerald-200 text-center"
                    disabled={prescriptionLoading}
                  >
                    Load Valid Bill / Rx
                  </button>
                  <button
                    onClick={() => uploadPresetPrescription("forged")}
                    className="py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-[9px] rounded-lg border border-rose-200 text-center"
                    disabled={prescriptionLoading}
                  >
                    Load Suspect Bill / Rx
                  </button>
                </div>
              </div>
            </div>

            {/* Step 2: AI OCR Scanning Progress */}
            <div className="md:col-span-1 space-y-4 bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-orange-600 block mb-2">
                  STEP 2: Real-time Gemini Scan Analysis
                </span>

                {prescriptionLoading ? (
                  <div className="space-y-4 py-4 text-center">
                    {/* CSS Scanning line model */}
                    <div className="relative w-full h-24 bg-gray-50 border border-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
                      <FileText className="w-10 h-10 text-teal-600 opacity-60" />
                      <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#0D7377] to-transparent animate-scan"></div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs font-black text-gray-800 animate-pulse">Scanning metadata stamps...</p>
                      <p className="text-[10px] text-gray-400">Querying live Gemini model...</p>
                    </div>
                  </div>
                ) : uploadedFile ? (
                  <div className="space-y-3 pt-1 text-[11px] leading-relaxed text-gray-500 font-bold">
                    <p className="text-xs font-black text-[#212121]">Extracted Metadata:</p>
                    <div className="flex justify-between items-center bg-gray-50 p-2 rounded border border-gray-100">
                      <span>Doctor Specialist:</span>
                      <span className="text-[#0D7377]">{activePrescription?.doctor_name || "Scanning..."}</span>
                    </div>
                    <div className="flex justify-between items-center bg-gray-50 p-2 rounded border border-gray-100">
                      <span>MCI License Stamp:</span>
                      <span className="text-gray-900">{activePrescription?.doctor_reg_number || "Scanning..."}</span>
                    </div>
                    <div className="flex justify-between items-center bg-gray-50 p-2 rounded border border-gray-100">
                      <span>Receipt Date:</span>
                      <span className="text-gray-900">{activePrescription?.prescription_date || "Scanning..."}</span>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 space-y-2">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
                        Trust Assurance Audit Checks:
                      </p>

                      {/* Check 1: Bill Validity */}
                      <div className="flex justify-between items-center bg-gray-50 p-2 rounded border border-gray-100">
                        <span className="flex items-center gap-1.5 font-bold text-gray-600">
                          {activePrescription?.is_bill_valid === undefined ? (
                            <div className="w-3.5 h-3.5 rounded-full border border-gray-300 animate-pulse"></div>
                          ) : activePrescription.is_bill_valid ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-rose-500" />
                          )}
                          1. Valid Bill/Prescription Authenticity
                        </span>
                        <span>
                          {activePrescription?.is_bill_valid === undefined ? (
                            <span className="text-gray-400 font-bold">Verifying...</span>
                          ) : activePrescription.is_bill_valid ? (
                            <span className="text-emerald-700 font-extrabold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">PASS</span>
                          ) : (
                            <span className="text-rose-600 font-extrabold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">FAIL</span>
                          )}
                        </span>
                      </div>

                      {/* Check 2: Toxicity Screening */}
                      <div className="flex justify-between items-center bg-gray-50 p-2 rounded border border-gray-100">
                        <span className="flex items-center gap-1.5 font-bold text-gray-600">
                          {activePrescription?.no_toxic_medicine === undefined ? (
                            <div className="w-3.5 h-3.5 rounded-full border border-gray-300 animate-pulse"></div>
                          ) : activePrescription.no_toxic_medicine ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-rose-500" />
                          )}
                          2. Heavy Metals & Toxic Substance Screening
                        </span>
                        <span>
                          {activePrescription?.no_toxic_medicine === undefined ? (
                            <span className="text-gray-400 font-bold">Verifying...</span>
                          ) : activePrescription.no_toxic_medicine ? (
                            <span className="text-emerald-700 font-extrabold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">CLEAN</span>
                          ) : (
                            <span className="text-rose-600 font-extrabold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 font-black">TOXIC!</span>
                          )}
                        </span>
                      </div>

                      {/* Check 3: True Hospital */}
                      <div className="flex justify-between items-center bg-gray-50 p-2 rounded border border-gray-100">
                        <span className="flex items-center gap-1.5 font-bold text-gray-600">
                          {activePrescription?.true_hospital === undefined ? (
                            <div className="w-3.5 h-3.5 rounded-full border border-gray-300 animate-pulse"></div>
                          ) : activePrescription.true_hospital ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-rose-500" />
                          )}
                          3. Registered Hospital Header Stamp
                        </span>
                        <span>
                          {activePrescription?.true_hospital === undefined ? (
                            <span className="text-gray-400 font-bold">Verifying...</span>
                          ) : activePrescription.true_hospital ? (
                            <span className="text-emerald-700 font-extrabold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">TRUE ✓</span>
                          ) : (
                            <span className="text-rose-600 font-extrabold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">FAKE ✗</span>
                          )}
                        </span>
                      </div>

                      {/* Check 4: True Doctor License Registry */}
                      <div className="flex justify-between items-center bg-gray-50 p-2 rounded border border-gray-100">
                        <span className="flex items-center gap-1.5 font-bold text-gray-600">
                          {activePrescription?.true_doctor === undefined ? (
                            <div className="w-3.5 h-3.5 rounded-full border border-gray-300 animate-pulse"></div>
                          ) : activePrescription.true_doctor ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-rose-500" />
                          )}
                          4. Verified Physician Registration ID
                        </span>
                        <span>
                          {activePrescription?.true_doctor === undefined ? (
                            <span className="text-gray-400 font-bold">Verifying...</span>
                          ) : activePrescription.true_doctor ? (
                            <span className="text-emerald-700 font-extrabold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">VALID ✓</span>
                          ) : (
                            <span className="text-rose-600 font-extrabold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">SUSPECT</span>
                          )}
                        </span>
                      </div>

                      {/* Check 5: No AI generated slop */}
                      <div className="flex justify-between items-center bg-gray-50 p-2 rounded border border-gray-100">
                        <span className="flex items-center gap-1.5 font-bold text-gray-600">
                          {activePrescription?.not_ai_generated === undefined ? (
                            <div className="w-3.5 h-3.5 rounded-full border border-gray-300 animate-pulse"></div>
                          ) : activePrescription.not_ai_generated ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <XCircle className="w-3.5 h-3.5 text-rose-500" />
                          )}
                          5. Document Authenticity (Not AI-Generated)
                        </span>
                        <span>
                          {activePrescription?.not_ai_generated === undefined ? (
                            <span className="text-gray-400 font-bold">Verifying...</span>
                          ) : activePrescription.not_ai_generated ? (
                            <span className="text-emerald-700 font-extrabold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">HUMAN ✓</span>
                          ) : (
                            <span className="text-rose-600 font-extrabold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">AI GEN ✗</span>
                          )}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 space-y-2">
                      <p className="text-[10px] font-black text-[#0D7377] uppercase tracking-widest block">
                        SarvamAI Document Intelligence: Handwriting Analysis
                      </p>
                      <div className="bg-teal-50 border border-teal-100 p-3 rounded-lg flex items-start gap-2 mb-2">
                        <Edit3 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                        <p className="text-gray-600 text-[11px] leading-relaxed font-medium">
                          {activePrescription?.handwriting_analysis || "SarvamAI handwriting analysis scanning in progress..."}
                        </p>
                      </div>

                      <p className="text-[10px] font-black text-[#0D7377] uppercase tracking-widest block mt-4">
                        SarvamAI Clean Text Output
                      </p>
                      <div className="bg-gray-900 border border-teal-900 p-3 rounded-lg flex items-start gap-2 overflow-x-auto">
                        <FileText className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                        <pre className="text-teal-50 text-[11px] leading-relaxed font-mono whitespace-pre-wrap">
                          {activePrescription?.sarvam_clean_text || "SarvamAI extracting text..."}
                        </pre>
                      </div>
                      
                      <div className="mt-3 flex justify-between items-center bg-gray-50 p-2 rounded border border-gray-100">
                        <span className="flex items-center gap-1.5 font-bold text-gray-600 text-[11px]">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          Sarvam Originality Score
                        </span>
                        <span className={`font-black text-sm ${activePrescription?.sarvam_originality_score && activePrescription.sarvam_originality_score > 80 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {activePrescription?.sarvam_originality_score ?? "--"}/100
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-40 flex items-center justify-center border border-gray-100 rounded-lg bg-gray-50 text-center p-4">
                    <p className="text-[11px] text-gray-400">Upload receipt image to start real-time digital chemical analysis.</p>
                  </div>
                )}
              </div>

              <div className="text-[9px] text-gray-400 bg-teal-50 border border-teal-100 rounded p-2.5 flex items-start gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#0D7377] shrink-0 mt-0.5" />
                <span>Our system parses handwritten chemical formulations instantly.</span>
              </div>
            </div>

            {/* Step 3: Global Output Status */}
            <div className="md:col-span-1 space-y-4 bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-orange-600 block">
                  STEP 3: Clinical Validation Results
                </span>

                {activePrescription ? (
                  <div className="pt-4 text-center space-y-3">
                    {activePrescription.status === "verified" ? (
                      <div className="space-y-3">
                        <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                        <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full text-[10px] font-extrabold uppercase tracking-wide border border-emerald-200">
                          Medicine Bill / Prescription Verified ✓
                        </span>
                        <p className="text-[11px] text-gray-400 leading-relaxed">
                          Doctor license registry and transaction checks confirm active status. Schedule H purchase has been unlocked safely.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <ShieldAlert className="w-12 h-12 text-[#FF6B6B] mx-auto" />
                        <span className="inline-block px-3 py-1 bg-rose-50 text-[#FF6B6B] rounded-full text-[10px] font-extrabold uppercase tracking-wide border border-rose-200">
                          Verification Failed ✗
                        </span>
                        <p className="text-[11px] text-red-700 font-semibold leading-relaxed">
                          {activePrescription.failure_reason || "Doctor licensing Council Registration was not verified."}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-40 flex items-center justify-center border border-gray-100 rounded-lg bg-gray-50 text-center">
                    <p className="text-[11px] text-gray-400">Pending upload scan process completion.</p>
                  </div>
                )}
              </div>

              {activePrescription && (
                <button
                  onClick={resetPrescription}
                  className="w-full py-1.5 border border-[#FF6B6B]/30 hover:bg-rose-50 text-[#FF6B6B] font-bold text-[10px] uppercase rounded-lg transition-all"
                >
                  Reset Scanner Channels
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* PERSISTENT BOTTOM STICKY GATEWAY BAR */}
      {isPrescriptionRequired && (
        <div className={`fixed bottom-0 left-0 right-0 z-40 text-white py-3 px-6 shadow-xl flex items-center justify-between text-xs transition-colors duration-300 ${
          prescriptionLoading 
            ? "bg-amber-600" 
            : activePrescription?.status === "verified" 
              ? "bg-emerald-600" 
              : activePrescription?.status === "failed" 
                ? "bg-rose-600" 
                : "bg-orange-600"
        }`}>
          <div className="flex items-center gap-2">
            <span className="font-extrabold tracking-wide uppercase">
              {prescriptionLoading 
                ? "⏳ OCR AI Scan in Progress" 
                : activePrescription?.status === "verified" 
                  ? "✓ Bill / Prescription Verified" 
                  : activePrescription?.status === "failed" 
                    ? "✗ verification failed" 
                    : "🔒 Bill / Prescription Verification Pending"}
            </span>
            <span className="text-white/80 shrink-0">|</span>
            <span className="opacity-90 hidden sm:inline">
              {prescriptionLoading 
                ? "Running Gemini computer vision algorithms..." 
                : activePrescription?.status === "verified" 
                  ? "Checkout unlocked. Complete your purchase now." 
                  : activePrescription?.status === "failed" 
                    ? "Altered signature stamps found. Please consult doctors or re-upload." 
                    : "Upload medicine bills or clinic recommendation sheets under step 1 to authorize purchase."}
            </span>
          </div>
          
          {!isCheckoutLocked ? (
            <button
              onClick={handlePlaceOrder}
              className="px-4 py-1.5 bg-white text-emerald-800 font-extrabold rounded-lg hover:bg-emerald-50 transition-colors uppercase tracking-wider"
            >
              Order & Check out Now
            </button>
          ) : (
            <button
              onClick={scrollToPrescriptionGate}
              className="px-4 py-1.5 bg-white/20 hover:bg-white/30 text-white font-extrabold rounded-lg transition-colors uppercase tracking-wider flex items-center gap-1"
            >
              Start Upload Scan
            </button>
          )}
        </div>
      )}

    </div>
  );
}
