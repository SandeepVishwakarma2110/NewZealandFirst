import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/cppy.jpg";

export default function TopNavbar() {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user.role ?? 2;

  // ROLE-BASED MENU
  const menuItems = {
    0: [
      { label: "Home", to: "/welcome" },
      { label: "Manage Topics", to: "/main" },
      { label: "View Topics", to: "/view-topics" },
      { label: "Dashboard", to: "/admin" },
    ],
    1: [
      { label: "Home", to: "/welcome" },
      { label: "Manage Topics", to: "/main" },
      { label: "View Topics", to: "/view-topics" },
    ],
    2: [
      { label: "Home", to: "/welcome" },
      { label: "View Topics", to: "/view-topics" },
    ],
  };

  const links = menuItems[role];

  return (
    <>
      {/* NAVBAR */}
      <nav className="w-full bg-[#1c1c1c] text-white px-4 py-3 shadow flex items-center justify-between">

        {/* LEFT — LOGO */}
        <div
          className="flex items-center space-x-2 cursor-pointer"
          onClick={() => navigate("/welcome")}
        >
          <img src={logo} alt="Logo" className="h-9 w-9 rounded" />
          <span className="hidden md:block text-lg font-semibold tracking-wide">
            LevelUp
          </span>

          {/* Show name in mobile */}
          <span className="md:hidden text-md font-semibold tracking-wide">
            LevelUp
          </span>
        </div>

        {/* MIDDLE — USER BADGE (MOBILE ONLY) */}
        <div
            onClick={() => navigate("/profile")}
            className="flex items-center space-x-2 cursor-pointer lg:hidden"
          >
            <div className="bg-red-600 h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold">
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <span className="text-sm">{user.name || "User"}</span>
          </div>

        {/* DESKTOP MENU */}
        <div className="hidden md:flex items-center space-x-8 text-sm font-medium">
          {links.map((item, i) => (
            <Link key={i} to={item.to} className="hover:text-gray-300 transition">
              {item.label}
            </Link>
          ))}
        </div>

        {/* RIGHT — MENUBAR ICON (MOBILE ONLY) */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden text-3xl"
        >
          ☰
        </button>

        {/* DESKTOP RIGHT — NOTIFICATIONS + PROFILE */}
        <div className="hidden md:flex items-center space-x-6">
           

          <div
            onClick={() => navigate("/profile")}
            className="flex items-center space-x-2 cursor-pointer"
          >
            <div className="bg-red-600 h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold">
              {user.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>
            <span className="text-sm">{user.name || "User"}</span>
          </div>
        </div>

      </nav>

      {/* MOBILE DROPDOWN MENU */}
      {mobileOpen && (
        <div className="md:hidden bg-[#1c1c1c] text-white px-6 py-3 space-y-3 shadow">
          {links.map((item, idx) => (
            <div
              key={idx}
              onClick={() => {
                navigate(item.to);
                setMobileOpen(false);
              }}
              className="py-2 border-b border-gray-700 cursor-pointer"
            >
              {item.label}
            </div>
          ))}

          {/* PROFILE LINK */}
          <div
            className="py-2 cursor-pointer"
            onClick={() => {
              navigate("/profile");
              setMobileOpen(false);
            }}
          >
            👤 Profile
          </div>
        </div>
      )}
    </>
  );
}
