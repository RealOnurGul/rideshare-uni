"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface Participant {
  id: string;
  name: string | null;
  image: string | null;
}

interface LastMessage {
  content: string;
  senderName: string;
  createdAt: string;
}

interface Chat {
  rideId: string;
  origin: string;
  destination: string;
  dateTime: string;
  status: string;
  isDriver: boolean;
  participants: Participant[];
  lastMessage: LastMessage | null;
  messageCount: number;
}

interface Message {
  id: string;
  content: string;
  createdAt: string;
  isSystem: boolean;
  sender: {
    id: string;
    name: string | null;
    image: string | null;
  } | null;
}

export default function ChatsPage() {
  const { data: session, status } = useSession();
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastFetchTime = useRef<string | null>(null);

  // Separate active and archived chats
  const activeChats = chats.filter(c => c.status === "upcoming" || c.status === "in_progress");
  const archivedChats = chats.filter(c => c.status === "completed" || c.status === "cancelled");
  const displayedChats = showArchived ? archivedChats : activeChats;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (session?.user?.id) {
      fetchChats();
    }
  }, [session]);

  const fetchChats = async () => {
    try {
      const res = await fetch("/api/chats");
      if (res.ok) {
        const data = await res.json();
        setChats(data);
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
    } finally {
      setIsLoadingChats(false);
    }
  };

  const fetchMessages = useCallback(async (rideId: string, isPolling = false) => {
    try {
      const params = new URLSearchParams();
      if (isPolling && lastFetchTime.current) {
        params.set("after", lastFetchTime.current);
      }

      const res = await fetch(`/api/rides/${rideId}/messages?${params.toString()}`);
      if (!res.ok) return;

      const data = await res.json();

      if (isPolling && data.messages.length > 0) {
        setMessages((prev) => [...prev, ...data.messages]);
        scrollToBottom();
      } else if (!isPolling) {
        setMessages(data.messages);
        setTimeout(scrollToBottom, 100);
      }

      if (data.messages.length > 0) {
        lastFetchTime.current = data.messages[data.messages.length - 1].createdAt;
      } else if (!isPolling) {
        lastFetchTime.current = new Date().toISOString();
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    if (selectedChat) {
      setIsLoadingMessages(true);
      lastFetchTime.current = null;
      fetchMessages(selectedChat.rideId);
    }
  }, [selectedChat, fetchMessages]);

  useEffect(() => {
    if (!selectedChat || selectedChat.status === "completed" || selectedChat.status === "cancelled") return;

    const interval = setInterval(() => {
      fetchMessages(selectedChat.rideId, true);
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedChat, fetchMessages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending || !selectedChat) return;

    const messageContent = newMessage.trim();
    setNewMessage("");
    setIsSending(true);

    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      content: messageContent,
      createdAt: new Date().toISOString(),
      isSystem: false,
      sender: {
        id: session?.user?.id || "",
        name: session?.user?.name || null,
        image: session?.user?.image || null,
      },
    };
    setMessages((prev) => [...prev, optimisticMessage]);
    scrollToBottom();

    try {
      const res = await fetch(`/api/rides/${selectedChat.rideId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: messageContent }),
      });

      if (res.ok) {
        const sentMessage = await res.json();
        setMessages((prev) =>
          prev.map((msg) => (msg.id === optimisticMessage.id ? sentMessage : msg))
        );
        lastFetchTime.current = sentMessage.createdAt;
        fetchChats();
      } else {
        setMessages((prev) => prev.filter((msg) => msg.id !== optimisticMessage.id));
        setNewMessage(messageContent);
      }
    } catch (error) {
      setMessages((prev) => prev.filter((msg) => msg.id !== optimisticMessage.id));
      setNewMessage(messageContent);
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  };

  const formatChatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "now";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  const isCompletedOrCancelled = selectedChat?.status === "completed" || selectedChat?.status === "cancelled";

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-64px)] bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-600 border-t-transparent"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="h-[calc(100vh-64px)] bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Sign In Required</h1>
          <p className="text-gray-500 mb-4">Sign in to view your ride chats</p>
          <Link href="/auth/signin" className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-full transition-colors cursor-pointer">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)] bg-white">
      {/* Sidebar */}
      <div className={`${selectedChat ? "hidden md:flex" : "flex"} flex-col w-full md:w-[350px] border-r border-gray-200`}>
        {/* Sidebar Header */}
        <div className="p-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Chats</h1>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-4 pb-2 flex gap-2">
          <button
            onClick={() => { setShowArchived(false); setSelectedChat(null); }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${
              !showArchived ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Active
          </button>
          <button
            onClick={() => { setShowArchived(true); setSelectedChat(null); }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors cursor-pointer ${
              showArchived ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Archived
          </button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {isLoadingChats ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-purple-600 border-t-transparent"></div>
            </div>
          ) : displayedChats.length === 0 ? (
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="font-medium text-gray-900 mb-1">
                {showArchived ? "No archived chats" : "No active chats"}
              </p>
              <p className="text-sm text-gray-500">
                {showArchived ? "Completed rides appear here" : "Create or join a ride to start chatting"}
              </p>
            </div>
          ) : (
            displayedChats.map((chat) => (
              <button
                key={chat.rideId}
                onClick={() => setSelectedChat(chat)}
                className={`w-full p-3 flex items-center gap-3 hover:bg-gray-50 transition-colors cursor-pointer ${
                  selectedChat?.rideId === chat.rideId ? "bg-gray-100" : ""
                }`}
              >
                {/* Avatar Stack */}
                <div className="relative flex-shrink-0">
                  {chat.participants[0]?.image ? (
                    <img src={chat.participants[0].image} alt="" className="w-12 h-12 rounded-full" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {chat.participants[0]?.name?.[0] || "?"}
                      </span>
                    </div>
                  )}
                  {chat.participants.length > 1 && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-gray-200 rounded-full border-2 border-white flex items-center justify-center">
                      <span className="text-[10px] font-medium text-gray-600">+{chat.participants.length - 1}</span>
                    </div>
                  )}
                </div>

                {/* Chat Info */}
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-gray-900 truncate text-[15px]">
                      {chat.origin.split(",")[0]} → {chat.destination.split(",")[0]}
                    </h3>
                    {chat.lastMessage && (
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        {formatChatTime(chat.lastMessage.createdAt)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {chat.lastMessage 
                      ? `${chat.lastMessage.senderName}: ${chat.lastMessage.content}`
                      : chat.isDriver ? "You created this ride" : "No messages yet"
                    }
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`${selectedChat ? "flex" : "hidden md:flex"} flex-col flex-1 bg-white`}>
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="h-16 px-4 flex items-center gap-3 border-b border-gray-200">
              <button
                onClick={() => setSelectedChat(null)}
                className="md:hidden p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Avatar */}
              {selectedChat.participants[0]?.image ? (
                <img src={selectedChat.participants[0].image} alt="" className="w-10 h-10 rounded-full" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {selectedChat.participants[0]?.name?.[0] || "?"}
                  </span>
                </div>
              )}

              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-gray-900 truncate">
                  {selectedChat.origin.split(",")[0]} → {selectedChat.destination.split(",")[0]}
                </h2>
                <p className="text-xs text-gray-500">
                  {selectedChat.participants.length} participant{selectedChat.participants.length !== 1 ? "s" : ""} • {selectedChat.status}
                </p>
              </div>

              <Link
                href={`/rides/${selectedChat.rideId}`}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                title="View Ride"
              >
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </Link>
            </div>

            {/* Messages */}
            <div className={`flex-1 overflow-y-auto px-4 py-2 ${isCompletedOrCancelled ? "opacity-50" : ""}`}>
              {isLoadingMessages ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-purple-600 border-t-transparent"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-4">
                    <span className="text-white font-bold text-2xl">
                      {selectedChat.participants[0]?.name?.[0] || "?"}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {selectedChat.origin.split(",")[0]} → {selectedChat.destination.split(",")[0]}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Start the conversation with your ride group
                  </p>
                </div>
              ) : (
                <div className="space-y-0.5">
                  {messages.map((msg, index) => {
                    // System messages
                    if (msg.isSystem || !msg.sender) {
                      return (
                        <div key={msg.id} className="flex justify-center py-2">
                          <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                            {msg.content}
                          </span>
                        </div>
                      );
                    }

                    const isOwn = msg.sender.id === session?.user?.id;
                    const prevMsg = messages[index - 1];
                    const nextMsg = messages[index + 1];
                    
                    const isFirstInGroup = !prevMsg || prevMsg.isSystem || prevMsg.sender?.id !== msg.sender.id;
                    const isLastInGroup = !nextMsg || nextMsg.isSystem || nextMsg.sender?.id !== msg.sender.id;

                    // Determine bubble shape
                    let bubbleClass = "rounded-2xl";
                    if (isOwn) {
                      if (isFirstInGroup && isLastInGroup) bubbleClass = "rounded-2xl";
                      else if (isFirstInGroup) bubbleClass = "rounded-2xl rounded-br-md";
                      else if (isLastInGroup) bubbleClass = "rounded-2xl rounded-tr-md";
                      else bubbleClass = "rounded-2xl rounded-r-md";
                    } else {
                      if (isFirstInGroup && isLastInGroup) bubbleClass = "rounded-2xl";
                      else if (isFirstInGroup) bubbleClass = "rounded-2xl rounded-bl-md";
                      else if (isLastInGroup) bubbleClass = "rounded-2xl rounded-tl-md";
                      else bubbleClass = "rounded-2xl rounded-l-md";
                    }

                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isOwn ? "justify-end" : "justify-start"} ${isFirstInGroup ? "mt-3" : "mt-0.5"}`}
                      >
                        <div className={`flex items-end gap-2 max-w-[70%] ${isOwn ? "flex-row-reverse" : ""}`}>
                          {/* Avatar - only show on last message of group for others */}
                          {!isOwn && (
                            <div className="w-7 h-7 flex-shrink-0">
                              {isLastInGroup ? (
                                msg.sender.image ? (
                                  <img src={msg.sender.image} alt="" className="w-7 h-7 rounded-full" />
                                ) : (
                                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                                    <span className="text-white text-xs font-medium">
                                      {msg.sender.name?.[0] || "?"}
                                    </span>
                                  </div>
                                )
                              ) : null}
                            </div>
                          )}

                          <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"}`}>
                            {/* Name - only on first message of group for others */}
                            {!isOwn && isFirstInGroup && (
                              <span className="text-xs text-gray-500 mb-1 ml-1">
                                {msg.sender.name || "User"}
                              </span>
                            )}

                            {/* Message Bubble */}
                            <div
                              className={`px-3 py-2 ${bubbleClass} ${
                                isOwn
                                  ? "bg-purple-600 text-white"
                                  : "bg-gray-100 text-gray-900"
                              }`}
                            >
                              <p className="text-[15px] whitespace-pre-wrap break-words leading-snug">{msg.content}</p>
                            </div>

                            {/* Time - only on last message of group */}
                            {isLastInGroup && (
                              <span className="text-[10px] text-gray-400 mt-1 mx-1">
                                {formatTime(msg.createdAt)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input Area */}
            {isCompletedOrCancelled ? (
              <div className="h-14 flex items-center justify-center border-t border-gray-200 bg-gray-50">
                <p className="text-sm text-gray-500">This chat is read-only</p>
              </div>
            ) : (
              <form onSubmit={handleSend} className="p-3 border-t border-gray-200">
                <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Aa"
                    maxLength={1000}
                    className="flex-1 bg-transparent border-0 focus:ring-0 text-[15px] placeholder-gray-500"
                    disabled={isSending}
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim() || isSending}
                    className="p-1.5 text-purple-600 hover:text-purple-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    {isSending ? (
                      <div className="w-5 h-5 animate-spin rounded-full border-2 border-purple-600 border-t-transparent" />
                    ) : (
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                      </svg>
                    )}
                  </button>
                </div>
              </form>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-1">Your Messages</h2>
            <p className="text-gray-500 text-center max-w-xs">
              Select a chat to start messaging your ride groups
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
