"use client";

import React from "react";
import {
  Code2,
  Terminal,
  GraduationCap,
  PenTool,
  Microscope,
  Briefcase,
  Palette,
  BarChart3,
  Bot,
  HeartPulse,
  Languages,
  Scale,
  Target,
  Sliders,
  Zap,
  ShieldCheck,
  BrainCircuit,
  Atom,
  Layers,
  Globe,
  Cpu,
  Boxes,
  Compass,
  Search,
  Wind,
  Network,
  Server,
  MessageSquareCode,
  Flame,
  FileCode2,
  HelpCircle,
  LucideProps,
} from "lucide-react";

const ICON_MAP: Record<string, React.FC<LucideProps>> = {
  // Domain icons
  Code2,
  Terminal,
  GraduationCap,
  PenTool,
  Microscope,
  Briefcase,
  Palette,
  BarChart3,
  Bot,
  HeartPulse,
  Languages,
  Scale,
  Target,

  // Strategy icons
  Sliders,
  Zap,
  ShieldCheck,
  BrainCircuit,

  // AI Model icons
  Atom,
  Layers,
  Globe,
  Cpu,
  Boxes,
  Compass,
  Search,
  Wind,
  Network,
  Server,
  MessageSquareCode,
  Flame,
  FileCode2,
};

interface IconRendererProps extends LucideProps {
  name: string;
}

export default function IconRenderer({
  name,
  className = "",
  size = 18,
  ...props
}: IconRendererProps) {
  const Component = ICON_MAP[name] || Bot;
  return <Component size={size} className={className} {...props} />;
}
