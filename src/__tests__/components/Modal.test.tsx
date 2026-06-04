import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Modal from '../../components/Modal';
import { Settings } from 'lucide-react';

const defaultProps = {
  isOpen: true,
  onClose: jest.fn(),
  title: 'Test Modal',
  children: <p>Modal content</p>,
};

describe('Modal', () => {
  beforeEach(() => jest.clearAllMocks());

  // ── Visibility ─────────────────────────────────────────────────────────────

  it('renders when isOpen is true', () => {
    render(<Modal {...defaultProps} />);
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(<Modal {...defaultProps} isOpen={false} />);
    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
  });

  // ── Title bar ──────────────────────────────────────────────────────────────

  it('renders the title text', () => {
    render(<Modal {...defaultProps} title="My Settings" />);
    expect(screen.getByText('My Settings')).toBeInTheDocument();
  });

  it('renders an icon when provided', () => {
    render(
      <Modal {...defaultProps} icon={<Settings data-testid="icon" className="w-5 h-5" />} />
    );
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('renders children in the content area', () => {
    render(<Modal {...defaultProps}><span data-testid="child">hello</span></Modal>);
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  // ── Close interactions ─────────────────────────────────────────────────────

  it('calls onClose when the X button is clicked', async () => {
    const onClose = jest.fn();
    render(<Modal {...defaultProps} onClose={onClose} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when the backdrop is clicked', async () => {
    const onClose = jest.fn();
    const { container } = render(<Modal {...defaultProps} onClose={onClose} />);
    // The backdrop is the outermost fixed div
    const backdrop = container.firstChild as HTMLElement;
    await userEvent.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does NOT call onClose when clicking inside the modal card', async () => {
    const onClose = jest.fn();
    render(<Modal {...defaultProps} onClose={onClose} />);
    await userEvent.click(screen.getByText('Modal content'));
    expect(onClose).not.toHaveBeenCalled();
  });

  it('calls onClose when Escape key is pressed', () => {
    const onClose = jest.fn();
    render(<Modal {...defaultProps} onClose={onClose} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does NOT call onClose for non-Escape keys', () => {
    const onClose = jest.fn();
    render(<Modal {...defaultProps} onClose={onClose} />);
    fireEvent.keyDown(document, { key: 'Enter' });
    expect(onClose).not.toHaveBeenCalled();
  });

  it('removes the keydown listener when unmounted', () => {
    const onClose = jest.fn();
    const { unmount } = render(<Modal {...defaultProps} onClose={onClose} />);
    unmount();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
  });

  // ── Size variants ──────────────────────────────────────────────────────────

  it.each([
    ['sm', 'max-w-lg'],
    ['md', 'max-w-2xl'],
    ['lg', 'max-w-4xl'],
    ['xl', 'max-w-6xl'],
  ] as const)('applies correct max-width class for size="%s"', (size, cls) => {
    const { container } = render(<Modal {...defaultProps} size={size} />);
    // The inner card div should have the class
    const card = container.querySelector(`.${cls}`);
    expect(card).toBeInTheDocument();
  });

  // ── titleColor ─────────────────────────────────────────────────────────────

  it('applies default emerald/teal gradient to title bar', () => {
    const { container } = render(<Modal {...defaultProps} />);
    const titleBar = container.querySelector('.from-emerald-500');
    expect(titleBar).toBeInTheDocument();
  });

  it('applies custom titleColor when provided', () => {
    const { container } = render(
      <Modal {...defaultProps} titleColor="from-purple-500 to-pink-500" />
    );
    const titleBar = container.querySelector('.from-purple-500');
    expect(titleBar).toBeInTheDocument();
  });
});
