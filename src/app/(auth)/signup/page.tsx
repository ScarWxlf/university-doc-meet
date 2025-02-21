"use client";
import Image from "next/image";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import DecorativeFileSection from "@/components/DecorativeFileSection";
import { FormEvent, useState } from "react";
import { registerSchema } from "@/lib/validator";
import { toast } from "react-toastify";
import { z } from "zod";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignUp() {
  const [errors, setErrors] = useState<Record<string, string[] | undefined>>(
    {}
  );
  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = data.get("email");
    const password = data.get("password");
    const confirmPassword = data.get("confirmPassword");
    const name = data.get("name");
    try {
      setErrors({});
      registerSchema.parse({ email, password, confirmPassword, name });
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
          name,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const responseJson = await response.json();
      if (!response.ok) {
        toast.error(responseJson.message, {
          position: "bottom-right",
        });
        return;
      }
      await signIn("credentials", { email, password, redirect: false });
      router.replace("/?loginSuccess=true");
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors = error.flatten().fieldErrors;
        setErrors(fieldErrors);
      }else{
        toast.error((error as Error).message, {
          position: "bottom-right",
        });
      }
    }

  };

  return (
    <div className="flex flex-col lg:flex-row flex-grow">
      <DecorativeFileSection bgImage="/images/signup-bg.png" />
      <div className="h-full w-full lg:w-3/5 p-10 flex-grow flex flex-col">
        <div className="flex justify-between items-center">
          <Link className="flex gap-2 text-xl font-medium" href='/'>
            <Image src="/images/logo.svg" width={30} height={30} alt="logo" />
            DMS
          </Link>
          <div className="text-sm">
            <span>Have an account?</span>
            <Link
              href="/signin"
              className={cn(buttonVariants({ variant: "link", size: "link" }))}
            >
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
                <Button variant="outline" className="flex items-center gap-2" onClick={async () => {
                      await signIn('google', {callbackUrl: "/?loginSuccess=true"})
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
                <span className="px-2 text-black text-sm">
                  Or continue with
                </span>
                <div className="border-t border-gray-400 flex-grow" />
              </div>
            </div>
            <form
              className="flex flex-col items-center justify-center w-2/3 sm:w-1/2"
              onSubmit={handleSubmit}
            >
              <input
                name="name"
                type="text"
                placeholder="Full Name"
                className="border-2 border-gray-300 rounded-md p-2 my-2 w-full"
              />
              {errors?.name && (
                <div className="flex flex-col text-red-500 text-sm text-start w-full">
                  {errors.name.map((error) => (
                    <div key={error} className="flex items-center gap-2">
                      <div className="h-1 w-1 rounded-full bg-black"></div>
                      <div className="my-1">{error}</div>
                    </div>
                  ))}
                </div>
              )}
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
              <input
                name="password"
                type="password"
                placeholder="Password"
                className="border-2 border-gray-300 rounded-md p-2 my-2 w-full"
              />
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
              <input
                name="confirmPassword"
                type="password"
                placeholder="Confirm Password"
                className="border-2 border-gray-300 rounded-md p-2 my-2 w-full"
              />
              {errors.confirmPassword && (
                <div className="flex flex-col text-red-500 text-sm text-start w-full">
                  {errors.confirmPassword.map((error) => (
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
