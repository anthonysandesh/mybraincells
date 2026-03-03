import { TPosts, TPostStatus, TPostType } from "src/types"

export type FilterPostsOptions = {
  acceptStatus?: TPostStatus[]
  acceptType?: TPostType[]
}

const initialOption: FilterPostsOptions = {
  acceptStatus: ["Public"],
  acceptType: ["Post"],
}
const current = new Date()
const tomorrow = new Date(current)
tomorrow.setDate(tomorrow.getDate() + 1)
tomorrow.setHours(0, 0, 0, 0)
const getFirstValue = <T>(value: T | T[] | undefined) =>
  Array.isArray(value) ? value[0] : value

export function filterPosts(
  posts: TPosts,
  options: FilterPostsOptions = initialOption
) {
  const { acceptStatus = ["Public"], acceptType = ["Post"] } = options
  const filteredPosts = posts
    // filter data
    .filter((post) => {
      const postDate = new Date(post?.date?.start_date || post.createdTime)
      const postTime = postDate.getTime()
      if (
        !post.title ||
        !post.slug ||
        Number.isNaN(postTime) ||
        postTime > tomorrow.getTime()
      )
        return false
      return true
    })
    // filter status
    .filter((post) => {
      const postStatus = getFirstValue(post.status)
      if (!postStatus) return false
      return acceptStatus.includes(postStatus)
    })
    // filter type
    .filter((post) => {
      const postType = getFirstValue(post.type)
      if (!postType) return false
      return acceptType.includes(postType)
    })
  return filteredPosts
}
