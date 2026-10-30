import { default as React } from 'react';
export default function Input({ label, value, onChange, className, ...rest }: {
    label?: string;
    value?: string;
    onChange?: (value: string) => void;
    className?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value" | "className">): React.JSX.Element;
