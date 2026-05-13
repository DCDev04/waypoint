// features/workflows/components/workflow-form.tsx

"use client"

import {
  startTransition,
  useActionState,
  useEffect,
  useTransition,
} from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { workflowSchema, type WorkflowFormValues } from "../schema"
import {
  createWorkflow,
  updateWorkflow,
  type WorkflowActionState,
} from "../actions"
import { WorkflowEditor } from "./workflow-editor"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Department = { id: string; name: string }

type Props = {
  // Edit mode — pass existing workflow data
  workflowId?: string
  defaultValues?: Partial<WorkflowFormValues>
  departments: Department[]
}

export function WorkflowForm({
  workflowId,
  defaultValues,
  departments,
}: Props) {
  const isEditing = !!workflowId

  // Bind the workflowId into the action for edit mode
  const action = isEditing
    ? updateWorkflow.bind(null, workflowId)
    : createWorkflow

  const [serverState, formAction, isPending] = useActionState(
    action as (
      prev: WorkflowActionState,
      formData: FormData
    ) => Promise<WorkflowActionState>,
    {}
  )

  const {
    register,
    control,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isDirty },
  } = useForm<WorkflowFormValues>({
    resolver: zodResolver(workflowSchema),
    defaultValues: {
      title: defaultValues?.title ?? "",
      departmentId: defaultValues?.departmentId ?? "",
      content: defaultValues?.content ?? "",
    },
  })

  // Map server-side field errors back into RHF
  useEffect(() => {
    if (serverState.fieldErrors) {
      Object.entries(serverState.fieldErrors).forEach(([field, messages]) => {
        setError(field as keyof WorkflowFormValues, {
          message: messages?.[0],
        })
      })
    }
  }, [serverState, setError])

  // RHF validates client-side first, then submits via server action
  function onSubmit(_values: WorkflowFormValues, e?: React.BaseSyntheticEvent) {
    const form = e?.target as HTMLFormElement
    startTransition(() => {
      formAction(new FormData(form))
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Global server error */}
      {serverState.error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {serverState.error}
        </div>
      )}

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">
          Title <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          placeholder="e.g. Customer Refund Process"
          {...register("title")}
          aria-invalid={!!errors.title}
        />
        {errors.title && (
          <p className="text-xs text-red-600">{errors.title.message}</p>
        )}
      </div>

      {/* Department — only on create */}
      {!isEditing && (
        <div className="space-y-2">
          <Label htmlFor="departmentId">
            Department <span className="text-red-500">*</span>
          </Label>

          {/* Controller bridges RHF with shadcn Select (non-native input) */}
          <Controller
            name="departmentId"
            control={control}
            render={({ field }) => (
              <>
                <input type="hidden" name="departmentId" value={field.value} />
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <SelectTrigger aria-invalid={!!errors.departmentId}>
                    <SelectValue placeholder="Select a department..." />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}
          />
          {errors.departmentId && (
            <p className="text-xs text-red-600">
              {errors.departmentId.message}
            </p>
          )}
        </div>
      )}

      {/* Content — Tiptap via Controller */}
      <div className="space-y-2">
        <Label>
          Content <span className="text-red-500">*</span>
        </Label>

        <Controller
          name="content"
          control={control}
          render={({ field }) => (
            <>
              {/* Hidden input so FormData picks it up */}
              <input type="hidden" name="content" value={field.value} />
              <WorkflowEditor
                content={field.value}
                onChangeCallback={(html) => {
                  field.onChange(html)
                  setValue("content", html, { shouldDirty: true })
                }}
                editable={true}
              />
            </>
          )}
        />
        {errors.content && (
          <p className="text-xs text-red-600">{errors.content.message}</p>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t pt-4">
        <p className="text-xs text-muted-foreground">
          {isDirty ? "You have unsaved changes" : ""}
        </p>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => window.history.back()}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending
              ? isEditing
                ? "Saving..."
                : "Creating..."
              : isEditing
                ? "Save Changes"
                : "Create Workflow"}
          </Button>
        </div>
      </div>
    </form>
  )
}
