import React from 'react';
import { render } from '@testing-library/react';
import { describe, it } from 'vitest';
import { ChartStyle } from '../components/ui/chart';

describe('ChartStyle Log', () => {
  it('logs the innerHTML', () => {
    const id = 'test-chart';
    const config = {
      malicious: {
        color: 'red; }</style><script>alert("xss")</script><style>{',
      },
    };

    const { container } = render(<ChartStyle id={id} config={config} />);
    console.log("XSS innerHTML output:");
    console.log(container.querySelector('style')?.innerHTML);
  });
});
