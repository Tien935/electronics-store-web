"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@/hooks/useChat";
import { recommend } from "@/lib/advisor-api";
import styles from "./ChatWidget.module.css";

// 4 gợi ý ban đầu khi mở chat
const QUICK_QUESTIONS = [
  { icon: "bi-currency-dollar", label: "Tìm máy theo ngân sách", msg: "Tôi muốn tìm điện thoại phù hợp với ngân sách của mình" },
  { icon: "bi-camera",          label: "Chụp ảnh đẹp nhất",     msg: "Điện thoại nào chụp ảnh đẹp nhất tầm 15-20 triệu?" },
  { icon: "bi-geo-alt",         label: "Kiểm tra hàng tại kho", msg: "Kiểm tra iPhone 16 Pro Max còn hàng ở chi nhánh nào?" },
  { icon: "bi-graph-up-arrow",  label: "So sánh hai dòng máy",  msg: "So sánh Samsung Galaxy S24 Ultra và iPhone 16 Pro Max" },
];

const QUIZ_QUESTIONS = [
  {
    id: "budget", short: "Ngân sách",
    title: "Ngân sách của bạn khoảng bao nhiêu?",
    options: [
      { value: "under_10", label: "Dưới 10 triệu",  desc: "Pin bền, học tập & giải trí cơ bản",            tag: "< 10tr",   icon: "bi-wallet2" },
      { value: "10_20",    label: "10 – 20 triệu",  desc: "Cận cao cấp, camera sắc nét, hiệu năng mạnh",   tag: "10-20tr",  icon: "bi-credit-card" },
      { value: "20_30",    label: "20 – 30 triệu",  desc: "Flagship, thiết kế sang trọng, hiệu năng đỉnh", tag: "20-30tr",  icon: "bi-gem" },
      { value: "over_30",  label: "Trên 30 triệu",  desc: "Siêu phẩm hàng đầu (iPhone Pro Max, S24 Ultra)",tag: "> 30tr",   icon: "bi-stars" },
    ],
  },
  {
    id: "usage", short: "Nhu cầu",
    title: "Bạn chủ yếu dùng máy để làm gì?",
    options: [
      { value: "gaming",  label: "Chiến game & Đồ họa",         desc: "Chip mạnh, 120Hz, tản nhiệt tốt",         icon: "bi-controller" },
      { value: "camera",  label: "Chụp ảnh & Quay video",       desc: "Camera OIS, zoom quang, quay 4K/8K",      icon: "bi-camera" },
      { value: "work",    label: "Công việc & Học tập",         desc: "Đa nhiệm mượt mà, pin dùng cả ngày",       icon: "bi-briefcase" },
      { value: "basic",   label: "Dùng cơ bản hằng ngày",      desc: "Mạng xã hội, xem phim, nghe gọi ổn định", icon: "bi-phone" },
    ],
  },
  {
    id: "brand", short: "Thương hiệu",
    title: "Bạn ưu tiên hãng hoặc hệ điều hành nào?",
    options: [
      { value: "apple",   label: "Apple iPhone (iOS)",              desc: "Mượt mà lâu dài, giữ giá tốt",             icon: "bi-apple" },
      { value: "android", label: "Android (Samsung, Xiaomi…)",      desc: "Nhiều tính năng AI, sạc nhanh, tùy biến",  icon: "bi-android2" },
      { value: "any",     label: "Không quan trọng",                desc: "Chọn máy tốt nhất trong tầm giá",         icon: "bi-grid" },
    ],
  },
  {
    id: "priority", short: "Ưu tiên",
    title: "Điều quan trọng nhất với bạn là gì?",
    options: [
      { value: "battery",     label: "Pin trâu & Sạc nhanh",   desc: "5000mAh+, sạc đầy trong 30-45 phút",   icon: "bi-battery-charging" },
      { value: "display",     label: "Màn hình đẹp, mượt mà",  desc: "OLED/AMOLED, tần số quét 120Hz",       icon: "bi-display" },
      { value: "performance", label: "Cấu hình & Tốc độ",      desc: "Chip đời mới, không giật lag đa nhiệm", icon: "bi-cpu" },
      { value: "price",       label: "Giá tốt / Nhiều KM",     desc: "Cấu hình tối đa trong tầm ngân sách",  icon: "bi-tag" },
    ],
  },
];

const vnd = (n) => n ? new Intl.NumberFormat("vi-VN").format(n) + " ₫" : "";

function formatMessage(text) {
  if (!text) return "";
  return text.split("\n").map((line, i, arr) => {
    const parts = line.split(/(\*\*.*?\*\*)/g).map((p, j) =>
      p.startsWith("**") && p.endsWith("**")
        ? <strong key={j} className={styles.boldText}>{p.slice(2, -2)}</strong>
        : p
    );
    return <span key={i} className={styles.msgLine}>{parts}{i < arr.length - 1 && <br />}</span>;
  });
}

// Trạng thái giao diện
const VIEW = { WELCOME: "welcome", QUIZ: "quiz", RESULT: "result", CHAT: "chat" };

export default function ChatWidget() {
  const [open, setOpen]       = useState(false);
  const [view, setView]       = useState(VIEW.WELCOME);
  const [input, setInput]     = useState("");
  const [quizStep, setQuizStep]     = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizResult, setQuizResult]   = useState(null);

  const { messages, loading, send, stop, reset } = useChat();
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const submit = () => {
    if (!input.trim() || loading) return;
    send(input);
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); }
  };

  // Click gợi ý nhanh → chuyển sang chat và gửi luôn
  const handleQuickQ = (q) => {
    setView(VIEW.CHAT);
    send(q.msg);
  };

  // Click "Tìm máy theo ngân sách" → vào quiz
  const startQuiz = () => {
    setQuizStep(0);
    setQuizAnswers({});
    setQuizResult(null);
    setView(VIEW.QUIZ);
  };

  const handlePickOption = async (opt) => {
    const q = QUIZ_QUESTIONS[quizStep];
    const newAns = { ...quizAnswers, [q.id]: opt.value };
    setQuizAnswers(newAns);

    if (quizStep < QUIZ_QUESTIONS.length - 1) {
      setQuizStep(quizStep + 1);
    } else {
      setQuizLoading(true);
      setView(VIEW.RESULT);
      try {
        const res = await recommend(newAns);
        setQuizResult(res);
      } catch (e) {
        console.error(e);
        setQuizResult({ summary: "Không thể lấy gợi ý lúc này. Vui lòng thử lại.", recommendations: [] });
      } finally {
        setQuizLoading(false);
      }
    }
  };

  // Hỏi chi tiết về 1 sản phẩm → chuyển sang chat
  const askProduct = (name) => {
    setView(VIEW.CHAT);
    send(`Tư vấn chi tiết cấu hình, giá bán, ưu đãi và tình trạng tồn kho tại các chi nhánh của ${name}`);
  };

  const handleReset = () => {
    reset();
    setQuizStep(0);
    setQuizAnswers({});
    setQuizResult(null);
    setView(VIEW.WELCOME);
  };

  /* ══════════════════════════════════════════════
     FAB (nút nổi) khi chưa mở
  ══════════════════════════════════════════════ */
  if (!open) return (
    <div className={styles.fabWrapper}>
      <span className={styles.fabPulse}></span>
      <button className={styles.fabBtn} onClick={() => setOpen(true)} aria-label="Mở tư vấn">
        <i className="bi bi-headset"></i>
        <span className={styles.fabLabel}>
          <strong>Tư Vấn Mua Sắm</strong>
          <small>Hỏi đáp · Tìm máy · Kiểm kho</small>
        </span>
        <span className={styles.fabDot}></span>
      </button>
    </div>
  );

  /* ══════════════════════════════════════════════
     PANEL chính
  ══════════════════════════════════════════════ */
  return (
    <div className={styles.panel} role="dialog" aria-label="Tư vấn mua sắm TechMart">

      {/* ── HEADER ── */}
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.avatar}><i className="bi bi-headset"></i></div>
          <div>
            <div className={styles.headerName}>
              Chuyên Viên Tư Vấn
              <span className={styles.onlineBadge}><span className={styles.onlineDot}></span>Trực tuyến</span>
            </div>
            <div className={styles.headerSub}>TechMart · 150 chi nhánh toàn quốc</div>
          </div>
        </div>
        <div className={styles.headerRight}>
          <button className={styles.iconBtn} onClick={handleReset} title="Cuộc hội thoại mới">
            <i className="bi bi-arrow-clockwise"></i>
          </button>
          <button className={styles.iconBtn} onClick={() => setOpen(false)} title="Thu nhỏ">
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
      </header>

      {/* ── BODY ── */}
      <div className={styles.body}>

        {/* VIEW: WELCOME */}
        {view === VIEW.WELCOME && (
          <div className={styles.welcomeWrap}>
            <div className={styles.welcomeHero}>
              <div className={styles.welcomeAvatar}><i className="bi bi-headset"></i></div>
              <h3>Xin chào! Tôi có thể giúp gì cho bạn?</h3>
              <p>Tôi có thể tư vấn điện thoại, so sánh cấu hình, kiểm tra giá và tồn kho tại 150 chi nhánh trên toàn quốc.</p>
            </div>

            <div className={styles.quickLabel}>Chọn nhanh để bắt đầu:</div>
            <div className={styles.quickGrid}>
              {QUICK_QUESTIONS.map((q, i) => (
                <button key={i} className={styles.quickCard}
                  onClick={() => i === 0 ? startQuiz() : handleQuickQ(q)}>
                  <i className={`bi ${q.icon} ${styles.quickIcon}`}></i>
                  <span>{q.label}</span>
                </button>
              ))}
            </div>

            <div className={styles.orDivider}><span>hoặc gõ câu hỏi bất kỳ bên dưới</span></div>
          </div>
        )}

        {/* VIEW: QUIZ */}
        {view === VIEW.QUIZ && (
          <div className={styles.quizWrap}>
            <div className={styles.quizProgress}>
              <span className={styles.quizStep}>
                Câu {quizStep + 1} / {QUIZ_QUESTIONS.length}
              </span>
              <span className={styles.quizStepName}>{QUIZ_QUESTIONS[quizStep].short}</span>
            </div>
            <div className={styles.quizBar}>
              <div className={styles.quizBarFill}
                style={{ width: `${((quizStep + 1) / QUIZ_QUESTIONS.length) * 100}%` }}>
              </div>
            </div>

            <h4 className={styles.quizTitle}>{QUIZ_QUESTIONS[quizStep].title}</h4>

            <div className={styles.optionList}>
              {QUIZ_QUESTIONS[quizStep].options.map((opt) => {
                const active = quizAnswers[QUIZ_QUESTIONS[quizStep].id] === opt.value;
                return (
                  <button key={opt.value}
                    className={`${styles.optCard} ${active ? styles.optCardActive : ""}`}
                    onClick={() => handlePickOption(opt)}>
                    <span className={`${styles.optIcon} ${active ? styles.optIconActive : ""}`}>
                      <i className={`bi ${opt.icon}`}></i>
                    </span>
                    <span className={styles.optInfo}>
                      <span className={styles.optLabel}>{opt.label}</span>
                      <span className={styles.optDesc}>{opt.desc}</span>
                    </span>
                    {opt.tag && <span className={`${styles.optTag} ${active ? styles.optTagActive : ""}`}>{opt.tag}</span>}
                    <i className={`bi bi-chevron-right ${styles.optArrow}`}></i>
                  </button>
                );
              })}
            </div>

            {quizStep > 0 && (
              <button className={styles.backBtn} onClick={() => setQuizStep(quizStep - 1)}>
                <i className="bi bi-arrow-left me-1"></i>Quay lại
              </button>
            )}
          </div>
        )}

        {/* VIEW: RESULT */}
        {view === VIEW.RESULT && (
          <div className={styles.resultWrap}>
            {quizLoading ? (
              <div className={styles.resultLoading}>
                <div className={styles.spinner}></div>
                <p>Đang phân tích nhu cầu và kiểm tra kho...</p>
              </div>
            ) : (
              <>
                <div className={styles.resultBanner}>
                  <i className="bi bi-check-circle-fill me-2"></i>
                  <span>{quizResult?.summary}</span>
                  <button className={styles.reDoBtn} onClick={startQuiz}>
                    <i className="bi bi-arrow-repeat me-1"></i>Chọn lại
                  </button>
                </div>

                {quizResult?.recommendations?.map((item, idx) => (
                  <div key={item.id} className={`${styles.prodCard} ${idx === 0 ? styles.prodCardTop : ""}`}>
                    {idx === 0 && (
                      <div className={styles.topBadge}>
                        <i className="bi bi-star-fill me-1"></i>Phù hợp nhất
                      </div>
                    )}
                    <div className={styles.prodHeader}>
                      <span className={styles.prodName}>{item.name}</span>
                      <span className={styles.prodPrice}>{vnd(item.price_vnd)}</span>
                    </div>
                    <p className={styles.prodReason}>{item.reason}</p>

                    {/* Tồn kho chi nhánh */}
                    {item.in_stock_branches?.length > 0 && (
                      <div className={styles.stockRow}>
                        <i className="bi bi-geo-alt-fill me-1"></i>
                        <span>Còn hàng tại: </span>
                        <span className={styles.stockBranches}>
                          {item.in_stock_branches.map((b, i) => (
                            <span key={i} className={styles.branchChip}>{b}</span>
                          ))}
                        </span>
                      </div>
                    )}

                    <button className={styles.askBtn} onClick={() => askProduct(item.name)}>
                      <i className="bi bi-chat-left-text me-1"></i>Hỏi tư vấn chi tiết
                    </button>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {/* VIEW: CHAT */}
        {view === VIEW.CHAT && (
          <div className={styles.chatArea} aria-live="polite">
            {messages.map((m) => (
              <div key={m.id} className={m.role === "user" ? styles.rowUser : styles.rowBot}>
                {m.role === "assistant" && (
                  <div className={styles.botAvatar}><i className="bi bi-headset"></i></div>
                )}
                <div className={
                  m.role === "user" ? styles.bubbleUser
                  : m.error ? styles.bubbleError
                  : styles.bubbleBot
                }>
                  {m.toolStatus && (
                    <div className={styles.toolStatus}>
                      <i className={`bi bi-arrow-repeat ${styles.spinning} me-1`}></i>
                      {m.toolStatus}
                    </div>
                  )}
                  <div className={styles.bubbleText}>
                    {m.content
                      ? formatMessage(m.content)
                      : (loading && !m.toolStatus)
                        ? <span className={styles.typing}><span/><span/><span/></span>
                        : null
                    }
                  </div>
                  {/* Source chips */}
                  {m.role === "assistant" && m.sources?.length > 0 && (
                    <div className={styles.sources}>
                      <div className={styles.sourcesLabel}>Sản phẩm liên quan:</div>
                      {m.sources.map((s) => (
                        <button key={s.id} className={styles.sourceChip}
                          onClick={() => send(`Tư vấn chi tiết và tồn kho của ${s.name}`)}>
                          <span>{s.name}</span>
                          {s.price_vnd && <span className={styles.sourcePrice}>{vnd(s.price_vnd)}</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* ── FOOTER INPUT (hiển thị ở mọi view) ── */}
      <footer className={styles.footer}>
        {view !== VIEW.CHAT && view !== VIEW.WELCOME && (
          <button className={styles.switchChatBtn} onClick={() => setView(VIEW.CHAT)}>
            <i className="bi bi-chat-left-dots me-1"></i>Hoặc hỏi trực tiếp
          </button>
        )}
        <div className={styles.inputRow}>
          <textarea
            className={styles.textarea}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            maxLength={1000}
            placeholder="Nhập câu hỏi bất kỳ..."
            onFocus={() => { if (view === VIEW.WELCOME || view === VIEW.RESULT) setView(VIEW.CHAT); }}
          />
          {loading
            ? <button className={styles.stopBtn} onClick={stop} aria-label="Dừng">
                <i className="bi bi-stop-fill"></i>
              </button>
            : <button className={styles.sendBtn} onClick={submit} disabled={!input.trim()} aria-label="Gửi">
                <i className="bi bi-arrow-up-short"></i>
              </button>
          }
        </div>
      </footer>
    </div>
  );
}
