import React from 'react';

/**
 * Optimized SVG Icon collection for the Studio Boss shell.
 * Replaces 'lucide-react' in the core bundle to shred ~30kB of SVG strings
 * and library overhead from the initial payload.
 */

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

const Base_Icon_Wrapper = ({ children, size = 20, ...props }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {children}
  </svg>
);

export const DashboardIcon = (props: IconProps) => (
  <Base_Icon_Wrapper {...props}>
    <rect width="7" height="9" x="3" y="3" rx="1" />
    <rect width="7" height="5" x="14" y="3" rx="1" />
    <rect width="7" height="9" x="14" y="12" rx="1" />
    <rect width="7" height="5" x="3" y="16" rx="1" />
  </Base_Icon_Wrapper>
);

export const FilmIcon = (props: IconProps) => (
  <Base_Icon_Wrapper {...props}>
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <path d="M7 3v18" /><path d="M17 3v18" /><path d="M3 7h4" /><path d="M3 12h4" /><path d="M3 17h4" /><path d="M17 7h4" /><path d="M17 12h4" /><path d="M17 17h4" />
  </Base_Icon_Wrapper>
);

export const LibraryIcon = (props: IconProps) => (
  <Base_Icon_Wrapper {...props}>
    <path d="m16 6 4 14" /><path d="M12 6v14" /><path d="M8 8v12" /><path d="M4 4v16" />
  </Base_Icon_Wrapper>
);

export const HandshakeIcon = (props: IconProps) => (
  <Base_Icon_Wrapper {...props}>
    <path d="m11 17 2 2 1.5-1.5" /><path d="m9 14 2 2 6-6" /><path d="M11 17 9 15" /><path d="m18 10 1-1" />
    <path d="M11 15.5H8.7c-.7 0-1.3-.3-1.8-.8c-.2-.2-.5-.4-.7-.5c-1-.7-2.3-.9-3.4-.6l-.7.2c-.2 0-.4 0-.5.2" />
    <path d="M17.4 13.5c-.2.2-.4.5-.5.7c-.5.5-.8 1.1-.8 1.8V19" />
  </Base_Icon_Wrapper>
);

export const GlobeIcon = (props: IconProps) => (
  <Base_Icon_Wrapper {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a14.5 14.5 0 0 0 0 20" /><path d="M2 12h20" />
  </Base_Icon_Wrapper>
);

export const UsersIcon = (props: IconProps) => (
  <Base_Icon_Wrapper {...props}>
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </Base_Icon_Wrapper>
);

export const BriefcaseIcon = (props: IconProps) => (
  <Base_Icon_Wrapper {...props}>
    <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    <rect width="20" height="14" x="2" y="6" rx="2" />
  </Base_Icon_Wrapper>
);

export const NewspaperIcon = (props: IconProps) => (
  <Base_Icon_Wrapper {...props}>
    <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
    <path d="M18 14h-8" /><path d="M15 18h-5" /><path d="M10 6h8v4h-8V6Z" />
  </Base_Icon_Wrapper>
);

export const TvIcon = (props: IconProps) => (
  <Base_Icon_Wrapper {...props}>
    <rect width="20" height="15" x="2" y="7" rx="2" />
    <path d="m8 2 4 5 4-5" />
  </Base_Icon_Wrapper>
);

export const BarChartIcon = (props: IconProps) => (
  <Base_Icon_Wrapper {...props}>
    <path d="M3 3v18h18" /><path d="M7 16v-4" /><path d="M11 16V9" /><path d="M15 16V5" /><path d="M19 16V12" />
  </Base_Icon_Wrapper>
);

export const ChevronLeftIcon = (props: IconProps) => (
  <Base_Icon_Wrapper {...props}>
    <path d="m15 18-6-6 6-6" />
  </Base_Icon_Wrapper>
);

export const ChevronRightIcon = (props: IconProps) => (
  <Base_Icon_Wrapper {...props}>
    <path d="m9 18 6-6-6-6" />
  </Base_Icon_Wrapper>
);

export const LogOutIcon = (props: IconProps) => (
  <Base_Icon_Wrapper {...props}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" x2="9" y1="12" y2="12" />
  </Base_Icon_Wrapper>
);

export const SettingsIcon = (props: IconProps) => (
  <Base_Icon_Wrapper {...props}>
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </Base_Icon_Wrapper>
);

export const SaveIcon = (props: IconProps) => (
  <Base_Icon_Wrapper {...props}>
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
  </Base_Icon_Wrapper>
);

export const FastForwardIcon = (props: IconProps) => (
  <Base_Icon_Wrapper {...props}>
    <polygon points="13 19 22 12 13 5 13 19" /><polygon points="2 19 11 12 2 5 2 19" />
  </Base_Icon_Wrapper>
);

export const AlertTriangleIcon = (props: IconProps) => (
  <Base_Icon_Wrapper {...props}>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><line x1="12" x2="12" y1="9" y2="13" /><line x1="12" x2="12.01" y1="17" y2="17" />
  </Base_Icon_Wrapper>
);

export const TrendingUpIcon = (props: IconProps) => (
  <Base_Icon_Wrapper {...props}>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
  </Base_Icon_Wrapper>
);

export const ZapIcon = (props: IconProps) => (
  <Base_Icon_Wrapper {...props}>
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </Base_Icon_Wrapper>
);

export const CoinsIcon = (props: IconProps) => (
  <Base_Icon_Wrapper {...props}>
    <circle cx="8" cy="8" r="6" /><path d="M18.09 10.37A6 6 0 1 1 10.34 18" /><path d="M7 6h1v4" /><path d="m16.71 13.88.7.71-2.82 2.82" />
  </Base_Icon_Wrapper>
);

export const TrophyIcon = (props: IconProps) => (
  <Base_Icon_Wrapper {...props}>
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </Base_Icon_Wrapper>
);

export const HistoryIcon = (props: IconProps) => (
  <Base_Icon_Wrapper {...props}>
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M12 7v5l4 2" />
  </Base_Icon_Wrapper>
);
