import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "@/models/User";
import connectDB from "@/lib/mongodb";

export async function POST(req) {
  console.log("Starting signup process...");

  try {
    // Log request headers
    const headers = {};
    req.headers.forEach((value, key) => {
      headers[key] = value;
    });
    console.log("Request headers:", headers);

    const { name, email, password } = await req.json();
    console.log("Received signup data:", { name, email, passwordLength: password?.length });

    // Validate input
    if (!name || !email || !password) {
      console.log("Missing required fields:", {
        name: !!name,
        email: !!email,
        password: !!password,
      });
      return NextResponse.json({ error: "Please provide all required fields" }, { status: 400 });
    }

    // Validate password length
    if (password.length < 8) {
      console.log("Password too short:", password.length);
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Connect to database
    try {
      console.log("Attempting to connect to database...");
      await connectDB();
      console.log("Successfully connected to database");
    } catch (error) {
      console.error("Database connection error:", error);
      return NextResponse.json(
        {
          error: "Database connection failed",
          details: process.env.MONGODB_URI
            ? "URI exists but connection failed"
            : "No MongoDB URI found",
        },
        { status: 500 }
      );
    }

    // Check if user already exists
    console.log("Checking for existing user with email:", email);
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("User already exists with email:", email);
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    // Create user
    console.log("Creating new user...");
    const user = await User.create({
      name,
      email,
      password, // Password will be hashed by the pre-save hook
    });
    console.log("User created successfully:", { userId: user._id });

    // Create token
    console.log("Generating JWT token...");
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    console.log("JWT token generated successfully");

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

    console.log("Sending successful response");
    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Signup error:", error);
    console.error("Error stack:", error.stack);
    // Send more specific error messages
    if (error.name === "ValidationError") {
      return NextResponse.json(
        {
          error: Object.values(error.errors)
            .map((err) => err.message)
            .join(", "),
        },
        { status: 400 }
      );
    }
    if (error.code === 11000) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }
    return NextResponse.json(
      {
        error: "Something went wrong during signup",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
