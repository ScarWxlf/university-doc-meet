"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { profileUpdateSchema } from "@/lib/validator";
import { toast } from "react-toastify";
import { z } from "zod";
import { useSession } from "next-auth/react";
import Image from "next/image";

export default function Profile() {
  const { data: session, status, update } = useSession();
  const user = session?.user;

  const [form, setForm] = useState({
    email: "",
    name: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Record<string, string[] | undefined>>(
    {}
  );

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated" && user) {
      setForm((prev) => ({
        ...prev,
        email: user.email ?? "",
        name: user.name ?? "",
      }));
    }
  }, [user, status]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!form.name && !form.password) {
      toast.error("Please enter a new nickname or password");
      return;
    }

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      setErrors({});
      profileUpdateSchema.parse({ 
        email: form.email, 
        password: form.password, 
        confirmPassword: form.confirmPassword, 
        name: form.name 
      });
      
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          name: form.name,
          password: form.password || undefined,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        toast.success("Profile updated successfully!");
        setForm((prev) => ({ ...prev, password: "", confirmPassword: "" }));
        await update({ name: form.name });
      } else {
        toast.error(result.error || "Failed to update profile");
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        const fieldErrors = err.flatten().fieldErrors;
        setErrors(fieldErrors);
      } else {
        toast.error("Error: " + (err as Error).message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 px-4 sm:px-8 lg:px-16 py-4">
      <div className="flex flex-col items-center bg-white p-4 sm:p-6 lg:p-8 xl:px-16 my-2 sm:my-4 rounded-lg shadow-md w-full max-w-6xl mx-auto space-y-4 sm:space-y-6">
        
        {/* User Info Section */}
        {status === "authenticated" && (
          <div className="flex flex-col items-center gap-3 w-full">
            <Image
              className="rounded-full"
              src={user?.image || "/images/avatar-placeholder.png"}
              width={120}
              height={120}
              alt="avatar"
            />
            <p className="text-xl sm:text-2xl font-medium text-center">{user?.name}</p>
          </div>
        )}

        <p className="text-base sm:text-lg mb-2 sm:mb-6 text-center text-gray-600">
          Update your nickname and password
        </p>

        {/* Form Section */}
        <div className="flex flex-col lg:flex-row justify-center gap-4 lg:gap-6 w-full max-w-4xl">
          
          {/* Left Column - Email and Name */}
          <div className="w-full lg:w-1/2 space-y-4">
            <div>
              <label className="block font-medium mb-2 text-sm sm:text-base">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                disabled
                className="border-2 border-gray-300 rounded-md p-2 sm:p-3 w-full bg-gray-100 text-sm sm:text-base"
              />
            </div>

            <div>
              <label className="block font-medium mb-2 text-sm sm:text-base">
                New Name
              </label>
              <input
                type="text"
                name="name"
                placeholder="Enter new name"
                value={form.name}
                onChange={handleChange}
                className="border-2 border-gray-300 rounded-md p-2 sm:p-3 w-full text-sm sm:text-base focus:border-blue-500 focus:outline-none"
              />
              {errors?.name && (
                <div className="flex flex-col text-red-500 text-xs sm:text-sm text-start w-full mt-2">
                  {errors.name.map((error) => (
                    <div key={error} className="flex items-center gap-2">
                      <div className="h-1 w-1 rounded-full bg-red-500 flex-shrink-0"></div>
                      <div className="my-1">{error}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Password Fields */}
          <div className="w-full lg:w-1/2 space-y-4">
            <div>
              <label className="block font-medium mb-2 text-sm sm:text-base">
                New Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="Enter new password"
                value={form.password}
                onChange={handleChange}
                className="border-2 border-gray-300 rounded-md p-2 sm:p-3 w-full text-sm sm:text-base focus:border-blue-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block font-medium mb-2 text-sm sm:text-base">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm new password"
                value={form.confirmPassword}
                onChange={handleChange}
                className="border-2 border-gray-300 rounded-md p-2 sm:p-3 w-full text-sm sm:text-base focus:border-blue-500 focus:outline-none"
              />
            </div>
            
            {errors?.password && (
              <div className="flex flex-col text-red-500 text-xs sm:text-sm text-start w-full mt-2">
                {errors.password.map((error) => (
                  <div key={error} className="flex items-center gap-2">
                    <div className="h-1 w-1 rounded-full bg-red-500 flex-shrink-0"></div>
                    <div className="my-1">{error}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <Button 
          className="w-full sm:w-80 lg:w-96 mt-4 sm:mt-6 py-2 sm:py-3 text-sm sm:text-base" 
          onClick={handleSave} 
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}