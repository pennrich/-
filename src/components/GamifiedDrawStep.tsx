import React, { useState, useEffect, useRef } from "react";
import { Student, Seat } from "../types";
import { ArrowLeft, Play, Square, ScreenShare, Sparkles, Sliders, ListRestart, HelpCircle, Eye } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface GamifiedDrawStepProps {
  rows: number;
  cols: number;
  students: Student[];
  seats: Seat[];
  avoidGroups: string[][];
  onComplete: (assignedSeats: Seat[]) => void;
  onPrev: () => void;
}

export default function GamifiedDrawStep({ rows, cols, students, seats, avoidGroups, onComplete, onPrev }: GamifiedDrawStepProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  const [revealProgress, setRevealProgress] = useState(0);
  const [animationMode, setAnimationMode] = useState<"instant" | "cascade-row" | "cascade-seat">("cascade-row");
  
  // Temporary display state for roulette names
  const [rouletteNames, setRouletteNames] = useState<Record<string, string>>({});
  const [savedAssignedSeats, setSavedAssignedSeats] = useState<Seat[]>([]);

  const [stoppingRowIdx, setStoppingRowIdx] = useState<number>(-1);

  const spinningTimerRef = useRef<NodeJS.Timeout | null>(null);
  const revealIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const rowStopIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Web Audio API Sound Engine
  const playSeatingSound = (type: "tick" | "stop" | "jackpot", noteIndex: number = 0) => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      if (type === "tick") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(450 + Math.random() * 700, ctx.currentTime);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.05);
      } else if (type === "stop") {
        const freqs = [523.25, 587.33, 659.25, 698.46, 783.99, 880.00, 987.77, 1046.50, 1174.66, 1318.51];
        const freq = freqs[noteIndex % freqs.length] || 523.25;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.45);
      } else if (type === "jackpot") {
        const now = ctx.currentTime;
        const playTone = (f: number, delay: number, duration: number) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(f, now + delay);
          gain.gain.setValueAtTime(0.18, now + delay);
          gain.gain.exponentialRampToValueAtTime(0.001, now + delay + duration);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + delay);
          osc.stop(now + delay + duration);
        };
        playTone(523.25, 0, 0.4);
        playTone(659.25, 0.1, 0.4);
        playTone(783.99, 0.2, 0.4);
        playTone(1046.50, 0.3, 0.8);
        playTone(1318.51, 0.4, 0.8);
      }
    } catch (e) {
      console.error("Audio error:", e);
    }
  };

  // Clean timer on unmount
  useEffect(() => {
    return () => {
      if (spinningTimerRef.current) clearInterval(spinningTimerRef.current);
      if (revealIntervalRef.current) clearInterval(revealIntervalRef.current);
      if (rowStopIntervalRef.current) clearInterval(rowStopIntervalRef.current);
    };
  }, []);

  // Shuffle helper function (fisher-yates)
  const shuffleArray = <T,>(arr: T[]): T[] => {
    const list = [...arr];
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
  };

  // Seating engine matching poor vision to rows 1-2 (0 & 1 indices) and enforcing avoidGroups constraints
  const computeRandomSeating = (): Seat[] => {
    const activeSeats = seats.filter((s) => !s.isDisabled);
    const poorVisionStudents = students.filter((s) => s.isPoorVision);
    const normalStudents = students.filter((s) => !s.isPoorVision);

    const hasAvoidViolations = (assignedMap: Map<string, string>, checkDiagonal: boolean): boolean => {
      // Find seat for each student
      const studentToSeatMap = new Map<string, Seat>();
      seats.forEach((s) => {
        if (!s.isDisabled) {
          const sId = assignedMap.get(s.id);
          if (sId) {
            studentToSeatMap.set(sId, s);
          }
        }
      });

      for (const group of avoidGroups) {
        const activeIds = group.filter((id) => id !== "");
        if (activeIds.length <= 1) continue;

        for (let i = 0; i < activeIds.length; i++) {
          for (let j = i + 1; j < activeIds.length; j++) {
            const seatA = studentToSeatMap.get(activeIds[i]);
            const seatB = studentToSeatMap.get(activeIds[j]);
            if (seatA && seatB) {
              const rowDiff = Math.abs(seatA.row - seatB.row);
              const colDiff = Math.abs(seatA.col - seatB.col);
              if (checkDiagonal) {
                // If Chebyshev distance is <= 1, they are adjacent in any direction (orthogonal or diagonal)
                if (rowDiff <= 1 && colDiff <= 1) return true;
              } else {
                // Orthogonal only (directly next to each other, front/behind)
                if ((rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1)) return true;
              }
            }
          }
        }
      }
      return false;
    };

    let bestAssignedMap = new Map<string, string>();
    let solutionFound = false;

    // We run up to 4000 total tries to solve the layout constraints.
    for (let attempt = 0; attempt < 4000; attempt++) {
      const assignedSeatsMap = new Map<string, string>();

      // Clear student ids on a dummy copy
      const updatedSeats = seats.map((s) => ({ ...s, studentId: s.isDisabled ? null : null }));
      let frontSeats = updatedSeats.filter((s) => !s.isDisabled && s.row < 2);
      let rearSeats = updatedSeats.filter((s) => !s.isDisabled && s.row >= 2);

      let shuffledFront = shuffleArray(frontSeats);
      let shuffledRear = shuffleArray(rearSeats);
      const shuffledPoorVision = shuffleArray(poorVisionStudents);
      const shuffledNormal = shuffleArray(normalStudents);

      shuffledPoorVision.forEach((pvStudent) => {
        if (shuffledFront.length > 0) {
          const targetSeat = shuffledFront.pop()!;
          assignedSeatsMap.set(targetSeat.id, pvStudent.id);
        } else if (shuffledRear.length > 0) {
          const targetSeat = shuffledRear.pop()!;
          assignedSeatsMap.set(targetSeat.id, pvStudent.id);
        }
      });

      const availableRestSeats = [...shuffledFront, ...shuffledRear];
      let shuffledRest = shuffleArray(availableRestSeats);

      shuffledNormal.forEach((student) => {
        if (shuffledRest.length > 0) {
          const targetSeat = shuffledRest.pop()!;
          assignedSeatsMap.set(targetSeat.id, student.id);
        }
      });

      if (attempt === 0) {
        bestAssignedMap = assignedSeatsMap; // solid fallback
      }

      // First 2000 tries: strict check (includes diagonal)
      // Next 2000 tries: relaxed check (orthogonal only)
      const checkDiagonal = attempt < 2000;
      if (!hasAvoidViolations(assignedSeatsMap, checkDiagonal)) {
        bestAssignedMap = assignedSeatsMap;
        solutionFound = true;
        break;
      }
    }

    if (!solutionFound) {
      console.warn("Could not find a mathematically perfect layout violating absolutely 0 adjacencies. Used best effort.");
    }

    return seats.map((s) => {
      if (s.isDisabled) return { ...s, studentId: null };
      return { ...s, studentId: bestAssignedMap.get(s.id) || null };
    });
  };

  // Handle SPIN start
  const handleStartSpin = () => {
    if (students.length === 0) {
      alert("등록된 학생이 복원되지 않았습니다. 이전 단계에서 학생을 입력해 주세요.");
      return;
    }

    if (spinningTimerRef.current) clearInterval(spinningTimerRef.current);
    if (revealIntervalRef.current) clearInterval(revealIntervalRef.current);
    if (rowStopIntervalRef.current) clearInterval(rowStopIntervalRef.current);

    setIsSpinning(true);
    setIsRevealing(false);
    setRevealProgress(0);
    setStoppingRowIdx(-1);
    setSavedAssignedSeats([]);

    // Start high speed visual roulette names random cycling
    let tickCounter = 0;
    spinningTimerRef.current = setInterval(() => {
      tickCounter++;
      if (tickCounter % 2 === 0) {
        playSeatingSound("tick");
      }

      const tempNames: Record<string, string> = {};
      seats.forEach((seat) => {
        if (!seat.isDisabled) {
          const randomIndex = Math.floor(Math.random() * students.length);
          const randomStudent = students[randomIndex];
          tempNames[seat.id] = `${randomIndex + 1}. ${randomStudent.name}`;
        }
      });
      setRouletteNames(tempNames);
    }, 60);
  };

  // Handle SPIN stop (Cascade Slot-machine stop)
  const handleStopSpin = () => {
    if (spinningTimerRef.current) {
      clearInterval(spinningTimerRef.current);
      spinningTimerRef.current = null;
    }

    setIsSpinning(false);
    setIsRevealing(true);
    
    // Generate actual correct placement
    const finalPlacedSeats = computeRandomSeating();
    setSavedAssignedSeats(finalPlacedSeats);

    let currentStoppingRow = 0;
    setStoppingRowIdx(currentStoppingRow);

    // Keep spinning only for rows that are not yet stopped
    revealIntervalRef.current = setInterval(() => {
      const tempNames: Record<string, string> = {};
      seats.forEach((seat) => {
        if (!seat.isDisabled) {
          if (seat.row < currentStoppingRow) {
            // Already stopped row: display final computed student index and name
            const assignedSeat = finalPlacedSeats.find((s) => s.id === seat.id);
            if (assignedSeat && assignedSeat.studentId) {
              const studentIdx = students.findIndex((st) => st.id === assignedSeat.studentId);
              if (studentIdx !== -1) {
                tempNames[seat.id] = `${studentIdx + 1}. ${students[studentIdx].name}`;
              } else {
                tempNames[seat.id] = "빈자리";
              }
            } else {
              tempNames[seat.id] = "빈자리";
            }
          } else {
            // Still spinning row
            const randomIndex = Math.floor(Math.random() * students.length);
            const randomStudent = students[randomIndex];
            tempNames[seat.id] = `${randomIndex + 1}. ${randomStudent.name}`;
          }
        }
      });
      setRouletteNames(tempNames);
    }, 65);

    // Stop rows sequentially (Cascade effect, 850ms per row)
    rowStopIntervalRef.current = setInterval(() => {
      playSeatingSound("stop", currentStoppingRow);
      currentStoppingRow++;
      setStoppingRowIdx(currentStoppingRow);

      const progress = Math.round((currentStoppingRow / rows) * 100);
      setRevealProgress(progress);

      if (currentStoppingRow >= rows) {
        if (revealIntervalRef.current) clearInterval(revealIntervalRef.current);
        if (rowStopIntervalRef.current) clearInterval(rowStopIntervalRef.current);
        
        // Jackpot Sound
        playSeatingSound("jackpot");
        setIsRevealing(false);

        // Auto transition to Final View after completed animation
        setTimeout(() => {
          onComplete(finalPlacedSeats);
        }, 1800);
      }
    }, 850);
  };

  const getStudentName = (seat: Seat, realSeats: Seat[]) => {
    const seatInFinal = realSeats.find((s) => s.id === seat.id);
    if (!seatInFinal || !seatInFinal.studentId) return "";
    const student = students.find((s) => s.id === seatInFinal.studentId);
    if (!student) return "";
    const studentIdx = students.findIndex((s) => s.id === student.id);
    return `${studentIdx + 1}. ${student.name}`;
  };

  const getStudentPriority = (seat: Seat, realSeats: Seat[]) => {
    const seatInFinal = realSeats.find((s) => s.id === seat.id);
    if (!seatInFinal || !seatInFinal.studentId) return false;
    const student = students.find((s) => s.id === seatInFinal.studentId);
    return student ? student.isPoorVision : false;
  };

  // Group seats by row for display
  const seatsByRow = Array.from({ length: rows }).map((_, rIdx) => {
    return seats.filter((s) => s.row === rIdx).sort((a, b) => a.col - b.col);
  });

  return (
    <div id="gamified-draw-step" className="max-w-7xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative text-white overflow-hidden">
      
      {/* Dynamic Background Neon Light Lines for gaming feels */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-pulse" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-800 relative z-10">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-purple-600 to-indigo-600 p-2.5 rounded-2xl shadow-lg ring-1 ring-white/10">
            <Sparkles className="w-6 h-6 text-purple-200 animate-spin" style={{ animationDuration: '4s' }} />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight font-display text-white">모둠 자리 오락실 추첨기</h2>
            <p className="text-xs text-slate-400 font-sans mt-0.5">교실 대형 TV 화면 맞춤 크기! 번호와 이름이 아주 크고 선명하게 보입니다.</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-800/80 p-2 rounded-xl border border-slate-700 text-xs font-sans">
          <span className="text-blue-400 font-bold">슬롯머신 연출:</span>
          <span>1열부터 물결치며 순차 정지</span>
        </div>
      </div>

      {/* Main gaming stage (Expanded size) */}
      <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-6 md:p-10 mb-6 shadow-inner relative z-10">
        
        {/* Class Desk */}
        <div className="w-48 mx-auto bg-gradient-to-b from-slate-800 to-slate-900 text-slate-100 text-sm font-bold py-3 rounded-xl text-center shadow-lg border border-slate-700/80 mb-10 flex items-center justify-center gap-1.5 font-sans relative overflow-hidden">
          <div className="absolute inset-0 bg-blue-500/10 animate-pulse" />
          <ScreenShare size={15} className="text-cyan-400 relative z-10" />
          <span className="relative z-10 text-base">교탁 (칠판 방향)</span>
        </div>

        {/* Drawing Board Seats Grid (Super Sized Blocks) */}
        <div className="flex flex-col items-center justify-center min-h-[300px] overflow-x-auto min-w-max pb-4">
          <div className="space-y-2.5">
            {seatsByRow.map((rowSeats, rIdx) => {
              const isRowStopped = stoppingRowIdx !== -1 && rIdx < stoppingRowIdx;
              
              return (
                <div key={rIdx} className="flex gap-3 justify-center items-center">
                  <span className="w-14 text-right text-xs font-black text-slate-500 font-sans mr-1 select-none">
                    {rIdx + 1}열
                  </span>
                  
                  {rowSeats.map((seat) => {
                    const finalStudentName = getStudentName(seat, savedAssignedSeats);
                    const isPriority = getStudentPriority(seat, savedAssignedSeats);
                    
                    // Is this individual seat stopped?
                    const isSeatStopped = stoppingRowIdx !== -1 && seat.row < stoppingRowIdx;
                    
                    return (
                      <div
                        key={seat.id}
                        className={`w-28 h-16 sm:w-36 sm:h-22 rounded-xl flex flex-col items-center justify-center text-center transition-all duration-300 border font-sans relative select-none ${
                          seat.isDisabled
                            ? "bg-slate-950/40 border-slate-900 text-slate-800/20"
                            : isSpinning
                            ? "bg-gradient-to-tr from-indigo-950 to-purple-950 border-purple-500/50 text-cyan-300 shadow-md shadow-purple-500/5 roulette-active"
                            : isRevealing && !isSeatStopped
                            ? "bg-gradient-to-tr from-indigo-950/80 to-purple-950/80 border-purple-500/40 text-cyan-300 animate-pulse"
                            : isSeatStopped && finalStudentName
                            ? "bg-gradient-to-b from-blue-600 to-indigo-700 border-indigo-400 text-white shadow-xl shadow-blue-500/20"
                            : "bg-slate-900 border-slate-800 text-slate-500"
                        }`}
                      >
                        {/* Cell ID indicator */}
                        <span className="absolute top-1.5 left-2 text-[8.5px] text-slate-600 font-display font-semibold">
                          {seat.row + 1}-{seat.col + 1}
                        </span>

                        {/* Display status inside */}
                        {seat.isDisabled ? (
                          <div className="text-xs text-slate-800 font-bold font-sans">제외</div>
                        ) : isSpinning ? (
                          <span className="text-base sm:text-lg font-black tracking-wide truncate max-w-[100px] text-white">
                            {rouletteNames[seat.id] || "추첨중"}
                          </span>
                        ) : isRevealing && !isSeatStopped ? (
                          <div className="flex flex-col items-center justify-center space-y-1">
                            <span className="text-base sm:text-lg font-black tracking-wide truncate max-w-[100px] text-purple-300">
                              {rouletteNames[seat.id] || "회전중"}
                            </span>
                            <span className="text-[10px] text-cyan-400 font-bold tracking-widest animate-pulse">STOPPING</span>
                          </div>
                        ) : isSeatStopped && finalStudentName ? (
                          <div className="flex flex-col items-center justify-center p-2">
                            <span className="text-xl sm:text-2xl md:text-2xl font-black text-white font-sans tracking-wide">
                              {finalStudentName}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xl text-slate-700 font-black">?</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Gamified Spin Controller Buttons */}
      <div className="flex flex-col items-center justify-center p-4 bg-slate-950/40 border border-slate-800 rounded-2xl mb-6 relative z-10">
        <AnimatePresence mode="wait">
          {!isSpinning && !isRevealing && savedAssignedSeats.length === 0 ? (
            // State A: Initial Draw start
            <motion.div
              key="stage-init"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center"
            >
              <button
                type="button"
                id="spin-start-trigger-btn"
                onClick={handleStartSpin}
                className="group relative flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 border border-emerald-400 text-white font-extrabold text-base md:text-lg px-10 py-5 rounded-2xl shadow-xl shadow-emerald-950/40 active:scale-95 transition-all cursor-pointer font-sans tracking-wider"
              >
                <Play className="w-5 h-5 fill-current text-white animate-pulse" />
                모둠 자리 뽑기 시작 (SPIN!)
                <div className="absolute -inset-0.5 bg-emerald-400 rounded-2xl blur-md opacity-25 group-hover:opacity-40 transition-all duration-300" />
              </button>
              <p className="text-xs text-slate-400 font-sans mt-3">교실 앞 대형 스크린용 슬롯머신 롤러코스터가 개시됩니다.</p>
            </motion.div>
          ) : isSpinning ? (
            // State B: Roulette spinning
            <motion.div
              key="stage-spinning"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center"
            >
              <button
                type="button"
                id="spin-stop-trigger-btn"
                onClick={handleStopSpin}
                className="group relative flex items-center gap-3 bg-gradient-to-r from-rose-500 to-red-600 border border-rose-400 text-white font-extrabold text-base md:text-lg px-12 py-6 rounded-2xl shadow-2xl shadow-rose-950/60 active:scale-95 transition-all cursor-pointer font-sans tracking-widest animate-bounce"
              >
                <Square className="w-5 h-5 fill-current text-white" />
                정 지 (STOP!)
                <div className="absolute -inset-0.5 bg-rose-500 rounded-2xl blur-md opacity-50 transition-all" />
              </button>
              <p className="text-sm text-rose-400 font-bold font-sans mt-4 tracking-wide animate-pulse">
                🎲 뱅글뱅글 돌아가는 중... 아이들과 한뜻으로 "멈춰!"를 외치며 멈춤 버튼을 누르세요!
              </p>
            </motion.div>
          ) : isRevealing ? (
            // State C: Staggered revealing progress
            <motion.div
              key="stage-revealing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-sm text-center"
            >
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-sans font-bold">
                <span>1열부터 차례대로 멈추는 중...</span>
                <span>{revealProgress}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-700">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-200"
                  style={{ width: `${revealProgress}%` }}
                />
              </div>
              <p className="text-xs text-indigo-300 font-sans mt-2 animate-pulse">과연 어떤 자리에 배치될까요?!</p>
            </motion.div>
          ) : (
            // State D: Complete, ready to go to the results
            <motion.div
              key="stage-complete"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-3"
            >
              <div className="text-emerald-400 font-black text-base tracking-wide flex items-center justify-center gap-1.5 font-sans">
                <Sparkles size={18} className="animate-bounce" />
                모든 자리 추첨 완료! 잠시 후 최종 배치표로 자동 연동됩니다.
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer controls */}
      <div className="flex items-center justify-between mt-4 relative z-10 pt-4 border-t border-slate-800">
        <button
          type="button"
          id="gamified-draw-prev-btn"
          disabled={isSpinning || isRevealing}
          onClick={onPrev}
          className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-slate-400 border border-slate-800 bg-slate-950/50 rounded-lg transition-all ${
            isSpinning || isRevealing ? "opacity-30 cursor-not-allowed" : "hover:bg-slate-900 cursor-pointer"
          } font-sans`}
        >
          <ArrowLeft size={15} />
          이전 단계로 돌아가기
        </button>

        <div className="text-xs text-slate-500 font-sans font-medium">
          교실 대형 TV 칠판용 해상도 맞춤 스케일 상향 적용됨
        </div>
      </div>
    </div>
  );
}
