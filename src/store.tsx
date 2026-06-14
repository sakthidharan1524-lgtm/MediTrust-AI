import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Medicine, Pharmacy, CartItem, Order, Prescription, Verification, Doctor } from "./types";

interface StoreContextType {
  // Navigation & Routing
  activePage: string;
  selectedId: string | null;
  navigate: (page: string, id?: string | null) => void;

  // Authentication
  user: User | null;
  login: (emailOrPhone: string) => Promise<boolean>;
  logout: () => void;

  // Search, Filters & Selection
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: (cat: string | null) => void;
  recentSearches: string[];
  addRecentSearch: (term: string) => void;
  clearRecentSearches: () => void;
  
  // Filters Panel
  filters: {
    types: string[];
    rxStatus: string | null; // "OTC" | "Rx" | null
    conditions: string[];
    priceRange: [number, number];
    brands: string[];
    discounts: number[];
    minTrustScore: number | null;
  };
  setFilters: React.Dispatch<React.SetStateAction<StoreContextType["filters"]>>;
  resetFilters: () => void;

  // Catalog Data
  medicines: Medicine[];
  pharmacies: Pharmacy[];
  doctors: Doctor[];
  isLoadingCatalog: boolean;
  refreshCatalog: () => Promise<void>;

  // Cart Management
  cart: CartItem[];
  cartOrderType: "delivery" | "pickup";
  cartPickupPharmacyId: string | null;
  addToCart: (medicineId: string, qty?: number) => void;
  removeFromCart: (medicineId: string) => void;
  updateCartQuantity: (medicineId: string, qty: number) => void;
  clearCart: () => void;
  setCartOrderType: (type: "delivery" | "pickup", pharmacyId?: string | null) => void;

  // Prescription Gate State
  activePrescription: Prescription | null;
  prescriptionLoading: boolean;
  uploadAndScanPrescription: (base64Image: string) => Promise<Prescription>;
  resetPrescription: () => void;

  // Packaging Verification State
  verificationHistory: Verification[];
  verifyPackage: (front: string, back?: string, barcode?: string | null) => Promise<Verification>;

  // Location Coordinate System
  coords: { lat: number; lng: number } | null;
  requestLocation: () => Promise<void>;

  // Transacted Business Log
  orders: Order[];
  createOrder: (address?: string) => Promise<Order>;
  refreshOrders: () => Promise<void>;
  cancelOrder: (orderId: string) => Promise<void>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  // Navigation
  const [activePage, setActivePage] = useState<string>("home");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Auth User state
  const [user, setUser] = useState<User | null>(null);

  // Search & Navigation
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([
    "Paracetamol", "Insulin", "Vitamin C", "Lipitor"
  ]);

  // Catalog State
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoadingCatalog, setIsLoadingCatalog] = useState<boolean>(true);

  // Filtering Panel State
  const initialFilters = {
    types: [] as string[],
    rxStatus: null as string | null,
    conditions: [] as string[],
    priceRange: [0, 2000] as [number, number],
    brands: [] as string[],
    discounts: [] as number[],
    minTrustScore: null as number | null,
  };
  const [filters, setFilters] = useState(initialFilters);

  // Cart
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOrderType, setCartOrderTypeState] = useState<"delivery" | "pickup">("delivery");
  const [cartPickupPharmacyId, setCartPickupPharmacyId] = useState<string | null>(null);

  // Prescription Gateway
  const [activePrescription, setActivePrescription] = useState<Prescription | null>(null);
  const [prescriptionLoading, setPrescriptionLoading] = useState<boolean>(false);

  // Package verification logs
  const [verificationHistory, setVerificationHistory] = useState<Verification[]>([]);

  // Geolocation Coordinates (Defaults to Bangalore city center)
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>({
    lat: 12.9716,
    lng: 77.5946
  });

  // Orders Log list
  const [orders, setOrders] = useState<Order[]>([]);

  const navigate = (page: string, id: string | null = null) => {
    setActivePage(page);
    setSelectedId(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Setup default logged in user for convenience
  useEffect(() => {
    // Perform auto-login of default user so platform works seamlessly
    login("sakthidharan1524@gmail.com");
    requestLocation();
  }, []);

  // Sync state on coords updates
  useEffect(() => {
    refreshCatalog();
  }, [coords]);

  const requestLocation = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          });
        },
        (err) => {
          console.warn("Browser GPS permission declined or failed. Defaulting to Central Bengaluru coordinates.", err);
        }
      );
    }
  };

  const login = async (emailOrPhone: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailOrPhone, password: "demo-password-secure" }),
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        return true;
      }
    } catch (err) {
      console.error("Login process failed", err);
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setCart([]);
    setActivePrescription(null);
    navigate("login");
  };

  const addRecentSearch = (term: string) => {
    if (!term.trim()) return;
    setRecentSearches((prev) => [
      term,
      ...prev.filter((item) => item.toLowerCase() !== term.toLowerCase()),
    ].slice(0, 8));
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
  };

  const resetFilters = () => {
    setFilters(initialFilters);
  };

  const refreshCatalog = async () => {
    setIsLoadingCatalog(true);
    try {
      // 1. Fetch medicines
      const medUrl = `/api/medicines?lat=${coords?.lat || ""}&lng=${coords?.lng || ""}`;
      const medRes = await fetch(medUrl);
      if (medRes.ok) {
        const meds = await medRes.json();
        setMedicines(meds);
      }

      // 2. Fetch pharmacies
      const pharUrl = `/api/pharmacies?lat=${coords?.lat || ""}&lng=${coords?.lng || ""}`;
      const pharRes = await fetch(pharUrl);
      if (pharRes.ok) {
        const phs = await pharRes.json();
        setPharmacies(phs);
      }

      // 3. Fetch doctors
      const docRes = await fetch("/api/doctors");
      if (docRes.ok) {
        const docs = await docRes.json();
        setDoctors(docs);
      }
    } catch (err) {
      console.error("Failed to synchronize applet database", err);
    } finally {
      setIsLoadingCatalog(false);
    }
  };

  // Cart operators
  const addToCart = (medicineId: string, qty: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.medicineId === medicineId);
      if (existing) {
        return prev.map((item) =>
          item.medicineId === medicineId
            ? { ...item, quantity: item.quantity + qty }
            : item
        );
      }
      return [...prev, { medicineId, quantity: qty, pickupPharmacyId: cartPickupPharmacyId }];
    });
  };

  const removeFromCart = (medicineId: string) => {
    setCart((prev) => prev.filter((item) => item.medicineId !== medicineId));
  };

  const updateCartQuantity = (medicineId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(medicineId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.medicineId === medicineId ? { ...item, quantity: qty } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    setActivePrescription(null);
  };

  const setCartOrderType = (type: "delivery" | "pickup", pharmacyId?: string | null) => {
    setCartOrderTypeState(type);
    setCartPickupPharmacyId(pharmacyId || null);
    // Propagate to existing cart items
    setCart((prev) =>
      prev.map((item) => ({
        ...item,
        pickupPharmacyId: type === "pickup" ? pharmacyId : null,
      }))
    );
  };

  // Prescription handling
  const uploadAndScanPrescription = async (base64Image: string): Promise<Prescription> => {
    setPrescriptionLoading(true);
    try {
      const res = await fetch("/api/prescriptions/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64Image }),
      });
      if (res.ok) {
        const data = await res.json();
        setActivePrescription(data);
        return data;
      }
      throw new Error("Prescription parsing returned failure state");
    } finally {
      setPrescriptionLoading(false);
    }
  };

  const resetPrescription = () => {
    setActivePrescription(null);
  };

  // Packaging evaluation checks
  const verifyPackage = async (
    front: string,
    back: string = "",
    barcode: string | null = null
  ): Promise<Verification> => {
    try {
      const res = await fetch("/api/verify-package", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          frontImgBase64: front,
          backImgBase64: back,
          barcodeImgBase64: barcode,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setVerificationHistory((prev) => [data, ...prev]);
        return data;
      }
      throw new Error("Visual packaging verification returned an API failure.");
    } catch (err) {
      console.error("Packaging audit error", err);
      throw err;
    }
  };

  // Order transacting
  const createOrder = async (address?: string): Promise<Order> => {
    // Collect active items
    const cartItemsPayload = cart.map((item) => ({
      medicineId: item.medicineId,
      quantity: item.quantity,
    }));

    // Compute cost
    const totalMRP = cart.reduce((acc, item) => {
      const med = medicines.find((m) => m.id === item.medicineId);
      return acc + (med ? med.price * item.quantity : 0);
    }, 0);

    const payload = {
      cartItems: cartItemsPayload,
      pickupPharmacyId: cartOrderType === "pickup" ? cartPickupPharmacyId : null,
      address: address || user?.address,
      totalAmount: totalMRP + (cartOrderType === "delivery" && totalMRP < 500 ? 40 : 0),
      prescriptionId: activePrescription?.status === "verified" ? activePrescription.id : null,
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const placed = await res.json();
        setOrders((prev) => [placed, ...prev]);
        clearCart();
        return placed;
      }
      throw new Error("API failed to submit medical purchase order.");
    } catch (err) {
      console.error("Purchase failed", err);
      throw err;
    }
  };

  const refreshOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      if (res.ok) {
        const ords = await res.json();
        setOrders(ords);
      }
    } catch (err) {
      console.error("Failed to sync orders data log", err);
    }
  };

  const cancelOrder = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: "POST",
      });
      if (res.ok) {
        await refreshOrders();
      }
    } catch (err) {
      console.error("Failed to cancel order", err);
    }
  };

  return (
    <StoreContext.Provider
      value={{
        activePage,
        selectedId,
        navigate,
        user,
        login,
        logout,
        searchTerm,
        setSearchTerm,
        selectedCategory,
        setSelectedCategory,
        recentSearches,
        addRecentSearch,
        clearRecentSearches,
        filters,
        setFilters,
        resetFilters,
        medicines,
        pharmacies,
        doctors,
        isLoadingCatalog,
        refreshCatalog,
        cart,
        cartOrderType,
        cartPickupPharmacyId,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        setCartOrderType,
        activePrescription,
        prescriptionLoading,
        uploadAndScanPrescription,
        resetPrescription,
        verificationHistory,
        verifyPackage,
        coords,
        requestLocation,
        orders,
        createOrder,
        refreshOrders,
        cancelOrder,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be wrapped inside StoreProvider");
  }
  return context;
}
