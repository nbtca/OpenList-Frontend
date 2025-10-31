import { Box, HStack, Button, IconButton, useColorModeValue, Icon } from "@hope-ui/solid"
import { createMemo, For, Show } from "solid-js"
import { checkboxOpen, haveSelected, objStore, selectAll, State, userCan, toggleCheckbox } from "~/store"
import { bus } from "~/utils"
import { operations } from "./operations"
import { AiOutlineCloudUpload, AiOutlineSetting } from "solid-icons/ai"
import { RiSystemRefreshLine } from "solid-icons/ri"
import { IoMagnetOutline } from "solid-icons/io"
import { TbCheckbox } from "solid-icons/tb"
import { usePath, useRouter, useT } from "~/hooks"
import { CopyLink } from "./CopyLink"
import { Download } from "./Download"
import { CenterIcon } from "./Icon"
import { BiSolidBookContent } from "solid-icons/bi"
import { isTocVisible, setTocDisabled } from "~/components"

export const ActionBar = () => {
  const t = useT()
  const isFolder = createMemo(() => objStore.state === State.Folder)
  const { refresh } = usePath()
  const { isShare } = useRouter()
  const bgColor = useColorModeValue("white", "$neutral2")

  return (
    <Show when={isFolder()}>
      <Box
        w="$full"
        bgColor={bgColor()}
        borderBottom="1px solid"
        borderColor="$neutral6"
        py="$2"
        px="$2"
      >
        <HStack spacing="$2" wrap="wrap">
          <IconButton
            aria-label={t("home.toolbar.refresh")}
            icon={<RiSystemRefreshLine />}
            size="sm"
            onClick={() => refresh(undefined, true)}
          />
          
          <Show when={!isShare() && (userCan("write") || objStore.write)}>
            <Button
              size="sm"
              leftIcon={<Icon as={operations.new_file.icon} />}
              onClick={() => bus.emit("tool", "new_file")}
            >
              {t("home.toolbar.new_file")}
            </Button>
            
            <Button
              size="sm"
              leftIcon={<Icon as={operations.mkdir.icon} />}
              onClick={() => bus.emit("tool", "mkdir")}
            >
              {t("home.toolbar.mkdir")}
            </Button>
            
            <IconButton
              aria-label={t("home.toolbar.upload")}
              icon={<AiOutlineCloudUpload />}
              size="sm"
              onClick={() => bus.emit("tool", "upload")}
            />
            
            <IconButton
              aria-label={t("home.toolbar.recursive_move")}
              icon={<Icon as={operations.recursive_move.icon} />}
              size="sm"
              onClick={() => bus.emit("tool", "recursiveMove")}
            />
            
            <IconButton
              aria-label={t("home.toolbar.remove_empty_directory")}
              icon={<Icon as={operations.remove_empty_directory.icon} />}
              size="sm"
              onClick={() => bus.emit("tool", "removeEmptyDirectory")}
            />
            
            <IconButton
              aria-label={t("home.toolbar.batch_rename")}
              icon={<Icon as={operations.batch_rename.icon} />}
              size="sm"
              onClick={() => {
                selectAll(true)
                bus.emit("tool", "batchRename")
              }}
            />
          </Show>
          
          <Show when={!isShare() && userCan("offline_download")}>
            <IconButton
              aria-label={t("home.toolbar.offline_download")}
              icon={<IoMagnetOutline />}
              size="sm"
              onClick={() => bus.emit("tool", "offline_download")}
            />
          </Show>
          
          <IconButton
            aria-label={t("home.toolbar.toggle_checkbox")}
            icon={<TbCheckbox />}
            size="sm"
            onClick={toggleCheckbox}
          />
          
          <Show when={isTocVisible()}>
            <IconButton
              aria-label={t("home.toolbar.toggle_markdown_toc")}
              icon={<BiSolidBookContent />}
              size="sm"
              onClick={() => setTocDisabled((disabled) => !disabled)}
            />
          </Show>
          
          <IconButton
            aria-label={t("home.toolbar.local_settings")}
            icon={<AiOutlineSetting />}
            size="sm"
            onClick={() => bus.emit("tool", "local_settings")}
          />
          
          <Show when={checkboxOpen() && haveSelected()}>
            <Box borderLeft="1px solid" borderColor="$neutral6" pl="$2" ml="$2">
              <HStack spacing="$2">
                <Show when={!isShare()}>
                  <For each={["rename", "move", "copy", "delete", "share", "decompress"]}>
                    {(name) => (
                      <CenterIcon
                        name={name}
                        onClick={() => bus.emit("tool", name)}
                      />
                    )}
                  </For>
                </Show>
                <CopyLink />
                <Download />
                <Button
                  size="sm"
                  variant="subtle"
                  onClick={() => selectAll(false)}
                >
                  {t("home.toolbar.cancel_select")}
                </Button>
              </HStack>
            </Box>
          </Show>
        </HStack>
      </Box>
    </Show>
  )
}
