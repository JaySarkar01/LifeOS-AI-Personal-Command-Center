import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import { getSessionUserId } from "@/lib/auth/getSessionUser";
import { UserModel } from "@/models/mongoose/User";

export async function GET() {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ success: false, error: { message: "Unauthorized" } }, { status: 401 });
    }

    await connectDB();
    const user = await UserModel.findById(userId).lean();
    if (!user) {
      return NextResponse.json({ success: false, error: { message: "User not found" } }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        name: user.name || "",
        email: user.email,
        preferences: {
          theme: user.preferences?.theme || "system",
          accentColor: user.preferences?.accentColor || "#0284c7",
          notificationsEnabled: user.preferences?.notificationsEnabled ?? true,
          dailyFocusTargetMinutes: user.preferences?.dailyFocusTargetMinutes || 240,
          currency: user.preferences?.currency || "USD",
        },
      },
    });
  } catch (err) {
    console.error("Error in GET /api/settings:", err);
    return NextResponse.json({ success: false, error: { message: "Failed to fetch settings" } }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ success: false, error: { message: "Unauthorized" } }, { status: 401 });
    }

    const body = await req.json();
    await connectDB();

    const updateFields: Record<string, unknown> = {};

    if (body.name !== undefined) {
      updateFields.name = body.name.trim();
    }

    if (body.currency !== undefined) {
      updateFields["preferences.currency"] = body.currency.trim().toUpperCase();
    }

    if (body.theme !== undefined) {
      updateFields["preferences.theme"] = body.theme;
    }

    if (body.notificationsEnabled !== undefined) {
      updateFields["preferences.notificationsEnabled"] = Boolean(body.notificationsEnabled);
    }

    if (body.dailyFocusTargetMinutes !== undefined) {
      updateFields["preferences.dailyFocusTargetMinutes"] = Number(body.dailyFocusTargetMinutes);
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { $set: updateFields },
      { new: true }
    ).lean();

    if (!updatedUser) {
      return NextResponse.json({ success: false, error: { message: "User not found" } }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        name: updatedUser.name || "",
        email: updatedUser.email,
        preferences: {
          theme: updatedUser.preferences?.theme || "system",
          accentColor: updatedUser.preferences?.accentColor || "#0284c7",
          notificationsEnabled: updatedUser.preferences?.notificationsEnabled ?? true,
          dailyFocusTargetMinutes: updatedUser.preferences?.dailyFocusTargetMinutes || 240,
          currency: updatedUser.preferences?.currency || "USD",
        },
      },
    });
  } catch (err) {
    console.error("Error in PATCH /api/settings:", err);
    return NextResponse.json({ success: false, error: { message: "Failed to update settings" } }, { status: 500 });
  }
}

