import { colors } from '~client/styled/variables';

export const breakpoint = (size) => `@media only screen and (min-width: ${size}px)`;

export const diagonalBg = (size = 16) => `
    background-image: linear-gradient(45deg,
        ${colors['translucent-l2']} 25%,
        transparent 25%,
        transparent 50%,
        ${colors['translucent-l2']} 50%,
        ${colors['translucent-l2']} 75%,
        transparent 75%,
        transparent 0
    );
    background-size: ${size}px ${size}px;
`;
