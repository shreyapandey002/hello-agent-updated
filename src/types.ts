export interface UseCaseTab {
  id: string;
  name: string;
  email: string;
  incomingRequest: string;
  connectedSystems: string[];
  backgroundTask: string;
  finalResponse: string;
}

export interface AgentIdentity {
  role: string;
  email: string;
  managerCc: string;
  connectedSystems: string[];
  tasks: string[];
  status: 'Active' | 'Idle' | 'Processing';
}

export interface IntegrationCard {
  name: string;
  actions: string;
  icon: string;
}

export interface SandboxStage {
  id: number;
  label: string;
  detail: string;
}
