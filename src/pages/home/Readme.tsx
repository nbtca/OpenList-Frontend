import { Box, useColorModeValue } from "@hope-ui/solid"
import { createMemo, Show, createResource, on } from "solid-js"
import { Markdown, MaybeLoading, IsolatedHtml } from "~/components"
import { useLink, useRouter, useParseText } from "~/hooks"
import { getSettingBool, objStore, State, me } from "~/store"
import { fetchText, api, pathJoin, fsGet } from "~/utils"

export function Readme(props: {
  files: string[]
  fromMeta: keyof typeof objStore
}) {
  const cardBg = useColorModeValue("white", "$neutral3")
  const { proxyLink } = useLink()
  const { pathname } = useRouter()

  const readmeObj = createMemo(() => {
    if ([State.FetchingMore, State.Folder].includes(objStore.state)) {
      const obj = objStore.objs.find((item) =>
        props.files.find(
          (file) => file.toLowerCase() === item.name.toLowerCase(),
        ),
      )
      if (obj) return obj
      return props.fromMeta === "readme"
        ? objStore.readme_obj
        : objStore.header_obj
    }
    return undefined
  })

  // Whether the content is sourced from metadata (admin-set)
  const isFromMeta = createMemo(
    on(
      () => objStore.state,
      () => {
        if (
          ![State.FetchingMore, State.Folder, State.File].includes(
            objStore.state,
          )
        ) {
          return false
        }
        if (readmeObj()) return false
        return !!(
          objStore[props.fromMeta] &&
          typeof objStore[props.fromMeta] === "string"
        )
      },
    ),
  )

  // Whether the metadata value is a local HTML file path to render as HTML
  const isMetaHtml = createMemo(() => {
    if (!isFromMeta()) return false
    const metaVal = objStore[props.fromMeta] as string
    return metaVal.startsWith("/") && metaVal.toLowerCase().endsWith(".html")
  })

  const readme = createMemo(
    on(
      () => objStore.state,
      () => {
        if (
          ![State.FetchingMore, State.Folder, State.File].includes(
            objStore.state,
          )
        ) {
          return ""
        }
        const obj = readmeObj()
        if (obj) {
          return proxyLink(obj, true)
        }
        if (
          objStore[props.fromMeta] &&
          typeof objStore[props.fromMeta] === "string"
        ) {
          return objStore[props.fromMeta] as string
        }
        return ""
      },
    ),
  )
  const fetchContent = async (readme: string) => {
    let res = {
      content: readme as string | ArrayBuffer,
    }
    if (/^https?:\/\//g.test(readme)) {
      res = await fetchText(readme)
    } else if (readme.startsWith("/")) {
      const fullPath = pathJoin(me().base_path, readme)
      const resp = await fsGet(fullPath)
      const obj = resp.data
      if (obj) {
        const sign = obj.sign
        const url =
          api +
          "/d" +
          fullPath +
          (sign ? `?sign=${encodeURIComponent(sign)}` : "")
        res = await fetchText(url)
      }
    }
    return res
  }
  const [content] = createResource(readme, fetchContent)
  return (
    <Show when={getSettingBool("readme_autorender") && readme()}>
      <Box w="$full" rounded="$xl" p="$4" bgColor={cardBg()} shadow="$lg">
        <MaybeLoading loading={content.loading}>
          <Show
            when={isMetaHtml()}
            fallback={
              <Markdown
                children={content()?.content}
                readme
                toc={props.fromMeta === "readme"}
                editPath={
                  readmeObj()
                    ? `${pathname()}/${encodeURIComponent(readmeObj()!.name)}?preview=${encodeURIComponent("Text Editor")}`
                    : undefined
                }
              />
            }
          >
            <IsolatedHtml content={useParseText(content()?.content).text()} />
          </Show>
        </MaybeLoading>
      </Box>
    </Show>
  )
}
