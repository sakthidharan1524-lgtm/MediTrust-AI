import React, { useState, useRef } from "react";
import { BadgeCheck, Store, MapPin, Upload, Camera, AlertOctagon, CheckCircle2, Search, Target, ShieldQuestion, Star } from "lucide-react";

type VerificationStatus = "idle" | "verifying" | "success" | "suspicious";

interface Shop {
  id: string;
  name: string;
  rating: number;
  reviewsCount: number;
}

interface Order {
  id: string;
  date: string;
  productName: string;
  shop: Shop;
  image?: string;
  price: number;
  isVerified: boolean;
  verificationResult?: {
    isOriginal: boolean;
    expiryDate: string;
    reason: string;
  }
}

export default function OriginalityPage() {
  const [orders, setOrders] = useState<Order[]>([
    {
      id: "ORD-9821-45",
      date: "2026-06-11",
      productName: "Amoxicillin 500mg Caps",
      price: 120,
      isVerified: false,
      shop: { id: "shop1", name: "Apollo Pharmacy - Downtown", rating: 4.5, reviewsCount: 342 }
    },
    {
      id: "ORD-7623-12",
      date: "2026-06-08",
      productName: "Panadol Extra Advance",
      price: 65,
      isVerified: false,
      shop: { id: "shop2", name: "City Health Medicals", rating: 4.8, reviewsCount: 1024 }
    },
    {
      id: "ORD-4432-89",
      date: "2026-06-01",
      productName: "Cough Syrup Dx",
      price: 240,
      isVerified: true,
      verificationResult: {
        isOriginal: true,
        expiryDate: "12/2028",
        reason: "Valid serialization code and accurate packaging font structures."
      },
      shop: { id: "shop3", name: "GreenCross Local", rating: 3.9, reviewsCount: 45 }
    }
  ]);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [verifyingStatus, setVerifyingStatus] = useState<VerificationStatus>("idle");
  const [cameraMode, setCameraMode] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openCamera = async () => {
    try {
      setCameraMode(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      streamRef.current = stream;
      // We wait for the DOM to update so videoRef is available
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }, 100);
    } catch (error) {
      alert("Camera access denied or unavailable.");
      setCameraMode(false);
    }
  };

  const closeCamera = () => {
    setCameraMode(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(videoRef.current, 0, 0);
      const base64 = canvas.toDataURL("image/jpeg");
      setCapturedImage(base64);
      closeCamera();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setCapturedImage(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const runVerification = async () => {
    if (!capturedImage || !selectedOrder) return;
    
    setVerifyingStatus("verifying");
    
    try {
      const res = await fetch("/api/originality-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
           imageBase64: capturedImage, 
           productName: selectedOrder.productName 
        })
      });
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Verification API error");
      }
      
      const isOriginal = data.isOriginal;
      setVerifyingStatus(isOriginal ? "success" : "suspicious");

      setOrders(prev => prev.map(o => {
        if (o.id === selectedOrder.id) {
           const updatedOrder = {
             ...o,
             isVerified: true,
             verificationResult: {
               isOriginal: data.isOriginal,
               expiryDate: data.expiryDate,
               reason: data.reason || "Processed successfully."
             },
             shop: {
                ...o.shop,
                rating: Math.max(1, Math.min(5, o.shop.rating + (data.isOriginal ? 0.1 : -0.5))),
                reviewsCount: o.shop.reviewsCount + 1
             }
           };
           setSelectedOrder(updatedOrder);
           return updatedOrder;
        }
        return o;
      }));
      
    } catch (e: any) {
       console.error("Verification error:", e);
       alert("Verification failed: " + (e.message || "Please try again."));
       setVerifyingStatus("idle");
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1 text-amber-500">
         <Star className="w-3.5 h-3.5 fill-current" />
         <span className="text-xs font-bold text-gray-700">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fade-in relative z-10 w-full mb-20 space-y-8">
      <div className="flex items-center gap-4 border-b pb-6 shrink-0">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-900/20 text-white">
          <BadgeCheck className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-[#212121] tracking-tight">Originality Check</h1>
          <p className="text-sm font-medium text-gray-500 mt-1">Verify pharmacy purchases against master copies using AI.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column: Orders */}
        <div className="space-y-4">
          <h2 className="font-bold text-gray-800 text-lg flex items-center gap-2">
            Recent Offline Orders
          </h2>
          {orders.map(order => (
            <div 
              key={order.id} 
              onClick={() => {
                setSelectedOrder(order);
                setCapturedImage(null);
                setVerifyingStatus("idle");
              }}
              className={`p-4 rounded-xl border cursor-pointer transition-colors ${selectedOrder?.id === order.id ? 'bg-amber-50 border-amber-300' : 'bg-white border-gray-100 hover:border-amber-200 shadow-sm'}`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="font-bold text-gray-800">{order.productName}</div>
                {order.isVerified ? (
                   order.verificationResult?.isOriginal ? (
                     <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                       <CheckCircle2 className="w-3 h-3" /> Verified
                     </span>
                   ) : (
                     <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                       <AlertOctagon className="w-3 h-3" /> Suspicious
                     </span>
                   )
                ) : (
                   <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Unverified</span>
                )}
              </div>
              
              <div className="flex items-center justify-between mt-3">
                 <div className="flex items-center gap-1.5 text-xs text-gray-600">
                    <Store className="w-3.5 h-3.5 text-gray-400" /> 
                    {order.shop.name}
                 </div>
                 {renderStars(order.shop.rating)}
              </div>
            </div>
          ))}
        </div>

        {/* Right Column: Verification Action */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          {!selectedOrder ? (
            <div className="text-center text-gray-400 py-20 flex flex-col items-center">
              <ShieldQuestion className="w-16 h-16 opacity-30 mb-4" />
              <p>Select an order from the left to start identity verification.</p>
            </div>
          ) : (
            <div className="space-y-6">
               <div className="pb-4 border-b">
                 <h3 className="font-bold text-xl text-gray-800">{selectedOrder.productName}</h3>
                 <p className="text-sm text-gray-500">Purchased from {selectedOrder.shop.name}</p>
                 <div className="mt-2 inline-block">
                   Shop Rating affects their local discoverability: {renderStars(selectedOrder.shop.rating)}
                 </div>
               </div>

               {selectedOrder.isVerified && selectedOrder.verificationResult ? (
                 <div className={`p-5 rounded-xl border ${selectedOrder.verificationResult.isOriginal ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                    <div className="flex items-center gap-3 mb-4">
                      {selectedOrder.verificationResult.isOriginal ? 
                         <CheckCircle2 className="w-8 h-8 text-emerald-600" /> : 
                         <AlertOctagon className="w-8 h-8 text-red-600" />
                      }
                      <div>
                        <div className={`font-black text-lg ${selectedOrder.verificationResult.isOriginal ? 'text-emerald-700' : 'text-red-700'}`}>
                          {selectedOrder.verificationResult.isOriginal ? 'Authentic Product' : 'Counterfeit Warning'}
                        </div>
                        <div className="text-sm font-medium opacity-80">
                          Detected Expiry: {selectedOrder.verificationResult.expiryDate}
                        </div>
                      </div>
                    </div>
                    <p className={`text-sm ${selectedOrder.verificationResult.isOriginal ? 'text-emerald-800' : 'text-red-800'}`}>
                       {selectedOrder.verificationResult.reason}
                    </p>
                    
                    {!selectedOrder.verificationResult.isOriginal && (
                       <div className="mt-4 text-xs font-bold bg-white/50 p-2 rounded text-red-900 border border-red-200/50">
                          Note: Store rating has been demoted based on suspicious inventory. More authentic reviews are needed to restore their reputation.
                       </div>
                    )}
                     {selectedOrder.verificationResult.isOriginal && (
                       <div className="mt-4 text-xs font-bold bg-white/50 p-2 rounded text-emerald-900 border border-emerald-200/50">
                          Note: Store rating slightly boosted for maintaining authentic medical supplies.
                       </div>
                    )}
                 </div>
               ) : (
                 <>
                   <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 min-h-[250px] flex items-center justify-center relative overflow-hidden">
                     {cameraMode ? (
                        <>
                          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover absolute inset-0" />
                          <button onClick={capturePhoto} className="absolute bottom-4 left-1/2 -translate-x-1/2 w-16 h-16 bg-white rounded-full border-4 border-amber-500 shadow-xl flex items-center justify-center text-amber-600">
                             <Target className="w-6 h-6" />
                          </button>
                        </>
                     ) : capturedImage ? (
                        <div className="relative w-full h-full">
                           <img src={capturedImage} alt="Captured product" className="w-full max-h-[300px] object-contain rounded-lg" />
                           {verifyingStatus === "idle" && (
                              <button onClick={() => setCapturedImage(null)} className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full backdrop-blur-sm">
                                 Retake
                              </button>
                           )}
                        </div>
                     ) : (
                        <div className="text-center space-y-4">
                           <Camera className="w-12 h-12 text-gray-300 mx-auto" />
                           <div className="flex gap-3">
                              <button onClick={openCamera} className="bg-amber-100 hover:bg-amber-200 text-amber-700 px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2">
                                <Camera className="w-4 h-4" /> Camera
                              </button>
                              <button onClick={() => fileInputRef.current?.click()} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2">
                                <Upload className="w-4 h-4" /> Upload
                              </button>
                           </div>
                           <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                        </div>
                     )}
                     <canvas ref={canvasRef} className="hidden" />
                   </div>

                   {capturedImage && verifyingStatus === "idle" && (
                      <button 
                         onClick={runVerification}
                         className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3.5 rounded-xl transition-colors shadow-md flex items-center justify-center gap-2"
                      >
                         <Search className="w-5 h-5" /> Run Deep Verification
                      </button>
                   )}

                   {verifyingStatus === "verifying" && (
                      <div className="w-full bg-gray-100 text-gray-600 font-bold py-3.5 rounded-xl flex items-center justify-center gap-3">
                        <div className="w-5 h-5 border-2 border-gray-400 border-t-amber-600 rounded-full animate-spin"></div>
                        Connecting to Deep Search API...
                      </div>
                   )}
                 </>
               )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
