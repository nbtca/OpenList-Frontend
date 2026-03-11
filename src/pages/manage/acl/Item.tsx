import {
  Center,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Switch as HopeSwitch,
  HStack,
  IconButton,
  createDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
} from "@hope-ui/solid"
import { Match, Show, Switch, createSignal } from "solid-js"
import { useT } from "~/hooks"
import { TbFolder, TbPlus } from "solid-icons/tb"
import { EnhancedFolderTree } from "~/components/EnhancedFolderTree"

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
  const { isOpen, onOpen, onClose } = createDisclosure()
  const [selectedPath, setSelectedPath] = createSignal("/")

  const addPath = () => {
    let sp = selectedPath()
    if (props.type === ACLItemType.String && props.onChange) {
      props.onChange(sp)
    }
    onClose()
  }

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
          <HStack w="$full" spacing="$2">
            <Input
              id={props.name}
              flex="1"
              readOnly={props.readonly}
              value={props.value as string}
              placeholder={props.placeholder}
              onInput={
                props.type === ACLItemType.String
                  ? (e) => props.onChange?.(e.currentTarget.value)
                  : undefined
              }
            />
            <Show when={props.name === "path"}>
              <IconButton
                colorScheme="accent"
                aria-label={t("global.choose_or_input_path")}
                icon={<TbFolder />}
                onClick={onOpen}
                disabled={props.readonly}
              />
            </Show>
          </HStack>
          <Show when={props.name === "path"}>
            <Modal size="xl" opened={isOpen()} onClose={onClose}>
              <ModalOverlay />
              <ModalContent>
                <ModalCloseButton />
                <ModalHeader>{t("global.choose_or_input_path")}</ModalHeader>
                <ModalBody>
                  <EnhancedFolderTree
                    forceRoot
                    onChange={setSelectedPath}
                    showHiddenFolder={true}
                  />
                </ModalBody>
                <ModalFooter display="flex" gap="$2">
                  <Button onClick={onClose} colorScheme="neutral">
                    {t("global.cancel")}
                  </Button>
                  <Button
                    onClick={addPath}
                    colorScheme="primary"
                    leftIcon={<TbPlus />}
                  >
                    {t("shares.add_path")}
                  </Button>
                </ModalFooter>
              </ModalContent>
            </Modal>
          </Show>
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
