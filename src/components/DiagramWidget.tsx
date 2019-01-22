import ChoreoModeler from "chor-js";
import * as React from "react";

import diagram from "@/util/default-diagram";

const DiagramWidgetStyles = require("./DiagramWidget.css");
require("diagram-js/assets/diagram-js.css");
require("bpmn-js/dist/assets/bpmn-font/css/bpmn.css");
require("chor-js/assets/font/include/css/choreography.css");

interface IDiagramWidgetProps {
  diagramLocation: string;
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
  }

  public componentDidMount() {
    const modeler = new ChoreoModeler({
      container: "#canvas",
      keyboard: {
        bindTo: document,
      },
    });

    modeler.importXML(diagram, (err) => {
      if (err) {
        console.error("something went wrong:", err);
      }

      modeler.get("canvas").zoom("fit-viewport");
    });

    this.setState({
      modeler,
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

  public render() {
    return (
      <div className={DiagramWidgetStyles.DiagramWidget}>
        <div className={DiagramWidgetStyles.Diagram} id="canvas" />
      </div>
    );
  }
}
