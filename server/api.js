import { Router } from "express";
import _ from "lodash";
import * as model from "./model.js";

/** // stackoverflow: credit
 * @function removeMarkdown
 * @description
 * Parse the markdown and returns a string
 * @param markdown - The markdown string to parse
 * @param options - The options for the function
 * @returns The parsed plain text
 */
function removeMarkdown(
  markdown,
  options = {
    listUnicodeChar: "",
  }
) {
  options.listUnicodeChar = options.listUnicodeChar
    ? options.listUnicodeChar
    : false;
  options.stripListLeaders = options.stripListLeaders
    ? options.stripListLeaders
    : true;
  options.gfm = options.gfm ? options.gfm : true;
  options.useImgAltText = options.useImgAltText ? options.useImgAltText : true;
  options.preserveLinks = options.preserveLinks ? options.preserveLinks : false;

  let output = markdown || "";

  // Remove horizontal rules (stripListHeaders conflict with this rule, which is why it has been moved to the top)
  output = output.replace(/^(-\s*?|\*\s*?|_\s*?){3,}\s*$/gm, "");

  try {
    if (options.stripListLeaders) {
      if (options.listUnicodeChar)
        output = output.replace(
          /^([\s\t]*)([\*\-\+]|\d+\.)\s+/gm,
          options.listUnicodeChar + " $1"
        );
      else output = output.replace(/^([\s\t]*)([\*\-\+]|\d+\.)\s+/gm, "$1");
    }
    if (options.gfm) {
      output = output
        // Header
        .replace(/\n={2,}/g, "\n")
        // Fenced codeblocks
        .replace(/~{3}.*\n/g, "")
        // Strikethrough
        .replace(/~~/g, "")
        // Fenced codeblocks
        .replace(/`{3}.*\n/g, "");
    }
    if (options.preserveLinks) {
      // Remove inline links while preserving the links
      output = output.replace(/\[(.*?)\][[\(](.*?)[\]\)]/g, "$1 ($2)");
    }
    output = output
      // Remove HTML tags
      .replace(/<[^>]*>/g, "")
      // Remove setext-style headers
      .replace(/^[=\-]{2,}\s*$/g, "")
      // Remove footnotes?
      .replace(/\[\^.+?\](\: .*?$)?/g, "")
      .replace(/\s{0,2}\[.*?\]: .*?$/g, "")
      // Remove images
      .replace(/\!\[(.*?)\][\[\(].*?[\]\)]/g, options.useImgAltText ? "$1" : "")
      // Remove inline links
      .replace(/\[(.*?)\][\[\(].*?[\]\)]/g, "$1")
      // Remove blockquotes
      .replace(/^\s{0,3}>\s?/g, "")
      .replace(/(^|\n)\s{0,3}>\s?/g, "\n\n")
      // Remove reference-style links?
      .replace(/^\s{1,2}\[(.*?)\]: (\S+)( ".*?")?\s*$/g, "")
      // Remove atx-style headers
      .replace(
        /^(\n)?\s{0,}#{1,6}\s+| {0,}(\n)?\s{0,}#{0,} {0,}(\n)?\s{0,}$/gm,
        "$1$2$3"
      )
      // Remove emphasis (repeat the line to remove double emphasis)
      .replace(/([\*_]{1,3})(\S.*?\S{0,1})\1/g, "$2")
      .replace(/([\*_]{1,3})(\S.*?\S{0,1})\1/g, "$2")
      // Remove code blocks
      .replace(/(`{3,})(.*?)\1/gm, "$2")
      // Remove inline code
      .replace(/`(.+?)`/g, "$1")
      // Replace two or more newlines with exactly two? Not entirely sure this belongs here...
      .replace(/\n{2,}/g, "\n\n");
  } catch (e) {
    console.error(e);

    return markdown;
  }
  return output;
}

const { IMAGE_URL = "/image/", APP_HOST = "http://localhost:3000" } =
  process.env;

function sendmail_to_user() {
  //
}

const router = Router();
export default router;

function transformPost(user) {
  return (p) => {
    if (!p) return {};
    return {
      id: p.post_id,
      date: p.created_date,
      readtime: p.readtime,
      title: p.title,
      summary: p.summary,
      username: p.username,
      photo_url: IMAGE_URL + p.photo,
      poster_url: IMAGE_URL + p.poster,
      name: p.display_name,
      sublink: `/${p?.username}/post/${p.slug}`,
      link: `${APP_HOST}/${p?.username}/post/${p.slug}`,
      is_reply: !!p.root_id,
      bookmarked: p.bookmarked,
      reaction: p.reaction,
      reactions: p.reactions,
      votes: p.votes,
      bookmarks: p.bookmarks,
      comments: p.comments,
      views: p.views,
      likes: p.likes,
      isMine: user?.user_id == p.owner_id,
    };
  };
}
function transformUser(u) {
  if (!u) return {};
  return {
    id: u.user_guid,
    name: u.display_name,
    username: u.username,
    sublink: `/${u.username}`,
    link: `${APP_HOST}/${u.username}`,
    photo_url: IMAGE_URL + u.photo,
    isFollowing: u.is_following,
  };
}

router.post("/private", (req, res) => {
  const api = {
    async follow({ username }, { user_id, user }) {
      if (!username) return { error: "{username} required" };
      const following = await model.getUser(username);
      if (!following) return { error: "user_does_not_exists" };
      const status = await model.follow(user_id, following.user_id);
      if (status) {
        sendmail_to_user(
          following.tenant_id,
          following.user_id,
          `@${user?.username} is now following you`,
          "follower_notification.html",
          {
            follower: user,
            __action_url: `${APP_HOST}/${user?.username}`,
          }
        );
      }
      return { ok: !!status };
    },
    async unfollow({ username }, { user_id }) {
      if (!username) return { error: "{username} required" };
      const user = await model.getUser(username);
      if (!user) return { error: "user_does_not_exists" };
      const follow = await model.unfollow(user_id, user.user_id);
      return { ok: !!follow };
    },
    async getFollowing(_, { user_id }) {
      const users = await model.getFollowing(user_id);
      return _.map(users, transformUser);
    },
    async saveProfile(profile = {}, { user_id, session }) {
      if (!profile) return { error: "profile required" };
      const username = (profile.username || "").trim();
      profile.username = username;
      if (!/^([a-zA-Z0-9][\w-]{2,32})$/.test(username)) {
        return { error: "username_invalid_format" };
      }

      try {
        const count = await model.updateUser(user_id, profile);
        const user2 = await model.getUserById(user_id);
        session.user = user2;
        return { ok: count > 0 };
      } catch {
        return { error: "username_unavailable" };
      }
    },
    async getPost({ id: post_id }, { user_id, user }) {
      if (!post_id) return { error: "Bad {id}" };
      const post = await model.getPost(post_id);
      if (!post || post.owner_id !== user_id) return { error: "not found" };
      return {
        ...(0, transformPost)(user)(post),
        post_id: post.post_id,
        body: post.body,
      };
    },
    async deletePost({ id: post_id }, { user_id }) {
      if (!post_id) return { error: "Bad {id}" };
      const count = await model.deletePost(user_id, post_id);

      return { ok: count > 0 };
    },
    async post(
      { body = "", post_id = "", parent_id, title = "", poster },
      { user_id, ip, user }
    ) {
      if (!user) return { error: "Not authenticated" };
      if (!body) return { error: "empty {body}" };
      if (parent_id && !parent_id) return { error: "bad {parent_id}" };
      const txt = removeMarkdown(body);
      const summary = _.truncate(title + " " + txt, 240);
      const tags = "";
      if (!title) {
        title = _.truncate(summary, 60);
        body = (body || "").substring(60);
      }
      const readtime = 0;
      if (post_id) {
        const post = await model.getPost(post_id);
        const count = await model.updatePost(
          user_id,
          post_id,
          poster,
          title,
          summary,
          body,
          tags,
          readtime,
          ip
        );

        return {
          ok: count > 0,
          sublink: `/${user.username}/post/${post?.slug}`,
          post_id,
        };
      }
      const post = await model.newPost(
        user_id,
        poster,
        title,
        summary,
        body,
        tags,
        parent_id,
        readtime,
        ip
      );
      if (parent_id) {
        model.updatePostStats(parent_id);
        model.getPost(parent_id).then((parentPost) => {
          if (!parentPost || parentPost.owner_id == user_id) return;
          sendmail_to_user(
            0,
            parentPost.owner_id,
            `${user.display_name} replied to your post: ` + _.truncate(txt, 40),
            "reply_notification.html",
            {
              summary: _.truncate(txt, 280),
              parentPost,
              replier: user,
              __action_url: `${APP_HOST}/${user?.username}/post/${post?.slug}`,
            }
          );
        });
      }
      if (!post) return { ok: false };

      return {
        ok: true,
        sublink: `/${user.username}/post/${post.slug}`,
        link: `${APP_HOST}/${user.username}/post/${post.slug}`,
        post_id: post.post_id,
        username: user.username,
        slug: post.slug,
      };
    },
    async saveReaction({ id: post_id, reaction }, { user_id }) {
      if (!post_id) return { error: "bad {id}" };
      const stats = await model.saveReaction(post_id, user_id, reaction);
      return { ok: true, reactions: stats.reactions, votes: stats.votes };
    },
    async getBookmarks(_, { user, user_id }) {
      return _.map(await model.getBookmarks(user_id), transformPost(user));
    },
    async bookmark({ id: post_id, bookmarked }, { user_id }) {
      if (!post_id) return { error: "bad {id}" };
      const stats = bookmarked
        ? await model.bookmark(post_id, user_id)
        : await model.deleteBookmark(post_id, user_id);
      return { ok: true, bookmarks: stats.bookmarks };
    },
  };
  if (!req.body.method) return res.sendStatus(500);
  if (typeof _.get(api, req.body.method) === "function") {
    return res.json(_.get(api, req.body.method)(req.body, req));
  }
  return res.sendStatus(401);
});

router.post("/", (req, res) => {
  const api = {
    async getFeed(_, { user, user_id }) {
      return _.map(await model.getFeed(user_id), transformPost(user));
    },
    async getThread(filters, { user }) {
      if (!filters.id) return { error: "bad_id" };
      const replies = await model.getReplies(
        filters.id,
        filters,
        user?.user_id
      );
      replies.data = _.map(replies.data, transformPost(user));
      return replies;
    },
    async getPost({ username, slug }, { user }) {
      const post = await model.getPostBySlug(slug, user?.user_id);
      if (!post || post.username !== username) return { error: "not_found" };
      const t = transformPost(user);
      return _.omitBy(
        {
          ...t(post),
          body: post.body,
          reply_to: post.root_id
            ? t(await model.getPost(post.root_id, user?.user_id))
            : undefined,
        },
        (x) => !x
      );
    },
    async getReactions({ id: post_id }) {
      if (!post_id) return { error: "bad post_id" };
      return model.getReactions(post_id);
    },
    async getNewUsers() {
      return Cache.wrap(
        "new-users/10",
        async () => _.map(await model.getNewUsers(5), transformUser),
        Cache.LONG_TTL
      );
    },
    async getTrendingUsers() {
      return Cache.wrap(
        "trending-users/10",
        async () => _.map(await model.getUsersByRank(5), transformUser),
        Cache.LONG_TTL
      );
    },
    async getTopics() {
      return Cache.wrap(
        "topics/10",
        async () =>
          _.map(await model.getTopics(10), (t) => ({
            title: t.title,
            slug: t.slug,
          })),
        Cache.LONG_TTL
      );
    },
    async getUserProfile({ username }, { user_id }) {
      const user = await model.getUser(username, user_id);
      if (!user) return { error: "user_not_found", name: "User not found" };
      return {
        ...transformUser(user),
        about: user.about,
        poster_url: IMAGE_URL + user.poster,
        isMine: user.user_id == user_id,
      };
    },
    async getUserPosts({ username, tab }, { user, user_id }) {
      return _.map(
        await model.getFeedByUsername(username, tab, user_id),
        transformPost(user)
      );
    },
    async getFollowing({ username, tab }) {
      const u = await model.getUser(username);
      if (!u) return { error: "user_not_found", name: "User not found" };
      if (tab == "follwing")
        return _.map(await model.getFollowing(u.user_id), transformUser);
      return _.map(await model.getFollowers(u.user_id), transformUser);
    },
    async search({ q: query = "", t: tags = "" }, { user, user_id }) {
      const search = await model.search(query || tags);
      const ids = search.hits.map((p) => p.post_id);
      const results = _.map(
        await model.getMutiplePosts(ids, user_id),
        transformPost(user)
      );
      return {
        results,
        total: search.estimatedTotalHits,
        facets: search.facetDistribution,
      };
    },
  };

  if (!req.body.method) return res.sendStatus(500);
  if (typeof _.get(api, req.body.method) === "function") {
    return res.json(_.get(api, req.body.method)(req.body, req));
  }
  return res.sendStatus(401);
});
