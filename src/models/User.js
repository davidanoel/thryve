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

const goalSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  type: {
    type: String,
    required: true,
    enum: ["mood", "sleep", "activity", "social"],
  },
  target: {
    type: Number,
    required: true,
  },
  deadline: Date,
  progress: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ["active", "completed", "abandoned"],
    default: "active",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: Date,
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
    goals: [goalSchema],
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

// Update goal progress when a new mood entry is added
UserSchema.pre("save", function (next) {
  if (this.isModified("moodEntries")) {
    const recentEntries = this.moodEntries.slice(-7);

    this.goals.forEach((goal, index) => {
      if (goal.status !== "active") return;

      let progress = 0;
      switch (goal.type) {
        case "mood":
          const avgMood =
            recentEntries.reduce((sum, entry) => {
              const moodValue = {
                "Very Happy": 5,
                Happy: 4,
                Neutral: 3,
                Sad: 2,
                "Very Sad": 1,
              }[entry.mood];
              return sum + moodValue;
            }, 0) / recentEntries.length;
          progress = (avgMood / goal.target) * 100;
          break;

        case "sleep":
          const avgSleep =
            recentEntries.reduce((sum, entry) => sum + entry.sleepQuality, 0) /
            recentEntries.length;
          progress = (avgSleep / goal.target) * 100;
          break;

        case "social":
          const avgSocial =
            recentEntries.reduce((sum, entry) => sum + entry.socialInteractionCount, 0) /
            recentEntries.length;
          progress = (avgSocial / goal.target) * 100;
          break;

        case "activity":
          const avgActivities =
            recentEntries.reduce((sum, entry) => sum + entry.activities.length, 0) /
            recentEntries.length;
          progress = (avgActivities / goal.target) * 100;
          break;
      }

      // Update progress and check if goal is completed
      this.goals[index].progress = Math.min(Math.max(progress, 0), 100);
      if (this.goals[index].progress >= 100 && !this.goals[index].completedAt) {
        this.goals[index].status = "completed";
        this.goals[index].completedAt = new Date();
      }
    });
  }
  next();
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
