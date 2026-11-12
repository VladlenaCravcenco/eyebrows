/**
 * Демо-контент на английском — для продающей версии (VITE_LANG=en).
 * Нейтральная бьюти-студия без привязки к конкретной фирме.
 * id курсов и уроков такие же, как в русской версии.
 */
import type { Course } from './courses';
import type { Doc } from './knowledge';

export const coursesEn: Course[] = [
  {
    id: 'onboarding',
    title: 'Welcome aboard',
    subtitle: 'Your first steps: values, culture and standards',
    category: 'Старт',
    cover: 'linear-gradient(135deg, #EFE7DC 0%, #D9CFC2 100%)',
    lessons: [
      {
        id: 'l1', title: 'Welcome to the studio', minutes: 4, type: 'reading',
        content: [
          { kind: 'h', text: 'Our philosophy' },
          { kind: 'p', text: 'We create a space where every client feels cared for. The way we look and work reflects the way the studio feels inside.' },
          { kind: 'tip', text: 'Beauty, cleanliness and calm — the three pillars of our work.' },
        ],
      },
      {
        id: 'l2', title: 'Your first day', minutes: 6, type: 'checklist',
        content: [
          { kind: 'h', text: 'First-day checklist' },
          { kind: 'p', text: 'Tick each item once it’s done.' },
          { kind: 'check', text: 'Get access to the app and your schedule' },
          { kind: 'check', text: 'Meet the team and the front desk' },
          { kind: 'check', text: 'Find the supplies and the sterilizer' },
          { kind: 'check', text: 'Set up your station using the checklist' },
        ],
      },
      {
        id: 'l3', title: 'Dress code', minutes: 5, type: 'reading',
        content: [
          { kind: 'p', text: 'A neat uniform, minimal jewelry and well-groomed hands are part of the service. Clients see you before they see your work.' },
          { kind: 'list', items: ['Clean, ironed uniform', 'Hair tied back', 'Minimal jewelry on hands'] },
          { kind: 'tip', text: 'Keep fragrance light. Nails always in neutral shades.' },
        ],
      },
      {
        id: 'l4', title: 'How we talk to clients', minutes: 4, type: 'reading',
        content: [
          { kind: 'p', text: 'We are polite, use the client’s name and never discuss clients with each other. Respect is the baseline.' },
          { kind: 'warn', text: 'Never discuss clients, colleagues or other studios’ prices in front of a client.' },
        ],
      },
    ],
    quiz: [
      { question: 'What is the baseline for talking to a client?', options: ['A friendly, casual tone', 'Respect and using their name', 'Working in silence'], correct: 1, explain: 'Polite and personal — always use the client’s name.' },
      { question: 'Can a master wear bright nail polish?', options: ['Yes, it’s self-expression', 'Only neutral shades', 'Only on weekends'], correct: 1 },
      { question: 'What’s on the first-day checklist?', options: ['Setting up your station', 'Buying your own tools', 'Taking a client solo'], correct: 0 },
    ],
  },
  {
    id: 'sanitary',
    title: 'Hygiene standards',
    subtitle: 'Sterilization, tool care and safety',
    category: 'Обязательно',
    cover: 'linear-gradient(135deg, #E8EEE9 0%, #C9D5CB 100%)',
    lessons: [
      {
        id: 's1', title: 'Tool processing, step by step', minutes: 6, type: 'reading',
        content: [
          { kind: 'p', text: 'Every tool goes through four steps, strictly in order:' },
          { kind: 'list', items: ['Disinfection', 'Pre-sterilization cleaning', 'Sterilization', 'Storage in a sealed pouch'] },
          { kind: 'warn', text: 'Never skip or reorder the steps.' },
        ],
      },
      {
        id: 's2', title: 'Using the sterilizer', minutes: 5, type: 'checklist',
        content: [
          { kind: 'check', text: 'Check the pouch is intact' },
          { kind: 'check', text: 'Write the sterilization date' },
          { kind: 'check', text: 'Store for no longer than 72 hours' },
        ],
      },
      { id: 's3', title: 'Cleaning your station', minutes: 5, type: 'reading', content: [{ kind: 'p', text: 'After every client: wipe down surfaces, replace disposables, air the room.' }] },
      { id: 's4', title: 'Handling biomaterials', minutes: 7, type: 'reading', content: [{ kind: 'p', text: 'Gloves, mask, and goggles when needed. Dispose of waste in a separate container.' }] },
      { id: 's5', title: 'Personal hygiene', minutes: 4, type: 'reading', content: [{ kind: 'p', text: 'Wash your hands before and after every client. Keep sanitizer within reach.' }] },
    ],
    quiz: [
      { question: 'How long can a sterilized pouch be stored?', options: ['24 hours', '72 hours', '7 days'], correct: 1 },
      { question: 'What comes first in tool processing?', options: ['Sterilization', 'Disinfection', 'Cleaning'], correct: 1, explain: 'Order: disinfection → cleaning → sterilization → storage.' },
      { question: 'When does a master wash their hands?', options: ['In the morning', 'Before and after every client', 'When they feel like it'], correct: 1 },
    ],
  },
  {
    id: 'clients',
    title: 'Client care',
    subtitle: 'Communication, service and tricky situations',
    category: 'Сервис',
    cover: 'linear-gradient(135deg, #F1E4E4 0%, #DFC9C9 100%)',
    lessons: [
      { id: 'c1', title: 'Greeting the client', minutes: 4, type: 'reading', content: [{ kind: 'p', text: 'Smile, make eye contact, offer water or tea. The client should feel cared for from the first second.' }] },
      { id: 'c2', title: 'Consultation', minutes: 5, type: 'reading', content: [{ kind: 'p', text: 'Clarify expectations, explain the procedure and agree on the price before you start.' }] },
      { id: 'c3', title: 'Handling complaints', minutes: 6, type: 'reading', content: [{ kind: 'p', text: 'Stay calm, listen, offer a solution. Bring in the manager when needed.' }] },
      { id: 'c4', title: 'Goodbye and feedback', minutes: 3, type: 'reading', content: [{ kind: 'p', text: 'Book the next visit, say thank you, and kindly ask for a review.' }] },
    ],
    quiz: [
      { question: 'What do we do before the procedure?', options: ['Start right away', 'Agree on the price', 'Take a deposit'], correct: 1 },
      { question: 'How do you handle a complaint?', options: ['Argue', 'Listen and offer a solution', 'Ignore it'], correct: 1 },
    ],
  },
  {
    id: 'safety',
    title: 'Safety basics',
    subtitle: 'Equipment, chemicals and emergencies',
    category: 'Обязательно',
    cover: 'linear-gradient(135deg, #E5E5EA 0%, #C7C7CE 100%)',
    lessons: [
      { id: 't1', title: 'Electrical equipment', minutes: 5, type: 'reading', content: [{ kind: 'p', text: 'Check cords for damage and never leave devices switched on unattended.' }] },
      { id: 't2', title: 'Storing chemicals', minutes: 6, type: 'reading', content: [{ kind: 'p', text: 'Closed, labeled containers only — away from heat sources.' }] },
      {
        id: 't3', title: 'In an emergency', minutes: 7, type: 'checklist',
        content: [
          { kind: 'check', text: 'Stay calm' },
          { kind: 'check', text: 'Get the client out safely' },
          { kind: 'check', text: 'Tell the manager' },
        ],
      },
    ],
    quiz: [
      { question: 'How are professional chemicals stored?', options: ['On an open shelf', 'In closed, labeled containers', 'In the fridge'], correct: 1 },
      { question: 'Can you leave a device on and step out?', options: ['Yes, briefly', 'No, never', 'Only the lamp'], correct: 1 },
    ],
  },
  {
    id: 'rules',
    title: 'House rules',
    subtitle: 'Schedule, discipline and daily routine',
    category: 'Регламент',
    cover: 'linear-gradient(135deg, #1A1A1F 0%, #2E2E36 100%)',
    lessons: [
      { id: 'r1', title: 'Working hours', minutes: 4, type: 'reading', content: [{ kind: 'p', text: 'Arrive 15 minutes before your first client. Lateness is logged by the front desk.' }] },
      { id: 'r2', title: 'Behavior in the studio', minutes: 5, type: 'reading', content: [{ kind: 'p', text: 'Quiet voices, no personal chats in front of clients, phone on silent.' }] },
      {
        id: 'r3', title: 'Payments', minutes: 6, type: 'reading',
        content: [
          { kind: 'p', text: 'All payments go through the studio register.' },
          { kind: 'warn', text: 'No private deals with clients.' },
        ],
      },
    ],
    quiz: [
      { question: 'How early do you arrive before a client?', options: ['5 minutes', '15 minutes', '30 minutes'], correct: 1 },
      { question: 'A client offers to pay you directly at a discount. You…', options: ['Agree', 'Politely decline — payment goes through the register', 'Take half in cash'], correct: 1 },
    ],
  },
];

export const knowledgeEn: Doc[] = [
  {
    id: 'rules', title: 'Studio handbook', desc: 'The full company rulebook', icon: 'book', tag: 'Policy',
    sections: [
      { title: 'Schedule and lateness', content: [{ kind: 'p', text: 'Arrive 15 minutes before your first client. Let the front desk know in advance if you’re running late.' }] },
      { title: 'In the studio', content: [{ kind: 'list', items: ['Speak quietly and calmly', 'Phone on silent', 'Food in the staff room only'] }] },
    ],
  },
  {
    id: 'sanpin', title: 'Hygiene standards', desc: 'Sanitation rules and requirements', icon: 'shield', tag: 'Safety',
    sections: [
      { title: 'Tool processing', content: [{ kind: 'list', items: ['Disinfection', 'Pre-sterilization cleaning', 'Sterilization', 'Sealed pouch storage — up to 72 hours'] }] },
      { title: 'Your station', content: [{ kind: 'p', text: 'After every client — wipe down surfaces and replace disposables.' }] },
    ],
  },
  {
    id: 'materials', title: 'Supplies & stock', desc: 'Tracking usage and ordering', icon: 'package', tag: 'Operations',
    sections: [
      { title: 'Usage', content: [{ kind: 'p', text: 'Log supply usage in the journal at the end of each shift.' }] },
      { title: 'Restocking', content: [{ kind: 'tip', text: 'Hand in a request when you have about 3 days of supplies left.' }] },
    ],
  },
  {
    id: 'social', title: 'Social media', desc: 'Posting rules and tagging the studio', icon: 'sparkles', tag: 'Brand',
    sections: [
      { title: 'Photos of your work', content: [{ kind: 'p', text: 'Shoot by the window or under the ring light on a clean background. Tag the studio account.' }] },
      { title: 'Client consent', content: [{ kind: 'warn', text: 'Only post a client’s face with their permission.' }] },
    ],
  },
  {
    id: 'finance', title: 'Payments & bonuses', desc: 'Register, bonuses and penalties', icon: 'wallet', tag: 'Finance',
    sections: [{ title: 'Payments', content: [{ kind: 'p', text: 'All payments go through the studio register.' }, { kind: 'warn', text: 'No private payment deals.' }] }],
  },
  {
    id: 'ethics', title: 'Conflicts of interest', desc: 'Private clients and side gigs', icon: 'scale', tag: 'Ethics',
    sections: [{ title: 'Studio clients', content: [{ kind: 'p', text: 'Clients who come to the studio stay studio clients. We don’t lure them away.' }] }],
  },
];
