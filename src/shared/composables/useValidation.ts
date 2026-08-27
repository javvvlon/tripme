import type { MaybeRefOrGetter } from 'vue'
import type { IValidationMessage, ValidationRules } from '~/shared/helpers/validation'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useValidation = <TForm extends object>(
  form: MaybeRefOrGetter<TForm>,
  rules: MaybeRefOrGetter<ValidationRules<TForm>>,
) => {
  const { t } = useI18n()

  type Field = keyof TForm

  const failures = ref({} as Partial<Record<Field, IValidationMessage>>)
  const touched = ref({} as Partial<Record<Field, boolean>>)

  const values = () => toValue(form)
  const ruleSet = () => toValue(rules)

  const firstFailure = (field: Field): IValidationMessage | null => {
    const checks = ruleSet()[field]

    if (!checks?.length) return null

    const value = values()[field]

    for (const check of checks) {
      const failure = check(value, values())
      if (failure) return failure
    }

    return null
  }

  const errors = computed(() => {
    const out: Partial<Record<Field, string>> = {}

    for (const [field, failure] of Object.entries(failures.value) as [Field, IValidationMessage][]) {
      if (failure) out[field] = t(failure.key, failure.params ?? {})
    }

    return out
  })

  const validateField = (field: Field): boolean => {
    const failure = firstFailure(field)

    if (failure) failures.value = { ...failures.value, [field]: failure }
    else {
      const { [field]: _removed, ...rest } = failures.value
      failures.value = rest as Partial<Record<Field, IValidationMessage>>
    }

    return !failure
  }

  const touch = (field: Field): boolean => {
    touched.value = { ...touched.value, [field]: true }

    return validateField(field)
  }

  const validate = (): boolean => {
    const fields = Object.keys(ruleSet()) as Field[]

    return fields.map(field => touch(field)).every(Boolean)
  }

  const isValid = computed(() => (Object.keys(ruleSet()) as Field[]).every(f => !firstFailure(f)))

  const hasErrors = computed(() => Object.keys(failures.value).length > 0)

  const setError = (field: Field, key: string, params?: Record<string, unknown>) => {
    touched.value = { ...touched.value, [field]: true }
    failures.value = { ...failures.value, [field]: { key, params } }
  }

  const reset = () => {
    failures.value = {}
    touched.value = {}
  }

  return { errors, touched, isValid, hasErrors, validate, validateField, touch, setError, reset }
}
