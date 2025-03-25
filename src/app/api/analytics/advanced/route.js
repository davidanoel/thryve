import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import User from "@/models/User";
import connectDB from "@/lib/mongodb";

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(session.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get all mood entries
    const entries = user.moodEntries.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    // Calculate statistical metrics
    const metrics = calculateMetrics(entries);

    // Generate insights
    const insights = generateInsights(metrics);

    return NextResponse.json({
      success: true,
      metrics,
      insights,
    });
  } catch (error) {
    console.error("Get advanced analytics error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

function calculateMetrics(entries) {
  // Convert mood labels to numeric values
  const moodValues = entries.map((entry) => {
    const moodMap = {
      "Very Happy": 4,
      Happy: 3,
      Neutral: 2,
      Sad: 1,
      "Very Sad": 0,
    };
    return moodMap[entry.mood] || 2; // Default to Neutral if unknown
  });

  // Calculate basic statistics
  const stats = {
    totalEntries: entries.length,
    averageMood: moodValues.reduce((a, b) => a + b, 0) / moodValues.length,
    moodVolatility: calculateVolatility(moodValues),
    weeklyTrends: calculateWeeklyTrends(entries),
    activityCorrelations: calculateActivityCorrelations(entries),
    sleepImpact: calculateSleepImpact(entries),
    socialImpact: calculateSocialImpact(entries),
    stressImpact: calculateStressImpact(entries),
  };

  return stats;
}

function calculateVolatility(values) {
  if (values.length < 2) return 0;
  const changes = [];
  for (let i = 1; i < values.length; i++) {
    changes.push(Math.abs(values[i] - values[i - 1]));
  }
  return changes.reduce((a, b) => a + b, 0) / changes.length;
}

function calculateWeeklyTrends(entries) {
  const weeklyData = {};
  entries.forEach((entry) => {
    const date = new Date(entry.createdAt);
    // Get the start of the week (Monday) by subtracting the day number (0-6) from the date
    const weekStart = new Date(date);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    weekStart.setDate(diff);
    const weekKey = weekStart.toISOString().split("T")[0];

    if (!weeklyData[weekKey]) {
      weeklyData[weekKey] = {
        moodSum: 0,
        count: 0,
        activities: {},
        sleepQuality: 0,
        energyLevel: 0,
        socialInteractionCount: 0,
        stressLevel: 0,
      };
    }

    const moodValue =
      {
        "Very Happy": 4,
        Happy: 3,
        Neutral: 2,
        Sad: 1,
        "Very Sad": 0,
      }[entry.mood] || 2;

    weeklyData[weekKey].moodSum += moodValue;
    weeklyData[weekKey].count += 1;

    // Aggregate activities
    entry.activities.forEach((activity) => {
      if (!weeklyData[weekKey].activities[activity.name]) {
        weeklyData[weekKey].activities[activity.name] = 0;
      }
      weeklyData[weekKey].activities[activity.name] += activity.duration;
    });

    // Aggregate other metrics
    weeklyData[weekKey].sleepQuality += entry.sleepQuality;
    weeklyData[weekKey].energyLevel += entry.energyLevel;
    weeklyData[weekKey].socialInteractionCount += entry.socialInteractionCount;
    weeklyData[weekKey].stressLevel += entry.stressLevel;
  });

  // Calculate averages and format data
  return Object.entries(weeklyData)
    .sort(([a], [b]) => new Date(a) - new Date(b)) // Sort by date
    .map(([week, data]) => ({
      week,
      averageMood: data.moodSum / data.count,
      activities: data.activities,
      averageSleepQuality: data.sleepQuality / data.count,
      averageEnergyLevel: data.energyLevel / data.count,
      averageSocialInteractionCount: data.socialInteractionCount / data.count,
      averageStressLevel: data.stressLevel / data.count,
    }));
}

function calculateActivityCorrelations(entries) {
  const activityMoodMap = {};
  entries.forEach((entry) => {
    const moodValue =
      {
        "Very Happy": 4,
        Happy: 3,
        Neutral: 2,
        Sad: 1,
        "Very Sad": 0,
      }[entry.mood] || 2;

    entry.activities.forEach((activity) => {
      if (!activityMoodMap[activity.name]) {
        activityMoodMap[activity.name] = {
          moodSum: 0,
          count: 0,
        };
      }
      activityMoodMap[activity.name].moodSum += moodValue;
      activityMoodMap[activity.name].count += 1;
    });
  });

  return Object.entries(activityMoodMap).map(([activity, data]) => ({
    activity,
    averageMood: data.moodSum / data.count,
    frequency: data.count,
  }));
}

function calculateSleepImpact(entries) {
  const sleepMoodMap = {};
  entries.forEach((entry) => {
    const moodValue =
      {
        "Very Happy": 4,
        Happy: 3,
        Neutral: 2,
        Sad: 1,
        "Very Sad": 0,
      }[entry.mood] || 2;

    if (!sleepMoodMap[entry.sleepQuality]) {
      sleepMoodMap[entry.sleepQuality] = {
        moodSum: 0,
        count: 0,
      };
    }
    sleepMoodMap[entry.sleepQuality].moodSum += moodValue;
    sleepMoodMap[entry.sleepQuality].count += 1;
  });

  return Object.entries(sleepMoodMap).map(([quality, data]) => ({
    quality: parseInt(quality),
    averageMood: data.moodSum / data.count,
    frequency: data.count,
  }));
}

function calculateSocialImpact(entries) {
  const socialMoodMap = {};
  entries.forEach((entry) => {
    const moodValue =
      {
        "Very Happy": 4,
        Happy: 3,
        Neutral: 2,
        Sad: 1,
        "Very Sad": 0,
      }[entry.mood] || 2;

    if (!socialMoodMap[entry.socialInteractionCount]) {
      socialMoodMap[entry.socialInteractionCount] = {
        moodSum: 0,
        count: 0,
      };
    }
    socialMoodMap[entry.socialInteractionCount].moodSum += moodValue;
    socialMoodMap[entry.socialInteractionCount].count += 1;
  });

  return Object.entries(socialMoodMap).map(([count, data]) => ({
    count: parseInt(count),
    averageMood: data.moodSum / data.count,
    frequency: data.count,
  }));
}

function calculateStressImpact(entries) {
  const stressMoodMap = {};
  entries.forEach((entry) => {
    const moodValue =
      {
        "Very Happy": 4,
        Happy: 3,
        Neutral: 2,
        Sad: 1,
        "Very Sad": 0,
      }[entry.mood] || 2;

    if (!stressMoodMap[entry.stressLevel]) {
      stressMoodMap[entry.stressLevel] = {
        moodSum: 0,
        count: 0,
      };
    }
    stressMoodMap[entry.stressLevel].moodSum += moodValue;
    stressMoodMap[entry.stressLevel].count += 1;
  });

  return Object.entries(stressMoodMap).map(([level, data]) => ({
    level: parseInt(level),
    averageMood: data.moodSum / data.count,
    frequency: data.count,
  }));
}

function generateInsights(metrics) {
  const insights = [];

  // Mood volatility insights
  if (metrics.moodVolatility > 1.5) {
    insights.push({
      type: "volatility",
      title: "High Mood Volatility",
      description:
        "Your mood has been showing significant fluctuations. This might indicate increased stress or emotional sensitivity.",
      recommendation:
        "Consider practicing mindfulness or stress-reduction techniques to help stabilize your mood.",
    });
  }

  // Weekly trend insights
  const recentWeeks = metrics.weeklyTrends.slice(-4);
  if (recentWeeks.length >= 2) {
    const trend = recentWeeks[recentWeeks.length - 1].averageMood - recentWeeks[0].averageMood;
    if (Math.abs(trend) > 0.5) {
      insights.push({
        type: "trend",
        title: trend > 0 ? "Improving Mood Trend" : "Declining Mood Trend",
        description: `Your mood has been ${
          trend > 0 ? "improving" : "declining"
        } over the past few weeks.`,
        recommendation:
          trend > 0
            ? "Keep up the positive activities that are contributing to your improved mood."
            : "Consider reaching out to a mental health professional or trusted friend for support.",
      });
    }
  }

  // Activity correlation insights
  const topActivities = metrics.activityCorrelations
    .sort((a, b) => b.averageMood - a.averageMood)
    .slice(0, 3);

  if (topActivities.length > 0) {
    insights.push({
      type: "activity",
      title: "Mood-Boosting Activities",
      description: `Your mood tends to be highest when you engage in: ${topActivities
        .map((a) => a.activity)
        .join(", ")}.`,
      recommendation: "Try to incorporate these activities more regularly into your routine.",
    });
  }

  // Sleep impact insights
  const sleepCorrelation = metrics.sleepImpact.sort((a, b) => b.averageMood - a.averageMood)[0];

  if (sleepCorrelation) {
    insights.push({
      type: "sleep",
      title: "Sleep Quality Impact",
      description: `Your mood is best when your sleep quality is at level ${sleepCorrelation.quality}.`,
      recommendation:
        "Focus on maintaining consistent sleep habits and creating a relaxing bedtime routine.",
    });
  }

  // Social interaction insights
  const socialCorrelation = metrics.socialImpact.sort((a, b) => b.averageMood - a.averageMood)[0];

  if (socialCorrelation) {
    insights.push({
      type: "social",
      title: "Social Connection Impact",
      description: `Your mood tends to be better when you have ${socialCorrelation.count} social interactions.`,
      recommendation: "Try to maintain this level of social engagement regularly.",
    });
  }

  // Stress level insights
  const stressCorrelation = metrics.stressImpact.sort((a, b) => a.averageMood - b.averageMood)[0];

  if (stressCorrelation) {
    insights.push({
      type: "stress",
      title: "Stress Level Impact",
      description: `Your mood is most affected when stress levels reach ${stressCorrelation.level}.`,
      recommendation:
        "Consider implementing stress management techniques when you notice stress levels approaching this point.",
    });
  }

  return insights;
}
