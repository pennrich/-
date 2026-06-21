import React from "react";
import { Student, Seat } from "../types";
import { ArrowLeft, ArrowRight, Eye, EyeOff, AlertTriangle, CheckCircle2, ShieldAlert, Users } from "lucide-react";

interface PoorVisionStepProps {
  students: Student[];
  onTogglePoorVision: (studentId: string) => void;
  seats: Seat[];
  onPrev: () => void;
  onNext: () => void;
  avoidGroups: string[][];
  onUpdateAvoidGroups: (groups: string[][]) => void;
}

export default function PoorVisionStep({ 
  students, 
  onTogglePoorVision, 
  seats, 
  onPrev, 
  onNext, 
  avoidGroups, 
  onUpdateAvoidGroups 
}: PoorVisionStepProps) {
  const poorVisionStudents = students.filter((s) => s.isPoorVision);
  const poorVisionCount = poorVisionStudents.length;

  // Let's count how many active (non-disabled) seats are in rows 1 and 2 (indices 0 and 1)
  const activeFrontSeats = seats.filter((s) => !s.isDisabled && s.row < 2).length;

  const isOverflow = poorVisionCount > activeFrontSeats;

  return (
    <div id="poor-vision-step" className="max-w-7xl mx-auto bg-white border border-slate-100 rounded-2xl p-6 md:p-8 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 text-blue-700 p-2.5 rounded-xl">
            <Eye className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 font-sans">배려 학생 및 격리 요구 설정</h2>
            <p className="text-xs text-slate-500 font-sans mt-0.5">
              교실 배치를 완성하기 전 특이 요구나 앞자리 배려 학생 또는 서로 인접하면 안 되는 학생들을 사전에 정해 줍니다.
            </p>
          </div>
        </div>

        {/* Info stats */}
        <div className="flex gap-2 text-xs font-semibold font-display">
          <div className="bg-slate-50 text-slate-600 border border-slate-200 px-3 py-1.5 rounded-lg">
            1-2열 가용석: <span className="text-slate-800 font-bold">{activeFrontSeats}개</span>
          </div>
          <div className={`px-3 py-1.5 rounded-lg border-2 ${
            isOverflow 
              ? "bg-rose-50 text-rose-700 border-rose-200 animate-pulse" 
              : poorVisionCount > 0 
              ? "bg-teal-50 text-teal-800 border-teal-200" 
              : "bg-slate-50 text-slate-400 border-slate-200"
          }`}>
            배려 지정: <span className="font-bold">{poorVisionCount}명</span>
          </div>
        </div>
      </div>

      {/* Overflow Warning Panel - only shown when overflow occurs */}
      {isOverflow && (
        <div className="bg-rose-50 text-rose-800 border border-rose-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
          <div className="text-xs font-sans">
            <h4 className="font-bold text-rose-700">시력 보호 학생 정원 초과 주의</h4>
            <p className="mt-1 leading-relaxed text-rose-600">
              현재 1~2열의 비어 있지 않은 정상 좌석 수는 <strong>{activeFrontSeats}석</strong>인데, 지정된 우선 학생은 <strong>{poorVisionCount}명</strong>입니다. 
              초과된 {poorVisionCount - activeFrontSeats}명의 학생은 3열 이후에 무작위 배정될 수 있으므로 지정 인원을 줄이거나 1,2열 중 미사용 좌석을 다시 복구해 주십시오.
            </p>
          </div>
        </div>
      )}

      {/* [Shaded Area 1] Front Row Seating priority specification block */}
      <div className="bg-slate-50/80 border border-slate-200/60 rounded-2xl p-5 mb-6 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <Eye className="w-5 h-5 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-800 font-sans">
            기능 1. 앞자리 시력 보호 및 배려 학생 지정 (1~2열 우선 배정)
          </h3>
        </div>
        <p className="text-xs text-slate-500 font-sans mb-4 leading-relaxed">
          칠판에 가까운 앞자리 배정이 특별히 필요하거나 눈이 어두운 학생을 아래 명단에서 선택해 주세요. 
          선택된 학생들은 <span className="font-semibold text-blue-600">최대한 1~2열의 가까운 자리에 자동으로 먼저 할당</span>됩니다.
        </p>
        
        {/* Compact Grid List of students to click */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2 max-h-[350px] overflow-y-auto bg-white p-4 rounded-xl border border-slate-200 shadow-inner">
          {students.map((student, idx) => (
            <button
              key={student.id}
              id={`toggle-poor-vision-btn-${student.id}`}
              type="button"
              onClick={() => onTogglePoorVision(student.id)}
              className={`flex items-center justify-between px-3 py-2 rounded-lg border text-xs transition-all cursor-pointer select-none gap-2 ${
                student.isPoorVision
                  ? "bg-blue-600 border-blue-700 text-white font-extrabold shadow-sm scale-102"
                  : "bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-100"
              }`}
            >
              <span className="truncate font-sans tracking-tight">
                {idx + 1}. {student.name}
              </span>
              
              {student.isPoorVision ? (
                <Eye size={12} className="shrink-0 text-blue-100" />
              ) : (
                <EyeOff size={11} className="shrink-0 text-slate-300" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* [Shaded Area 2] Avoid adjacency student selection */}
      <div className="bg-slate-50/80 border border-slate-200/60 rounded-2xl p-5 mb-6 shadow-xs">
        <div className="flex items-center gap-2 mb-2">
          <ShieldAlert className="w-5 h-5 text-amber-500" />
          <h3 className="text-sm font-bold text-slate-800 font-sans">
            기능 2. 서로 인접하지 않게 배치할 학생 지정 (분리 지정)
          </h3>
        </div>
        <p className="text-xs text-slate-500 font-sans mb-4 leading-relaxed">
          지정된 그룹 안의 학생들은 서로 양옆, 앞뒤, 혹은 대각선으로 바로 이웃하여 앉지 않도록 자동으로 무작위 배정 시 우회 조정됩니다. <br />
          각 그룹마다 최대 3명까지 지정할 수 있으며, 2명만 입력하는 경우 두 명만 분리 배치됩니다.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[0, 1, 2].map((groupIndex) => {
            const currentGroup = avoidGroups[groupIndex] || ["", "", ""];
            return (
              <div
                key={groupIndex}
                className="bg-white p-4 border border-slate-200 rounded-xl shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-xs font-bold text-slate-700 font-sans flex items-center gap-1.5">
                    <Users size={12} className="text-slate-400" />
                    분리 지정 그룹 {groupIndex + 1}
                  </span>
                  <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-md font-bold font-sans">
                    인접 금지
                  </span>
                </div>

                <div className="space-y-2">
                  {[0, 1, 2].map((slotIndex) => {
                    const selectedValue = currentGroup[slotIndex] || "";
                    return (
                      <div key={slotIndex} className="flex items-center gap-1.5 text-xs">
                        <span className="w-10 text-slate-400 font-bold font-display text-[10px] text-right">
                          학생 {slotIndex + 1}:
                        </span>
                        <select
                          className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg py-1 px-2 text-xs font-sans text-slate-700 focus:ring-1 focus:ring-blue-500 focus:outline-none focus:bg-white transition-colors"
                          value={selectedValue}
                          onChange={(e) => {
                            const val = e.target.value;
                            const newGroup = [...currentGroup];
                            newGroup[slotIndex] = val;
                            const newAvoidGroups = [...avoidGroups];
                            newAvoidGroups[groupIndex] = newGroup;
                            onUpdateAvoidGroups(newAvoidGroups);
                          }}
                        >
                          <option value="">-- 학생 선택 안 함 --</option>
                          {students.map((student, idx) => {
                            return (
                              <option key={student.id} value={student.id}>
                                {idx + 1}. {student.name}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Nav Controls */}
      <div className="flex items-center justify-between mt-8 sticky bottom-0 bg-white py-2">
        <button
          type="button"
          id="poor-vision-prev-btn"
          onClick={onPrev}
          className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-lg transition-all cursor-pointer font-sans"
        >
          <ArrowLeft size={16} />
          이전 단계로 돌아가기
        </button>

        <button
          type="button"
          id="poor-vision-complete-btn"
          onClick={onNext}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md shadow-blue-100 active:scale-95 transition-all cursor-pointer font-sans text-sm"
        >
          설정 완료: 자리 추첨하러 가기
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
