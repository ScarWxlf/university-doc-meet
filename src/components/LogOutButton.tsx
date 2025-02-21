"use client";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LogOutButton({className}: {className?: string}) {
  const router = useRouter();
  return <button className={className} onClick={async () => {
    await signOut({ redirect: false })
    router.replace('/')
  }}>Sign out</button>;
}
