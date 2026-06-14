import React from "react";
import { StoreProvider, useStore } from "./store";
import Header from "./components/Header";
import Homepage from "./components/Homepage";
import SearchPage from "./components/SearchPage";
import MedicineDetailPage from "./components/MedicineDetailPage";
import CartPage from "./components/CartPage";
import LoginPage from "./components/LoginPage";
import NearbyPage from "./components/NearbyPage";
import DoctorConsultPage from "./components/DoctorConsultPage";
import RehabTrainerPage from "./components/RehabTrainerPage";
import VerifyPage from "./components/VerifyPage";
import OrdersPage from "./components/OrdersPage";
import OriginalityPage from "./components/OriginalityPage";

function AppContent() {
  const { activePage, isLoadingCatalog } = useStore();

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans select-none antialiased text-[#212121]">
      
      {/* 2. Sticky Brand Header navigation */}
      <Header />

      {/* 3. Primary Applet Window View wrapper */}
      <main className="flex-grow">
        {isLoadingCatalog ? (
          /* Sleek medical catalog spinner visualizer */
          <div className="w-full h-[70vh] flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 rounded-full border-4 border-[#0D7377] border-t-transparent animate-spin"></div>
            <p className="text-xs text-gray-500 font-mono tracking-wider">Syncing SDG-3 clinical catalogs...</p>
          </div>
        ) : (
          /* View dispatcher */
          <div className="animate-fade-in transition-opacity duration-300">
            {activePage === "home" && <Homepage />}
            {activePage === "search" && <SearchPage />}
            {activePage === "medicine" && <MedicineDetailPage />}
            {activePage === "cart" && <CartPage />}
            {activePage === "login" && <LoginPage />}
            {activePage === "nearby" && <NearbyPage />}
            {activePage === "consult" && <DoctorConsultPage />}
            {activePage === "trainer" && <RehabTrainerPage />}
            {activePage === "verify" && <VerifyPage />}
            {activePage === "orders" && <OrdersPage />}
            {activePage === "originality" && <OriginalityPage />}
          </div>
        )}
      </main>

    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
