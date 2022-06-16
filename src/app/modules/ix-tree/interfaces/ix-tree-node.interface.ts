type IxTreeNodeExtra = { [key: string]: unknown };

export interface IxTreeNode<T, K = IxTreeNodeExtra> {
  label: string;
  parent?: IxTreeNode<T, K>;
  children?: IxTreeNode<T, K>[];
  item: T;
  icon: string;
  visible?: boolean;
  extra?: K;
}
