import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { NextResponse, NextRequest } from "next/server";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { email, password, name } = body;
    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({message: 'Email already exists'}, {status: 400})
        } 
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        await prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
                role: 'user',
            },
        });
        return NextResponse.json({message: 'User created'}, {status: 201})
    } catch (error) {
        let errorMessage = 'Something went wrong';
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        return NextResponse.json({message: errorMessage}, {status: 500})
    }

}
