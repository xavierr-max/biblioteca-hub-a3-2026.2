import '@testing-library/jest-dom';

// React 19 uses this flag to recognize jsdom as an act-capable environment.
(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
