"use client";
import React, {
  useCallback,
  useEffect,
  useRef,
  useMemo,
  useState,
} from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError, CancelTokenSource } from "axios";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import {
  CopyIcon,
  Loader2,
  RefreshCw,
  MessageSquare,
  User,
  Settings,
  LinkIcon,
} from "lucide-react";

import MessageCard from "@/components/MessageCard";
import { Message } from "@/model/User";
import { acceptMessageSchema } from "@/schemas/acceptMessageSchema";
import { ApiResponse } from "@/types/ApiResponse";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = (): React.JSX.Element => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: session, status } = useSession();
  const cancelTokenSourceRef = useRef<CancelTokenSource | null>(null);
  const hasFetched = useRef(false);

  const {
    watch,
    register,
    setValue,
    formState: { isSubmitting },
  } = useForm<z.infer<typeof acceptMessageSchema>>({
    resolver: zodResolver(acceptMessageSchema),
    defaultValues: {
      acceptMessages: true,
    },
  });

  const acceptMessages = watch("acceptMessages");

  // Create a new cancel token source
  const createCancelTokenSource = useCallback(() => {
    if (cancelTokenSourceRef.current) {
      cancelTokenSourceRef.current.cancel("Request canceled");
    }
    cancelTokenSourceRef.current = axios.CancelToken.source();
    return cancelTokenSourceRef.current;
  }, []);

  // Handle message deletion
  const handleDeleteMessage = useCallback((messageId: string) => {
    setMessages((prev) => prev.filter((m) => m._id !== messageId));
    toast.success("Message deleted successfully");
  }, []);

  // Fetch acceptance status
  const fetchAcceptMessage = useCallback(async () => {
    const source = createCancelTokenSource();

    try {
      const response = await axios.get<ApiResponse>("/api/accept-message", {
        cancelToken: source.token,
      });
      setValue("acceptMessages", Boolean(response.data.isAccesptingMessage));
    } catch (error) {
      if (axios.isCancel(error)) {
        return;
      }
      const e = error as AxiosError<ApiResponse>;
      toast.error(
        e.response?.data.message || "Failed to fetch acceptance status"
      );
    }
  }, [createCancelTokenSource, setValue]);

  // Fetch messages
  const fetchMessages = useCallback(
    async (isRefresh = false) => {
      const source = createCancelTokenSource();

      try {
        if (isRefresh) {
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        }

        const response = await axios.get<ApiResponse>("/api/get-messages", {
          cancelToken: source.token,
        });
        setMessages(response.data.messages || []);

        if (isRefresh) {
          toast.success("Messages refreshed successfully");
        }
      } catch (error) {
        if (axios.isCancel(error)) {
          return;
        }
        const e = error as AxiosError<ApiResponse>;
        toast.error(e.response?.data.message || "Failed to fetch messages");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [createCancelTokenSource]
  );

  // Toggle message acceptance
  const toggleAcceptMessage = useCallback(async () => {
    const source = createCancelTokenSource();

    try {
      const res = await axios.post<ApiResponse>(
        "/api/accept-message",
        { acceptMessages: !acceptMessages },
        { cancelToken: source.token }
      );
      setValue("acceptMessages", !acceptMessages);
      toast.success(res.data.message);
    } catch (error) {
      if (axios.isCancel(error)) {
        return;
      }
      const e = error as AxiosError<ApiResponse>;
      toast.error(
        e.response?.data.message || "Failed to update acceptance status"
      );
    }
  }, [acceptMessages, createCancelTokenSource, setValue]);

  // Initial data fetch
  useEffect(() => {
    if (status !== "authenticated" || hasFetched.current) {
      return;
    }

    hasFetched.current = true;

    const fetchData = async (): Promise<void> => {
      try {
        await Promise.all([fetchMessages(), fetchAcceptMessage()]);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load dashboard data");
      }
    };

    fetchData();

    return (): void => {
      if (cancelTokenSourceRef.current) {
        cancelTokenSourceRef.current.cancel("Component unmounted");
      }
    };
  }, [status, fetchAcceptMessage, fetchMessages]);

  // Memoized values
  const baseUrl = useMemo(() => window.location.origin, []);
  const profileUrl = useMemo(
    () => `${baseUrl}/u/${session?.user?.username || ""}`,
    [baseUrl, session?.user?.username]
  );

  const copyToClipboard = useCallback((): void => {
    navigator.clipboard.writeText(profileUrl);
    toast.success("Profile link copied to clipboard!");
  }, [profileUrl]);

  // Loading state
  if (status === "loading" || isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-6 w-80" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>

          <div className="flex flex-col gap-4">
            <Skeleton className="h-8 w-48" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-60 w-full" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Unauthenticated state
  if (status === "unauthenticated" || !session?.user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md mx-4">
          <CardHeader>
            <CardTitle className="text-center">Access Denied</CardTitle>
            <CardDescription className="text-center">
              Please log in to access your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={() => (window.location.href = "/login")}>
              Go to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { username } = session.user;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {username}! Manage your messages and profile settings.
        </p>
      </div>

      <Tabs defaultValue="messages" className="">
        <TabsList className="grid grid-cols-3 ">
          <TabsTrigger value="messages" className="flex items-center gap-2">
            <MessageSquare size={16} />
            Messages
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User size={16} />
            Profile
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings size={16} />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="messages">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Your Messages</CardTitle>
                <CardDescription>
                  {messages.length > 0
                    ? `You have ${messages.length} message${messages.length !== 1 ? "s" : ""}`
                    : "You haven't received any messages yet"}
                </CardDescription>
              </div>
              <Button
                variant="outline"
                onClick={() => fetchMessages(true)}
                disabled={isRefreshing}
              >
                {isRefreshing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                <span className="ml-2">Refresh</span>
              </Button>
            </CardHeader>
            <CardContent>
              {messages.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {messages.map((message) => (
                    <MessageCard
                      key={message.content}
                      message={message}
                      onMessageDelete={handleDeleteMessage}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No messages yet
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Share your profile link to start receiving messages
                  </p>
                  <Button
                    onClick={() =>
                      document.getElementById("profile-tab")?.click()
                    }
                  >
                    Get Your Profile Link
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
              <CardDescription>
                Share this link to receive anonymous messages
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input value={profileUrl} disabled className="flex-grow" />
                <Button onClick={copyToClipboard} className="shrink-0">
                  <CopyIcon className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <LinkIcon className="h-4 w-4 mr-2" />
                Anyone with this link can send you anonymous messages
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Message Settings</CardTitle>
              <CardDescription>
                Control your message preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-0.5">
                  <label
                    htmlFor="accept-messages"
                    className="text-base font-medium cursor-pointer"
                  >
                    Accept Messages
                  </label>
                  <p className="text-sm text-gray-500">
                    {acceptMessages
                      ? "You are currently accepting messages"
                      : "You are not accepting messages at this time"}
                  </p>
                </div>
                <Switch
                  {...register("acceptMessages")}
                  id="accept-messages"
                  checked={acceptMessages}
                  onCheckedChange={toggleAcceptMessage}
                  disabled={isSubmitting}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
