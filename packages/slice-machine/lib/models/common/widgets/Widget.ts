import { IconType } from 'react-icons'
import { AnyObjectSchema } from 'yup'

import { FieldType, Field } from '../CustomType/fields'

export interface Widget<F extends Field, S extends AnyObjectSchema> {
  TYPE_NAME: FieldType,
  handleMockContent: Function,
  handleMockConfig: Function,
  MockConfigForm?: {
    (): JSX.Element;
    initialValues: any;
  },
  create: () => F,
  Meta: {
    icon: IconType,
    title: string,
    description: string
  },
  schema: S,
  FormFields: {}
  CUSTOM_NAME?: string
  Form?: React.Component
}

export type AnyWidget = Widget<any, any>