import { log } from "cc";

export class BinarySearchTreeNode<T> {
    data: T;
    leftNode?: BinarySearchTreeNode<T>;
    rightNode?: BinarySearchTreeNode<T>;
  
    constructor(data: T) {
      this.data = data;
    }
}

export class BinarySearchTree<T> {
    root?: BinarySearchTreeNode<T>;
    comparator:Function;
  
    constructor(comparator:Function = (a: number, b: number):number=>{
        if (a < b) return -1;
      
        if (a > b) return 1;
      
        return 0;
      }) {
      this.comparator = comparator;
    }
  
    insert(data: T): BinarySearchTreeNode<T> | undefined {
      if (!this.root) {
        this.root = new BinarySearchTreeNode(data);
        return this.root;
      }
  
      let current = this.root;
  
      while (true) {
        if (this.comparator(data, current.data) === 1) {
          if (current.rightNode) {
            current = current.rightNode;
          } else {
            current.rightNode = new BinarySearchTreeNode(data);
            return current.rightNode;
          }
        } else {
          if (current.leftNode) {
            current = current.leftNode;
          } else {
            current.leftNode = new BinarySearchTreeNode(data);
            return current.leftNode;
          }
        }
      }
    }
  
    search(data: T): BinarySearchTreeNode<T> | undefined {
      if (!this.root) return undefined;
  
      let current = this.root;
  
      while (this.comparator(data, current.data) !== 0) {
        if (this.comparator(data, current.data) === 1) {
          if (!current.rightNode) return;
  
          current = current.rightNode;
        } else {
          if (!current.leftNode) return;
  
          current = current.leftNode;
        }
      }
  
      return current;
    }
  
    inOrderTraversal(node: BinarySearchTreeNode<T> | undefined): void {
      if (node) {
        this.inOrderTraversal(node.leftNode);
        log(node.data);
        this.inOrderTraversal(node.rightNode);
      }
    }
  
    preOrderTraversal(node: BinarySearchTreeNode<T> | undefined): void {
      if (node) {
        log(node.data);
        this.preOrderTraversal(node.leftNode);
        this.preOrderTraversal(node.rightNode);
      }
    }
  
    postOrderTraversal(node: BinarySearchTreeNode<T> | undefined): void {
      if (node) {
        this.postOrderTraversal(node.leftNode);
        this.postOrderTraversal(node.rightNode);
        log(node.data);
      }
    }
  }