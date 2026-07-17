import { UseCaseTab, AgentIdentity, IntegrationCard, SandboxStage } from './types';

export const USE_CASE_TABS: UseCaseTab[] = [
  {
    id: 'operations',
    name: 'Operations Agent',
    email: 'ops-agent@helloagent.ai',
    incomingRequest: 'Check vendor delivery status, update the order record, and reply with the delay reason.',
    connectedSystems: ['ERP', 'Vendor DB'],
    backgroundTask: 'Querying shipping status from Vendor Database, writing updated logs to ERP, and computing estimated delivery date.',
    finalResponse: 'Order updated. Delay reason recorded. Response sent.'
  },
  {
    id: 'finance',
    name: 'Finance Agent',
    email: 'finance-agent@helloagent.ai',
    incomingRequest: 'Check attached invoice, update payment status, and send pending amount summary.',
    connectedSystems: ['ERP', 'Accounting DB', 'Invoice Store'],
    backgroundTask: 'Parsing attached PDF invoice, cross-referencing against ERP accounting ledger, and adjusting transaction records to partially paid.',
    finalResponse: 'Invoice record updated. Pending amount summarised. Response sent.'
  },
  {
    id: 'sales',
    name: 'Sales Agent',
    email: 'sales-agent@helloagent.ai',
    incomingRequest: 'Check this lead, enrich company details, update CRM, and send a follow-up draft.',
    connectedSystems: ['CRM', 'Company Database'],
    backgroundTask: 'Fetching domain statistics, updating sales pipeline stage in CRM, and compiling customized intro message.',
    finalResponse: 'Lead enriched. CRM updated. Follow-up sent.'
  },
  {
    id: 'hr',
    name: 'HR Agent',
    email: 'hr-agent@helloagent.ai',
    incomingRequest: 'Review this candidate profile, update ATS, and send screening summary.',
    connectedSystems: ['ATS', 'HR Database'],
    backgroundTask: 'Analyzing experience relevance from applicant profile, updating candidate status in ATS, and preparing evaluation report.',
    finalResponse: 'Candidate record updated. Screening summary sent.'
  },
  {
    id: 'support',
    name: 'Support Agent',
    email: 'support-agent@helloagent.ai',
    incomingRequest: 'Check customer issue status, update ticket, and reply with resolution.',
    connectedSystems: ['Ticketing System', 'Knowledge Base'],
    backgroundTask: 'Retrieving incident log from ticketing service, querying troubleshooting docs from Knowledge Base, and executing resolved flag.',
    finalResponse: 'Ticket updated. Resolution response sent.'
  },
  {
    id: 'logistics',
    name: 'Logistics Agent',
    email: 'logistics-agent@helloagent.ai',
    incomingRequest: 'Track shipment, update delivery status, and inform customer.',
    connectedSystems: ['ERP', 'Tracking System'],
    backgroundTask: 'Retrieving carrier shipment coordinates, synchronizing fulfillment state in ERP, and drafting status email.',
    finalResponse: 'Shipment status updated. Customer notified.'
  }
];

export const AGENT_IDENTITIES: AgentIdentity[] = [
  {
    role: 'Finance Agent',
    email: 'finance-agent@company.com',
    managerCc: 'finance.manager@company.com',
    connectedSystems: ['ERP', 'Accounting DB', 'Invoice Store'],
    tasks: ['Invoice summaries', 'Payment updates', 'Pending amount checks'],
    status: 'Active'
  },
  {
    role: 'Operations Agent',
    email: 'ops-agent@company.com',
    managerCc: 'ops.manager@company.com',
    connectedSystems: ['ERP', 'Vendor DB', 'Inventory API'],
    tasks: ['Vendor delivery checks', 'Order status updates', 'Fulfillment syncing'],
    status: 'Active'
  },
  {
    role: 'Support Agent',
    email: 'support-agent@company.com',
    managerCc: 'support.lead@company.com',
    connectedSystems: ['Ticketing System', 'Knowledge Base', 'Customer DB'],
    tasks: ['Issue resolution', 'Customer status checking', 'Ticket updating'],
    status: 'Active'
  },
  {
    role: 'HR Agent',
    email: 'hr-agent@company.com',
    managerCc: 'talent.partner@company.com',
    connectedSystems: ['ATS', 'HR Database', 'Resume Store'],
    tasks: ['Candidate profile reviews', 'Screening summaries', 'ATS logging'],
    status: 'Active'
  },
  {
    role: 'Logistics Agent',
    email: 'logistics-agent@company.com',
    managerCc: 'dispatch.lead@company.com',
    connectedSystems: ['ERP', 'Tracking System', 'Shipping APIs'],
    tasks: ['Shipment tracking', 'Delivery status updates', 'Customer notifications'],
    status: 'Active'
  }
];

export const INTEGRATION_CARDS: IntegrationCard[] = [
  {
    name: 'ERP',
    actions: 'Read orders, update statuses, fetch invoices.',
    icon: 'Layers'
  },
  {
    name: 'Database',
    actions: 'Query records, update fields, sync structured data.',
    icon: 'Database'
  },
  {
    name: 'CRM',
    actions: 'Create leads, update opportunity stages, log email interactions.',
    icon: 'Users'
  },
  {
    name: 'Ticketing System',
    actions: 'Create tickets, update status, send resolution.',
    icon: 'Ticket'
  },
  {
    name: 'Accounting Software',
    actions: 'Summarise invoices, update payment state, flag dues.',
    icon: 'CreditCard'
  },
  {
    name: 'Knowledge Base',
    actions: 'Retrieve policy, product, and process answers.',
    icon: 'BookOpen'
  },
  {
    name: 'File Storage',
    actions: 'Parse attachments, store receipts, retrieve documents.',
    icon: 'FolderOpen'
  },
  {
    name: 'Internal APIs',
    actions: 'Trigger custom actions, sync inventory, ping services.',
    icon: 'Cpu'
  }
];

export const SANDBOX_STAGES: SandboxStage[] = [
  { id: 1, label: 'Email received', detail: 'Received shipment query from anita@clientcompany.com' },
  { id: 2, label: 'Intent detected', detail: 'Identified request as Shipment Inquiry & Invoice Update' },
  { id: 3, label: 'Connected ERP', detail: 'Opened secure read/write channel to ERP system' },
  { id: 4, label: 'Shipment record retrieved', detail: 'Located shipment MS-4821. Current status: In Transit' },
  { id: 5, label: 'Invoice status updated', detail: 'Adjusted ERP status of record INV-4821 to "Partially Paid"' },
  { id: 6, label: 'Database synced', detail: 'Committed ledger sync in master transaction database' },
  { id: 7, label: 'Manager copied', detail: 'Automatically CC\'d manager@clientcompany.com on response thread' },
  { id: 8, label: 'Response sent', detail: 'Dispatched completion email response to sender and CC list' }
];

export const FEATURES_LIST = [
  { title: 'Dedicated agent email identities', desc: 'Establish unique, fully custom-domain operational email addresses.' },
  { title: 'Background task execution', desc: 'No portals, no dashboards. Agents resolve tasks in the background autonomously.' },
  { title: 'Email intent detection', desc: 'Instantly categorize incoming text and map them to targeted workflows.' },
  { title: 'Attachment understanding', desc: 'Parse PDFs, spreadsheets, invoices, and documents to pull vital parameters.' },
  { title: 'ERP connectivity', desc: 'Read and update internal enterprise resources safely via secured workflows.' },
  { title: 'Database updates', desc: 'Query and sync structured tables to keep business records fully in step.' },
  { title: 'CRM sync', desc: 'Log interactions, update lead pipeline stages, and enrich prospect profiles.' },
  { title: 'Multi-agent workflows', desc: 'Chains of specialized agents coordinate and delegate tasks among themselves.' },
  { title: 'Internal manager CC', desc: 'Stay updated by being marked on agent threads without acting as an operational gatekeeper.' },
  { title: 'Thread-aware responses', desc: 'Context-aware interaction tracking that maintains knowledge of historical exchanges.' },
  { title: 'Custom business instructions', desc: 'Inject specific operational playbooks and rules that govern agent action.' },
  { title: 'System-specific actions', desc: 'Execute precise writes, syncs, or custom API lookups across internal infrastructure.' },
  { title: 'Structured data extraction', desc: 'Extract unstructured email context into validated JSON structures.' },
  { title: 'Response generation', desc: 'Compile clear, professional email replies with dynamic variables.' },
  { title: 'Pluggable integrations', desc: 'Ready-to-go connectors for your database, ERP, CRM, and SaaS software.' },
  { title: 'Audit-ready activity trails', desc: 'Examine complete background runtime traces, query details, and replies.' },
  { title: 'Custom domain support', desc: 'Integrate agents under your company\'s verified, professional domain name.' },
  { title: 'Department-specific agents', desc: 'Deploy tailored agents for Finance, Ops, HR, Sales, Logistics, and more.' }
];

export const FAQ_LIST = [
  {
    q: 'Is Hello Agent a chatbot?',
    a: 'No. Hello Agent works through email. Users send normal emails to an agent address, and the agent runs the task in the background before replying with the result.'
  },
  {
    q: 'Does the user need to open a dashboard?',
    a: 'No. The user can simply send an email and await the response. Dashboards can exist for configuration and monitoring, but the workflow starts from email.'
  },
  {
    q: 'Can Hello Agent connect to our ERP or database?',
    a: 'Yes. Hello Agent can be configured to connect with ERP, database, CRM, ticketing, accounting, or internal systems depending on the client setup and available access.'
  },
  {
    q: 'Can the agent update information in our systems?',
    a: 'Yes. Agents can be configured to retrieve, update, and sync information within connected systems based on defined workflow rules and permissions.'
  },
  {
    q: 'Can every agent have a manager copied on emails?',
    a: 'Yes. Each agent can have a dedicated internal manager or team email that is automatically marked in CC for relevant communication.'
  },
  {
    q: 'Can we create multiple agents?',
    a: 'Yes. Teams can create multiple specialised agents for operations, finance, HR, sales, support, logistics, reporting, and other workflows.'
  },
  {
    q: 'Can agents work together?',
    a: 'Yes. Multi-agent setups can be created where specialised agents coordinate across related tasks.'
  },
  {
    q: 'Can we use our own domain?',
    a: 'Yes. Agent addresses can be configured around business-specific identities and custom domains depending on setup.'
  },
  {
    q: 'Is Hello Agent available today?',
    a: 'Yes. Hello Agent is pluggable today for defined workflows, with integrations configured based on the client’s systems and requirements.'
  }
];
