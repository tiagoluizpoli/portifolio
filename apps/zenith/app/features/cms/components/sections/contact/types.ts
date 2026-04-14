import { useForm } from '@tanstack/react-form';
import { type ContactInput, contactSchema } from '../../../types/contact';

/**
 * ABSOLUTE TYPE-SAFETY SOURCE-OF-TRUTH (§XVII)
 *
 * Centralized inference anchor for the Professional Outreach partition.
 */
export function useContactFormBase(
  initialData: ContactInput,
  onSubmit: (values: ContactInput) => Promise<void>,
) {
  return useForm({
    defaultValues: initialData,
    validators: {
      onChange: contactSchema,
    },
    onSubmit: async ({ value }) => {
      await onSubmit(value);
    },
  });
}

/**
 * The unified form instance type for the Professional Outreach partition.
 * Bound to the production schema and data structures.
 */
export type ContactFormInstance = ReturnType<typeof useContactFormBase>;
