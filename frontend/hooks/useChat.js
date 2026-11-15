"use client";

import { useCallback, useRef, useState } from "react";
import { streamChat } from "@/lib/chat-stream";

const TOOL_LABEL = {
  check_inventory: "Đang kiểm tra tồn kho…",
  get_product_price: "Đang tra giá…",
};

const uid = () => Math.random().toString(36).slice(2);

// seedHistory: các tin nhắn có sẵn (vd: kết quả tư vấn) gửi kèm làm ngữ cảnh, không hiện trong khung chat
export function useChat(seedHistory = []) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef(null);

  const send = useCallback(
    async (text) => {
      const message = text.trim();
      if (!message || loading) return;

      const history = [
        ...seedHistory,
        ...messages
          .filter((m) => !m.error && m.content)
          .map((m) => ({ role: m.role, content: m.content })),
      ];

      const replyId = uid();
      setMessages((prev) => [
        ...prev,
        { id: uid(), role: "user", content: message },
        { id: replyId, role: "assistant", content: "" },
      ]);
      setLoading(true);

      const patch = (fn) =>
        setMessages((prev) => prev.map((m) => (m.id === replyId ? fn(m) : m)));

      const ctrl = new AbortController();
      abortRef.current = ctrl;

      try {
        await streamChat(
          message,
          history,
          (e) => {
            if (e.type === "sources") patch((m) => ({ ...m, sources: e.data }));
            else if (e.type === "tool")
              patch((m) => ({ ...m, toolStatus: TOOL_LABEL[e.data.name] ?? "Đang xử lý…" }));
            else if (e.type === "token")
              patch((m) => ({ ...m, content: m.content + e.data, toolStatus: null }));
            else if (e.type === "error")
              patch((m) => ({ ...m, content: e.data, error: true, toolStatus: null }));
          },
          ctrl.signal,
        );
      } catch (err) {
        if (err.name !== "AbortError")
          patch((m) => ({
            ...m,
            content: "Không kết nối được trợ lý. Bạn thử lại sau nhé.",
            error: true,
            toolStatus: null,
          }));
      } finally {
        patch((m) => ({ ...m, toolStatus: null }));
        setLoading(false);
      }
    },
    [messages, loading, seedHistory],
  );

  const stop = useCallback(() => abortRef.current?.abort(), []);
  const reset = useCallback(() => setMessages([]), []);

  return { messages, loading, send, stop, reset };
}