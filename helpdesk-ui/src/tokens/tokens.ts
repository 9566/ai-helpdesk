// TypeScript mirror of design tokens for JS-driven logic
export const Colors = {
  primary:        '#1B2A4A',
  primaryHover:   '#26375F',
  accent:         '#C2761F',
  bg:             '#F6F7F9',
  surface:        '#FFFFFF',
  surfaceSunken:  '#EEF0F3',
  textPrimary:    '#151A23',
  textSecondary:  '#5B6472',
  border:         '#DEE2E8',
  success:        '#1E7A46',
  warning:        '#B8790F',
  error:          '#B3261E',
  info:           '#2461A8',
} as const;

export const PriorityColors: Record<string, string> = {
  Low:      '#5B6472',
  Medium:   '#2461A8',
  High:     '#B8790F',
  Critical: '#B3261E',
};

export const StatusColors: Record<string, { bg: string; text: string }> = {
  Open:        { bg: '#E8F0FA', text: '#2461A8' },
  'In Progress':{ bg: '#FEF3E2', text: '#B8790F' },
  Resolved:    { bg: '#E8F5EE', text: '#1E7A46' },
  Closed:      { bg: '#EEF0F3', text: '#5B6472' },
};
