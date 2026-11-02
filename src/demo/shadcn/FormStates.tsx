import {
  CircleAlertIcon,
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
} from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "./ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Checkbox } from "./ui/checkbox"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "./ui/field"
import { Input } from "./ui/input"
import { NativeSelect, NativeSelectOption } from "./ui/native-select"
import { Textarea } from "./ui/textarea"

// shadcn styles errors with aria-invalid and --destructive. Warning and
// success have no built-in variant, so they use Tailwind's amber and green,
// which Huet moves onto the theme's own hues.
const warning = {
  control:
    "border-amber-500 focus-visible:border-amber-500 focus-visible:ring-amber-500/30 dark:border-amber-500/70",
  label: "text-amber-700 dark:text-amber-400",
  message: "flex items-center gap-1.5 text-sm text-amber-700 dark:text-amber-400",
}
const success = {
  control:
    "border-green-600 focus-visible:border-green-600 focus-visible:ring-green-600/30 dark:border-green-500/70",
  label: "text-green-700 dark:text-green-400",
  message: "flex items-center gap-1.5 text-sm text-green-700 dark:text-green-400",
}

function Inputs() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Inputs</CardTitle>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="showcase-name">Name</FieldLabel>
            <Input id="showcase-name" defaultValue="Ada Lovelace" />
            <FieldDescription>As it appears on your card.</FieldDescription>
          </Field>
          <Field data-invalid="true">
            <FieldLabel htmlFor="showcase-email">Email</FieldLabel>
            <Input id="showcase-email" defaultValue="ada@" aria-invalid="true" />
            <FieldError>Enter a complete email address.</FieldError>
          </Field>
          <Field>
            <FieldLabel htmlFor="showcase-password" className={warning.label}>
              Password
            </FieldLabel>
            <Input
              id="showcase-password"
              type="password"
              defaultValue="hunter2"
              className={warning.control}
            />
            <p className={warning.message}>
              <TriangleAlertIcon className="size-4" />
              Weak: add a number or a symbol.
            </p>
          </Field>
          <Field>
            <FieldLabel htmlFor="showcase-username" className={success.label}>
              Username
            </FieldLabel>
            <Input id="showcase-username" defaultValue="ada" className={success.control} />
            <p className={success.message}>
              <CircleCheckIcon className="size-4" />
              Available.
            </p>
          </Field>
          <Field data-disabled="true">
            <FieldLabel htmlFor="showcase-account">Account ID</FieldLabel>
            <Input id="showcase-account" defaultValue="acct_29dk1" disabled />
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>
  )
}

function OtherControls() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Selects, textareas, checkboxes</CardTitle>
      </CardHeader>
      <CardContent>
        <FieldGroup>
          <Field data-invalid="true">
            <FieldLabel htmlFor="showcase-country">Country</FieldLabel>
            <NativeSelect id="showcase-country" aria-invalid="true" className="w-full">
              <NativeSelectOption value="">Choose a country</NativeSelectOption>
              <NativeSelectOption value="ca">Canada</NativeSelectOption>
              <NativeSelectOption value="us">United States</NativeSelectOption>
            </NativeSelect>
            <FieldError>Choose a country to see shipping rates.</FieldError>
          </Field>
          <Field>
            <FieldLabel htmlFor="showcase-plan" className={warning.label}>
              Plan
            </FieldLabel>
            <NativeSelect id="showcase-plan" defaultValue="free" className={`w-full ${warning.control}`}>
              <NativeSelectOption value="free">Free</NativeSelectOption>
              <NativeSelectOption value="pro">Pro</NativeSelectOption>
            </NativeSelect>
            <p className={warning.message}>
              <TriangleAlertIcon className="size-4" />
              Free plans pause after 30 days.
            </p>
          </Field>
          <Field data-invalid="true">
            <FieldLabel htmlFor="showcase-bio">Bio</FieldLabel>
            <Textarea
              id="showcase-bio"
              aria-invalid="true"
              defaultValue="Hi"
              className="resize-none"
            />
            <FieldError>Write at least 20 characters.</FieldError>
          </Field>
          <Field orientation="horizontal" data-invalid="true">
            <Checkbox id="showcase-terms" aria-invalid="true" />
            <FieldLabel htmlFor="showcase-terms">Accept the terms</FieldLabel>
          </Field>
          <Field orientation="horizontal">
            <Checkbox id="showcase-news" defaultChecked />
            <FieldLabel htmlFor="showcase-news">Send me product news</FieldLabel>
          </Field>
        </FieldGroup>
      </CardContent>
    </Card>
  )
}

function Alerts() {
  return (
    <div className="flex flex-col gap-4">
      <Alert>
        <InfoIcon />
        <AlertTitle>Heads up</AlertTitle>
        <AlertDescription>Your trial ends in 7 days.</AlertDescription>
      </Alert>
      <Alert
        variant="destructive"
        className="border-red-300 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100 *:data-[slot=alert-description]:text-red-800 dark:*:data-[slot=alert-description]:text-red-200"
      >
        <CircleAlertIcon />
        <AlertTitle>Payment failed</AlertTitle>
        <AlertDescription>Your card was declined. Update it to keep your plan.</AlertDescription>
      </Alert>
      <Alert className="border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100 *:data-[slot=alert-description]:text-amber-800 dark:*:data-[slot=alert-description]:text-amber-200">
        <TriangleAlertIcon />
        <AlertTitle>Storage almost full</AlertTitle>
        <AlertDescription>You've used 92% of your 10 GB.</AlertDescription>
      </Alert>
      <Alert className="border-green-300 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-100 *:data-[slot=alert-description]:text-green-800 dark:*:data-[slot=alert-description]:text-green-200">
        <CircleCheckIcon />
        <AlertTitle>Saved</AlertTitle>
        <AlertDescription>Your changes are live.</AlertDescription>
      </Alert>
      <Alert className="border-sky-300 bg-sky-50 text-sky-900 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-100 *:data-[slot=alert-description]:text-sky-800 dark:*:data-[slot=alert-description]:text-sky-200">
        <InfoIcon />
        <AlertTitle>New version</AlertTitle>
        <AlertDescription>Reload to get the latest features.</AlertDescription>
      </Alert>
    </div>
  )
}

export function FormStates() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      <Inputs />
      <OtherControls />
      <Alerts />
    </div>
  )
}
