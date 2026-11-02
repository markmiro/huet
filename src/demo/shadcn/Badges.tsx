import {
  CircleAlertIcon,
  CircleCheckIcon,
  CircleXIcon,
  ClockIcon,
  InfoIcon,
  SparklesIcon,
} from "lucide-react"

import { Badge } from "./ui/badge"

import { Group } from "./group"

// Tailwind only generates classes it finds written out in full, so each hue
// spells out its solid, soft and outline badge and its dot.
const hues = [
  ["Red", "bg-red-600 text-red-50", "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200", "border-red-300 text-red-700 dark:border-red-800 dark:text-red-300", "bg-red-500"],
  ["Orange", "bg-orange-600 text-orange-50", "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-200", "border-orange-300 text-orange-700 dark:border-orange-800 dark:text-orange-300", "bg-orange-500"],
  ["Amber", "bg-amber-500 text-amber-950", "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200", "border-amber-300 text-amber-700 dark:border-amber-800 dark:text-amber-300", "bg-amber-500"],
  ["Yellow", "bg-yellow-400 text-yellow-950", "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200", "border-yellow-300 text-yellow-700 dark:border-yellow-800 dark:text-yellow-300", "bg-yellow-500"],
  ["Lime", "bg-lime-500 text-lime-950", "bg-lime-100 text-lime-800 dark:bg-lime-950 dark:text-lime-200", "border-lime-300 text-lime-700 dark:border-lime-800 dark:text-lime-300", "bg-lime-500"],
  ["Green", "bg-green-600 text-green-50", "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200", "border-green-300 text-green-700 dark:border-green-800 dark:text-green-300", "bg-green-500"],
  ["Emerald", "bg-emerald-600 text-emerald-50", "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200", "border-emerald-300 text-emerald-700 dark:border-emerald-800 dark:text-emerald-300", "bg-emerald-500"],
  ["Teal", "bg-teal-600 text-teal-50", "bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-200", "border-teal-300 text-teal-700 dark:border-teal-800 dark:text-teal-300", "bg-teal-500"],
  ["Cyan", "bg-cyan-600 text-cyan-50", "bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-200", "border-cyan-300 text-cyan-700 dark:border-cyan-800 dark:text-cyan-300", "bg-cyan-500"],
  ["Sky", "bg-sky-600 text-sky-50", "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200", "border-sky-300 text-sky-700 dark:border-sky-800 dark:text-sky-300", "bg-sky-500"],
  ["Blue", "bg-blue-600 text-blue-50", "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200", "border-blue-300 text-blue-700 dark:border-blue-800 dark:text-blue-300", "bg-blue-500"],
  ["Indigo", "bg-indigo-600 text-indigo-50", "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200", "border-indigo-300 text-indigo-700 dark:border-indigo-800 dark:text-indigo-300", "bg-indigo-500"],
  ["Violet", "bg-violet-600 text-violet-50", "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200", "border-violet-300 text-violet-700 dark:border-violet-800 dark:text-violet-300", "bg-violet-500"],
  ["Purple", "bg-purple-600 text-purple-50", "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200", "border-purple-300 text-purple-700 dark:border-purple-800 dark:text-purple-300", "bg-purple-500"],
  ["Fuchsia", "bg-fuchsia-600 text-fuchsia-50", "bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-950 dark:text-fuchsia-200", "border-fuchsia-300 text-fuchsia-700 dark:border-fuchsia-800 dark:text-fuchsia-300", "bg-fuchsia-500"],
  ["Pink", "bg-pink-600 text-pink-50", "bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-200", "border-pink-300 text-pink-700 dark:border-pink-800 dark:text-pink-300", "bg-pink-500"],
  ["Rose", "bg-rose-600 text-rose-50", "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200", "border-rose-300 text-rose-700 dark:border-rose-800 dark:text-rose-300", "bg-rose-500"],
  ["Slate", "bg-slate-600 text-slate-50", "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200", "border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-300", "bg-slate-500"],
] as const

const statuses = [
  { label: "Active", icon: CircleCheckIcon, className: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200" },
  { label: "Pending", icon: ClockIcon, className: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200" },
  { label: "Warning", icon: CircleAlertIcon, className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200" },
  { label: "Failed", icon: CircleXIcon, className: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200" },
  { label: "Info", icon: InfoIcon, className: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200" },
  { label: "New", icon: SparklesIcon, className: "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200" },
]

export function Badges() {
  return (
    <div className="flex flex-col gap-8 rounded-xl border p-6">
      <div className="grid gap-8 md:grid-cols-2">
        <Group title="Variants" className="flex flex-wrap gap-2">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="ghost">Ghost</Badge>
          <Badge variant="link">Link</Badge>
        </Group>
        <Group title="Status" className="flex flex-wrap gap-2">
          {statuses.map(({ label, icon: Icon, className }) => (
            <Badge key={label} className={className}>
              <Icon data-icon="inline-start" />
              {label}
            </Badge>
          ))}
        </Group>
      </div>
      <Group
        title="Every hue: solid, soft, outline, dot"
        className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3 lg:grid-cols-6"
      >
        {hues.map(([name, solid, soft, outline, dot]) => (
          <div key={name} className="flex flex-col items-start gap-1.5">
            <Badge className={solid}>{name}</Badge>
            <Badge className={soft}>{name}</Badge>
            <Badge variant="outline" className={outline}>
              {name}
            </Badge>
            <Badge variant="outline">
              <span className={`size-2 rounded-full ${dot}`} />
              {name}
            </Badge>
          </div>
        ))}
      </Group>
    </div>
  )
}
