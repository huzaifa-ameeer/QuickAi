import { clerkClient, getAuth } from "@clerk/express";

export const auth = async (req, res, next) => {
  try {
    const { userId, has } = getAuth(req);

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const hasPremiumPlan = await has({ plan: "premium" });

    const user = await clerkClient.users.getUser(userId);

    const free_usage = Number(user.privateMetadata?.free_usage) || 0;

    if (!hasPremiumPlan && user.privateMetadata?.free_usage === undefined) {
      await clerkClient.users.updateUserMetadata(userId, {
        privateMetadata: { free_usage: 0 },
      });
    }

    req.user = user;
    req.free_usage = free_usage;
    req.plan = hasPremiumPlan ? "premium" : "free";
    next();
  } catch (error) {
    console.error("Auth error:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
