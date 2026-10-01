"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { api } from "@/lib/api";
import {
  MessageSquare,
  Send,
  Loader2,
  User as UserIcon,
  Search,
  CheckCheck,
} from "lucide-react";

export default function MessagesPage() {
  const [role, setRole] = useState("user");
  const [myUserId, setMyUserId] = useState<number | null>(null);

  // Admin state
  const [threads, setThreads] = useState<any[]>([]);
  const [selectedThreadUserId, setSelectedThreadUserId] = useState<number | null>(
    null
  );
  
  // Chat state
  const [messages, setMessages] = useState<any[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [sending, setSending] = useState(false);
  const [loadingThreads, setLoadingThreads] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Parse token to determine role
  useEffect(() => {
    try {
      const storedRole = localStorage.getItem("freightiq_role");
      if (storedRole) setRole(storedRole);

      const token = localStorage.getItem("freightiq_token");
      if (token) {
        // Demo tokens (e.g. "demo-token-user-12345") are not valid JWTs — handle gracefully
        if (token.startsWith("demo-token-")) {
          const demoRole = storedRole || "user";
          setMyUserId(demoRole === "admin" ? 2 : 1);
        } else {
          try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            setMyUserId(payload.sub ? parseInt(payload.sub, 10) : null);
          } catch {
            setMyUserId(null);
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Set default selected thread for users
  useEffect(() => {
    if (role === "user" && myUserId) {
      setSelectedThreadUserId(myUserId);
    }
  }, [role, myUserId]);

  // Load threads (Admin only)
  const loadThreads = useCallback(async () => {
    if (role !== "admin") return;
    setLoadingThreads(true);
    try {
      const data = await api.getMessageThreads();
      setThreads(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingThreads(false);
    }
  }, [role]);

  useEffect(() => {
    if (role === "admin") {
      loadThreads();
    }
  }, [role, loadThreads]);

  // Load chat messages for the selected thread
  const loadChat = useCallback(async (threadId: number) => {
    try {
      const data = await api.getMessageThread(threadId);
      setMessages(data);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    if (selectedThreadUserId) {
      setLoadingChat(true);
      loadChat(selectedThreadUserId).finally(() => {
        setLoadingChat(false);
        setTimeout(() => {
          if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
          }
        }, 100);
      });
      // Mark as read when opening a thread
      api.markThreadRead(selectedThreadUserId).catch(() => {});
      
      // Update thread list unread count locally if admin
      if (role === "admin") {
        setThreads((prev) =>
          prev.map((t) =>
            t.thread_user_id === selectedThreadUserId
              ? { ...t, unread_count: 0 }
              : t
          )
        );
      }
    } else {
      setMessages([]);
    }
  }, [selectedThreadUserId, loadChat, role]);

  // Polling for chat and threads
  useEffect(() => {
    const intervalId = setInterval(() => {
      if (role === "admin") {
        loadThreads();
      }
      if (selectedThreadUserId) {
        loadChat(selectedThreadUserId);
      }
    }, 8000);

    return () => clearInterval(intervalId);
  }, [role, selectedThreadUserId, loadThreads, loadChat]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || !selectedThreadUserId) return;

    setSending(true);
    try {
      await api.sendMessage(
        selectedThreadUserId,
        inputValue.trim()
      );
      setInputValue("");
      await loadChat(selectedThreadUserId);
      if (role === "admin") {
        loadThreads();
      }
    } catch (e) {
      console.error("Failed to send message", e);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const selectedThreadInfo = threads.find(
    (t) => t.thread_user_id === selectedThreadUserId
  );

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-8rem)] bg-white rounded-3xl border border-sky-100 shadow-sm overflow-hidden">
        
        {/* Admin Left Sidebar - Thread List */}
        {role === "admin" && (
          <div className="w-80 border-r border-slate-100 flex flex-col bg-slate-50/50 shrink-0">
            <div className="p-4 border-b border-slate-100 bg-white">
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-sky-600" />
                Conversations
              </h2>
              <div className="relative mt-3">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  className="w-full bg-slate-100 border-none rounded-xl pl-9 pr-4 py-2 text-xs focus:ring-2 focus:ring-sky-500/20 transition-all"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {loadingThreads && threads.length === 0 ? (
                <div className="p-4 text-center text-slate-400 flex flex-col items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-xs">Loading conversations...</span>
                </div>
              ) : threads.length === 0 ? (
                <div className="p-4 text-center text-slate-400 text-xs">
                  No conversations yet.
                </div>
              ) : (
                threads.map((t) => {
                  const isSelected = selectedThreadUserId === t.thread_user_id;
                  return (
                    <button
                      key={t.thread_user_id}
                      onClick={() => setSelectedThreadUserId(t.thread_user_id)}
                      className={`w-full text-left p-3 rounded-xl transition-all ${
                        isSelected
                          ? "bg-sky-50 shadow-sm border border-sky-100"
                          : "hover:bg-slate-100 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm text-slate-800 truncate">
                          {t.user_name}
                        </span>
                        {t.unread_count > 0 && (
                          <span className="shrink-0 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                            {t.unread_count}
                          </span>
                        )}
                      </div>
                      <p
                        className={`text-xs truncate ${
                          t.unread_count > 0 && !isSelected
                            ? "text-slate-800 font-medium"
                            : "text-slate-500"
                        }`}
                      >
                        {t.last_message || "No messages yet"}
                      </p>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-white">
          {selectedThreadUserId ? (
            <>
              {/* Chat Header */}
              <div className="h-16 border-b border-slate-100 flex items-center px-6 shrink-0 bg-white shadow-sm z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-sky-100 flex items-center justify-center text-sky-700">
                    <UserIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-800">
                      {role === "admin"
                        ? selectedThreadInfo?.user_name || "User"
                        : "System Admin"}
                    </h2>
                    <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Online
                    </p>
                  </div>
                </div>
              </div>

              {/* Messages List */}
              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/30"
              >
                {loadingChat && messages.length === 0 ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="w-6 h-6 animate-spin text-sky-400" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center text-slate-400 py-10 text-sm">
                    No messages yet. Send a message to start the conversation.
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMine =
                      (role === "admin" && msg.sender_role === "admin") ||
                      (role === "user" && msg.sender_role === "user");

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${
                          isMine ? "items-end" : "items-start"
                        }`}
                      >
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                            isMine
                              ? "bg-sky-600 text-white rounded-tr-sm"
                              : "bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm"
                          }`}
                        >
                          {msg.body}
                        </div>
                        <div className="flex items-center gap-1 mt-1 px-1">
                          <span className="text-[10px] text-slate-400 font-medium">
                            {new Date(msg.created_at).toLocaleTimeString("en-US", {
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </span>
                          {isMine && (
                            <CheckCheck
                              className={`w-3.5 h-3.5 ${
                                msg.is_read ? "text-sky-500" : "text-slate-300"
                              }`}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Chat Input */}
              <div className="p-4 bg-white border-t border-slate-100 shrink-0">
                <div className="flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-sky-500/20 focus-within:border-sky-300 transition-all">
                  <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    className="flex-1 max-h-32 min-h-[44px] bg-transparent border-none resize-none px-3 py-2.5 text-sm focus:ring-0 text-slate-800 placeholder:text-slate-400"
                    rows={1}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!inputValue.trim() || sending}
                    className="p-3 bg-sky-600 hover:bg-sky-700 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                  >
                    {sending ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <div className="text-center mt-2">
                  <span className="text-[10px] text-slate-400">
                    Press Enter to send, Shift + Enter for new line.
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-6 text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-700 mb-1">
                Your Messages
              </h3>
              <p className="text-sm max-w-sm">
                Select a conversation from the sidebar to view messages and
                reply.
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
