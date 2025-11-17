import {
  Badge,
  Button,
  HStack,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  VStack,
  Box,
  Checkbox,
  Switch,
  FormControl,
  FormLabel,
  Text,
  Alert,
  AlertDescription,
} from "@hope-ui/solid"
import { createSignal, For, Show } from "solid-js"
import { useFetch, useManageTitle, useRouter, useT } from "~/hooks"
import { handleResp, notify, r } from "~/utils"
import { getACLRules, deleteACLRule } from "~/utils/api"
import {
  ACLRule,
  ACLPermission,
  ACLPermissionNames,
  ACLMethods,
} from "~/types/acl"
import { DeletePopover } from "../common/DeletePopover"
import { PResp, SettingItem, Resp, Group } from "~/types"
import { getSettingBool } from "~/store"

const PermissionBadges = (props: { permissions: number }) => {
  const getPermissions = () => {
    const perms: string[] = []
    if (ACLMethods.hasPermission(props.permissions, ACLPermission.Read))
      perms.push("Read")
    if (ACLMethods.hasPermission(props.permissions, ACLPermission.Write))
      perms.push("Write")
    if (ACLMethods.hasPermission(props.permissions, ACLPermission.Delete))
      perms.push("Delete")
    if (ACLMethods.hasPermission(props.permissions, ACLPermission.Manage))
      perms.push("Manage")
    if (ACLMethods.hasPermission(props.permissions, ACLPermission.Share))
      perms.push("Share")
    if (ACLMethods.hasPermission(props.permissions, ACLPermission.Download))
      perms.push("Download")
    return perms
  }

  return (
    <HStack spacing="$1" flexWrap="wrap">
      <For each={getPermissions()}>
        {(perm) => (
          <Badge colorScheme="info" fontSize="$xs">
            {perm}
          </Badge>
        )}
      </For>
    </HStack>
  )
}

const ACL = () => {
  const t = useT()
  useManageTitle("acl.manage.acl")
  const { to } = useRouter()
  const [loading, loadRules] = useFetch(getACLRules)
  const [rules, setRules] = createSignal<ACLRule[]>([])
  const [aclEnabled, setAclEnabled] = createSignal(false)
  const [aclSetting, setAclSetting] = createSignal<SettingItem | undefined>()
  const [settingLoading, setSettingLoading] = createSignal(false)

  const loadACLSetting = async () => {
    try {
      const resp: Resp<SettingItem[]> = await r.get(
        "/admin/setting/list?group=" + Group.GLOBAL,
      )
      if (resp.code === 200) {
        const setting = resp.data.find(
          (item: SettingItem) => item.key === "acl_enabled",
        )
        if (setting) {
          setAclSetting(setting)
          setAclEnabled(setting.value === "true")
        }
      }
    } catch (e) {
      console.error("Failed to load ACL setting:", e)
    }
  }

  const toggleACL = async (enabled: boolean) => {
    const setting = aclSetting()
    if (!setting) {
      notify.error("ACL setting not loaded")
      return
    }
    setSettingLoading(true)
    try {
      const resp: Resp<any> = await r.post("/admin/setting/save", [
        { ...setting, value: enabled ? "true" : "false" },
      ])
      if (resp.code === 200) {
        setAclEnabled(enabled)
        notify.success(t("global.save_success"))
      } else {
        notify.error(resp.message)
      }
    } catch (e) {
      notify.error(t("global.save_failed"))
    }
    setSettingLoading(false)
  }

  const refresh = async () => {
    const resp = await loadRules()
    handleResp(resp, (data) => setRules(data))
  }

  loadACLSetting()
  refresh()

  const [deleteLoading, deleteReq] = useFetch(deleteACLRule)
  const deleteRule = async (id: number) => {
    const resp = await deleteReq(id)
    handleResp(resp, () => {
      notify.success(t("global.delete_success"))
      refresh()
    })
  }

  return (
    <VStack spacing="$2" alignItems="start" w="$full">
      <Box
        w="$full"
        p="$4"
        borderWidth="1px"
        borderRadius="$md"
        borderColor="$neutral7"
      >
        <VStack spacing="$3" alignItems="start">
          <FormControl display="flex" alignItems="center">
            <FormLabel mb="0" mr="$2">
              {t("acl.enable_acl")}
            </FormLabel>
            <Switch
              checked={aclEnabled()}
              onChange={(e) =>
                toggleACL((e.target as HTMLInputElement).checked)
              }
              disabled={settingLoading()}
            />
          </FormControl>
          <Text size="sm" color="$neutral11">
            {t("acl.acl_description")}
          </Text>
        </VStack>
      </Box>

      <Show when={!aclEnabled()}>
        <Alert status="warning" w="$full">
          <AlertDescription>{t("acl.acl_disabled_msg")}</AlertDescription>
        </Alert>
      </Show>

      <Show when={aclEnabled()}>
        <HStack spacing="$2">
          <Button
            onClick={() => {
              to("/@manage/acl/add")
            }}
            colorScheme="accent"
          >
            {t("global.add")}
          </Button>
          <Button loading={loading()} onClick={refresh}>
            {t("global.refresh")}
          </Button>
        </HStack>
        <Box w="$full" overflowX="auto">
          <Table highlightOnHover dense>
            <Thead>
              <Tr>
                <Th>{t("acl.role")}</Th>
                <Th>{t("acl.path")}</Th>
                <Th>{t("acl.permissions")}</Th>
                <Th>{t("acl.priority")}</Th>
                <Th>{t("global.operations")}</Th>
              </Tr>
            </Thead>
            <Tbody>
              <For each={rules()}>
                {(rule) => (
                  <Tr>
                    <Td>
                      <Badge colorScheme="accent">{rule.role}</Badge>
                    </Td>
                    <Td>
                      <code>{rule.path}</code>
                    </Td>
                    <Td>
                      <PermissionBadges permissions={rule.permissions} />
                    </Td>
                    <Td>{rule.priority}</Td>
                    <Td>
                      <HStack spacing="$2">
                        <Button
                          onClick={() => {
                            to(`/@manage/acl/edit?id=${rule.id}`)
                          }}
                          size="sm"
                        >
                          {t("global.edit")}
                        </Button>
                        <DeletePopover
                          name={`${rule.role} - ${rule.path}`}
                          loading={deleteLoading()}
                          onClick={() => deleteRule(rule.id)}
                        />
                      </HStack>
                    </Td>
                  </Tr>
                )}
              </For>
            </Tbody>
          </Table>
        </Box>
        <Show when={rules().length === 0 && !loading()}>
          <Box w="$full" textAlign="center" p="$4" color="$neutral11">
            {t("acl.no_rules")}
          </Box>
        </Show>
      </Show>
    </VStack>
  )
}

export default ACL
