import React from "react";
import { Seat } from "../types";
import { ArrowLeft, ArrowRight, Ban, ScreenShare, Info } from "lucide-react";

interface SeatDisableStepProps {
  rows: number;
  cols: number;
  seats: Seat[];
  onToggleSeat: (seatId: string) => void;
  onPrev: () => void;
  onNext: () => void;
}

export default function SeatDisableStep({ rows, cols, seats, onToggleSeat, onPrev, onNext }: SeatDisableStepProps) {
  const disabledCount = seats.filter((s) => s.isDisabled).length;
  const activeCount = seats.length - disabledCount;

  // Let's group seats by row index to display them beautifully.
  const seatsByRow = Array.from({ length: rows }).map((_, rIdx) => {
    return seats.filter((s) => s.row === rIdx).sort((a, b) => a.col - b.col);
  });

  return (
    <div id="seat-disable-step" className="max-w-7xl mx-auto bg-white border border-slate-100 rounded-2xl p-6 md:p-8 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="bg-amber-100 text-amber-700 p-2.5 rounded-xl">
            <Ban className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 font-sans">없는 자리 설정하기</h2>
            <p className="text-xs text-slate-500 font-sans mt-0.5">
              학생이 앉지 않는 빈자리를 클릭하여 선택해 주십시오. (흑색으로 바뀝니다)
            </p>
          </div>
        </div>
        
        {/* Seats Stats Badge */}
        <div className="flex gap-2 text-xs font-medium font-sans">
          <div className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200">
            총 격자 수: <strong className="text-slate-800">{seats.length}</strong>
          </div>
          <div className="bg-blue-50 text-blue-800 px-3 py-1.5 rounded-lg border border-blue-100">
            배치 가능석: <strong className="text-blue-900">{activeCount}</strong>
          </div>
          <div className="bg-rose-50 text-rose-800 px-3 py-1.5 rounded-lg border border-rose-100">
            사용 안 함: <strong className="text-rose-900">{disabledCount}</strong>
          </div>
        </div>
      </div>

      {/* Classroom Map Canvas */}
      <div className="border border-slate-200 rounded-xl p-6 bg-slate-50 relative overflow-x-auto">
        {/* Teacher Desk display */}
        <div className="w-40 mx-auto bg-slate-800 text-slate-200 text-xs font-bold py-2.5 rounded-xl text-center shadow-md border-2 border-slate-700/80 mb-8 flex items-center justify-center gap-1.5 font-sans">
          <ScreenShare size={13} className="text-blue-400" />
          교탁
        </div>

        {/* Seat Grid */}
        <div className="min-w-max flex flex-col items-center justify-center">
          <div className="space-y-3">
            {seatsByRow.map((rowSeats, rIdx) => (
              <div key={rIdx} className="flex gap-3 justify-center items-center">
                {/* Row Indicator Badge */}
                <div className="w-10 text-right text-xs font-bold text-slate-400 font-sans mr-2 select-none">
                  {rIdx + 1}열
                </div>

                {rowSeats.map((seat) => (
                  <button
                    key={seat.id}
                    id={`toggle-seat-btn-${seat.row}-${seat.col}`}
                    type="button"
                    onClick={() => onToggleSeat(seat.id)}
                    className={`w-14 h-14 md:w-16 md:h-16 flex flex-col items-center justify-center rounded-xl font-display text-center relative overflow-hidden transition-all duration-200 select-none cursor-pointer ${
                      seat.isDisabled
                        ? "bg-slate-900 hover:bg-slate-800 border-2 border-slate-950 text-slate-500 shadow-inner"
                        : "bg-white hover:bg-slate-100 border-2 border-slate-200 hover:border-slate-300 text-slate-700 shadow-sm hover:scale-105"
                    }`}
                  >
                    {seat.isDisabled ? (
                      <>
                        <Ban size={16} className="text-rose-500 opacity-80" />
                        <span className="text-[10px] mt-1 text-slate-400 font-sans">제외됨</span>
                      </>
                    ) : (
                      <>
                        <span className="text-xs font-bold text-slate-800">{seat.row + 1}-{seat.col + 1}</span>
                        <span className="text-[10px] mt-0.5 text-blue-600 font-sans font-medium">사용가능</span>
                      </>
                    )}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Nav Buttons */}
      <div className="flex items-center justify-between mt-8 sticky bottom-0 bg-white py-2">
        <button
          type="button"
          id="seat-disable-prev-btn"
          onClick={onPrev}
          className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-lg transition-all cursor-pointer font-sans"
        >
          <ArrowLeft size={16} />
          이전 단계로 돌아가기
        </button>

        <button
          type="button"
          id="seat-disable-complete-btn"
          onClick={onNext}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md shadow-blue-100 active:scale-95 transition-all cursor-pointer font-sans text-sm"
        >
          자리배치도 완성
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
