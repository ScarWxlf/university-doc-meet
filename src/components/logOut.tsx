"use client";
import { signOut } from "next-auth/react";

export default function LogOut() {
  return <button onClick={() => signOut({ callbackUrl: '/' })}>Sign out</button>;
}
