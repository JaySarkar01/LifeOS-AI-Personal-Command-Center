export interface PriorityNode<T> {
  element: T;
  priority: number;
}

/**
 * Binary Heap Implementation of a Priority Queue (Max Heap by default)
 */
export class PriorityQueue<T> {
  private heap: PriorityNode<T>[] = [];
  private isMaxHeap: boolean;

  constructor(isMaxHeap: boolean = true) {
    this.isMaxHeap = isMaxHeap;
  }

  public enqueue(element: T, priority: number): void {
    const node: PriorityNode<T> = { element, priority };
    this.heap.push(node);
    this.bubbleUp(this.heap.length - 1);
  }

  public dequeue(): T | undefined {
    if (this.isEmpty()) return undefined;
    
    const root = this.heap[0];
    const last = this.heap.pop();
    
    if (this.heap.length > 0 && last !== undefined) {
      this.heap[0] = last;
      this.sinkDown(0);
    }
    
    return root.element;
  }

  public peek(): T | undefined {
    return this.heap[0]?.element;
  }

  public size(): number {
    return this.heap.length;
  }

  public isEmpty(): boolean {
    return this.heap.length === 0;
  }

  public clear(): void {
    this.heap = [];
  }

  private compare(a: number, b: number): boolean {
    return this.isMaxHeap ? a > b : a < b;
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.compare(this.heap[index].priority, this.heap[parentIndex].priority)) {
        [this.heap[index], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[index]];
        index = parentIndex;
      } else {
        break;
      }
    }
  }

  private sinkDown(index: number): void {
    const length = this.heap.length;
    while (true) {
      let target = index;
      const leftChildIndex = 2 * index + 1;
      const rightChildIndex = 2 * index + 2;

      if (
        leftChildIndex < length &&
        this.compare(this.heap[leftChildIndex].priority, this.heap[target].priority)
      ) {
        target = leftChildIndex;
      }

      if (
        rightChildIndex < length &&
        this.compare(this.heap[rightChildIndex].priority, this.heap[target].priority)
      ) {
        target = rightChildIndex;
      }

      if (target !== index) {
        [this.heap[index], this.heap[target]] = [this.heap[target], this.heap[index]];
        index = target;
      } else {
        break;
      }
    }
  }
}
