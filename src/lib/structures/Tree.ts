export class TreeNode<T extends { id: string }> {
  public id: string;
  public data: T;
  public parent: TreeNode<T> | null = null;
  public children: TreeNode<T>[] = [];

  constructor(data: T) {
    this.id = data.id;
    this.data = data;
  }
}

export class Tree<T extends { id: string }> {
  public root: TreeNode<T> | null = null;

  constructor(rootData?: T) {
    if (rootData) {
      this.root = new TreeNode<T>(rootData);
    }
  }

  public find(id: string, node: TreeNode<T> | null = this.root): TreeNode<T> | null {
    if (!node) return null;
    if (node.id === id) return node;

    for (const child of node.children) {
      const result = this.find(id, child);
      if (result) return result;
    }

    return null;
  }

  public addChild(parentId: string, data: T): TreeNode<T> | null {
    const parentNode = this.find(parentId);
    if (!parentNode) return null;

    const childNode = new TreeNode<T>(data);
    childNode.parent = parentNode;
    parentNode.children.push(childNode);
    return childNode;
  }

  public removeChild(id: string): boolean {
    const node = this.find(id);
    if (!node || !node.parent) return false;

    const index = node.parent.children.findIndex((c) => c.id === id);
    if (index !== -1) {
      node.parent.children.splice(index, 1);
      return true;
    }
    return false;
  }

  public traverseDFS(callback: (node: TreeNode<T>) => void, node: TreeNode<T> | null = this.root): void {
    if (!node) return;
    callback(node);
    for (const child of node.children) {
      this.traverseDFS(callback, child);
    }
  }

  public traverseBFS(callback: (node: TreeNode<T>) => void): void {
    if (!this.root) return;
    const queue: TreeNode<T>[] = [this.root];

    while (queue.length > 0) {
      const current = queue.shift()!;
      callback(current);
      for (const child of current.children) {
        queue.push(child);
      }
    }
  }
}
