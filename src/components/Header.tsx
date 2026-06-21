import React from "react";
import { AppStep } from "../types";
import { Compass, Grid3X3, Users, Eye, HelpCircle, RefreshCw } from "lucide-react";

interface HeaderProps {
  currentStep: AppStep;
  setStep: (step: AppStep) => void;
  onReset: () => void;
  canNavigateTo: (step: AppStep) => boolean;
}

export default function Header({ currentStep, setStep, onReset, canNavigateTo }: HeaderProps) {
  const steps = [
    { value: AppStep.GRID_SIZE, label: "1. 배치도 규격 설정", icon: Grid3X3 },
    { value: AppStep.SEAT_DISABLE, label: "2. 없는 자리 설정하기", icon: Compass },
    { value: AppStep.STUDENT_INPUT, label: "3. 학생 이름 입력", icon: Users },
    { value: AppStep.POOR_VISION, label: "4. 기타 설정", icon: Eye },
    { value: AppStep.GAMIFIED_DRAW, label: "5. 자리 랜덤 뽑기", icon: HelpCircle },
    { value: AppStep.FINAL_VIEW, label: "6. 최종 배치 결과", icon: RefreshCw },
  ];

  return (
    <header id="app-header" className="bg-white border-b border-slate-100 shadow-xs sticky top-0 z-50 py-4 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Title */}
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 text-white p-2.5 rounded-xl shadow-xs">
            <span className="font-bold text-xl font-display tracking-tight leading-none">영문중</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-1000 tracking-tight flex items-center gap-1.5 font-sans">
              교실 자리배치기
              <span className="text-xs bg-slate-100 text-slate-600 font-medium px-2 py-0.5 rounded-full"></span>
            </h1>
            <p className="text-xs text-slate-500 font-sans mt-0.5">아무도 영문을 모르는 영문중 교실 자리배치기</p>
          </div>
        </div>

        {/* Start Over Button */}
        <div className="flex items-center gap-2 self-end md:self-center">
          <button
            id="reset-all-steps-btn"
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 border border-rose-100 rounded-lg transition-all font-medium cursor-pointer"
            title="모든 설정을 초기화하고 처음부터 다시 시작합니다."
          >
            <RefreshCw size={13} />
            다시 시작하기
          </button>
        </div>
      </div>

      {/* Stepper Steps UI */}
      <div className="max-w-7xl mx-auto mt-5">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
          {steps.map((s) => {
            const Icon = s.icon;
            const isActive = currentStep === s.value;
            const isCompleted = currentStep > s.value;
            const canClick = canNavigateTo(s.value);

            return (
              <button
                key={s.value}
                id={`step-nav-btn-${s.value}`}
                onClick={() => canClick && setStep(s.value)}
                disabled={!canClick}
                className={`flex items-center gap-2 p-2.5 rounded-lg text-left transition-all text-xs border ${
                  isActive
                    ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100 font-semibold"
                    : isCompleted
                    ? "bg-emerald-50 text-emerald-800 border-emerald-100 hover:bg-emerald-100 font-medium cursor-pointer"
                    : canClick
                    ? "bg-slate-50 text-slate-700 border-slate-100 hover:bg-slate-100 hover:border-slate-300 font-medium cursor-pointer"
                    : "bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed"
                }`}
              >
                <div
                  className={`p-1 rounded-md ${
                    isActive ? "bg-white/20 text-white" : isCompleted ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"
                  }`}
                >
                  <Icon size={14} />
                </div>
                <span className="truncate">{s.label}</span>
              </button>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
          <div
            className="bg-blue-600 h-full transition-all duration-500 ease-out"
            style={{ width: `${(currentStep / 6) * 100}%` }}
          />
        </div>
      </div>
    </header>
  );
}
