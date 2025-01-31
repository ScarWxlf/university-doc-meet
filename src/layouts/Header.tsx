"use client";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import LogOutButton from "@/components/LogOutButton";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: session, status } = useSession();
  const pathname = usePathname();

  if (pathname === "/signin" || pathname === "/signup") {
    return null;
  }

  return (
    <nav className="flex items-center justify-between h-20 px-16 py-3 bg-white shadow-md">
      <Link className="flex items-center" href="/">
        <Image src="/images/logo.svg" alt="Logo" width={30} height={30} />
        <h1 className="ml-2 text-xl font-semibold">DMS</h1>
      </Link>
      <ul className="flex gap-12">
        <li>
          <Link href="/">Documents</Link>
        </li>
        <li>
          <Link href="/meetings">Meetings</Link>
        </li>
      </ul>
      <ul className="flex items-center gap-4">
        {status === "loading" ? null : session ? (
          <>
            <li>
              <Image src='/images/bell.svg' width={20} height={20} alt='notification' />
            </li>
            <li className="relative">
              <button onClick={()=>{setMenuOpen(!menuOpen)}}>
                <Image
                  className="rounded-full"
                  src={session!.user!.image!}
                  width={40}
                  height={40}
                  alt="avatar"
                />
              </button>
              <div className={cn("transition-all duration-300",{
                "opacity-0 scale-95 pointer-events-none": !menuOpen,
                "opacity-100 scale-100": menuOpen,
              })}>
                <div className="absolute transform translate-x-1/2 right-1/2 w-24 gap-2 bg-white rounded-md shadow-md text-start">
                  <Link href="/profile" className="inline-block text-start pl-5 hover:bg-gray-300 py-1 rounded-t-md w-full">
                    Profile
                  </Link>
                  <hr />
                  <LogOutButton className="inline-block text-start pl-5 hover:bg-gray-300 py-1 rounded-b-md w-full"/>
                </div>
              </div>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link href="/signin">Sign In</Link>
            </li>
            <li>
              <Link href="/signup">Sign Up</Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}
