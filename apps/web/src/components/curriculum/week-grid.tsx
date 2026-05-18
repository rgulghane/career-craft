import { CURRICULUM_WEEKS } from "@career-craft/shared";
import { CurriculumWeekCard } from "./week-card";

export function CurriculumWeekGrid() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {CURRICULUM_WEEKS.map((item) => (
        <CurriculumWeekCard key={item.week} item={item} />
      ))}
    </div>
  );
}
