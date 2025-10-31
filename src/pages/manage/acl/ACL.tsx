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
} from "@hope-ui/solid"
import { createSignal, For, Show } from "solid-js"
import { useFetch, useManageTitle, useRouter, useT } from "~/hooks"
import { handleResp, notify } from "~/utils"
import { getACLRules, deleteACLRule } from "~/utils/api"
import {
  ACLRule,
  ACLPermission,
  ACLPermissionNames,
  ACLMethods,
} from "~/types/acl"
import { DeletePopover } from "../common/DeletePopover"

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
  useManageTitle("manage.sidemenu.acl")
  const { to } = useRouter()
  const [loading, loadRules] = useFetch(getACLRules)
  const [rules, setRules] = createSignal<ACLRule[]>([])

  const refresh = async () => {
    const resp = await loadRules()
    handleResp(resp, (data) => setRules(data))
  }

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
    </VStack>
  )
}

export default ACL
