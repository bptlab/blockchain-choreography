const diagram = `
<?xml version="1.0" encoding="UTF-8"?>
<bpmn2:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:ext="http://org.eclipse.bpmn2/ext" xmlns:xs="http://www.w3.org/2001/XMLSchema" id="_IY9V4K1UEeiUxPrhBUWPfA" exporter="org.eclipse.bpmn2.modeler.core" exporterVersion="1.4.3.Final-v20180418-1358-B1">
  <bpmn2:message id="Message_135e77n" />
  <bpmn2:choreography id="_SfwmwK1UEeiUxPrhBUWPfA">
    <bpmn2:participant id="_pXE8wK1UEeiUxPrhBUWPfA" name="RolleA" />
    <bpmn2:participant id="_pXE8wa1UEeiUxPrhBUWPfA" name="RolleB" />
    <bpmn2:messageFlow id="MessageFlow_12866k5" sourceRef="_pXE8wK1UEeiUxPrhBUWPfA" targetRef="_pXE8wa1UEeiUxPrhBUWPfA" messageRef="Message_135e77n" />
    <bpmn2:choreographyTask id="ChoreographyTask_104xx79" name="New Activity" initiatingParticipantRef="_pXE8wK1UEeiUxPrhBUWPfA">
      <bpmn2:participantRef>_pXE8wK1UEeiUxPrhBUWPfA</bpmn2:participantRef>
      <bpmn2:participantRef>_pXE8wa1UEeiUxPrhBUWPfA</bpmn2:participantRef>
      <bpmn2:messageFlowRef>MessageFlow_12866k5</bpmn2:messageFlowRef>
    </bpmn2:choreographyTask>
  </bpmn2:choreography>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_Choreography_1" bpmnElement="_SfwmwK1UEeiUxPrhBUWPfA">
      <bpmndi:BPMNShape id="ChoreographyTask_104xx79_di" bpmnElement="ChoreographyTask_104xx79">
        <dc:Bounds x="504" y="247" width="163" height="118" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="BPMNShape_0ned88v" bpmnElement="_pXE8wK1UEeiUxPrhBUWPfA" isMessageVisible="false" participantBandKind="top_initiating" choreographyActivityShape="ChoreographyTask_104xx79_di">
        <dc:Bounds x="504" y="247" width="163" height="20" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="BPMNShape_1n35zqv" bpmnElement="_pXE8wa1UEeiUxPrhBUWPfA" isMessageVisible="false" participantBandKind="bottom_non_initiating" choreographyActivityShape="ChoreographyTask_104xx79_di">
        <dc:Bounds x="504" y="345" width="163" height="20" />
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
    <bpmndi:BPMNLabelStyle id="BPMNLabelStyle_1">
      <dc:Font name="arial" size="9" />
    </bpmndi:BPMNLabelStyle>
  </bpmndi:BPMNDiagram>
</bpmn2:definitions>
`;

export default diagram;
