import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "@/models/User";
import connectDB from "@/lib/mongodb";

export async function POST(req) {
  console.log("Starting login process...");

  try {
    const { email, password } = await req.json();
    console.log("Received login attempt for email:", email);

    console.log("Connecting to database...");
    await connectDB();
    console.log("Database connected");

    // Check if user exists
    console.log("Looking up user...");
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      console.log("User not found");
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    console.log("User found");

    // Check password
    console.log("Checking password...");
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      console.log("Password incorrect");
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    console.log("Password correct");

    // Update last login
    console.log("Updating last login...");
    user.lastLogin = new Date();
    await user.save();
    console.log("Last login updated");

    // Create token
    console.log("Generating JWT token...");
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    console.log("JWT token generated");

    // Set the token in a cookie
    console.log("Setting cookie...");
    const cookieStore = cookies();
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax", // Changed from 'strict' to 'lax' for better compatibility
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });
    console.log("Cookie set successfully");

    // Remove password from response
    user.password = undefined;

    console.log("Login successful, sending response");
    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Login error:", error);
    console.error("Error stack:", error.stack);
    return NextResponse.json(
      {
        error: "Something went wrong",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
