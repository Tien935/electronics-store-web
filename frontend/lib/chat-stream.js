const DEFAULT_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8085";
const DEFAULT_AI_PREFIX = process.env.NEXT_PUBLIC_AI_PREFIX ?? "/api/v1";

export async function streamChat(message, history, onEvent, signal) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  let url = `${DEFAULT_URL}${DEFAULT_AI_PREFIX}/chat/stream`;
  let res;

  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ message, history }),
      signal,
    });
  } catch (netErr) {
    // Nếu gọi port 8080 bị từ chối kết nối (do Gateway chưa chạy), tự động chuyển sang port 8085 của AI service
    if (DEFAULT_URL.includes(":8080")) {
      url = `http://localhost:8085/api/v1/chat/stream`;
      res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message, history }),
        signal,
      });
    } else {
      throw netErr;
    }
  }

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`AI Service lỗi ${res.status}: ${errorText}`);
  }

  if (!res.body) {
    throw new Error("Server không trả về dữ liệu stream.");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  function processFrame(frame) {
    const data = frame
      .split(/\r?\n/)
      .filter((line) => line.startsWith("data:"))
      .map((line) => line.slice(5).trimStart())
      .join("\n");

    if (!data || data === "[DONE]") return;

    try {
      onEvent(JSON.parse(data));
    } catch (error) {
      console.error("Lỗi đọc SSE:", error, data);
    }
  }

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const frames = buffer.split(/\r?\n\r?\n/);
      buffer = frames.pop() ?? "";

      for (const frame of frames) {
        processFrame(frame);
      }
    }

    buffer += decoder.decode();
    if (buffer.trim()) {
      processFrame(buffer);
    }
  } finally {
    reader.releaseLock();
  }
}
