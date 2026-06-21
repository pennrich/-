import React, { useState, useEffect } from "react";
import { AppStep, Student, Seat } from "./types";
import Header from "./components/Header";
import GridSizeStep from "./components/GridSizeStep";
import SeatDisableStep from "./components/SeatDisableStep";
import StudentInputStep from "./components/StudentInputStep";
import PoorVisionStep from "./components/PoorVisionStep";
import GamifiedDrawStep from "./components/GamifiedDrawStep";
import FinalViewStep from "./components/FinalViewStep";
import { Sparkles, HelpCircle, GraduationCap } from "lucide-react";

export default function App() {
  // -----------------------------------------
  // Core App States with localStorage backups
  // -----------------------------------------
  const [currentStep, setStep] = useState<AppStep>(AppStep.GRID_SIZE);
  const [rows, setRows] = useState<number>(6);
  const [cols, setCols] = useState<number>(6);
  const [students, setStudents] = useState<Student[]>([]);
  const [seats, setSeats] = useState<Seat[]>([]);
  const [sessionTitle, setSessionTitle] = useState<string>("우리반 자리배치도");
  const [avoidGroups, setAvoidGroups] = useState<string[][]>([
    ["", "", ""],
    ["", "", ""],
    ["", "", ""]
  ]);

  // -----------------------------------------
  // Initialization & LocalStorage Load
  // -----------------------------------------
  useEffect(() => {
    try {
      const savedRows = localStorage.getItem("class_seating_rows");
      const savedCols = localStorage.getItem("class_seating_cols");
      const savedStudents = localStorage.getItem("class_seating_students");
      const savedSeats = localStorage.getItem("class_seating_seats");
      const savedStep = localStorage.getItem("class_seating_step");
      const savedTitle = localStorage.getItem("class_seating_title");
      const savedAvoid = localStorage.getItem("class_seating_avoid_groups");

      if (savedRows && savedCols) {
        setRows(parseInt(savedRows));
        setCols(parseInt(savedCols));
      }

      if (savedStudents) {
        setStudents(JSON.parse(savedStudents));
      }

      if (savedTitle) {
        setSessionTitle(savedTitle);
      }

      if (savedAvoid) {
        setAvoidGroups(JSON.parse(savedAvoid));
      }

      if (savedSeats) {
        setSeats(JSON.parse(savedSeats));
      } else {
        // Fallback default seats initialization
        const initialRows = savedRows ? parseInt(savedRows) : 6;
        const initialCols = savedCols ? parseInt(savedCols) : 6;
        setSeats(generateInitialSeats(initialRows, initialCols));
      }

      if (savedStep) {
        setStep(parseInt(savedStep) as AppStep);
      }
    } catch (e) {
      console.error("Localstorage state load error:", e);
    }
  }, []);

  // -----------------------------------------
  // Sync state changes to LocalStorage
  // -----------------------------------------
  useEffect(() => {
    localStorage.setItem("class_seating_rows", rows.toString());
    localStorage.setItem("class_seating_cols", cols.toString());
  }, [rows, cols]);

  useEffect(() => {
    localStorage.setItem("class_seating_students", JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem("class_seating_seats", JSON.stringify(seats));
  }, [seats]);

  useEffect(() => {
    localStorage.setItem("class_seating_step", currentStep.toString());
  }, [currentStep]);

  useEffect(() => {
    localStorage.setItem("class_seating_avoid_groups", JSON.stringify(avoidGroups));
  }, [avoidGroups]);

  useEffect(() => {
    localStorage.setItem("class_seating_title", sessionTitle);
  }, [sessionTitle]);

  // -----------------------------------------
  // Helper Methods
  // -----------------------------------------
  const generateInitialSeats = (newRows: number, newCols: number): Seat[] => {
    const initialSeats: Seat[] = [];
    for (let r = 0; r < newRows; r++) {
      for (let c = 0; c < newCols; c++) {
        initialSeats.push({
          id: `seat-${r}-${c}`,
          row: r,
          col: c,
          isDisabled: false,
          studentId: null,
        });
      }
    }
    return initialSeats;
  };

  const handleGridSizeChange = (newRows: number, newCols: number) => {
    setRows(newRows);
    setCols(newCols);
    setSeats(generateInitialSeats(newRows, newCols));
  };

  const handleToggleSeatDisabledState = (seatId: string) => {
    setSeats((prevSeats) =>
      prevSeats.map((seat) =>
        seat.id === seatId ? { ...seat, isDisabled: !seat.isDisabled, studentId: null } : seat
      )
    );
  };

  const handleUpdateStudentsList = (updatedStudents: Student[]) => {
    setStudents(updatedStudents);
  };

  const handleTogglePoorVision = (studentId: string) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, isPoorVision: !s.isPoorVision } : s))
    );
  };

  const handleGamifiedDrawComplete = (assignedSeats: Seat[]) => {
    setSeats(assignedSeats);
    setStep(AppStep.FINAL_VIEW);
  };

  const handleSwapSeats = (seatIdA: string, seatIdB: string) => {
    setSeats((prevSeats) => {
      const updated = [...prevSeats];
      const idxA = updated.findIndex((s) => s.id === seatIdA);
      const idxB = updated.findIndex((s) => s.id === seatIdB);
      if (idxA !== -1 && idxB !== -1) {
        const studentA = updated[idxA].studentId;
        updated[idxA].studentId = updated[idxB].studentId;
        updated[idxB].studentId = studentA;
      }
      return updated;
    });
  };

  const handleResetAllSteps = () => {
    if (confirm("정말 학급 자리배치를 새로 시작하시겠습니까? 학생 명단과 자리 설정이 모두 한꺼번에 지워집니다.")) {
      setRows(6);
      setCols(6);
      setStudents([]);
      setSessionTitle("우리반 자리배치도");
      setAvoidGroups([
        ["", "", ""],
        ["", "", ""],
        ["", "", ""]
      ]);
      setSeats(generateInitialSeats(6, 6));
      setStep(AppStep.GRID_SIZE);
      localStorage.clear();
    }
  };

  // Check if step navigation is allowed dynamically (Wizard step preservation check)
  const canNavigateTo = (targetStep: AppStep): boolean => {
    const activeSeatsCount = seats.filter((s) => !s.isDisabled).length;

    switch (targetStep) {
      case AppStep.GRID_SIZE:
        return true;
      case AppStep.SEAT_DISABLE:
        return true;
      case AppStep.STUDENT_INPUT:
        return true;
      case AppStep.POOR_VISION:
        return students.length > 0;
      case AppStep.GAMIFIED_DRAW:
        return students.length > 0 && students.length <= activeSeatsCount;
      case AppStep.FINAL_VIEW:
        return (
          students.length > 0 &&
          seats.some((s) => s.studentId !== null)
        );
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      
      {/* Visual Header containing the multi-stepper indicator */}
      <Header
        currentStep={currentStep}
        setStep={setStep}
        onReset={handleResetAllSteps}
        canNavigateTo={canNavigateTo}
      />

      {/* Main Container Stage */}
      <main id="app-main-content-window" className="flex-grow py-8 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          {currentStep === AppStep.GRID_SIZE && (
            <GridSizeStep
              rows={rows}
              cols={cols}
              sessionTitle={sessionTitle}
              onChangeSessionTitle={setSessionTitle}
              onChangeSize={handleGridSizeChange}
              onNext={() => setStep(AppStep.SEAT_DISABLE)}
            />
          )}

          {currentStep === AppStep.SEAT_DISABLE && (
            <SeatDisableStep
              rows={rows}
              cols={cols}
              seats={seats}
              onToggleSeat={handleToggleSeatDisabledState}
              onPrev={() => setStep(AppStep.GRID_SIZE)}
              onNext={() => setStep(AppStep.STUDENT_INPUT)}
            />
          )}

          {currentStep === AppStep.STUDENT_INPUT && (
            <StudentInputStep
              students={students}
              onUpdateStudents={handleUpdateStudentsList}
              seats={seats}
              onPrev={() => setStep(AppStep.SEAT_DISABLE)}
              onNext={() => setStep(AppStep.POOR_VISION)}
            />
          )}

          {currentStep === AppStep.POOR_VISION && (
            <PoorVisionStep
              students={students}
              onTogglePoorVision={handleTogglePoorVision}
              seats={seats}
              onPrev={() => setStep(AppStep.STUDENT_INPUT)}
              onNext={() => setStep(AppStep.GAMIFIED_DRAW)}
              avoidGroups={avoidGroups}
              onUpdateAvoidGroups={setAvoidGroups}
            />
          )}

          {currentStep === AppStep.GAMIFIED_DRAW && (
            <GamifiedDrawStep
              rows={rows}
              cols={cols}
              students={students}
              seats={seats}
              avoidGroups={avoidGroups}
              onComplete={handleGamifiedDrawComplete}
              onPrev={() => setStep(AppStep.POOR_VISION)}
            />
          )}

          {currentStep === AppStep.FINAL_VIEW && (
            <FinalViewStep
              rows={rows}
              cols={cols}
              seats={seats}
              students={students}
              sessionTitle={sessionTitle}
              onSwapSeats={handleSwapSeats}
              onPrev={() => setStep(AppStep.GAMIFIED_DRAW)}
              onResetAll={handleResetAllSteps}
            />
          )}
        </div>
      </main>

      {/* Footer Design Accents (hidden on print) */}
      <footer className="no-print bg-white border-t border-slate-100 py-6 text-center text-xs text-slate-400 font-sans mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 font-medium">
            <GraduationCap className="h-4.5 w-4.5 text-blue-500" />
            <span>아무도 영문을 알리 없는 영문중 교실 자리배치기 (교사 전용)</span>
          </div>
          <div className="text-slate-400">
            © 2026 Class Seating Arranger • All rights reserved
          </div>
        </div>
      </footer>
    </div>
  );
}
