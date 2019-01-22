export class BinaryTree {
  public root: BinaryNode;

  private xmlDocument: Document;

  constructor(diagramXML: string) {
    const parser = new DOMParser();
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
}

export class BinaryNode {
  public tree: BinaryTree;
  public parent: BinaryNode;
  public leftChild: BinaryNode;
  public rightChid: BinaryNode;
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
        this.parent.rightChid = sequenceFlowNode;
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
    sequenceFlowNode.rightChid = destinationNode;
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
}
