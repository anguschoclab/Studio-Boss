import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { FormSection } from '@/components/forms/FormSection';
import { Settings, ChevronDown } from 'lucide-react';

describe('FormSection', () => {
  it('renders with title', () => {
    render(
      <FormSection title="Test Section">
        <div>Content</div>
      </FormSection>
    );
    
    expect(screen.getByText('Test Section')).toBeInTheDocument();
  });

  it('renders with description', () => {
    render(
      <FormSection title="Test Section" description="This is a description">
        <div>Content</div>
      </FormSection>
    );
    
    expect(screen.getByText('This is a description')).toBeInTheDocument();
  });

  it('renders with icon', () => {
    render(
      <FormSection title="Settings" icon={Settings}>
        <div>Content</div>
      </FormSection>
    );
    
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(document.querySelector('svg')).toBeInTheDocument();
  });

  it('renders children content', () => {
    render(
      <FormSection title="Test Section">
        <div data-testid="child-content">Child Content</div>
      </FormSection>
    );
    
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });

  it('renders actions', () => {
    render(
      <FormSection 
        title="Test Section" 
        actions={<button data-testid="action-btn">Action</button>}
      >
        <div>Content</div>
      </FormSection>
    );
    
    expect(screen.getByTestId('action-btn')).toBeInTheDocument();
  });

  it('collapses and expands when clickable', () => {
    render(
      <FormSection title="Collapsible Section" collapsible>
        <div data-testid="collapsible-content">Hidden Content</div>
      </FormSection>
    );
    
    // Initially visible
    expect(screen.getByTestId('collapsible-content')).toBeInTheDocument();
    
    // Click to collapse
    fireEvent.click(screen.getByText('Collapsible Section'));
    
    // Should be hidden now
    expect(screen.queryByTestId('collapsible-content')).not.toBeInTheDocument();
    
    // Chevron should rotate
    expect(document.querySelector('.-rotate-90')).toBeInTheDocument();
  });

  it('respects defaultOpen prop when collapsible', () => {
    render(
      <FormSection title="Collapsed Section" collapsible defaultOpen={false}>
        <div data-testid="hidden-content">Hidden Content</div>
      </FormSection>
    );
    
    // Should be initially hidden
    expect(screen.queryByTestId('hidden-content')).not.toBeInTheDocument();
  });

  it('does not collapse when not collapsible', () => {
    render(
      <FormSection title="Non-collapsible">
        <div data-testid="always-visible">Always Visible</div>
      </FormSection>
    );
    
    // Click should not hide content
    fireEvent.click(screen.getByText('Non-collapsible'));
    expect(screen.getByTestId('always-visible')).toBeInTheDocument();
  });
});
