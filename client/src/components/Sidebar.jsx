import React from "react";
import { SignOutButton, useClerk, Show, useUser } from "@clerk/react";
import { NavLink } from "react-router-dom";
import {
  Eraser,
  FileText,
  Hash,
  HomeIcon,
  Image,
  LogOut,
  Scissors,
  SquarePen,
  User,
} from "lucide-react";

const navItems = [
  { to: "/ai", label: "Dashboard", Icon: HomeIcon },
  { to: "/ai/write-article", label: "Write Article", Icon: SquarePen },
  { to: "/ai/blog-titles", label: "Blog Titles", Icon: Hash },
  { to: "/ai/generate-images", label: "Generate Images", Icon: Image },
  { to: "/ai/remove-background", label: "Remove Background", Icon: Eraser },
  { to: "/ai/remove-object", label: "Remove Object", Icon: Scissors },
  { to: "/ai/review-resume", label: "Review Resume", Icon: FileText },
  { to: "/ai/community", label: "Community", Icon: User },
];

const Sidebar = ({ sidebar, setSidebar }) => {
  const { user } = useUser();
  const { SignOutButton, openUserProfile, signOut  } = useClerk();

  return (
    <aside
      className={`fixed left-0 top-14 z-30 flex h-[calc(100vh-56px)] w-60 flex-col items-center justify-between border-r border-gray-200 bg-white shadow-lg transition-transform duration-300 ease-in-out md:static md:top-auto md:h-auto md:shadow-none ${
        sidebar ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      }`}
    >
      <div className="my-7 w-full">
        <img
          src={user.imageUrl}
          alt="User avatar"
          className="mx-auto w-14 rounded-full"
        />
        <h1 className="mt-2 text-center text-sm font-medium">
          {user.fullName}
        </h1>
        <div className="px-6 mt-5 text-sm text-gray-600 font-medium">
          {navItems.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/ai"}
              onClick={() => setSidebar(false)}
              className={({ isActive }) =>
                `px-3.5 py-2.5 flex items-center gap-3 rounded ${isActive ? "bg-linear-to-r from-[#3C81F6] to-[#6c0bc7] text-white" : ""}`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`w-4 h-4 ${isActive ? " text-white " : ""}`}
                  />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>

      <button
        type="button"
        className="mb-4 rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-600 md:hidden"
        onClick={() => setSidebar(false)}
      >
        Close
      </button>
      <div>
        <div className="w-full border-t border-gray-200 px-7 flex items-center justify-between">
          <div
            onClick={openUserProfile}
            className="flex gap-2 items-center cursor-pointer"
          >
            <img src={user.imageUrl} className="w-8 rounded-full" alt="" />
            <div>
              <h1 className="text-sm px-1 py-5 font-medium">{user.fullName}</h1>
            </div>
          </div>
          <LogOut
            onClick={() => signOut()}
            className="w-4.5 flex  text-gray-400 ml-2 hover:text-gray-700 transition cursor-pointer"
          />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
