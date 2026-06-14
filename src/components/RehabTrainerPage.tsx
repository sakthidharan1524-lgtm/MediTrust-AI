import React, { useState, useEffect, useRef } from "react";
import { useStore } from "../store";
import { Activity, Camera, RotateCw, AlertTriangle, ShieldCheck, Dumbbell, Zap, Flame, BarChart3, TrendingUp, StopCircle } from "lucide-react";

const MuscleMap = ({ strong, weak }: { strong: string[], weak: string[] }) => {
  const muscleGroups = [
    { id: "Chest", label: "Chest", x: 50, y: 35 },
    { id: "Shoulders", label: "Shoulders", x: 30, y: 28 },
    { id: "Core", label: "Core", x: 50, y: 55 },
    { id: "Lower Back", label: "Lower Back", x: 45, y: 65 },
    { id: "Arms", label: "Arms", x: 20, y: 50 },
    { id: "Glutes", label: "Glutes", x: 50, y: 75 },
    { id: "Quads", label: "Quads", x: 35, y: 95 },
    { id: "Hamstrings", label: "Hamstrings", x: 65, y: 105 },
  ];

  return (
    <div className="relative w-full max-w-[220px] mx-auto aspect-[1/2] bg-gray-900 rounded-3xl p-4 shadow-inner overflow-hidden border border-gray-800">
      <div className="absolute inset-0 flex items-center justify-center opacity-30">
        <svg viewBox="0 0 100 200" className="w-full h-full text-blue-500 fill-current">
          <circle cx="50" cy="15" r="10" />
          <path d="M 30 30 C 30 30, 25 35, 30 70 L 70 70 C 75 35, 70 30, 70 30 Z" />
          <path d="M 25 35 C 10 35, 15 80, 15 80" stroke="currentColor" fill="none" strokeWidth="6" strokeLinecap="round" />
          <path d="M 75 35 C 90 35, 85 80, 85 80" stroke="currentColor" fill="none" strokeWidth="6" strokeLinecap="round" />
          <path d="M 35 70 L 30 160" stroke="currentColor" fill="none" strokeWidth="8" strokeLinecap="round" />
          <path d="M 65 70 L 70 160" stroke="currentColor" fill="none" strokeWidth="8" strokeLinecap="round" />
        </svg>
      </div>

      {muscleGroups.map((m) => {
         const isStrong = strong.some(s => m.id.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(m.id.toLowerCase()));
         const isWeak = weak.some(w => m.id.toLowerCase().includes(w.toLowerCase()) || w.toLowerCase().includes(m.id.toLowerCase()));

         let colorClass = "bg-gray-500/30";
         let pulseClass = "";
         if (isStrong) {
            colorClass = "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]";
         } else if (isWeak) {
            colorClass = "bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.9)]";
            pulseClass = "animate-pulse";
         }

         return (
            <div key={m.id} className="absolute flex flex-col items-center" style={{ left: `${m.x}%`, top: `${m.y}%`, transform: 'translate(-50%, -50%)' }}>
               <div className={`w-3 h-3 rounded-full ${colorClass} ${pulseClass} border-2 border-gray-900 z-10 transition-colors duration-500`}></div>
               {(isStrong || isWeak) && (
                 <span className={`text-[8px] font-black uppercase mt-1 px-1 rounded truncate w-max ${isStrong ? 'text-emerald-400' : 'text-red-400'} bg-black/80 backdrop-blur-sm z-20`}>
                   {m.label}
                 </span>
               )}
            </div>
         );
      })}
    </div>
  )
};

export default function RehabTrainerPage() {
  const [isActive, setIsActive] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [mistakeAlert, setMistakeAlert] = useState<string | null>(null);
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [score, setScore] = useState<number>(0);
  const [reps, setReps] = useState<number>(0);
  
  const [muscles, setMuscles] = useState({
    strong: ["Chest", "Shoulders"],
    weak: ["Lower Back", "Hamstrings"]
  });

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
        };
      }
      setIsActive(true);
      // start processing loop
      timerRef.current = setInterval(captureAndAnalyze, 5000); // every 5 seconds
    } catch (err) {
      console.error("Camera access Error: ", err);
      alert("Camera access denied or unavailable.");
    }
  };

  const stopCamera = () => {
    setIsActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current || isProcessing) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (ctx && video.readyState >= 2) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const base64Image = canvas.toDataURL("image/jpeg", 0.5); // High compression to save bandwidth

      setIsProcessing(true);
      try {
        const res = await fetch("/api/rehab-trainer/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageBase64: base64Image })
        });
        
        if (res.ok) {
          const data = await res.json();
          // Assume data brings { mistakeAlert, recommendation, scoreDiff, repsDiff, muscles }
          if (data.mistakeAlert) setMistakeAlert(data.mistakeAlert);
          else setMistakeAlert(null);

          if (data.recommendation) setRecommendation(data.recommendation);
          
          if (data.scoreDiff) setScore(prev => Math.min(100, Math.max(0, prev + data.scoreDiff)));
          if (data.repsDiff) setReps(prev => prev + data.repsDiff);
          if (data.muscles) setMuscles(data.muscles);
        }
      } catch (err) {
        console.error("Error analyzing frame", err);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row gap-6 md:items-end justify-between border-b pb-6 shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0D7377] to-teal-800 flex items-center justify-center shadow-lg shadow-teal-900/20">
            <Activity className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-[#212121] tracking-tight">AI Rehab Trainer</h1>
            <p className="text-sm font-medium text-gray-500 mt-1">Real-time form tracking & muscle analysis coach.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Camera / AR Mirror */}
        <div className="lg:col-span-2 space-y-6">
          <div className="relative rounded-2xl overflow-hidden bg-gray-900 border-4 border-gray-100 shadow-xl min-h-[400px] flex items-center justify-center">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline
              muted
              className={`w-full h-full object-cover rounded-xl absolute inset-0 -scale-x-100 ${!isActive ? 'hidden' : ''}`}
            />
            
            {!isActive && (
               <div className="text-center text-gray-400 space-y-4 py-20 z-10">
                  <Camera className="w-16 h-16 mx-auto opacity-50" />
                  <p className="text-sm font-medium tracking-wide font-mono uppercase">Camera Offline</p>
               </div>
            )}

            {/* Overlay Alerts */}
            {isActive && mistakeAlert && (
              <div className="absolute top-4 left-4 right-4 bg-red-600/90 backdrop-blur-sm text-white p-4 rounded-xl flex items-start gap-3 shadow-2xl animate-fade-in border border-red-400/30">
                 <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5 text-red-200" />
                 <div>
                    <h4 className="font-bold">High Risk Mistake Detected</h4>
                    <p className="text-sm text-red-100 mt-1 leading-relaxed">{mistakeAlert}</p>
                 </div>
              </div>
            )}

            {/* Overlay Recommendation / Good Job */}
            {isActive && !mistakeAlert && recommendation && (
              <div className="absolute bottom-4 left-4 right-4 bg-[#0D7377]/90 backdrop-blur-sm text-white p-4 rounded-xl flex items-center gap-3 shadow-2xl animate-fade-in border border-teal-400/30">
                 <ShieldCheck className="w-6 h-6 shrink-0 text-teal-200" />
                 <p className="text-sm font-medium leading-relaxed">{recommendation}</p>
              </div>
            )}

            {/* Video Processing Indicator */}
            {isProcessing && (
              <div className="absolute top-4 right-4">
                <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-gray-700">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></div>
                  <span className="text-[10px] text-white font-mono uppercase tracking-wider">Analyzing</span>
                </div>
              </div>
            )}
            
            <canvas ref={canvasRef} className="hidden" />
          </div>

          <div className="flex justify-center">
            {isActive ? (
              <button 
                onClick={stopCamera}
                className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-md active:scale-95"
              >
                <StopCircle className="w-5 h-5" /> End Session
              </button>
            ) : (
              <button 
                onClick={startCamera}
                className="flex items-center gap-2 bg-gradient-to-r from-[#0D7377] to-teal-800 hover:shadow-lg text-white px-8 py-3 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-teal-900/20"
              >
                <Camera className="w-5 h-5" /> Start Recording
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Dashboard */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#0D7377]" /> Session Stats
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                 <div className="text-gray-500 text-xs font-bold uppercase mb-1">Score</div>
                 <div className="text-3xl font-black text-[#0D7377]">{score}<span className="text-sm font-medium text-gray-400">/100</span></div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                 <div className="text-gray-500 text-xs font-bold uppercase mb-1">Repetitions</div>
                 <div className="text-3xl font-black text-gray-800">{reps}</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#0D7377]" /> Muscle Adherence
            </h3>

            <div className="mb-6">
              <MuscleMap strong={muscles.strong} weak={muscles.weak} />
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm mb-2">
                  <Flame className="w-4 h-4" /> Strong / Improving
                </div>
                <div className="flex flex-wrap gap-2">
                   {muscles.strong.map((m, idx) => (
                     <span key={idx} className="bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-bold rounded-lg border border-emerald-100">
                       {m}
                     </span>
                   ))}
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100">
                <div className="flex items-center gap-2 text-amber-600 font-bold text-sm mb-2 mt-2">
                  <Zap className="w-4 h-4" /> Weak / Imbalanced
                </div>
                <div className="flex flex-wrap gap-2">
                   {muscles.weak.map((m, idx) => (
                     <span key={idx} className="bg-amber-50 text-amber-700 px-3 py-1 text-xs font-bold rounded-lg border border-amber-100">
                       {m}
                     </span>
                   ))}
                </div>
              </div>
            </div>
            
            <p className="text-xs text-gray-400 mt-6 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
               Your progress is continuously analyzed. We flag any high-risk form mistakes securely to your physical therapist dashboard to ensure your safety.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
