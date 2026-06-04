// src/types/common.d.ts

/** 通用选项 */
interface SelectOption {
  label: string
  value: string | number
  disabled?: boolean
}

/** 分页参数 */
interface PageParams {
  page: number
  pageSize: number
}

/** 排序方向 */
type SortOrder = 'ascending' | 'descending' | null

/** 表单规则 */
type FormRules = Record<string, unknown[]>
