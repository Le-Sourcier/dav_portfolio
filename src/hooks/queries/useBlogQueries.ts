"use client";

import { useMutation } from "@tanstack/react-query";
import { blogApi, type AddCommentPayload } from "@/services/api/blog.api";
import type { BackendBlogComment } from "@/types/backend.types";

interface AddCommentInput {
  postId: string;
  data: AddCommentPayload;
}

export function useAddComment() {
  return useMutation<BackendBlogComment, Error, AddCommentInput>({
    mutationFn: ({ postId, data }) => blogApi.addComment(postId, data),
  });
}
