import React, { useState, useEffect, useRef } from "react";
import { Stethoscope, CheckCircle, Video, PhoneOff, MessageSquare, Send, ShieldAlert, Sparkles, X, Plus, Star, Award, ShieldCheck, Heart, Upload, Bot, Mic, FileText, Camera, Phone, MapPin } from "lucide-react";
import { useStore } from "../store";

export default function DoctorConsultPage() {
  const { navigate, addToCart } = useStore();
  const [viewMode, setViewMode] = useState<"human" | "ai">("human");
  const [activeSpecialty, setActiveSpecialty] = useState<string>("All Specialities");
  const [activeLang, setActiveLang] = useState<string>("All Languages");
  const [userLocation, setUserLocation] = useState<{lat: number, lon: number} | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        },
        (err) => console.warn("Geolocation permission denied/failed", err),
        { enableHighAccuracy: true }
      );
    }
  }, []);
  
  // Interactive calling states
  const [activeCallDoctor, setActiveCallDoctor] = useState<any | null>(null);
  const [callConnected, setCallConnected] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "doctor"; text: string }>>([]);
  const [myMessage, setMyMessage] = useState("");
  const [prescriptionWritten, setPrescriptionWritten] = useState<string[]>([]);
  const [cartAddingStatus, setCartAddingStatus] = useState(false);

  // AI Doctor specific states
  const [aiSpecialty, setAiSpecialty] = useState<string>("Skin Care");
  const [aiTextInput, setAiTextInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [aiImagePreview, setAiImagePreview] = useState<string | null>(null);
  const [aiImageBase64, setAiImageBase64] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<string | null>(null);
  const [aiCallSessionActive, setAiCallSessionActive] = useState(false);
  const [chatHistory, setChatHistory] = useState<{role: string, text: string}[]>([]);
  const aiFileRef = useRef<HTMLInputElement>(null);
  const elevenLabsAudioRef = useRef<HTMLAudioElement | null>(null);
  const aiCallSessionActiveRef = useRef(false);

  useEffect(() => {
    aiCallSessionActiveRef.current = aiCallSessionActive;
    if (aiCallSessionActive) {
      setChatHistory([]); // Clear history when starting a new session
      setAiTextInput("");
      setAiAnalysisResult(null);
    }
  }, [aiCallSessionActive]);

  const aiSpecialties = ["Skin Care", "Hair Care", "Fat Loss"];

  // Specialties filters List
  const specialties = ["All Specialities", "General Physician", "Cardiologist", "Pediatrician", "Diabetologist", "Dermatologist"];
  const languages = ["All Languages", "English", "Hindi", "Kannada", "Tamil"];

  const startListening = () => {
    // @ts-ignore
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser or iframe. Please click 'Open App in New Tab' from the top right menu.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    
    let finalTranscript = "";

    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event: any) => {
      finalTranscript = event.results[0][0].transcript;
      setAiTextInput(prev => prev ? prev + " " + finalTranscript : finalTranscript);
    };

    recognition.onend = () => {
      setIsListening(false);
      if (aiCallSessionActiveRef.current && finalTranscript) {
         handleAiSubmit(finalTranscript);
      }
    };
    
    try {
      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  const handleAiFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview
    const objectUrl = URL.createObjectURL(file);
    setAiImagePreview(objectUrl);
    
    // Convert to Base64
    const reader = new FileReader();
    reader.onloadend = () => {
      setAiImageBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAiSubmit = async (overrideText?: string) => {
    const textToSubmit = overrideText || aiTextInput;
    if (!textToSubmit.trim() && !aiImageBase64) return;
    
    const currentUserMsg = { role: "user", text: textToSubmit };
    const newHistory = [...chatHistory, currentUserMsg];
    setChatHistory(newHistory);
    setAiTextInput("");
    
    setAiAnalysisResult(null);
    setAiLoading(true);
    
    // Stop any existing speech
    if (elevenLabsAudioRef.current) {
      elevenLabsAudioRef.current.pause();
      elevenLabsAudioRef.current = null;
    }
    window.speechSynthesis.cancel();

    try {
      const res = await fetch("/api/aidoctor/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          imageBase64: aiImageBase64, 
          textInput: textToSubmit,
          specialty: aiSpecialty,
          history: newHistory
        })
      });
      const data = await res.json();
      
      if (data.analysis_text) {
        setChatHistory(prev => [...prev, { role: "doctor", text: data.analysis_text }]);
        setAiAnalysisResult(data.analysis_text);
        speakAnalysis(data.analysis_text);
      } else {
        const errResult = "Sorry, failed to process analysis.";
        setChatHistory(prev => [...prev, { role: "doctor", text: errResult }]);
        setAiAnalysisResult(errResult);
        speakAnalysis(errResult);
      }
    } catch (error) {
      console.error("AI Analysis failed:", error);
      setAiAnalysisResult("Network error or analysis failed.");
    } finally {
      setAiLoading(false);
    }
  };

  const speakAnalysis = async (text: string) => {
    const onAudioEnd = () => {
      if (aiCallSessionActiveRef.current) {
        startListening();
      }
    };

    // Stop previous audio
    if (elevenLabsAudioRef.current) {
      elevenLabsAudioRef.current.pause();
      elevenLabsAudioRef.current = null;
    }
    window.speechSynthesis.cancel();

    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        elevenLabsAudioRef.current = audio;
        audio.onended = onAudioEnd;
        audio.play();
        return; // Success, skip native fallback
      } else {
        console.warn("ElevenLabs TTS failed. Falling back to native SpeechSynthesis.");
      }
    } catch (e) {
      console.error("Error fetching TTS:", e);
    }

    if (!("speechSynthesis" in window)) return;
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = onAudioEnd;
    
    // Attempt to pick an en-US female or natural sounding voice as requested Eleven Labs aesthetic
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.name.includes("Google") || v.name.includes("Natural") || v.lang === "en-US");
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    
    window.speechSynthesis.speak(utterance);
  };
  
  // Clear speech on unmount
  useEffect(() => {
    return () => {
      if (elevenLabsAudioRef.current) {
        elevenLabsAudioRef.current.pause();
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  // Mock Doctors Registry database
  const baseDoctors = [
    {
      id: "doc-1",
      name: "Dr. Catherine Howard",
      specialty: "General Physician",
      mci_license: "MCI-48937-2016",
      ratings: "4.9",
      experience: "12 yrs",
      fee: 399,
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150",
      languages: ["English", "Hindi"],
      is_online: true,
      latOffset: 0.015,
      lonOffset: 0.02
    },
    {
      id: "doc-2",
      name: "Dr. Arvind Swamy",
      specialty: "Cardiologist",
      mci_license: "MCI-98431-2008",
      ratings: "5.0",
      experience: "18 yrs",
      fee: 599,
      image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150",
      languages: ["English", "Tamil", "Hindi"],
      is_online: true,
      latOffset: 0.08,
      lonOffset: -0.05
    },
    {
      id: "doc-3",
      name: "Dr. Meera Vasudevan",
      specialty: "Diabetologist",
      mci_license: "MCI-14983-2012",
      ratings: "4.8",
      experience: "14 yrs",
      fee: 450,
      image: "https://images.unsplash.com/photo-1594824813573-246434de83fb?w=150",
      languages: ["Kannada", "English", "Hindi"],
      is_online: true,
      latOffset: -0.03,
      lonOffset: 0.04
    },
    {
      id: "doc-4",
      name: "Dr. Sarah Miller",
      specialty: "Dermatologist",
      mci_license: "MCI-74893-2019",
      ratings: "4.7",
      experience: "8 yrs",
      fee: 499,
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150",
      languages: ["English"],
      is_online: false,
      latOffset: 0.1,
      lonOffset: 0.1
    }
  ];

  const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const doctorsWithDistance = baseDoctors.map(doc => {
    let distance = null;
    if (userLocation) {
        distance = getDistanceFromLatLonInKm(
            userLocation.lat, userLocation.lon,
            userLocation.lat + doc.latOffset, userLocation.lon + doc.lonOffset
        );
    }
    return { ...doc, distance };
  });

  // Filtering Logic
  const filteredDoctors = doctorsWithDistance.filter((doc) => {
    const matchSpec = activeSpecialty === "All Specialities" || doc.specialty === activeSpecialty;
    const matchLang = activeLang === "All Languages" || doc.languages.includes(activeLang);
    return matchSpec && matchLang;
  }).sort((a, b) => {
     // Sort by online first, then distance
     if (a.is_online !== b.is_online) return a.is_online ? -1 : 1;
     if (a.distance !== null && b.distance !== null) return a.distance - b.distance;
     return 0;
  });

  // Telehealth call conversation simulation
  const handleStartCall = (doc: any) => {
    setActiveCallDoctor(doc);
    setCallConnected(false);
    setChatMessages([]);
    setPrescriptionWritten([]);
    setCartAddingStatus(false);

    // Call ring sequence simulate
    setTimeout(() => {
      setCallConnected(true);
      setChatMessages([
        { sender: "doctor", text: `Hello! I am ${doc.name}. Welcome to MediTrust Telehealth. How can I assist you with your health today?` }
      ]);
    }, 2500);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!myMessage.trim()) return;

    const userText = myMessage;
    setChatMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setMyMessage("");

    // Simulate doctor response sequence
    setTimeout(() => {
      let replyStr = "";
      if (userText.toLowerCase().includes("diabetes") || userText.toLowerCase().includes("sugar") || userText.toLowerCase().includes("metformin")) {
        replyStr = "I understand. Based on your glycemic levels, continuing with Metformin 500mg once daily is appropriate. I will draft a formal, signed medical prescription for you.";
        setPrescriptionWritten(["Metformin 500mg (1 Tablet daily after lunch)"]);
      } else if (userText.toLowerCase().includes("heart") || userText.toLowerCase().includes("bp") || userText.toLowerCase().includes("cardiac")) {
        replyStr = "I recommend tracking your home blood pressure readings daily. I have written a prescription for Lipitor 10mg to manage lipid profiles.";
        setPrescriptionWritten(["Lipitor 10mg (1 Tablet daily at bedtime)"]);
      } else {
        replyStr = "I have reviewed your symptoms. I am writing a prescription for standard cold & pain relief medications. It's safe to buy from the pharmacy checkout now.";
        setPrescriptionWritten(["Calpol 650mg (Twice daily PRN)"]);
      }
      setChatMessages((prev) => [...prev, { sender: "doctor", text: replyStr }]);
    }, 1500);
  };

  const handlePrescribeAdd = () => {
    setCartAddingStatus(true);
    // Find the medicine ID from the names conceptually
    let targetMedId = "med-1"; // default metformin
    if (prescriptionWritten[0]?.includes("Lipitor")) {
      targetMedId = "med-2";
    } else if (prescriptionWritten[0]?.includes("Calpol")) {
      targetMedId = "med-3";
    }

    // Add to cart
    setTimeout(() => {
      addToCart(targetMedId, 1);
      setCartAddingStatus(false);
      alert("✓ Doctor Prescribed medication added to cart basket successfully!");
      setActiveCallDoctor(null);
      navigate("cart");
    }, 1200);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-[#F8F9FA]" id="consult-view">
      
      {/* 1. Introductory Title Banner */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 text-[#0D7377] rounded-full text-[10px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> 24/7 Digital Ingress Channel
          </span>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Consult Medical Specialists
          </h1>
          <p className="text-xs text-gray-500 leading-relaxed">
            Choose between board-registered human doctors or our new Gemini AI Consultant for instant visual assessments.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setViewMode("human")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-extrabold transition-all ${
              viewMode === "human"
                ? "bg-white text-emerald-700 shadow-sm"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <Stethoscope className="w-4 h-4" /> Human Doctors
          </button>
          <button
            onClick={() => setViewMode("ai")}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-extrabold transition-all ${
              viewMode === "ai"
                ? "bg-white text-indigo-700 shadow-sm"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <Bot className="w-4 h-4" /> AI Consultant
          </button>
        </div>

        {/* Counter badges */}
        <div className="hidden md:flex gap-4 border-l border-gray-100 pl-6 shrink-0">
          <div>
            <span className="text-xl font-black text-emerald-600 block">{filteredDoctors.filter(d => d.is_online).length} Doctors</span>
            <span className="text-[10px] uppercase font-bold text-gray-400">Online Now</span>
          </div>
          <div>
            <span className="text-xl font-black text-[#0D7377] block">10+ mins</span>
            <span className="text-[10px] uppercase font-bold text-gray-400">Avg. Wait</span>
          </div>
        </div>
      </div>

      {viewMode === "human" && (
        <>
          {/* 2. Specialties & language dropdown selectors row */}
          <div className="flex flex-wrap items-center gap-4 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm text-xs">
            
            {/* Specialty tags */}
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-[#212121]">Specialty:</span>
              <div className="flex gap-1.5 flex-wrap">
                {specialties.map((spec) => (
                  <button
                    key={spec}
                    onClick={() => setActiveSpecialty(spec)}
                    className={`px-3 py-1.5 rounded-lg border font-bold transition-all ${activeSpecialty === spec ? "bg-[#0D7377] text-white border-[#0D7377] shadow-sm" : "bg-gray-50 border-gray-100 text-gray-500 hover:bg-gray-100"}`}
                  >
                    {spec}
                  </button>
                ))}
              </div>
            </div>

            {/* Language filters */}
            <div className="flex items-center gap-2 border-l border-gray-150 pl-4">
              <span className="font-extrabold text-[#212121]">Language:</span>
              <div className="flex gap-1.5 flex-wrap">
                {languages.map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setActiveLang(lang)}
                    className={`px-3 py-1.5 rounded-lg border font-bold transition-all ${activeLang === lang ? "bg-[#0D7377] text-white border-[#0D7377] shadow-sm" : "bg-gray-50 border-gray-100 text-gray-500 hover:bg-gray-100"}`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* 3. Doctors Registry Board listing loop */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredDoctors.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between hover:-translate-y-1 hover:shadow-md transition-all p-5 space-y-4"
                id={`doctor-card-${doc.id}`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100 border border-teal-50 shrink-0">
                      <img src={doc.image} alt={doc.name} className="w-full h-full object-cover" />
                    </div>
                    
                    {/* Board license verification checked badge */}
                    <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg px-2 py-0.5 text-[8px] font-extrabold flex items-center gap-0.5 uppercase tracking-wide">
                      <ShieldCheck className="w-3.5 h-3.5" /> MCI Board Certified
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-extrabold text-sm text-gray-900 leading-tight">
                      {doc.name}
                    </h3>
                    <p className="text-[11px] font-bold text-[#0D7377]">{doc.specialty}</p>
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                      <Award className="w-3.5 h-3.5" /> Experience: {doc.experience}
                    </div>
                    {doc.distance !== null && (
                      <div className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold mt-1 bg-emerald-50 w-max px-1.5 py-0.5 rounded">
                        <MapPin className="w-3 h-3" /> {doc.distance.toFixed(1)} km away
                      </div>
                    )}
                  </div>

                  {/* Languages strip */}
                  <div className="flex flex-wrap items-center gap-1 text-[9px] text-gray-550 font-bold">
                    <span>Languages:</span>
                    {doc.languages.map((l) => (
                      <span key={l} className="bg-gray-100 border border-gray-150 rounded px-1.5 py-0.5">{l}</span>
                    ))}
                  </div>

                  {/* License details */}
                  <p className="text-[10px] text-gray-400 font-mono tracking-wider bg-gray-50 border rounded-lg p-2 text-center w-full">
                    Reg: {doc.mci_license}
                  </p>
                </div>

                <div className="border-t border-gray-50 pt-3 space-y-3">
                  <div className="flex justify-between items-baseline text-xs font-bold text-gray-500">
                    <span>Consultation Fee:</span>
                    <span className="text-sm font-black text-gray-950">₹{doc.fee}</span>
                  </div>

                  {doc.is_online ? (
                    <button
                      onClick={() => handleStartCall(doc)}
                      className="w-full py-2.5 bg-[#0D7377] hover:bg-[#14919B] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5"
                    >
                      <Video className="w-4 h-4" /> Consult Online Now
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full py-2.5 bg-gray-100 text-gray-400 font-extrabold text-xs uppercase tracking-wider rounded-xl cursor-not-allowed"
                    >
                      Offline | Book Later
                    </button>
                  )}
                </div>

              </div>
            ))}
          </div>

          {/* 4. TELEMEDICINE video calling module canvas (Simulation Modal overlay) */}
          {activeCallDoctor && (
            <div className="fixed inset-0 z-50 bg-[#212121]/95 backdrop-blur-md flex items-center justify-center p-4">
              <div className="w-full max-w-4xl bg-stone-900 text-white rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-[560px] border border-white/5">
                
                {/* Primary Left pane: Webcam feeds */}
                <div className="flex-1 bg-black relative flex flex-col justify-between p-4">
                  
                  {/* Header tags overlay */}
                  <div className="flex items-center justify-between z-10 select-none">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600 text-white text-[9px] font-extrabold uppercase tracking-widest animate-pulse">
                      ● Live HIPAA Telehealth
                    </span>
                    <span className="text-[10px] text-zinc-400">Call ID: MT-VC-11843</span>
                  </div>

                  {/* Main Doctor view video (Simulation mock avatar Unsplash) */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    {callConnected ? (
                      <div className="w-full h-full relative">
                        <img
                          src={activeCallDoctor.image}
                          alt={activeCallDoctor.name}
                          className="w-full h-full object-cover blur-sm opacity-20"
                        />
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-4">
                          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#0D7377] shadow-xl animate-scale-up">
                            <img src={activeCallDoctor.image} alt={activeCallDoctor.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="space-y-0.5">
                            <h3 className="font-extrabold text-base">{activeCallDoctor.name}</h3>
                            <p className="text-xs text-zinc-400">{activeCallDoctor.specialty}</p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center space-y-4">
                        <div className="w-16 h-16 rounded-full border-4 border-t-[#0D7377] border-white/20 animate-spin mx-auto"></div>
                        <p className="text-xs text-zinc-400 font-mono">Routing digital telehealth channels...</p>
                      </div>
                    )}
                  </div>

                  {/* Smaller overlay for user own webcam */}
                  <div className="absolute bottom-4 left-4 w-32 h-24 bg-[#14919B]/20 border border-white/10 rounded-xl overflow-hidden z-10 shadow-lg hidden sm:block">
                    <div className="w-full h-full flex flex-col items-center justify-center text-[10px] text-zinc-400 bg-zinc-950/70 text-center">
                      <span>My Cam</span>
                      <p className="text-[8px] mt-0.5 opacity-60">Sakthidharan (Patient)</p>
                    </div>
                  </div>

                  {/* Controls bar bottom */}
                  <div className="flex justify-center items-center gap-4 z-10 mt-auto pt-4 border-t border-white/5">
                    <button
                      onClick={() => setActiveCallDoctor(null)}
                      className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-full transition-transform hover:scale-105"
                      id="btn-disconnect-call"
                    >
                      <PhoneOff className="w-5 h-5" />
                    </button>
                  </div>

                </div>

                {/* Secondary Right pane: Chat text logs + instant prescription drafting */}
                <div className="w-full md:w-[320px] bg-zinc-900 border-l border-white/5 flex flex-col justify-between">
                  
                  {/* Doctor chat logs messages */}
                  <div className="p-4 border-b border-white/5 flex items-center justify-between">
                    <span className="font-extrabold text-xs uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" /> Dialogue Consultation Chats
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 space-y-3 font-medium text-[11px]">
                    {chatMessages.map((msg, mIdx) => (
                      <div
                        key={mIdx}
                        className={`p-3 rounded-xl max-w-[85%] leading-relaxed ${msg.sender === "doctor" ? "bg-teal-900/40 border border-teal-500/15 text-teal-100 mr-auto" : "bg-zinc-800 text-zinc-100 ml-auto"}`}
                      >
                        {msg.text}
                      </div>
                    ))}
                  </div>

                  {/* Interactive instant Prescription drafting panel */}
                  {prescriptionWritten.length > 0 && (
                    <div className="p-4 bg-emerald-950/40 border-y border-emerald-500/10 text-emerald-100 font-bold text-[10px] space-y-2">
                      <span className="text-[9px] uppercase font-extrabold text-[#14919B] tracking-wider block">
                        ✓ Prescribed Formulation Drafted:
                      </span>
                      <div className="flex items-start gap-1">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <p className="leading-tight">{prescriptionWritten[0]}</p>
                      </div>
                      <button
                        onClick={handlePrescribeAdd}
                        disabled={cartAddingStatus}
                        className="w-full py-1.5 mt-2 bg-[#0D7377] hover:bg-[#14919B] text-white rounded font-black text-[9px] uppercase tracking-wider"
                      >
                        {cartAddingStatus ? "Adding..." : "Unlock formulation & Add to Basket"}
                      </button>
                    </div>
                  )}

                  {/* Input check bar */}
                  <form onSubmit={handleSendMessage} className="p-3 bg-zinc-950 flex gap-2">
                    <input
                      type="text"
                      placeholder="Ask Doctor, e.g. 'bp medication'"
                      value={myMessage}
                      onChange={(e) => setMyMessage(e.target.value)}
                      className="flex-1 text-xs bg-zinc-800 border border-zinc-700/50 rounded-lg px-2.5 py-2 text-white focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="p-2 bg-[#0D7377] hover:bg-[#14919B] rounded-lg text-white"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>

                </div>

              </div>
            </div>
          )}
        </>
      )}

      {viewMode === "ai" && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-6 lg:p-10 space-y-8 animate-fade-in">
          
          <div className="flex items-center gap-3 border-b border-gray-100 pb-5">
            <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center shrink-0">
              <Bot className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight">AI Vision Diagnosis</h2>
              <p className="text-xs text-gray-500 font-medium">Powered by Gemini 3.5 & Smart Speech Delivery</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Left side: Upload & Context */}
            <div className="space-y-6">
              
              <div className="space-y-3">
                <label className="text-xs font-black text-gray-900 uppercase tracking-widest block">1. Select AI Consultant</label>
                <div className="flex gap-2 flex-wrap">
                  {aiSpecialties.map(spec => (
                    <button
                      key={spec}
                      onClick={() => setAiSpecialty(spec)}
                      className={`px-4 py-2 rounded-xl text-sm font-bold transition-all border ${
                        aiSpecialty === spec 
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                          : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {spec}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black text-gray-900 uppercase tracking-widest block flex items-center justify-between">
                  <span>2. Describe Condition & Upload (Optional)</span>
                  <span className="text-indigo-600 text-[10px] bg-indigo-50 px-2 py-0.5 rounded flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Anonymous & Secure</span>
                </label>

                <div className="relative">
                  <textarea
                    placeholder="Describe your symptoms or condition here... or use the mic to speak."
                    className="w-full text-sm bg-gray-50 border border-gray-200 rounded-2xl p-4 pr-12 focus:outline-none focus:border-indigo-500 min-h-[100px] resize-y"
                    value={aiTextInput}
                    onChange={(e) => setAiTextInput(e.target.value)}
                  />
                  <button
                    onClick={startListening}
                    disabled={isListening}
                    className={`absolute right-3 bottom-3 p-2 rounded-xl transition-all ${
                      isListening ? "bg-red-100 text-red-600 animate-pulse" : "bg-indigo-100 text-indigo-600 hover:bg-indigo-300"
                    }`}
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                </div>
                
                <div 
                  className={`border-2 border-dashed rounded-3xl flex flex-col items-center justify-center p-8 transition-all relative overflow-hidden group cursor-pointer ${
                    aiImagePreview ? "border-indigo-200 bg-indigo-50/30" : "border-gray-200 bg-gray-50 hover:bg-indigo-50/50 hover:border-indigo-300"
                  }`}
                  onClick={() => aiFileRef.current?.click()}
                  style={{ minHeight: "150px" }}
                >
                  <input 
                    type="file" 
                    ref={aiFileRef} 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleAiFileUpload}
                  />
                  
                  {aiImagePreview ? (
                    <img 
                      src={aiImagePreview} 
                      alt="Upload Preview" 
                      className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-40 transition-opacity"
                    />
                  ) : null}

                  <div className={`flex flex-col items-center gap-3 text-center z-10 transition-transform ${aiImagePreview ? "opacity-0 group-hover:opacity-100" : ""}`}>
                    <div className="w-12 h-12 bg-white shadow-sm border border-gray-100 rounded-full flex items-center justify-center text-indigo-500">
                      <Camera className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-extrabold text-sm text-gray-900">{aiImagePreview ? "Change Image" : "Click to Upload Optional Image"}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleAiSubmit()}
                    disabled={aiLoading || (!aiTextInput.trim() && !aiImagePreview)}
                    className="flex-1 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-200 disabled:text-gray-400 text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    {aiLoading ? "Processing..." : <><Bot className="w-4 h-4" /> Consult AI Doctor</>}
                  </button>

                  <button
                    onClick={() => setAiCallSessionActive(true)}
                    className="flex-1 py-3.5 bg-zinc-900 hover:bg-black text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <Phone className="w-4 h-4" /> Live Voice Call
                  </button>
                </div>
              </div>

            </div>

            {/* Right side: Results & Audio */}
            <div className="space-y-4">
               <label className="text-xs font-black text-gray-900 uppercase tracking-widest block">3. AI Analysis & Speech</label>
               
               <div className="h-full min-h-[300px] bg-zinc-900 rounded-3xl p-6 border border-zinc-800 text-zinc-100 shadow-xl flex flex-col relative overflow-hidden">
                 
                 {/* Decorative background grid */}
                 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/micro-carbon.png')] opacity-20 pointer-events-none"></div>

                 <div className="relative z-10 flex items-center justify-between border-b border-zinc-800 pb-4 mb-4">
                   <div className="flex items-center gap-2">
                     <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
                       <Bot className="w-4 h-4 text-indigo-400" />
                     </div>
                     <span className="font-bold text-sm tracking-wide text-indigo-100">Consultant Online</span>
                   </div>
                   {(aiLoading || aiAnalysisResult) && (
                     <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-extrabold uppercase tracking-widest text-indigo-400">
                       <Mic className="w-3.5 h-3.5 animate-pulse" /> Live Speech Engaged
                     </div>
                   )}
                 </div>

                 <div className="relative z-10 flex-1 flex flex-col justify-center">
                   {!aiLoading && !aiAnalysisResult && (
                      <div className="text-center text-zinc-600 space-y-3">
                        <Upload className="w-10 h-10 mx-auto opacity-20" />
                        <p className="text-sm font-medium">Provide details or an image to begin.</p>
                      </div>
                   )}

                   {aiLoading && (
                      <div className="text-center space-y-6">
                        <div className="flex justify-center gap-2">
                          <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                          <div className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                          <div className="w-2.5 h-2.5 bg-indigo-300 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                        </div>
                        <p className="text-xs text-indigo-300 font-mono tracking-wider animate-pulse">
                          Processing neural visual features...
                        </p>
                      </div>
                   )}

                   {aiAnalysisResult && !aiLoading && (
                      <div className="space-y-4 animate-fade-in">
                        <div className="flex gap-3 items-start bg-indigo-950/40 p-4 rounded-2xl border border-indigo-500/20">
                          <div className="w-6 h-6 rounded-full bg-indigo-500 shrink-0 mt-0.5 shadow-[0_0_15px_rgba(99,102,241,0.5)] flex items-center justify-center">
                            <Bot className="w-3.5 h-3.5 text-white" />
                          </div>
                          <p className="text-[13px] leading-relaxed text-indigo-50 font-medium">
                            {aiAnalysisResult}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2 text-[10px] text-zinc-500 uppercase tracking-widest font-black justify-end">
                           <FileText className="w-3 h-3" /> Synthesis Delivery Completed
                        </div>
                      </div>
                   )}
                 </div>

               </div>
            </div>
          </div>
        </div>
      )}

      {aiCallSessionActive && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/40 via-black to-black object-cover -z-10 animate-pulse"></div>

          <div className="w-full max-w-lg flex flex-col items-center justify-center space-y-12 h-full relative">
             
             {/* Header */}
             <div className="absolute top-8 w-full left-0 right-0 flex justify-center items-center gap-4">
                 <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-extrabold uppercase tracking-widest animate-pulse">
                   ● Live AI Audio Telehealth
                 </span>
                 <span className="text-[10px] text-zinc-500 font-mono tracking-widest bg-zinc-900 px-3 py-1.5 rounded-full border border-zinc-800">
                    ID: E-LABS-934X
                 </span>
             </div>

             {/* Avatar Center */}
             <div className="relative group flex items-center justify-center scale-150 transform transition-all duration-700">
                <div className={`absolute inset-0 rounded-full transition-opacity duration-500 blur-2xl ${
                  aiLoading ? "bg-indigo-500/50 opacity-100 animate-ping" : 
                  isListening ? "bg-red-500/50 opacity-100 animate-pulse" : "bg-indigo-900/30 opacity-50"
                }`}></div>
                <div className={`relative z-10 w-40 h-40 rounded-full bg-zinc-950 border-4 shadow-2xl flex items-center justify-center overflow-hidden transition-colors duration-500 ${
                  isListening ? "border-red-500/50" : aiLoading ? "border-indigo-400/80" : "border-zinc-800"
                }`}>
                   <Bot className={`w-16 h-16 transition-colors duration-300 ${
                     isListening ? "text-red-400" : aiLoading ? "text-indigo-400" : "text-zinc-500"
                   }`} />
                </div>
             </div>

             <div className="text-center space-y-3 z-10 h-32 flex flex-col items-center justify-center w-full px-8">
                {isListening ? (
                  <p className="text-red-400 font-medium text-lg leading-relaxed animate-pulse">Listening to your symptoms...</p>
                ) : aiLoading ? (
                  <p className="text-indigo-300 font-medium text-lg font-mono tracking-wider animate-pulse">Synthesizing intelligence & vocal delivery...</p>
                ) : (
                  <p className="text-zinc-300 font-medium text-base leading-relaxed text-center line-clamp-3">
                    {aiAnalysisResult ? aiAnalysisResult : "Hi! I am your AI Consultant. Tap the microphone and tell me what you're experiencing today."}
                  </p>
                )}
             </div>

             {/* Bottom Controls */}
             <div className="mt-auto absolute bottom-12 flex flex-col items-center gap-6 z-10 w-full max-w-sm">
                
                <div className="flex gap-6 items-center">
                  <button
                    onClick={startListening}
                    disabled={isListening || aiLoading}
                    className={`w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition-all ${
                      isListening ? "bg-red-600/50 scale-110 pointer-events-none ring-4 ring-red-500 ring-opacity-50" : 
                      aiLoading ? "bg-zinc-800 text-zinc-500 pointer-events-none" : "bg-indigo-600 hover:bg-indigo-500 text-white hover:scale-105"
                    }`}
                  >
                    <Mic className="w-8 h-8" />
                  </button>

                  <button
                    onClick={() => {
                        setAiCallSessionActive(false);
                        window.speechSynthesis.cancel();
                        if (elevenLabsAudioRef.current) elevenLabsAudioRef.current.pause();
                    }}
                    className="w-16 h-16 bg-red-600 hover:bg-red-500 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-105 transition-all"
                  >
                    <PhoneOff className="w-7 h-7" />
                  </button>
                </div>

                {!aiLoading && !isListening && (
                   <p className="text-xs text-zinc-500 uppercase tracking-widest font-black">Tap to speak</p>
                )}
             </div>

          </div>
        </div>
      )}

    </div>
  );
}
