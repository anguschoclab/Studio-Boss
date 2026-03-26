import React from 'react';
import { render } from '@testing-library/react';
import { ChartStyle } from './src/components/ui/chart.tsx';

const id = 'test-chart';
const config = {
  malicious: {
    color: 'red; }</style><script>alert("xss")</script><style>{',
  },
};

const { container } = render(<ChartStyle id={id} config={config} />);
console.log(container.querySelector('style').innerHTML);
