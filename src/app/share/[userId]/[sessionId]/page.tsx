import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { adminDb } from '@/lib/firebaseAdmin';
import {
  ArrowRight,
  Cable,
  Code2,
  Cpu,
  FileText,
  FlaskConical,
  GraduationCap,
  Lightbulb,
  MonitorPlay,
  Presentation,
  ShieldAlert,
  ShoppingCart,
  UploadCloud,
  Wrench,
} from 'lucide-react';

interface BOMItem {
  item: string;
  quantity: number;
  estimated_price?: string;
  buying_tip?: string;
  alternative?: string;
}

interface ProjectData {
  project_title: string;
  target_board: string;
  bill_of_materials: BOMItem[];
  tools_needed: string[];
  connections: { from: string; to: string }[];
  warnings: string[];
  steps: string[];
  code: string;
  secondary_code?: string;
  secondary_language?: string;
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
    abstract?: string;
    working_principle?: string;
    applications?: string[];
    viva_questions?: string[];
    rubric?: string[];
    conclusion?: string;
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

interface SharePageProps {
  params: Promise<{
    userId: string;
    sessionId: string;
  }>;
}

const fallbackList = (items: string[] | undefined, fallback: string) => (
  items && items.length > 0 ? items : [fallback]
);

const Section = ({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) => (
  <article className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-5">
    <h2 className="text-sm font-black uppercase tracking-wider text-teal-300 flex items-center gap-2">{icon} {title}</h2>
    <div className="mt-4">{children}</div>
  </article>
);

export default async function SharePage({ params }: SharePageProps) {
  const { userId, sessionId } = await params;
  const sessionDoc = await adminDb.collection('users').doc(userId).collection('chatSessions').doc(sessionId).get();

  if (!sessionDoc.exists) notFound();

  const session = sessionDoc.data();
  const project = session?.projectData as ProjectData | undefined;

  if (!project) notFound();

  const uploadGuide = {
    ide: project.upload_guide?.ide || 'Arduino IDE 2.x',
    board_package: project.upload_guide?.board_package || `Install/select the package for ${project.target_board}.`,
    required_libraries: fallbackList(project.upload_guide?.required_libraries, 'Install libraries used in the firmware.'),
    steps: fallbackList(project.upload_guide?.steps, 'Connect the board, select the correct board and port, then upload the firmware.'),
    serial_monitor: project.upload_guide?.serial_monitor || 'Use the baud rate from Serial.begin(...) in the firmware.',
    common_errors: fallbackList(project.upload_guide?.common_errors, 'Check board selection, USB cable, port, libraries, and pin mapping.'),
    upload_checklist: fallbackList(project.upload_guide?.upload_checklist, 'Board, port, libraries, power, and common ground verified.'),
  };

  const simulation = {
    inputs: fallbackList(project.simulation?.inputs, 'Sensor input values'),
    outputs: fallbackList(project.simulation?.outputs, 'Motor, LED, buzzer, display, or serial output'),
    states: fallbackList(project.simulation?.states, 'Idle, sensing, acting, and fault states'),
    sample_readings: fallbackList(project.simulation?.sample_readings, 'Normal, trigger, and fault readings'),
    expected_behavior: fallbackList(project.simulation?.expected_behavior, 'Robot output should change correctly when inputs cross expected thresholds.'),
  };

  const codeExplanations = project.code_explanation?.length ? project.code_explanation : [
    { concept: 'Setup', code_reference: 'void setup()', explanation: 'Runs once to configure pins, sensors, communication, and starting states.' },
    { concept: 'Loop', code_reference: 'void loop()', explanation: 'Runs repeatedly so the robot can keep reading inputs and controlling outputs.' },
    { concept: 'Debugging', code_reference: 'Serial monitor', explanation: 'Serial output helps verify readings and troubleshoot without guessing.' },
  ];

  const presentationSlides = project.presentation_slides?.length ? project.presentation_slides.slice(0, 5) : [
    { title: 'Aim', bullets: [`Build ${project.project_title}`, `Use ${project.target_board}`], speaker_notes: 'Introduce the goal of the project.' },
    { title: 'Components', bullets: project.bill_of_materials.slice(0, 5).map((item) => `${item.quantity} x ${item.item}`), speaker_notes: 'Explain the role of each major part.' },
    { title: 'Circuit & Code', bullets: [`${project.connections.length} wiring connections`, 'Firmware controls inputs and outputs'], speaker_notes: 'Explain how hardware and software connect.' },
    { title: 'Working & Testing', bullets: fallbackList(project.test_plan, 'Test the project step by step.').slice(0, 4), speaker_notes: 'Explain testing and expected behavior.' },
    { title: 'Result & Future Scope', bullets: fallbackList(project.next_upgrades, 'Improve the prototype in future versions.').slice(0, 4), speaker_notes: 'Conclude with learning and upgrades.' },
  ];

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-teal-500/30">
      <header className="border-b border-zinc-800 bg-zinc-950/95 px-4 py-4 md:px-8">
        <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="font-black text-xs text-teal-300 bg-zinc-900 border border-zinc-800 px-2 py-1 rounded-md">CAI</span>
            <span className="text-lg font-black tracking-wide">Circuit<span className="text-teal-300">AI</span></span>
          </Link>
          <Link href="/workspace" className="h-9 px-4 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold uppercase flex items-center gap-2 transition">
            Build Your Own <ArrowRight className="h-4 w-4" />
          </Link>
        </nav>
      </header>

      <section className="bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.14),transparent_34rem)] px-4 py-12 md:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-teal-300 border border-teal-700/60 bg-teal-950/40 px-3 py-1.5 rounded-lg">
            <FileText className="h-4 w-4" /> Full Shared Project
          </div>
          <h1 className="mt-5 max-w-4xl text-4xl font-black tracking-tight text-zinc-50 md:text-6xl">{project.project_title}</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-400">
            Complete read-only CircuitAI project pack with code, wiring, parts, upload guide, simulation, teacher notes, slides, and safety details.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-4">
            {[
              ['Board', project.target_board],
              ['Time', project.estimated_time || 'TBD'],
              ['Level', project.difficulty || 'Student'],
              ['Safety', project.safety_level || 'Verify'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{label}</p>
                <p className="mt-1 text-sm font-black text-zinc-100">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-8 md:px-8">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 lg:grid-cols-2">
          <Section title="Parts Shopping List" icon={<ShoppingCart className="h-4 w-4" />}>
            <div className="space-y-2 text-sm text-zinc-300">
              {project.bill_of_materials.map((item, index) => (
                <div key={`${item.item}-${index}`} className="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2">
                  <p className="font-bold text-zinc-100">{item.quantity} x {item.item}</p>
                  <p className="mt-1 text-xs text-zinc-500">{item.estimated_price || 'Price varies'} | {item.alternative || 'Equivalent compatible part'} | {item.buying_tip || 'Check voltage and seller ratings.'}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Wiring" icon={<Cable className="h-4 w-4" />}>
            <div className="space-y-2 text-sm text-zinc-300">
              {project.connections.map((connection, index) => (
                <div key={`${connection.from}-${connection.to}-${index}`} className="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2">
                  <span className="text-teal-300 font-bold">{connection.from}</span> to <span className="text-violet-300 font-bold">{connection.to}</span>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Assembly" icon={<Cpu className="h-4 w-4" />}>
            <ol className="list-decimal space-y-2 pl-5 text-sm text-zinc-300">
              {project.steps.map((step, index) => <li key={`${step}-${index}`}>{step}</li>)}
            </ol>
          </Section>

          <Section title="Upload Guide" icon={<UploadCloud className="h-4 w-4" />}>
            <div className="space-y-3 text-sm text-zinc-300">
              <p><span className="font-bold text-teal-300">IDE:</span> {uploadGuide.ide}</p>
              <p><span className="font-bold text-teal-300">Board package:</span> {uploadGuide.board_package}</p>
              <p><span className="font-bold text-teal-300">Serial monitor:</span> {uploadGuide.serial_monitor}</p>
              <ol className="list-decimal space-y-2 pl-5">{uploadGuide.steps.map((step, index) => <li key={`${step}-${index}`}>{step}</li>)}</ol>
            </div>
          </Section>

          <Section title="Testing" icon={<FlaskConical className="h-4 w-4" />}>
            <ol className="list-decimal space-y-2 pl-5 text-sm text-zinc-300">
              {fallbackList(project.test_plan, 'Power from USB first and verify basic operation.').map((step, index) => <li key={`${step}-${index}`}>{step}</li>)}
            </ol>
          </Section>

          <Section title="Simulation" icon={<MonitorPlay className="h-4 w-4" />}>
            <div className="grid grid-cols-1 gap-3 text-sm text-zinc-300 sm:grid-cols-2">
              {[
                ['Inputs', simulation.inputs],
                ['Outputs', simulation.outputs],
                ['States', simulation.states],
                ['Expected', simulation.expected_behavior],
              ].map(([label, items]) => (
                <div key={label as string} className="rounded-md border border-zinc-800 bg-zinc-950 p-3">
                  <p className="text-xs font-bold uppercase text-teal-300">{label as string}</p>
                  <ul className="mt-2 list-disc space-y-1 pl-4">{(items as string[]).map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Learning & Upgrades" icon={<Lightbulb className="h-4 w-4" />}>
            <div className="grid grid-cols-1 gap-3 text-sm text-zinc-300 sm:grid-cols-2">
              <ul className="list-disc space-y-2 pl-5">{fallbackList(project.learning_goals, 'Understand how controller logic connects input and output.').map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul>
              <ul className="list-disc space-y-2 pl-5">{fallbackList(project.next_upgrades, 'Improve the project with better testing and enclosure design.').map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul>
            </div>
          </Section>

          <Section title="Teacher Mode" icon={<GraduationCap className="h-4 w-4" />}>
            <div className="space-y-4 text-sm text-zinc-300">
              <p>{project.teacher_mode?.abstract || `This project explains the design and testing of ${project.project_title}.`}</p>
              <p><span className="font-bold text-teal-300">Working principle:</span> {project.teacher_mode?.working_principle || 'The controller reads inputs, processes logic, and controls outputs.'}</p>
              <p><span className="font-bold text-teal-300">Conclusion:</span> {project.teacher_mode?.conclusion || 'The build demonstrates robotics design, firmware, testing, and debugging.'}</p>
              <ol className="list-decimal space-y-2 pl-5">{fallbackList(project.teacher_mode?.viva_questions, `What is the role of ${project.target_board}?`).map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ol>
            </div>
          </Section>

          {project.warnings.length > 0 && (
            <article className="rounded-lg border border-red-900/60 bg-red-950/20 p-5 lg:col-span-2">
              <h2 className="text-sm font-black uppercase tracking-wider text-red-300 flex items-center gap-2"><ShieldAlert className="h-4 w-4" /> Safety Notes</h2>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-red-100/90">
                {project.warnings.map((warning, index) => <li key={`${warning}-${index}`}>{warning}</li>)}
              </ul>
            </article>
          )}

          <Section title="Code Explanation" icon={<Code2 className="h-4 w-4" />}>
            <div className="space-y-3">
              {codeExplanations.map((item, index) => (
                <div key={`${item.concept}-${index}`} className="rounded-md border border-zinc-800 bg-zinc-950 p-3">
                  <p className="text-sm font-bold text-zinc-100">{item.concept}</p>
                  <pre className="mt-2 overflow-auto whitespace-pre-wrap rounded-md bg-zinc-900 p-2 text-xs text-emerald-300 font-mono"><code>{item.code_reference}</code></pre>
                  <p className="mt-2 text-sm text-zinc-400">{item.explanation}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Presentation Slides" icon={<Presentation className="h-4 w-4" />}>
            <div className="space-y-3">
              {presentationSlides.map((slide, index) => (
                <div key={`${slide.title}-${index}`} className="rounded-md border border-zinc-800 bg-zinc-950 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-teal-300">Slide {index + 1}</p>
                  <h3 className="mt-1 text-lg font-black text-zinc-100">{slide.title}</h3>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-zinc-300">{slide.bullets.map((bullet, bulletIndex) => <li key={`${bullet}-${bulletIndex}`}>{bullet}</li>)}</ul>
                  <p className="mt-2 text-xs text-zinc-500">{slide.speaker_notes}</p>
                </div>
              ))}
            </div>
          </Section>

          <article className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-5 lg:col-span-2">
            <h2 className="text-sm font-black uppercase tracking-wider text-teal-300 flex items-center gap-2"><Code2 className="h-4 w-4" /> Firmware</h2>
            <pre className="mt-4 max-h-[36rem] overflow-auto whitespace-pre-wrap rounded-lg border border-zinc-800 bg-zinc-950 p-4 text-xs text-emerald-300 font-mono"><code>{project.code}</code></pre>
          </article>

          {project.secondary_code && (
            <article className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-5 lg:col-span-2">
              <h2 className="text-sm font-black uppercase tracking-wider text-violet-300 flex items-center gap-2"><Code2 className="h-4 w-4" /> Companion Code ({project.secondary_language || 'script'})</h2>
              <pre className="mt-4 max-h-[36rem] overflow-auto whitespace-pre-wrap rounded-lg border border-zinc-800 bg-zinc-950 p-4 text-xs text-violet-300 font-mono"><code>{project.secondary_code}</code></pre>
            </article>
          )}

          <Section title="Tools Needed" icon={<Wrench className="h-4 w-4" />}>
            <div className="flex flex-wrap gap-2">
              {project.tools_needed.map((tool, index) => <span key={`${tool}-${index}`} className="rounded-md border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-xs text-zinc-300">{tool}</span>)}
            </div>
          </Section>
        </div>
      </section>
    </main>
  );
}
