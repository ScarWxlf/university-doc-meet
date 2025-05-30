"use client";
import { Button, buttonVariants } from "@/components/ui/button";
import DecorativeFileSection from "@/components/DecorativeFileSection";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { signIn } from 'next-auth/react';
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { loginSchema } from "@/lib/validator";
import { z } from "zod";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";

export default function SignIn() {
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>({});
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = data.get("email");
    const password = data.get("password");

    try {
      setErrors({});
      loginSchema.parse({ email, password });
      const response = await signIn('credentials', { email, password, redirect: false});
      if(response?.error){
        toast.error(response.error, {
          position: 'bottom-right'
        })
      } else {
        router.replace('/?loginSuccess=true')
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = error.flatten().fieldErrors;
        setErrors(fieldErrors);
      } else {
        toast.error((error as Error).message, {
          position: "bottom-right",
        });
      }
    }
  };
  return (
    <div className="flex h-screen flex-col lg:flex-row flex-grow lg:overflow-hidden">
      <div className="h-full w-full lg:w-3/5 p-10 flex flex-grow flex-col order-1 lg:-order-1">
        <div className="flex justify-between items-center">
          <Link className="flex gap-2 text-xl font-medium" href='/'>
            <Image src="/images/logo.svg" width={30} height={30} alt="logo" />
            DMS
          </Link>
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
              <Button variant="outline" className="flex items-center gap-2" onClick={async () => {
                await signIn('google', {callbackUrl: '/?loginSuccess=true'})
              }}>
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
            {errors?.email && (
                <div className="flex flex-col text-red-500 text-sm text-start w-full">
                  {errors.email.map((error) => (
                    <div key={error} className="flex items-center gap-2">
                      <div className="h-1 w-1 rounded-full bg-black"></div>
                      <div className="my-1">{error}</div>
                    </div>
                  ))}
                </div>
              )}
            <div className="relative w-full my-2">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                id="password"
                className="border-2 border-gray-300 rounded-md p-2 w-full pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:scale-125 transition-transform duration-200"
              >
                {showPassword ? <IoMdEyeOff size={20} /> : <IoMdEye size={20} />}
              </button>
            </div>
            {errors?.password && (
                <div className="flex flex-col text-red-500 text-sm text-start w-full">
                  {errors.password.map((error) => (
                    <div key={error} className="flex items-center gap-2">
                      <div className="h-1 w-1 rounded-full bg-black"></div>
                      <div className="my-1">{error}</div>
                    </div>
                  ))}
                </div>
              )}
            <Button
              type="submit"
              variant="default"
              size="default"
              className="w-full mt-3 mb-4"
            >
              Sign In
            </Button>
          </form>
        </div>
      </div>
      <DecorativeFileSection bgImage="/images/signin-bg.png" />
    </div>
  );
}
