import type { Task, TaskStatus, Track } from "../persistence/schemas";

const columns: Array<{ value: TaskStatus; label: string }> = [
  { value: "backlog", label: "Backlog" }, { value: "today", label: "Today" },
  { value: "in_progress", label: "In progress" }, { value: "review", label: "Review" },
  { value: "done", label: "Done" },
];
interface Props {
  tasks: Task[];
  tracks: Track[];
  onMove: (id: string, status: TaskStatus) => void;
  onEdit: (task: Task) => void;
}
export default function TaskBoard({ tasks, tracks, onMove, onEdit }: Props) {
  return <div className="task-board" aria-label="Task status board">
    {columns.map((column) => <section className="board-column" key={column.value} aria-labelledby={`column-${column.value}`}>
      <h3 id={`column-${column.value}`}>{column.label}</h3>
      {tasks.filter((task) => task.status === column.value).map((task) => <article className="task-card board-card" key={task.id}>
        <h4>{task.title}</h4>
        <p>{tracks.find((track) => track.id === task.trackId)?.title ?? "Unknown track"}</p>
        <label className="move-control">Move to…
          <select aria-label={`Move ${task.title} to status`} value={task.status} onChange={(event) => onMove(task.id, event.target.value as TaskStatus)}>
            {columns.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <button type="button" className="secondary" onClick={() => onEdit(task)}>Edit task</button>
      </article>)}
    </section>)}
  </div>;
}
