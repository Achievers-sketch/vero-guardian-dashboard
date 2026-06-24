import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import TaskCard, { type TaskCardTask } from '@/components/TaskCard';
import { resetChainStateForTests } from '@/hooks/useChainState';
import { render, screen, fireEvent, act } from '@testing-library/react';

import TaskCard, { type TaskCardTask } from '@/components/TaskCard';
import { ToastProvider } from '@/components/Toast';

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}

function createTask(overrides: Partial<TaskCardTask> = {}): TaskCardTask {
  return {
    id: 'task-1',
    title: 'Review validator evidence',
    status: 'pending',
    is_done: false,
    reward: '25 VERO',
    priority: 'high',
    votes: 0,
    ...overrides,
  };
}

describe('TaskCard', () => {
  afterEach(() => {
    act(() => resetChainStateForTests());
  });

  it('renders a pending task title and action button from payload data', () => {
    render(<TaskCard tasks={[createTask()]} />, { wrapper: Wrapper });

    expect(screen.getByText('Review validator evidence')).toBeInTheDocument();
    expect(screen.getByText('25 VERO')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /vote for review validator evidence/i }),
      screen.getByRole('button', { name: /verify quality for review validator evidence/i })
    ).toBeInTheDocument();
  });

  it('shows the vote count', () => {
    render(<TaskCard tasks={[createTask({ votes: 5 })]} />, { wrapper: Wrapper });

    expect(screen.getByText('5 votes')).toBeInTheDocument();
  });

  it('hides the action button when the task is done', () => {
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
      { wrapper: Wrapper },
    );

    expect(screen.getByText('Completed validator review')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /verify/i })).not.toBeInTheDocument();
  });

  it('applies optimistic status and increments vote count on click, then resolves', async () => {
    const fastSubmit = () => Promise.resolve({ status: 'success', txHash: '0xabc123' });

    render(<TaskCard tasks={[createTask({ votes: 2 })]} submitVote={fastSubmit} />, {
      wrapper: Wrapper,
    });

    expect(screen.getByText('2 votes')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /verify quality/i }));

    expect(screen.getByText('Verifying…')).toBeInTheDocument();
    expect(screen.getByText('3 votes')).toBeInTheDocument();

    await act(async () => {});
    expect(screen.getByText('3 votes')).toBeInTheDocument();
    expect(screen.queryByText('Verifying…')).not.toBeInTheDocument();
  });

  it('promotes pending to in-progress optimistically', async () => {
    const fastSubmit = () => Promise.resolve({ status: 'success', txHash: '0xabc' });

    render(
      <TaskCard
        tasks={[createTask({ status: 'pending', votes: 0 })]}
        submitVote={fastSubmit}
      />,
      { wrapper: Wrapper },
    );

    expect(screen.getByText(/status:/i)).toHaveTextContent(/pending/i);

    fireEvent.click(screen.getByRole('button', { name: /verify quality/i }));

    expect(screen.getByText(/status:/i)).toHaveTextContent(/in progress/i);

    await act(async () => {});
    expect(screen.getByText(/status:/i)).toHaveTextContent(/in progress/i);
  });

  it('reverts optimistic changes and shows error toast on failure', async () => {
    const failSubmit = () => Promise.reject(new Error('consensus timeout'));

    render(
      <TaskCard
        tasks={[createTask({ status: 'pending', votes: 2 })]}
        submitVote={failSubmit}
      />,
      { wrapper: Wrapper },
    );

    expect(screen.getByText('2 votes')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /verify quality/i }));

    expect(screen.getByText('3 votes')).toBeInTheDocument();

    await act(async () => {});

    expect(screen.getByText('2 votes')).toBeInTheDocument();
    expect(screen.getByText(/status:/i)).toHaveTextContent(/pending/i);
    expect(screen.getByRole('button', { name: /verify quality/i })).toBeInTheDocument();
    expect(screen.getByText(/verification failed/i)).toBeInTheDocument();
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
