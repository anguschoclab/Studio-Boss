import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { UnifiedModal } from '@/components/modals/UnifiedModal';
import { Settings, X } from 'lucide-react';

describe('UnifiedModal', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <UnifiedModal isOpen={false} onClose={() => {}} title="Test">
        <div>Content</div>
      </UnifiedModal>
    );
    
    expect(container.firstChild).toBeNull();
  });

  it('renders when open', () => {
    render(
      <UnifiedModal isOpen={true} onClose={() => {}} title="Test Modal">
        <div data-testid="modal-content">Modal Content</div>
      </UnifiedModal>
    );
    
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByTestId('modal-content')).toBeInTheDocument();
  });

  it('renders with subtitle', () => {
    render(
      <UnifiedModal 
        isOpen={true} 
        onClose={() => {}} 
        title="Title"
        subtitle="This is the subtitle"
      >
        <div>Content</div>
      </UnifiedModal>
    );
    
    expect(screen.getByText('This is the subtitle')).toBeInTheDocument();
  });

  it('renders with icon', () => {
    render(
      <UnifiedModal 
        isOpen={true} 
        onClose={() => {}} 
        title="Settings"
        icon={Settings}
      >
        <div>Content</div>
      </UnifiedModal>
    );
    
    expect(document.querySelector('svg')).toBeInTheDocument();
  });

  it('calls onClose when clicking close button', () => {
    const handleClose = vi.fn();
    render(
      <UnifiedModal isOpen={true} onClose={handleClose} title="Test">
        <div>Content</div>
      </UnifiedModal>
    );
    
    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when clicking backdrop', () => {
    const handleClose = vi.fn();
    render(
      <UnifiedModal isOpen={true} onClose={handleClose} title="Test">
        <div>Content</div>
      </UnifiedModal>
    );
    
    // Click the backdrop (first div with bg-black class)
    const backdrop = document.querySelector('.bg-black\\/60');
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(handleClose).toHaveBeenCalledTimes(1);
    }
  });

  it('does not close when preventClose is true', () => {
    const handleClose = vi.fn();
    render(
      <UnifiedModal 
        isOpen={true} 
        onClose={handleClose} 
        title="Test"
        preventClose
      >
        <div>Content</div>
      </UnifiedModal>
    );
    
    // Close button should not be visible
    expect(screen.queryByRole('button', { name: /close/i })).not.toBeInTheDocument();
    
    // Clicking backdrop should not close
    const backdrop = document.querySelector('.bg-black\\/60');
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(handleClose).not.toHaveBeenCalled();
    }
  });

  it('renders footer when provided', () => {
    render(
      <UnifiedModal 
        isOpen={true} 
        onClose={() => {}} 
        title="Test"
        footer={<div data-testid="footer-content">Footer</div>}
      >
        <div>Content</div>
      </UnifiedModal>
    );
    
    expect(screen.getByTestId('footer-content')).toBeInTheDocument();
  });

  it('applies size variants', () => {
    const { container } = render(
      <UnifiedModal isOpen={true} onClose={() => {}} title="Test" size="lg">
        <div>Content</div>
      </UnifiedModal>
    );
    
    expect(document.querySelector('.max-w-2xl')).toBeInTheDocument();
  });

  it('applies full size variant', () => {
    render(
      <UnifiedModal isOpen={true} onClose={() => {}} title="Test" size="full">
        <div data-testid="content">Content</div>
      </UnifiedModal>
    );
    
    expect(document.querySelector('.max-w-\\[95vw\\]')).toBeInTheDocument();
    expect(document.querySelector('.h-\\[90vh\\]')).toBeInTheDocument();
  });

  it('hides close button when showCloseButton is false', () => {
    render(
      <UnifiedModal 
        isOpen={true} 
        onClose={() => {}} 
        title="Test"
        showCloseButton={false}
      >
        <div>Content</div>
      </UnifiedModal>
    );
    
    expect(screen.queryByRole('button', { name: /close/i })).not.toBeInTheDocument();
  });

  it('accepts custom className', () => {
    render(
      <UnifiedModal 
        isOpen={true} 
        onClose={() => {}} 
        title="Test"
        className="custom-modal-class"
      >
        <div>Content</div>
      </UnifiedModal>
    );
    
    expect(document.querySelector('.custom-modal-class')).toBeInTheDocument();
  });
});
