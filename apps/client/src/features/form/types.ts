/** Omit property K across all objects in union T */
export type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never;

/** The primitive values for in used when defining forms */
export type FieldValue = string | number;

/** Common props for all field components */
export type BaseFieldProps = {
  kind: string;
  name: string;
  label: string;
  description?: string;
};

/** A record of the field names and the types of their values */
export type FormValues = Record<PropertyKey, FieldValue>;

/** An object mapping field names to error messages, if applicable */
export type FormErrors<T extends FormValues = FormValues> = {
  [K in keyof T]?: string;
};