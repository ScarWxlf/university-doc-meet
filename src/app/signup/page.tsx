'use client'
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Button, buttonVariants } from "@/components/button";
import { cn } from "@/lib/utils";

export default function SignUp() {
  const [animated, setAnimated] = useState(false);

  const handleMouseEnter = () => {
      if(!animated){
        setAnimated(true);
        setTimeout(() => {
          setAnimated(false);
        }, 3000);
      }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("submit");
  }
  
  return (
    <div className="flex flex-grow h-full overflow-hidden">
      <div className="w-2/5 relative">
        <Image
          src="/images/signup-bg.png"
          width={1000}
          height={1000}
          alt="employee"
          className="h-full w-full object-cover"
        />
        <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-50"></div>
        <div className="absolute top-1/2 -translate-y-1/2 flex w-full h-full">
          <div className="relative flex w-full h-full">
            <Image
              className="absolute top-2 left-2 z-10 -rotate-[10deg] hover:scale-110 transition-transform duration-300 shadow-filter"
              src="/images/doc.png"
              width={300}
              height={300}
              alt="doc"
            />
            <Image
              className="absolute left-2 bottom-2 z-20 rotate-[30deg] hover:scale-110 transition-transform duration-300 shadow-filter"
              src="/images/pdf.png"
              width={300}
              height={300}
              alt="pdf"
            />
            <Image
              className={`absolute left-64 top-5 rotate-[50deg] z-30 transition-transform origin-bottom-left shadow-filter ${animated ? "animate-fallAndWobble" : ""}`}
              src="/images/xls.png"
              onMouseOver={handleMouseEnter}
              width={300}
              height={300}
              alt="xls"
            />
          </div>
        </div>
      </div>
      <div className="h-full w-3/5 p-10 flex-grow flex flex-col">
        <div className="flex justify-between items-center">
          <div className="flex gap-2 text-xl font-medium">
            <Image src="/images/logo.svg" width={30} height={30} alt="logo" />
            Logo Here
          </div>
          <div className="text-sm">
            <span>Have an account?</span>
            <Link href="/signin" className={cn(buttonVariants({ variant: "link", size: 'link' }))}>
              {" "}
              Sign in!
            </Link>
          </div>
        </div>
        <div className="flex flex-col items-center justify-between flex-grow">
          <div className="flex flex-col items-center w-full justify-center h-full">
            <div className="flex flex-col gap-4 w-full items-center">
              <div className="text-center my-2">
                <h1 className="text-4xl font-bold">Get Started With DMS</h1>
                <h2 className="text-xl">Getting started is easy</h2>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex items-center gap-2">
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
                <span className="px-2 text-black text-sm">
                  Or continue with
                </span>
                <div className="border-t border-gray-400 flex-grow" />
              </div>
            </div>
            <form className="flex flex-col items-center justify-center w-1/2" onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="Full Name"
                className="border-2 border-gray-300 rounded-md p-2 my-2 w-full"
              />
              <input
                type="email"
                placeholder="Email"
                className="border-2 border-gray-300 rounded-md p-2 my-2 w-full"
              />
              <input
                type="password"
                placeholder="Password"
                className="border-2 border-gray-300 rounded-md p-2 my-2 w-full"
              />
              <input
                type="password"
                placeholder="Confirm Password"
                className="border-2 border-gray-300 rounded-md p-2 my-2 w-full"
              />
              <Button type="submit" variant="default" size="default" className="w-full">
                Sign Up
              </Button>
            </form>
          </div>
          <div>
            By continuing you indicate that you read and agreed to the Terms of
            Use
          </div>
        </div>
      </div>
    </div>
  );
}
