import { cn } from "./cn"

import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card"
import { Checkbox } from "./ui/checkbox"
import { Input } from "./ui/input"
import { Progress } from "./ui/progress"
import { Slider } from "./ui/slider"
import { Switch } from "./ui/switch"


/**
 * shadcn's accent classes go on a wrapper (`outer`) and need
 * `.theme-container` on the card inside it.
 */
type Sample = { name: string; outer?: string }

const accents: Sample[] = [
  { name: "Neutral" },
  { name: "Blue", outer: "theme-blue" },
  { name: "Teal", outer: "theme-teal" },
  { name: "Green", outer: "theme-green" },
  { name: "Yellow", outer: "theme-yellow" },
  { name: "Amber", outer: "theme-amber" },
  { name: "Orange", outer: "theme-orange" },
  { name: "Red", outer: "theme-red" },
  { name: "Rose", outer: "theme-rose" },
  { name: "Purple", outer: "theme-purple" },
  { name: "Violet", outer: "theme-violet" },
]

function ThemeSample({ name, outer }: Sample) {
  return (
    <div className={outer}>
      <Card className={cn("h-full", outer && "theme-container")}>
        <CardHeader>
          <CardTitle>{name}</CardTitle>
          <CardDescription className="font-mono text-xs">{outer ?? "no theme class"}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            <Button size="sm">Primary</Button>
            <Button size="sm" variant="secondary">
              Secondary
            </Button>
            <Button size="sm" variant="outline">
              Outline
            </Button>
          </div>
          <Input placeholder="Email" aria-label={`${name} email`} />
          <div className="flex items-center gap-3">
            <Badge>Badge</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Checkbox defaultChecked aria-label={`${name} checkbox`} className="ml-auto" />
            <Switch defaultChecked aria-label={`${name} switch`} />
          </div>
          <Slider defaultValue={[60]} aria-label={`${name} slider`} />
          <Progress value={72} aria-label={`${name} progress`} />
          <div className="flex h-12 items-end gap-1" aria-label="Chart colors">
            <div className="h-[40%] flex-1 rounded-sm bg-chart-1" />
            <div className="h-[70%] flex-1 rounded-sm bg-chart-2" />
            <div className="h-full flex-1 rounded-sm bg-chart-3" />
            <div className="h-[55%] flex-1 rounded-sm bg-chart-4" />
            <div className="h-[80%] flex-1 rounded-sm bg-chart-5" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function ThemeSamples() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {accents.map((sample) => (
        <ThemeSample key={sample.name} {...sample} />
      ))}
    </div>
  )
}
