"use client";

import { useEffect, useMemo, useState } from "react";
import BrandLogo from "../../components/BrandLogo";
import { getQuestions, recommend, sendFeedback } from "@/lib/advisor-api";
import { useChat } from "@/hooks/useChat";
import styles from "./page.module.css";

const vnd = (n) => (n ? new Intl.NumberFormat("vi-VN").format(n) + " ₫" : "");

// Biểu tượng sinh động cho từng phương án
const OPTION_ICONS = {
  under_10: "bi-wallet2",
  "10_20": "bi-cash-coin",
  "20_30": "bi-gem",
  over_30: "bi-trophy-fill",
  gaming: "bi-controller",
  camera: "bi-camera-fill",
  work: "bi-briefcase-fill",
  basic: "bi-chat-heart-fill",
  apple: "bi-apple",
  android: "bi-android2",
  any: "bi-shuffle",
  battery: "bi-battery-charging",
  display: "bi-aspect-ratio-fill",
  performance: "bi-lightning-charge-fill",
  price: "bi-tag-fill",
};

export default function AiAdvisorPage() {
  const [questions, setQuestions] = useState([]);
  const [stage, setStage] = useState("quiz"); // quiz | loading | result | error
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [votes, setVotes] = useState({}); // { productId: "like" | "dislike" }
  const [input, setInput] = useState("");

  // Ngữ cảnh gửi kèm khi khách hỏi tiếp: nhu cầu đã chọn + máy đã gợi ý
  const seedHistory = useMemo(() => {
    if (!result || !result.recommendations) return [];
    const picked = result.recommendations.map((r) => `${r.name} (${vnd(r.price_vnd)})`).join(", ");
    return [
      { role: "user", content: `Nhu cầu của tôi: ${result.profile ? result.profile.join("; ") : "Tìm điện thoại"}.` },
      { role: "assistant", content: `${result.summary || "Chào bạn!"} Mình đã gợi ý: ${picked}.` },
    ];
  }, [result]);

  const chat = useChat(seedHistory);

  useEffect(() => {
    getQuestions()
      .then((d) => setQuestions(d.questions || []))
      .catch((e) => {
        setError(e.message || "Không thể tải bộ câu hỏi tư vấn");
        setStage("error");
      });
  }, []);

  const total = questions.length;
  const question = questions[step];

  async function submit(finalAnswers) {
    setStage("loading");
    try {
      const data = await recommend(finalAnswers);
      setResult(data);
      setStage("result");
    } catch (e) {
      setError(e.message || "Không thể lấy gợi ý tư vấn");
      setStage("error");
    }
  }

  function pick(option) {
    const next = { ...answers, [question.id]: option.value };
    setAnswers(next);
    if (step < total - 1) {
      setStep(step + 1);
    } else {
      submit(next);
    }
  }

  function restart() {
    setStep(0);
    setAnswers({});
    setResult(null);
    setError("");
    setVotes({});
    setStage("quiz");
    chat.reset();
  }

  async function handleVote(productId, type) {
    setVotes((prev) => ({ ...prev, [productId]: type }));
    try {
      await sendFeedback({
        productId,
        type,
        answers,
      });
    } catch {
      // feedback failure is silent
    }
  }

  function handleFollowupSubmit(e) {
    e.preventDefault();
    if (!input.trim() || chat.loading) return;
    chat.send(input);
    setInput("");
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Navigation top */}
        <header className={styles.topNav}>
          <BrandLogo tone="dark" />
          <div className={styles.badgeGenAI}>
            <span className={styles.sparkleIcon}><i className="bi bi-stars"></i></span>
            <span>GenAI RAG Advisor 2026</span>
          </div>
        </header>

        {/* Hero banner */}
        <div className={styles.heroSection}>
          <h1 className={styles.heroTitle}>Trợ Lý AI Tư Vấn Chọn Smartphone</h1>
          <p className={styles.heroDesc}>
            Chỉ với 4 câu hỏi nhanh, công nghệ AI thông minh kết hợp Vector Database sẽ phân tích cấu hình, 
            so sánh giá và kiểm tra tồn kho tại 150 chi nhánh để đề xuất chiếc máy lý tưởng nhất cho bạn.
          </p>
        </div>

        {/* STAGE 1: QUIZ */}
        {stage === "quiz" && question && (
          <div className={styles.quizCard}>
            {/* Progress bar */}
            <div className={styles.progressContainer}>
              <div className={styles.progressInfo}>
                <span className={styles.stepBadge}>Bước {step + 1} / {total}</span>
                <span className={styles.stepTitle}>{question.short}</span>
              </div>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{ width: `${((step + 1) / total) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Question title */}
            <h2 className={styles.questionHeading}>{question.title}</h2>

            {/* Options grid */}
            <div className={styles.optionsGrid}>
              {question.options.map((opt) => {
                const isSelected = answers[question.id] === opt.value;
                const iconName = OPTION_ICONS[opt.value] || "bi-check2-circle";

                return (
                  <button
                    key={opt.value}
                    onClick={() => pick(opt)}
                    className={`${styles.optionBtn} ${isSelected ? styles.optionActive : ""}`}
                    type="button"
                  >
                    <div className={styles.optionIconBox}>
                      <i className={`bi ${iconName}`}></i>
                    </div>
                    <div className={styles.optionContent}>
                      <span className={styles.optionLabel}>{opt.label}</span>
                      {opt.max && opt.min !== undefined && (
                        <small className={styles.optionSub}>
                          {opt.min === 0 ? `Tối đa ${vnd(opt.max)}` : `${vnd(opt.min)} - ${vnd(opt.max)}`}
                        </small>
                      )}
                      {opt.min && !opt.max && (
                        <small className={styles.optionSub}>Từ {vnd(opt.min)} trở lên</small>
                      )}
                    </div>
                    <div className={styles.optionCheck}>
                      <i className="bi bi-chevron-right"></i>
                    </div>
                  </button>
                );
              })}
            </div>

            {step > 0 && (
              <div className={styles.quizNav}>
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className={styles.prevBtn}
                >
                  <i className="bi bi-arrow-left me-1"></i> Quay lại câu trước
                </button>
              </div>
            )}
          </div>
        )}

        {/* STAGE 2: LOADING */}
        {stage === "loading" && (
          <div className={styles.loadingBox}>
            <div className={styles.radarWrapper}>
              <div className={styles.radarRing}></div>
              <div className={styles.radarCenter}>
                <i className="bi bi-robot"></i>
              </div>
            </div>
            <h3>AI đang phân tích nhu cầu của bạn...</h3>
            <p>Đang so sánh thông số kỹ thuật, giá bán và kiểm tra tồn kho tại 150 chi nhánh</p>
          </div>
        )}

        {/* STAGE 3: ERROR */}
        {stage === "error" && (
          <div className={styles.errorBox}>
            <div className={styles.errorIcon}>
              <i className="bi bi-exclamation-triangle-fill"></i>
            </div>
            <h3>Rất tiếc, đã có sự cố kết nối</h3>
            <p>{error || "Không thể kết nối tới dịch vụ AI. Vui lòng kiểm tra lại ai-service."}</p>
            <div className={styles.errorActions}>
              <button onClick={() => submit(answers)} className={styles.primaryBtn}>
                <i className="bi bi-arrow-clockwise me-1"></i> Thử lại
              </button>
              <button onClick={restart} className={styles.secondaryBtn}>
                Làm lại từ đầu
              </button>
            </div>
          </div>
        )}

        {/* STAGE 4: RESULT */}
        {stage === "result" && result && (
          <div className={styles.resultContainer}>
            {/* Criteria chips */}
            {result.profile && (
              <div className={styles.profileChips}>
                <span className={styles.profileChipsTitle}>
                  <i className="bi bi-funnel-fill me-1"></i> Tiêu chí của bạn:
                </span>
                {result.profile.map((p, idx) => (
                  <span key={idx} className={styles.profileChip}>{p}</span>
                ))}
              </div>
            )}

            {/* AI Summary Banner */}
            <div className={styles.summaryBanner}>
              <div className={styles.summaryIcon}>
                <i className="bi bi-chat-quote-fill"></i>
              </div>
              <div>
                <h3 className={styles.summaryTitle}>Đánh giá từ Trợ lý AI</h3>
                <p className={styles.summaryText}>{result.summary}</p>
              </div>
            </div>

            {/* Notes if relaxed criteria */}
            {result.notes && result.notes.length > 0 && (
              <div className={styles.noteAlert}>
                <i className="bi bi-info-circle-fill me-2"></i>
                {result.notes.join(" ")}
              </div>
            )}

            {/* Recommendations Grid */}
            <div className={styles.recommendationsList}>
              {result.recommendations && result.recommendations.map((item, idx) => (
                <div
                  key={item.id}
                  className={`${styles.recCard} ${idx === 0 ? styles.topRecCard : ""}`}
                >
                  {idx === 0 && (
                    <div className={styles.topBadge}>
                      <i className="bi bi-trophy-fill me-1 text-warning"></i>
                      ĐỀ XUẤT PHÙ HỢP NHẤT (#1)
                    </div>
                  )}

                  <div className={styles.recCardHeader}>
                    <div>
                      <h3 className={styles.recTitle}>{item.name}</h3>
                      <div className={styles.recPriceRow}>
                        <span className={styles.recPrice}>{vnd(item.price_vnd)}</span>
                        <span className={styles.recWarrantyBadge}>
                          <i className="bi bi-shield-check me-1"></i> Chính hãng 12T
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Reason */}
                  <div className={styles.recReasonBox}>
                    <strong>Lý do chọn máy:</strong> {item.reason}
                  </div>

                  {/* Highlights / Pros */}
                  {item.match_points && item.match_points.length > 0 && (
                    <div className={styles.specsSection}>
                      <span className={styles.specsLabel}>Điểm nổi bật:</span>
                      <ul className={styles.specsList}>
                        {item.match_points.map((pt, pIdx) => (
                          <li key={pIdx}>
                            <i className="bi bi-check-circle-fill text-success me-2"></i>
                            {pt}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Caution / Cons */}
                  {item.caution && (
                    <div className={styles.cautionBox}>
                      <i className="bi bi-exclamation-circle me-1 text-warning"></i>
                      <span><strong>Cần cân nhắc:</strong> {item.caution}</span>
                    </div>
                  )}

                  {/* In-stock branches */}
                  {item.in_stock_branches && item.in_stock_branches.length > 0 && (
                    <div className={styles.stockSection}>
                      <span className={styles.stockLabel}>
                        <i className="bi bi-geo-alt-fill text-danger me-1"></i>
                        Sẵn hàng tại chi nhánh:
                      </span>
                      <div className={styles.branchChips}>
                        {item.in_stock_branches.map((b, bIdx) => (
                          <span key={bIdx} className={styles.branchChip}>{b}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions & Feedback */}
                  <div className={styles.recFooter}>
                    <div className={styles.voteGroup}>
                      <span className={styles.votePrompt}>Gợi ý này có hữu ích?</span>
                      <button
                        type="button"
                        onClick={() => handleVote(item.id, "like")}
                        className={`${styles.voteBtn} ${votes[item.id] === "like" ? styles.votedActive : ""}`}
                        title="Hữu ích"
                      >
                        <i className="bi bi-hand-thumbs-up-fill me-1"></i> Có
                      </button>
                      <button
                        type="button"
                        onClick={() => handleVote(item.id, "dislike")}
                        className={`${styles.voteBtn} ${votes[item.id] === "dislike" ? styles.votedActive : ""}`}
                        title="Chưa phù hợp"
                      >
                        <i className="bi bi-hand-thumbs-down-fill me-1"></i> Không
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => chat.send(`Tư vấn chi tiết cấu hình và chương trình khuyến mãi của ${item.name}`)}
                      className={styles.askMoreBtn}
                    >
                      <i className="bi bi-chat-text-fill me-1"></i> Hỏi AI thêm về máy này
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Restart quiz button */}
            <div className={styles.restartRow}>
              <button onClick={restart} className={styles.secondaryBtn}>
                <i className="bi bi-arrow-repeat me-1"></i> Chọn lại tiêu chí khác
              </button>
            </div>

            {/* Follow-up chat section */}
            <div className={styles.followupCard}>
              <div className={styles.followupHeader}>
                <i className="bi bi-robot text-danger fs-4 me-2"></i>
                <div>
                  <h3 className={styles.followupTitle}>Hỏi đáp chuyên sâu với Trợ lý AI</h3>
                  <p className={styles.followupSub}>
                    Bạn có thể hỏi thêm về chính sách trả góp, so sánh camera, kiểm tra chi nhánh gần bạn...
                  </p>
                </div>
              </div>

              {/* Chat Thread */}
              <div className={styles.chatThread}>
                {chat.messages.map((m) => (
                  <div
                    key={m.id}
                    className={m.role === "user" ? styles.chatRowUser : styles.chatRowBot}
                  >
                    <div
                      className={
                        m.role === "user"
                          ? styles.chatBubbleUser
                          : m.error
                          ? styles.chatBubbleError
                          : styles.chatBubbleBot
                      }
                    >
                      {m.toolStatus && (
                        <div className={styles.chatToolChip}>
                          <i className="bi bi-gear-fill me-1"></i> {m.toolStatus}
                        </div>
                      )}
                      <div className={styles.chatContent}>
                        {m.content || (chat.loading && !m.toolStatus ? "Đang suy nghĩ..." : "")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Input row */}
              <form onSubmit={handleFollowupSubmit} className={styles.chatForm}>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ví dụ: So sánh camera giữa 2 máy trên, trả góp thế nào?..."
                  className={styles.chatInput}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || chat.loading}
                  className={styles.chatSendBtn}
                >
                  <i className="bi bi-send-fill me-1"></i> Gửi
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
