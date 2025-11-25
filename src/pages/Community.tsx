import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Heart, Eye, Plus, Search, TrendingUp, Clock, Pin } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Link } from "react-router-dom";

interface CommunityPost {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  views_count: number;
  likes_count: number;
  replies_count: number;
  is_pinned: boolean;
  created_at: string;
  author: {
    full_name: string;
    avatar_url?: string;
  };
  user_liked?: boolean;
}

const categories = [
  { value: "all", label: "All Topics" },
  { value: "general", label: "General Discussion" },
  { value: "tips", label: "Tips & Tricks" },
  { value: "pricing", label: "Pricing & Rates" },
  { value: "tools", label: "Tools & Resources" },
  { value: "networking", label: "Networking" },
  { value: "challenges", label: "Challenges & Solutions" },
];

export default function Community() {
  const { user, profile } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [showPostDialog, setShowPostDialog] = useState(false);

  // Form state
  const [newPost, setNewPost] = useState({
    title: "",
    content: "",
    category: "general",
    tags: "",
  });

  useEffect(() => {
    fetchPosts();
  }, [selectedCategory, searchQuery]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from("community_posts")
        .select(`
          *,
          author:profiles!community_posts_author_id_fkey (
            full_name,
            avatar_url
          )
        `)
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false });

      if (selectedCategory !== "all") {
        query = query.eq("category", selectedCategory);
      }

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error && error.code !== "PGRST205") {
        throw error;
      }

      if (data) {
        // Check which posts user has liked
        if (user?.id) {
          const postIds = data.map((p: any) => p.id);
          const { data: likes } = await supabase
            .from("community_likes")
            .select("post_id")
            .eq("user_id", user.id)
            .in("post_id", postIds);

          const likedPostIds = new Set(likes?.map((l) => l.post_id) || []);

          const transformed = data.map((post: any) => ({
            ...post,
            author: Array.isArray(post.author) ? post.author[0] : post.author,
            user_liked: likedPostIds.has(post.id),
          }));

          setPosts(transformed);
        } else {
          const transformed = data.map((post: any) => ({
            ...post,
            author: Array.isArray(post.author) ? post.author[0] : post.author,
            user_liked: false,
          }));
          setPosts(transformed);
        }
      }
    } catch (error: any) {
      console.error("Error fetching posts:", error);
      toast.error("Failed to load community posts");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!user || profile?.user_type !== "freelancer") {
      toast.error("Only freelancers can create posts");
      return;
    }

    if (!newPost.title.trim() || !newPost.content.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const tagsArray = newPost.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const { error } = await supabase.from("community_posts").insert({
        author_id: user.id,
        title: newPost.title.trim(),
        content: newPost.content.trim(),
        category: newPost.category,
        tags: tagsArray,
      });

      if (error) throw error;

      toast.success("Post created successfully!");
      setShowCreateDialog(false);
      setNewPost({ title: "", content: "", category: "general", tags: "" });
      fetchPosts();
    } catch (error: any) {
      console.error("Error creating post:", error);
      toast.error("Failed to create post: " + error.message);
    }
  };

  const handleLike = async (postId: string, isLiked: boolean) => {
    if (!user) {
      toast.error("Please sign in to like posts");
      return;
    }

    try {
      if (isLiked) {
        // Unlike
        await supabase
          .from("community_likes")
          .delete()
          .eq("user_id", user.id)
          .eq("post_id", postId);

        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? { ...p, likes_count: Math.max(0, p.likes_count - 1), user_liked: false }
              : p
          )
        );
      } else {
        // Like
        await supabase.from("community_likes").insert({
          user_id: user.id,
          post_id: postId,
        });

        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? { ...p, likes_count: p.likes_count + 1, user_liked: true }
              : p
          )
        );
      }
    } catch (error: any) {
      console.error("Error toggling like:", error);
      toast.error("Failed to update like");
    }
  };

  const handleViewPost = async (post: CommunityPost) => {
    setSelectedPost(post);
    setShowPostDialog(true);

    // Increment views
    try {
      await supabase
        .from("community_posts")
        .update({ views_count: (post.views_count || 0) + 1 })
        .eq("id", post.id);

      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id ? { ...p, views_count: (p.views_count || 0) + 1 } : p
        )
      );
    } catch (error) {
      console.error("Error updating views:", error);
    }
  };

  const isFreelancer = profile?.user_type === "freelancer";

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">Freelancer Community</h1>
            <p className="text-gray-600">
              Connect, share, and learn from fellow freelancers
            </p>
          </div>
          {isFreelancer && (
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Post
            </Button>
          )}
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search posts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Posts List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Loading posts...</p>
        </div>
      ) : posts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
            <p className="text-gray-600 mb-6">
              {isFreelancer
                ? "Be the first to start a discussion!"
                : "Only freelancers can view and participate in the community."}
            </p>
            {isFreelancer && (
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create First Post
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card
              key={post.id}
              className={`cursor-pointer hover:shadow-md transition-shadow ${
                post.is_pinned ? "border-blue-300 bg-blue-50/50" : ""
              }`}
              onClick={() => handleViewPost(post)}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="w-10 h-10 flex-shrink-0">
                    <AvatarImage src={post.author?.avatar_url} />
                    <AvatarFallback>
                      {post.author?.full_name?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {post.is_pinned && (
                            <Pin className="w-4 h-4 text-blue-600 flex-shrink-0" />
                          )}
                          <h3 className="font-semibold text-lg text-gray-900 truncate">
                            {post.title}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                          {post.content}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 flex-wrap">
                      <Badge variant="secondary">{post.category}</Badge>
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex items-center gap-2 flex-wrap">
                          {post.tags.slice(0, 3).map((tag, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-6 mt-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Heart
                          className={`w-4 h-4 cursor-pointer ${
                            post.user_liked ? "fill-red-500 text-red-500" : ""
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLike(post.id, post.user_liked || false);
                          }}
                        />
                        <span>{post.likes_count}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-4 h-4" />
                        <span>{post.replies_count}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{post.views_count}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>
                          {formatDistanceToNow(new Date(post.created_at), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      <span className="text-gray-400">
                        by {post.author?.full_name || "Anonymous"}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Post Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Post</DialogTitle>
            <DialogDescription>
              Share your thoughts, ask questions, or help fellow freelancers
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={newPost.title}
                onChange={(e) =>
                  setNewPost({ ...newPost, title: e.target.value })
                }
                placeholder="Enter post title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select
                value={newPost.category}
                onValueChange={(value) =>
                  setNewPost({ ...newPost, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories
                    .filter((c) => c.value !== "all")
                    .map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                value={newPost.content}
                onChange={(e) =>
                  setNewPost({ ...newPost, content: e.target.value })
                }
                placeholder="Write your post content..."
                rows={8}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={newPost.tags}
                onChange={(e) =>
                  setNewPost({ ...newPost, tags: e.target.value })
                }
                placeholder="e.g., design, tips, pricing"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreatePost}>Create Post</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Post Dialog */}
      {selectedPost && (
        <PostDetailDialog
          post={selectedPost}
          open={showPostDialog}
          onClose={() => {
            setShowPostDialog(false);
            setSelectedPost(null);
          }}
          onUpdate={fetchPosts}
        />
      )}
    </div>
  );
}

// Post Detail Dialog Component
function PostDetailDialog({
  post,
  open,
  onClose,
  onUpdate,
}: {
  post: CommunityPost;
  open: boolean;
  onClose: () => void;
  onUpdate: () => void;
}) {
  const { user } = useAuth();
  const [replies, setReplies] = useState<any[]>([]);
  const [newReply, setNewReply] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      fetchReplies();
    }
  }, [open, post.id]);

  const fetchReplies = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("community_replies")
        .select(`
          *,
          author:profiles!community_replies_author_id_fkey (
            full_name,
            avatar_url
          )
        `)
        .eq("post_id", post.id)
        .order("created_at", { ascending: true });

      if (error && error.code !== "PGRST205") {
        throw error;
      }

      if (data) {
        const transformed = data.map((reply: any) => ({
          ...reply,
          author: Array.isArray(reply.author) ? reply.author[0] : reply.author,
        }));
        setReplies(transformed);
      }
    } catch (error) {
      console.error("Error fetching replies:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReply = async () => {
    if (!user || !newReply.trim()) return;

    try {
      const { error } = await supabase.from("community_replies").insert({
        post_id: post.id,
        author_id: user.id,
        content: newReply.trim(),
      });

      if (error) throw error;

      setNewReply("");
      fetchReplies();
      onUpdate();
      toast.success("Reply posted!");
    } catch (error: any) {
      console.error("Error posting reply:", error);
      toast.error("Failed to post reply: " + error.message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl mb-2">{post.title}</DialogTitle>
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="secondary">{post.category}</Badge>
                <span className="text-sm text-gray-500">
                  by {post.author?.full_name || "Anonymous"}
                </span>
                <span className="text-sm text-gray-400">
                  {formatDistanceToNow(new Date(post.created_at), {
                    addSuffix: true,
                  })}
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          <div className="prose max-w-none">
            <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              {post.tags.map((tag, idx) => (
                <Badge key={idx} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <div className="border-t pt-6">
            <h3 className="font-semibold mb-4">
              Replies ({replies.length})
            </h3>

            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
              </div>
            ) : replies.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No replies yet. Be the first to reply!
              </p>
            ) : (
              <div className="space-y-4 mb-6">
                {replies.map((reply) => (
                  <div key={reply.id} className="flex gap-3">
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarImage src={reply.author?.avatar_url} />
                      <AvatarFallback>
                        {reply.author?.full_name?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-sm">
                            {reply.author?.full_name || "Anonymous"}
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatDistanceToNow(new Date(reply.created_at), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {reply.content}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {user && (
              <div className="space-y-2">
                <Label htmlFor="reply">Add a reply</Label>
                <Textarea
                  id="reply"
                  value={newReply}
                  onChange={(e) => setNewReply(e.target.value)}
                  placeholder="Write your reply..."
                  rows={3}
                />
                <Button onClick={handleSubmitReply} disabled={!newReply.trim()}>
                  Post Reply
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

