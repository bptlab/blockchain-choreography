import ChoreoModeler from "chor-js";
import * as React from "react";

import diagram from "@/util/default-diagram";
import { BinaryTree } from "@/util/ModelUtil";

const DiagramWidgetStyles = require("./DiagramWidget.css");
require("diagram-js/assets/diagram-js.css");
require("bpmn-js/dist/assets/bpmn-font/css/bpmn.css");
require("chor-js/assets/font/include/css/choreography.css");

interface IDiagramWidgetProps {
  diagramXML: string;
}

interface IDiagramWidgetState {
  modeler: any;
}

export default class DiagramWidget extends React.Component<IDiagramWidgetProps, IDiagramWidgetState> {

  constructor(props) {
    super(props);

    this.state = {
      modeler: undefined,
    };

    this.handleConvertToTree = this.handleConvertToTree.bind(this);
  }

  public componentDidMount() {
    const modeler = new ChoreoModeler({
      container: "#canvas",
      keyboard: {
        bindTo: document,
      },
    });

    this.setState({
      modeler,
    });
  }

  public componentDidUpdate() {
    const diagramXML = this.props.diagramXML === "" ? diagram : this.props.diagramXML;
    console.log("new XML!");
    console.log(diagramXML);

    this.state.modeler.importXML(diagramXML, (err) => {
      if (err) {
        console.error("something went wrong:", err);
      }

      this.state.modeler.get("canvas").zoom("fit-viewport");
    });
  }

  public getDiagramXML(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.state.modeler.saveXML({ format: true }, (err, xml) => {
        if (err !== undefined) {
          console.log(err);
          reject(err);
        } else {
          resolve(xml);
        }
      });
    });
  }

  public async handleConvertToTree() {
    const xml = await this.getDiagramXML();
    const binaryTree = new BinaryTree(xml);
    console.log(binaryTree);
  }

  public render() {
    console.log("rerendering");
    return (
      <div className={DiagramWidgetStyles.DiagramWidget}>
        <div className={DiagramWidgetStyles.Diagram} id="canvas" />
        <a href="#" onClick={this.handleConvertToTree}>Convert to Binary tree</a>
      </div>
    );
  }
}
