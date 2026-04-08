"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { getRandomRounds, Song } from "~/lib/songs";

type GameState = "intro" | "playing" | "feedback" | "results";

const ROUND_COUNT = 5;
const PREVIEW_SECONDS = 30;

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export default function Game() {
  const [gameState, setGameState] = useState<GameState>("intro");
  const [rounds, setRounds] = useState<Song[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(PREVIEW_SECONDS);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [playerReady, setPlayerReady] = useState(false);
  const [scores, setScores] = useState<boolean[]>([]);

  const playerRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const startTimer = useCallback(() => {
    setTimeLeft(PREVIEW_SECONDS);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          stopTimer();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }, []);

  const loadYouTubeAPI = useCallback(() => {
    if (window.YT) {
      setPlayerReady(true);
      return;
    }
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
    window.onYouTubeIframeAPIReady = () => setPlayerReady(true);
  }, []);

  useEffect(() => {
    loadYouTubeAPI();
  }, [loadYouTubeAPI]);

  const createPlayer = useCallback(
    (videoId: string) => {
      if (!playerReady || !playerContainerRef.current) return;
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
      const div = document.createElement("div");
      div.id = "yt-player-" + Date.now();
      playerContainerRef.current.innerHTML = "";
      playerContainerRef.current.appendChild(div);

      playerRef.current = new window.YT.Player(div.id, {
        videoId,
        height: "0",
        width: "0",
        playerVars: { autoplay: 1, controls: 0, start: 0 },
        events: {
          onReady: (e: any) => {
            e.target.setVolume(80);
            e.target.playVideo();
            startTimer();
          },
          onStateChange: (e: any) => {
            if (e.data === window.YT.PlayerState.ENDED) stopTimer();
          },
        },
      });
    },
    [playerReady, startTimer]
  );

  const stopPlayer = () => {
    if (playerRef.current) {
      try {
        playerRef.current.stopVideo();
      } catch {}
    }
    stopTimer();
  };

  const startGame = () => {
    const newRounds = getRandomRounds(ROUND_COUNT);
    setRounds(newRounds);
    setCurrentRound(0);
    setScore(0);
    setScores([]);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setGameState("playing");
  };

  useEffect(() => {
    if (gameState === "playing" && rounds.length > 0 && playerReady) {
      createPlayer(rounds[currentRound].youtubeId);
    }
    return () => stopTimer();
  }, [gameState, currentRound, rounds, playerReady, createPlayer]);

  const handleAnswer = (answer: string) => {
    if (selectedAnswer) return;
    stopPlayer();
    const correct = answer === rounds[currentRound].artist;
    setSelectedAnswer(answer);
    setIsCorrect(correct);
    if (correct) setScore((s) => s + 1);
    setScores((prev) => [...prev, correct]);
    setGameState("feedback");
  };

  const nextRound = () => {
    if (currentRound + 1 >= ROUND_COUNT) {
      setGameState("results");
    } else {
      setCurrentRound((r) => r + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
      setGameState("playing");
    }
  };

  const getScoreEmoji = () => {
    if (score === 5) return "🏆";
    if (score >= 3) return "🎵";
    if (score >= 1) return "😅";
    return "💀";
  };

  const getScoreMessage = () => {
    if (score === 5) return "Perfect Score! You're a music legend!";
    if (score >= 3) return "Nice! You've got good taste!";
    if (score >= 1) return "Not bad, keep listening more!";
    return "Oof... maybe stick to podcasts?";
  };

  const song = rounds[currentRound];
  const progress = ((PREVIEW_SECONDS - timeLeft) / PREVIEW_SECONDS) * 100;

  return (
    <div style={styles.container}>
      {/* Hidden YouTube player */}
      <div ref={playerContainerRef} style={{ position: "absolute", opacity: 0, pointerEvents: "none" }} />

      {/* INTRO */}
      {gameState === "intro" && (
        <div style={styles.screen}>
          <div style={styles.introIcon}>🎧</div>
          <h1 style={styles.title}>Who Made That?</h1>
          <p style={styles.subtitle}>
            Listen to the song clip and guess the artist. 5 rounds. 30 seconds each.
          </p>
          <div style={styles.rulesBox}>
            <div style={styles.rule}>🎵 A song clip plays automatically</div>
            <div style={styles.rule}>🎤 Pick the correct artist</div>
            <div style={styles.rule}>⚡ No time limit to answer</div>
            <div style={styles.rule}>🏆 Score as high as you can!</div>
          </div>
          <button style={styles.primaryBtn} onClick={startGame}>
            Start Game
          </button>
        </div>
      )}

      {/* PLAYING */}
      {gameState === "playing" && song && (
        <div style={styles.screen}>
          <div style={styles.roundBadge}>
            Round {currentRound + 1} / {ROUND_COUNT}
          </div>

          <div style={styles.nowPlaying}>
            <div style={styles.vinylWrapper}>
              <div style={styles.vinyl}>
                <div style={styles.vinylInner} />
              </div>
            </div>
            <div style={styles.songInfo}>
              <p style={styles.songLabel}>NOW PLAYING</p>
              <p style={styles.songTitle}>{song.title}</p>
            </div>
          </div>

          {/* Progress bar */}
          <div style={styles.progressContainer}>
            <div style={styles.progressBar}>
              <div style={{ ...styles.progressFill, width: `${progress}%` }} />
            </div>
            <span style={styles.timeLeft}>{timeLeft}s</span>
          </div>

          <p style={styles.guessPrompt}>Who made this track?</p>

          <div style={styles.optionsGrid}>
            {song.options.map((opt) => (
              <button key={opt} style={styles.optionBtn} onClick={() => handleAnswer(opt)}>
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* FEEDBACK */}
      {gameState === "feedback" && song && (
        <div style={styles.screen}>
          <div style={isCorrect ? styles.correctBanner : styles.wrongBanner}>
            {isCorrect ? "✅ Correct!" : "❌ Wrong!"}
          </div>

          <div style={styles.feedbackCard}>
            <p style={styles.feedbackLabel}>The correct artist was</p>
            <p style={styles.feedbackArtist}>{song.artist}</p>
            <p style={styles.feedbackSong}>"{song.title}"</p>
          </div>

          <div style={styles.scoreRow}>
            {scores.map((s, i) => (
              <div key={i} style={s ? styles.dotCorrect : styles.dotWrong} />
            ))}
            {Array.from({ length: ROUND_COUNT - scores.length }).map((_, i) => (
              <div key={`empty-${i}`} style={styles.dotEmpty} />
            ))}
          </div>

          <button style={styles.primaryBtn} onClick={nextRound}>
            {currentRound + 1 >= ROUND_COUNT ? "See Results" : "Next Round →"}
          </button>
        </div>
      )}

      {/* RESULTS */}
      {gameState === "results" && (
        <div style={styles.screen}>
          <div style={styles.resultEmoji}>{getScoreEmoji()}</div>
          <h2 style={styles.resultScore}>
            {score} / {ROUND_COUNT}
          </h2>
          <p style={styles.resultMessage}>{getScoreMessage()}</p>

          <div style={styles.scoreRow}>
            {scores.map((s, i) => (
              <div key={i} style={s ? styles.dotCorrect : styles.dotWrong} />
            ))}
          </div>

          <button style={styles.primaryBtn} onClick={startGame}>
            Play Again
          </button>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Segoe UI', sans-serif",
    color: "#fff",
    padding: "16px",
  },
  screen: {
    width: "100%",
    maxWidth: "420px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "20px",
    padding: "24px",
    background: "rgba(255,255,255,0.05)",
    borderRadius: "24px",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255,255,255,0.1)",
  },
  introIcon: { fontSize: "64px" },
  title: {
    fontSize: "32px",
    fontWeight: 800,
    margin: 0,
    background: "linear-gradient(90deg, #f9a8d4, #a78bfa)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  subtitle: {
    fontSize: "14px",
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
    margin: 0,
  },
  rulesBox: {
    background: "rgba(255,255,255,0.07)",
    borderRadius: "16px",
    padding: "16px",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  rule: { fontSize: "14px", color: "rgba(255,255,255,0.85)" },
  primaryBtn: {
    background: "linear-gradient(90deg, #f9a8d4, #a78bfa)",
    border: "none",
    borderRadius: "50px",
    padding: "14px 40px",
    fontSize: "16px",
    fontWeight: 700,
    color: "#1a1a2e",
    cursor: "pointer",
    width: "100%",
  },
  roundBadge: {
    background: "rgba(167,139,250,0.2)",
    border: "1px solid rgba(167,139,250,0.4)",
    borderRadius: "50px",
    padding: "6px 20px",
    fontSize: "13px",
    color: "#c4b5fd",
    fontWeight: 600,
  },
  nowPlaying: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    width: "100%",
    background: "rgba(255,255,255,0.07)",
    borderRadius: "16px",
    padding: "16px",
  },
  vinylWrapper: { flexShrink: 0 },
  vinyl: {
    width: "60px",
    height: "60px",
    borderRadius: "50%",
    background: "conic-gradient(#1a1a1a, #333, #1a1a1a, #444, #1a1a1a)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    animation: "spin 3s linear infinite",
    boxShadow: "0 0 20px rgba(167,139,250,0.4)",
  },
  vinylInner: {
    width: "18px",
    height: "18px",
    borderRadius: "50%",
    background: "#a78bfa",
  },
  songInfo: { flex: 1 },
  songLabel: {
    fontSize: "10px",
    letterSpacing: "2px",
    color: "#a78bfa",
    margin: 0,
    fontWeight: 700,
  },
  songTitle: {
    fontSize: "16px",
    fontWeight: 700,
    margin: "4px 0 0",
    color: "#fff",
  },
  progressContainer: {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  progressBar: {
    flex: 1,
    height: "6px",
    background: "rgba(255,255,255,0.1)",
    borderRadius: "3px",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    background: "linear-gradient(90deg, #f9a8d4, #a78bfa)",
    borderRadius: "3px",
    transition: "width 1s linear",
  },
  timeLeft: { fontSize: "13px", color: "#a78bfa", fontWeight: 700, minWidth: "30px" },
  guessPrompt: {
    fontSize: "14px",
    color: "rgba(255,255,255,0.5)",
    margin: 0,
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  optionsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    width: "100%",
  },
  optionBtn: {
    background: "rgba(255,255,255,0.08)",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: "12px",
    padding: "14px 10px",
    fontSize: "13px",
    fontWeight: 600,
    color: "#fff",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  correctBanner: {
    fontSize: "28px",
    fontWeight: 800,
    color: "#4ade80",
    textAlign: "center",
  },
  wrongBanner: {
    fontSize: "28px",
    fontWeight: 800,
    color: "#f87171",
    textAlign: "center",
  },
  feedbackCard: {
    background: "rgba(255,255,255,0.07)",
    borderRadius: "16px",
    padding: "20px",
    width: "100%",
    textAlign: "center",
  },
  feedbackLabel: { fontSize: "12px", color: "rgba(255,255,255,0.5)", margin: 0 },
  feedbackArtist: { fontSize: "24px", fontWeight: 800, margin: "8px 0 4px", color: "#a78bfa" },
  feedbackSong: { fontSize: "14px", color: "rgba(255,255,255,0.6)", margin: 0 },
  scoreRow: { display: "flex", gap: "8px" },
  dotCorrect: {
    width: "14px",
    height: "14px",
    borderRadius: "50%",
    background: "#4ade80",
  },
  dotWrong: {
    width: "14px",
    height: "14px",
    borderRadius: "50%",
    background: "#f87171",
  },
  dotEmpty: {
    width: "14px",
    height: "14px",
    borderRadius: "50%",
    background: "rgba(255,255,255,0.15)",
  },
  resultEmoji: { fontSize: "72px" },
  resultScore: {
    fontSize: "48px",
    fontWeight: 900,
    margin: 0,
    background: "linear-gradient(90deg, #f9a8d4, #a78bfa)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  resultMessage: {
    fontSize: "16px",
    color: "rgba(255,255,255,0.7)",
    textAlign: "center",
    margin: 0,
  },
};