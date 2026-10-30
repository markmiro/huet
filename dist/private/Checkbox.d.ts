export default function Checkbox({ label, value, onChange, className, }: {
    label?: string;
    value?: boolean;
    onChange?: (checked: boolean) => void;
    className?: string;
}): import('react').JSX.Element;
