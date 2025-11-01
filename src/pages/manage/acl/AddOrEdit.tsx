import {
  Button,
  Container,
  FormLabel,
  Heading,
  VStack,
  Checkbox,
} from "@hope-ui/solid"
import { useManageTitle, useRouter, useT, useFetch } from "~/hooks"
import { handleResp, notify, r } from "~/utils"
import { ACLRule, ACLPermission, PResp } from "~/types"
import { createStore } from "solid-js/store"
import { Item, ACLItemType } from "./Item"
import { ResponsiveGrid } from "../common/ResponsiveGrid"
import { MaybeLoading } from "~/components"

const ACL_PERMISSIONS = [
  { key: ACLPermission.Read, name: "read" },
  { key: ACLPermission.Write, name: "write" },
  { key: ACLPermission.Delete, name: "delete" },
  { key: ACLPermission.Manage, name: "manage" },
  { key: ACLPermission.Share, name: "share" },
  { key: ACLPermission.Download, name: "download" },
] as const

const AddOrEditACL = () => {
  const t = useT()
  const { params, back } = useRouter()
  const { id } = params
  useManageTitle(`manage.sidemenu.${id ? "edit" : "add"}_acl`)

  const [ruleLoading, loadRule] = useFetch(
    (): PResp<ACLRule> => r.get(`/admin/acl/get?id=${id}`),
    true,
  )

  const [rule, setRule] = createStore<ACLRule>({
    role: "",
    path: "/",
    priority: 0,
    permissions: 0,
  } as ACLRule)

  const initEdit = async () => {
    const resp = await loadRule()
    handleResp(resp, (data) => {
      setRule(data)
    })
  }

  if (id) {
    initEdit()
  }

  const togglePermission = (perm: ACLPermission) => {
    setRule("permissions", (prev: number) => prev ^ perm)
  }

  const hasPermission = (perm: ACLPermission) => {
    return (rule.permissions & perm) !== 0
  }

  const [saveLoading, saveReq] = useFetch((): PResp<{ id: number }> => {
    return r.post(`/admin/acl/${id ? "update" : "create"}`, rule)
  })

  const save = async () => {
    const resp = await saveReq()
    handleResp(resp, () => {
      notify.success(t("global.save_success"))
      back()
    })
  }

  return (
    <MaybeLoading loading={id ? ruleLoading() : false}>
      <Heading mb="$2">{t(`global.${id ? "edit" : "add"}`)}</Heading>
      <ResponsiveGrid>
        <Item
          name="role"
          type={ACLItemType.String}
          required
          value={rule.role}
          placeholder="e.g., admin, editor, viewer"
          onChange={(value) => setRule("role", value)}
        />
        <Item
          name="path"
          type={ACLItemType.String}
          required
          value={rule.path}
          placeholder="e.g., / or /folder/* or /folder/subfolder"
          onChange={(value) => setRule("path", value)}
        />
        <Item
          name="priority"
          type={ACLItemType.Number}
          value={rule.priority}
          min={0}
          onChange={(value) => setRule("priority", value)}
        />
      </ResponsiveGrid>

      <Container mt="$4" w="$full">
        <FormLabel>{t("acl.permissions")}</FormLabel>
        <VStack spacing="$2" alignItems="start">
          {ACL_PERMISSIONS.map(({ key, name }) => (
            <Checkbox
              checked={hasPermission(key)}
              onChange={[togglePermission, key]}
            >
              {t(`acl.permission.${name}`)}
            </Checkbox>
          ))}
        </VStack>
      </Container>

      <Button
        mt="$2"
        loading={saveLoading()}
        onClick={save}
        colorScheme="accent"
      >
        {t(`global.${id ? "save" : "add"}`)}
      </Button>
    </MaybeLoading>
  )
}

export default AddOrEditACL
