import {
  Box,
  HStack,
  Button,
  IconButton,
  useColorModeValue,
  Icon,
} from "@hope-ui/solid"
import { createMemo, createSignal, For, onMount, Show } from "solid-js"
import {
  checkboxOpen,
  haveSelected,
  objStore,
  selectAll,
  State,
  userCan,
  toggleCheckbox,
} from "~/store"
import { bus } from "~/utils"
import { operations } from "./operations"
import { AiOutlineCloudUpload, AiOutlineSetting } from "solid-icons/ai"
import { RiSystemRefreshLine, RiArrowsArrowRightSLine } from "solid-icons/ri"
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

  let scrollContainerRef: HTMLDivElement | undefined
  const [showScrollButton, setShowScrollButton] = createSignal(false)
  const [isScrolling, setIsScrolling] = createSignal(false)
  let scrollTimeout: NodeJS.Timeout | undefined

  const checkScrollable = () => {
    if (scrollContainerRef) {
      const { scrollWidth, clientWidth, scrollLeft } = scrollContainerRef
      setShowScrollButton(
        scrollWidth > clientWidth &&
          scrollLeft < scrollWidth - clientWidth - 10,
      )
    }
  }

  const handleScroll = () => {
    setIsScrolling(true)
    clearTimeout(scrollTimeout)
    scrollTimeout = setTimeout(() => {
      setIsScrolling(false)
    }, 1000)
    checkScrollable()
  }

  const scrollRight = () => {
    if (scrollContainerRef) {
      scrollContainerRef.scrollBy({ left: 200, behavior: "smooth" })
      setTimeout(checkScrollable, 300)
    }
  }

  onMount(() => {
    // 延迟检测以确保 DOM 完全渲染
    setTimeout(() => {
      checkScrollable()
    }, 100)
    window.addEventListener("resize", checkScrollable)
  })

  return (
    <Show when={isFolder()}>
      <Box
        w="$full"
        bgColor={bgColor()}
        borderBottom="1px solid"
        borderColor="$neutral6"
        py="$2"
        px="$2"
        position="relative"
      >
        <Box
          ref={scrollContainerRef}
          overflowX="auto"
          overflowY="hidden"
          css={{
            "&::-webkit-scrollbar": {
              height: "4px",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "$neutral7",
              borderRadius: "2px",
              opacity: isScrolling() ? 1 : 0,
              transition: "opacity 0.3s ease",
            },
            "&::-webkit-scrollbar-track": {
              background: "transparent",
            },
            scrollbarWidth: "thin",
            scrollbarColor: isScrolling()
              ? "$neutral7 transparent"
              : "transparent transparent",
          }}
          onScroll={handleScroll}
        >
          <HStack spacing="$2" flexWrap="nowrap" minW="max-content">
            <Show when={checkboxOpen() && haveSelected()}>
              <Box borderRight="1px solid" borderColor="$neutral3" pr="$2">
                <HStack spacing="$2">
                  <Show when={!isShare()}>
                    <For
                      each={[
                        "rename",
                        "move",
                        "copy",
                        "delete",
                        "share",
                        "decompress",
                      ]}
                    >
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
          </HStack>
        </Box>

        <Show when={showScrollButton()}>
          <IconButton
            aria-label="Scroll right"
            icon={<RiArrowsArrowRightSLine />}
            size="sm"
            onClick={scrollRight}
            position="absolute"
            right="$4"
            top="50%"
            transform="translateY(-50%)"
            bgColor={bgColor()}
            boxShadow="$md"
            zIndex={10}
          />
        </Show>
      </Box>
    </Show>
  )
}
