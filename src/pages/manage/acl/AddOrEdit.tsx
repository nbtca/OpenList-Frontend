import {
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Checkbox,
  HStack,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from "@hope-ui/solid"
import { createSignal, onMount, Show } from "solid-js"
import { useManageTitle, useRouter, useT, useFetch } from "~/hooks"
import { handleResp, notify } from "~/utils"
import { createACLRule, updateACLRule, getACLRule } from "~/utils/api"
import { ACLRule, ACLPermission } from "~/types/acl"

const AddOrEditACL = () => {
  const t = useT()
  const { searchParams, back } = useRouter()
  const id = Number(searchParams.id)
  const isEdit = !isNaN(id)
  useManageTitle(`manage.sidemenu.${isEdit ? "edit" : "add"}_acl`)

  const [role, setRole] = createSignal("")
  const [path, setPath] = createSignal("/")
  const [priority, setPriority] = createSignal(0)
  const [permissions, setPermissions] = createSignal(0)

  const togglePermission = (perm: ACLPermission) => {
    setPermissions((prev) => prev ^ perm)
  }

  const hasPermission = (perm: ACLPermission) => {
    return (permissions() & perm) !== 0
  }

  const [loadLoading, loadRule] = useFetch(getACLRule)

  onMount(async () => {
    if (isEdit) {
      const resp = await loadRule(id)
      handleResp(resp, (rule: ACLRule) => {
        setRole(rule.role)
        setPath(rule.path)
        setPriority(rule.priority)
        setPermissions(rule.permissions)
      })
    }
  })

  const [saveLoading, saveReq] = useFetch(
    isEdit ? updateACLRule : createACLRule,
  )

  const save = async () => {
    if (!role().trim()) {
      notify.error(t("acl.role_required"))
      return
    }
    if (!path().trim()) {
      notify.error(t("acl.path_required"))
      return
    }

    const ruleData: any = {
      role: role().trim(),
      path: path().trim(),
      permissions: permissions(),
      priority: priority(),
    }

    if (isEdit) {
      ruleData.id = id
    }

    const resp = await saveReq(ruleData)
    handleResp(resp, () => {
      notify.success(t("global.save_success"))
      back()
    })
  }

  return (
    <VStack spacing="$4" alignItems="start" w="$full" maxW="$lg">
      <FormControl required>
        <FormLabel>{t("acl.role")}</FormLabel>
        <Input
          value={role()}
          onInput={(e) => setRole(e.currentTarget.value)}
          placeholder="e.g., admin, editor, viewer"
        />
      </FormControl>

      <FormControl required>
        <FormLabel>{t("acl.path")}</FormLabel>
        <Input
          value={path()}
          onInput={(e) => setPath(e.currentTarget.value)}
          placeholder="e.g., / or /folder/* or /folder/subfolder"
        />
      </FormControl>

      <FormControl>
        <FormLabel>{t("acl.priority")}</FormLabel>
        <NumberInput
          value={priority()}
          onChange={(value) => setPriority(Number(value))}
          min={0}
        >
          <NumberInputField />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
      </FormControl>

      <FormControl>
        <FormLabel>{t("acl.permissions")}</FormLabel>
        <VStack spacing="$2" alignItems="start">
          <Checkbox
            checked={hasPermission(ACLPermission.Read)}
            onChange={() => togglePermission(ACLPermission.Read)}
          >
            {t("acl.permission.read")}
          </Checkbox>
          <Checkbox
            checked={hasPermission(ACLPermission.Write)}
            onChange={() => togglePermission(ACLPermission.Write)}
          >
            {t("acl.permission.write")}
          </Checkbox>
          <Checkbox
            checked={hasPermission(ACLPermission.Delete)}
            onChange={() => togglePermission(ACLPermission.Delete)}
          >
            {t("acl.permission.delete")}
          </Checkbox>
          <Checkbox
            checked={hasPermission(ACLPermission.Manage)}
            onChange={() => togglePermission(ACLPermission.Manage)}
          >
            {t("acl.permission.manage")}
          </Checkbox>
          <Checkbox
            checked={hasPermission(ACLPermission.Share)}
            onChange={() => togglePermission(ACLPermission.Share)}
          >
            {t("acl.permission.share")}
          </Checkbox>
          <Checkbox
            checked={hasPermission(ACLPermission.Download)}
            onChange={() => togglePermission(ACLPermission.Download)}
          >
            {t("acl.permission.download")}
          </Checkbox>
        </VStack>
      </FormControl>

      <HStack spacing="$2">
        <Button
          onClick={save}
          loading={saveLoading() || loadLoading()}
          colorScheme="accent"
        >
          {t("global.save")}
        </Button>
        <Button onClick={back}>{t("global.cancel")}</Button>
      </HStack>
    </VStack>
  )
}

export default AddOrEditACL
