import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { FormActions } from '@/components/forms/FormActions';

describe('FormActions', () => {
  it('renders submit button', () => {
    render(<FormActions onSubmit={() => {}} submitLabel="Save" />);
    
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('renders cancel button', () => {
    render(<FormActions onCancel={() => {}} cancelLabel="Discard" />);
    
    expect(screen.getByText('Discard')).toBeInTheDocument();
  });

  it('renders both buttons', () => {
    render(
      <FormActions 
        onSubmit={() => {}} 
        onCancel={() => {}}
        submitLabel="Save"
        cancelLabel="Cancel"
      />
    );
    
    expect(screen.getByText('Save')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('calls onSubmit when submit button clicked', () => {
    const handleSubmit = vi.fn();
    render(<FormActions onSubmit={handleSubmit} submitLabel="Submit" />);
    
    fireEvent.click(screen.getByText('Submit'));
    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when cancel button clicked', () => {
    const handleCancel = vi.fn();
    render(<FormActions onCancel={handleCancel} cancelLabel="Cancel" />);
    
    fireEvent.click(screen.getByText('Cancel'));
    expect(handleCancel).toHaveBeenCalledTimes(1);
  });

  it('disables buttons when loading', () => {
    render(
      <FormActions 
        onSubmit={() => {}} 
        onCancel={() => {}}
        isLoading
      />
    );
    
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toBeDisabled();
    });
  });

  it('shows loading spinner when loading', () => {
    render(<FormActions onSubmit={() => {}} isLoading />);
    
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('disables submit when not dirty and not explicitly disabled', () => {
    render(
      <FormActions 
        onSubmit={() => {}} 
        isDirty={false}
        submitDisabled={false}
      />
    );
    
    expect(screen.getByRole('button', { name: /save/i })).toBeDisabled();
  });

  it('enables submit when dirty', () => {
    render(
      <FormActions 
        onSubmit={() => {}} 
        isDirty={true}
      />
    );
    
    expect(screen.getByRole('button', { name: /save/i })).not.toBeDisabled();
  });

  it('aligns left', () => {
    const { container } = render(<FormActions align="left" />);
    
    expect(container.firstChild).toHaveClass('justify-start');
  });

  it('aligns center', () => {
    const { container } = render(<FormActions align="center" />);
    
    expect(container.firstChild).toHaveClass('justify-center');
  });

  it('aligns right by default', () => {
    const { container } = render(<FormActions />);
    
    expect(container.firstChild).toHaveClass('justify-end');
  });

  it('applies submit variant', () => {
    render(<FormActions onSubmit={() => {}} submitVariant="destructive" />);
    
    // Button should have destructive styling
    const button = screen.getByRole('button', { name: /save/i });
    expect(button).toHaveClass('bg-destructive');
  });

  it('accepts custom className', () => {
    const { container } = render(<FormActions className="custom-class" />);
    
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
