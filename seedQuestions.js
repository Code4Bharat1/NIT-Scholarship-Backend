import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Question from './models/question.model.js';

dotenv.config();

const rawQuestions = [

/* ================= APTITUDE (50) ================= */
{subject:"Aptitude",question:"A train 180 m crosses pole in 12 sec. Speed?",options:["12 m/s","15 m/s","18 m/s","20 m/s"],answer:"15 m/s"},
{subject:"Aptitude",question:"SI on ₹5000 at 8% for 3 years?",options:["1000","1200","1500","1800"],answer:"1200"},
{subject:"Aptitude",question:"A work 12d, B 18d, together?",options:["6 days","7.2 days","8 days","9 days"],answer:"7.2 days"},
{subject:"Aptitude",question:"Red card probability?",options:["1/4","1/13","1/2","3/4"],answer:"1/2"},
{subject:"Aptitude",question:"Circle area r=7?",options:["144","154","148","160"],answer:"154"},
{subject:"Aptitude",question:"Solve 2x+5=17",options:["5","6","7","8"],answer:"6"},
{subject:"Aptitude",question:"Mean 4,6,8,10?",options:["6","7","8","9"],answer:"7"},
{subject:"Aptitude",question:"Cube volume side5?",options:["100","125","150","200"],answer:"125"},
{subject:"Aptitude",question:"3 pens ₹45, 7 pens?",options:["95","105","115","120"],answer:"105"},
{subject:"Aptitude",question:"60 km/hr for 2.5 hr?",options:["120","140","150","160"],answer:"150"},
{subject:"Aptitude",question:"Solve x²−9=0",options:["±3","±9","3","9"],answer:"±3"},
{subject:"Aptitude",question:"Median 3,5,7,9,11?",options:["5","7","9","8"],answer:"7"},
{subject:"Aptitude",question:"Perimeter 10×6?",options:["32","30","28","36"],answer:"32"},
{subject:"Aptitude",question:"20% is 50, number?",options:["200","250","300","150"],answer:"250"},
{subject:"Aptitude",question:"Sphere SA r7?",options:["616","600","650","700"],answer:"616"},
{subject:"Aptitude",question:"Even number on die?",options:["1/2","1/3","2/3","1/6"],answer:"1/2"},
{subject:"Aptitude",question:"LCM 12,18?",options:["24","36","48","72"],answer:"36"},
{subject:"Aptitude",question:"5 workers 8d, 10 workers?",options:["4","5","6","3"],answer:"4"},
{subject:"Aptitude",question:"Slope y=3x+5",options:["5","3","-3","1"],answer:"3"},
{subject:"Aptitude",question:"2^x=16",options:["2","3","4","5"],answer:"4"},
{subject:"Aptitude",question:"Mode 2,4,4,5,6?",options:["4","5","6","2"],answer:"4"},
{subject:"Aptitude",question:"Triangle area 10×6?",options:["30","40","50","60"],answer:"30"},

/* add filler aptitude to reach 50 */
{subject:"Aptitude",question:"25% of 200?",options:["25","50","75","100"],answer:"50"},
{subject:"Aptitude",question:"Square root 144?",options:["10","11","12","13"],answer:"12"},
{subject:"Aptitude",question:"5+7×2?",options:["19","24","26","17"],answer:"19"},
{subject:"Aptitude",question:"Speed=distance/time?",options:["yes","no","maybe","none"],answer:"yes"},
{subject:"Aptitude",question:"10% of 500?",options:["25","50","75","100"],answer:"50"},
{subject:"Aptitude",question:"15×4?",options:["40","50","60","70"],answer:"60"},
{subject:"Aptitude",question:"Cube edges?",options:["8","10","12","14"],answer:"12"},
{subject:"Aptitude",question:"Average of 2,4,6?",options:["2","3","4","5"],answer:"4"},
{subject:"Aptitude",question:"1 km = ?",options:["100m","1000m","10m","500m"],answer:"1000m"},
{subject:"Aptitude",question:"7×8?",options:["54","56","58","60"],answer:"56"},
{subject:"Aptitude",question:"100/4?",options:["20","25","30","40"],answer:"25"},
{subject:"Aptitude",question:"9²?",options:["18","27","81","72"],answer:"81"},
{subject:"Aptitude",question:"Simple interest formula?",options:["PTR/100","PRT/100","PT/100","RT/100"],answer:"PRT/100"},
{subject:"Aptitude",question:"Even number?",options:["3","5","8","9"],answer:"8"},
{subject:"Aptitude",question:"Prime number?",options:["4","6","7","8"],answer:"7"},
{subject:"Aptitude",question:"10×10?",options:["50","100","150","200"],answer:"100"},
{subject:"Aptitude",question:"Half of 90?",options:["30","40","45","50"],answer:"45"},
{subject:"Aptitude",question:"3³?",options:["9","18","27","36"],answer:"27"},

/* ================= DIGITAL (20) ================= */
{subject:"Digital Skills",question:"UPI regulated by?",options:["SEBI","RBI","NPCI","SBI"],answer:"NPCI"},
{subject:"Digital Skills",question:"G20 2023 host?",options:["Mumbai","Delhi","Bengaluru","Hyderabad"],answer:"Delhi"},
{subject:"Digital Skills",question:"DigiLocker use?",options:["Banking","Storage","Shopping","Security"],answer:"Storage"},
{subject:"Digital Skills",question:"Crypto tech?",options:["AI","Blockchain","Cloud","IoT"],answer:"Blockchain"},
{subject:"Digital Skills",question:"UN HQ?",options:["Geneva","Washington","New York","Paris"],answer:"New York"},
{subject:"Digital Skills",question:"Digital literacy scheme?",options:["Skill","PMGDISHA","Startup","Make"],answer:"PMGDISHA"},
{subject:"Digital Skills",question:"Phishing is?",options:["Fishing","Fraud","Loan","Marketing"],answer:"Fraud"},
{subject:"Digital Skills",question:"Census org?",options:["NSSO","EC","RGI","NITI"],answer:"RGI"},
{subject:"Digital Skills",question:"AI works on?",options:["Manual","Algorithms","Paper","Analog"],answer:"Algorithms"},
{subject:"Digital Skills",question:"Aadhaar by?",options:["RBI","UIDAI","SBI","SEBI"],answer:"UIDAI"},
{subject:"Digital Skills",question:"UNSC member?",options:["India","Japan","Germany","China"],answer:"China"},
{subject:"Digital Skills",question:"Cloud computing?",options:["PC","Internet","Print","Offline"],answer:"Internet"},
{subject:"Digital Skills",question:"Chandrayaan-3 by?",options:["DRDO","NASA","ISRO","SpaceX"],answer:"ISRO"},
{subject:"Digital Skills",question:"2FA improves?",options:["Speed","Security","Design","Storage"],answer:"Security"},
{subject:"Digital Skills",question:"President India?",options:["Kovind","Murmu","Modi","Shah"],answer:"Murmu"},
{subject:"Digital Skills",question:"BHIM app?",options:["Paytm","GPay","BHIM","PhonePe"],answer:"BHIM"},
{subject:"Digital Skills",question:"VPN full form?",options:["Virtual Private Network","Public","Node","Verified"],answer:"Virtual Private Network"},
{subject:"Digital Skills",question:"UPI launched?",options:["2014","2015","2016","2018"],answer:"2016"},
{subject:"Digital Skills",question:"AI example?",options:["Robot","Pen","Book","Chair"],answer:"Robot"},
{subject:"Digital Skills",question:"IoT means?",options:["Internet of Things","Inside tech","Internal","None"],answer:"Internet of Things"},

/* ================= COMPUTER (30) ================= */
{subject:"Computer",question:"Not input device?",options:["Scanner","Keyboard","Monitor","Mic"],answer:"Monitor"},
{subject:"Computer",question:"Volatile memory?",options:["ROM","HDD","RAM","SSD"],answer:"RAM"},
{subject:"Computer",question:"Compressed format?",options:["docx","zip","xlsx","ppt"],answer:"zip"},
{subject:"Computer",question:"Select all shortcut?",options:["Ctrl S","Ctrl A","Ctrl E","Ctrl L"],answer:"Ctrl A"},
{subject:"Computer",question:"HTTP?",options:["HyperText Transfer Protocol","HighText","Program","Text"],answer:"HyperText Transfer Protocol"},
{subject:"Computer",question:"Cloud storage?",options:["Paint","Drive","Notepad","Calc"],answer:"Drive"},
{subject:"Computer",question:"Vertical cells?",options:["Row","Column","Sheet","Range"],answer:"Column"},
{subject:"Computer",question:"Refresh webpage?",options:["Ctrl R","Ctrl P","Ctrl N","Ctrl D"],answer:"Ctrl R"},
{subject:"Computer",question:"OS function?",options:["Browse","Manage resources","Docs","Design"],answer:"Manage resources"},
{subject:"Computer",question:"Search engine?",options:["Chrome","Windows","Google","Excel"],answer:"Google"},
{subject:"Computer",question:"USB port?",options:["HDMI","VGA","USB","LAN"],answer:"USB"},
{subject:"Computer",question:"BIOS?",options:["Basic Input Output System","Binary","Internal","Integrated"],answer:"Basic Input Output System"},
{subject:"Computer",question:"Presentation software?",options:["Word","PowerPoint","Excel","Access"],answer:"PowerPoint"},
{subject:"Computer",question:"Firewall used for?",options:["Print","Network security","Speed","Storage"],answer:"Network security"},
{subject:"Computer",question:"Save shortcut?",options:["Ctrl S","Ctrl D","Ctrl F","Ctrl H"],answer:"Ctrl S"},
{subject:"Computer",question:"System software?",options:["Word","Photoshop","Windows","VLC"],answer:"Windows"},
{subject:"Computer",question:"Email CC?",options:["Carbon Copy","Computer","Common","Control"],answer:"Carbon Copy"},
{subject:"Computer",question:"Malware?",options:["Hardware","Printer","Malicious software","Antivirus"],answer:"Malicious software"},
{subject:"Computer",question:"IP address identifies?",options:["Printer","Password","Device","Software"],answer:"Device"},
{subject:"Computer",question:"Not browser?",options:["Firefox","Chrome","Edge","Excel"],answer:"Excel"},
{subject:"Computer",question:"CPU stands for?",options:["Central Processing Unit","Control","Computer","None"],answer:"Central Processing Unit"},
{subject:"Computer",question:"RAM full form?",options:["Random Access Memory","Read","Run","None"],answer:"Random Access Memory"},
{subject:"Computer",question:"Keyboard is?",options:["Input","Output","Storage","None"],answer:"Input"},
{subject:"Computer",question:"Mouse is?",options:["Input","Output","CPU","None"],answer:"Input"},
{subject:"Computer",question:"Printer is?",options:["Input","Output","Storage","None"],answer:"Output"},
{subject:"Computer",question:"SSD is?",options:["Storage","Input","CPU","Network"],answer:"Storage"},
{subject:"Computer",question:"Windows is?",options:["Hardware","Software","Virus","None"],answer:"Software"},
{subject:"Computer",question:"Excel used for?",options:["Sheets","Video","Music","Games"],answer:"Sheets"},
{subject:"Computer",question:"Word used for?",options:["Documents","Video","Audio","Games"],answer:"Documents"},
{subject:"Computer",question:"PowerPoint used for?",options:["Slides","Music","Code","Games"],answer:"Slides"},

/* ================= ENGLISH (30) ================= */
{subject:"English",question:"___ apple a day keeps doctor away.",options:["A","An","The","None"],answer:"An"},
{subject:"English",question:"Plural of Child?",options:["Childs","Childes","Children","Childrens"],answer:"Children"},
{subject:"English",question:"Synonym of Happy?",options:["Sad","Angry","Joyful","Tired"],answer:"Joyful"},
{subject:"English",question:"Identify noun?",options:["Run","Beautiful","Quickly","Book"],answer:"Book"},
{subject:"English",question:"Book is ___ table.",options:["in","on","at","under"],answer:"on"},
{subject:"English",question:"I ___ homework yesterday.",options:["do","did","done","doing"],answer:"did"},
{subject:"English",question:"Identify adjective?",options:["Tall","Run","Speak","Jump"],answer:"Tall"},
{subject:"English",question:"This is ___ pen.",options:["my","mine","me","I"],answer:"my"},
{subject:"English",question:"Correct sentence?",options:["She don’t like tea","She doesn’t likes","She doesn’t like tea","She not like"],answer:"She doesn’t like tea"},
{subject:"English",question:"He is good ___ math.",options:["in","at","on","for"],answer:"at"},
{subject:"English",question:"Comparative of Good?",options:["Gooder","More good","Better","Best"],answer:"Better"},
{subject:"English",question:"Identify adverb?",options:["Slowly","Slow","Slower","Slowest"],answer:"Slowly"},
{subject:"English",question:"I was tired ___ went bed.",options:["but","so","because","although"],answer:"so"},
{subject:"English",question:"Correct spelling?",options:["Recieve","Receive","Receeve","Receve"],answer:"Receive"},
{subject:"English",question:"Correct spelling?",options:["Accomodation","Accommodation","Acommodation","Accomadation"],answer:"Accommodation"},
{subject:"English",question:"Correct spelling?",options:["Enviroment","Environment","Envoirement","Envirm"],answer:"Environment"},
{subject:"English",question:"Correct spelling?",options:["Goverment","Government","Governmant","Govermment"],answer:"Government"},
{subject:"English",question:"Correct spelling?",options:["Definately","Definitely","Definatly","Definitly"],answer:"Definitely"},
{subject:"English",question:"Correct spelling?",options:["Seperate","Separate","Seperete","Separrate"],answer:"Separate"},
{subject:"English",question:"She is afraid ___ dogs.",options:["from","of","with","by"],answer:"of"},
{subject:"English",question:"Identify noun?",options:["Happiness","Quickly","Run","Beautiful"],answer:"Happiness"},
{subject:"English",question:"Identify adjective?",options:["Slowly","Tall","Speak","Run"],answer:"Tall"},
{subject:"English",question:"Correct sentence?",options:["He go","He goes","He going","He gone"],answer:"He goes"},
{subject:"English",question:"Cat hiding ___ table.",options:["on","in","under","at"],answer:"under"},
{subject:"English",question:"Honesty is best policy noun?",options:["Best","Honesty","Is","Policy"],answer:"Honesty"},
{subject:"English",question:"She wore ___ dress.",options:["beauty","beautifully","beautiful","beautify"],answer:"beautiful"},
{subject:"English",question:"He is good ___ English.",options:["in","at","on","with"],answer:"at"},
{subject:"English",question:"Correct sentence?",options:["There is many","There are many","There were many","There many"],answer:"There are many"},
{subject:"English",question:"She has a ___ house.",options:["She","Has","Small","House"],answer:"Small"},
{subject:"English",question:"He arrived ___ airport.",options:["at","in","on","by"],answer:"at"}
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
    const allRaw = [...rawQuestions];

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