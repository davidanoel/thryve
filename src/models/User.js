import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const activitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: false,
  },
  duration: {
    type: Number,
    required: false,
  },
  isSocial: {
    type: Boolean,
    required: false,
  },
});

const moodEntrySchema = new mongoose.Schema({
  mood: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  activities: {
    type: [activitySchema],
    default: [],
  },
  notes: {
    type: String,
  },
  sleepQuality: {
    type: Number,
  },
  energyLevel: {
    type: Number,
  },
  socialInteractionCount: {
    type: Number,
  },
  stressLevel: {
    type: Number,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a name"],
    },
    email: {
      type: String,
      required: [true, "Please provide an email"],
      unique: true,
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please provide a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: 6,
      select: false,
    },
    moodEntries: [moodEntrySchema],
    preferences: {
      notifications: {
        type: Boolean,
        default: true,
      },
      theme: {
        type: String,
        default: "light",
      },
      reminderTime: {
        type: String,
        default: "20:00",
      },
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.models.User || mongoose.model("User", UserSchema);
