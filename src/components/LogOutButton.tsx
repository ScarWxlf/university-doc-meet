"use client";
import { signOut } from "next-auth/react";

export default function LogOutButton({className}: {className?: string}) {
  return <button className={className} onClick={() => signOut({ callbackUrl: '/' })}>Sign out</button>;
}
