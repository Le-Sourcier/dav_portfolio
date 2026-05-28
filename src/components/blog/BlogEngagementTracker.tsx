"use client";

import { useEffect } from "react";
import { blogApi } from "@/services/api/blog.api";

type BlogEngagementTrackerProps = {
  postId: string;
};

export function BlogEngagementTracker({ postId }: BlogEngagementTrackerProps) {
  useEffect(() => {
    if (!postId) return;
    const key = `blog-view:${postId}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    blogApi.trackView(postId).catch(() => {
      sessionStorage.removeItem(key);
    });
  }, [postId]);

  return null;
}
