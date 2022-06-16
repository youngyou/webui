import { NestedTreeControl } from '@angular/cdk/tree';
import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, TrackByFunction,
} from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { Dataset } from 'app/interfaces/dataset.interface';
import { IxNestedTreeDataSource } from 'app/modules/ix-tree/ix-tree-nested-datasource';
import { DatasetNode } from 'app/pages/datasets/components/dataset-management/dataset-node.interface';
import { AppLoaderService, WebSocketService } from 'app/services';

@UntilDestroy()
@Component({
  selector: 'ix-dataset-management',
  templateUrl: './dataset-management.component.html',
  styleUrls: ['./dataset-management.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatasetsManagementComponent implements OnInit {
  selectedDataset: Dataset; // Dataset to be passed as input for card components
  dataSource: IxNestedTreeDataSource<DatasetNode>;
  readonly trackByFn: TrackByFunction<DatasetNode> = (_, node) => node.item.id;
  treeControl = new NestedTreeControl<DatasetNode, string>((node) => node.children, {
    trackBy: (dataNode: DatasetNode) => dataNode.item.id,
  });
  readonly hasNestedChild = (_: number, node: DatasetNode): boolean => !!node.children?.length;

  constructor(
    private ws: WebSocketService,
    private cdr: ChangeDetectorRef,
    private loader: AppLoaderService, // TODO: Replace with a better approach
  ) {}

  ngOnInit(): void {
    this.loader.open();
    this.ws.call('pool.dataset.query', [[], {
      extra: {
        flat: false,
        properties: [
          'name',
          'type',
          'used',
          'available',
          'mountpoint',
          'encrypted',
        ],
      },
      order_by: ['name'],
    }]).pipe(
      untilDestroyed(this),
    ).subscribe(
      (datasets: Dataset[]) => {
        this.createDataSource(datasets);
        this.expandFirstDataset();
        this.loader.close();
        this.cdr.markForCheck();
      },
      (err) => {
        console.error(err);
        this.loader.close();
      },
    );
  }

  expandFirstDataset(): void {
    if (!this.treeControl.dataNodes.length) {
      return;
    }
    const node = this.treeControl.dataNodes[0];
    this.treeControl.expand(node);
    this.onDatasetSelected(node.item);
  }

  onSearch(query: string): void {
    // TODO: Make it reusable
    this.setChildVisibility(query, this.treeControl.dataNodes);
  }

  onDatasetSelected(dataset: Dataset): void {
    this.selectedDataset = dataset;
  }

  private getDatasetNode(dataset: Dataset): DatasetNode {
    const nameSegments = dataset.name.split('/');

    return {
      label: nameSegments[nameSegments.length - 1],
      children: dataset.children?.length ? dataset.children.map((child) => this.getDatasetNode(child)) : [],
      item: dataset,
      icon: this.getDatasetIcon(dataset),
      visible: true,
      extra: {
        roles: ['Dataset', `L${nameSegments.length}`],
      },
    };
  }

  private getDatasetIcon(dataset: Dataset): string {
    const level = dataset.name.split('/').length;
    if (level === 1) {
      return 'device_hub';
    } if (level > 1 && dataset.children.length) {
      return 'folder';
    }
    return 'mdi-database';
  }

  private getDatasetTree(datasets: Dataset[]): DatasetNode[] {
    return datasets.map((dataset) => {
      const node = this.getDatasetNode(dataset);
      this.setParent(node, null);
      return node;
    });
  }

  private setParent(node: DatasetNode, parent: DatasetNode): void {
    node.parent = parent;
    if (node.children) {
      node.children.forEach((child) => {
        this.setParent(child, node);
      });
    }
  }

  private createDataSource(datasets: Dataset[]): void {
    const dataNodes = this.getDatasetTree(datasets);
    this.dataSource = new IxNestedTreeDataSource<DatasetNode>(dataNodes);
    this.treeControl.dataNodes = dataNodes;
  }

  setChildVisibility(text: string, nodes: DatasetNode[]): void {
    nodes.forEach((node) => {
      node.visible = node.label.includes(text);
      if (node.parent) {
        this.setParentVisibility(text, node.parent, node.visible);
      }
      if (node.children) {
        this.setChildVisibility(text, node.children);
        if (node.visible && text.length > 1) {
          this.treeControl.expand(node);
        }
      }
    });
  }

  setParentVisibility(text: string, node: DatasetNode, visible: boolean): void {
    node.visible = visible || node.visible || node.label.includes(text);
    if (node.parent) {
      this.setParentVisibility(text, node.parent, node.visible);
    }
  }
}
