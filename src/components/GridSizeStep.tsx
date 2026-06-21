import React, { useState } from "react";
import { ArrowRight, Grid3X3, ScreenShare } from "lucide-react";

interface GridSizeStepProps {
  rows: number;
  cols: number;
  sessionTitle: string;
  onChangeSessionTitle: (title: string) => void;
  onChangeSize: (rows: number, cols: number) => void;
  onNext: () => void;
}

export default function GridSizeStep({ rows, cols, sessionTitle, onChangeSessionTitle, onChangeSize, onNext }: GridSizeStepProps) {
  const [internalRows, setInternalRows] = useState(rows);
  const [internalCols, setInternalCols] = useState(cols);

  const handleRowChange = (val: number) => {
    const nextVal = Math.min(10, Math.max(1, val));
    setInternalRows(nextVal);
    onChangeSize(nextVal, internalCols);
  };

  const handleColChange = (val: number) => {
    const nextVal = Math.min(10, Math.max(1, val));
    setInternalCols(nextVal);
    onChangeSize(internalRows, nextVal);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <div id="grid-size-step" className="max-w-3xl mx-auto bg-white border border-slate-100 rounded-2xl p-6 md:p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-100 text-blue-700 p-2.5 rounded-xl">
          <Grid3X3 className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800 font-sans">자리 배치도 기본 크기 설정</h2>
          <p className="text-xs text-slate-500 font-sans mt-0.5">우리 교실의 가로(열) 줄 수와 세로(행) 줄 수를 설정해주세요.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Layout Title Setting (Korean: 작업 명칭 설정) */}
        <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-105">
          <label className="block text-sm font-bold text-slate-800 mb-1.5 font-sans" htmlFor="session-title-input">
            배치 작업 명칭 (예: 1-1반 자리배치도)
          </label>
          <input
            id="session-title-input"
            type="text"
            value={sessionTitle}
            onChange={(e) => onChangeSessionTitle(e.target.value)}
            placeholder="예시) 1학년 1반 자리배치도"
            className="w-full text-base px-4 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans font-bold text-slate-800"
            required
          />
          <p className="text-[11px] text-slate-500 mt-1.5">입력한 명칭은 최종 배치 화면의 상단과 인쇄 시 제목에 크게 표시됩니다.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Columns Input */}
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
            <label className="block text-sm font-semibold text-slate-700 mb-2 font-sans" htmlFor="cols-input">
              가로 줄 수 (세로 기둥, 열)
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                id="col-dec-btn"
                onClick={() => handleColChange(internalCols - 1)}
                className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-lg font-bold text-slate-600 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
              >
                -
              </button>
              <input
                id="cols-input"
                type="number"
                min="1"
                max="10"
                value={internalCols}
                onChange={(e) => handleColChange(parseInt(e.target.value) || 1)}
                className="w-full text-center py-2 text-lg font-semibold bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-display"
              />
              <button
                type="button"
                id="col-inc-btn"
                onClick={() => handleColChange(internalCols + 1)}
                className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-lg font-bold text-slate-600 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
              >
                +
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-2 font-sans text-center">보통 4 ~ 8개의 가로 줄을 사용합니다.</p>
          </div>

          {/* Rows Input */}
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
            <label className="block text-sm font-semibold text-slate-700 mb-2 font-sans" htmlFor="rows-input">
              세로 줄 수 (가로 한 줄, 행)
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                id="row-dec-btn"
                onClick={() => handleRowChange(internalRows - 1)}
                className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-lg font-bold text-slate-600 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
              >
                -
              </button>
              <input
                id="rows-input"
                type="number"
                min="1"
                max="10"
                value={internalRows}
                onChange={(e) => handleRowChange(parseInt(e.target.value) || 1)}
                className="w-full text-center py-2 text-lg font-semibold bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-display"
              />
              <button
                type="button"
                id="row-inc-btn"
                onClick={() => handleRowChange(internalRows + 1)}
                className="w-10 h-10 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-lg font-bold text-slate-600 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
              >
                +
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-2 font-sans text-center">보통 4 ~ 7개의 세로 줄을 사용합니다.</p>
          </div>
        </div>

        {/* Live Grid Preview */}
        <div className="border border-slate-100 rounded-xl p-5 bg-slate-50/50">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest text-center mb-4">구조 미리보기</div>
          
          {/* Teacher Desk display */}
          <div className="w-32 mx-auto bg-slate-200 text-slate-600 text-xs font-bold py-2 rounded-lg text-center shadow-xs border border-slate-300 mb-6 flex items-center justify-center gap-1.5 font-sans">
            <ScreenShare size={12} />
            교탁 (칠판 방향)
          </div>

          <div
            className="grid gap-2 max-w-md mx-auto"
            style={{
              gridTemplateColumns: `repeat(${internalCols}, minmax(0, 1fr))`,
            }}
          >
            {Array.from({ length: internalRows }).map((_, rIndex) =>
              Array.from({ length: internalCols }).map((_, cIndex) => (
                <div
                  key={`${rIndex}-${cIndex}`}
                  className="aspect-square bg-white border border-slate-200 flex items-center justify-center rounded-lg shadow-2xs font-display text-slate-400 text-xs font-medium"
                >
                  {rIndex + 1}-{cIndex + 1}
                </div>
              ))
            )}
          </div>
          <div className="text-center mt-4 text-xs font-semibold text-slate-500 font-sans">
            총 {internalRows * internalCols}석의 도면이 임시 생성되었습니다. 다음 단계에서 안 쓰는 자리를 제거할 수 있습니다.
          </div>
        </div>

        {/* Next Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            id="grid-size-next-btn"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md shadow-blue-100 active:scale-95 transition-all cursor-pointer font-sans text-sm"
          >
            다음 단계: 없는 자리 설정하기
            <ArrowRight size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}
