import React, { useState, useEffect } from "react";
import { Student, Seat } from "../types";
import { ArrowLeft, ArrowRight, Users, Trash2, UserPlus, FileText, AlertTriangle, CheckCircle2, Edit2, Check, X } from "lucide-react";

interface StudentInputStepProps {
  students: Student[];
  onUpdateStudents: (students: Student[]) => void;
  seats: Seat[];
  onPrev: () => void;
  onNext: () => void;
}

export default function StudentInputStep({ students, onUpdateStudents, seats, onPrev, onNext }: StudentInputStepProps) {
  // Local input for single student addition
  const [singleName, setSingleName] = useState("");
  // Input for pasting list of students
  const [pasteText, setPasteText] = useState("");
  // Quick presets for testing
  const [showDirectPaste, setShowDirectPaste] = useState(false);

  // Edit states for individual blocks
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editNumber, setEditNumber] = useState("");

  const activeSeatsCount = seats.filter((s) => !s.isDisabled).length;

  // Add standard demo names helper for testing (very helpful for high level demo review!)
  const loadDemoRoster = () => {
    const demoNames = [
      "김도형", "이예은", "박진우", "최지안", "정민서", 
      "강하준", "조수아", "윤서준", "장채원", "임도윤", 
      "한지민", "오주원", "서연우", "신서아", "권우진", 
      "황지아", "송준우", "류하은", "전민재", "고희진", 
      "홍예준", "문소율", "양도현", "손서은", "배건우"
    ];
    const randomizedDemo = demoNames.map((name, idx) => ({
      id: `student-demo-${idx}-${Date.now()}`,
      name,
      isPoorVision: false,
    }));
    onUpdateStudents(randomizedDemo);
  };

  const handleAddSingleStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = singleName.trim();
    if (!cleanName) return;

    if (students.some((s) => s.name === cleanName)) {
      alert("이미 같은 이름을 가진 학생이 등록되어 있습니다.");
      return;
    }

    const newStudent: Student = {
      id: `student-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: cleanName,
      isPoorVision: false,
    };

    onUpdateStudents([...students, newStudent]);
    setSingleName("");
  };

  const handleProcessPasteText = () => {
    if (!pasteText.trim()) return;

    // Split by comma, newline, spaces
    const parts = pasteText.split(/[,\n\t\s]+/).map((s) => s.trim()).filter((s) => s.length > 0);
    const newStudents: Student[] = [...students];

    let dupCount = 0;
    let addedCount = 0;

    parts.forEach((pName) => {
      // Check duplicate
      if (newStudents.some((s) => s.name === pName)) {
        dupCount++;
      } else {
        newStudents.push({
          id: `student-${Date.now()}-${Math.random().toString(36).substr(2, 5)}-${addedCount}`,
          name: pName,
          isPoorVision: false,
        });
        addedCount++;
      }
    });

    onUpdateStudents(newStudents);
    setPasteText("");
    setShowDirectPaste(false);

    if (dupCount > 0) {
      alert(`${addedCount}명의 학생이 추가되었습니다. (중복된 이뤄의 ${dupCount}명 제외)`);
    }
  };

  const handleRemoveStudent = (id: string) => {
    onUpdateStudents(students.filter((s) => s.id !== id));
  };

  const startEditing = (student: Student, index: number) => {
    setEditingId(student.id);
    setEditName(student.name);
    setEditNumber((index + 1).toString());
  };

  const saveEdit = (id: string, originalIndex: number) => {
    const cleanName = editName.trim();
    if (!cleanName) return;

    // Check duplicate except self
    if (students.some((s) => s.id !== id && s.name === cleanName)) {
      alert("이미 같은 이름을 가진 학생이 등록되어 있습니다.");
      return;
    }

    const n = parseInt(editNumber, 10);
    if (isNaN(n) || n < 1 || n > students.length) {
      alert(`유효한 번호(1 ~ ${students.length})를 입력해 주세요.`);
      return;
    }

    const targetIndex = n - 1;
    const updatedStudents = [...students];
    const currentIndex = updatedStudents.findIndex((s) => s.id === id);
    if (currentIndex === -1) return;

    const updatedStudent = {
      ...updatedStudents[currentIndex],
      name: cleanName,
    };

    updatedStudents.splice(currentIndex, 1);
    updatedStudents.splice(targetIndex, 0, updatedStudent);

    onUpdateStudents(updatedStudents);
    setEditingId(null);
  };

  const handleClearAll = () => {
    if (confirm("정말 모든 학생 명단을 삭제하시겠습니까?")) {
      onUpdateStudents([]);
    }
  };

  return (
    <div id="student-input-step" className="max-w-4xl mx-auto bg-white border border-slate-100 rounded-2xl p-6 md:p-8 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 text-blue-700 p-2.5 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 font-sans">학생 이름 등록</h2>
            <p className="text-xs text-slate-500 font-sans mt-0.5">
              자리를 무작위로 배정할 학생들의 전체 명단을 입력해 주세요.
            </p>
          </div>
        </div>

        {/* Demo Data button */}
        {students.length === 0 && (
          <button
            type="button"
            id="load-demo-roster-btn"
            onClick={loadDemoRoster}
            className="text-xs font-semibold px-3 py-1.5 border border-blue-200 text-blue-600 bg-blue-50/50 hover:bg-blue-50 rounded-lg transition-all cursor-pointer"
          >
            샘플 명단(25명) 불러오기
          </button>
        )}
      </div>

      {/* Roster Matching & Warnings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl text-center">
          <div className="text-xs text-slate-400 font-bold font-sans">배치 가능 총 자리 수</div>
          <div className="text-2xl font-bold text-slate-800 font-display mt-1">{activeSeatsCount}석</div>
        </div>

        <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl text-center">
          <div className="text-xs text-slate-400 font-bold font-sans">입력된 우리반 학생 수</div>
          <div className="text-2xl font-bold text-blue-600 font-display mt-1">{students.length}명</div>
        </div>

        <div className="col-span-1 md:col-span-1">
          {students.length > activeSeatsCount ? (
            <div className="h-full bg-rose-50 text-rose-800 border border-rose-100 rounded-xl p-3 flex flex-col justify-center items-center">
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700">
                <AlertTriangle size={15} />
                학생 부족 경고
              </div>
              <p className="text-[10px] text-center mt-1 text-rose-600">
                자리가 {students.length - activeSeatsCount}개 부족합니다. 1단계로 돌아가 가로/세로를 늘리거나 제외된 자리를 줄여주세요.
              </p>
            </div>
          ) : students.length < activeSeatsCount && students.length > 0 ? (
            <div className="h-full bg-amber-50 text-amber-800 border border-amber-100 rounded-xl p-3 flex flex-col justify-center items-center">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700">
                <AlertTriangle size={15} />
                빈자리 생김 안내
              </div>
              <p className="text-[10px] text-center mt-1 text-amber-600">
                좌석이 {activeSeatsCount - students.length}개 남습니다. 뽑기 진행 시 남는 자리는 자동으로 비워집니다.
              </p>
            </div>
          ) : students.length === 0 ? (
            <div className="h-full bg-slate-100 border border-slate-200 rounded-xl p-3 flex flex-col justify-center items-center text-slate-400">
              <div className="text-xs font-bold">대기 중</div>
              <p className="text-[10px] text-center mt-1">학생 명단을 아직 입력하지 않았습니다.</p>
            </div>
          ) : (
            <div className="h-full bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-xl p-3 flex flex-col justify-center items-center">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                <CheckCircle2 size={15} />
                좌석 수 딱 맞음!
              </div>
              <p className="text-[10px] text-center mt-1 text-emerald-600">
                학생 수와 배치 자리 수가 정확히 일치합니다.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left column: Add inputs */}
        <div className="md:col-span-5 space-y-4">
          {/* Form for adding single name */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
            <h3 className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-1">
              <UserPlus size={14} className="text-blue-500" />
              가나다순 개별 등록
            </h3>
            <form onSubmit={handleAddSingleStudent} className="flex gap-2">
              <input
                id="student-name-single-input"
                type="text"
                value={singleName}
                onChange={(e) => setSingleName(e.target.value)}
                placeholder="학생 이뤄 입력 (예: 홍길동)"
                className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans"
              />
              <button
                type="submit"
                id="add-student-single-btn"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg text-xs shrink-0 select-none cursor-pointer"
              >
                추가
              </button>
            </form>
          </div>

          {/* Paste board */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <FileText size={14} className="text-blue-500" />
                일괄 대량 등록 (목록 붙여넣기)
              </h3>
              <button
                type="button"
                id="toggle-paste-pnl-btn"
                onClick={() => setShowDirectPaste(!showDirectPaste)}
                className="text-xs text-blue-600 hover:underline font-semibold"
              >
                {showDirectPaste ? "접기" : "펼치기"}
              </button>
            </div>

            {(showDirectPaste || pasteText.length > 0) && (
              <div className="space-y-3">
                <textarea
                  id="students-bulk-paste-textarea"
                  rows={6}
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  placeholder="예: 김철수 영희 길동이 만수 ... 공백이나 줄바꿈, 쉼표로 구분하여 여러 학생을 한 번에 가져올 수 있습니다."
                  className="w-full text-xs p-3 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 font-sans"
                />
                <button
                  type="button"
                  id="process-paste-students-btn"
                  onClick={handleProcessPasteText}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold p-2 text-xs rounded-lg select-none cursor-pointer"
                >
                  위 학생 명단 한 번에 등록하기
                </button>
              </div>
            )}
            {!showDirectPaste && pasteText.length === 0 && (
              <p className="text-[10px] text-slate-400 leading-relaxed">
                쉼표나 줄바꿈으로 구분하여 성명을 나열하거나, 명렬표에서 복사해와서 붙여넣으세요.
              </p>
            )}
          </div>
        </div>

        {/* Right column: Roster review */}
        <div className="md:col-span-7 bg-slate-50 border border-slate-100 rounded-xl p-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-xs font-bold text-slate-700 flex items-center gap-1 font-sans">
              총 {students.length}명 대기 명단 (연필을 클릭해서 번호와 성명을 수정하세요)
            </h3>
            {students.length > 0 && (
              <button
                type="button"
                id="clear-all-students-btn"
                onClick={handleClearAll}
                className="text-rose-500 hover:bg-rose-50 px-2 py-1 rounded text-[10px] font-bold border border-rose-100 transition-all cursor-pointer"
              >
                전체 비우기
              </button>
            )}
          </div>

          {students.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs font-sans">
              왼쪽 양식을 이용해 학생 명단을 등록해 주세요!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[290px] overflow-y-auto pr-1">
              {students.map((student, idx) => {
                const isEditing = editingId === student.id;
                return (
                  <div
                    key={student.id}
                    className={`flex items-center justify-between bg-white px-2 py-1.5 border rounded-lg shadow-2xs transition-all text-xs font-sans ${
                      isEditing ? "border-blue-400 ring-2 ring-blue-100" : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {isEditing ? (
                      <div className="flex items-center gap-1 w-full">
                        <input
                          type="number"
                          value={editNumber}
                          onChange={(e) => setEditNumber(e.target.value)}
                          className="w-12 text-center border border-slate-300 rounded font-bold px-1 py-0.5 bg-slate-50 text-slate-800"
                          min="1"
                          max={students.length}
                          title="번호 수정"
                        />
                        <span className="text-slate-400">.</span>
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full border border-slate-300 rounded px-1.5 py-0.5 font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="이름"
                        />
                        <button
                          type="button"
                          onClick={() => saveEdit(student.id, idx)}
                          className="text-emerald-600 hover:bg-emerald-50 p-1 rounded transition-colors shrink-0"
                          title="저장"
                        >
                          <Check size={12} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="text-slate-400 hover:bg-slate-100 p-1 rounded transition-colors shrink-0"
                          title="취소"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span 
                          className="font-semibold text-slate-700 truncate cursor-pointer hover:text-blue-600" 
                          onClick={() => startEditing(student, idx)}
                          title="클릭하여 번호 및 이름 수정"
                        >
                          {idx + 1}. {student.name}
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => startEditing(student, idx)}
                            className="text-slate-400 hover:text-blue-600 p-0.5 transition-colors"
                            title="번호 및 이름 수정"
                          >
                            <Edit2 size={11} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveStudent(student.id)}
                            className="text-slate-400 hover:text-rose-600 p-0.5 transition-colors"
                            title="명단에서 삭제"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Footer controls */}
      <div className="flex items-center justify-between mt-8 pt-4 border-t border-slate-100">
        <button
          type="button"
          id="student-input-prev-btn"
          onClick={onPrev}
          className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-lg transition-all cursor-pointer font-sans"
        >
          <ArrowLeft size={16} />
          이전 단계로 돌아가기
        </button>

        <button
          type="button"
          id="student-input-complete-btn"
          disabled={students.length === 0}
          onClick={onNext}
          className={`flex items-center gap-2 font-semibold px-6 py-3 rounded-lg text-sm transition-all text-white ${
            students.length === 0
              ? "bg-slate-300 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-100 active:scale-95 cursor-pointer"
          }`}
        >
          학생 입력 완료
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
