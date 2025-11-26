import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function BottomNavbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const items = [
    { label: "Home", to: "/welcome", icon: "🏠" },
    { label: "Topics", to: "/view-topics", icon: "📚" },
    { label: "Calendar", to: "/calendar", icon: "🗓️" },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#1c1c1c] text-white shadow-lg">
      <div className="flex justify-around items-center py-2">

        {items.map((item, idx) => {
          const active = location.pathname === item.to;

          return (
            <div
              key={idx}
              onClick={() => navigate(item.to)}
              className={`flex flex-col items-center cursor-pointer transition-all
               ${active ? "text-red-400 scale-110" : "text-gray-300"}`}
            >
              <div className="text-xl">{item.icon}</div>
              <span className="text-[11px] mt-1">{item.label}</span>
            </div>
          );
        })}

      </div>
    </div>
  );
}
