import { NextResponse } from "next/server";
import { z } from "zod";
import connectDB from "@/lib/db/mongoose";
import { UserModel } from "@/models/mongoose/User";
import { hashPassword } from "@/lib/auth/password";

const RegisterSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = RegisterSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: parsed.error.issues[0]?.message || "Invalid registration input",
          },
        },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    await connectDB();

    const existingUser = await UserModel.findOne({ email: normalizedEmail });
    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: { message: "An account with this email address already exists" },
        },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);

    const newUser = await UserModel.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      preferences: {
        theme: "system",
        accentColor: "#0284c7",
        notificationsEnabled: true,
        dailyFocusTargetMinutes: 240,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          id: newUser._id.toString(),
          name: newUser.name,
          email: newUser.email,
        },
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Error in registration API:", err);
    return NextResponse.json(
      { success: false, error: { message: "Failed to register user account" } },
      { status: 500 }
    );
  }
}
