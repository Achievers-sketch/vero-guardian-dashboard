import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import TaskCard, { type TaskCardTask } from '@/components/TaskCard';
import { resetChainStateForTests } from '@/hooks/useChainState';

function createTask(overrides: Partial<TaskCardTask> = {}): TaskCardTask {
  return {
    id: 'task-1',
    title: 'Review validator evidence',
    status: 'pending',
    is_done: false,
    reward: '25 VERO',
    priority: 'high',
    ...overrides,
  };
}

describe('TaskCard', () => {
  afterEach(() => {
    act(() => resetChainStateForTests());
  });

  it('renders a pending task title and action button from payload data', () => {
    render(<TaskCard tasks={[createTask()]} />);

    expect(screen.getByText('Review validator evidence')).toBeInTheDocument();
    expect(screen.getByText('25 VERO')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /vote for review validator evidence/i }),
    ).toBeInTheDocument();
  });

  it('removes the Vote action when the task is already done', () => {
    render(
      <TaskCard
        tasks={[
          createTask({
            status: 'pending',
            is_done: true,
            title: 'Completed validator review',
          }),
        ]}
      />,
    );

    expect(screen.getByText('Completed validator review')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /vote/i })).not.toBeInTheDocument();
  });

  it('marks a task as completed and removes Vote button when Vote is clicked', async () => {
    const user = userEvent.setup();
    const task = createTask({ id: 'v1', title: 'Votable task' });
    render(<TaskCard tasks={[task]} />);

    const voteButton = screen.getByRole('button', { name: /vote for votable task/i });
    expect(voteButton).toBeInTheDocument();

    await user.click(voteButton);

    expect(screen.queryByRole('button', { name: /vote for votable task/i })).not.toBeInTheDocument();
    expect(screen.getByText('completed')).toBeInTheDocument();
  });

  it('sorts completed tasks to the bottom', () => {
    const tasks: TaskCardTask[] = [
      createTask({
        id: 'a',
        title: 'Alpha pending',
        status: 'pending',
        is_done: false,
      }),
      createTask({
        id: 'b',
        title: 'Bravo completed',
        status: 'completed',
        is_done: true,
      }),
      createTask({
        id: 'c',
        title: 'Charlie in-progress',
        status: 'in-progress',
        is_done: false,
      }),
    ];

    render(<TaskCard tasks={tasks} />);

    const cards = screen.getAllByText(/Alpha|Bravo|Charlie/);
    expect(cards[0]).toHaveTextContent('Charlie');
    expect(cards[1]).toHaveTextContent('Alpha');
    expect(cards[2]).toHaveTextContent('Bravo');
  });

  it('highlights a task with animation classes when voted completed', async () => {
    const user = userEvent.setup();
    const task = createTask({ id: 'anim1', title: 'Animate me' });
    const { container } = render(<TaskCard tasks={[task]} />);

    const voteButton = screen.getByRole('button', { name: /vote for animate me/i });
    await user.click(voteButton);

    const card = container.querySelector('[class*="scale-"]');
    expect(card).toBeInTheDocument();
  });
});
