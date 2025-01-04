"use client";
import { Button, buttonVariants } from "@/components/button";
import DecorativeFileSection from "@/components/DecorativeFileSection";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { FormEvent } from "react";
import { signIn } from 'next-auth/react';

export default function SignIn() {
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = data.get("email");
    const password = data.get("password");

    await signIn('credentials', { email, password });
  };
  return (
    <div className="flex flex-col lg:flex-row flex-grow lg:overflow-hidden">
      <div className="h-full w-full lg:w-3/5 p-10 flex flex-grow flex-col order-1 lg:-order-1">
        <div className="flex justify-between items-center">
          <div className="flex gap-2 text-xl font-medium">
            <Image src="/images/logo.svg" width={30} height={30} alt="logo" />
            Logo Here
          </div>
          <div className="text-sm">
            <span>Don&apos;t have an account?</span>
            <Link
              href="/signup"
              className={cn(buttonVariants({ variant: "link", size: "link" }))}
            >
              {" "}
              Sign up!
            </Link>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center flex-grow">
          <div className="flex flex-col gap-4 w-full items-center">
            <div className="text-center my-2">
              <h1 className="text-4xl font-bold">Welcome Back</h1>
              <h2 className="text-xl">Login into your account</h2>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex items-center gap-2" onClick={() => signIn('google')}>
                <Image
                  src="/images/google.svg"
                  width={20}
                  height={20}
                  alt="google"
                />
                Google
              </Button>
            </div>
            <div className="flex items-center justify-center w-1/2 my-2">
              <div className="border-t border-gray-400 flex-grow"></div>
              <span className="px-2 text-black text-sm">Or continue with</span>
              <div className="border-t border-gray-400 flex-grow" />
            </div>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col items-center justify-center w-2/3 sm:w-1/2">
            <input
              name="email"
              type="email"
              placeholder="Email"
              className="border-2 border-gray-300 rounded-md p-2 my-2 w-full"
            />
            <input
              name="password"
              type="password"
              placeholder="Password"
              className="border-2 border-gray-300 rounded-md p-2 my-2 w-full"
            />
            <Button
              type="submit"
              variant="default"
              size="default"
              className="w-full"
            >
              Sign Up
            </Button>
          </form>
        </div>
      </div>
      <DecorativeFileSection bgImage="/images/signin-bg.png" />
    </div>
  );
}
