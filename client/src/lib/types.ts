export interface TreeNode {
  type: 'directory' | 'note' | 'file';
  name: string;
  path: string;
  children?: TreeNode[];
  modified?: string;
}

export interface Note {
  path: string;
  name: string;
  title: string;
  content: string;
  modified: string;
  directory: string;
}
