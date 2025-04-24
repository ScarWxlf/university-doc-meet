import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

interface UserProfile {
  email?: string;
  name: string;
  password?: string;
}

export async function PATCH(req: Request) {
  try {
    const { email, name, password } = await req.json();

    if (!email || !name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updateData: UserProfile = { name };

    if (password && password.length > 0) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    await prisma.user.update({
      where: { email },
      data: updateData,
    });

    return NextResponse.json({ message: "Profile updated" });
  } catch (error) {
    console.log("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
