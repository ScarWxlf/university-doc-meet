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
      profileUpdateSchema.parse({ email:form.email, password:form.password, confirmPassword:form.confirmPassword, name:form.name });
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
        await update({ name: form.name})
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
    <div className="flex flex-col h-screen bg-gray-100 px-16">
      <div className="flex flex-col items-center bg-white p-6 px-16 my-4 rounded-lg shadow-md w-full space-y-4">
        {status === "authenticated" && (
          <div className="flex flex-col items-center gap-3 w-full">
            <Image
              className="rounded-full"
              src={user?.image || "/images/avatar-placeholder.png"}
              width={120}
              height={120}
              alt="avatar"
            />
            <p className="text-2xl">{user?.name}</p>
          </div>
        )}

        <p className="text-lg mb-6">Update your nickname and password</p>

        <div className="flex justify-center gap-3 w-full">
          <div className="w-2/4">
            <label className="block font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              disabled
              className="border-2 border-gray-300 rounded-md p-2 my-2 w-full bg-gray-100"
            />

            <label className="block font-medium mb-1">New Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter new name"
              value={form.name}
              onChange={handleChange}
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
          </div>

          <div className="w-2/4">
            <label className="block font-medium mb-1">New Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter new password"
              value={form.password}
              onChange={handleChange}
              className="border-2 border-gray-300 rounded-md p-2 my-2 w-full"
            />
            <label className="block font-medium mb-1">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm new password"
              value={form.confirmPassword}
              onChange={handleChange}
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
          </div>
        </div>

        <Button className="w-2/5 mt-4" onClick={handleSave} disabled={loading}>
          {loading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}