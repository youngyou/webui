import { Dataset } from 'app/interfaces/dataset.interface';
import { IxTreeNode } from 'app/modules/ix-tree/interfaces/ix-tree-node.interface';

interface DatasetNodeExtra {
  roles: string[];
}

export type DatasetNode = IxTreeNode<Dataset, DatasetNodeExtra>;
