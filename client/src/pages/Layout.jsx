import React, { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";
import { Menu, X } from "lucide-react";
import Sidebar from "../components/Sidebar";
import { useUser, SignIn } from "@clerk/react";

const Layout = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useUser();

  return user ? (
    <div className="flex h-screen flex-col">
      <nav className="flex min-h-16 w-full items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-8">
        <img
          src={assets.logo}
          alt="logo"
          className="h-8 cursor-pointer"
          onClick={() => navigate("/")}
        />

        <button
          type="button"
          className="rounded-md p-2 text-gray-600 md:hidden"
          onClick={() => setSidebarOpen((prev) => !prev)}
          aria-label={sidebarOpen ? "Close menu" : "Open menu"}
        >
          {sidebarOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </nav>

      <div className="relative flex h-[calc(100vh-56px)] flex-1 overflow-hidden">
        <div
          className={`fixed inset-0 z-20 bg-black/40 transition-opacity duration-300 md:hidden ${
            sidebarOpen
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0"
          }`}
          onClick={() => setSidebarOpen(false)}
        />

        <Sidebar sidebar={sidebarOpen} setSidebar={setSidebarOpen} />

        <div className="flex-1 overflow-auto bg-[#F4F7FB]">
          <Outlet />
        </div>
      </div>
    </div>
  ) : (
    <div className="flex h-screen items-center justify-center">
      <SignIn />
    </div>
  );
};

export default Layout;
