import {
  Center,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Switch as HopeSwitch,
} from "@hope-ui/solid"
import { Match, Show, Switch } from "solid-js"
import { useT } from "~/hooks"

export enum ACLItemType {
  String = "string",
  Number = "number",
  Bool = "bool",
}

export type ItemProps = {
  name: string
  type: ACLItemType
  required?: boolean
  readonly?: boolean
  help?: boolean
  placeholder?: string
  min?: number
} & (
  | {
      type: ACLItemType.Bool
      onChange?: (value: boolean) => void
      value: boolean
    }
  | {
      type: ACLItemType.Number
      onChange?: (value: number) => void
      value: number
    }
  | {
      type: ACLItemType.String
      onChange?: (value: string) => void
      value: string
    }
)

const Item = (props: ItemProps) => {
  const t = useT()
  return (
    <FormControl
      w="$full"
      display="flex"
      flexDirection="column"
      required={props.required}
    >
      <FormLabel for={props.name} display="flex" alignItems="center">
        {t(`acl.${props.name}`)}
      </FormLabel>
      <Switch fallback={<Center>{t("settings.unknown_type")}</Center>}>
        <Match when={props.type === ACLItemType.String}>
          <Input
            id={props.name}
            readOnly={props.readonly}
            value={props.value as string}
            placeholder={props.placeholder}
            onInput={
              props.type === ACLItemType.String
                ? (e) => props.onChange?.(e.currentTarget.value)
                : undefined
            }
          />
        </Match>
        <Match when={props.type === ACLItemType.Number}>
          <Input
            type="number"
            id={props.name}
            readOnly={props.readonly}
            value={props.value as number}
            min={props.min}
            onInput={
              props.type === ACLItemType.Number
                ? (e) => props.onChange?.(parseInt(e.currentTarget.value) || 0)
                : undefined
            }
          />
        </Match>
        <Match when={props.type === ACLItemType.Bool}>
          <HopeSwitch
            id={props.name}
            readOnly={props.readonly}
            checked={props.value as boolean}
            onChange={
              props.type === ACLItemType.Bool
                ? (e: any) => props.onChange?.(e.currentTarget.checked)
                : undefined
            }
          />
        </Match>
      </Switch>
      <Show when={props.help}>
        <FormHelperText>{t(`acl.${props.name}-tips`)}</FormHelperText>
      </Show>
    </FormControl>
  )
}

export { Item }
