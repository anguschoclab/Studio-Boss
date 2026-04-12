import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { FormField } from '@/components/forms/FormField';
import { Mail, AlertCircle } from 'lucide-react';

describe('FormField', () => {
  it('renders label', () => {
    render(
      <FormField label="Email Address">
        <input type="email" />
      </FormField>
    );
    
    expect(screen.getByText('Email Address')).toBeInTheDocument();
  });

  it('renders with icon', () => {
    render(
      <FormField label="Email" icon={Mail}>
        <input type="email" />
      </FormField>
    );
    
    expect(document.querySelector('svg')).toBeInTheDocument();
  });

  it('shows required indicator', () => {
    render(
      <FormField label="Required Field" required>
        <input />
      </FormField>
    );
    
    const label = screen.getByText('Required Field');
    expect(label.parentElement?.querySelector('span.text-red-400')).toBeInTheDocument();
  });

  it('displays error message', () => {
    render(
      <FormField label="Field" error="This field is required">
        <input />
      </FormField>
    );
    
    expect(screen.getByText('This field is required')).toBeInTheDocument();
    expect(screen.getByText('Field')).toHaveClass('text-red-400');
  });

  it('displays helper text when no error', () => {
    render(
      <FormField label="Field" helper="Enter your full name">
        <input />
      </FormField>
    );
    
    expect(screen.getByText('Enter your full name')).toBeInTheDocument();
  });

  it('prioritizes error over helper', () => {
    render(
      <FormField 
        label="Field" 
        error="Error message" 
        helper="Helper text"
      >
        <input />
      </FormField>
    );
    
    expect(screen.getByText('Error message')).toBeInTheDocument();
    expect(screen.queryByText('Helper text')).not.toBeInTheDocument();
  });

  it('associates label with input via htmlFor', () => {
    render(
      <FormField label="Email" htmlFor="email-input">
        <input id="email-input" type="email" />
      </FormField>
    );
    
    const label = screen.getByText('Email');
    expect(label).toHaveAttribute('for', 'email-input');
  });

  it('renders children content', () => {
    render(
      <FormField label="Test">
        <input data-testid="test-input" />
        <span data-testid="extra">Extra</span>
      </FormField>
    );
    
    expect(screen.getByTestId('test-input')).toBeInTheDocument();
    expect(screen.getByTestId('extra')).toBeInTheDocument();
  });

  it('accepts custom className', () => {
    const { container } = render(
      <FormField label="Field" className="custom-class">
        <input />
      </FormField>
    );
    
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
