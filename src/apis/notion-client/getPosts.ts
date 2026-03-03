import { CONFIG } from "site.config"
import { NotionAPI } from "notion-client"
import { idToUuid } from "notion-utils"

import getAllPageIds from "src/libs/utils/notion/getAllPageIds"
import getPageProperties from "src/libs/utils/notion/getPageProperties"
import { TPosts } from "src/types"

/**
 * @param {{ includePages: boolean }} - false: posts only / true: include pages
 */

// TODO: react query를 사용해서 처음 불러온 뒤로는 해당데이터만 사용하도록 수정
export const getPosts = async () => {
  let id = CONFIG.notionConfig.pageId as string
  if (!id) {
    console.error(
      "[notion] Missing page id. Set NOTION_PAGE_ID or NEXT_PUBLIC_NOTION_PAGE_ID."
    )
    return []
  }

  const api = new NotionAPI()

  let response
  try {
    response = await api.getPage(id)
  } catch (error) {
    console.error("[notion] Failed to fetch posts from Notion", error)
    return []
  }

  id = idToUuid(id)
  const collection = Object.values(response.collection)[0]?.value
  const block = response.block
  const schema = collection?.schema

  const rawMetadata = block?.[id]?.value

  // Check Type
  if (
    rawMetadata?.type !== "collection_view_page" &&
    rawMetadata?.type !== "collection_view"
  ) {
    return []
  } else {
    // Construct Data
    const pageIds = getAllPageIds(response)
    const data = []
    for (let i = 0; i < pageIds.length; i++) {
      const id = pageIds[i]
      const blockValue = block?.[id]?.value
      if (!blockValue) continue

      const properties = (await getPageProperties(id, block, schema)) || null
      if (!properties) continue

      // Add fullwidth, createdtime to properties
      properties.createdTime = new Date(blockValue?.created_time).toString()
      properties.fullWidth = (blockValue?.format as any)?.page_full_width ?? false

      data.push(properties)
    }

    // Sort by date
    data.sort((a: any, b: any) => {
      const dateA: any = new Date(a?.date?.start_date || a.createdTime)
      const dateB: any = new Date(b?.date?.start_date || b.createdTime)
      return dateB - dateA
    })

    const posts = data as TPosts
    return posts
  }
}
