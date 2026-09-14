import { RefineChip } from "@/types";

export const REFINEMENT_CHIPS: RefineChip[] = [
  {
    id: "concise",
    label: "Make More Concise",
    iconName: "Scissors",
    instruction:
      "Trim verbosity and eliminate redundant filler phrases while strictly preserving all core technical directives, operational constraints, and deliverables.",
    description: "Cuts prompt length while preserving all directives and constraints.",
  },
  {
    id: "edge-cases",
    label: "Add Edge Cases",
    iconName: "ShieldCheck",
    instruction:
      "Expand the constraints with comprehensive edge cases, invalid input handling, boundary condition checks, and error prevention requirements.",
    description: "Incorporate robust failure handling and boundary conditions.",
  },
  {
    id: "few-shot",
    label: "Add Examples",
    iconName: "ListPlus",
    instruction:
      "Add realistic few-shot demonstration examples illustrating the desired input structure and expected high-precision output.",
    description: "Provide sample inputs and outputs for precision guidance.",
  },
  {
    id: "beginner",
    label: "Beginner Friendly",
    iconName: "GraduationCap",
    instruction:
      "Adjust the persona and instructions to explain complex concepts in simple terms with intuitive analogies and beginner-friendly clarity.",
    description: "Calibrate prompt for approachable, accessible explanations.",
  },
  {
    id: "strict-schema",
    label: "Strict Schema Only",
    iconName: "FileCheck",
    instruction:
      "Enforce strict machine-readable output format only (such as valid JSON, YAML, or TypeScript) with zero markdown conversational chatter.",
    description: "Force strict structured format without conversational preamble.",
  },
  {
    id: "chain-of-thought",
    label: "Deep Reasoning",
    iconName: "BrainCircuit",
    instruction:
      "Require the model to execute deliberate, step-by-step chain-of-thought analysis and internal verification before outputting the final result.",
    description: "Mandate structured step-by-step deductive reasoning.",
  },
];
