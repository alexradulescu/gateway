import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Button,
  Card,
  Input,
  Modal,
  TextArea,
  useMediaQuery,
  useOverlayState,
} from "@heroui/react";
import { useMutation, useQuery } from "convex/react";
import {
  CalendarDays,
  Check,
  ChevronDown,
  Circle,
  GripVertical,
  Menu,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { Component, FormEvent, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { createGlobalStyle, styled } from "@alex.radulescu/styled-static";
import { api } from "../../../convex/_generated/api";
import type { Doc, Id } from "../../../convex/_generated/dataModel";

type Task = Doc<"tasks">;
type Group = Doc<"task_groups">;
type Priority = Task["priority"];
type View =
  | { type: "group"; groupId: Id<"task_groups"> }
  | { type: "today" }
  | { type: "upcoming" }
  | { type: "done" };

const priorities: Priority[] = ["P1", "P2", "P3", "P4"];

const GlobalStyle = createGlobalStyle`
  :root {
    color: #202124;
    background: #f7f8fb;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    font-synthesis: none;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
  }

  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    min-width: 320px;
    min-height: 100vh;
    background:
      linear-gradient(90deg, rgba(32, 33, 36, 0.04) 1px, transparent 1px) 0 0 / 56px 56px,
      #f7f8fb;
  }

  button,
  input,
  textarea,
  select {
    font: inherit;
  }
`;

const Shell = styled.main`
  display: grid;
  grid-template-columns: 292px minmax(0, 1fr);
  min-height: 100vh;

  @media (max-width: 860px) {
    display: block;
  }
`;

const Sidebar = styled.aside`
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-height: 100vh;
  padding: 24px 16px;
  border-right: 1px solid #dfe3ec;
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(18px);

  @media (max-width: 860px) {
    display: none;
  }
`;

const MobileHeader = styled.header`
  display: none;

  @media (max-width: 860px) {
    position: sticky;
    top: 0;
    z-index: 10;
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 64px;
    padding: 10px 14px;
    border-bottom: 1px solid #dfe3ec;
    background: rgba(255, 255, 255, 0.92);
    backdrop-filter: blur(18px);
  }
`;

const Brand = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: inherit;
  font-weight: 800;
  text-decoration: none;
`;

const Content = styled.section`
  min-width: 0;
  padding: 32px clamp(18px, 4vw, 56px) 56px;

  @media (max-width: 860px) {
    padding: 22px 14px 44px;
  }
`;

const Topbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 28px;
`;

const TitleBlock = styled.div`
  min-width: 0;
`;

const Kicker = styled.p`
  margin: 0 0 4px;
  color: #6b7280;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
`;

const Title = styled.h1`
  margin: 0;
  font-size: clamp(2rem, 4.5vw, 4rem);
  line-height: 0.98;
  letter-spacing: 0;
`;

const NavSection = styled.div`
  display: grid;
  gap: 8px;
`;

const SectionLabel = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
  color: #6b7280;
  font-size: 0.78rem;
  font-weight: 800;
  text-transform: uppercase;
`;

const NavButton = styled.button`
  display: grid;
  grid-template-columns: 24px minmax(0, 1fr) auto;
  align-items: center;
  gap: 10px;
  width: 100%;
  min-height: 42px;
  padding: 0 10px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #31343b;
  cursor: pointer;
  text-align: left;

  &:hover {
    background: #f1f3f7;
  }

  &[data-active="true"] {
    background: #ebefff;
    color: #3143a5;
  }

  &[data-active="true"]:hover {
    background: #ebefff;
  }
`;

const NavText = styled.span`
  min-width: 0;
  overflow: hidden;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Count = styled.span`
  color: #7c8596;
  font-size: 0.84rem;
  font-weight: 800;
`;

const GroupForm = styled.form`
  display: grid;
  grid-template-columns: 1fr 38px;
  gap: 8px;
  padding: 0 8px;
`;

const NativeInput = styled.input`
  min-width: 0;
  height: 38px;
  padding: 0 12px;
  border: 1px solid #d4d9e5;
  border-radius: 8px;
  background: #fff;
  color: #202124;
`;

const TaskListShell = styled.div`
  display: grid;
  gap: 26px;
`;

const ListSection = styled.section`
  display: grid;
  gap: 10px;
`;

const ListHeading = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #6b7280;
  font-size: 0.82rem;
  font-weight: 900;
  text-transform: uppercase;
`;

const TaskList = styled.div`
  display: grid;
  gap: 8px;
`;

const EmptyState = styled.div`
  padding: 18px;
  border: 1px dashed #cfd5e2;
  border-radius: 8px;
  color: #717b8d;
  background: rgba(255, 255, 255, 0.72);
`;

const StatePanel = styled.section`
  display: grid;
  gap: 14px;
  max-width: 720px;
  padding: 22px;
  border: 1px solid #dfe3ec;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 18px 48px rgba(20, 24, 33, 0.08);
`;

const StateTitle = styled.h2`
  margin: 0;
  color: #202124;
  font-size: 1.2rem;
  letter-spacing: 0;
`;

const StateText = styled.p`
  margin: 0;
  color: #596172;
  line-height: 1.55;
`;

const ErrorText = styled.pre`
  max-height: 180px;
  margin: 0;
  overflow: auto;
  padding: 12px;
  border: 1px solid #ffd3d3;
  border-radius: 8px;
  background: #fff5f5;
  color: #8a1f1f;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.78rem;
  white-space: pre-wrap;
`;

const TaskRowRoot = styled.div`
  display: grid;
  grid-template-columns: 32px 32px minmax(0, 1fr) auto auto 34px;
  align-items: center;
  gap: 8px;
  min-height: 54px;
  padding: 8px 10px;
  border: 1px solid #e0e4ed;
  border-radius: 8px;
  background: #fff;
  color: #202124;
  box-shadow: 0 1px 2px rgba(20, 24, 33, 0.05);

  &[data-done="true"] {
    background: #f4f5f8;
    color: #7c8596;
    opacity: 0.78;
  }

  @media (max-width: 620px) {
    grid-template-columns: 28px 30px minmax(0, 1fr) auto 34px;
    align-items: start;
  }
`;

const IconOnly = styled.button`
  display: inline-grid;
  width: 32px;
  height: 32px;
  place-items: center;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: #6b7280;
  cursor: pointer;

  &:hover {
    background: #eef1f7;
    color: #202124;
  }
`;

const CheckButton = styled(IconOnly)`
  border: 1px solid #cfd5e2;
  color: #6b7280;
  background: #fff;

  &[data-done="true"] {
    border-color: #5b6ee1;
    background: #5b6ee1;
    color: #fff;
  }
`;

const InlineTitle = styled.input`
  min-width: 0;
  width: 100%;
  height: 34px;
  padding: 0 6px;
  border: 1px solid transparent;
  border-radius: 6px;
  background: transparent;
  color: inherit;
  font-weight: 700;

  &[data-done="true"] {
    text-decoration: line-through;
  }

  &:focus {
    border-color: #b8c2ff;
    outline: 0;
    background: #fff;
  }
`;

const MetaPill = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  min-height: 26px;
  padding: 0 8px;
  border-radius: 999px;
  background: #eef2f7;
  color: #596172;
  font-size: 0.78rem;
  font-weight: 900;

  &[data-priority="P1"] {
    background: #ffe8e8;
    color: #b42318;
  }

  &[data-priority="P2"] {
    background: #fff0cf;
    color: #9a5b00;
  }

  &[data-priority="P3"] {
    background: #eaf2ff;
    color: #2754a5;
  }

  @media (max-width: 620px) {
    display: none;
  }
`;

const DueDate = styled(MetaPill)`
  min-width: 74px;
  color: #596172;
  background: #eef2f7;

  @media (max-width: 620px) {
    display: none;
  }
`;

const MobileMeta = styled.div`
  display: none;

  @media (max-width: 620px) {
    display: flex;
    gap: 6px;
    margin-top: 2px;
  }
`;

const Toast = styled.output`
  position: fixed;
  right: 18px;
  bottom: 18px;
  z-index: 80;
  max-width: min(420px, calc(100vw - 36px));
  padding: 12px 14px;
  border: 1px solid #cfd5e2;
  border-radius: 8px;
  background: #202124;
  color: #fff;
  font-weight: 700;
  box-shadow: 0 14px 35px rgba(20, 24, 33, 0.2);
`;

const FormGrid = styled.div`
  display: grid;
  gap: 16px;
`;

const Field = styled.label`
  display: grid;
  gap: 7px;
  color: #4b5563;
  font-size: 0.84rem;
  font-weight: 800;
`;

const NativeSelect = styled.select`
  min-width: 0;
  height: 40px;
  padding: 0 12px;
  border: 1px solid #d4d9e5;
  border-radius: 8px;
  background: #fff;
  color: #202124;
`;

const PriorityGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
`;

const DrawerPanel = styled.div`
  display: grid;
  gap: 20px;
  width: min(360px, calc(100vw - 32px));
`;

const DragButton = styled(IconOnly)`
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
`;

function todayString() {
  const date = new Date();
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return offsetDate.toISOString().slice(0, 10);
}

function formatDueDate(dueDate?: string) {
  if (!dueDate) return "No date";
  if (dueDate === todayString()) return "Today";
  return dueDate.slice(5);
}

function isUpcoming(task: Task) {
  return !!task.dueDate && task.dueDate > todayString() && !task.done;
}

function taskCount(tasks: Task[], groupId?: Id<"task_groups">) {
  return tasks.filter((task) => !task.done && (!groupId || task.groupId === groupId)).length;
}

function sortByOrder<T extends { order: number; createdAt: number }>(items: T[]) {
  return [...items].sort((a, b) => a.order - b.order || a.createdAt - b.createdAt);
}

function useAutosaveToast() {
  const [toast, setToast] = useState<string | null>(null);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  }

  return { toast, showToast };
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return String(error);
}

function AppStateShell({
  action,
  message,
  title,
}: {
  action?: ReactNode;
  message: ReactNode;
  title: string;
}) {
  return (
    <Shell>
      <GlobalStyle />
      <Sidebar>
        <Brand href="/">Tasks</Brand>
      </Sidebar>
      <MobileHeader>
        <Brand href="/">Tasks</Brand>
      </MobileHeader>
      <Content>
        <Topbar>
          <TitleBlock>
            <Kicker>Tasks</Kicker>
            <Title>Tasks</Title>
          </TitleBlock>
        </Topbar>
        <StatePanel>
          <StateTitle>{title}</StateTitle>
          <StateText>{message}</StateText>
          {action}
        </StatePanel>
      </Content>
    </Shell>
  );
}

export class AppErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <AppStateShell
          title="Tasks could not load"
          message="The app hit a runtime error while loading task data. This usually means the Convex backend for this preview is not deployed or the browser cannot reach it."
          action={<ErrorText>{getErrorMessage(this.state.error)}</ErrorText>}
        />
      );
    }

    return this.props.children;
  }
}

function SortableGroup({
  active,
  count,
  group,
  onEdit,
  onSelect,
}: {
  active: boolean;
  count: number;
  group: Group;
  onEdit: () => void;
  onSelect: () => void;
}) {
  const sortable = useSortable({ id: group._id });
  const style = {
    transform: CSS.Transform.toString(sortable.transform),
    transition: sortable.transition,
  };

  return (
    <div ref={sortable.setNodeRef} style={style}>
      <NavButton data-active={active ? "true" : "false"} onClick={onSelect}>
        <DragButton
          aria-label={`Reorder ${group.name}`}
          ref={sortable.setActivatorNodeRef}
          {...sortable.attributes}
          {...sortable.listeners}
          type="button"
        >
          <GripVertical size={16} />
        </DragButton>
        <NavText>{group.name}</NavText>
        <span>
          <Count>{count}</Count>
          <IconOnly aria-label={`Edit ${group.name}`} onClick={onEdit} type="button">
            <Pencil size={14} />
          </IconOnly>
        </span>
      </NavButton>
    </div>
  );
}

function TaskRow({
  task,
  onEdit,
  onTitleBlur,
  onToggleDone,
}: {
  task: Task;
  onEdit: () => void;
  onTitleBlur: (title: string) => void;
  onToggleDone: () => void;
}) {
  const [title, setTitle] = useState(task.title);
  const sortable = useSortable({ id: task._id });
  const style = {
    transform: CSS.Transform.toString(sortable.transform),
    transition: sortable.transition,
  };

  useEffect(() => setTitle(task.title), [task.title]);

  return (
    <TaskRowRoot ref={sortable.setNodeRef} style={style} data-done={task.done ? "true" : "false"}>
      <DragButton
        aria-label={`Reorder ${task.title}`}
        ref={sortable.setActivatorNodeRef}
        {...sortable.attributes}
        {...sortable.listeners}
        type="button"
      >
        <GripVertical size={17} />
      </DragButton>
      <CheckButton
        aria-label={task.done ? `Mark ${task.title} active` : `Mark ${task.title} done`}
        data-done={task.done ? "true" : "false"}
        onClick={onToggleDone}
        type="button"
      >
        {task.done ? <Check size={16} /> : <Circle size={16} />}
      </CheckButton>
      <div>
        <InlineTitle
          data-done={task.done ? "true" : "false"}
          aria-label={`Title for ${task.title}`}
          value={title}
          onBlur={() => onTitleBlur(title)}
          onChange={(event) => setTitle(event.currentTarget.value)}
        />
        <MobileMeta>
          <MetaPill data-priority={task.priority}>{task.priority}</MetaPill>
          <DueDate>{formatDueDate(task.dueDate)}</DueDate>
        </MobileMeta>
      </div>
      <MetaPill data-priority={task.priority}>{task.priority}</MetaPill>
      <DueDate>{formatDueDate(task.dueDate)}</DueDate>
      <IconOnly aria-label={`Edit ${task.title}`} onClick={onEdit} type="button">
        <Pencil size={15} />
      </IconOnly>
    </TaskRowRoot>
  );
}

function TaskEditor({
  groups,
  isMobile,
  onClose,
  onDelete,
  onUpdate,
  task,
}: {
  groups: Group[];
  isMobile: boolean;
  onClose: () => void;
  onDelete: () => void;
  onUpdate: (patch: {
    title?: string;
    description?: string;
    dueDate?: string;
    priority?: Priority;
    groupId?: Id<"task_groups">;
  }) => void;
  task: Task;
}) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [dueDate, setDueDate] = useState(task.dueDate ?? "");

  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description ?? "");
    setDueDate(task.dueDate ?? "");
  }, [task]);

  return (
    <Modal.Root isOpen onOpenChange={(open) => !open && onClose()}>
      <Modal.Backdrop variant="opaque">
        <Modal.Container placement={isMobile ? "bottom" : "center"} scroll="inside" size="lg">
          <Modal.Dialog aria-label={`Edit ${task.title}`}>
            <Modal.Header>
              <Modal.Heading>Task</Modal.Heading>
              <Modal.CloseTrigger aria-label="Close task">
                <X size={18} />
              </Modal.CloseTrigger>
            </Modal.Header>
            <Modal.Body>
              <FormGrid>
                <Field>
                  Title *
                  <Input.Root
                    value={title}
                    onBlur={() => onUpdate({ title })}
                    onChange={(event) => setTitle(event.currentTarget.value)}
                  />
                </Field>
                <Field>
                  Description
                  <TextArea.Root
                    rows={5}
                    value={description}
                    onBlur={() => onUpdate({ description })}
                    onChange={(event) => setDescription(event.currentTarget.value)}
                  />
                </Field>
                <Field>
                  Due date
                  <NativeInput
                    type="date"
                    value={dueDate}
                    onBlur={() => onUpdate({ dueDate })}
                    onChange={(event) => setDueDate(event.currentTarget.value)}
                  />
                </Field>
                <Field>
                  Priority
                  <PriorityGrid>
                    {priorities.map((priority) => (
                      <Button
                        key={priority}
                        variant={task.priority === priority ? "primary" : "outline"}
                        onPress={() => onUpdate({ priority })}
                      >
                        {priority}
                      </Button>
                    ))}
                  </PriorityGrid>
                </Field>
                <Field>
                  Group
                  <NativeSelect
                    value={task.groupId}
                    onChange={(event) =>
                      onUpdate({ groupId: event.currentTarget.value as Id<"task_groups"> })
                    }
                  >
                    {groups.map((group) => (
                      <option key={group._id} value={group._id}>
                        {group.name}
                      </option>
                    ))}
                  </NativeSelect>
                </Field>
              </FormGrid>
            </Modal.Body>
            <Modal.Footer>
              <ModalActions>
                <Button variant="danger" onPress={onDelete}>
                  <Trash2 size={16} />
                  Delete
                </Button>
                <Button slot="close" variant="primary">
                  Done
                </Button>
              </ModalActions>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal.Root>
  );
}

function GroupEditor({
  group,
  isMobile,
  onClose,
  onDelete,
  onUpdate,
}: {
  group: Group;
  isMobile: boolean;
  onClose: () => void;
  onDelete: () => void;
  onUpdate: (name: string) => void;
}) {
  const [name, setName] = useState(group.name);

  useEffect(() => setName(group.name), [group.name]);

  return (
    <Modal.Root isOpen onOpenChange={(open) => !open && onClose()}>
      <Modal.Backdrop variant="opaque">
        <Modal.Container placement={isMobile ? "bottom" : "center"} size="md">
          <Modal.Dialog aria-label={`Edit ${group.name}`}>
            <Modal.Header>
              <Modal.Heading>Edit Group</Modal.Heading>
              <Modal.CloseTrigger aria-label="Close group">
                <X size={18} />
              </Modal.CloseTrigger>
            </Modal.Header>
            <Modal.Body>
              <Field>
                Name
                <Input.Root
                  value={name}
                  onBlur={() => onUpdate(name)}
                  onChange={(event) => setName(event.currentTarget.value)}
                />
              </Field>
            </Modal.Body>
            <Modal.Footer>
              <ModalActions>
                <Button variant="danger" onPress={onDelete}>
                  <Trash2 size={16} />
                  Delete
                </Button>
                <Button slot="close" variant="primary">
                  Done
                </Button>
              </ModalActions>
            </Modal.Footer>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal.Root>
  );
}

function SidebarContent({
  groups,
  selectedView,
  tasks,
  onCreateGroup,
  onEditGroup,
  onReorderGroups,
  onSelect,
}: {
  groups: Group[];
  selectedView: View | null;
  tasks: Task[];
  onCreateGroup: (name: string) => void;
  onEditGroup: (group: Group) => void;
  onReorderGroups: (groupIds: Id<"task_groups">[]) => void;
  onSelect: (view: View) => void;
}) {
  const [newGroup, setNewGroup] = useState("");
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const today = todayString();

  function createGroup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newGroup.trim()) return;
    onCreateGroup(newGroup);
    setNewGroup("");
  }

  function reorderGroups(event: DragEndEvent) {
    if (!event.over || event.active.id === event.over.id) return;
    const oldIndex = groups.findIndex((group) => group._id === event.active.id);
    const newIndex = groups.findIndex((group) => group._id === event.over?.id);
    if (oldIndex < 0 || newIndex < 0) return;
    onReorderGroups(arrayMove(groups, oldIndex, newIndex).map((group) => group._id));
  }

  return (
    <>
      <NavSection>
        <NavButton
          data-active={selectedView?.type === "today" ? "true" : "false"}
          onClick={() => onSelect({ type: "today" })}
          type="button"
        >
          <CalendarDays size={17} />
          <NavText>Today</NavText>
          <Count>{tasks.filter((task) => task.dueDate === today && !task.done).length}</Count>
        </NavButton>
        <NavButton
          data-active={selectedView?.type === "upcoming" ? "true" : "false"}
          onClick={() => onSelect({ type: "upcoming" })}
          type="button"
        >
          <ChevronDown size={17} />
          <NavText>Upcoming</NavText>
          <Count>{tasks.filter(isUpcoming).length}</Count>
        </NavButton>
        <NavButton
          data-active={selectedView?.type === "done" ? "true" : "false"}
          onClick={() => onSelect({ type: "done" })}
          type="button"
        >
          <Check size={17} />
          <NavText>Done</NavText>
          <Count>{tasks.filter((task) => task.done).length}</Count>
        </NavButton>
      </NavSection>
      <NavSection>
        <SectionLabel>
          <span>Groups</span>
        </SectionLabel>
        <GroupForm onSubmit={createGroup}>
          <NativeInput
            aria-label="New group name"
            placeholder="New group"
            value={newGroup}
            onChange={(event) => setNewGroup(event.currentTarget.value)}
          />
          <Button aria-label="Create group" isIconOnly type="submit" variant="primary">
            <Plus size={17} />
          </Button>
        </GroupForm>
        <DndContext collisionDetection={closestCenter} sensors={sensors} onDragEnd={reorderGroups}>
          <SortableContext
            items={groups.map((group) => group._id)}
            strategy={verticalListSortingStrategy}
          >
            {groups.map((group) => (
              <SortableGroup
                active={selectedView?.type === "group" && selectedView.groupId === group._id}
                count={taskCount(tasks, group._id)}
                group={group}
                key={group._id}
                onEdit={() => onEditGroup(group)}
                onSelect={() => onSelect({ type: "group", groupId: group._id })}
              />
            ))}
          </SortableContext>
        </DndContext>
      </NavSection>
    </>
  );
}

export function App() {
  const data = useQuery(api.tasks.list);
  const ensureDefaults = useMutation(api.tasks.ensureDefaults);
  const createGroup = useMutation(api.tasks.createGroup);
  const updateGroup = useMutation(api.tasks.updateGroup);
  const deleteGroup = useMutation(api.tasks.deleteGroup);
  const reorderGroups = useMutation(api.tasks.reorderGroups);
  const createTask = useMutation(api.tasks.createTask);
  const updateTask = useMutation(api.tasks.updateTask);
  const toggleTaskDone = useMutation(api.tasks.toggleTaskDone);
  const deleteTask = useMutation(api.tasks.deleteTask);
  const reorderTasks = useMutation(api.tasks.reorderTasks);
  const isMobile = useMediaQuery("(max-width: 860px)");
  const drawerState = useOverlayState();
  const { toast, showToast } = useAutosaveToast();
  const setupAttempted = useRef(false);
  const [setupError, setSetupError] = useState<string | null>(null);
  const [selectedView, setSelectedView] = useState<View | null>(null);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);

  const groups = useMemo<Group[]>(() => sortByOrder(data?.groups ?? []), [data?.groups]);
  const tasks = useMemo<Task[]>(() => data?.tasks ?? [], [data?.tasks]);

  useEffect(() => {
    if (data && data.groups.length === 0 && !setupAttempted.current) {
      setupAttempted.current = true;
      setSetupError(null);
      void ensureDefaults().catch((error: unknown) => setSetupError(getErrorMessage(error)));
    }
  }, [data, ensureDefaults]);

  useEffect(() => {
    if (!selectedView && groups[0]) {
      setSelectedView({ type: "group", groupId: groups[0]._id });
    }
  }, [groups, selectedView]);

  useEffect(() => {
    if (
      selectedView?.type === "group" &&
      groups.length > 0 &&
      !groups.some((group) => group._id === selectedView.groupId)
    ) {
      setSelectedView({ type: "group", groupId: groups[0]._id });
    }
  }, [groups, selectedView]);

  const viewTasks = useMemo(() => {
    if (!selectedView) return [];
    if (selectedView.type === "today") {
      const today = todayString();
      return tasks.filter((task) => task.dueDate === today && !task.done);
    }
    if (selectedView.type === "upcoming") return tasks.filter(isUpcoming);
    if (selectedView.type === "done") return tasks.filter((task) => task.done);
    return tasks.filter((task) => task.groupId === selectedView.groupId);
  }, [selectedView, tasks]);

  const activeTasks = sortByOrder(viewTasks.filter((task) => !task.done));
  const doneTasks = sortByOrder(viewTasks.filter((task) => task.done));
  const selectedGroup =
    selectedView?.type === "group"
      ? groups.find((group) => group._id === selectedView.groupId)
      : null;
  const pageTitle =
    selectedView?.type === "today"
      ? "Today"
      : selectedView?.type === "upcoming"
        ? "Upcoming"
        : selectedView?.type === "done"
          ? "Done"
          : selectedGroup?.name || "Tasks";
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  async function addTask() {
    const groupId = selectedView?.type === "group" ? selectedView.groupId : groups[0]?._id;
    if (!groupId) return;
    await createTask({ groupId, title: "New task" });
  }

  function handleTaskReorder(event: DragEndEvent) {
    if (!event.over || event.active.id === event.over.id || !selectedGroup) return;
    const dragged = tasks.find((task) => task._id === event.active.id);
    const target = tasks.find((task) => task._id === event.over?.id);
    if (!dragged || !target) return;

    if (dragged.done !== target.done) {
      showToast("Done tasks stay below active tasks.");
      return;
    }

    const source = dragged.done ? doneTasks : activeTasks;
    const oldIndex = source.findIndex((task) => task._id === dragged._id);
    const newIndex = source.findIndex((task) => task._id === target._id);
    if (oldIndex < 0 || newIndex < 0) return;

    void reorderTasks({
      groupId: selectedGroup._id,
      done: dragged.done,
      taskIds: arrayMove(source, oldIndex, newIndex).map((task) => task._id),
    });
  }

  const sidebar = (
    <SidebarContent
      groups={groups}
      selectedView={selectedView}
      tasks={tasks}
      onCreateGroup={(name) => void createGroup({ name })}
      onEditGroup={setEditingGroup}
      onReorderGroups={(groupIds) => void reorderGroups({ groupIds })}
      onSelect={(view) => {
        setSelectedView(view);
        drawerState.close();
      }}
    />
  );

  if (data === undefined) {
    return (
      <AppStateShell
        title="Loading tasks"
        message="Connecting to Convex and loading task groups."
      />
    );
  }

  if (groups.length === 0) {
    return (
      <AppStateShell
        title={setupError ? "Tasks setup failed" : "Preparing Inbox"}
        message={
          setupError
            ? "The default Inbox could not be created. Check the Convex deployment, then retry."
            : "Creating the default group for this workspace."
        }
        action={
          setupError ? (
            <>
              <ErrorText>{setupError}</ErrorText>
              <Button
                variant="primary"
                onPress={() => {
                  setSetupError(null);
                  void ensureDefaults().catch((error: unknown) =>
                    setSetupError(getErrorMessage(error)),
                  );
                }}
              >
                Retry
              </Button>
            </>
          ) : undefined
        }
      />
    );
  }

  return (
    <Shell>
      <GlobalStyle />
      <Sidebar>
        <Brand href="/">Tasks</Brand>
        {sidebar}
      </Sidebar>
      <MobileHeader>
        <Button aria-label="Open navigation" isIconOnly onPress={drawerState.open} variant="ghost">
          <Menu size={20} />
        </Button>
        <Brand href="/">Tasks</Brand>
        <Button aria-label="Create task" isIconOnly onPress={addTask} variant="primary">
          <Plus size={18} />
        </Button>
      </MobileHeader>
      <Content>
        <Topbar>
          <TitleBlock>
            <Kicker>{selectedView?.type === "group" ? "Group" : "Filter"}</Kicker>
            <Title>{pageTitle}</Title>
          </TitleBlock>
          <Button isDisabled={!groups.length} onPress={addTask} variant="primary">
            <Plus size={18} />
            New Task
          </Button>
        </Topbar>

        <TaskListShell>
          {data === undefined && <EmptyState>Loading tasks...</EmptyState>}
          {data !== undefined && !groups.length && <EmptyState>Preparing Inbox...</EmptyState>}
          {data !== undefined && groups.length > 0 && (
            <DndContext
              collisionDetection={closestCenter}
              sensors={sensors}
              onDragEnd={handleTaskReorder}
            >
              <ListSection>
                <ListHeading>
                  <span>Active</span>
                  <Count>{activeTasks.length}</Count>
                </ListHeading>
                <Card>
                  <Card.Content>
                    <TaskList>
                      {activeTasks.length === 0 && <EmptyState>No active tasks.</EmptyState>}
                      <SortableContext
                        items={activeTasks.map((task) => task._id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {activeTasks.map((task) => (
                          <TaskRow
                            key={task._id}
                            task={task}
                            onEdit={() => setEditingTask(task)}
                            onTitleBlur={(title) => void updateTask({ taskId: task._id, title })}
                            onToggleDone={() =>
                              void toggleTaskDone({ taskId: task._id, done: !task.done })
                            }
                          />
                        ))}
                      </SortableContext>
                    </TaskList>
                  </Card.Content>
                </Card>
              </ListSection>
              <ListSection>
                <ListHeading>
                  <span>Done</span>
                  <Count>{doneTasks.length}</Count>
                </ListHeading>
                <Card>
                  <Card.Content>
                    <TaskList>
                      {doneTasks.length === 0 && <EmptyState>No done tasks.</EmptyState>}
                      <SortableContext
                        items={doneTasks.map((task) => task._id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {doneTasks.map((task) => (
                          <TaskRow
                            key={task._id}
                            task={task}
                            onEdit={() => setEditingTask(task)}
                            onTitleBlur={(title) => void updateTask({ taskId: task._id, title })}
                            onToggleDone={() =>
                              void toggleTaskDone({ taskId: task._id, done: !task.done })
                            }
                          />
                        ))}
                      </SortableContext>
                    </TaskList>
                  </Card.Content>
                </Card>
              </ListSection>
            </DndContext>
          )}
        </TaskListShell>
      </Content>

      {drawerState.isOpen && (
        <Modal.Root state={drawerState}>
          <Modal.Backdrop variant="opaque">
            <Modal.Container placement="bottom" size="cover">
              <Modal.Dialog aria-label="Navigation">
                <Modal.Header>
                  <Modal.Heading>Tasks</Modal.Heading>
                  <Modal.CloseTrigger aria-label="Close navigation">
                    <X size={18} />
                  </Modal.CloseTrigger>
                </Modal.Header>
                <Modal.Body>
                  <DrawerPanel>{sidebar}</DrawerPanel>
                </Modal.Body>
              </Modal.Dialog>
            </Modal.Container>
          </Modal.Backdrop>
        </Modal.Root>
      )}

      {editingTask && (
        <TaskEditor
          groups={groups}
          isMobile={isMobile}
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onDelete={() => {
            void deleteTask({ taskId: editingTask._id });
            setEditingTask(null);
          }}
          onUpdate={(patch) => void updateTask({ taskId: editingTask._id, ...patch })}
        />
      )}
      {editingGroup && (
        <GroupEditor
          group={editingGroup}
          isMobile={isMobile}
          onClose={() => setEditingGroup(null)}
          onDelete={() => {
            void deleteGroup({ groupId: editingGroup._id });
            setEditingGroup(null);
          }}
          onUpdate={(name) => void updateGroup({ groupId: editingGroup._id, name })}
        />
      )}
      {toast && <Toast>{toast}</Toast>}
    </Shell>
  );
}
