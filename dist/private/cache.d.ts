export default class Cache {
    resetAtItemCount: number;
    cached: Map<unknown, unknown>;
    itemCount: number;
    tries: number;
    hits: number;
    constructor(resetAtItemCount?: number);
    set(path: readonly unknown[], value: unknown): void;
    get(path: readonly unknown[]): unknown;
    at<T>(path: readonly unknown[], func: () => T): T;
    log(): void;
    reset(): void;
}
