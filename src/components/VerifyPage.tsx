import React, { useState, useRef } from "react";
import { ShieldCheck, ShieldAlert, Sparkles, Upload, FileText, CheckCircle2, XCircle, FileCheck } from "lucide-react";
import { useStore } from "../store";

export default function VerifyPage() {
  const { 
    activePrescription, 
    prescriptionLoading, 
    uploadAndScanPrescription, 
    resetPrescription 
  } = useStore();
  
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string; preview: string } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const uploadPresetPrescription = async (type: "valid" | "forged") => {
    setUploadedFile({
      name: type === "valid" ? "Dr_Catherine_Howard_Rx_512.jpg" : "Altered_Signature_MCI_Fake_Rx.png",
      size: "1.2 MB",
      preview: "preset_image_block_simulated"
    });

    const base64Stub = type === "valid" ? "MOCKED_VALID_BASE64_STRING_LENGTH_ODD" : "MOCKED_FORGED_BASE64_STRING_LENGTH_EVEN_BY_SEVEN";
    await uploadAndScanPrescription(base64Stub);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-[#F8F9FA]" id="verify-prescription-view">
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 text-[#0D7377] rounded-full text-[10px] font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#0D7377]" /> AI Prescription Analytics
          </span>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Prescription & Medicine Bill Verification
          </h1>
          <p className="text-xs text-gray-550 leading-relaxed font-semibold">
            Upload your medicine bills or doctor's prescription invoice to check for authenticity, toxic substances, and doctor registration validity.
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-b from-orange-50/50 to-white/95 rounded-2xl border border-orange-500/10 p-6 md:p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-[#FF6B6B] shadow-sm">
            <FileCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
              Standalone Verification
            </h2>
            <p className="text-xs text-gray-500">
              Verified prescriptions linked here will automatically persist within your shopping cart.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1 space-y-4 bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <span className="text-[10px] uppercase font-bold text-orange-600 block">
              STEP 1: Upload Medicine Bill / Rx
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
            <div className="space-y-2 pt-2 border-t border-gray-50">
              <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest block">
                Quick Sandbox Testing Presets:
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <button onClick={() => uploadPresetPrescription("valid")} disabled={prescriptionLoading} className="py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-[9px] rounded-lg border border-emerald-200 text-center">
                  Load Valid Bill / Rx
                </button>
                <button onClick={() => uploadPresetPrescription("forged")} disabled={prescriptionLoading} className="py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-[9px] rounded-lg border border-rose-200 text-center">
                  Load Suspect Bill / Rx
                </button>
              </div>
            </div>
          </div>
          
          <div className="md:col-span-1 space-y-4 bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-orange-600 block mb-2">
                STEP 2: Real-time Analysis
              </span>
              {prescriptionLoading ? (
                <div className="space-y-4 py-4 text-center">
                  <div className="relative w-full h-24 bg-gray-50 border border-gray-200 rounded-lg overflow-hidden flex items-center justify-center">
                    <FileText className="w-10 h-10 text-teal-600 opacity-60" />
                    <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#0D7377] to-transparent animate-scan"></div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-black text-gray-800 animate-pulse">Scanning metadata stamps...</p>
                  </div>
                </div>
              ) : uploadedFile ? (
                <div className="space-y-3 pt-1 text-[11px] leading-relaxed text-gray-500 font-bold">
                  <div className="flex justify-between items-center bg-gray-50 p-2 rounded border border-gray-100">
                    <span>Doctor:</span>
                    <span className="text-[#0D7377]">{activePrescription?.doctor_name || "..."}</span>
                  </div>
                  <div className="flex justify-between items-center bg-gray-50 p-2 rounded border border-gray-100">
                    <span>License:</span>
                    <span className="text-gray-900">{activePrescription?.doctor_reg_number || "..."}</span>
                  </div>
                  <div className="flex justify-between items-center bg-gray-50 p-2 rounded border border-gray-100">
                    <span>Date:</span>
                    <span className="text-gray-900">{activePrescription?.prescription_date || "..."}</span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 space-y-2">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Audit Checks</p>
                    <div className="flex justify-between items-center bg-gray-50 p-2 rounded border border-gray-100">
                      <span className="flex items-center gap-1.5 font-bold text-gray-600">
                        {activePrescription?.is_bill_valid ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5 text-rose-500" />}
                        Valid / Authenticity
                      </span>
                      {activePrescription?.is_bill_valid ? <span className="text-emerald-700 font-extrabold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">PASS</span> : <span className="text-rose-600 font-extrabold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">FAIL</span>}
                    </div>
                    <div className="flex justify-between items-center bg-gray-50 p-2 rounded border border-gray-100">
                      <span className="flex items-center gap-1.5 font-bold text-gray-600">
                        {activePrescription?.not_ai_generated ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <XCircle className="w-3.5 h-3.5 text-rose-500" />}
                        Human Document
                      </span>
                      {activePrescription?.not_ai_generated ? <span className="text-emerald-700 font-extrabold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">YES</span> : <span className="text-rose-600 font-extrabold bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">AI GEN</span>}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-40 flex items-center justify-center border border-gray-100 rounded-lg bg-gray-50 text-center p-4">
                  <p className="text-[11px] text-gray-400">Upload receipt image to start real-time digital analysis.</p>
                </div>
              )}
            </div>
            {(uploadedFile || activePrescription) && (
              <button onClick={() => { resetPrescription(); setUploadedFile(null); }} className="w-full mt-4 py-1.5 border border-[#FF6B6B]/30 hover:bg-rose-50 text-[#FF6B6B] font-bold text-[10px] uppercase rounded-lg transition-all">
                Reset Scanner
              </button>
            )}
          </div>

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
                        Prescription Verified ✓
                      </span>
                      <p className="text-[11px] text-gray-400 leading-relaxed">
                        Doctor license registry and transaction checks confirm active status. You can now proceed to checkout freely.
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
            
            <div className="text-[9px] text-gray-400 bg-teal-50 border border-teal-100 rounded p-2.5 flex items-start gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#0D7377] shrink-0 mt-0.5" />
              <span>Verified prescriptions are automatically securely applied to your cart.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
