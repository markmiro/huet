import * as React from "react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Label,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  RadialBar,
  RadialBarChart,
  XAxis,
  YAxis,
} from "recharts"

import { Badge } from "./ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "./ui/chart"

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

const traffic = months.map((month, i) => ({
  month,
  organic: Math.round(180 + 90 * Math.sin(i / 1.9) + i * 14),
  referral: Math.round(120 + 60 * Math.cos(i / 2.3) + i * 8),
  paid: Math.round(70 + 35 * Math.sin(i / 1.4 + 1) + i * 5),
}))

const trafficConfig = {
  organic: { label: "Organic", color: "var(--chart-1)" },
  referral: { label: "Referral", color: "var(--chart-2)" },
  paid: { label: "Paid", color: "var(--chart-3)" },
} satisfies ChartConfig

const browsers = [
  { browser: "chrome", visitors: 275, fill: "var(--color-chrome)" },
  { browser: "safari", visitors: 200, fill: "var(--color-safari)" },
  { browser: "firefox", visitors: 187, fill: "var(--color-firefox)" },
  { browser: "edge", visitors: 173, fill: "var(--color-edge)" },
  { browser: "other", visitors: 90, fill: "var(--color-other)" },
]

const browserConfig = {
  visitors: { label: "Visitors" },
  chrome: { label: "Chrome", color: "var(--chart-1)" },
  safari: { label: "Safari", color: "var(--chart-2)" },
  firefox: { label: "Firefox", color: "var(--chart-3)" },
  edge: { label: "Edge", color: "var(--chart-4)" },
  other: { label: "Other", color: "var(--chart-5)" },
} satisfies ChartConfig

const uptime = months.slice(0, 9).map((month, i) => ({
  month,
  healthy: Math.round(92 - 6 * Math.sin(i / 1.3)),
  degraded: Math.round(14 + 8 * Math.cos(i / 1.6)),
  failing: Math.round(4 + 3 * Math.sin(i / 0.9 + 2)),
}))

// Status series colored with Tailwind's palette. Huet moves each swatch
// onto the theme's own green, amber and red.
const uptimeConfig = {
  healthy: { label: "Healthy", color: "var(--color-green-500)" },
  degraded: { label: "Degraded", color: "var(--color-amber-500)" },
  failing: { label: "Failing", color: "var(--color-red-500)" },
} satisfies ChartConfig

const skills = [
  { skill: "Color", a: 186, b: 120 },
  { skill: "Type", a: 145, b: 170 },
  { skill: "Layout", a: 167, b: 140 },
  { skill: "Motion", a: 93, b: 150 },
  { skill: "Access", a: 172, b: 110 },
  { skill: "Copy", a: 124, b: 160 },
]

const skillsConfig = {
  a: { label: "This release", color: "var(--chart-1)" },
  b: { label: "Last release", color: "var(--chart-4)" },
} satisfies ChartConfig

const goals = [
  { goal: "storage", value: 82, fill: "var(--color-storage)" },
  { goal: "bandwidth", value: 64, fill: "var(--color-bandwidth)" },
  { goal: "compute", value: 41, fill: "var(--color-compute)" },
]

const goalsConfig = {
  value: { label: "Used" },
  storage: { label: "Storage", color: "var(--chart-1)" },
  bandwidth: { label: "Bandwidth", color: "var(--chart-2)" },
  compute: { label: "Compute", color: "var(--chart-3)" },
} satisfies ChartConfig

function TrafficChart() {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Traffic by source</CardTitle>
        <CardDescription>Stacked area, --chart-1 to --chart-3</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={trafficConfig} className="aspect-auto h-64 w-full">
          <AreaChart data={traffic} margin={{ left: 8, right: 8 }}>
            <defs>
              {Object.keys(trafficConfig).map((key) => (
                <linearGradient key={key} id={`showcase-fill-${key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={`var(--color-${key})`} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={`var(--color-${key})`} stopOpacity={0.1} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
            {(["paid", "referral", "organic"] as const).map((key) => (
              <Area
                key={key}
                dataKey={key}
                type="natural"
                stackId="a"
                fill={`url(#showcase-fill-${key})`}
                stroke={`var(--color-${key})`}
              />
            ))}
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

function BrowserBars() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Browsers</CardTitle>
        <CardDescription>One bar per chart color</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={browserConfig} className="aspect-auto h-64 w-full">
          <BarChart data={browsers} layout="vertical" margin={{ left: 0 }}>
            <YAxis
              dataKey="browser"
              type="category"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => browserConfig[value as keyof typeof browserConfig]?.label}
            />
            <XAxis dataKey="visitors" type="number" hide />
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Bar dataKey="visitors" radius={6} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

function UptimeLines() {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Service health</CardTitle>
        <CardDescription>Tailwind green, amber and red series</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={uptimeConfig} className="aspect-auto h-64 w-full">
          <LineChart data={uptime} margin={{ left: 8, right: 8 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            {(Object.keys(uptimeConfig) as (keyof typeof uptimeConfig)[]).map((key) => (
              <Line
                key={key}
                dataKey={key}
                type="monotone"
                stroke={`var(--color-${key})`}
                strokeWidth={2}
                dot={{ fill: `var(--color-${key})` }}
              />
            ))}
            <ChartLegend content={<ChartLegendContent />} />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Badge className="bg-green-500/15 text-green-700 dark:text-green-300">99.2% uptime</Badge>
        <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300">3 slow days</Badge>
        <Badge className="bg-red-500/15 text-red-700 dark:text-red-300">1 outage</Badge>
      </CardFooter>
    </Card>
  )
}

function BrowserDonut() {
  const total = browsers.reduce((sum, row) => sum + row.visitors, 0)
  return (
    <Card>
      <CardHeader>
        <CardTitle>Share</CardTitle>
        <CardDescription>Donut with a label</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={browserConfig} className="mx-auto aspect-square h-64">
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie data={browsers} dataKey="visitors" nameKey="browser" innerRadius={62} strokeWidth={4}>
              <Label
                content={({ viewBox }) =>
                  viewBox && "cx" in viewBox && "cy" in viewBox ? (
                    <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                      <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold">
                        {total.toLocaleString("en-US")}
                      </tspan>
                      <tspan x={viewBox.cx} y={(viewBox.cy ?? 0) + 24} className="fill-muted-foreground">
                        Visitors
                      </tspan>
                    </text>
                  ) : null
                }
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

function SkillsRadar() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Design review</CardTitle>
        <CardDescription>Radar, two series</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={skillsConfig} className="aspect-auto h-64 w-full">
          <RadarChart data={skills}>
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
            <PolarAngleAxis dataKey="skill" />
            <PolarGrid />
            <Radar dataKey="b" fill="var(--color-b)" fillOpacity={0.3} stroke="var(--color-b)" />
            <Radar dataKey="a" fill="var(--color-a)" fillOpacity={0.5} stroke="var(--color-a)" />
          </RadarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

function GoalsRadial() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quota</CardTitle>
        <CardDescription>Radial bars</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={goalsConfig} className="mx-auto aspect-square h-64">
          <RadialBarChart data={goals} innerRadius={40} outerRadius={110} startAngle={90} endAngle={-270}>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel nameKey="goal" />} />
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
            <RadialBar dataKey="value" background cornerRadius={8} />
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export function ShowcaseCharts() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <TrafficChart />
      <BrowserBars />
      <UptimeLines />
      <BrowserDonut />
      <SkillsRadar />
      <GoalsRadial />
      <MonthlyBars />
    </div>
  )
}

const revenue = months.slice(0, 6).map((month, i) => ({
  month,
  desktop: Math.round(186 + 70 * Math.sin(i * 1.3)),
  mobile: Math.round(110 + 50 * Math.cos(i * 1.1)),
}))

const revenueConfig = {
  desktop: { label: "Desktop", color: "var(--chart-1)" },
  mobile: { label: "Mobile", color: "var(--chart-2)" },
} satisfies ChartConfig

function MonthlyBars() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Devices</CardTitle>
        <CardDescription>Grouped bars</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={revenueConfig} className="aspect-auto h-64 w-full">
          <BarChart data={revenue}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dashed" />} />
            <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
            <Bar dataKey="mobile" fill="var(--color-mobile)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
