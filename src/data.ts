export const BUDGET = 75000000;
export const strategies = [
{id:'efficiency',name:'Operational Excellence',headline:'Win Through Efficiency',description:'Compete by delivering reliable, convenient and affordable CRM software at scale.',priorities:['Cost efficiency','Streamlined operations','Standardisation','Speed and convenience','Reliable service delivery'],promise:'Dependable CRM software without unnecessary complexity or cost.',market:80000,cost:42000,fulfilmentRate:0.75,fixedOperatingCost:150000000},
{id:'innovation',name:'Product Leadership',headline:'Win Through Innovation',description:'Compete by offering advanced technologies, distinctive product features and continuous innovation.',priorities:['Product innovation','Advanced AI functionality','Superior user experience','Research and development','Rapid development of new capabilities'],promise:'The next generation of intelligent CRM technology.',market:40000,cost:110000,fulfilmentRate:0.80,fixedOperatingCost:170000000},
{id:'relationships',name:'Customer Intimacy',headline:'Win Through Relationships',description:'Compete by understanding individual customer needs and offering personalised solutions, tailored support and long-term partnerships.',priorities:['Customisation','Personal relationships','Consultative selling','Customer support','Long-term customer success'],promise:'CRM solutions designed around your business.',market:10000,cost:130000,fulfilmentRate:0.90,fixedOperatingCost:170000000}
] as const;
export type StrategyId = typeof strategies[number]['id'];
const rows: [string,number,string][] = [
['Cloud Infrastructure Optimisation',6,'Improve the efficiency of cloud hosting, computing resources and software infrastructure to reduce operating costs.'],
['One-Click Customer Onboarding',4,'Develop a streamlined digital onboarding process allowing customers to activate and configure their CRM quickly.'],
['Self-Service Support Centre',3,'Develop an online knowledge base, automated help centre and customer self-service resources.'],
['Standard CRM Deployment Templates',5,'Create standardised CRM installation packages and implementation templates to accelerate deployment.'],
['AI Support-Ticket Triage',4,'Implement AI-assisted support classification and ticket routing to improve response efficiency.'],
['Continuous Delivery and Testing',6,'Automate software testing and release processes to improve reliability and reduce deployment time.'],
['Standard Service-Package Design',3,'Simplify and standardise CRM service packages to reduce operational complexity.'],
['Supplier and Licence Consolidation',5,'Streamline technology suppliers and software licence arrangements to improve purchasing efficiency.'],
['Automated Billing and Renewal',3,'Introduce automated subscription billing, renewal notifications and payment administration.'],
['Scaled Distribution Partnerships',7,'Develop distribution partnerships that help CRMup reach customers efficiently across the market.'],
['Generative AI Sales Copilot',12,'Develop an advanced generative AI assistant that helps sales professionals prepare proposals, identify opportunities and manage customer interactions.'],
['Predictive Customer Intelligence',9,'Create advanced analytics capable of forecasting customer behaviour, purchasing intentions and sales opportunities.'],
['Applied CRM Innovation Laboratory',10,'Establish an innovation laboratory dedicated to experimenting with emerging technologies and future CRM capabilities.'],
['Open API and Developer Platform',7,'Develop advanced APIs and tools enabling third-party developers to build new CRM applications and integrations.'],
['Next-Generation User Experience',5,'Redesign the CRM interface using advanced interaction design, intelligent navigation and modern visual experiences.'],
['Advanced Mobile and Offline CRM',7,'Develop next-generation mobile CRM functionality, including advanced offline features and synchronisation.'],
['Privacy-by-Design Product Features',8,'Build sophisticated privacy management and data-protection capabilities directly into the CRM product.'],
['Early-Access Innovation Programme',4,'Launch a programme enabling selected customers to experiment with and provide feedback on emerging product features.'],
['Proprietary AI and Intellectual Property',5,'Invest in proprietary AI technologies, advanced algorithms and intellectual property development.'],
['Modular Rapid-Release Architecture',8,'Create a modular software architecture that enables rapid introduction of innovative features and technical upgrades.'],
['Dedicated Strategic Account Teams',12,'Establish dedicated account management teams responsible for supporting major customers and managing long-term relationships.'],
['Sector-Specific CRM Customisation',10,'Develop tailored CRM configurations addressing the specialised needs of different industries.'],
['Consultative Implementation Programme',7,'Create expert consulting teams to help clients redesign business processes and implement tailored CRM solutions.'],
['Customer Co-Creation Councils',4,'Establish customer advisory groups that collaborate directly with CRMup on solution design and service improvements.'],
['24/7 Priority Client Support',9,'Provide premium round-the-clock support for clients requiring rapid responses and personalised assistance.'],
['Quarterly Business Process Reviews',6,'Offer structured client reviews to assess CRM effectiveness and recommend improvements to customer processes.'],
['Personalised Customer Journeys',7,'Develop tools and services that adapt CRM experiences to the specific needs and workflows of each customer.'],
['Customer Success Health Dashboards',6,'Create tailored customer-success monitoring dashboards to identify client needs, risks and improvement opportunities.'],
['Executive Client Community',3,'Establish an exclusive executive community to build relationships, share expertise and strengthen customer loyalty.'],
['Bespoke Integration Consultancy',9,'Develop specialised consulting services to integrate CRMup with each client’s existing systems and processes.']
];
export const projects = rows.map(([name,m,description],i)=>({id:`PR${String(i+1).padStart(2,'0')}`,name,cost:m*1000000,description}));
const order=[14,2,23,8,18,27,5,11,29,1,16,24,9,20,22,4,12,26,7,15,30,3,19,21,10,17,28,6,13,25];
export const mixedProjects=order.map(i=>projects[i-1]);
export const money=(n:number)=>new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP',maximumFractionDigits:0}).format(n);
export const millions=(n:number)=>`£${n/1000000}m`;

export const percent=(n:number)=>new Intl.NumberFormat('en-GB',{style:'percent',maximumFractionDigits:0}).format(n);
