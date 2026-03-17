import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ChartStyle } from '../components/ui/chart';

describe('ChartStyle', () => {
  it('should securely escape malicious XSS payloads in color config', () => {
    const id = 'test-chart';
    const config = {
      malicious: {
        color: 'red; }</style><script>alert("xss")</script><style>{',
      },
    };

    const { container } = render(<ChartStyle id={id} config={config} />);
    const styleElement = container.querySelector('style');

    expect(styleElement).not.toBeNull();
    // XSS mitigation ensures `<` is converted to CSS hex escape `\3C `
    expect(styleElement?.innerHTML).toContain('\\3C script>alert("xss")\\3C /script>');
    expect(styleElement?.innerHTML).not.toContain('<script>');
    expect(styleElement?.innerHTML).not.toContain('</style>');
  });
});
