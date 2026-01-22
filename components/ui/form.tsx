'use client'

import * as React from 'react'
import { FormLabel, FormHelperText, FormControl } from '@mui/material'
import {
  Controller,
  FormProvider,
  useFormContext,
  useFormState,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form'

const Form = FormProvider

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName
}

const FormFieldContext = React.createContext<FormFieldContextValue>(
  {} as FormFieldContextValue,
)

const FormField = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  ...props
}: ControllerProps<TFieldValues, TName>) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}

type FormItemContextValue = {
  id: string
}

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue,
)

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext)
  const itemContext = React.useContext(FormItemContext)
  const { getFieldState } = useFormContext()
  const formState = useFormState({ name: fieldContext.name })
  const fieldState = getFieldState(fieldContext.name, formState)

  if (!fieldContext) {
    throw new Error('useFormField should be used within <FormField>')
  }

  const { id } = itemContext

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  }
}

const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const id = React.useId()

  return (
    <FormItemContext.Provider value={{ id }}>
      <FormControl 
        fullWidth 
        margin="normal"
        ref={ref} 
        className={className} 
        {...props} 
      />
    </FormItemContext.Provider>
  )
})
FormItem.displayName = 'FormItem'

const FormLabelComponent = React.forwardRef<
  React.ElementRef<typeof FormLabel>,
  React.ComponentPropsWithoutRef<typeof FormLabel>
>(({ className, ...props }, ref) => {
  const { error, formItemId } = useFormField()

  return (
    <FormLabel
      ref={ref}
      className={className}
      htmlFor={formItemId}
      error={!!error}
      {...props}
    />
  )
})
FormLabelComponent.displayName = 'FormLabel'

const FormControlComponent = React.forwardRef<
  React.ElementRef<typeof FormControl>,
  React.ComponentPropsWithoutRef<typeof FormControl>
>(({ ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField()

  return (
    <FormControl
      ref={ref}
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      error={!!error}
      {...props}
    />
  )
})
FormControlComponent.displayName = 'FormControl'

const FormDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField()

  return (
    <FormHelperText
      ref={ref}
      id={formDescriptionId}
      className={className}
      {...props}
    />
  )
})
FormDescription.displayName = 'FormDescription'

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField()
  const body = error ? String(error?.message) : children

  if (!body) {
    return null
  }

  return (
    <FormHelperText
      ref={ref}
      id={formMessageId}
      error
      className={className}
      {...props}
    >
      {body}
    </FormHelperText>
  )
})
FormMessage.displayName = 'FormMessage'

export {
  useFormField,
  Form,
  FormItem,
  FormLabelComponent as FormLabel,
  FormControlComponent as FormControl,
  FormDescription,
  FormMessage,
  FormField,
}
