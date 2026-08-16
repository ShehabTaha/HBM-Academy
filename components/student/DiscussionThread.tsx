"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useStudent } from "@/hooks/useStudent";
import { useRealtime } from "@/hooks/useRealtime";

type DiscussionPost = {
  id: string;
  body: string;
  parent_id: string | null;
  is_pinned: boolean;
  is_deleted: boolean;
  created_at: string;
  student_id: string;
  student?: {
    name: string;
    avatar: string | null;
    role: string;
  };
};

export function DiscussionThread({ lessonId }: { lessonId: string }) {
  const { student } = useStudent();
  const [posts, setPosts] = useState<DiscussionPost[]>([]);
  const [body, setBody] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyBody, setReplyBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPosts = useCallback(async () => {
    const response = await fetch(`/api/student/discussions/${lessonId}`);
    const data = await response.json();
    if (response.ok) {
      setPosts(data.posts ?? []);
      setError(null);
    } else {
      setError(data.error ?? "Could not load discussion.");
    }
    setLoading(false);
  }, [lessonId]);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => {
      void loadPosts();
    }, 0);
    return () => window.clearTimeout(initialLoad);
  }, [loadPosts]);

  useRealtime(
    `discussion:${lessonId}`,
    {
      table: "discussion_posts",
      filter: `lesson_id=eq.${lessonId}`,
    },
    loadPosts,
  );

  const topLevel = useMemo(
    () => posts.filter((post) => !post.parent_id),
    [posts],
  );

  async function submitPost(parentId?: string) {
    const value = parentId ? replyBody : body;
    if (!value.trim()) return;

    const response = await fetch(`/api/student/discussions/${lessonId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: value, parentId: parentId ?? null }),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error ?? "Could not post comment.");
      return;
    }

    setBody("");
    setReplyBody("");
    setReplyTo(null);
    await loadPosts();
  }

  async function deletePost(postId: string) {
    await fetch(`/api/student/discussions/${lessonId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", postId }),
    });
    await loadPosts();
  }

  return (
    <section className="rounded-lg border bg-white p-5">
      <div className="mb-5">
        <h2 className="text-xl font-semibold">Discussion</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Ask questions and share course-specific notes.
        </p>
      </div>

      {error ? <p className="mb-4 text-sm text-destructive">{error}</p> : null}

      <div className="space-y-3">
        <Textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          placeholder="Post a comment..."
        />
        <Button onClick={() => submitPost()}>Post comment</Button>
      </div>

      <div className="mt-6 space-y-5">
        {loading ? <p className="text-sm text-muted-foreground">Loading discussion...</p> : null}
        {!loading && topLevel.length === 0 ? (
          <p className="text-sm text-muted-foreground">No comments yet.</p>
        ) : null}

        {topLevel.map((post) => {
          const replies = posts.filter((item) => item.parent_id === post.id);
          const isOwner = post.student_id === student?.id;

          return (
            <div key={post.id} className="border-t pt-5">
              <PostRow post={post} isOwner={isOwner} onDelete={deletePost} />
              <div className="mt-3 flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setReplyTo(post.id)}>
                  Reply
                </Button>
              </div>

              {replyTo === post.id ? (
                <div className="mt-3 space-y-2 pl-10">
                  <Textarea
                    value={replyBody}
                    onChange={(event) => setReplyBody(event.target.value)}
                    placeholder="Write a reply..."
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => submitPost(post.id)}>
                      Reply
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setReplyTo(null)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : null}

              {replies.length > 0 ? (
                <div className="mt-4 space-y-4 pl-8">
                  {replies.map((reply) => (
                    <PostRow
                      key={reply.id}
                      post={reply}
                      isOwner={reply.student_id === student?.id}
                      onDelete={deletePost}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function PostRow({
  post,
  isOwner,
  onDelete,
}: {
  post: DiscussionPost;
  isOwner: boolean;
  onDelete: (postId: string) => void;
}) {
  return (
    <div className="flex gap-3">
      <Avatar className="h-9 w-9">
        <AvatarImage src={post.student?.avatar ?? undefined} />
        <AvatarFallback>{post.student?.name?.[0] ?? "S"}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium">{post.student?.name ?? "Student"}</p>
          {post.student?.role === "admin" ? <Badge>HBM Team</Badge> : null}
          {post.is_pinned ? <Badge variant="secondary">Pinned</Badge> : null}
          <span className="text-xs text-muted-foreground">
            {new Date(post.created_at).toLocaleString()}
          </span>
        </div>
        <p className="mt-1 whitespace-pre-wrap text-sm" dir="auto">
          {post.is_deleted ? "This comment was deleted." : post.body}
        </p>
        {isOwner && !post.is_deleted ? (
          <Button
            variant="ghost"
            size="sm"
            className="mt-1 h-7 px-2 text-destructive"
            onClick={() => onDelete(post.id)}
          >
            Delete
          </Button>
        ) : null}
      </div>
    </div>
  );
}
