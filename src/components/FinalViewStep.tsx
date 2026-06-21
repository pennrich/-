import React, { useState } from "react";
import { Seat, Student } from "../types";
import { ArrowLeft, ArrowUp, ArrowDown, RotateCcw, Printer, Eye, HelpCircle, Check, Info, Shuffle } from "lucide-react";

interface FinalViewStepProps {
  rows: number;
  cols: number;
  seats: Seat[];
  students: Student[];
  sessionTitle: string;
  onSwapSeats: (seatIdA: string, seatIdB: string) => void;
  onPrev: () => void; // Reset draw/reshuffle
  onResetAll: () => void;
}

export default function FinalViewStep({ rows, cols, seats, students, sessionTitle, onSwapSeats, onPrev, onResetAll }: FinalViewStepProps) {
  // View orientation:
  // "student" -> Teacher's desk at top, Row 1 (index 0) at top, Row N (index N-1) at bottom.
  // "teacher" -> Teacher's desk at bottom, Row 1 (index 0) at bottom, Row N (index N-1) at top (vertical inverse).
  const [viewOrientation, setViewOrientation] = useState<"student" | "teacher">("student");

  // State to support manual seat swapping
  const [selectedSeatId, setSelectedSeatId] = useState<string | null>(null);

  const getStudentBySeat = (seat: Seat): Student | null => {
    if (!seat.studentId) return null;
    return students.find((s) => s.id === seat.studentId) || null;
  };

  const activeSeats = seats.filter((s) => !s.isDisabled);
  const assignedStudentsCount = activeSeats.filter((s) => s.studentId).length;

  const handleSeatClick = (seat: Seat) => {
    if (seat.isDisabled || !seat.studentId) return;

    if (!selectedSeatId) {
      // First seat selected
      setSelectedSeatId(seat.id);
    } else {
      if (selectedSeatId === seat.id) {
        // Deselect
        setSelectedSeatId(null);
      } else {
        // Run swap
        onSwapSeats(selectedSeatId, seat.id);
        setSelectedSeatId(null);
      }
    }
  };

  // Convert row structures based on orientation:
  const getRenderedRowIndices = (): number[] => {
    const indices = Array.from({ length: rows }).map((_, i) => i);
    if (viewOrientation === "teacher") {
      // Teacher view flips row order visually, so back rows (N-1 index) are at top of drawing
      // and front row (0 index, directly adjacent to teacher desk) is placed at the bottom!
      return indices.reverse();
    }
    return indices;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="final-view-step" className="max-w-7xl mx-auto bg-white border border-slate-100 rounded-2xl p-6 md:p-8 shadow-sm">
      
      {/* Header Info (hidden on print) */}
      <div className="no-print flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-100 text-emerald-700 p-2.5 rounded-xl">
            <Check className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 font-sans">{sessionTitle}</h2>
            <p className="text-xs text-slate-500 font-sans mt-0.5">최종 배치 결과입니다. 두 자리를 선택하여 서로 맞교환하여 조정할 수 있습니다.</p>
          </div>
        </div>

        {/* Action controllers */}
        <div className="flex gap-2 text-xs font-sans">
          <button
            type="button"
            id="print-layout-btn"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-all font-semibold cursor-pointer text-sm"
          >
            <Printer size={15} />
            인쇄 / PDF 저장
          </button>
        </div>
      </div>

      {/* Manual Swap Tutorial Tips (hidden on print) */}
      <div className="no-print bg-blue-50 border border-blue-100 text-blue-800 text-xs rounded-xl p-4 mb-6 flex items-start gap-2.5 font-sans">
        <Info className="w-4.5 h-4.5 shrink-0 mt-0.5 text-blue-600" />
        <div>
          <p className="font-semibold text-blue-900">자리 수동 교환 기능 지원</p>
          <p className="text-blue-700 mt-0.5 leading-relaxed">
            배치 완성 후 미세 조정이 필요한 경우, <strong>서로 교환할 두 명의 자리를 순서대로 클릭</strong>하세요. 자리가 자동으로 서로 맞바뀝니다. (선택 시 황금색 테두리 표시)
          </p>
        </div>
      </div>

      {/* View Orientation Controls (hidden on print) */}
      <div className="no-print flex flex-wrap gap-2 items-center justify-between mb-8 pb-4 border-b border-dashed border-slate-200">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 font-sans">조망 관점 변경:</span>
          
          <button
            type="button"
            id="orientation-student-btn"
            onClick={() => setViewOrientation("student")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs rounded-lg font-bold border transition-all cursor-pointer ${
              viewOrientation === "student"
                ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
            }`}
          >
            <ArrowUp size={13} />
            학생 기준 보기 (교탁 위)
          </button>

          <button
            type="button"
            id="orientation-teacher-btn"
            onClick={() => setViewOrientation("teacher")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs rounded-lg font-bold border transition-all cursor-pointer ${
              viewOrientation === "teacher"
                ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
            }`}
          >
            <ArrowDown size={13} />
            교탁에서 보기 (교탁 아래)
          </button>
        </div>

        {/* Student placement density info badge */}
        <div className="text-[11px] font-semibold text-slate-500 font-sans bg-slate-100 py-1 px-2.5 rounded-md">
          배치 결과: 학생 {assignedStudentsCount}명 / 가용좌석 {activeSeats.length}석 / 미사용 {seats.filter(s => s.isDisabled).length}석
        </div>
      </div>

      {/* Dynamic Title for Printouts */}
      <div className="hidden print:block text-center mb-6">
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 font-sans tracking-tight mb-2">
          {sessionTitle}
        </h1>
        <div className="text-sm font-semibold text-slate-600 font-sans">
          교탁 방향: {viewOrientation === "student" ? "위쪽 (칠판 방향)" : "아래쪽 (칠판 방향)"}
        </div>
      </div>

      {/* RENDERED SEATING CANVAS */}
      <div className="print-card border-2 border-slate-200 rounded-2xl p-4 sm:p-6 bg-slate-50/20 flex flex-col items-center shadow-xs overflow-x-auto">
        
        {/* STUDENT PERSPECTIVE => Teacher Desk is placed on TOP */}
        {viewOrientation === "student" && (
          <div className="w-56 mx-auto bg-slate-800 text-white text-xs sm:text-sm font-bold py-2.5 rounded-xl text-center shadow-md border-2 border-slate-700 mb-8 flex items-center justify-center gap-1.5 font-sans">
            <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse" />
            칠판 & 교탁 (앞쪽)
          </div>
        )}

        <div className="min-w-max flex flex-col items-center justify-center space-y-3 sm:space-y-4">
          {getRenderedRowIndices().map((rIdx) => {
            const rowSeats = seats.filter((s) => s.row === rIdx).sort((a, b) => a.col - b.col);

            return (
              <div key={rIdx} className="flex gap-2 sm:gap-4 items-center justify-center">
                {/* Row Indicator Badge */}
                <span className="w-12 text-right text-xs sm:text-base font-black text-slate-400 font-sans mr-1 select-none whitespace-nowrap">
                  {rIdx + 1}열
                </span>

                {rowSeats.map((seat) => {
                  const student = getStudentBySeat(seat);
                  const isSelected = selectedSeatId === seat.id;
                  
                  // Auto construct "number + name" display for seats
                  const studentIndex = student ? students.findIndex((s) => s.id === student.id) : -1;
                  const displayName = student && studentIndex !== -1 ? `${studentIndex + 1}. ${student.name}` : "";

                  return (
                    <button
                      key={seat.id}
                      id={`seating-result-cell-${seat.row}-${seat.col}`}
                      type="button"
                      disabled={seat.isDisabled}
                      onClick={() => handleSeatClick(seat)}
                      className={`w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 flex flex-col items-center justify-center rounded-xl border-2 transition-all relative select-none ${
                        seat.isDisabled
                          ? "bg-white border-transparent text-transparent shadow-none pointer-events-none opacity-0"
                          : !student
                          ? "bg-slate-100/50 border-slate-200 text-slate-300 border-dashed hover:bg-slate-100"
                          : isSelected
                          ? "bg-amber-100 border-amber-500 text-amber-950 ring-4 ring-amber-400/20 shadow-md scale-105 z-10"
                          : "bg-white border-slate-300 hover:border-blue-500 text-slate-950 shadow-xs hover:scale-102"
                      } ${!seat.isDisabled && student ? "cursor-pointer" : "cursor-default"}`}
                    >
                      {/* Grid location coordinate inside cell */}
                      {!seat.isDisabled && (
                        <span className="absolute top-1 left-1.5 text-[9px] sm:text-xs text-slate-400 font-display font-medium">
                          {seat.row + 1}-{seat.col + 1}
                        </span>
                      )}

                      {/* Display name or empty sign */}
                      {seat.isDisabled ? (
                        null
                      ) : student ? (
                        <div className="flex flex-col items-center justify-center p-1.5">
                          <span className="text-sm sm:text-lg md:text-xl font-extrabold text-slate-900 tracking-wide text-center leading-tight whitespace-pre-wrap">
                            {displayName}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs sm:text-sm text-slate-300 font-bold font-sans">빈자리</span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* TEACHER PERSPECTIVE => Teacher Desk is placed on BOTTOM */}
        {viewOrientation === "teacher" && (
          <div className="w-48 mx-auto bg-slate-800 text-white text-xs font-bold py-3 rounded-2xl text-center shadow-md border-2 border-slate-700 mt-10 flex items-center justify-center gap-1.5 font-sans">
            <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping" />
            교탁 (교사 교단 방향)
          </div>
        )}
      </div>

      {/* Navigation and Reset Footer (hidden on print) */}
      <div className="no-print flex flex-col sm:flex-row items-center justify-between gap-4 mt-12 pt-6 border-t border-slate-100">
        <button
          type="button"
          onClick={onPrev}
          className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-6 py-3 text-base font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all cursor-pointer font-sans"
        >
          <ArrowLeft size={16} />
          이전 단계로 돌아가기
        </button>

        <button
          type="button"
          onClick={onResetAll}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 text-base font-bold bg-rose-600 hover:bg-rose-700 active:scale-98 text-white rounded-xl shadow-md shadow-rose-100 transition-all cursor-pointer font-sans"
        >
          <RotateCcw size={18} />
          설정 단계부터 다시 시작하기
        </button>
      </div>
    </div>
  );
}
