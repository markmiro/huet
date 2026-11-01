/** shadcn's Select on Base UI, with a themed chevron and list. */
export declare function Select<T extends string>({ label, value, onValueChange, options, describe, }: {
    label: string;
    value: T;
    onValueChange: (value: T) => void;
    options: readonly T[];
    /** Extra text after an option, such as "(default)" */
    describe?: (option: T) => string | undefined;
}): import('react').JSX.Element;
