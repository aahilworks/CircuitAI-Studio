'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, getDocs, query, orderBy, doc, setDoc, onSnapshot } from 'firebase/firestore';
import AuthModal from '@/lib/components/AuthModal';
import CollaborationPanel from '@/lib/components/CollaborationPanel';
import { initiateProSubscription } from '@/lib/razorpayCheckout';
import { hasActiveProAccess } from '@/lib/proAccess';
import {
  ArrowRight,
  Award,
  Cable,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock3,
  ClipboardList,
  Code2,
  Cpu,
  CreditCard,
  Crown,
  Download,
  Edit3,
  FileText,
  FlaskConical,
  Gauge,
  GraduationCap,
  Lightbulb,
  Lock,
  Maximize2,
  Menu,
  MonitorPlay,
  PackageCheck,
  PlayCircle,
  Plus,
  Presentation,
  Printer,
  RefreshCw,
  RotateCcw,
  Search,
  Share2,
  ShieldAlert,
  ShoppingCart,
  Sparkles,
  Store,
  UploadCloud,
  Users,
  Wrench,
  X,
} from 'lucide-react';

interface BOMItem {
  item: string;
  quantity: number;
  estimated_price?: string;
  buying_tip?: string;
  alternative?: string;
}

interface Connection {
  from: string;
  to: string;
}

interface ProjectData {
  project_title: string;
  target_board: string;
  bill_of_materials: BOMItem[];
  tools_needed: string[];
  connections: Connection[];
  warnings: string[];
  steps: string[];
  code: string;
  secondary_code?: string;
  secondary_language?: string;
  youtube_search_query?: string;
  estimated_time?: string;
  difficulty?: string;
  safety_level?: string;
  learning_goals?: string[];
  test_plan?: string[];
  troubleshooting?: string[];
  next_upgrades?: string[];
  upload_guide?: {
    ide: string;
    board_package: string;
    required_libraries: string[];
    steps: string[];
    serial_monitor: string;
    common_errors: string[];
    upload_checklist: string[];
  };
  simulation?: {
    inputs: string[];
    outputs: string[];
    states: string[];
    sample_readings: string[];
    expected_behavior: string[];
  };
  teacher_mode?: {
    abstract: string;
    working_principle: string;
    applications: string[];
    viva_questions: string[];
    rubric: string[];
    conclusion: string;
  };
  code_explanation?: {
    concept: string;
    code_reference: string;
    explanation: string;
  }[];
  presentation_slides?: {
    title: string;
    bullets: string[];
    speaker_notes: string;
  }[];
}

interface QuizQuestion {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

interface ChatSession {
  id: string;
  title: string;
  target_board: string;
  lastUpdated: string;
  projectData: ProjectData | null;
}

interface GenerateErrorPayload {
  error?: string;
  message?: string;
}

const starterExamples = [
  'Bluetooth controlled rover with obstacle avoidance',
  'Line follower robot with speed tuning and test checklist',
  'Ultrasonic radar scanner with Processing dashboard',
  'Gesture controlled robot arm using servo motors',
];

const proBenefits = [
  'Unlimited AI project generations',
  'Unlimited modifications for every build',
  'PDF / print teacher reports',
  'Advanced visual wiring diagrams',
  'Board-specific code upload guide',
  'Premium simulation lab',
  'Smart parts shopping list',
  'Teacher report mode with viva questions',
  'Unlimited saved project history',
  'Board conversion workflows',
  'Code explanations for easier learning',
];

const QUIZ_DURATION_SECONDS = 10 * 60;

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [modifyPrompt, setModifyPrompt] = useState('');
  const [board, setBoard] = useState('Arduino Uno');
  const [loading, setLoading] = useState(false);
  const [modifying, setModifying] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [data, setData] = useState<ProjectData | null>(null);
  const [historySessions, setHistorySessions] = useState<ChatSession[]>([]);
  const [historySearch, setHistorySearch] = useState('');
  const [historyBoardFilter, setHistoryBoardFilter] = useState('All');
  const [activeTab, setActiveTab] = useState<'code' | 'secondary' | 'wiring' | 'guide' | 'upload' | 'test' | 'sim' | 'learn' | 'shop' | 'report' | 'quiz' | 'explain' | 'present'>('code');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [isProUser, setIsProUser] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizSecondsRemaining, setQuizSecondsRemaining] = useState(600);
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});
  const [presentationSlideIndex, setPresentationSlideIndex] = useState(0);
  const [isPresentationFullscreen, setIsPresentationFullscreen] = useState(false);
  const [showCollaborationPanel, setShowCollaborationPanel] = useState(false);

  const resetWorkspace = useCallback(() => {
    setCurrentSessionId(null);
    setData(null);
    setPrompt('');
    setModifyPrompt('');
    setActiveTab('code');
    setIsMobileSidebarOpen(false);
    setQuizStarted(false);
    setQuizSubmitted(false);
    setQuizSecondsRemaining(QUIZ_DURATION_SECONDS);
    setQuizAnswers({});
    setPresentationSlideIndex(0);
    setIsPresentationFullscreen(false);
  }, []);

  const fetchSidebarHistory = useCallback(async (userId: string) => {
    try {
      const q = query(collection(db, 'users', userId, 'chatSessions'), orderBy('lastUpdated', 'desc'));
      const snapshot = await getDocs(q);
      const sessions = snapshot.docs.map((sessionDoc) => ({ id: sessionDoc.id, ...sessionDoc.data() })) as ChatSession[];
      setHistorySessions(sessions);
    } catch (err) {
      console.error('Sidebar history loading failed:', err);
    }
  }, []);

  const boardFilters = useMemo(() => {
    const boards = historySessions
      .map((session) => session.target_board)
      .filter((sessionBoard): sessionBoard is string => !!sessionBoard);

    return ['All', ...Array.from(new Set(boards))];
  }, [historySessions]);

  const filteredHistorySessions = useMemo(() => {
    const search = historySearch.trim().toLowerCase();

    return historySessions.filter((session) => {
      const matchesSearch = !search || `${session.title} ${session.target_board}`.toLowerCase().includes(search);
      const matchesBoard = historyBoardFilter === 'All' || session.target_board === historyBoardFilter;
      return matchesSearch && matchesBoard;
    });
  }, [historyBoardFilter, historySearch, historySessions]);

  const uploadGuide = useMemo(() => ({
    ide: data?.upload_guide?.ide || 'Arduino IDE 2.x',
    board_package: data?.upload_guide?.board_package || `Install/select the package for ${data?.target_board || board}.`,
    required_libraries: data?.upload_guide?.required_libraries?.length ? data.upload_guide.required_libraries : ['Install libraries used in the generated firmware from Library Manager.'],
    steps: data?.upload_guide?.steps?.length ? data.upload_guide.steps : [
      'Connect the board using a data-capable USB cable.',
      `Select ${data?.target_board || board} from the board menu.`,
      'Select the correct serial port, paste the firmware, then click upload.',
      'Open Serial Monitor after upload and confirm startup messages or sensor readings.',
    ],
    serial_monitor: data?.upload_guide?.serial_monitor || 'Set baud rate to the value used in Serial.begin(...) inside the generated firmware.',
    common_errors: data?.upload_guide?.common_errors?.length ? data.upload_guide.common_errors : [
      'Wrong board or processor selected in the IDE.',
      'USB cable is charge-only, damaged, or connected through an unstable hub.',
      'Missing library dependency or incorrect pin mapping.',
    ],
    upload_checklist: data?.upload_guide?.upload_checklist?.length ? data.upload_guide.upload_checklist : [
      'Board selected',
      'Port selected',
      'Libraries installed',
      'Motors powered safely',
      'Common ground connected',
    ],
  }), [board, data]);

  const simulationPlan = useMemo(() => ({
    inputs: data?.simulation?.inputs?.length ? data.simulation.inputs : ['Sensor input values', 'Button or command state', 'Battery/power state'],
    outputs: data?.simulation?.outputs?.length ? data.simulation.outputs : ['Motor output', 'LED or buzzer output', 'Serial monitor logs'],
    states: data?.simulation?.states?.length ? data.simulation.states : ['Idle', 'Reading sensors', 'Actuating output', 'Fault or stop state'],
    sample_readings: data?.simulation?.sample_readings?.length ? data.simulation.sample_readings : ['Normal reading: stable sensor value', 'Trigger reading: threshold crossed', 'Fault reading: disconnected or noisy sensor'],
    expected_behavior: data?.simulation?.expected_behavior?.length ? data.simulation.expected_behavior : ['When the input crosses the threshold, the robot should change output state.', 'If readings are unstable, calibrate sensors and check power/ground.'],
  }), [data]);

  const codeExplanations = useMemo(() => {
    if (!data) return [];
    if (data.code_explanation?.length) return data.code_explanation;

    const codeLines = data.code.split('\n');
    const references = [
      codeLines.find((line) => line.includes('#include')) || 'Library includes',
      codeLines.find((line) => line.includes('void setup')) || 'void setup()',
      codeLines.find((line) => line.includes('pinMode')) || 'pinMode(...)',
      codeLines.find((line) => line.includes('void loop')) || 'void loop()',
      codeLines.find((line) => line.includes('digitalRead') || line.includes('analogRead')) || 'sensor/input read',
      codeLines.find((line) => line.includes('digitalWrite') || line.includes('analogWrite')) || 'output control',
      codeLines.find((line) => line.includes('Serial.')) || 'Serial monitor',
    ];

    return [
      { concept: 'Libraries', code_reference: references[0], explanation: 'Libraries add ready-made functions for sensors, displays, motor drivers, or communication modules used by the project.' },
      { concept: 'Setup block', code_reference: references[1], explanation: 'The setup function runs once after reset. It prepares pins, communication, sensors, and starting states.' },
      { concept: 'Pin configuration', code_reference: references[2], explanation: 'Pin modes tell the board whether each pin will read a signal or control an output.' },
      { concept: 'Main loop', code_reference: references[3], explanation: 'The loop function repeats continuously, which is how the robot keeps reading inputs and reacting.' },
      { concept: 'Input reading', code_reference: references[4], explanation: 'Input reads collect sensor values, button states, or commands that decide what the robot should do next.' },
      { concept: 'Output control', code_reference: references[5], explanation: 'Output commands drive motors, LEDs, buzzers, servos, or other actuators based on the project logic.' },
      { concept: 'Debugging', code_reference: references[6], explanation: 'Serial output helps students confirm readings and debug problems without guessing.' },
    ];
  }, [data]);

  const presentationSlides = useMemo(() => {
    if (!data) return [];
    if (data.presentation_slides?.length) return data.presentation_slides.slice(0, 5);

    return [
      {
        title: 'Aim',
        bullets: [`Build ${data.project_title}`, `Use ${data.target_board}`, data.difficulty ? `Difficulty: ${data.difficulty}` : 'Student-friendly robotics prototype'],
        speaker_notes: `Introduce the goal of ${data.project_title} and explain why this project is useful for learning robotics.`,
      },
      {
        title: 'Components',
        bullets: data.bill_of_materials.slice(0, 5).map((item) => `${item.quantity} x ${item.item}`),
        speaker_notes: 'Explain the main components, their purpose, and why each one is required.',
      },
      {
        title: 'Circuit & Code',
        bullets: [
          `${data.connections.length} wiring connections`,
          `${uploadGuide.ide} upload workflow`,
          'Firmware controls inputs, decisions, and outputs',
        ],
        speaker_notes: 'Show how the controller connects to modules and how the firmware controls the robot behavior.',
      },
      {
        title: 'Working & Testing',
        bullets: (data.test_plan?.length ? data.test_plan : simulationPlan.expected_behavior).slice(0, 4),
        speaker_notes: 'Describe how the project works and how you tested it step by step.',
      },
      {
        title: 'Result & Future Scope',
        bullets: (data.next_upgrades?.length ? data.next_upgrades : ['Improve enclosure', 'Add data logging', 'Add wireless dashboard']).slice(0, 4),
        speaker_notes: 'Conclude with the result, what you learned, and possible improvements.',
      },
    ];
  }, [data, simulationPlan.expected_behavior, uploadGuide.ide]);

  const currentPresentationSlide = presentationSlides[Math.min(presentationSlideIndex, Math.max(presentationSlides.length - 1, 0))];

  const goToPreviousSlide = useCallback(() => {
    setPresentationSlideIndex((index) => Math.max(index - 1, 0));
  }, []);

  const goToNextSlide = useCallback(() => {
    setPresentationSlideIndex((index) => Math.min(index + 1, Math.max(presentationSlides.length - 1, 0)));
  }, [presentationSlides.length]);

  const openPresentationFullscreen = async () => {
    setIsPresentationFullscreen(true);

    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      // Browser fullscreen can fail if permissions are blocked; the in-app overlay still works.
    }
  };

  const closePresentationFullscreen = async () => {
    setIsPresentationFullscreen(false);

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
    } catch {
      // Keep closing the in-app overlay even if the browser fullscreen API rejects.
    }
  };

  const quizQuestions = useMemo<QuizQuestion[]>(() => {
    if (!data) return [];

    const firstBom = data.bill_of_materials?.[0]?.item || 'main sensor/module';
    const secondBom = data.bill_of_materials?.[1]?.item || 'supporting module';
    const firstTool = data.tools_needed?.[0] || 'programming IDE';
    const firstConnection = data.connections?.[0];
    const firstWarning = data.warnings?.[0] || 'Verify wiring and power before switching on hardware.';
    const firstLearningGoal = data.learning_goals?.[0] || 'Understand how inputs, outputs, and controller logic work together.';
    const firstTest = data.test_plan?.[0] || 'Power from USB first and verify basic readings.';
    const firstTrouble = data.troubleshooting?.[0] || 'Check wiring, common ground, board selection, and libraries.';
    const firstViva = data.teacher_mode?.viva_questions?.[0] || `What is the role of ${data.target_board} in this project?`;

    return [
      {
        question: 'Which controller board is this project designed for?',
        options: [data.target_board, 'Arduino Mega only', 'Raspberry Pi only', 'No controller is required'],
        answer: data.target_board,
        explanation: `The project target board is ${data.target_board}, so wiring and upload settings should match it.`,
      },
      {
        question: 'Which component is part of the required materials list?',
        options: [firstBom, '230V AC transformer', 'Soldering smoke extractor only', 'Laptop charger coil'],
        answer: firstBom,
        explanation: `${firstBom} appears in the generated bill of materials.`,
      },
      {
        question: 'What is the best first safety action before powering this build?',
        options: [firstWarning, 'Connect motors directly to signal pins', 'Skip polarity checks', 'Use the highest voltage available'],
        answer: firstWarning,
        explanation: 'Safety checks come before hardware power, especially for motors, batteries, and polarity.',
      },
      {
        question: 'Which tool or setup item is listed for the workspace?',
        options: [firstTool, 'Kitchen knife', 'Mains wall outlet tester', 'Car battery charger'],
        answer: firstTool,
        explanation: `${firstTool} is listed as a tool/setup requirement for this build.`,
      },
      {
        question: firstConnection ? 'What is one correct wiring connection from the plan?' : 'What should wiring instructions always include?',
        options: firstConnection ? [`${firstConnection.from} -> ${firstConnection.to}`, `${firstConnection.to} -> USB shell`, 'Motor power -> Arduino signal pin', 'Battery positive -> GND'] : ['Clear pin-to-pin connections', 'Random wire colors only', 'No ground reference', 'Only component names'],
        answer: firstConnection ? `${firstConnection.from} -> ${firstConnection.to}` : 'Clear pin-to-pin connections',
        explanation: firstConnection ? 'This connection comes from the generated wiring list.' : 'Students need clear source and destination pins to wire safely.',
      },
      {
        question: `What should you do first when uploading code to ${data.target_board}?`,
        options: [uploadGuide.steps[0], 'Disconnect all USB cables forever', 'Delete installed libraries', 'Select a random board'],
        answer: uploadGuide.steps[0],
        explanation: 'The upload guide is ordered so students can follow it before compiling and uploading firmware.',
      },
      {
        question: 'Which item belongs in the simulation inputs for this project?',
        options: [simulationPlan.inputs[0], 'Teacher signature only', 'Report cover page color', 'Project price in rupees only'],
        answer: simulationPlan.inputs[0],
        explanation: 'Simulation inputs represent sensor readings, commands, buttons, or other values that drive robot behavior.',
      },
      {
        question: 'Which result should students confirm during testing?',
        options: [firstTest, 'Ignore sensor values', 'Run full speed before checking wiring', 'Remove the common ground'],
        answer: firstTest,
        explanation: 'The test plan is designed to bring up the project gradually and catch mistakes early.',
      },
      {
        question: 'What is a sensible troubleshooting step if the project does not work?',
        options: [firstTrouble, 'Increase voltage until it moves', 'Bypass the motor driver', 'Touch random wires while powered'],
        answer: firstTrouble,
        explanation: 'Troubleshooting should focus on wiring, power, libraries, board selection, and sensor calibration.',
      },
      {
        question: firstViva,
        options: [
          firstLearningGoal,
          `Only ${secondBom} matters; the controller is not needed.`,
          'Safety checks are optional for student robotics.',
          'The project should be tested only after final submission.',
        ],
        answer: firstLearningGoal,
        explanation: 'Viva answers should explain the concept behind the build, not just name parts.',
      },
    ];
  }, [data, simulationPlan.inputs, uploadGuide.steps]);

  const quizScore = useMemo(() => quizQuestions.reduce((score, question, index) => (
    quizAnswers[index] === question.answer ? score + 1 : score
  ), 0), [quizAnswers, quizQuestions]);

  const quizMinutes = Math.floor(quizSecondsRemaining / 60).toString().padStart(2, '0');
  const quizSeconds = (quizSecondsRemaining % 60).toString().padStart(2, '0');

  const resetQuiz = useCallback(() => {
    setQuizStarted(false);
    setQuizSubmitted(false);
    setQuizSecondsRemaining(QUIZ_DURATION_SECONDS);
    setQuizAnswers({});
  }, []);

  useEffect(() => {
    if (!quizStarted || quizSubmitted) return;

    const timer = window.setInterval(() => {
      setQuizSecondsRemaining((seconds) => {
        if (seconds <= 1) {
          window.setTimeout(() => setQuizSubmitted(true), 0);
          return 0;
        }

        return seconds - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [quizStarted, quizSubmitted]);

  useEffect(() => {
    if (!isPresentationFullscreen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') goToPreviousSlide();
      if (event.key === 'ArrowRight') goToNextSlide();
      if (event.key === 'Escape') void closePresentationFullscreen();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNextSlide, goToPreviousSlide, isPresentationFullscreen]);

  useEffect(() => {
    let unsubscribeUserDoc: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthReady(true);
      unsubscribeUserDoc?.();

      if (!user) {
        setHistorySessions([]);
        resetWorkspace();
        setIsProUser(false);
        return;
      }

      const userDocRef = doc(db, 'users', user.uid);
      unsubscribeUserDoc = onSnapshot(userDocRef, (snapshot) => {
        setIsProUser(snapshot.exists() ? hasActiveProAccess(snapshot.data()) : false);
      });

      void user.getIdToken().then((token) =>
        fetch('/api/subscription-status', {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => undefined),
      );
      void fetchSidebarHistory(user.uid);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeUserDoc?.();
    };
  }, [fetchSidebarHistory, resetWorkspace]);

  const saveProjectToFirestore = async (userId: string, sessionId: string, project: ProjectData) => {
    try {
      const docRef = doc(db, 'users', userId, 'chatSessions', sessionId);
      await setDoc(docRef, {
        id: sessionId,
        title: project.project_title || 'Untitled Robotics Build',
        target_board: project.target_board,
        lastUpdated: new Date().toISOString(),
        projectData: project,
      }, { merge: true });

      await setDoc(doc(db, 'users', userId), { lastActive: new Date().toISOString() }, { merge: true });
      await fetchSidebarHistory(userId);
    } catch (err) {
      console.error('Firestore persistence error:', err);
    }
  };

  const resumeSession = (session: ChatSession) => {
    setCurrentSessionId(session.id);
    setData(session.projectData);
    setBoard(session.target_board || 'Arduino Uno');
    setPrompt('');
    setModifyPrompt('');
    setActiveTab('code');
    setIsMobileSidebarOpen(false);
    resetQuiz();
  };

  const executeAIBuild = async (queryToSend: string, isModification: boolean) => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!isModification && !isProUser && historySessions.length >= 10) {
      alert('Free workspaces can save up to 10 projects. Subscribe to Pro for unlimited saved projects.');
      return;
    }

    if (isModification) setModifying(true);
    else setLoading(true);

    const sessionId = currentSessionId || `session_${Date.now()}`;
    if (!isModification) setCurrentSessionId(sessionId);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: queryToSend,
          board,
          userId: currentUser.uid,
          sessionId,
          isModification,
          currentProject: isModification ? data : null,
        }),
      });

      if (!response.ok) {
        const errorPayload = (await response.json().catch(() => ({}))) as GenerateErrorPayload;
        throw new Error(errorPayload.message || errorPayload.error || 'CircuitAI could not compile this build.');
      }

      const result = (await response.json()) as ProjectData;
      setData(result);
      setActiveTab('code');
      resetQuiz();
      await saveProjectToFirestore(currentUser.uid, sessionId, result);
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : 'Compilation or save pipeline execution failure.');
    } finally {
      setLoading(false);
      setModifying(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    await executeAIBuild(prompt, false);
  };

  const handleModify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modifyPrompt.trim() || !data) return;

    const contextPrompt = `I have an existing project called "${data.project_title}".
Please modify this complete robotics build with these updates: ${modifyPrompt}.
Return the full updated schema, including code, wiring, safety, testing, troubleshooting, and learning sections.`;

    await executeAIBuild(contextPrompt, true);
    setModifyPrompt('');
  };

  const initiateCheckout = async () => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }

    setIsProcessingPayment(true);

    await initiateProSubscription({
      currentUser,
      onSuccess: (message) => alert(message),
      onError: (message) => alert(message),
    });

    setIsProcessingPayment(false);
  };

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadProjectPack = () => {
    if (!data) return;

    const markdown = `# ${data.project_title}

Target board: ${data.target_board}
Difficulty: ${data.difficulty || 'Not specified'}
Estimated time: ${data.estimated_time || 'Not specified'}

## Learning Goals
${(data.learning_goals || []).map((item) => `- ${item}`).join('\n') || '- Review the generated build and verify every hardware choice.'}

## Bill Of Materials
${(data.bill_of_materials || []).map((item) => `- ${item.quantity} x ${item.item}`).join('\n')}

## Wiring
${(data.connections || []).map((item) => `- ${item.from} -> ${item.to}`).join('\n')}

## Assembly Steps
${(data.steps || []).map((item, index) => `${index + 1}. ${item}`).join('\n')}

## Code Upload Guide
IDE: ${uploadGuide.ide}
Board package: ${uploadGuide.board_package}
Serial monitor: ${uploadGuide.serial_monitor}

Libraries:
${uploadGuide.required_libraries.map((item) => `- ${item}`).join('\n')}

Upload steps:
${uploadGuide.steps.map((item, index) => `${index + 1}. ${item}`).join('\n')}

Upload checklist:
${uploadGuide.upload_checklist.map((item) => `- [ ] ${item}`).join('\n')}

## Test Plan
${(data.test_plan || []).map((item, index) => `${index + 1}. ${item}`).join('\n') || '1. Power the board from USB first and confirm no component overheats.'}

## Simulation Plan
Inputs:
${simulationPlan.inputs.map((item) => `- ${item}`).join('\n')}

Outputs:
${simulationPlan.outputs.map((item) => `- ${item}`).join('\n')}

Expected behavior:
${simulationPlan.expected_behavior.map((item) => `- ${item}`).join('\n')}

## Troubleshooting
${(data.troubleshooting || []).map((item) => `- ${item}`).join('\n') || '- Re-check pin numbers, ground continuity, and library versions.'}

## Safety
${(data.warnings || []).map((item) => `- ${item}`).join('\n')}

## Firmware
\`\`\`cpp
${data.code}
\`\`\`
${data.secondary_code ? `
## Companion Code (${data.secondary_language || 'script'})
\`\`\`
${data.secondary_code}
\`\`\`
` : ''}`;

    downloadFile(markdown, `${data.project_title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-project-pack.md`);
  };

  const requirePro = (featureName: string) => {
    if (isProUser) return true;
    alert(`${featureName} is a CircuitAI Pro feature. Subscribe to unlock it.`);
    return false;
  };

  const buildTeacherReportHtml = (project: ProjectData) => {
    const list = (items: string[] | undefined, fallback: string) => (items && items.length > 0 ? items : [fallback])
      .map((item) => `<li>${item}</li>`)
      .join('');
    const teacherMode = project.teacher_mode;

    return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${project.project_title} - CircuitAI Report</title>
  <style>
    body { color: #18181b; font-family: Arial, sans-serif; line-height: 1.5; margin: 40px; }
    h1 { font-size: 30px; margin-bottom: 6px; }
    h2 { border-bottom: 1px solid #d4d4d8; font-size: 18px; margin-top: 28px; padding-bottom: 6px; }
    code, pre { background: #f4f4f5; border: 1px solid #d4d4d8; border-radius: 6px; font-family: "JetBrains Mono", Menlo, monospace; font-size: 11px; }
    pre { overflow: auto; padding: 14px; white-space: pre-wrap; }
    table { border-collapse: collapse; width: 100%; }
    td, th { border: 1px solid #d4d4d8; padding: 8px; text-align: left; }
    .meta { color: #52525b; font-size: 13px; }
    .credit { color: #52525b; font-size: 12px; margin-top: 32px; }
  </style>
</head>
<body>
  <h1>${project.project_title}</h1>
  <p class="meta">Generated by CircuitAI | Founder & Developer: AahilWorks | ${new Date().toLocaleDateString()}</p>
  <table>
    <tbody>
      <tr><th>Target Board</th><td>${project.target_board}</td></tr>
      <tr><th>Difficulty</th><td>${project.difficulty || 'Student'}</td></tr>
      <tr><th>Estimated Time</th><td>${project.estimated_time || 'Not specified'}</td></tr>
      <tr><th>Safety Level</th><td>${project.safety_level || 'Verify before powering hardware'}</td></tr>
    </tbody>
  </table>
  <h2>Aim</h2>
  <p>To design, assemble, test, and explain a working robotics project based on ${project.project_title} using ${project.target_board}.</p>
  <h2>Abstract</h2>
  <p>${teacherMode?.abstract || `This report documents the design, construction, firmware, testing, and safety checks for ${project.project_title}.`}</p>
  <h2>Components Required</h2>
  <ul>${project.bill_of_materials.map((item) => `<li>${item.quantity} x ${item.item}</li>`).join('')}</ul>
  <h2>Tools Required</h2>
  <ul>${list(project.tools_needed, 'Computer with programming IDE')}</ul>
  <h2>Working Principle</h2>
  <p>${teacherMode?.working_principle || 'The controller reads inputs, processes logic, and controls outputs to complete the robotics task.'}</p>
  <h2>Circuit Connections</h2>
  <ul>${project.connections.map((conn) => `<li>${conn.from} to ${conn.to}</li>`).join('')}</ul>
  <h2>Assembly Procedure</h2>
  <ol>${project.steps.map((step) => `<li>${step}</li>`).join('')}</ol>
  <h2>Testing Procedure</h2>
  <ol>${list(project.test_plan, 'Power the board from USB first and verify basic sensor readings.')}</ol>
  <h2>Code Upload Guide</h2>
  <ol>${list(project.upload_guide?.steps, 'Connect the board, select the correct board and port, then upload the firmware.')}</ol>
  <h2>Simulation Before Hardware</h2>
  <ul>${list(project.simulation?.expected_behavior, 'Verify expected input and output states before final hardware testing.')}</ul>
  <h2>Troubleshooting</h2>
  <ul>${list(project.troubleshooting, 'Check wiring, ground continuity, board selection, and library installation.')}</ul>
  <h2>Precautions</h2>
  <ul>${list(project.warnings, 'Verify all wiring and power requirements before switching on the hardware.')}</ul>
  <h2>Applications</h2>
  <ul>${list(teacherMode?.applications || project.next_upgrades, 'This project can be extended into a more advanced robotics prototype.')}</ul>
  <h2>Viva Questions</h2>
  <ol>${list(teacherMode?.viva_questions, `What is the role of ${project.target_board} in this project?`)}</ol>
  <h2>Marking Rubric</h2>
  <ul>${list(teacherMode?.rubric, 'Marks can be awarded for working circuit, code quality, testing, documentation, and explanation.')}</ul>
  <h2>Conclusion</h2>
  <p>${teacherMode?.conclusion || 'The project demonstrates microcontroller-based robotics design, wiring, firmware logic, testing, and safe debugging practices.'}</p>
  <h2>Firmware</h2>
  <pre>${project.code.replace(/[<>&]/g, (char) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[char] || char))}</pre>
  <p class="credit">CircuitAI by AahilWorks - https://aahilworks.github.io</p>
</body>
</html>`;
  };

  const printTeacherReport = () => {
    if (!data) return;
    if (!requirePro('PDF / print report export')) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Please allow popups to open the printable report.');
      return;
    }

    printWindow.document.open();
    printWindow.document.write(buildTeacherReportHtml(data));
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const downloadTeacherReport = () => {
    if (!data) return;
    if (!requirePro('Teacher report HTML export')) return;
    downloadFile(buildTeacherReportHtml(data), `${data.project_title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-teacher-report.html`);
  };

  const copyShareLink = async () => {
    if (!currentUser || !currentSessionId) {
      alert('Generate or open a saved project before sharing.');
      return;
    }

    const shareUrl = `${window.location.origin}/share/${currentUser.uid}/${currentSessionId}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('Read-only project link copied.');
    } catch {
      window.prompt('Copy this project link:', shareUrl);
    }
  };

  const downloadPresentation = () => {
    if (!data) return;

    const slidesHtml = presentationSlides.map((slide, index) => `
      <section class="slide">
        <p class="count">Slide ${index + 1} / ${presentationSlides.length}</p>
        <h1>${slide.title}</h1>
        <ul>${slide.bullets.map((bullet) => `<li>${bullet}</li>`).join('')}</ul>
        <p class="notes">${slide.speaker_notes}</p>
      </section>
    `).join('');

    const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${data.project_title} - Presentation</title>
  <style>
    body { margin: 0; background: #09090b; color: #f4f4f5; font-family: Arial, sans-serif; }
    .slide { min-height: 100vh; box-sizing: border-box; padding: 72px; display: flex; flex-direction: column; justify-content: center; border-bottom: 1px solid #27272a; }
    .count { color: #14b8a6; font-size: 13px; font-weight: 700; text-transform: uppercase; }
    h1 { font-size: 56px; margin: 12px 0 24px; }
    li { font-size: 26px; margin: 14px 0; line-height: 1.35; }
    .notes { color: #a1a1aa; margin-top: 32px; font-size: 16px; max-width: 900px; line-height: 1.6; }
    @media print { .slide { page-break-after: always; } }
  </style>
</head>
<body>${slidesHtml}</body>
</html>`;

    downloadFile(html, `${data.project_title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}-presentation.html`);
  };

  const openCartTab = (item: string) => {
    window.open(`https://www.amazon.com/s?k=${encodeURIComponent(item)}+electronic+component`, '_blank');
  };

  if (!authReady) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center font-sans">
        <div className="flex items-center gap-3 text-sm text-zinc-400">
          <RefreshCw className="h-4 w-4 animate-spin text-teal-300" />
          Loading CircuitAI workspace...
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-teal-500/30">
        <header className="h-16 border-b border-zinc-800 px-4 md:px-6 flex items-center justify-between bg-zinc-950 z-20 shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-black text-xs text-teal-300 bg-zinc-900 border border-zinc-800 px-2 py-1 rounded-md">CAI</span>
            <h1 className="text-lg font-black tracking-wide">Circuit<span className="text-teal-300">AI</span></h1>
            <nav className="hidden items-center gap-4 pl-3 text-xs font-bold text-zinc-500 md:flex">
              <Link href="/" className="hover:text-teal-300 transition">Home</Link>
              <Link href="/features" className="hover:text-teal-300 transition">Features</Link>
              <Link href="/pricing" className="hover:text-teal-300 transition">Pricing</Link>
            </nav>
          </div>
          <button type="button" onClick={() => setIsAuthModalOpen(true)} className="h-9 px-4 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold uppercase transition">
            Sign In
          </button>
        </header>

        <main className="flex-1 p-4 md:p-8 bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.12),transparent_34rem)]">
          <section className="mx-auto grid min-h-[calc(100vh-9rem)] max-w-6xl grid-cols-1 items-center gap-8 lg:grid-cols-12">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-teal-300 border border-teal-700/60 bg-teal-950/40 px-3 py-1.5 rounded-lg">
                <Lock className="h-4 w-4" /> Sign in required
              </div>
              <div>
                <h2 className="text-4xl md:text-6xl font-black tracking-tight text-zinc-50">Build robotics projects with your own saved workspace.</h2>
                <p className="mt-4 max-w-2xl text-base text-zinc-400 leading-relaxed">
                  CircuitAI now requires sign in so every project, report, wiring plan, and revision stays connected to your account.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button type="button" onClick={() => setIsAuthModalOpen(true)} className="h-11 px-5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold uppercase flex items-center justify-center gap-2 transition">
                  <Sparkles className="h-4 w-4" /> Sign In To Start
                </button>
                <a href="https://aahilworks.github.io" target="_blank" rel="noopener noreferrer" className="h-11 px-5 bg-zinc-900 border border-zinc-800 hover:border-teal-800 text-zinc-300 hover:text-teal-300 rounded-lg text-xs font-bold uppercase flex items-center justify-center transition">
                  AahilWorks
                </a>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-4">
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-5">
                <h3 className="text-sm font-black text-zinc-100 flex items-center gap-2"><GraduationCap className="h-4 w-4 text-teal-300" /> Free Workspace</h3>
                <ul className="mt-4 space-y-2 text-sm text-zinc-400">
                  <li>5 AI projects per month</li>
                  <li>10 saved projects</li>
                  <li>Basic wiring list and project pack</li>
                  <li>Testing, troubleshooting, and learning tabs</li>
                </ul>
              </div>

              <div className="rounded-lg border border-teal-800/70 bg-teal-950/20 p-5">
                <h3 className="text-sm font-black text-teal-200 flex items-center gap-2"><Crown className="h-4 w-4 fill-teal-300" /> CircuitAI Pro</h3>
                <p className="mt-3 text-xs font-semibold text-teal-200/80">₹999/month · 2-day free trial · 12-month subscription</p>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {proBenefits.map((benefit) => (
                    <div key={benefit} className="rounded-md border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-xs text-zinc-300">
                      {benefit}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer className="border-t border-zinc-800 bg-zinc-950 px-6 py-4 z-20 shrink-0 text-xs text-zinc-500 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-center sm:text-left">
            &copy; {new Date().getFullYear()} <span className="text-zinc-300 font-bold">CircuitAI</span>. All rights reserved.
            <span className="block sm:inline sm:ml-2">
              Founder & Developer:{' '}
              <a href="https://aahilworks.github.io" target="_blank" rel="noopener noreferrer" className="text-teal-300 hover:text-teal-200 transition">
                AahilWorks
              </a>
            </span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="hover:text-teal-300 transition">Terms</Link>
            <Link href="/privacy" className="hover:text-teal-300 transition">Privacy</Link>
          </div>
        </footer>

        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} user={currentUser} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-teal-500/30">
      <header className="h-16 border-b border-zinc-800 px-4 md:px-6 flex items-center justify-between bg-zinc-950 z-20 shrink-0">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setIsMobileSidebarOpen(true)} className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 md:hidden hover:text-teal-300 transition" aria-label="Open project history">
            <Menu className="h-4 w-4" />
          </button>
          <Link href="/" className="flex items-center gap-3">
            <span className="font-black text-xs text-teal-300 bg-zinc-900 border border-zinc-800 px-2 py-1 rounded-md">CAI</span>
            <h1 className="text-lg font-black tracking-wide">Circuit<span className="text-teal-300">AI</span></h1>
          </Link>
          <nav className="hidden items-center gap-4 pl-3 text-xs font-bold text-zinc-500 lg:flex">
            <Link href="/" className="hover:text-teal-300 transition">Home</Link>
            <Link href="/features" className="hover:text-teal-300 transition">Features</Link>
            <Link href="/pricing" className="hover:text-teal-300 transition">Pricing</Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {isProUser ? (
            <div className="flex items-center gap-1.5 border border-emerald-500/40 bg-emerald-950/60 text-emerald-300 px-3 py-1.5 rounded-lg text-xs font-bold">
              <Crown className="h-3.5 w-3.5 fill-emerald-300" />
              <span>Pro</span>
            </div>
          ) : (
            <button type="button" onClick={() => initiateCheckout()} disabled={isProcessingPayment} className="flex items-center gap-1.5 border border-teal-500/40 bg-teal-950/60 hover:bg-teal-900/80 text-teal-300 px-3 py-1.5 rounded-lg text-xs font-bold transition disabled:opacity-50">
              {isProcessingPayment ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <CreditCard className="h-3.5 w-3.5" />}
              <span>Subscribe</span>
            </button>
          )}

          <button type="button" onClick={() => setIsAuthModalOpen(true)} className="flex items-center gap-2 border border-zinc-800 px-4 py-1.5 rounded-lg text-xs bg-zinc-900 text-zinc-400 hover:text-zinc-100 transition">
            {currentUser ? currentUser.email?.split('@')[0] : 'Sign In'}
          </button>
        </div>
      </header>

      <div className="bg-zinc-900/60 px-4 md:px-6 py-2 text-[11px] text-zinc-500 border-b border-zinc-800 shrink-0 flex flex-wrap items-center justify-between gap-2">
        <span>{currentUser ? `Workspace synced: ${currentUser.email || currentUser.uid.slice(0, 8)}` : 'Sign in to compile projects and save your build history.'}</span>
        {isProUser && <span className="text-emerald-300 font-bold">Pro Mode Active</span>}
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {isMobileSidebarOpen && <div onClick={() => setIsMobileSidebarOpen(false)} className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden" />}

        <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-zinc-800 bg-zinc-950 p-4 transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:z-10 ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4 md:hidden">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-300">Project Workspace</span>
            <button type="button" onClick={() => setIsMobileSidebarOpen(false)} className="p-1 rounded-lg hover:bg-zinc-900 hover:text-white" aria-label="Close project history">
              <X className="h-4 w-4" />
            </button>
          </div>

          <button type="button" onClick={resetWorkspace} className="w-full h-10 border border-dashed border-zinc-700 rounded-lg text-xs flex items-center justify-center gap-2 text-zinc-400 hover:text-teal-300 hover:border-teal-700 transition">
            <Plus className="h-3.5 w-3.5" /> New Project
          </button>

          <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-900/60 p-3">
            <div className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-950 px-3">
              <Search className="h-3.5 w-3.5 text-zinc-600" />
              <input
                type="search"
                value={historySearch}
                onChange={(event) => setHistorySearch(event.target.value)}
                placeholder="Search saved projects"
                className="h-9 min-w-0 flex-1 bg-transparent text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none"
              />
            </div>

            <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1">
              {boardFilters.map((sessionBoard) => (
                <button
                  key={sessionBoard}
                  type="button"
                  onClick={() => setHistoryBoardFilter(sessionBoard)}
                  className={`shrink-0 rounded-md border px-2.5 py-1 text-[10px] font-bold transition ${historyBoardFilter === sessionBoard ? 'border-teal-700 bg-teal-950/50 text-teal-300' : 'border-zinc-800 bg-zinc-950 text-zinc-500 hover:text-zinc-300'}`}
                >
                  {sessionBoard}
                </button>
              ))}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 text-[10px]">
              <div className="rounded-md border border-zinc-800 bg-zinc-950 p-2">
                <p className="font-bold text-zinc-500 uppercase">Projects</p>
                <p className="mt-1 text-sm font-black text-zinc-200">{historySessions.length}</p>
              </div>
              <div className="rounded-md border border-zinc-800 bg-zinc-950 p-2">
                <p className="font-bold text-zinc-500 uppercase">Boards</p>
                <p className="mt-1 text-sm font-black text-zinc-200">{Math.max(boardFilters.length - 1, 0)}</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-1 mt-4 space-y-1">
            {historySessions.length === 0 && <p className="text-xs text-zinc-600 px-2 py-3">Saved builds will appear here after you sign in and generate a project.</p>}
            {historySessions.length > 0 && filteredHistorySessions.length === 0 && <p className="text-xs text-zinc-600 px-2 py-3">No saved builds match this search.</p>}
            {filteredHistorySessions.map((session) => (
              <button key={session.id} type="button" onClick={() => resumeSession(session)} className={`w-full px-3 py-2 rounded-lg text-left text-xs truncate transition ${currentSessionId === session.id ? 'bg-zinc-900 text-teal-300 border border-zinc-700' : 'text-zinc-400 hover:bg-zinc-900/70'}`}>
                <span className="block truncate">{session.title}</span>
                <span className="mt-1 block truncate text-[10px] text-zinc-600">{session.target_board || 'Unknown board'}</span>
              </button>
            ))}
          </div>

          {isProUser && (
            <div className="mt-4 pt-4 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setShowCollaborationPanel(!showCollaborationPanel)}
                className="w-full h-9 border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-xs flex items-center justify-center gap-2 text-zinc-400 hover:text-teal-300 transition"
              >
                <Users className="h-3.5 w-3.5" /> {showCollaborationPanel ? 'Hide' : 'Show'} Collaboration
              </button>
              
              {showCollaborationPanel && (
                <div className="mt-3">
                  <CollaborationPanel
                    sessionId={currentSessionId || undefined}
                    userId={currentUser?.uid || undefined}
                    userData={{ email: currentUser?.email || undefined, displayName: currentUser?.displayName || undefined }}
                    isPro={isProUser}
                    onClose={() => setShowCollaborationPanel(false)}
                  />
                </div>
              )}
            </div>
          )}
        </aside>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 pb-24 bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.10),transparent_34rem)]">
          {!data && (
            <section className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              <div className="xl:col-span-8 space-y-5">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 text-xs font-semibold text-teal-300 border border-teal-700/60 bg-teal-950/40 px-3 py-1.5 rounded-lg">
                    <GraduationCap className="h-4 w-4" /> Robotics project builder for students
                  </div>
                  <h2 className="text-3xl md:text-5xl font-black tracking-tight text-zinc-50 max-w-3xl">Turn an idea into a buildable robotics project pack.</h2>
                  <p className="text-sm md:text-base text-zinc-400 max-w-2xl leading-relaxed">CircuitAI creates firmware, wiring, parts, safety checks, test steps, and companion scripts so students can move from concept to working prototype faster.</p>
                </div>

                <form onSubmit={handleGenerate} className="bg-zinc-900/80 border border-zinc-800 p-5 rounded-lg flex flex-col gap-4">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-2">What do you want to build?</label>
                    <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="Example: Build a Bluetooth-controlled line follower robot with obstacle avoidance and a simple test plan." className="w-full min-h-32 bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-zinc-100 text-sm focus:outline-none focus:border-teal-500 resize-y" required />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Target Hardware</label>
                      <input type="text" value={board} onChange={(e) => setBoard(e.target.value)} className="w-full h-11 bg-zinc-950 border border-zinc-800 rounded-lg px-4 text-zinc-100 text-sm focus:outline-none focus:border-teal-500" required />
                    </div>
                    <button type="submit" disabled={loading} className="h-11 px-5 bg-teal-600 hover:bg-teal-500 disabled:bg-teal-800 text-white font-bold text-xs uppercase rounded-lg flex items-center justify-center gap-2 transition shrink-0">
                      {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Generate Project Pack
                    </button>
                  </div>
                </form>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {starterExamples.map((example) => (
                    <button key={example} type="button" onClick={() => setPrompt(example)} className="text-left text-xs bg-zinc-900/60 border border-zinc-800 rounded-lg p-3 text-zinc-400 hover:text-teal-300 hover:border-teal-800 transition">
                      {example}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                  <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-4">
                    <h3 className="text-sm font-black text-zinc-100 flex items-center gap-2"><GraduationCap className="h-4 w-4 text-teal-300" /> Free</h3>
                    <ul className="mt-3 space-y-1.5 text-xs text-zinc-400">
                      <li>5 AI projects per month</li>
                      <li>10 saved projects</li>
                      <li>Basic wiring list</li>
                      <li>Markdown project pack</li>
                    </ul>
                  </div>

                  <div className="rounded-lg border border-teal-800/70 bg-teal-950/20 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-black text-teal-200 flex items-center gap-2"><Crown className="h-4 w-4 fill-teal-300" /> Pro</h3>
                        <p className="mt-2 text-[11px] font-semibold text-teal-200/80">₹999/month · 2-day trial · monthly subscription</p>
                      </div>
                      {!isProUser && (
                        <button type="button" onClick={() => initiateCheckout()} disabled={isProcessingPayment} className="rounded-md bg-teal-600 px-2.5 py-1 text-[10px] font-bold uppercase text-white hover:bg-teal-500 disabled:opacity-50">
                          Start Trial
                        </button>
                      )}
                    </div>
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {proBenefits.slice(0, 6).map((benefit) => (
                        <div key={benefit} className="rounded-md border border-zinc-800 bg-zinc-950/70 px-2.5 py-1.5 text-[11px] text-zinc-300">
                          {benefit}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="xl:col-span-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-3">
                {[
                  { title: 'Firmware', copy: 'Arduino-ready code with library notes.', Icon: Cpu },
                  { title: 'Wiring', copy: 'Pin-to-pin connections students can follow.', Icon: Cable },
                  { title: 'Testing', copy: 'Bring-up checklist before full assembly.', Icon: FlaskConical },
                  { title: 'Learning', copy: 'Concepts and upgrades for reports.', Icon: Lightbulb },
                ].map(({ title, copy, Icon }) => (
                  <div key={title} className="bg-zinc-900/70 border border-zinc-800 rounded-lg p-4">
                    <Icon className="h-5 w-5 text-teal-300 mb-3" />
                    <h3 className="text-sm font-bold text-zinc-100">{title}</h3>
                    <p className="text-xs text-zinc-500 mt-1">{copy}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {data ? (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              <div className="xl:col-span-8 space-y-4">
                <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-teal-300">Active Project</p>
                      <h2 className="mt-2 truncate text-2xl font-black tracking-tight text-zinc-50 md:text-3xl">{data.project_title}</h2>
                      <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-zinc-400">
                        <span className="rounded-md border border-zinc-800 bg-zinc-950 px-2.5 py-1">{data.target_board}</span>
                        <span className="rounded-md border border-zinc-800 bg-zinc-950 px-2.5 py-1">{data.estimated_time || 'Time TBD'}</span>
                        <span className="rounded-md border border-zinc-800 bg-zinc-950 px-2.5 py-1">{data.difficulty || 'Student level'}</span>
                        {isProUser && <span className="rounded-md border border-emerald-800 bg-emerald-950/30 px-2.5 py-1 text-emerald-300">Pro</span>}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row lg:shrink-0">
                    <button type="button" onClick={copyShareLink} className="h-9 px-3 bg-teal-950/50 border border-teal-800 rounded-lg text-xs text-teal-300 hover:bg-teal-900/50 items-center gap-2 transition flex">
                      <Share2 className="h-3.5 w-3.5" /> Share
                    </button>
                    <button type="button" onClick={downloadProjectPack} className="h-9 px-3 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-300 hover:text-teal-300 hover:border-teal-800 items-center gap-2 transition flex">
                      <Download className="h-3.5 w-3.5" /> Pack
                    </button>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3 border-t border-zinc-800 pt-4 lg:grid-cols-3">
                    {[
                      { label: 'Build', tabs: [['code', 'Code'], ['wiring', 'Wiring'], ['guide', 'Assembly'], ['upload', 'Upload'], ['test', 'Test']] },
                      { label: 'Study', tabs: [['explain', 'Explain'], ['learn', 'Learn'], ['sim', 'Sim'], ['quiz', 'Quiz']] },
                      { label: 'Output', tabs: [['shop', 'Shop'], ['present', 'Slides'], ['report', 'Report'], ...(data.secondary_code ? [['secondary', 'Companion']] : [])] },
                    ].map((group) => (
                      <div key={group.label}>
                        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-zinc-600">{group.label}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {group.tabs.map(([tabId, label]) => (
                            <button
                              key={tabId}
                              type="button"
                              onClick={() => setActiveTab(tabId as typeof activeTab)}
                              className={`rounded-md px-3 py-1.5 text-xs font-bold transition ${activeTab === tabId ? 'bg-teal-600 text-white' : 'bg-zinc-950 border border-zinc-800 text-zinc-500 hover:border-teal-800 hover:text-teal-300'}`}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {activeTab === 'code' && (
                  <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-950 border-b border-zinc-800 text-xs">
                      <span className="text-zinc-400">firmware.ino</span>
                      <button type="button" onClick={() => downloadFile(data.code, 'firmware.ino')} className="bg-teal-900/40 hover:bg-teal-900/60 text-teal-300 px-2 py-1 rounded-md flex items-center gap-1 transition"><Download className="h-3 w-3" /> Download</button>
                    </div>
                    <pre className="p-4 text-xs text-emerald-300 max-h-[32rem] overflow-y-auto whitespace-pre-wrap font-mono leading-relaxed"><code>{data.code}</code></pre>
                  </div>
                )}

                {activeTab === 'secondary' && data.secondary_code && (
                  <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-950 border-b border-zinc-800 text-xs">
                      <span className="text-violet-300 font-bold uppercase flex items-center gap-1.5"><Code2 className="h-3.5 w-3.5" /> Companion ({data.secondary_language || 'script'})</span>
                      <button type="button" onClick={() => downloadFile(data.secondary_code || '', `companion.${data.secondary_language || 'txt'}`)} className="bg-violet-900/40 hover:bg-violet-900/60 text-violet-300 px-2 py-1 rounded-md flex items-center gap-1 transition"><Download className="h-3 w-3" /> Download</button>
                    </div>
                    <pre className="p-4 text-xs text-violet-300 max-h-[32rem] overflow-y-auto whitespace-pre-wrap font-mono leading-relaxed"><code>{data.secondary_code}</code></pre>
                  </div>
                )}

                {activeTab === 'wiring' && (
                  <div className="space-y-4">
                    {isProUser ? (
                      <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-5 overflow-hidden">
                        <div className="flex items-center justify-between gap-3 mb-4">
                          <h3 className="text-teal-300 font-bold uppercase tracking-wider text-xs flex items-center gap-2"><Cable className="h-4 w-4" /> Advanced Visual Wiring Diagram</h3>
                          <span className="text-[10px] text-zinc-600">{data.connections.length} connections</span>
                        </div>

                        <div className="relative min-h-80 rounded-lg border border-zinc-800 bg-zinc-950/80 p-4">
                          <svg className="absolute inset-0 h-full w-full" viewBox="0 0 800 360" preserveAspectRatio="none" aria-hidden="true">
                            {data.connections.slice(0, 12).map((conn, idx) => {
                              const y = 40 + idx * 26;
                              return (
                                <line key={`${conn.from}-${conn.to}-line-${idx}`} x1="235" y1="180" x2="565" y2={y} stroke={idx % 2 === 0 ? '#14b8a6' : '#a78bfa'} strokeWidth="2" strokeDasharray="6 8" opacity="0.55" />
                              );
                            })}
                          </svg>

                          <div className="relative grid min-h-72 grid-cols-[1fr_auto_1fr] items-center gap-4">
                            <div className="space-y-2">
                              {data.connections.slice(0, 6).map((conn, idx) => (
                                <div key={`${conn.from}-left-${idx}`} className="rounded-lg border border-teal-900/60 bg-teal-950/20 px-3 py-2 text-xs text-teal-200">
                                  <p className="truncate font-bold">{conn.from}</p>
                                </div>
                              ))}
                            </div>

                            <div className="w-40 rounded-lg border border-zinc-700 bg-zinc-900 p-4 text-center shadow-2xl">
                              <Cpu className="mx-auto h-8 w-8 text-teal-300" />
                              <p className="mt-3 text-xs font-black text-zinc-100">{data.target_board}</p>
                              <p className="mt-1 text-[10px] text-zinc-500">controller</p>
                            </div>

                            <div className="space-y-2">
                              {data.connections.slice(0, 6).map((conn, idx) => (
                                <div key={`${conn.to}-right-${idx}`} className="rounded-lg border border-violet-900/60 bg-violet-950/20 px-3 py-2 text-xs text-violet-200">
                                  <p className="truncate font-bold">{conn.to}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {data.connections.length > 6 && (
                            <p className="relative mt-3 text-center text-[11px] text-zinc-600">Showing the first 6 connections visually. Full wiring list is below.</p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-teal-950/20 border border-teal-900/60 rounded-lg p-5">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div>
                            <h3 className="text-teal-300 font-bold uppercase tracking-wider text-xs flex items-center gap-2"><Lock className="h-4 w-4" /> Advanced Wiring Is Pro</h3>
                            <p className="mt-2 text-sm text-zinc-400">Free users still get the full wiring list below. Pro unlocks the visual diagram with color-coded connection groups.</p>
                          </div>
                          <button type="button" onClick={() => initiateCheckout()} disabled={isProcessingPayment} className="h-9 px-3 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold uppercase flex items-center justify-center gap-2 transition disabled:opacity-50">
                            {isProcessingPayment ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Crown className="h-3.5 w-3.5" />} Subscribe
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      {data.connections?.map((conn, idx) => (
                        <div key={`${conn.from}-${conn.to}-${idx}`} className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-lg text-xs grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
                          <span className="text-teal-300 font-bold break-words">{conn.from}</span>
                          <ArrowRight className="h-3.5 w-3.5 text-zinc-600" />
                          <span className="text-violet-300 font-bold break-words text-right">{conn.to}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'guide' && (
                  <div className="bg-zinc-900/60 border border-zinc-800 p-5 rounded-lg space-y-4 text-xs">
                    <h3 className="text-teal-300 font-bold uppercase tracking-wider">Assembly Routine</h3>
                    {data.steps?.map((step, idx) => (
                      <div key={`${step}-${idx}`} className="p-3.5 bg-zinc-950/70 border border-zinc-800 rounded-lg flex gap-3 text-zinc-300">
                        <span className="text-teal-300 font-black">{idx + 1}</span>
                        <p className="leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'upload' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="bg-zinc-900/60 border border-zinc-800 p-5 rounded-lg">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-teal-300 font-bold uppercase tracking-wider text-xs flex items-center gap-2"><UploadCloud className="h-4 w-4" /> Code Upload Guide</h3>
                          <p className="mt-2 text-sm text-zinc-400">{uploadGuide.ide} for {data.target_board}</p>
                        </div>
                        <span className="rounded-md border border-zinc-800 bg-zinc-950 px-2.5 py-1 text-[10px] font-bold uppercase text-zinc-500">Student Ready</span>
                      </div>

                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3">
                          <p className="text-zinc-500 font-bold uppercase">Board Package</p>
                          <p className="mt-1 text-zinc-300 leading-relaxed">{uploadGuide.board_package}</p>
                        </div>
                        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-3">
                          <p className="text-zinc-500 font-bold uppercase">Serial Monitor</p>
                          <p className="mt-1 text-zinc-300 leading-relaxed">{uploadGuide.serial_monitor}</p>
                        </div>
                      </div>

                      <ol className="mt-4 space-y-2 text-xs text-zinc-300">
                        {uploadGuide.steps.map((step, idx) => (
                          <li key={`${step}-${idx}`} className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-3 flex gap-3">
                            <span className="text-teal-300 font-black">{idx + 1}</span>
                            <span className="leading-relaxed">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-zinc-900/60 border border-zinc-800 p-5 rounded-lg">
                        <h3 className="text-violet-300 font-bold uppercase tracking-wider text-xs flex items-center gap-2"><PackageCheck className="h-4 w-4" /> Libraries</h3>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {uploadGuide.required_libraries.map((library, idx) => (
                            <span key={`${library}-${idx}`} className="rounded-md border border-zinc-800 bg-zinc-950 px-2.5 py-1.5 text-[11px] text-zinc-300">{library}</span>
                          ))}
                        </div>
                      </div>

                      <div className="bg-zinc-900/60 border border-zinc-800 p-5 rounded-lg">
                        <h3 className="text-amber-300 font-bold uppercase tracking-wider text-xs flex items-center gap-2"><Gauge className="h-4 w-4" /> Upload Fixes</h3>
                        <ul className="mt-3 space-y-2 text-xs text-zinc-300">
                          {uploadGuide.common_errors.map((error, idx) => (
                            <li key={`${error}-${idx}`} className="flex gap-2"><span className="text-amber-300 font-bold">{idx + 1}</span><span>{error}</span></li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-teal-950/20 border border-teal-900/60 p-5 rounded-lg">
                        <h3 className="text-teal-300 font-bold uppercase tracking-wider text-xs">Before Upload Checklist</h3>
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {uploadGuide.upload_checklist.map((item, idx) => (
                            <label key={`${item}-${idx}`} className="flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-xs text-zinc-300">
                              <input type="checkbox" className="accent-teal-500" />
                              {item}
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'test' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="bg-zinc-900/60 border border-zinc-800 p-5 rounded-lg space-y-3 text-xs">
                      <h3 className="text-teal-300 font-bold uppercase tracking-wider flex items-center gap-2"><ClipboardList className="h-4 w-4" /> Test Plan</h3>
                      {(data.test_plan || ['Power from USB first and confirm no component overheats.', 'Upload firmware, open serial monitor, and verify sensor readings.', 'Test actuators one at a time before full robot movement.']).map((step, idx) => (
                        <div key={`${step}-${idx}`} className="flex gap-3 text-zinc-300">
                          <CheckCircle2 className="h-4 w-4 text-emerald-300 shrink-0 mt-0.5" />
                          <p className="leading-relaxed">{step}</p>
                        </div>
                      ))}
                    </div>
                    <div className="bg-zinc-900/60 border border-zinc-800 p-5 rounded-lg space-y-3 text-xs">
                      <h3 className="text-amber-300 font-bold uppercase tracking-wider flex items-center gap-2"><Gauge className="h-4 w-4" /> Troubleshooting</h3>
                      {(data.troubleshooting || ['Check ground continuity between every module and the controller.', 'Confirm pin numbers in firmware match the wiring list.', 'Install missing libraries and verify board/port selection in the IDE.']).map((step, idx) => (
                        <div key={`${step}-${idx}`} className="flex gap-3 text-zinc-300">
                          <span className="text-amber-300 font-bold">{idx + 1}</span>
                          <p className="leading-relaxed">{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'sim' && (
                  isProUser ? (
                    <div className="space-y-4">
                      <div className="bg-zinc-900/60 border border-zinc-800 p-5 rounded-lg">
                        <h3 className="text-teal-300 font-bold uppercase tracking-wider text-xs flex items-center gap-2"><PlayCircle className="h-4 w-4" /> Premium Simulation Lab</h3>
                        <p className="mt-2 text-sm text-zinc-400">Use this dry-run model before connecting motors or batteries. It gives students a checklist for expected input/output behavior.</p>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {[
                          { title: 'Inputs', items: simulationPlan.inputs, tone: 'text-teal-300' },
                          { title: 'Outputs', items: simulationPlan.outputs, tone: 'text-violet-300' },
                          { title: 'Robot States', items: simulationPlan.states, tone: 'text-emerald-300' },
                          { title: 'Sample Readings', items: simulationPlan.sample_readings, tone: 'text-amber-300' },
                        ].map((section) => (
                          <div key={section.title} className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-5">
                            <h4 className={`${section.tone} text-xs font-bold uppercase tracking-wider`}>{section.title}</h4>
                            <ul className="mt-3 space-y-2 text-xs text-zinc-300">
                              {section.items.map((item, idx) => <li key={`${item}-${idx}`} className="flex gap-2"><span className={section.tone}>•</span><span>{item}</span></li>)}
                            </ul>
                          </div>
                        ))}
                      </div>

                      <div className="rounded-lg border border-teal-900/60 bg-teal-950/20 p-5">
                        <h4 className="text-teal-300 text-xs font-bold uppercase tracking-wider">Expected Behavior</h4>
                        <div className="mt-3 grid grid-cols-1 gap-2">
                          {simulationPlan.expected_behavior.map((item, idx) => (
                            <div key={`${item}-${idx}`} className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-3 text-xs text-zinc-300 flex gap-3">
                              <CheckCircle2 className="h-4 w-4 text-emerald-300 shrink-0" />
                              <span>{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-teal-950/20 border border-teal-900/60 rounded-lg p-6">
                      <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 text-xs font-semibold text-teal-300 border border-teal-700/60 bg-teal-950/40 px-3 py-1.5 rounded-lg">
                          <Crown className="h-4 w-4 fill-teal-300" /> Pro Feature
                        </div>
                        <h2 className="mt-4 text-2xl font-black tracking-tight text-zinc-50">Unlock Premium Simulation Lab.</h2>
                        <p className="mt-2 text-sm leading-relaxed text-zinc-400">Pro shows input states, output states, sample sensor readings, and expected behavior so students can debug logic before powering real hardware.</p>
                        <button type="button" onClick={() => initiateCheckout()} disabled={isProcessingPayment} className="mt-5 h-10 px-4 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold uppercase flex items-center justify-center gap-2 transition disabled:opacity-50">
                          {isProcessingPayment ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <CreditCard className="h-3.5 w-3.5" />} Start Pro Trial
                        </button>
                      </div>
                    </div>
                  )
                )}

                {activeTab === 'explain' && (
                  <div className="space-y-4">
                    <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-5">
                      <h3 className="text-teal-300 font-bold uppercase tracking-wider text-xs flex items-center gap-2"><Code2 className="h-4 w-4" /> Code Explanation</h3>
                      <p className="mt-2 text-sm text-zinc-400">Beginner-friendly explanation of the most important firmware blocks so students can present and modify the code with confidence.</p>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      {codeExplanations.map((item, index) => (
                        <section key={`${item.concept}-${index}`} className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-5">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <h4 className="text-sm font-black text-zinc-100">{index + 1}. {item.concept}</h4>
                              <p className="mt-2 text-sm leading-relaxed text-zinc-400">{item.explanation}</p>
                            </div>
                            <span className="shrink-0 rounded-md border border-zinc-800 bg-zinc-950 px-2.5 py-1 text-[10px] font-bold uppercase text-teal-300">Study</span>
                          </div>
                          <pre className="mt-4 overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-xs text-emerald-300 font-mono"><code>{item.code_reference}</code></pre>
                        </section>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'learn' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="bg-zinc-900/60 border border-zinc-800 p-5 rounded-lg text-xs">
                      <h3 className="text-teal-300 font-bold uppercase tracking-wider mb-3 flex items-center gap-2"><GraduationCap className="h-4 w-4" /> Learning Goals</h3>
                      <ul className="space-y-2 text-zinc-300">
                        {(data.learning_goals || ['Understand sensor input, actuator output, and microcontroller control flow.']).map((goal, idx) => <li key={`${goal}-${idx}`} className="flex gap-2"><span className="text-teal-300">•</span>{goal}</li>)}
                      </ul>
                    </div>
                    <div className="bg-zinc-900/60 border border-zinc-800 p-5 rounded-lg text-xs">
                      <h3 className="text-violet-300 font-bold uppercase tracking-wider mb-3 flex items-center gap-2"><Lightbulb className="h-4 w-4" /> Next Upgrades</h3>
                      <ul className="space-y-2 text-zinc-300">
                        {(data.next_upgrades || ['Add a battery budget, enclosure, data logging, or a wireless dashboard.']).map((upgrade, idx) => <li key={`${upgrade}-${idx}`} className="flex gap-2"><span className="text-violet-300">•</span>{upgrade}</li>)}
                      </ul>
                    </div>
                  </div>
                )}

                {activeTab === 'shop' && (
                  <div className="space-y-4">
                    <div className="bg-zinc-900/60 border border-zinc-800 p-5 rounded-lg">
                      <h3 className="text-teal-300 font-bold uppercase tracking-wider text-xs flex items-center gap-2"><Store className="h-4 w-4" /> Smart Parts Shopping List</h3>
                      <p className="mt-2 text-sm text-zinc-400">A cleaner bill of materials with quantity, estimated price, buying notes, alternatives, and quick component search.</p>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      {data.bill_of_materials.map((bom, idx) => (
                        <div key={`${bom.item}-shop-${idx}`} className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                            <div>
                              <h4 className="text-sm font-black text-zinc-100">{bom.item} <span className="text-teal-300">x{bom.quantity}</span></h4>
                              <p className="mt-1 text-xs text-zinc-500">{bom.buying_tip || 'Check voltage, pinout, connector type, and seller ratings before buying.'}</p>
                            </div>
                            <button type="button" onClick={() => openCartTab(bom.item)} className="h-9 px-3 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-300 hover:text-teal-300 hover:border-teal-800 flex items-center justify-center gap-2 transition">
                              <ShoppingCart className="h-3.5 w-3.5" /> Search
                            </button>
                          </div>
                          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            <div className="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2">
                              <p className="text-zinc-500 font-bold uppercase">Estimated Price</p>
                              <p className="mt-1 text-zinc-300">{bom.estimated_price || 'Varies by seller'}</p>
                            </div>
                            <div className="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2">
                              <p className="text-zinc-500 font-bold uppercase">Alternative</p>
                              <p className="mt-1 text-zinc-300">{bom.alternative || 'Use an equivalent module with the same voltage and signal type.'}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'quiz' && (
                  <div className="space-y-4">
                    <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-5">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                          <h3 className="text-teal-300 font-bold uppercase tracking-wider text-xs flex items-center gap-2"><Award className="h-4 w-4" /> Trivia Quiz</h3>
                          <h2 className="mt-3 text-2xl font-black tracking-tight text-zinc-50">10-question viva practice</h2>
                          <p className="mt-2 text-sm text-zinc-400">Timed practice based on this project&apos;s board, parts, wiring, upload guide, safety, simulation, and teacher questions.</p>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-center text-xs">
                          <div className="rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3">
                            <p className="text-zinc-500 font-bold uppercase">Time</p>
                            <p className={`mt-1 text-lg font-black ${quizSecondsRemaining <= 60 ? 'text-red-300' : 'text-teal-300'}`}>{quizMinutes}:{quizSeconds}</p>
                          </div>
                          <div className="rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3">
                            <p className="text-zinc-500 font-bold uppercase">Done</p>
                            <p className="mt-1 text-lg font-black text-zinc-100">{Object.keys(quizAnswers).length}/10</p>
                          </div>
                          <div className="rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3">
                            <p className="text-zinc-500 font-bold uppercase">Score</p>
                            <p className="mt-1 text-lg font-black text-emerald-300">{quizSubmitted ? `${quizScore}/10` : '--'}</p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 h-2 overflow-hidden rounded-full bg-zinc-950 border border-zinc-800">
                        <div className="h-full bg-teal-500 transition-all" style={{ width: `${(Object.keys(quizAnswers).length / Math.max(quizQuestions.length, 1)) * 100}%` }} />
                      </div>

                      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                        {!quizStarted ? (
                          <button type="button" onClick={() => { setQuizStarted(true); setQuizSubmitted(false); setQuizSecondsRemaining(QUIZ_DURATION_SECONDS); setQuizAnswers({}); }} className="h-10 px-4 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold uppercase flex items-center justify-center gap-2 transition">
                            <Clock3 className="h-4 w-4" /> Start 10 Minute Quiz
                          </button>
                        ) : (
                          <button type="button" onClick={() => setQuizSubmitted(true)} disabled={quizSubmitted} className="h-10 px-4 bg-teal-600 hover:bg-teal-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white rounded-lg text-xs font-bold uppercase flex items-center justify-center gap-2 transition">
                            <CheckCircle2 className="h-4 w-4" /> Submit Quiz
                          </button>
                        )}
                        <button type="button" onClick={resetQuiz} className="h-10 px-4 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-300 hover:text-teal-300 hover:border-teal-800 flex items-center justify-center gap-2 transition">
                          <RotateCcw className="h-4 w-4" /> Reset
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      {quizQuestions.map((question, questionIndex) => {
                        const selectedAnswer = quizAnswers[questionIndex];
                        const isCorrect = selectedAnswer === question.answer;

                        return (
                          <section key={`${question.question}-${questionIndex}`} className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-5">
                            <div className="flex items-start justify-between gap-4">
                              <h4 className="text-sm font-black text-zinc-100 leading-relaxed">{questionIndex + 1}. {question.question}</h4>
                              {quizSubmitted && (
                                <span className={`shrink-0 rounded-md border px-2 py-1 text-[10px] font-bold uppercase ${isCorrect ? 'border-emerald-800 bg-emerald-950/30 text-emerald-300' : 'border-red-900 bg-red-950/30 text-red-300'}`}>
                                  {isCorrect ? 'Correct' : 'Review'}
                                </span>
                              )}
                            </div>

                            <div className="mt-4 grid grid-cols-1 gap-2">
                              {question.options.map((option) => {
                                const isSelected = selectedAnswer === option;
                                const isAnswer = question.answer === option;
                                const resultClass = quizSubmitted && isAnswer
                                  ? 'border-emerald-700 bg-emerald-950/30 text-emerald-200'
                                  : quizSubmitted && isSelected && !isAnswer
                                    ? 'border-red-800 bg-red-950/30 text-red-200'
                                    : isSelected
                                      ? 'border-teal-700 bg-teal-950/30 text-teal-200'
                                      : 'border-zinc-800 bg-zinc-950/70 text-zinc-300 hover:border-teal-800';

                                return (
                                  <button
                                    key={`${question.question}-${option}`}
                                    type="button"
                                    disabled={!quizStarted || quizSubmitted}
                                    onClick={() => setQuizAnswers((answers) => ({ ...answers, [questionIndex]: option }))}
                                    className={`min-h-11 rounded-lg border px-3 py-2 text-left text-xs transition disabled:cursor-default ${resultClass}`}
                                  >
                                    {option}
                                  </button>
                                );
                              })}
                            </div>

                            {quizSubmitted && (
                              <div className="mt-4 rounded-lg border border-zinc-800 bg-zinc-950/70 p-3 text-xs text-zinc-400">
                                <span className="font-bold text-teal-300">Answer:</span> {question.answer}
                                <p className="mt-1 leading-relaxed">{question.explanation}</p>
                              </div>
                            )}
                          </section>
                        );
                      })}
                    </div>
                  </div>
                )}

                {activeTab === 'present' && (
                  <div className="space-y-4">
                    <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-5">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h3 className="text-teal-300 font-bold uppercase tracking-wider text-xs flex items-center gap-2"><Presentation className="h-4 w-4" /> Presentation Mode</h3>
                          <h2 className="mt-3 text-2xl font-black tracking-tight text-zinc-50">5-slide project presentation</h2>
                          <p className="mt-2 text-sm text-zinc-400">Ready for class demos: aim, components, circuit/code, working/testing, and result/future scope.</p>
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <button type="button" onClick={openPresentationFullscreen} className="h-9 px-3 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-xs font-bold uppercase flex items-center justify-center gap-2 transition">
                            <Maximize2 className="h-3.5 w-3.5" /> Fullscreen
                          </button>
                          <button type="button" onClick={downloadPresentation} className="h-9 px-3 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold uppercase flex items-center justify-center gap-2 transition">
                            <Download className="h-3.5 w-3.5" /> Slides HTML
                          </button>
                          <button type="button" onClick={copyShareLink} className="h-9 px-3 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-300 hover:text-teal-300 hover:border-teal-800 flex items-center justify-center gap-2 transition">
                            <Share2 className="h-3.5 w-3.5" /> Share Link
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[9rem_1fr]">
                      <div className="flex gap-2 overflow-x-auto xl:flex-col xl:overflow-x-visible">
                        {presentationSlides.map((slide, index) => (
                          <button
                            key={`${slide.title}-thumb-${index}`}
                            type="button"
                            onClick={() => setPresentationSlideIndex(index)}
                            className={`min-w-32 rounded-lg border p-3 text-left transition xl:min-w-0 ${presentationSlideIndex === index ? 'border-teal-600 bg-teal-950/30 text-teal-200' : 'border-zinc-800 bg-zinc-900/70 text-zinc-500 hover:text-zinc-300'}`}
                          >
                            <p className="text-[10px] font-bold uppercase">Slide {index + 1}</p>
                            <p className="mt-1 truncate text-xs font-black">{slide.title}</p>
                          </button>
                        ))}
                      </div>

                      <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-3">
                        {currentPresentationSlide && (
                          <section className="relative aspect-video min-h-80 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 p-8 md:p-10">
                            <div className="absolute right-5 top-5 rounded-md border border-teal-800/70 bg-teal-950/50 px-2.5 py-1 text-[10px] font-bold uppercase text-teal-300">
                              Slide {presentationSlideIndex + 1} / {presentationSlides.length}
                            </div>
                            <div className="flex h-full flex-col justify-center">
                              <p className="text-xs font-bold uppercase tracking-widest text-teal-300">CircuitAI Presentation</p>
                              <h3 className="mt-4 max-w-3xl text-4xl font-black tracking-tight text-zinc-50 md:text-6xl">{currentPresentationSlide.title}</h3>
                              <ul className="mt-8 max-w-3xl space-y-4 text-base text-zinc-200 md:text-xl">
                                {currentPresentationSlide.bullets.map((bullet, bulletIndex) => (
                                  <li key={`${bullet}-${bulletIndex}`} className="flex gap-3 leading-relaxed"><CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-teal-300" /> {bullet}</li>
                                ))}
                              </ul>
                            </div>
                          </section>
                        )}

                        <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                          <div className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-xs text-zinc-400 lg:flex-1">
                            <span className="font-bold text-violet-300">Speaker notes:</span> {currentPresentationSlide?.speaker_notes}
                          </div>
                          <div className="flex gap-2">
                            <button type="button" onClick={goToPreviousSlide} disabled={presentationSlideIndex === 0} className="h-10 px-3 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-300 hover:text-teal-300 disabled:opacity-40 disabled:hover:text-zinc-300 flex items-center gap-2 text-xs font-bold uppercase transition">
                              <ChevronLeft className="h-4 w-4" /> Prev
                            </button>
                            <button type="button" onClick={goToNextSlide} disabled={presentationSlideIndex >= presentationSlides.length - 1} className="h-10 px-3 rounded-lg bg-teal-600 text-white hover:bg-teal-500 disabled:bg-zinc-800 disabled:text-zinc-500 flex items-center gap-2 text-xs font-bold uppercase transition">
                              Next <ChevronRight className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'report' && (
                  isProUser ? (
                    <div className="space-y-4">
                    <div className="bg-zinc-900/60 border border-zinc-800 p-5 rounded-lg">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div>
                          <h3 className="text-teal-300 font-bold uppercase tracking-wider text-xs flex items-center gap-2"><FileText className="h-4 w-4" /> Teacher Report Mode</h3>
                          <h2 className="mt-3 text-2xl font-black tracking-tight text-zinc-50">{data.project_title}</h2>
                          <p className="mt-2 text-sm text-zinc-400">A school-ready project report structure for submission, viva preparation, or documentation.</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2">
                          <button type="button" onClick={printTeacherReport} className="h-9 px-3 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold uppercase flex items-center justify-center gap-2 transition">
                            <Printer className="h-3.5 w-3.5" /> PDF / Print
                          </button>
                          <button type="button" onClick={downloadTeacherReport} className="h-9 px-3 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-300 hover:text-teal-300 hover:border-teal-800 flex items-center justify-center gap-2 transition">
                            <Download className="h-3.5 w-3.5" /> HTML
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
                      {[
                        { title: 'Aim', body: `To design, assemble, test, and explain ${data.project_title} using ${data.target_board}.` },
                        { title: 'Abstract', body: data.teacher_mode?.abstract || `This report documents the design, construction, firmware, testing, and safety checks for ${data.project_title}.` },
                        { title: 'Working Principle', body: data.teacher_mode?.working_principle || (data.learning_goals || ['The controller reads inputs, processes logic, and controls outputs to complete the robotics task.']).join(' ') },
                        { title: 'Applications', body: (data.teacher_mode?.applications || data.next_upgrades || ['Can be extended into a more advanced robotics prototype.']).join(' ') },
                        { title: 'Conclusion', body: data.teacher_mode?.conclusion || 'This project demonstrates microcontroller-based robotics design, wiring, firmware logic, testing, and safe debugging practices.' },
                      ].map((section) => (
                        <section key={section.title} className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-5">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-teal-300">{section.title}</h3>
                          <p className="mt-2 text-zinc-300 leading-relaxed">{section.body}</p>
                        </section>
                      ))}
                    </div>

                    <div className="bg-zinc-900/60 border border-zinc-800 p-5 rounded-lg text-xs">
                      <h3 className="text-teal-300 font-bold uppercase tracking-wider mb-3">Viva Questions</h3>
                      <ol className="space-y-2 text-zinc-300 list-decimal pl-4">
                        {(data.teacher_mode?.viva_questions?.length ? data.teacher_mode.viva_questions : [
                          `What is the role of ${data.target_board} in this project?`,
                          'Which sensor or input is most important, and why?',
                          'How did you verify the wiring before powering the circuit?',
                          'What changes would you make to improve the project?',
                        ]).map((question, idx) => <li key={`${question}-${idx}`}>{question}</li>)}
                      </ol>
                    </div>

                    <div className="bg-zinc-900/60 border border-zinc-800 p-5 rounded-lg text-xs">
                      <h3 className="text-violet-300 font-bold uppercase tracking-wider mb-3">Marking Rubric</h3>
                      <ul className="space-y-2 text-zinc-300">
                        {(data.teacher_mode?.rubric?.length ? data.teacher_mode.rubric : [
                          'Working circuit and correct wiring',
                          'Firmware quality and explanation',
                          'Testing evidence and troubleshooting',
                          'Neat documentation and presentation',
                        ]).map((rubric, idx) => <li key={`${rubric}-${idx}`} className="flex gap-2"><span className="text-violet-300">•</span>{rubric}</li>)}
                      </ul>
                    </div>
                  </div>
                  ) : (
                    <div className="bg-teal-950/20 border border-teal-900/60 rounded-lg p-6">
                      <div className="max-w-2xl">
                        <div className="inline-flex items-center gap-2 text-xs font-semibold text-teal-300 border border-teal-700/60 bg-teal-950/40 px-3 py-1.5 rounded-lg">
                          <Crown className="h-4 w-4 fill-teal-300" /> Pro Feature
                        </div>
                        <h2 className="mt-4 text-2xl font-black tracking-tight text-zinc-50">Unlock Teacher Report Mode.</h2>
                        <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                          Pro includes school-ready reports with aim, working principle, components, procedures, conclusion, viva questions, and PDF / print export.
                        </p>
                        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {['PDF / print reports', 'Viva questions', 'Clean teacher format', 'Unlimited saved reports'].map((benefit) => (
                            <div key={benefit} className="rounded-md border border-zinc-800 bg-zinc-950/70 px-3 py-2 text-xs text-zinc-300">
                              {benefit}
                            </div>
                          ))}
                        </div>
                        <button type="button" onClick={() => initiateCheckout()} disabled={isProcessingPayment} className="mt-5 h-10 px-4 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold uppercase flex items-center justify-center gap-2 transition disabled:opacity-50">
                          {isProcessingPayment ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <CreditCard className="h-3.5 w-3.5" />} Start Pro Trial
                        </button>
                      </div>
                    </div>
                  )
                )}

                <form onSubmit={handleModify} className="bg-teal-950/20 border border-teal-900/50 p-4 rounded-lg flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="p-2 bg-teal-900/30 rounded-lg text-teal-300 shrink-0"><Edit3 className="h-5 w-5" /></div>
                    <input type="text" value={modifyPrompt} onChange={(e) => setModifyPrompt(e.target.value)} placeholder="Add Bluetooth, switch to ESP32, simplify for beginners..." className="flex-1 bg-transparent text-sm text-zinc-200 placeholder:text-zinc-500 focus:outline-none min-w-0" required />
                  </div>
                  <button type="submit" disabled={modifying} className="px-4 py-2.5 bg-teal-900/50 hover:bg-teal-900/70 text-teal-300 rounded-lg text-xs font-bold uppercase transition flex items-center justify-center gap-2 shrink-0">
                    {modifying ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : 'Update Build'}
                  </button>
                </form>

                {data.youtube_search_query && (
                  <div className="bg-zinc-900/60 border border-zinc-800 p-4 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-red-950/40 border border-red-900/50 rounded-lg text-red-300 shrink-0"><MonitorPlay className="h-5 w-5" /></div>
                      <div>
                        <h4 className="text-xs font-bold text-zinc-200">Video Tutorials</h4>
                        <p className="text-[11px] text-zinc-500">Search YouTube for project walkthroughs.</p>
                      </div>
                    </div>
                    <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(data.youtube_search_query)}`} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto h-9 px-4 bg-red-900/30 hover:bg-red-900/50 border border-red-800 text-red-200 text-xs rounded-lg flex items-center justify-center gap-1.5 transition shrink-0">
                      Open YouTube
                    </a>
                  </div>
                )}
              </div>

              <div className="xl:col-span-4 space-y-4 text-xs">
                <div className="bg-zinc-900/60 border border-zinc-800 p-4 rounded-lg">
                  <h2 className="text-lg font-black text-zinc-100 leading-tight">{data.project_title}</h2>
                  <div className="grid grid-cols-3 gap-2 mt-4">
                    <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-2">
                      <p className="text-[10px] text-zinc-500 uppercase font-bold">Board</p>
                      <p className="text-zinc-200 truncate">{data.target_board}</p>
                    </div>
                    <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-2">
                      <p className="text-[10px] text-zinc-500 uppercase font-bold">Time</p>
                      <p className="text-zinc-200 truncate">{data.estimated_time || 'TBD'}</p>
                    </div>
                    <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-2">
                      <p className="text-[10px] text-zinc-500 uppercase font-bold">Level</p>
                      <p className="text-zinc-200 truncate">{data.difficulty || 'Student'}</p>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-2">
                    <button type="button" onClick={printTeacherReport} className="w-full h-9 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold uppercase flex items-center justify-center gap-2 transition">
                      <Printer className="h-3.5 w-3.5" /> PDF / Print Report
                    </button>
                    <button type="button" onClick={downloadProjectPack} className="w-full h-9 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-zinc-300 hover:text-teal-300 hover:border-teal-800 flex items-center justify-center gap-2 transition">
                      <Download className="h-3.5 w-3.5" /> Project Pack
                    </button>
                  </div>
                </div>

                {data.warnings.length > 0 && (
                  <div className="bg-red-950/20 border border-red-900/60 p-4 rounded-lg">
                    <h3 className="text-red-300 font-bold uppercase mb-2 flex items-center gap-2"><ShieldAlert className="h-4 w-4" /> Safeguards</h3>
                    <ul className="list-disc pl-4 space-y-1 text-red-200/90">
                      {data.warnings.map((warning, index) => <li key={`${warning}-${index}`}>{warning}</li>)}
                    </ul>
                  </div>
                )}

                <div className="bg-zinc-900/60 border border-zinc-800 p-4 rounded-lg">
                  <h3 className="text-zinc-400 mb-2 uppercase font-bold">Required Materials</h3>
                  <div className="space-y-2">
                    {data.bill_of_materials?.map((bom, index) => (
                      <div key={`${bom.item}-${index}`} className="flex justify-between items-center border-b border-zinc-950/80 py-1.5 text-zinc-300">
                        <span className="truncate pr-2">{bom.item} <span className="text-teal-300 font-bold">x{bom.quantity}</span></span>
                        <button type="button" onClick={() => openCartTab(bom.item)} className="p-1.5 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-400 hover:text-teal-300 hover:border-teal-900/50 transition shrink-0" title="Find component">
                          <ShoppingCart className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {data.tools_needed.length > 0 && (
                  <div className="bg-zinc-900/60 border border-zinc-800 p-4 rounded-lg">
                    <h3 className="text-zinc-400 mb-2 uppercase font-bold flex items-center gap-1.5"><Wrench className="h-3.5 w-3.5" /> Workspace Tools</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {data.tools_needed.map((tool, index) => (
                        <span key={`${tool}-${index}`} className="bg-zinc-950 border border-zinc-800 px-2.5 py-1 rounded-md text-zinc-400 text-[11px]">{tool}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-28 border border-dashed border-zinc-800 rounded-lg flex items-center justify-center text-zinc-600 text-xs">Your generated project workspace will appear here.</div>
          )}
        </main>
      </div>

      <footer className="border-t border-zinc-800 bg-zinc-950 px-6 py-4 z-20 shrink-0 text-xs text-zinc-500 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-center sm:text-left">
          &copy; {new Date().getFullYear()} <span className="text-zinc-300 font-bold">CircuitAI</span>. All rights reserved.
          <span className="block sm:inline sm:ml-2">
            Founder & Developer:{' '}
            <a href="https://aahilworks.github.io" target="_blank" rel="noopener noreferrer" className="text-teal-300 hover:text-teal-200 transition">
              AahilWorks
            </a>
          </span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/terms" className="hover:text-teal-300 transition">Terms</Link>
          <Link href="/privacy" className="hover:text-teal-300 transition">Privacy</Link>
        </div>
      </footer>

      {isPresentationFullscreen && currentPresentationSlide && (
        <div className="fixed inset-0 z-[100] bg-zinc-950 text-zinc-100">
          <div className="absolute left-4 right-4 top-4 z-10 flex items-center justify-between gap-3">
            <div className="rounded-lg border border-zinc-800 bg-zinc-950/80 px-3 py-2 text-xs font-bold uppercase text-teal-300 backdrop-blur">
              Slide {presentationSlideIndex + 1} / {presentationSlides.length}
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={downloadPresentation} className="h-10 px-3 rounded-lg border border-zinc-800 bg-zinc-950/80 text-xs font-bold uppercase text-zinc-300 hover:text-teal-300 backdrop-blur transition">
                Slides HTML
              </button>
              <button type="button" onClick={closePresentationFullscreen} className="h-10 px-3 rounded-lg border border-zinc-800 bg-zinc-950/80 text-xs font-bold uppercase text-zinc-300 hover:text-red-300 backdrop-blur transition">
                Close
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={goToPreviousSlide}
            disabled={presentationSlideIndex === 0}
            className="absolute left-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-zinc-800 bg-zinc-950/80 text-zinc-300 hover:text-teal-300 disabled:opacity-30 backdrop-blur transition"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <section className="flex h-full w-full items-center justify-center px-8 py-20">
            <div className="relative flex aspect-video w-full max-w-7xl flex-col justify-center overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 p-10 shadow-2xl md:p-16">
              <div className="absolute inset-x-0 top-0 h-1 bg-teal-500" style={{ width: `${((presentationSlideIndex + 1) / Math.max(presentationSlides.length, 1)) * 100}%` }} />
              <p className="text-sm font-bold uppercase tracking-widest text-teal-300">CircuitAI Presentation</p>
              <h2 className="mt-5 max-w-5xl text-5xl font-black tracking-tight text-zinc-50 md:text-7xl">{currentPresentationSlide.title}</h2>
              <ul className="mt-10 max-w-5xl space-y-5 text-xl text-zinc-200 md:text-3xl">
                {currentPresentationSlide.bullets.map((bullet, bulletIndex) => (
                  <li key={`${bullet}-${bulletIndex}-fullscreen`} className="flex gap-4 leading-relaxed">
                    <CheckCircle2 className="mt-1 h-7 w-7 shrink-0 text-teal-300" />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
              <div className="absolute bottom-6 left-10 right-10 rounded-lg border border-zinc-800 bg-zinc-900/80 p-3 text-sm text-zinc-400 md:left-16 md:right-16">
                <span className="font-bold text-violet-300">Speaker notes:</span> {currentPresentationSlide.speaker_notes}
              </div>
            </div>
          </section>

          <button
            type="button"
            onClick={goToNextSlide}
            disabled={presentationSlideIndex >= presentationSlides.length - 1}
            className="absolute right-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-zinc-800 bg-zinc-950/80 text-zinc-300 hover:text-teal-300 disabled:opacity-30 backdrop-blur transition"
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      )}

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} user={currentUser} />
    </div>
  );
}
