import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { NextResponse, NextRequest } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { email, password, name } = body
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        return NextResponse.json({message: 'User already exists'}, {status: 400})
    } 
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create new user
    const newUser = await prisma.user.create({
        data: {
            email,
            name,
            password: hashedPassword,
            role: 'user',
        },
    });

    return NextResponse.json({message: 'User created', user: newUser}, {status: 201})
}
