export type Level = "100L" | "200L" | "300L" | "400L";

export type QuizQuestion = {
  question: string;
  answer: string;
};

export type Course = {
  id: string;
  code: string;
  title: string;
  level: Level;
  units: number;
  handouts: number;
  pages: string[];
  seedThread: { initial: string; body: string; ago: string }[];
  quiz?: QuizQuestion[];
};

export const LEVELS: Level[] = ["100L", "200L", "300L", "400L"];

export const COURSES: Course[] = [
  {
    id: "gst101",
    code: "GST 101",
    title: "General Studies 1",
    level: "100L",
    units: 2,
    handouts: 24,
    pages: [
      "Section 1.2 — Communication in English. Effective academic communication rests on clarity, audience awareness and structure. A paragraph carries one controlling idea, supported by evidence and a closing link to the next thought.",
      "Section 1.5 — Study skills. Spaced retrieval beats re-reading. Revisit each handout after one day, three days, then one week, and answer past questions from memory before checking the notes.",
      "Section 2.1 — Library and information science. Catalogues, indexes and citation trails let you move from a broad topic to a defensible reading list without wandering.",
    ],
    seedThread: [
      {
        initial: "A",
        body: "Unit 4 past-questions lean on the 2019/2020 papers. Prep those first.",
        ago: "2h",
      },
      {
        initial: "V",
        body: "Who has the GST 101 handout for the essay question? Can't find it in the pack.",
        ago: "5h",
      },
    ],
    quiz: [
      {
        question: 'Define "critical thinking" and apply it to one ICT issue.',
        answer:
          "Reasoned, reflective judgement of claims and evidence before accepting them — e.g. verifying a viral WhatsApp health claim against a primary source before resharing.",
      },
      {
        question: "State three qualities of an effective academic paragraph.",
        answer:
          "One controlling idea (topic sentence), supporting evidence or examples, and coherent linking to the surrounding argument.",
      },
      {
        question: "Distinguish between listening and hearing.",
        answer:
          "Hearing is the passive reception of sound; listening is the active, purposeful processing of meaning from what is heard.",
      },
      {
        question: "What is spaced repetition and why does it work?",
        answer:
          "Reviewing material at widening intervals. Retrieval near the point of forgetting strengthens long-term memory more than massed re-reading.",
      },
    ],
  },
  {
    id: "mth101",
    code: "MTH 101",
    title: "Elementary Mathematics I",
    level: "100L",
    units: 3,
    handouts: 18,
    pages: [
      "Chapter 2 — Sequences and series. An arithmetic progression adds a constant difference; a geometric progression multiplies by a constant ratio. Convergence of a GP requires |r| < 1.",
      "Chapter 4 — Limits. A limit describes the value a function approaches, not necessarily the value it takes. Evaluate by factorisation, rationalisation, or standard limit forms.",
    ],
    seedThread: [
      {
        initial: "K",
        body: "The 2022 paper repeated the binomial expansion question almost word for word.",
        ago: "1d",
      },
    ],
  },
  {
    id: "phy101",
    code: "PHY 101",
    title: "General Physics I",
    level: "100L",
    units: 3,
    handouts: 12,
    pages: [
      "Unit 3 — Kinematics. Displacement, velocity and acceleration are vector quantities. For constant acceleration, v = u + at and s = ut + ½at².",
      "Unit 6 — Work, energy and power. Work is the dot product of force and displacement; power is the rate of doing work, measured in watts.",
    ],
    seedThread: [
      { initial: "T", body: "Practicals count for 30% — don't skip the lab manual.", ago: "3h" },
    ],
  },
  {
    id: "gst201",
    code: "GST 201",
    title: "Nigerian Peoples and Culture",
    level: "200L",
    units: 2,
    handouts: 16,
    pages: [
      "Module 2 — Pre-colonial socio-political systems. Compare the centralised emirate structure with acephalous village-group governance and the role of age grades.",
      "Module 5 — Culture and national development. Language, values and creative industries as levers of cohesion and economic output.",
    ],
    seedThread: [
      {
        initial: "R",
        body: "Objectives section is where most of the exam comes from. Memorise the dates.",
        ago: "6h",
      },
    ],
    quiz: [
      {
        question: "Name two centralised pre-colonial political systems in Nigeria.",
        answer:
          "The Sokoto Caliphate/Hausa-Fulani emirates and the Oyo Empire — both featured a central authority with graded officials.",
      },
      {
        question: "What does 'acephalous' mean in the Nigerian context?",
        answer:
          "A society without a single centralised head, governed instead by councils, lineages and age grades — as among many Igbo village groups.",
      },
      {
        question: "State one way culture contributes to national development.",
        answer:
          "Creative and cultural industries generate employment and export earnings while strengthening shared identity and social cohesion.",
      },
    ],
  },
  {
    id: "csc203",
    code: "CSC 203",
    title: "Discrete Structures",
    level: "200L",
    units: 3,
    handouts: 21,
    pages: [
      "Topic 1 — Sets and relations. A relation on a set is reflexive, symmetric and transitive precisely when it is an equivalence relation, partitioning the set into classes.",
      "Topic 4 — Graph theory. A tree on n vertices has exactly n − 1 edges and no cycles. Traversals: BFS uses a queue, DFS a stack.",
    ],
    seedThread: [
      { initial: "D", body: "Focus on De Morgan's laws — asked three sessions running.", ago: "34m" },
      { initial: "M", body: "Handout 12 has the full worked truth tables.", ago: "2d" },
    ],
  },
  {
    id: "acc301",
    code: "ACC 301",
    title: "Financial Accounting III",
    level: "300L",
    units: 3,
    handouts: 14,
    pages: [
      "Part 2 — Consolidated statements. Eliminate intra-group balances, unrealised profit on closing stock, and recognise non-controlling interest at the reporting date.",
      "Part 5 — Cash flow statements. Reconcile operating profit to cash generated using the indirect method before classifying investing and financing flows.",
    ],
    seedThread: [
      { initial: "S", body: "Bring a real calculator — phones are collected at the door.", ago: "8h" },
    ],
  },
  {
    id: "edu305",
    code: "EDU 305",
    title: "Educational Measurement",
    level: "300L",
    units: 2,
    handouts: 9,
    pages: [
      "Unit 2 — Validity and reliability. Validity asks whether a test measures what it claims; reliability asks whether it does so consistently across occasions.",
      "Unit 4 — Item analysis. Compute difficulty index and discrimination index for every item before retaining it in a question bank.",
    ],
    seedThread: [
      { initial: "N", body: "Tabulate the difference between validity types — guaranteed question.", ago: "1d" },
    ],
  },
  {
    id: "bio401",
    code: "BIO 401",
    title: "Molecular Genetics",
    level: "400L",
    units: 3,
    handouts: 11,
    pages: [
      "Chapter 3 — Transcription. RNA polymerase binds the promoter, unwinds the duplex and synthesises mRNA 5' to 3' using the template strand.",
      "Chapter 7 — Gene regulation. The lac operon is inducible and negatively regulated; the trp operon is repressible and attenuated.",
    ],
    seedThread: [
      { initial: "F", body: "Seminar presentation carries marks — pick your topic early.", ago: "4h" },
    ],
  },
  {
    id: "law402",
    code: "LAW 402",
    title: "Law of Evidence",
    level: "400L",
    units: 4,
    handouts: 19,
    pages: [
      "Part 3 — Admissibility. Relevance is the threshold; a relevant fact may still be excluded by an exclusionary rule such as hearsay or privilege.",
      "Part 6 — Burden of proof. In criminal matters the prosecution bears the burden beyond reasonable doubt; civil matters turn on the balance of probabilities.",
    ],
    seedThread: [
      { initial: "O", body: "Cite the sections. Answers without statute references lose half the marks.", ago: "12h" },
    ],
  },
];
