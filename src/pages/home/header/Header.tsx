import {
  HStack,
  useColorModeValue,
  Image,
  Center,
  Icon,
  Kbd,
  CenterProps,
  Avatar,
  Button,
  Menu,
  MenuTrigger,
  MenuContent,
  MenuItem,
} from "@hope-ui/solid"
import { changeColor } from "seemly"
import { Show, createMemo } from "solid-js"
import {
  getMainColor,
  getSetting,
  getSettingBool,
  local,
  objStore,
  State,
  me,
} from "~/store"
import { BsSearch } from "solid-icons/bs"
import { CenterLoading } from "~/components"
import { Container } from "../Container"
import { bus } from "~/utils"
import { Layout } from "./layout"
import { isMac } from "~/utils/compatibility"
import { UserMethods } from "~/types"
import { useRouter, useT } from "~/hooks"
import { AiOutlineUser, AiOutlineLogin } from "solid-icons/ai"

export const Header = () => {
  const logos = getSetting("logo").split("\n")
  const logo = useColorModeValue(logos[0], logos.pop())
  const t = useT()
  const { to } = useRouter()
  const ssoEnabled = getSettingBool("sso_login_enabled")

  const stickyProps = createMemo<CenterProps>(() => {
    switch (local["position_of_header_navbar"]) {
      case "sticky":
        return { position: "sticky", zIndex: "$sticky", top: 0 }
      default:
        return { position: undefined, zIndex: undefined, top: undefined }
    }
  })

  const userAvatar = createMemo(() => {
    const currentUser = me()
    if (
      ssoEnabled &&
      !UserMethods.is_guest(currentUser) &&
      currentUser.sso_id
    ) {
      // Use avatar from backend if available, otherwise fallback to ui-avatars
      if (currentUser.avatar) {
        return currentUser.avatar
      }
      return `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.username)}&background=random`
    }
    return null
  })

  return (
    <Center
      {...stickyProps}
      bgColor="$background"
      class="header"
      w="$full"
      // shadow="$md"
    >
      <Container>
        <HStack
          px="calc(2% + 0.5rem)"
          py="$2"
          w="$full"
          justifyContent="space-between"
        >
          <HStack class="header-left" h="44px">
            <Image
              src={logo()!}
              h="$full"
              w="auto"
              fallback={<CenterLoading />}
            />
          </HStack>
          <HStack class="header-right" spacing="$2">
            <Show when={objStore.state === State.Folder}>
              <Show when={getSetting("search_index") !== "none"}>
                <HStack
                  bg="$neutral4"
                  w="$32"
                  p="$1"
                  rounded="$md"
                  justifyContent="space-between"
                  border="2px solid transparent"
                  cursor="pointer"
                  color={getMainColor()}
                  bgColor={changeColor(getMainColor(), { alpha: 0.15 })}
                  _hover={{
                    bgColor: changeColor(getMainColor(), { alpha: 0.2 }),
                  }}
                  onClick={() => {
                    bus.emit("tool", "search")
                  }}
                >
                  <Icon as={BsSearch} />
                  <HStack>
                    {isMac ? <Kbd>Cmd</Kbd> : <Kbd>Ctrl</Kbd>}
                    <Kbd>K</Kbd>
                  </HStack>
                </HStack>
              </Show>
              <Layout />
            </Show>
            <Show
              when={!UserMethods.is_guest(me())}
              fallback={
                <Button
                  size="sm"
                  leftIcon={<AiOutlineLogin />}
                  onClick={() => to("/@login")}
                >
                  {t("login.login")}
                </Button>
              }
            >
              <Menu>
                <MenuTrigger
                  as={Avatar}
                  size="sm"
                  src={userAvatar()}
                  name={me().username}
                  cursor="pointer"
                  icon={<AiOutlineUser />}
                />
                <MenuContent>
                  <MenuItem onClick={() => to("/@manage")}>
                    {t("home.footer.manage")}
                  </MenuItem>
                </MenuContent>
              </Menu>
            </Show>
          </HStack>
        </HStack>
      </Container>
    </Center>
  )
}
