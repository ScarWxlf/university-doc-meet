import { getServerSession } from "next-auth";
import { headers } from 'next/headers';
import Image from "next/image";
import Link from "next/link";
import LogOut from "@/components/logOut";

export default async function Header() {
  const session = await getServerSession();

  const headersList = await headers();
  const pathname = headersList.get('x-pathname');

  if(pathname === '/signin' || pathname === '/signup'){
    return null;
  }

  return (
    <header className="flex items-center justify-between h-20 px-4 py-3 bg-white shadow-md">
      <Link className="flex items-center" href='/'>
        <Image src="/images/logo.svg" alt="Logo" width={30} height={30} />
        <h1 className="ml-2 text-xl font-semibold">DMS</h1>
      </Link>
      <nav>
        {session ? (
          <ul className="flex space-x-4">
            <li>
            <Link href="/profile">
                Profile
              </Link>
            </li>
            <li>
              <LogOut />
            </li>
          </ul>
          ) : (
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
          )}
      </nav>
    </header>
  );
}
