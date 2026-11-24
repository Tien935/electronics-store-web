const DEFAULT_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8085";
const DEFAULT_PREFIX = process.env.NEXT_PUBLIC_AI_PREFIX ?? "/api/v1";

async function request(path, options = {}) {
  const primaryUrl = `${DEFAULT_URL}${DEFAULT_PREFIX}/advisor${path}`;
  
  try {
    const res = await fetch(primaryUrl, {
      ...options,
      headers: { "Content-Type": "application/json", ...(options.headers ?? {}) },
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Lỗi ${res.status}${text ? `: ${text}` : ""}`);
    }
    return res.status === 204 ? null : res.json();
  } catch (err) {
    // Nếu gọi cổng mặc định thất bại và đang trỏ 8080, tự động thử cổng 8085 trực tiếp của ai-service
    if (DEFAULT_URL.includes(":8080")) {
      try {
        const fallbackUrl = `http://localhost:8085/api/v1/advisor${path}`;
        const fallbackRes = await fetch(fallbackUrl, {
          ...options,
          headers: { "Content-Type": "application/json", ...(options.headers ?? {}) },
        });
        if (fallbackRes.ok) {
          return fallbackRes.status === 204 ? null : fallbackRes.json();
        }
      } catch {
        // Giữ nguyên lỗi ban đầu
      }
    }
    throw err;
  }
}

export const getQuestions = () => request("/questions");

export const recommend = (answers) =>
  request("/recommend", { method: "POST", body: JSON.stringify({ answers }) });

export const sendFeedback = (payload) =>
  request("/feedback", { method: "POST", body: JSON.stringify(payload) });
