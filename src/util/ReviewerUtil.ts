import { BinaryTree, BinaryNode, ChoreographyTaskNodeData } from './ModelUtil';

export class ReviewerAnalyer {

  public static analyzeTree(tree: BinaryTree, alteredNode: BinaryNode, confidenceLevel: ReviewerAnalyer.ConfidenceLevel): string[] {
    switch(confidenceLevel) {
      case ReviewerAnalyer.ConfidenceLevel.Direct: {
        return ReviewerAnalyer.analyzeDirectControl(tree, alteredNode);
      }
      case ReviewerAnalyer.ConfidenceLevel.Neighbor: {
        return ReviewerAnalyer.analyzeNeighborControl(tree, alteredNode);
      }
      case ReviewerAnalyer.ConfidenceLevel.Subsequent: {
        return ReviewerAnalyer.analyzeSubsequentControl(tree, alteredNode);
      }
      case ReviewerAnalyer.ConfidenceLevel.Path: {
        return ReviewerAnalyer.analyzePathControl(tree, alteredNode);
      }
      case ReviewerAnalyer.ConfidenceLevel.Total: {
        return ReviewerAnalyer.analyzeTotalControl(tree, alteredNode);
      }
      default: {
        return ReviewerAnalyer.analyzeTotalControl(tree, alteredNode);
      }
    }

    return [];
  }

  public static analyzeDirectControl(tree: BinaryTree, alteredNode: BinaryNode): string[] {
    return alteredNode.getAllParticipants();
  }
  public static analyzeNeighborControl(tree: BinaryTree, alteredNode: BinaryNode): string[] {
    return [];
  }
  public static analyzeSubsequentControl(tree: BinaryTree, alteredNode: BinaryNode): string[] {
    let tasks = [alteredNode];
    let currentNode = alteredNode;
    while (currentNode.parent) {
      //Check if node is a AND node, if so, we need to include it in reviewers
      if (currentNode.parent.isAndNode()) {
        tasks.concat(tree.getAllTaskNodesFrom(currentNode.parent))
      }
      // If it's a flow node and we're coming from left, add all right childs as they are subsequent elements
      if (currentNode.parent.isFlowNode() && currentNode.isLeftChild()) {
        tasks.concat(tree.getAllTaskNodesFrom(currentNode.parent.rightChild));
      }
      currentNode = currentNode.parent;
    }

    return tasks.map((node) => {
      return node.getAllParticipants();
    });
  }
  public static analyzePathControl(tree: BinaryTree, alteredNode: BinaryNode): string[] {
    let tasks = tree.getAllTaskNodesFrom(tree.root);
    let currentNode = alteredNode;
    //Go up from alteredNode to check, whether it is in a XOR Branch until we find the root node
    while (currentNode.parent) {
      if (currentNode.parent.isXorNode()) {
        let nodesToRemove = [];
        if (currentNode.isLeftChild()) {
          nodesToRemove = tree.getAllTaskNodesFrom(currentNode.parent.rightChild);
        }
        else {
          nodesToRemove = tree.getAllTaskNodesFrom(currentNode.parent.leftChild);
        }
        for (const nodeToRemove of nodesToRemove) {
          tasks = tasks.filter((node) => {
            if (node.equals(nodeToRemove)) {
              return false;
            }
            return true;
          });
        }
      }
      currentNode = currentNode.parent;
    }

    return tasks.map((node) => {
      return node.getAllParticipants()
    });
  }
  public static analyzeTotalControl(tree: BinaryTree, alteredNode: BinaryNode): string[] {
    return tree.getAllTaskNodesFrom(tree.root).map((node) => {
      return node.getAllParticipants();
    });
  }
}

export namespace ReviewerAnalyer {
  export enum ConfidenceLevel {
    Direct,
    Neighbor,
    Subsequent,
    Path,
    Total
  }
}
