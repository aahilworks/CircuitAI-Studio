'use client';

import Link from 'next/link';
import { ArrowLeft, HelpCircle, ChevronDown } from 'lucide-react';
import { useState } from 'react';

const faqs = [
  {
    question: "What is CircuitAI - AI-Powered Arduino Project Generator?",
    answer: "CircuitAI is the best Arduino project maker online for students. It's an AI-powered robotics project generator that creates complete Arduino projects including circuit diagrams, Arduino code, wiring guides, bill of materials, and documentation. Perfect for STEM education, robotics for beginners, and electronics projects."
  },
  {
    question: "How does CircuitAI help students with Arduino projects?",
    answer: "CircuitAI helps students by generating complete robotics projects with AI-powered circuit diagrams, Arduino code, and wiring guides. It's designed specifically for STEM education, providing school-ready documentation, teacher reports, and viva practice quizzes. Best for Arduino projects and robotics education."
  },
  {
    question: "What Arduino boards does CircuitAI support?",
    answer: "CircuitAI supports Arduino UNO, Arduino Mega, ESP32, Raspberry Pi Pico, NodeMCU, and custom boards. Generate Arduino firmware, circuit diagrams, and wiring guides for all major microcontroller boards. Perfect for Arduino projects for beginners and advanced users."
  },
  {
    question: "Can CircuitAI generate circuit diagrams for electronics projects?",
    answer: "Yes, CircuitAI is the best circuit diagram generator for electronics projects. It creates advanced visual circuit diagrams, pin-by-pin wiring lists, and assembly routines. Perfect for Arduino circuit diagrams, electronics for beginners, and robotics engineering projects."
  },
  {
    question: "Is CircuitAI suitable for STEM education in schools?",
    answer: "Absolutely! CircuitAI is designed as a STEM education tool for schools. It provides teacher reports, marking rubrics, learning goals, and presentation slides. Perfect for STEM curriculum, robotics for schools, and maker education."
  },
  {
    question: "What features does CircuitAI Pro offer for robotics learning?",
    answer: "CircuitAI Pro offers unlimited AI Arduino generations, unlimited robotics project modifications, advanced visual circuit diagrams, premium simulation lab, teacher report mode, PDF export, presentation slides, and viva practice quiz. Best for robotics learning platform and Arduino project help."
  },
  {
    question: "How much does CircuitAI cost for students?",
    answer: "CircuitAI offers a free tier with 5 AI Arduino projects per month. Pro subscription starts at ₹699/month for unlimited robotics projects. Best Arduino project maker pricing for students with affordable STEM education solutions."
  },
  {
    question: "Can CircuitAI help with Arduino programming and code?",
    answer: "Yes, CircuitAI generates Arduino code with student-friendly explanations. It provides board-specific Arduino code upload guides, common upload errors and fixes, and Arduino IDE setup instructions. Perfect for Arduino programming, Arduino tutorial, and robotics for beginners."
  },
  {
    question: "Can CircuitAI provide Arduino project ideas for engineering students?",
    answer: "Yes, CircuitAI provides Arduino project ideas for engineering students including Arduino car project, Arduino robot arm, Arduino home automation, Arduino weather station, Arduino LED projects, Arduino motor control, Arduino sensor projects, Arduino IoT projects, Arduino Bluetooth projects, and Arduino WiFi projects."
  },
  {
    question: "How does CircuitAI compare to other Arduino project makers?",
    answer: "CircuitAI is the best Arduino project maker online with AI-powered generation. Unlike other tools, it provides complete project packs with circuit diagrams, Arduino code, wiring guides, BOM, testing checklists, and school-ready documentation. Best for robotics project services and Arduino development."
  },
  {
    question: "Can CircuitAI help with robotics competition projects?",
    answer: "Yes, CircuitAI helps with robotics competition projects by providing complete Arduino robotics projects, advanced circuit diagrams, and troubleshooting guides. Perfect for robotics competition, robotics engineering, and student robotics projects."
  },
  {
    question: "Does CircuitAI support IoT projects and smart projects?",
    answer: "Yes, CircuitAI supports Arduino IoT projects, Arduino WiFi projects, Arduino Bluetooth projects, and smart projects. Generate complete IoT project documentation with circuit diagrams, Arduino code, and wiring guides. Best for AI projects, automation projects, and EdTech solutions."
  },
  {
    question: "How can schools use CircuitAI for STEM education?",
    answer: "Schools can use CircuitAI for STEM education by providing students with AI-powered Arduino project generation, teacher reports, marking rubrics, and presentation slides. Perfect for STEM education tools, STEM curriculum, and robotics training."
  },
  {
    question: "What makes CircuitAI the best robotics learning platform?",
    answer: "CircuitAI is the best robotics learning platform because it combines AI-powered project generation with school-ready documentation, teacher reports, viva practice, and advanced features like circuit diagrams and simulation lab. Perfect for robotics education, Arduino learning, and electronics education."
  },
  {
    question: "Can CircuitAI help with Arduino sensor projects?",
    answer: "Yes, CircuitAI helps with Arduino sensor projects by providing complete project documentation including Arduino sensors, circuit diagrams, wiring guides, and code. Perfect for Arduino sensor projects, electronics projects, and robotics for students."
  }
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <section className="border-b border-zinc-800 bg-zinc-900/50 px-4 py-6 md:px-8">
        <div className="mx-auto max-w-4xl">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-teal-300 transition mb-4">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
          <h1 className="text-3xl font-black text-zinc-100 md:text-4xl flex items-center gap-3">
            <HelpCircle className="h-8 w-8 text-teal-300" /> FAQ
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Frequently asked questions about CircuitAI - AI-Powered Arduino Project Generator for Indian Students
          </p>
        </div>
      </section>

      <section className="px-4 py-12 md:px-8">
        <div className="mx-auto max-w-4xl space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="rounded-lg border border-zinc-800 bg-zinc-900/70 overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <h3 className="text-sm font-bold text-zinc-100 pr-4">{faq.question}</h3>
                <ChevronDown className={`h-5 w-5 text-zinc-500 transition-transform ${openIndex === index ? 'rotate-180' : ''}`} />
              </button>
              {openIndex === index && (
                <div className="px-5 pb-5 pt-0">
                  <p className="text-sm text-zinc-400 leading-relaxed">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-zinc-800 px-4 py-12 md:px-8">
        <div className="mx-auto max-w-4xl rounded-lg border border-zinc-800 bg-zinc-900/70 p-6">
          <h2 className="text-lg font-black text-zinc-100 mb-4">Still have questions?</h2>
          <p className="text-sm text-zinc-400 mb-4">
            Contact our support team for help with Arduino projects, robotics education, STEM education tools, or any questions about CircuitAI.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold uppercase transition"
          >
            Contact Support
          </Link>
        </div>
      </section>
    </main>
  );
}
