/**
 * High-performance O(1) Entity Map structure wrapping JS Map
 */
export class EntityMap<T extends { id: string }> {
  private map: Map<string, T>;

  constructor(initialItems: T[] = []) {
    this.map = new Map<string, T>();
    for (const item of initialItems) {
      this.set(item);
    }
  }

  public set(item: T): void {
    this.map.set(item.id, item);
  }

  public get(id: string): T | undefined {
    return this.map.get(id);
  }

  public has(id: string): boolean {
    return this.map.has(id);
  }

  public delete(id: string): boolean {
    return this.map.delete(id);
  }

  public values(): T[] {
    return Array.from(this.map.values());
  }

  public keys(): string[] {
    return Array.from(this.map.keys());
  }

  public clear(): void {
    this.map.clear();
  }

  public get size(): number {
    return this.map.size;
  }
}
