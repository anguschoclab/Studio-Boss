import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { FormGrid } from '@/components/forms/FormGrid';

describe('FormGrid', () => {
  it('renders children', () => {
    render(
      <FormGrid>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
      </FormGrid>
    );
    
    expect(screen.getByTestId('child-1')).toBeInTheDocument();
    expect(screen.getByTestId('child-2')).toBeInTheDocument();
  });

  it('applies single column by default', () => {
    const { container } = render(
      <FormGrid>
        <div>Content</div>
      </FormGrid>
    );
    
    expect(container.firstChild).toHaveClass('grid-cols-1');
  });

  it('applies two column layout', () => {
    const { container } = render(
      <FormGrid columns={2}>
        <div>Content</div>
      </FormGrid>
    );
    
    expect(container.firstChild).toHaveClass('grid-cols-1');
    expect(container.firstChild).toHaveClass('md:grid-cols-2');
  });

  it('applies three column layout', () => {
    const { container } = render(
      <FormGrid columns={3}>
        <div>Content</div>
      </FormGrid>
    );
    
    expect(container.firstChild).toHaveClass('grid-cols-1');
    expect(container.firstChild).toHaveClass('md:grid-cols-2');
    expect(container.firstChild).toHaveClass('lg:grid-cols-3');
  });

  it('applies medium gap by default', () => {
    const { container } = render(
      <FormGrid>
        <div>Content</div>
      </FormGrid>
    );
    
    expect(container.firstChild).toHaveClass('gap-4');
  });

  it('applies small gap', () => {
    const { container } = render(
      <FormGrid gap="sm">
        <div>Content</div>
      </FormGrid>
    );
    
    expect(container.firstChild).toHaveClass('gap-3');
  });

  it('applies large gap', () => {
    const { container } = render(
      <FormGrid gap="lg">
        <div>Content</div>
      </FormGrid>
    );
    
    expect(container.firstChild).toHaveClass('gap-6');
  });

  it('accepts custom className', () => {
    const { container } = render(
      <FormGrid className="custom-class">
        <div>Content</div>
      </FormGrid>
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
