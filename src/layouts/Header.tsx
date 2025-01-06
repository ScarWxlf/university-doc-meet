'use client'
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
    const pathname = usePathname();
    if (pathname === '/signin' || pathname === '/signup') {
        return null;
    }
  return (
    <header className="flex items-center justify-between h-20 px-4 py-3 bg-white shadow-md">
      <Link className="flex items-center" href='/'>
        <Image src="/images/logo.svg" alt="Logo" width={30} height={30} />
        <h1 className="ml-2 text-xl font-semibold">DMS</h1>
      </Link>
      <nav>
        <ul className="flex space-x-4">
          <li>
            <Link href="/signin">
              Sign In
            </Link>
          </li>
          <li>
            <Link href="/signup">
              Sign Up
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
