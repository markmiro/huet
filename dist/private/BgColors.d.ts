import { Theme } from 'huet';
/**
 * Background positions to pick from, each previewed in the edited theme. Its
 * colors come from that theme, not the panel's, so they're set inline.
 */
export default function BgColors({ theme, background, onChange, }: {
    theme: Theme;
    background: number;
    onChange: (background: number) => void;
}): import('react').JSX.Element;
