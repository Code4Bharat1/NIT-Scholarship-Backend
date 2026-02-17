import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Question from './models/question.model.js';

dotenv.config();

// ─── Your actual questions data ───────────────────────────────────
const rawQuestions = [
  { id: 1, subject: "Java", question: "Which of these is a valid Java identifier?", options: ["2variable", "_variable", "var-name", "class"], answer: "_variable" },
  { id: 2, subject: "Java", question: "What is the default value of a boolean variable in Java?", options: ["true", "false", "0", "null"], answer: "false" },
  { id: 3, subject: "Java", question: "Which keyword is used to inherit a class in Java?", options: ["extends", "implements", "inherits", "super"], answer: "extends" },
  { id: 4, subject: "Java", question: "Which of these is NOT a Java access modifier?", options: ["private", "protected", "public", "package-private"], answer: "package-private" },
  { id: 5, subject: "Java", question: "Which method is used to start a thread execution?", options: ["start()", "run()", "execute()", "init()"], answer: "start()" },
  { id: 6, subject: "Artificial Intelligence", question: "Which search algorithm is uninformed?", options: ["A* Search", "Breadth First Search", "Best First Search", "Genetic Algorithm"], answer: "Breadth First Search" },
  { id: 7, subject: "Artificial Intelligence", question: "What does PEAS stand for in AI?", options: ["Performance, Environment, Actuators, Sensors", "Performance, Efficiency, Algorithm, System", "Perception, Evaluation, Action, Strategy", "Process, Event, Action, Solution"], answer: "Performance, Environment, Actuators, Sensors" },
  { id: 8, subject: "Artificial Intelligence", question: "Which agent type uses past knowledge to make decisions?", options: ["Simple Reflex Agent", "Model-Based Agent", "Goal-Based Agent", "Utility-Based Agent"], answer: "Model-Based Agent" },
  { id: 9, subject: "Artificial Intelligence", question: "Which of these is a constraint satisfaction problem?", options: ["8-Queens Problem", "Sorting numbers", "Binary Search", "Matrix Multiplication"], answer: "8-Queens Problem" },
  { id: 10, subject: "Artificial Intelligence", question: "Which technique is used for learning from examples?", options: ["Supervised Learning", "Reinforcement Learning", "Uninformed Search", "Hill Climbing"], answer: "Supervised Learning" },
  { id: 11, subject: "Applied Mathematics", question: "What is the derivative of sin(x)?", options: ["cos(x)", "-sin(x)", "-cos(x)", "sin(x)"], answer: "cos(x)" },
  { id: 12, subject: "Applied Mathematics", question: "Integral of 1/x dx is?", options: ["ln(x) + C", "1/x + C", "x ln(x)", "e^x + C"], answer: "ln(x) + C" },
  { id: 13, subject: "Applied Mathematics", question: "If f(x)=x^2, what is f'(x)?", options: ["2x", "x^2", "x", "2"], answer: "2x" },
  { id: 14, subject: "Applied Mathematics", question: "Limit of (1+1/n)^n as n→∞ is?", options: ["0", "1", "e", "∞"], answer: "e" },
  { id: 15, subject: "Applied Mathematics", question: "Sum of first n natural numbers is?", options: ["n^2", "n(n+1)/2", "n(n-1)/2", "n^3"], answer: "n(n+1)/2" },
  { id: 16, subject: "IT Service Management", question: "Which framework is used for IT service management?", options: ["ITIL", "COBIT", "ISO 9001", "Six Sigma"], answer: "ITIL" },
  { id: 17, subject: "IT Service Management", question: "Which of these is a service lifecycle phase in ITIL?", options: ["Service Design", "Project Design", "System Analysis", "Implementation"], answer: "Service Design" },
  { id: 18, subject: "IT Service Management", question: "SLAs define?", options: ["Service Level Agreement", "Service List Access", "System Level Analysis", "Service License Agreement"], answer: "Service Level Agreement" },
  { id: 19, subject: "IT Service Management", question: "What is the purpose of incident management?", options: ["Minimize disruption", "Plan IT strategy", "Install software", "Define policies"], answer: "Minimize disruption" },
  { id: 20, subject: "IT Service Management", question: "Which process focuses on continual improvement?", options: ["CSI", "CMDB", "Change Management", "Event Management"], answer: "CSI" },
  { id: 21, subject: "Software Testing", question: "Which of the following is a black-box testing technique?", options: ["Boundary Value Analysis", "Statement Coverage", "Path Coverage", "Branch Coverage"], answer: "Boundary Value Analysis" },
  { id: 22, subject: "Software Testing", question: "Which type of testing is done after code changes?", options: ["Regression Testing", "Unit Testing", "Integration Testing", "Acceptance Testing"], answer: "Regression Testing" },
  { id: 23, subject: "Software Testing", question: "What is alpha testing?", options: ["Performed by developers", "Performed by end users", "Performed by managers", "Performed by testers externally"], answer: "Performed by developers" },
  { id: 24, subject: "Software Testing", question: "Which tool is used for automated test execution?", options: ["Selenium", "Jira", "Confluence", "Slack"], answer: "Selenium" },
  { id: 25, subject: "Software Testing", question: "Which testing checks system's compliance with requirements?", options: ["Validation Testing", "Verification Testing", "Unit Testing", "Load Testing"], answer: "Validation Testing" },
  { id: 26, subject: "Linear Algebra", question: "The determinant of a 2x2 matrix [[a,b],[c,d]] is?", options: ["ad+bc", "ad-bc", "a+b+c+d", "ab-cd"], answer: "ad-bc" },
  { id: 27, subject: "Linear Algebra", question: "Eigenvalues are calculated from?", options: ["det(A-λI)=0", "det(A+λI)=0", "A^2=I", "A^T=A"], answer: "det(A-λI)=0" },
  { id: 28, subject: "Linear Algebra", question: "Rank of a matrix is?", options: ["Number of rows", "Number of independent rows/columns", "Number of columns", "Sum of elements"], answer: "Number of independent rows/columns" },
  { id: 29, subject: "Linear Algebra", question: "Transpose of a matrix swaps?", options: ["Rows with columns", "Rows with rows", "Columns with columns", "Diagonal elements"], answer: "Rows with columns" },
  { id: 30, subject: "Linear Algebra", question: "A square matrix is invertible if?", options: ["Determinant is zero", "Determinant is non-zero", "Sum of elements is zero", "All entries are positive"], answer: "Determinant is non-zero" },
  { id: 31, subject: "Internet of Things", question: "Which protocol is widely used in IoT?", options: ["MQTT", "HTTP", "FTP", "SMTP"], answer: "MQTT" },
  { id: 32, subject: "Internet of Things", question: "Which device is used to collect sensor data?", options: ["Microcontroller", "Monitor", "Keyboard", "Printer"], answer: "Microcontroller" },
  { id: 33, subject: "Internet of Things", question: "Raspberry Pi is used as?", options: ["Single Board Computer", "Laptop", "Server", "Router"], answer: "Single Board Computer" },
  { id: 34, subject: "Internet of Things", question: "Which communication type is common in IoT?", options: ["Wireless", "Wired", "Manual", "Offline"], answer: "Wireless" },
  { id: 35, subject: "Internet of Things", question: "Which IoT component controls devices?", options: ["Actuator", "Sensor", "Router", "Server"], answer: "Actuator" },
  { id: 36, subject: "Artificial Intelligence", question: "Which algorithm uses rewards to learn?", options: ["Reinforcement Learning", "Supervised Learning", "Unsupervised Learning", "Genetic Algorithm"], answer: "Reinforcement Learning" },
  { id: 37, subject: "Applied Mathematics", question: "Cos^2(x) + Sin^2(x) equals?", options: ["0", "1", "Sin(x)", "Cos(x)"], answer: "1" },
  { id: 38, subject: "Java", question: "Which of these is used for exception handling?", options: ["try-catch", "if-else", "switch", "for loop"], answer: "try-catch" },
  { id: 39, subject: "Software Testing", question: "Unit testing is performed by?", options: ["Developer", "Tester", "End User", "Manager"], answer: "Developer" },
  { id: 40, subject: "IT Service Management", question: "CMDB stands for?", options: ["Configuration Management Database", "Change Management Database", "Control Management Database", "Configuration Monitoring Database"], answer: "Configuration Management Database" }
];

// ─── Extra questions to reach 120 total ───────────────────────────
const extraQuestions = [
  // Java (6 more → total 9)
  { subject: "Java", question: "Which collection does NOT allow duplicate elements?", options: ["ArrayList", "HashSet", "LinkedList", "Vector"], answer: "HashSet" },
  { subject: "Java", question: "What is the size of int in Java?", options: ["8 bits", "16 bits", "32 bits", "64 bits"], answer: "32 bits" },
  { subject: "Java", question: "Which keyword prevents method overriding?", options: ["final", "static", "abstract", "private"], answer: "final" },
  { subject: "Java", question: "Which class is the parent of all Java classes?", options: ["Object", "Main", "Super", "Base"], answer: "Object" },
  { subject: "Java", question: "What does JVM stand for?", options: ["Java Virtual Machine", "Java Variable Memory", "Java Visual Monitor", "Java Vector Model"], answer: "Java Virtual Machine" },
  { subject: "Java", question: "Which loop always executes at least once?", options: ["do-while", "while", "for", "for-each"], answer: "do-while" },
  { subject: "Java", question: "What is autoboxing in Java?", options: ["Auto conversion between primitive and wrapper", "Auto sorting of arrays", "Automatic garbage collection", "Auto compiling of code"], answer: "Auto conversion between primitive and wrapper" },
  { subject: "Java", question: "Which interface is implemented for sorting in Java?", options: ["Comparable", "Serializable", "Runnable", "Cloneable"], answer: "Comparable" },
  { subject: "Java", question: "What does 'static' mean in Java?", options: ["Belongs to the class", "Belongs to the object", "Cannot change value", "Is private"], answer: "Belongs to the class" },
  { subject: "Java", question: "Which Java feature allows one class to have many forms?", options: ["Polymorphism", "Abstraction", "Encapsulation", "Inheritance"], answer: "Polymorphism" },

  // AI (9 more → total 15)
  { subject: "Artificial Intelligence", question: "What is the Turing Test used for?", options: ["Testing machine intelligence", "Testing network speed", "Testing memory", "Testing CPU speed"], answer: "Testing machine intelligence" },
  { subject: "Artificial Intelligence", question: "Which is an example of a heuristic function?", options: ["Manhattan distance", "Bubble sort", "Binary search", "Linear regression"], answer: "Manhattan distance" },
  { subject: "Artificial Intelligence", question: "Natural Language Processing deals with?", options: ["Human language understanding", "Image recognition", "Robot motion", "Signal processing"], answer: "Human language understanding" },
  { subject: "Artificial Intelligence", question: "What is a neural network inspired by?", options: ["Human brain", "Computer circuits", "Robot arms", "Database systems"], answer: "Human brain" },
  { subject: "Artificial Intelligence", question: "Which is NOT a type of machine learning?", options: ["Compiled Learning", "Supervised Learning", "Unsupervised Learning", "Reinforcement Learning"], answer: "Compiled Learning" },
  { subject: "Artificial Intelligence", question: "Alpha-Beta pruning is used with?", options: ["Minimax algorithm", "Dijkstra algorithm", "BFS", "DFS"], answer: "Minimax algorithm" },
  { subject: "Artificial Intelligence", question: "Fuzzy logic handles?", options: ["Uncertainty and partial truth", "Only true/false", "Image data", "Numerical integration"], answer: "Uncertainty and partial truth" },
  { subject: "Artificial Intelligence", question: "Which is used for pattern recognition?", options: ["Deep Learning", "Linear Search", "Stack", "Queue"], answer: "Deep Learning" },
  { subject: "Artificial Intelligence", question: "Expert systems use which type of knowledge?", options: ["Domain-specific knowledge", "General knowledge", "Procedural knowledge", "Tacit knowledge"], answer: "Domain-specific knowledge" },

  // Applied Mathematics (8 more → total 15)
  { subject: "Applied Mathematics", question: "What is the value of e (Euler's number)?", options: ["2.718", "3.14", "1.618", "1.414"], answer: "2.718" },
  { subject: "Applied Mathematics", question: "Probability of an impossible event is?", options: ["0", "1", "0.5", "-1"], answer: "0" },
  { subject: "Applied Mathematics", question: "Which is the Pythagorean theorem?", options: ["a²+b²=c²", "a+b=c", "a²-b²=c", "2a+b=c²"], answer: "a²+b²=c²" },
  { subject: "Applied Mathematics", question: "What is a matrix with equal rows and columns called?", options: ["Square matrix", "Row matrix", "Column matrix", "Diagonal matrix"], answer: "Square matrix" },
  { subject: "Applied Mathematics", question: "Derivative of a constant is?", options: ["0", "1", "The constant itself", "Undefined"], answer: "0" },
  { subject: "Applied Mathematics", question: "What is the mean of [2, 4, 6, 8]?", options: ["5", "4", "6", "3"], answer: "5" },
  { subject: "Applied Mathematics", question: "log(1) = ?", options: ["0", "1", "e", "Undefined"], answer: "0" },
  { subject: "Applied Mathematics", question: "What is a permutation?", options: ["Ordered arrangement", "Unordered selection", "Random distribution", "Set intersection"], answer: "Ordered arrangement" },
  { subject: "Applied Mathematics", question: "Binomial theorem expands?", options: ["(a+b)^n", "a^n + b^n", "a*b", "a/b"], answer: "(a+b)^n" },
  { subject: "Applied Mathematics", question: "Standard deviation measures?", options: ["Spread of data", "Center of data", "Size of data", "Mode of data"], answer: "Spread of data" },

  // IT Service Management (5 more → total 10)
  { subject: "IT Service Management", question: "What is a service catalog?", options: ["List of available IT services", "List of employees", "Hardware inventory", "Bug tracker"], answer: "List of available IT services" },
  { subject: "IT Service Management", question: "Change management aims to?", options: ["Reduce risk of changes", "Add new servers", "Test software", "Monitor networks"], answer: "Reduce risk of changes" },
  { subject: "IT Service Management", question: "Problem management deals with?", options: ["Root cause analysis", "User complaints", "Hardware replacement", "Data backup"], answer: "Root cause analysis" },
  { subject: "IT Service Management", question: "Service desk is responsible for?", options: ["Single point of contact for users", "Development", "Testing", "Deployment"], answer: "Single point of contact for users" },
  { subject: "IT Service Management", question: "What does OLA stand for?", options: ["Operational Level Agreement", "Objective Level Analysis", "Operational List of Actions", "Order Level Agreement"], answer: "Operational Level Agreement" },

  // Software Testing (6 more → total 11)
  { subject: "Software Testing", question: "What is a test case?", options: ["Set of conditions to test a feature", "Bug report", "Source code", "Deployment script"], answer: "Set of conditions to test a feature" },
  { subject: "Software Testing", question: "Smoke testing is?", options: ["Preliminary testing to check basics", "Performance testing", "Security testing", "Load testing"], answer: "Preliminary testing to check basics" },
  { subject: "Software Testing", question: "Which testing is done without executing code?", options: ["Static testing", "Dynamic testing", "Load testing", "Stress testing"], answer: "Static testing" },
  { subject: "Software Testing", question: "What is mutation testing?", options: ["Testing by modifying source code", "Testing performance", "Testing UI", "Testing database"], answer: "Testing by modifying source code" },
  { subject: "Software Testing", question: "Which document defines what to test?", options: ["Test Plan", "Bug Report", "SRS", "API Docs"], answer: "Test Plan" },
  { subject: "Software Testing", question: "Equivalence partitioning divides inputs into?", options: ["Valid and invalid classes", "Small and large", "Odd and even", "Fast and slow"], answer: "Valid and invalid classes" },

  // Linear Algebra (5 more → total 10)
  { subject: "Linear Algebra", question: "A matrix multiplied by its inverse gives?", options: ["Identity matrix", "Zero matrix", "Original matrix", "Transpose"], answer: "Identity matrix" },
  { subject: "Linear Algebra", question: "What is a vector space?", options: ["Set closed under addition and scalar multiplication", "A 3D coordinate", "An array of numbers", "A row matrix"], answer: "Set closed under addition and scalar multiplication" },
  { subject: "Linear Algebra", question: "Orthogonal vectors have dot product equal to?", options: ["0", "1", "-1", "Infinity"], answer: "0" },
  { subject: "Linear Algebra", question: "What is a diagonal matrix?", options: ["Non-diagonal elements are zero", "All elements are equal", "All rows are same", "Symmetric matrix"], answer: "Non-diagonal elements are zero" },
  { subject: "Linear Algebra", question: "Trace of a matrix is the sum of?", options: ["Diagonal elements", "All elements", "Off-diagonal elements", "Row elements"], answer: "Diagonal elements" },

  // Internet of Things (5 more → total 10)
  { subject: "Internet of Things", question: "What is edge computing in IoT?", options: ["Processing near the data source", "Processing in cloud", "Processing in data center", "Processing offline"], answer: "Processing near the data source" },
  { subject: "Internet of Things", question: "Which IoT layer senses physical data?", options: ["Perception layer", "Network layer", "Application layer", "Transport layer"], answer: "Perception layer" },
  { subject: "Internet of Things", question: "Arduino is primarily used as?", options: ["Microcontroller board", "Operating system", "Cloud service", "Database"], answer: "Microcontroller board" },
  { subject: "Internet of Things", question: "What does IP stand for in networking?", options: ["Internet Protocol", "Internal Process", "Interface Port", "Input Parameter"], answer: "Internet Protocol" },
  { subject: "Internet of Things", question: "ZigBee is a?", options: ["Wireless communication standard", "Programming language", "Database system", "Cloud platform"], answer: "Wireless communication standard" }
];

// ─── Convert raw JSON format → DB schema format ───────────────────
// JSON has: answer as text string (e.g. "_variable")
// DB needs: correctAnswer as key  (e.g. "B")
const convertQuestion = (raw, questionNumber) => {
  const keys = ['A', 'B', 'C', 'D'];

  const options = raw.options.map((text, idx) => ({
    optionKey: keys[idx],
    optionText: text
  }));

  // Find which key (A/B/C/D) matches the answer text
  const answerIndex = raw.options.findIndex(opt => opt === raw.answer);
  const correctAnswer = keys[answerIndex];

  if (answerIndex === -1) {
    console.warn(`⚠️  Answer not found for Q${questionNumber}: "${raw.answer}"`);
  }

  return {
    questionNumber,
    questionText: raw.question,
    options,
    correctAnswer,
    subject: raw.subject,
    difficulty: 'medium',
    marks: 1,
    isActive: true
  };
};

// ─── Main seed function ────────────────────────────────────────────
const seedQuestions = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');

    // Clear existing questions
    await Question.deleteMany({});
    console.log('🗑️  Old questions cleared');

    // Combine real + extra questions
    const allRaw = [...rawQuestions, ...extraQuestions];

    // Build 120 questions (repeat cycle if less than 120)
    const formatted = [];
    for (let i = 0; i < 120; i++) {
      const raw = allRaw[i % allRaw.length];
      formatted.push(convertQuestion(raw, i + 1));
    }

    await Question.insertMany(formatted);

    // Summary by subject
    const subjects = {};
    formatted.forEach(q => {
      subjects[q.subject] = (subjects[q.subject] || 0) + 1;
    });

    console.log('\n✅ 120 Questions seeded successfully!\n');
    console.log('📊 Questions per subject:');
    Object.entries(subjects).forEach(([subj, count]) => {
      console.log(`   ${subj}: ${count}`);
    });

    console.log('\n🚀 Run your server and try GET /api/exam/questions again!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding questions:', error.message);
    process.exit(1);
  }
};

seedQuestions();