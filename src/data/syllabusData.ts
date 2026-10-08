/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SyllabusUnit {
  unitNumber: number;
  title: string;
  hours: number;
  topics: string[];
}

export interface CourseDetail {
  code: string;
  title: string;
  shortTitle: string;
  category: 'Theory' | 'Lab' | 'Drawing' | 'Practical/Drawing';
  credits: number;
  instructor: string;
  room: string;
  evaluationScheme: string;
  textbooks: string[];
  referenceBooks: string[];
  units: SyllabusUnit[];
  resources: {
    syllabusUrl: string;
    pyqUrl: string;
    lectureSlidesUrl: string;
    labManualUrl: string;
  };
}

export const SEMESTER_1_DETAILED_COURSES: Record<string, CourseDetail> = {
  '25BS1MT101': {
    code: '25BS1MT101',
    title: 'Matrices and Calculus',
    shortTitle: 'Calculus',
    category: 'Theory',
    credits: 4,
    instructor: 'Prof. S. R. Ramanathan',
    room: 'Lecture Hall 101 (Math Wing)',
    evaluationScheme: 'Midterm (30%) + Assignments/Quizzes (20%) + End Semester (50%)',
    textbooks: [
      'Higher Engineering Mathematics by B.S. Grewal (44th Edition)',
      'Advanced Engineering Mathematics by Erwin Kreyszig (10th Edition)',
    ],
    referenceBooks: [
      'Calculus and Analytic Geometry by George B. Thomas',
      'Linear Algebra and Its Applications by Gilbert Strang',
    ],
    units: [
      {
        unitNumber: 1,
        title: 'Matrices & Systems of Linear Equations',
        hours: 9,
        topics: [
          'Rank of a matrix by echelon and normal forms',
          'Consistency of linear system of equations AX = B',
          'Gauss elimination method and Gauss-Jordan method',
          'Linear dependence and independence of vectors',
        ],
      },
      {
        unitNumber: 2,
        title: 'Eigenvalues & Diagonalization',
        hours: 10,
        topics: [
          'Eigenvalues and Eigenvectors of real symmetric matrices',
          'Properties of eigenvalues and Cayley-Hamilton theorem (without proof)',
          'Finding inverse and positive powers of matrices using Cayley-Hamilton',
          'Diagonalization of matrices and quadratic forms reduction',
        ],
      },
      {
        unitNumber: 3,
        title: 'Calculus of Functions of Several Variables',
        hours: 9,
        topics: [
          'Partial derivatives and total differential',
          'Jacobians and functional dependence',
          'Taylor’s and Maclaurin’s theorem for two variables',
          'Maxima and minima of functions of two variables (Lagrange multipliers)',
        ],
      },
      {
        unitNumber: 4,
        title: 'Multiple Integrals',
        hours: 10,
        topics: [
          'Double integrals in Cartesian and polar coordinates',
          'Change of order of integration',
          'Change of variables from Cartesian to polar coordinates',
          'Triple integrals in Cartesian coordinates and volume calculation',
        ],
      },
      {
        unitNumber: 5,
        title: 'Vector Calculus',
        hours: 10,
        topics: [
          'Gradient, directional derivative, divergence, and curl',
          'Scalar potential functions and solenoidal/irrotational fields',
          'Line, surface, and volume integrals',
          'Green’s theorem, Stokes’ theorem, and Gauss divergence theorem',
        ],
      },
    ],
    resources: {
      syllabusUrl: 'https://drive.google.com/file/d/cse-sem1-matrices-calculus-syllabus/preview',
      pyqUrl: 'https://drive.google.com/drive/folders/cse-pyq-25BS1MT101',
      lectureSlidesUrl: 'https://drive.google.com/drive/folders/cse-slides-25BS1MT101',
      labManualUrl: 'https://drive.google.com/file/d/cse-25BS1MT101-formula-handbook/preview',
    },
  },
  '25BS1CH101': {
    code: '25BS1CH101',
    title: 'Chemistry for Engineers',
    shortTitle: 'Chemistry',
    category: 'Theory',
    credits: 3,
    instructor: 'Dr. Ananya Mukherjee',
    room: 'Science Complex Hall 203',
    evaluationScheme: 'Midterm (30%) + Surprise Quizzes (20%) + End Sem (50%)',
    textbooks: [
      'Engineering Chemistry by P.C. Jain and Monika Jain',
      'Textbook of Engineering Chemistry by S.S. Dara',
    ],
    referenceBooks: ['Physical Chemistry by P.W. Atkins', 'Nanotechnology by Mark Ratner'],
    units: [
      {
        unitNumber: 1,
        title: 'Water Technology & Treatment',
        hours: 9,
        topics: [
          'Hardness of water: types, units, and EDTA estimation method',
          'Boiler troubles: scale, sludge, priming, foaming, and caustic embrittlement',
          'Internal treatment: phosphate, calgon, and colloidal conditioning',
          'Demineralization by ion-exchange resins and reverse osmosis (RO)',
        ],
      },
      {
        unitNumber: 2,
        title: 'Electrochemistry & Energy Storage Systems',
        hours: 9,
        topics: [
          'Electrochemical cells, EMF, and Nernst equation',
          'Reference electrodes: Calomel electrode and Glass electrode',
          'Lead-acid storage battery and Nickel-Cadmium battery',
          'Lithium-ion batteries and Hydrogen-Oxygen fuel cell technology',
        ],
      },
      {
        unitNumber: 3,
        title: 'Corrosion & Its Prevention',
        hours: 8,
        topics: [
          'Electrochemical theory of corrosion and types of corrosion',
          'Galvanic corrosion, pitting corrosion, and waterline corrosion',
          'Factors influencing corrosion rate',
          'Cathodic protection (sacrificial anode and impressed current)',
        ],
      },
      {
        unitNumber: 4,
        title: 'Polymers & Composite Materials',
        hours: 9,
        topics: [
          'Classification and mechanism of polymerisation (addition and condensation)',
          'Thermosetting vs Thermoplastic polymers; Bakelite, Nylon-6,6, and Teflon',
          'Conducting polymers: polyacetylene and polyaniline mechanisms',
          'Fiber-reinforced plastics (FRP) and carbon nanotube composites',
        ],
      },
      {
        unitNumber: 5,
        title: 'Engineering Materials & Nanochemistry',
        hours: 9,
        topics: [
          'Lubricants: classification, mechanisms, and lubrication properties (viscosity index, flash point)',
          'Phase rule: one-component water system and two-component lead-silver system',
          'Introduction to nanomaterials: carbon nanotubes (SWCNT/MWCNT) and graphene',
          'Synthesis of nanoparticles by Sol-Gel and Chemical Vapor Deposition (CVD)',
        ],
      },
    ],
    resources: {
      syllabusUrl: 'https://drive.google.com/file/d/cse-sem1-eng-chem-syllabus/preview',
      pyqUrl: 'https://drive.google.com/drive/folders/cse-pyq-25BS1CH101',
      lectureSlidesUrl: 'https://drive.google.com/drive/folders/cse-slides-25BS1CH101',
      labManualUrl: 'https://drive.google.com/file/d/cse-chem-cheatsheet/preview',
    },
  },
  '25ES1EE101': {
    code: '25ES1EE101',
    title: 'Basic Electrical Engineering',
    shortTitle: 'BEE',
    category: 'Theory',
    credits: 3,
    instructor: 'Prof. K. Venkatesh',
    room: 'Electrical Block Hall 104',
    evaluationScheme: 'Midterm (30%) + Home Assignments (20%) + End Sem (50%)',
    textbooks: [
      'Basic Electrical Engineering by D.P. Kothari and I.J. Nagrath',
      'Electrical Engineering Fundamentals by Vincent Del Toro',
    ],
    referenceBooks: ['Electric Circuits by Joseph Edminister (Schaum’s Outlines)'],
    units: [
      {
        unitNumber: 1,
        title: 'DC Circuit Analysis',
        hours: 10,
        topics: [
          'Electrical circuit elements (R, L and C), voltage and current sources',
          'Kirchhoff’s Current and Voltage Laws (KCL & KVL)',
          'Mesh and Nodal analysis with independent and dependent sources',
          'Superposition Theorem and Thevenin’s Theorem',
          'Norton’s Theorem and Maximum Power Transfer Theorem',
        ],
      },
      {
        unitNumber: 2,
        title: 'Single-Phase AC Circuits',
        hours: 9,
        topics: [
          'Representation of sinusoidal waveforms, peak, RMS and average values',
          'Phasor representation of AC quantities, impedance and admittance',
          'Analysis of series and parallel R-L, R-C, and R-L-C circuits',
          'Real power, reactive power, apparent power, and power factor correction',
        ],
      },
      {
        unitNumber: 3,
        title: 'Three-Phase AC Circuits',
        hours: 8,
        topics: [
          'Three-phase balanced supply and phase sequence',
          'Star and Delta connections: relation between line and phase quantities',
          'Analysis of balanced three-phase star and delta loads',
          'Measurement of three-phase power using two-wattmeter method',
        ],
      },
      {
        unitNumber: 4,
        title: 'Transformers',
        hours: 9,
        topics: [
          'Magnetic circuits, B-H curve, and reluctance',
          'Single-phase transformer: ideal and practical transformer operation',
          'Equivalent circuit, phasor diagram on no-load and full-load',
          'Open Circuit (OC) and Short Circuit (SC) tests, losses and efficiency',
        ],
      },
      {
        unitNumber: 5,
        title: 'Electrical Machines & Installations',
        hours: 8,
        topics: [
          'Construction, working principle, and torque-slip characteristics of 3-phase induction motor',
          'Single-phase induction motor starting methods',
          'Switchgear: MCB, ELCB, and fuse ratings',
          'Electrical wiring, earthing methods (pipe and plate earthing), and safety precautions',
        ],
      },
    ],
    resources: {
      syllabusUrl: 'https://drive.google.com/file/d/cse-sem1-bee-syllabus/preview',
      pyqUrl: 'https://drive.google.com/drive/folders/cse-pyq-25ES1EE101',
      lectureSlidesUrl: 'https://drive.google.com/drive/folders/cse-slides-25ES1EE101',
      labManualUrl: 'https://drive.google.com/file/d/cse-bee-circuit-theorems/preview',
    },
  },
  '25ES1CS101': {
    code: '25ES1CS101',
    title: 'Programming for Problem Solving',
    shortTitle: 'PPS',
    category: 'Theory',
    credits: 3,
    instructor: 'Prof. Rajesh K. Sharma',
    room: 'Turing Hall / CSE Auditorium 101',
    evaluationScheme: 'Midterm (30%) + Coding Quizzes (20%) + End Sem (50%)',
    textbooks: [
      'Programming in ANSI C by E. Balagurusamy (8th Edition)',
      'The C Programming Language by Brian W. Kernighan & Dennis M. Ritchie',
    ],
    referenceBooks: ['Let Us C by Yashavant Kanetkar', 'Computer Science: A Structured Programming Approach by Behrouz A. Forouzan'],
    units: [
      {
        unitNumber: 1,
        title: 'Introduction to Programming & Algorithms',
        hours: 8,
        topics: [
          'Computer architecture essentials: memory, CPU, ALU, and storage',
          'Algorithms, flowcharts, and pseudo-code design',
          'C program compilation pipeline: preprocessor, compiler, assembler, and linker',
          'Data types, constants, variables, operators, and expressions',
        ],
      },
      {
        unitNumber: 2,
        title: 'Conditional Branching & Loops',
        hours: 9,
        topics: [
          'Conditional branching: if, if-else, nested if, and switch-case',
          'Iteration constructs: while, do-while, and for loops',
          'Jump statements: break, continue, and goto',
          'Nested loops and pattern printing algorithms',
        ],
      },
      {
        unitNumber: 3,
        title: 'Arrays & Functions',
        hours: 9,
        topics: [
          'One-dimensional arrays: declaration, initialization, and searching (linear & binary search)',
          'Two-dimensional arrays: matrix addition, multiplication, and transpose',
          'User-defined functions, parameter passing (pass by value), and function prototypes',
          'Recursion: factorial, Fibonacci, Tower of Hanoi, and stack frames',
        ],
      },
      {
        unitNumber: 4,
        title: 'Pointers & Dynamic Memory Allocation',
        hours: 10,
        topics: [
          'Pointer fundamentals, address-of (&) and dereference (*) operators',
          'Pointer arithmetic, pointers with arrays, and pass by reference',
          'Dynamic Memory Allocation: malloc, calloc, realloc, and free',
          'Common pointer bugs: dangling pointers and memory leaks',
        ],
      },
      {
        unitNumber: 5,
        title: 'Strings, Structures & File I/O',
        hours: 8,
        topics: [
          'Character arrays, string literals, and string.h functions (strlen, strcpy, strcmp, strcat)',
          'Structures, unions, array of structures, and self-referential structures',
          'File management in C: fopen, fclose, fgetc, fputc, fscanf, fprintf',
          'Binary file operations: fread and fwrite',
        ],
      },
    ],
    resources: {
      syllabusUrl: 'https://drive.google.com/file/d/cse-sem1-pps-syllabus/preview',
      pyqUrl: 'https://drive.google.com/drive/folders/cse-pyq-25ES1CS101',
      lectureSlidesUrl: 'https://drive.google.com/drive/folders/cse-slides-25ES1CS101',
      labManualUrl: 'https://github.com/cse-cohort-2026/pps-c-lecture-code',
    },
  },
  '25ES3ME101': {
    code: '25ES3ME101',
    title: 'Engineering Drawing',
    shortTitle: 'Engg Drawing',
    category: 'Drawing',
    credits: 3,
    instructor: 'Prof. M. B. Patil',
    room: 'Drawing Hall 302 (Drawing Complex)',
    evaluationScheme: 'Sheet Evaluations (40%) + Midterm Drawing Exam (20%) + End Sem (40%)',
    textbooks: [
      'Engineering Drawing by N.D. Bhatt and V.M. Panchal',
      'Textbook of Engineering Drawing by K. Venugopal',
    ],
    referenceBooks: ['Engineering Graphics with AutoCAD by James D. Bethune'],
    units: [
      {
        unitNumber: 1,
        title: 'Principles of Engineering Graphics & Scales',
        hours: 8,
        topics: [
          'Drafting instruments, standard sheet layouts, title block, and lines',
          'Lettering, dimensioning styles, and standard BIS conventions',
          'Conic sections: construction of ellipse, parabola, and hyperbola (eccentricity method)',
          'Scales: Representative Fraction (RF), plain scales, and diagonal scales',
        ],
      },
      {
        unitNumber: 2,
        title: 'Orthographic Projections & Points/Lines',
        hours: 10,
        topics: [
          'Principles of orthographic projection: first-angle vs third-angle projection',
          'Projection of points in all four quadrants',
          'Projection of straight lines: parallel to one plane and inclined to the other',
          'Projection of straight lines inclined to both planes; determination of true length and inclinations',
        ],
      },
      {
        unitNumber: 3,
        title: 'Projections of Planes & Solids',
        hours: 10,
        topics: [
          'Projection of regular planes (polygons, circles) inclined to both reference planes',
          'Projection of regular solids: prisms, pyramids, cylinders, and cones',
          'Axis inclined to one plane and parallel to the other',
          'Auxiliary planes method for projections of solids',
        ],
      },
      {
        unitNumber: 4,
        title: 'Sections of Solids & Development of Surfaces',
        hours: 9,
        topics: [
          'Section planes: horizontal, vertical, and auxiliary inclined section planes',
          'Sectional views and true shapes of sections of prisms, pyramids, and cylinders',
          'Development of lateral surfaces of regular solids: parallel line method',
          'Radial line method for pyramids and cones',
        ],
      },
      {
        unitNumber: 5,
        title: 'Isometric Projections & Computer-Aided Drafting',
        hours: 8,
        topics: [
          'Principles of isometric projection and isometric scale',
          'Isometric views of simple solids and compound solids',
          'Conversion of orthographic views into isometric view',
          'Introduction to AutoCAD software: basic 2D drawing and editing commands',
        ],
      },
    ],
    resources: {
      syllabusUrl: 'https://drive.google.com/file/d/cse-sem1-drawing-syllabus/preview',
      pyqUrl: 'https://drive.google.com/drive/folders/cse-pyq-25ES3ME101',
      lectureSlidesUrl: 'https://drive.google.com/drive/folders/cse-slides-25ES3ME101',
      labManualUrl: 'https://drive.google.com/file/d/cse-autocad-drawing-sheets/preview',
    },
  },
  '25BS2CH101': {
    code: '25BS2CH101',
    title: 'Engineering Chemistry Laboratory',
    shortTitle: 'Chem Lab',
    category: 'Lab',
    credits: 1,
    instructor: 'Dr. Ananya Mukherjee',
    room: 'Chemistry Lab B-12',
    evaluationScheme: 'Day-to-day Record (40%) + Viva (20%) + Practical Exam (40%)',
    textbooks: ['Vogel’s Textbook of Quantitative Chemical Analysis'],
    referenceBooks: ['Laboratory Manual of Engineering Chemistry by Dr. Sudha Rani'],
    units: [
      {
        unitNumber: 1,
        title: 'Volumetric & Complexometric Experiments',
        hours: 12,
        topics: [
          'Determination of total, permanent, and temporary hardness of water by EDTA method',
          'Estimation of dissolved oxygen in water by Winkler’s method',
          'Estimation of iron in cement by Permanganometry',
          'Estimation of alkalinity in a given water sample',
        ],
      },
      {
        unitNumber: 2,
        title: 'Instrumental Physical Chemistry Experiments',
        hours: 12,
        topics: [
          'Conductometric titration of strong acid with strong base (HCl vs NaOH)',
          'Potentiometric titration of Ferrous Ammonium Sulfate with potassium dichromate',
          'Determination of viscosity of lubricating oil by Redwood Viscometer',
          'Determination of flash point and fire point of lubricants by Pensky-Martens apparatus',
        ],
      },
    ],
    resources: {
      syllabusUrl: 'https://drive.google.com/file/d/cse-sem1-chemlab-syllabus/preview',
      pyqUrl: 'https://drive.google.com/drive/folders/cse-pyq-25BS2CH101',
      lectureSlidesUrl: 'https://drive.google.com/drive/folders/cse-chemlab-viva-prep',
      labManualUrl: 'https://drive.google.com/file/d/cse-25BS2CH101-lab-manual/preview',
    },
  },
  '25ES2CS101': {
    code: '25ES2CS101',
    title: 'Programming for Problem Solving Laboratory',
    shortTitle: 'PPS Lab',
    category: 'Lab',
    credits: 1,
    instructor: 'Prof. Rajesh K. Sharma',
    room: 'Linux Lab 2 (Software Wing)',
    evaluationScheme: 'Weekly Lab Submissions (40%) + Lab Viva (20%) + End Sem Code Test (40%)',
    textbooks: ['C Programming Lab Companion by Department of CSE'],
    referenceBooks: ['The C Puzzle Book by Alan R. Feuer'],
    units: [
      {
        unitNumber: 1,
        title: 'Foundational C Programs (Exp 1 - Exp 6)',
        hours: 18,
        topics: [
          'Exp 1: Familiarization with Linux GCC compiler, terminal compilation, and basic arithmetic expressions',
          'Exp 2: Control flow programs: Roots of quadratic equation, leap year test, and calculator switch-case',
          'Exp 3: Looping: Prime numbers generation, Armstrong numbers, and Pascal triangle printing',
          'Exp 4: 1D Arrays: Linear search, binary search, bubble sort, and selection sort',
          'Exp 5: 2D Arrays: Matrix multiplication and magic square generation',
          'Exp 6: Functions & Recursion: GCD by Euclidean algorithm, Fibonacci sequence, and Tower of Hanoi',
        ],
      },
      {
        unitNumber: 2,
        title: 'Advanced Pointers, Structs & Files (Exp 7 - Exp 12)',
        hours: 18,
        topics: [
          'Exp 7: Pointers: Pointer arithmetic, swap by reference, and dynamic memory allocation using malloc',
          'Exp 8: String manipulations without string library functions (reverse, concatenate, palindrome check)',
          'Exp 9: Structures: Student record system with roll number, marks array, and grade calculation',
          'Exp 10: Array of structures and sorting records by total score',
          'Exp 11: File Handling: Count characters, words, lines in text file and copy contents to destination file',
          'Exp 12: Binary file storage of student records and random access using fseek and ftell',
        ],
      },
    ],
    resources: {
      syllabusUrl: 'https://drive.google.com/file/d/cse-sem1-ppslab-syllabus/preview',
      pyqUrl: 'https://drive.google.com/drive/folders/cse-pyq-25ES2CS101',
      lectureSlidesUrl: 'https://github.com/cse-cohort-2026/pps-lab-solutions',
      labManualUrl: 'https://drive.google.com/file/d/cse-25ES2CS101-lab-manual-complete/preview',
    },
  },
  '25ES2IT101': {
    code: '25ES2IT101',
    title: 'IT Workshop',
    shortTitle: 'IT Workshop',
    category: 'Lab',
    credits: 1,
    instructor: 'Er. Sandeep Nair',
    room: 'Hardware & Systems Lab 1',
    evaluationScheme: 'Hands-on Execution (50%) + Task Documentation (20%) + Practical Exam (30%)',
    textbooks: ['IT Workshop Lab Manual (Dept. of CSE)'],
    referenceBooks: ['Pro Git by Scott Chacon & Ben Straub', 'The Linux Command Line by William Shotts'],
    units: [
      {
        unitNumber: 1,
        title: 'PC Hardware & OS Installation Modules',
        hours: 16,
        topics: [
          'Module 1: Disassembly and assembly of PC components (Motherboard, SMPS, RAM, GPU, SATA)',
          'Module 2: BIOS/UEFI configuration, boot order, secure boot setup, and hardware diagnostics',
          'Module 3: Installing Ubuntu Linux alongside Windows (dual-boot partitioning, swap, EFI mount)',
          'Module 4: Essential Bash commands: file management (ls, cp, mv, grep, find, chmod, tar) and SSH keys',
        ],
      },
      {
        unitNumber: 2,
        title: 'Productivity Tools & Version Control',
        hours: 16,
        topics: [
          'Module 5: Git version control: git init, add, commit, branch, merge, rebase, and remote pushes to GitHub',
          'Module 6: Collaborative workflows: Pull requests, merge conflict resolution, and .gitignore discipline',
          'Module 7: Scientific documentation using LaTeX: mathematical formulas, tables, figures, and bibtex citations',
          'Module 8: Networking fundamentals: IP addressing, subnet mask, ping, traceroute, and crimping Cat6 RJ-45 cable',
        ],
      },
    ],
    resources: {
      syllabusUrl: 'https://drive.google.com/file/d/cse-sem1-it-workshop-syllabus/preview',
      pyqUrl: 'https://drive.google.com/drive/folders/cse-pyq-25ES2IT101',
      lectureSlidesUrl: 'https://drive.google.com/drive/folders/cse-itworkshop-guides',
      labManualUrl: 'https://drive.google.com/file/d/cse-it-workshop-lab-manual/preview',
    },
  },
  '25ES2EE101': {
    code: '25ES2EE101',
    title: 'Basic Electrical Engineering Laboratory',
    shortTitle: 'BEE Lab',
    category: 'Lab',
    credits: 1,
    instructor: 'Prof. K. Venkatesh',
    room: 'Machines Lab B-04',
    evaluationScheme: 'Lab Records (40%) + Viva Voce (20%) + Circuit Wiring Exam (40%)',
    textbooks: ['Laboratory Manual for Basic Electrical Engineering'],
    referenceBooks: ['Experiments in Electrical Engineering by M.A. Salaria'],
    units: [
      {
        unitNumber: 1,
        title: 'Core Circuit Theorems & Hardware Verification',
        hours: 16,
        topics: [
          'Exp 1: Verification of Kirchhoff’s Current Law (KCL) and Kirchhoff’s Voltage Law (KVL)',
          'Exp 2: Verification of Thevenin’s Theorem and Norton’s Theorem on DC resistive networks',
          'Exp 3: Verification of Superposition Theorem and Maximum Power Transfer Theorem',
          'Exp 4: Steady-state analysis of R-L-C series circuit and determination of resonance frequency and Q-factor',
        ],
      },
      {
        unitNumber: 2,
        title: 'Transformers & Power Measurements',
        hours: 16,
        topics: [
          'Exp 5: Open-Circuit (OC) and Short-Circuit (SC) tests on 1-phase transformer to determine efficiency',
          'Exp 6: Measurement of 3-phase active power using Two-Wattmeter method on balanced star/delta load',
          'Exp 7: Brake test on three-phase squirrel-cage induction motor to plot performance curves',
          'Exp 8: Demonstration of residential staircase wiring and fluorescent tube circuit with ballast',
        ],
      },
    ],
    resources: {
      syllabusUrl: 'https://drive.google.com/file/d/cse-sem1-beelab-syllabus/preview',
      pyqUrl: 'https://drive.google.com/drive/folders/cse-pyq-25ES2EE101',
      lectureSlidesUrl: 'https://drive.google.com/drive/folders/cse-beelab-viva',
      labManualUrl: 'https://drive.google.com/file/d/cse-25ES2EE101-lab-manual/preview',
    },
  },
};
