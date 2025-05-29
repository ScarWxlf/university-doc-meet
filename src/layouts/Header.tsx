"use client";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import LogOutButton from "@/components/LogOutButton";
import { useState } from "react";
import { cn } from "@/lib/utils";
import NotificationDropdown from "@/components/NotificationDropdown";
import DropdownWrapper from "@/components/DropdownWrapper";
import { HiMenu, HiX } from "react-icons/hi";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session, status } = useSession();
  const pathname = usePathname();

  if (pathname === "/signin" || pathname === "/signup" || pathname.startsWith("/rooms/")) {
    return null;
  }

  return (
    <nav className="flex items-center justify-between h-16 md:h-20 px-12 lg:px-16 py-3 bg-white shadow-md relative">
      <Link className="flex items-center z-20" href="/">
        <Image src="/images/logo.svg" alt="Logo" width={30} height={30} />
        <h1 className="ml-2 text-lg md:text-xl font-semibold">DMS</h1>
      </Link>

      <ul className="hidden md:flex gap-8 lg:gap-12">
        <li>
          <Link 
            href="/" 
            className={cn(
              "hover:text-green-600 transition-colors",
              pathname === "/" && "text-green-600 font-medium"
            )}
          >
            Documents
          </Link>
        </li>
        <li>
          <Link 
            href="/meetings"
            className={cn(
              "hover:text-green-600 transition-colors",
              pathname === "/meetings" && "text-green-600 font-medium"
            )}
          >
            Meetings
          </Link>
        </li>
      </ul>

      <ul className="hidden md:flex items-center gap-4">
        {status === "loading" ? null : session ? (
          <>
            <li className="relative">
              <NotificationDropdown />
            </li>
            <li className="relative">
              <button onClick={() => setMenuOpen(!menuOpen)}>
                <Image
                  className="rounded-full hover:ring-2 hover:ring-green-300 transition-all"
                  src={session!.user!.image!}
                  width={40}
                  height={40}
                  alt="avatar"
                />
              </button>
              <DropdownWrapper isOpen={menuOpen} onClose={() => setMenuOpen(false)}>
                <div className={cn("transition-all duration-300", {
                  "opacity-0 scale-95 pointer-events-none": !menuOpen,
                  "opacity-100 scale-100 pointer-events-auto": menuOpen,
                })}>
                  <div className="absolute transform translate-x-1/2 right-1/2 w-32 bg-white rounded-md shadow-lg border text-start mt-2">
                    <Link 
                      href="/profile" 
                      className="block px-4 py-2 hover:bg-gray-100 rounded-t-md transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      Profile
                    </Link>
                    <hr className="border-gray-200" />
                    <LogOutButton className="block px-4 py-2 hover:bg-gray-100 rounded-b-md w-full text-left transition-colors"/>
                  </div>
                </div>
              </DropdownWrapper>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link 
                href="/signin"
                className="px-4 py-2 text-green-600 hover:text-green-800 border border-green-600 rounded-md transition-colors"
              >
                Sign In
              </Link>
            </li>
            <li>
              <Link 
                href="/signup"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                Sign Up
              </Link>
            </li>
          </>
        )}
      </ul>

      <div className="flex md:hidden items-center gap-2">
        {session && (
          <div className="relative">
            <NotificationDropdown />
          </div>
        )}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-md hover:bg-gray-100 transition-colors z-20"
        >
          {mobileMenuOpen ? (
            <HiX className="w-6 h-6" />
          ) : (
            <HiMenu className="w-6 h-6" />
          )}
        </button>
      </div>

      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div className={cn(
        "fixed top-0 right-0 h-full w-64 bg-white shadow-xl transform transition-transform duration-300 z-20 md:hidden",
        {
          "translate-x-0": mobileMenuOpen,
          "translate-x-full": !mobileMenuOpen,
        }
      )}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <span className="text-lg font-semibold">Menu</span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              <HiX className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 py-4">
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/"
                  className={cn(
                    "block px-6 py-3 hover:bg-gray-100 transition-colors",
                    pathname === "/" && "bg-green-50 text-green-600 border-r-2 border-green-600"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Documents
                </Link>
              </li>
              <li>
                <Link 
                  href="/meetings"
                  className={cn(
                    "block px-6 py-3 hover:bg-gray-100 transition-colors",
                    pathname === "/meetings" && "bg-green-50 text-green-600 border-r-2 border-green-600"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Meetings
                </Link>
              </li>
            </ul>
          </div>

          <div className="border-t p-4">
            {status === "loading" ? null : session ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Image
                    className="rounded-full"
                    src={session!.user!.image!}
                    width={40}
                    height={40}
                    alt="avatar"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{session.user?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{session.user?.email}</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <Link 
                    href="/profile"
                    className="block px-3 py-2 text-sm hover:bg-gray-100 rounded-md transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <LogOutButton className="block px-3 py-2 text-sm hover:bg-gray-100 rounded-md w-full text-left transition-colors"/>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Link 
                  href="/signin"
                  className="block w-full px-4 py-2 text-center text-green-600 border border-green-600 rounded-md hover:bg-green-50 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link 
                  href="/signup"
                  className="block w-full px-4 py-2 text-center bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}