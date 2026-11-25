import * as React from "react"
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  CircleAlertIcon,
  CircleCheckIcon,
  CircleDashedIcon,
  CircleDotIcon,
  TriangleAlertIcon,
  UserPlusIcon,
} from "lucide-react"
import {
  Bar,
  BarChart,
  CartesianGrid,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  XAxis,
} from "recharts"

import { Alert, AlertDescription, AlertTitle } from "./ui/alert"
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "./ui/avatar"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "./ui/carousel"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "./ui/chart"
import { Checkbox } from "./ui/checkbox"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "./ui/field"
import { Input } from "./ui/input"
import { images } from "../recolor/data"

// The demo's Unsplash photos (src/demo/recolor/images/unsplash), by title.
const photo = (title: string) => images.find((image) => image.title === title)!.url
const faces = {
  maya: photo("Woman, white background"),
  theo: photo("Man, grey wall"),
  iris: photo("Woman, grey backdrop"),
}

export function TeamCard() {
  const members = [
    { name: "Maya Chen", role: "Design lead", src: faces.maya, status: "Online", tone: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200" },
    { name: "Theo Park", role: "Engineer", src: faces.theo, status: "Away", tone: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200" },
    { name: "Iris Adler", role: "Researcher", src: faces.iris, status: "In a call", tone: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200" },
  ]
  return (
    <Card>
      <CardHeader>
        <CardTitle>Design team</CardTitle>
        <CardDescription>3 of 8 members online</CardDescription>
        <CardAction>
          <Button variant="outline" size="sm">
            <UserPlusIcon data-icon="inline-start" />
            Invite
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {members.map((member) => (
          <div key={member.name} className="flex items-center gap-3">
            <Avatar size="lg">
              <AvatarImage data-huet-recolor="" src={member.src} alt="" className="object-cover object-top" />
              <AvatarFallback>{member.name.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <div className="flex min-w-0 flex-1 flex-col">
              <span className="truncate text-sm font-medium">{member.name}</span>
              <span className="truncate text-xs text-muted-foreground">{member.role}</span>
            </div>
            <Badge className={member.tone}>{member.status}</Badge>
          </div>
        ))}
      </CardContent>
      <CardFooter className="justify-between">
        <AvatarGroup>
          <Avatar size="sm">
            <AvatarImage data-huet-recolor="" src={faces.theo} alt="" className="object-cover object-top" />
            <AvatarFallback className="text-[10px]">TP</AvatarFallback>
          </Avatar>
          <Avatar size="sm">
            <AvatarFallback className="text-[10px] bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200">JR</AvatarFallback>
          </Avatar>
          <Avatar size="sm">
            <AvatarFallback className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">KO</AvatarFallback>
          </Avatar>
          <AvatarGroupCount className="size-6 text-xs">+5</AvatarGroupCount>
        </AvatarGroup>
        <span className="text-xs text-muted-foreground">Reviewing 12 files</span>
      </CardFooter>
    </Card>
  )
}

const gallery = [
  { title: "Human iris", src: photo("Human iris") },
  { title: "Honeybee on an aster", src: photo("Honeybee on an aster") },
  { title: "City skyline at dusk", src: photo("City skyline at dusk") },
  { title: "Kitchen in morning sun", src: photo("Kitchen in morning sun") },
  { title: "Portrait, white background", src: faces.maya },
]

export function GalleryCard() {
  const [api, setApi] = React.useState<CarouselApi>()
  const [index, setIndex] = React.useState(0)
  React.useEffect(() => {
    if (!api) return
    const select = () => setIndex(api.selectedScrollSnap())
    select()
    api.on("select", select)
    return () => {
      api.off("select", select)
    }
  }, [api])
  return (
    <Card className="gap-4 pt-0 overflow-hidden">
      <Carousel setApi={setApi} opts={{ loop: true }} className="group/gallery relative">
        <CarouselContent className="ml-0">
          {gallery.map((item) => (
            <CarouselItem key={item.title} className="pl-0">
              <img data-huet-recolor="" src={item.src} alt={item.title} className="block aspect-[4/3] w-full object-cover" />
            </CarouselItem>
          ))}
        </CarouselContent>
        <Button
          variant="secondary"
          size="icon-sm"
          className="absolute top-1/2 left-3 -translate-y-1/2 rounded-full shadow-sm"
          onClick={() => api?.scrollPrev()}
          aria-label="Previous photo"
        >
          <ChevronLeftIcon />
        </Button>
        <Button
          variant="secondary"
          size="icon-sm"
          className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full shadow-sm"
          onClick={() => api?.scrollNext()}
          aria-label="Next photo"
        >
          <ChevronRightIcon />
        </Button>
      </Carousel>
      <CardHeader>
        <CardTitle>{gallery[index].title}</CardTitle>
        <CardDescription>
          {index + 1} of {gallery.length}, recolored by Huet
        </CardDescription>
        <CardAction className="flex gap-1.5 self-center">
          {gallery.map((item, i) => (
            <button
              key={item.title}
              type="button"
              aria-label={`Show ${item.title}`}
              onClick={() => api?.scrollTo(i)}
              className={`size-2 rounded-full transition-colors ${i === index ? "bg-primary" : "bg-muted-foreground/30"}`}
            />
          ))}
        </CardAction>
      </CardHeader>
    </Card>
  )
}

const review = [
  { skill: "Color", now: 186, before: 120 },
  { skill: "Type", now: 145, before: 170 },
  { skill: "Layout", now: 167, before: 140 },
  { skill: "Motion", now: 93, before: 150 },
  { skill: "Access", now: 172, before: 110 },
  { skill: "Copy", now: 124, before: 160 },
]

const reviewConfig = {
  now: { label: "This release", color: "var(--chart-1)" },
  before: { label: "Last release", color: "var(--chart-4)" },
} satisfies ChartConfig

export function DesignReviewCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Design review</CardTitle>
        <CardDescription>Scores across six areas</CardDescription>
        <CardAction>
          <Badge className="bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200">+18%</Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <ChartContainer config={reviewConfig} className="aspect-auto h-52 w-full">
          <RadarChart data={review}>
            <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
            <PolarAngleAxis dataKey="skill" />
            <PolarGrid />
            <Radar dataKey="before" fill="var(--color-before)" fillOpacity={0.3} stroke="var(--color-before)" />
            <Radar dataKey="now" fill="var(--color-now)" fillOpacity={0.5} stroke="var(--color-now)" />
          </RadarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="justify-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-chart-1" />
          This release
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-chart-4" />
          Last release
        </span>
      </CardFooter>
    </Card>
  )
}

// Each category takes a Tailwind hue, which Huet moves onto the theme's own.
const spend = [
  { category: "housing", amount: 1840, fill: "var(--color-housing)" },
  { category: "food", amount: 620, fill: "var(--color-food)" },
  { category: "travel", amount: 940, fill: "var(--color-travel)" },
  { category: "health", amount: 380, fill: "var(--color-health)" },
  { category: "fun", amount: 510, fill: "var(--color-fun)" },
  { category: "savings", amount: 1200, fill: "var(--color-savings)" },
]

const spendConfig = {
  amount: { label: "Spent" },
  housing: { label: "Home", color: "var(--color-sky-500)" },
  food: { label: "Food", color: "var(--color-amber-500)" },
  travel: { label: "Travel", color: "var(--color-violet-500)" },
  health: { label: "Health", color: "var(--color-emerald-500)" },
  fun: { label: "Fun", color: "var(--color-rose-500)" },
  savings: { label: "Save", color: "var(--color-teal-500)" },
} satisfies ChartConfig

export function SpendingCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending</CardTitle>
        <CardDescription>October, by category</CardDescription>
        <CardAction className="text-right">
          <div className="text-lg font-semibold tabular-nums">$5,490</div>
          <Badge className="bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200">+12% vs Sep</Badge>
        </CardAction>
      </CardHeader>
      <CardContent>
        <ChartContainer config={spendConfig} className="aspect-auto h-40 w-full">
          <BarChart data={spend} margin={{ top: 4, left: 0, right: 0 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="category"
              interval={0}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => spendConfig[value as keyof typeof spendConfig]?.label}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel nameKey="category" />} />
            <Bar dataKey="amount" radius={6} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

const labelTones = {
  bug: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200",
  feature: "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200",
  design: "bg-pink-100 text-pink-800 dark:bg-pink-950 dark:text-pink-200",
  docs: "bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-200",
  perf: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
  "good first issue": "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200",
} as const

const issues: {
  title: string
  number: number
  labels: (keyof typeof labelTones)[]
  state: "open" | "progress" | "done"
  who: { src?: string; initials: string }
}[] = [
  { title: "Tooltip clips on mobile", number: 482, labels: ["bug", "design"], state: "progress", who: { src: faces.maya, initials: "MC" } },
  { title: "Date picker dark mode", number: 479, labels: ["feature"], state: "open", who: { src: faces.theo, initials: "TP" } },
  { title: "Slow paint on /create", number: 475, labels: ["perf", "bug"], state: "open", who: { initials: "JR" } },
  { title: "Document Lc targets", number: 471, labels: ["docs", "good first issue"], state: "done", who: { src: faces.iris, initials: "IA" } },
]

const stateIcon = {
  open: <CircleDashedIcon className="size-4 text-muted-foreground" />,
  progress: <CircleDotIcon className="size-4 text-amber-600 dark:text-amber-400" />,
  done: <CircleCheckIcon className="size-4 text-green-600 dark:text-green-400" />,
}

export function IssuesCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Issues</CardTitle>
        <CardDescription>huet/showcase</CardDescription>
        <CardAction className="flex gap-1.5">
          <Badge variant="secondary">12 open</Badge>
          <Badge variant="outline">48 closed</Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col divide-y">
        {issues.map((issue) => (
          <div key={issue.number} className="flex items-start gap-3 py-2.5 first:pt-0 last:pb-0">
            <span className="mt-0.5">{stateIcon[issue.state]}</span>
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <span className="truncate text-sm font-medium">
                {issue.title} <span className="font-normal text-muted-foreground">#{issue.number}</span>
              </span>
              <div className="flex flex-wrap gap-1">
                {issue.labels.map((label) => (
                  <Badge key={label} className={labelTones[label]}>
                    {label}
                  </Badge>
                ))}
              </div>
            </div>
            <Avatar size="sm">
              {issue.who.src && <AvatarImage data-huet-recolor="" src={issue.who.src} alt="" className="object-cover object-top" />}
              <AvatarFallback className="text-[10px]">{issue.who.initials}</AvatarFallback>
            </Avatar>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export function SignUpCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>Fix the highlighted fields to continue.</CardDescription>
      </CardHeader>
      <CardContent>
        <FieldGroup className="gap-4">
          <Field data-invalid="true">
            <FieldLabel htmlFor="hero-email">Email</FieldLabel>
            <Input id="hero-email" defaultValue="maya@studio" aria-invalid="true" />
            <FieldError>Enter a complete email address.</FieldError>
          </Field>
          <Field>
            <FieldLabel htmlFor="hero-password" className="text-amber-700 dark:text-amber-400">
              Password
            </FieldLabel>
            <Input
              id="hero-password"
              type="password"
              defaultValue="sunset"
              className="border-amber-500 focus-visible:border-amber-500 focus-visible:ring-amber-500/30 dark:border-amber-500/70"
            />
            <div className="flex gap-1" aria-label="Password strength: weak">
              <span className="h-1 flex-1 rounded-full bg-amber-500" />
              <span className="h-1 flex-1 rounded-full bg-amber-500" />
              <span className="h-1 flex-1 rounded-full bg-muted" />
              <span className="h-1 flex-1 rounded-full bg-muted" />
            </div>
            <p className="flex items-center gap-1.5 text-sm text-amber-700 dark:text-amber-400">
              <TriangleAlertIcon className="size-4" />
              Weak: add a number or a symbol.
            </p>
          </Field>
          <Field>
            <FieldLabel htmlFor="hero-username" className="text-green-700 dark:text-green-400">
              Username
            </FieldLabel>
            <Input
              id="hero-username"
              defaultValue="maya"
              className="border-green-600 focus-visible:border-green-600 focus-visible:ring-green-600/30 dark:border-green-500/70"
            />
            <p className="flex items-center gap-1.5 text-sm text-green-700 dark:text-green-400">
              <CircleCheckIcon className="size-4" />
              Available.
            </p>
          </Field>
          <Field orientation="horizontal" data-invalid="true">
            <Checkbox id="hero-terms" aria-invalid="true" />
            <FieldLabel htmlFor="hero-terms">Accept the terms</FieldLabel>
          </Field>
        </FieldGroup>
      </CardContent>
      <CardFooter>
        <Button className="w-full">Create account</Button>
      </CardFooter>
    </Card>
  )
}

export function AlertsStack() {
  return (
    <div className="flex flex-col gap-3">
      <Alert
        variant="destructive"
        className="border-red-300 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100 *:data-[slot=alert-description]:text-red-800 dark:*:data-[slot=alert-description]:text-red-200"
      >
        <CircleAlertIcon />
        <AlertTitle>Build failed</AlertTitle>
        <AlertDescription>configurator.tsx: Type error on line 6.</AlertDescription>
      </Alert>
      <Alert className="border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100 *:data-[slot=alert-description]:text-amber-800 dark:*:data-[slot=alert-description]:text-amber-200">
        <TriangleAlertIcon />
        <AlertTitle>2 warnings</AlertTitle>
        <AlertDescription>Unused import: themes.Base.</AlertDescription>
      </Alert>
      <Alert className="border-green-300 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-100 *:data-[slot=alert-description]:text-green-800 dark:*:data-[slot=alert-description]:text-green-200">
        <CircleCheckIcon />
        <AlertTitle>Deployed</AlertTitle>
        <AlertDescription>Sunset is live on production.</AlertDescription>
      </Alert>
    </div>
  )
}
