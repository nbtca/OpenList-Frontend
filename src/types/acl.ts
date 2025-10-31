export interface ACLRule {
  id: number
  role: string
  path: string
  permissions: number
  priority: number
  created_at: string
  updated_at: string
}

export enum ACLPermission {
  Read = 1 << 0, // 1
  Write = 1 << 1, // 2
  Delete = 1 << 2, // 4
  Manage = 1 << 3, // 8
  Share = 1 << 4, // 16
  Download = 1 << 5, // 32
}

export const ACLPermissionNames = [
  "Read",
  "Write",
  "Delete",
  "Manage",
  "Share",
  "Download",
] as const

export interface ACLMatchedRule {
  rule: ACLRule | null
  permissions: number
  path: string
}

export const ACLMethods = {
  hasPermission: (permissions: number, permission: ACLPermission) => {
    return (permissions & permission) !== 0
  },
  getAllPermissions: () => {
    return (
      ACLPermission.Read |
      ACLPermission.Write |
      ACLPermission.Delete |
      ACLPermission.Manage |
      ACLPermission.Share |
      ACLPermission.Download
    )
  },
}
