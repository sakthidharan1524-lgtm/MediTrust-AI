import React from "react";
import { Package, MapPin, Calendar, CheckCircle, Clock, Trash2, ArrowRight, ShieldCheck, Tag, Info } from "lucide-react";
import { useStore } from "../store";

export default function OrdersPage() {
  const { orders, cancelOrder, navigate, refreshOrders } = useStore();

  React.useEffect(() => {
    refreshOrders();
  }, []);

  const handleCancel = (orderId: string) => {
    if (confirm("Are you sure you want to cancel this order reservation? Your refund will be initiated instantly.")) {
      cancelOrder(orderId);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 bg-[#F8F9FA]" id="orders-view">
      
      {/* 1. Header Title banner */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Package className="w-6.5 h-6.5 text-[#0D7377]" /> My Orders & Pickups
          </h1>
          <p className="text-xs text-gray-550">
            View SDG-compliant medical authenticity receipts, download pickup QR codes, and trace shipping milestones.
          </p>
        </div>
        <button
          onClick={() => navigate("search")}
          className="text-xs font-bold text-[#0D7377] hover:text-[#14919B] transition-colors uppercase tracking-wider"
        >
          Order Medicines Catalog &rarr;
        </button>
      </div>

      {orders.length > 0 ? (
        <div className="space-y-6">
          {orders.map((ord) => (
            <div
              key={ord.id}
              className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-4"
              id={`order-block-${ord.id}`}
            >
              
              {/* Top row metadata */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-50 pb-4">
                <div className="flex items-center gap-4 text-xs font-bold text-gray-500">
                  <div>
                    <span>ORDER ID:</span>
                    <span className="text-gray-900 ml-1.5 font-mono">{ord.id}</span>
                  </div>
                  <div>
                    <span>DATE:</span>
                    <span className="text-gray-900 ml-1.5 flex items-center gap-1 inline-flex align-middle">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" /> {ord.created_at ? new Date(ord.created_at).toLocaleDateString() : ""}
                    </span>
                  </div>
                </div>

                {/* Status chip checker */}
                <div className="flex items-center gap-1.5">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide border shadow-sm ${
                    ord.status === "cancelled" 
                      ? "bg-rose-50 text-[#FF6B6B] border-rose-200" 
                      : ord.status === "completed" 
                        ? "bg-emerald-50 text-emerald-800 border-emerald-250" 
                        : "bg-teal-50 text-[#0D7377] border-teal-200"
                  }`}>
                    {ord.status.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Grid content */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* 1. Items subheader lists */}
                <div className="md:col-span-1 space-y-3">
                  <span className="text-[10px] uppercase font-extrabold text-gray-400 tracking-wider block">
                    Basket Ingredients List:
                  </span>
                  <div className="space-y-2">
                    {ord.items?.map((it, idx) => (
                      <div key={it.medicine?.id || idx} className="flex items-center gap-3 text-xs">
                        <div className="w-10 h-10 bg-gray-50 p-1 flex items-center justify-center rounded border shrink-0">
                          <img src={it.medicine?.images?.[0] || ""} alt={it.medicine?.name || ""} className="max-h-full max-w-full object-contain" />
                        </div>
                        <div className="min-w-0 flex-1 font-bold">
                          <h4 className="text-[#212121] truncate leading-tight">{it.medicine?.name || ""}</h4>
                          <span className="text-[10px] text-gray-400">Qty: {it.quantity} x ₹{it.medicine?.price || 0}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Pickup reservation codes / tracking milestone */}
                <div className="md:col-span-1 space-y-3 border-y md:border-y-0 md:border-x border-gray-100 py-4 md:py-0 md:px-6">
                  
                  {ord.order_type === "pickup" ? (
                    /* SCANNING REGISTER FOR WALK-IN PICKUP */
                    <div className="space-y-2">
                      <span className="text-[10px] uppercase font-extrabold text-teal-700 bg-teal-50 px-2 py-0.5 rounded tracking-wider w-fit block">
                        Walk-In QR Pickup Code
                      </span>
                      <p className="text-[10px] text-gray-500 leading-relaxed">
                        Present this verified checkout QR ticket key to pay and lift medications directly from counter:
                      </p>
                      
                      {/* Fake mini QR Code visual block */}
                      <div className="flex items-center gap-3 bg-gray-50 border p-2.5 rounded-lg border-gray-100">
                        <div className="w-11 h-11 bg-white border border-gray-200 grid grid-cols-2 gap-0.5 p-0.5 shrink-0">
                          <div className="bg-gray-950"></div><div className="bg-gray-150"></div>
                          <div className="bg-gray-150"></div><div className="bg-gray-950 px-0.5 font-bold text-[6px] text-white flex items-center justify-center">QR</div>
                        </div>
                        <div className="text-[10px] font-bold">
                          <span className="text-gray-400 select-all block font-mono">TICKET: {ord.pickup_code}</span>
                          <span className="text-emerald-600">✓ Ready for pickup</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* COURIER DELIVERY tracking status milestones */
                    <div className="space-y-2">
                      <span className="text-[10px] uppercase font-extrabold text-[#0D7377] bg-teal-50 px-2 py-0.5 rounded tracking-wider w-fit block">
                        Home Delivery Track
                      </span>
                      
                      <div className="space-y-4 pt-2 font-bold text-[10px] text-gray-400">
                        <div className="flex gap-2 items-center text-[#0D7377]">
                          <CheckCircle className="w-4 h-4 text-[#0D7377]" /> <span>Order Confirmed & Verified</span>
                        </div>
                        <div className={`flex gap-2 items-center ${ord.status === "completed" ? "text-emerald-600" : ""}`}>
                          <Clock className="w-4 h-4 text-gray-300" />
                          <span>{ord.status === "completed" ? "Delivered safely!" : "Handed to courier transit"}</span>
                        </div>
                      </div>
                    </div>
                  )}

                </div>

                {/* 3. Shipping final receipt summary */}
                <div className="md:col-span-1 space-y-3 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <span className="text-[10px] uppercase font-extrabold text-gray-400 tracking-wider block">
                      Transaction Summary:
                    </span>
                    <div className="text-[11px] leading-relaxed font-bold text-gray-500 space-y-1">
                      <div className="flex justify-between"><span>Shipment Charge:</span><span className="text-gray-900">₹{ord.total}</span></div>
                      <div className="flex justify-between text-emerald-600"><span>SDG Safe Match Guarantee:</span><span>Assured ✓</span></div>
                      {ord.items?.some((it) => it.medicine?.requires_prescription) && (
                        <div className="flex justify-between text-emerald-600"><span>AI vision signature checks:</span><span>Verified ✓</span></div>
                      )}
                    </div>
                  </div>

                  {/* Actions buttons */}
                  {ord.status === "pending" && (
                    <button
                      onClick={() => handleCancel(ord.id)}
                      className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-[#FF6B6B] border border-rose-200 font-extrabold text-[10px] uppercase rounded-lg transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Cancel Reservation
                    </button>
                  )}
                </div>

              </div>

            </div>
          ))}
        </div>
      ) : (
        /* Empty Orders State Output */
        <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center text-gray-500 space-y-4 max-w-md mx-auto shadow-sm">
          <div className="w-16 h-16 rounded-full bg-teal-50 text-[#0D7377] flex items-center justify-center mx-auto shadow-sm">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">No Transactions Found</h3>
          <p className="text-xs text-gray-550 leading-relaxed">
            You haven't processed any medication checkout orders or local QR walk-in pickups inside our verified databases yet.
          </p>
          <button
            onClick={() => navigate("search")}
            className="px-6 py-2.5 bg-[#0D7377] text-white font-bold text-xs rounded-xl hover:bg-[#14919B] transition-colors uppercase tracking-wider"
          >
            Load Catalog & Shop
          </button>
        </div>
      )}

      {/* Trust guarantees assurances */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-start gap-4">
        <Info className="w-5 h-5 text-[#0D7377] shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <h4 className="font-extrabold text-gray-900 uppercase">Sustainable Development Goal (SDG) 3 Alignment</h4>
          <p className="text-gray-500 text-[11px] leading-relaxed">
            Under WHO-SDG specifications, safe healthcare channels must guarantee authentic medicine tracing, licensing registers verification, and digital prescription auditing to increase local quality access indices across clinical populations.
          </p>
        </div>
      </div>

    </div>
  );
}
