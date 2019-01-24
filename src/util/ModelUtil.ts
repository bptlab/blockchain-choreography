export class BinaryTree {
  public root: BinaryNode;

  private xmlDocument: Document;

  constructor(diagramXML: string) {
    const parser = new DOMParser();
    console.log(diagramXML);
    this.xmlDocument = parser.parseFromString(diagramXML, "text/xml");
    this.convertDocumentToBinaryTree();
  }

  private convertDocumentToBinaryTree() {
    const sequenceFlows = this.getNodesFromTagName("bpmn2:sequenceFlow");
    const choreographyTasks = this.getNodesFromTagName("bpmn2:choreographyTask");

    if (choreographyTasks.length > 0) {
      this.root = choreographyTasks[0];
    }

    for (const sequenceFlow of sequenceFlows) {
      const sequenceFlowSource = choreographyTasks.find((task) => {
        return task.data.id === (sequenceFlow.data as SequenceFlowNodeData).sourceRef;
      });

      const sequenceFlowTarget = choreographyTasks.find((task) => {
        return task.data.id === (sequenceFlow.data as SequenceFlowNodeData).targetRef;
      });

      sequenceFlowSource.addOutgoingSequenceFlow(sequenceFlow, sequenceFlowTarget);
    }
  }

  private getNodesFromTagName(tagName: string): BinaryNode[] {
    const xmlElements = Array.from(this.xmlDocument.getElementsByTagName(tagName));
    return xmlElements.map((xmlElement) => {
      const nodeData = BpmnNodeDataFactory.createBpmnNodeData(xmlElement);
      return new BinaryNode(this, nodeData);
    });
  }

  public getAllTaskNodesFrom(startNode: BinaryNode): BinaryNode[] {
    // Check if start node is a task, if so, we are done (tasks can only be leafes)
    if (startNode.isTaskNode()) {
      return [startNode];
    }

    // Find all TaskNodes in tree, start with tree root
    const tasks = [];
    const discoveredNodes = [startNode];
    while (discoveredNodes.length > 0) {
      const currentNode = discoveredNodes.pop();
      // Check type of both childs: If task node, this is a leaf and can be added to known tasks. If flow, we add node to discoveredNodes and inspect it later
      for (const child of [currentNode.leftChild, currentNode.rightChild]) {
        if (child.isTaskNode()) {
          tasks.push(child);
        }
        if (child.isFlowNode()) {
          discoveredNodes.push(child);
        }
      }
    }
    return tasks;
  }
}

export class BinaryNode {
  public tree: BinaryTree;
  public parent: BinaryNode;
  public leftChild: BinaryNode;
  public rightChild: BinaryNode;
  public data: BpmnNodeData;

  constructor(tree: BinaryTree, data: BpmnNodeData) {
    this.tree = tree;
    this.data = data;
  }

  public addOutgoingSequenceFlow(sequenceFlowNode: BinaryNode, destinationNode: BinaryNode) {
    if (this.parent) {
      // Move sequence flow node in between own node and parent
      sequenceFlowNode.parent = this.parent;

      if (this.parent.leftChild === this) {
        this.parent.leftChild = sequenceFlowNode;
      } else {
        this.parent.rightChild = sequenceFlowNode;
      }
    }

    // Set sequence flow node as parent and correct tree root
    this.parent = sequenceFlowNode;
    if (this.tree.root === this) {
      this.tree.root = sequenceFlowNode;
    }

    // Set child nodes
    sequenceFlowNode.leftChild = this;
    destinationNode.parent = sequenceFlowNode;
    sequenceFlowNode.rightChild = destinationNode;
  }

  public isLeftChild(): boolean {
    return this.parent.leftChild.equals(this);
  }

  public isRightChild(): boolean {
    return this.parent.rightChild.equals(this);
  }

  public isFlowNode(): boolean {
    return (this.data instanceof SequenceFlowNodeData);
  }

  public isTaskNode(): boolean {
    return (this.data instanceof ChoreographyTaskNodeData);
  }

  public isXorNode(): boolean {
    // ToDo: Implement as soons as XOR nodes are supported.
    return false;
  }

  public isAndNode(): boolean {
    // ToDo: Implement as soons as XOR nodes are supported.
    return false;
  }

  public equals(node: BinaryNode):boolean {
    return (this.data.id === node.data.id);
  }
}

export class BpmnNodeDataFactory {
  public static createBpmnNodeData(xmlElement: Element): BpmnNodeData {
    if (xmlElement.tagName === "bpmn2:sequenceFlow") {
      return new SequenceFlowNodeData(xmlElement);
    } else if (xmlElement.tagName === "bpmn2:choreographyTask") {
      return new ChoreographyTaskNodeData(xmlElement);
    } else {
      return new BpmnNodeData(xmlElement);
    }
  }
}

export class BpmnNodeData {
  public id: string;
  public nodeType: string;

  constructor(xmlElement: Element) {
    this.id = xmlElement.getAttribute("id");
    this.nodeType = xmlElement.tagName;
  }
}

export class SequenceFlowNodeData extends BpmnNodeData {
  public sourceRef: string;
  public targetRef: string;

  constructor(xmlElement: Element) {
    super(xmlElement);
    this.sourceRef = xmlElement.getAttribute("sourceRef");
    this.targetRef = xmlElement.getAttribute("targetRef");
  }
}

export class ChoreographyTaskNodeData extends BpmnNodeData {
  public name: string;
  public initiatingParticipantRef: string;
  public incomingRef: string = "";
  public outgoingRef: string = "";
  public participantRefs: string[] = [];
  public messageFlowRef: string = "";

  constructor(xmlElement: Element) {
    super(xmlElement);
    this.name = xmlElement.getAttribute("name");
    this.initiatingParticipantRef = xmlElement.getAttribute("initiatingParticipantRef");

    const incomingElements = Array.from(xmlElement.getElementsByTagName("bpmn2:incoming"));
    if (incomingElements.length > 0) {
      this.incomingRef = incomingElements[0].textContent;
    }

    const outgoingElements = Array.from(xmlElement.getElementsByTagName("bpmn2:outgoing"));
    if (outgoingElements.length > 0) {
      this.outgoingRef = outgoingElements[0].textContent;
    }

    const messageFlowRefElements = Array.from(xmlElement.getElementsByTagName("bpmn2:messageFlowRef"));
    if (messageFlowRefElements.length > 0) {
      this.messageFlowRef = messageFlowRefElements[0].textContent;
    }

    this.participantRefs = Array.from(xmlElement.getElementsByTagName("bpmn2:participantRef")).map((element) => {
      return element.textContent;
    });
  }

  public getAllParticipants(): string[] {
    return [this.initiatingParticipantRef].concat(this.participantRefs);
  }
}
