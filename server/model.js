import _ from "lodash";
import * as db from "./db.js";

const SELECT_POST = `SELECT 
s.*, s.modified_date as stat_date,
u.username, u.display_name, u.photo, u.about, u.user_guid, b.created_date as bookmarked, r.reaction,
p.post_id, p.owner_id, p.slug, p.created_date, p.readtime, p.poster,p.title, p.summary, p.root_id
FROM posts p 
INNER JOIN users u ON p.owner_id = u.user_id AND u.is_deleted IS NOT TRUE
LEFT OUTER JOIN post_stats s ON p.post_id = s.post_id
LEFT OUTER JOIN bookmarks b ON b.post_id=s.post_id AND b.user_id =$1
LEFT OUTER JOIN reactions r ON r.post_id=s.post_id AND r.user_id =$1
WHERE p.is_deleted IS NOT TRUE `;

const SELECT_POST_FULL = `SELECT 
s.*, s.modified_date as stat_date,
u.username, u.display_name, u.photo, u.about, u.user_guid, b.created_date as bookmarked, r.reaction,
p.*
FROM posts p 
INNER JOIN users u ON p.owner_id = u.user_id
LEFT OUTER JOIN post_stats s ON p.post_id = s.post_id
LEFT OUTER JOIN bookmarks b ON b.post_id=s.post_id AND b.user_id =$1
LEFT OUTER JOIN reactions r ON r.post_id=s.post_id AND r.user_id =$1
WHERE p.is_deleted IS NOT TRUE AND u.is_deleted IS NOT TRUE `;

const SELECT_USER = `SELECT u.user_id, u.username, u.display_name, 
u.about, u.photo, u.poster,u.user_guid, f.created_date as is_following
FROM users u 
LEFT OUTER JOIN following f ON u.user_id=f.following_id AND f.user_id=$1
WHERE u.is_deleted IS NOT TRUE`;

export function getNewUsers(limit = 10, for_user_id) {
  return db.query(
    `${SELECT_USER}
  ORDER BY u.created_date DESC
  LIMIT $2`,
    [for_user_id, limit],
    "getNewUsers"
  );
}

export function getFeed(for_user_id) {
  return db.query(
    `${SELECT_POST}
  ORDER BY p.created_date DESC
  LIMIT 100`,
    [for_user_id],
    "getFeed"
  );
}

export function getFeedByUsername(username, tab, for_user_id) {
  let filter = "";
  if (tab === "posts") filter = " AND p.root_id IS NULL ";
  else if (tab === "replies") filter = " AND p.root_id IS NOT NULL ";
  return db.query(
    `${SELECT_POST} AND u.username=$2 ${filter}
  ORDER BY created_date DESC
  LIMIT 100`,
    [for_user_id, username],
    "getFeedByUsername:" + tab
  );
}

export function getFeedByFollowing(user_id) {
  return db.query(
    `${SELECT_POST} AND u.user_id IN (
      SELECT following_id FROM following WHERE user_id=$1
    )
  ORDER BY created_date DESC
  LIMIT 100`,
    [user_id],
    "getFeedByFollowing"
  );
}

export async function newPost(
  user_id,
  poster,
  title,
  summary,
  body,
  tags = [],
  parent_id,
  readtime,
  ip
) {
  const post_id = db.uuid();
  const slug = db.uuid();
  const post = await db.insert(
    "posts",
    {
      post_id,
      slug,
      created_by: user_id,
      owner_id: user_id,
      body,
      title,
      summary,
      readtime,
      tags,
      poster,
      root_id: parent_id,
      ip,
    },
    "newPost"
  );
  db.insert("post_stats", { post_id }, "newPost_stats");
  return post;
}

export function updatePost(
  user_id,
  post_id,
  poster,
  title,
  summary,
  body,
  tags = [],
  readtime
) {
  return db.update(
    "posts",
    {
      body,
      title,
      summary,
      readtime,
      poster,
      tags,
      modified_date: new Date(),
    },
    { post_id, created_by: user_id, owner_id: user_id },
    "updatePost"
  );
}

export function getPost(id, for_user_id) {
  return db.get(
    `${SELECT_POST_FULL} AND p.post_id=$2`,
    [for_user_id, id],
    "getPost"
  );
}

export function getPostBySlug(slug, for_user_id) {
  return db.get(
    `${SELECT_POST_FULL} AND p.slug=$2`,
    [for_user_id, slug],
    "getPostBySlug"
  );
}

export function getMutiplePosts(ids, for_user_id) {
  return db.query(
    `${SELECT_POST} AND p.post_id=ANY($2::UUID[])
    ORDER BY p.created_date DESC
    LIMIT 1000`,
    [for_user_id, ids],
    "getMutiplePosts"
  );
}

export function deletePost(user_id, post_id) {
  return db.softDelete(
    "posts",
    { owner_id: user_id, post_id },
    user_id,
    "deletePostBySlug"
  );
}

export function getUser(username, for_user_id) {
  return db.get(
    `${SELECT_USER} AND u.username=$2`,
    [for_user_id, username],
    "getUser"
  );
}

export function getUserById(id, for_user_id) {
  return db.get(
    `${SELECT_USER} AND u.user_guid=$2`,
    [for_user_id, id],
    "getUserById"
  );
}

export function updateUser(user_id, profile) {
  profile.display_name = profile.name;
  profile = _.pick(profile, [
    "username",
    "display_name",
    "photo",
    "about",
    "poster",
  ]);
  return db.update("users", profile, { user_id }, "updateUser");
}

export function getFollowers(user_id) {
  return db.query(
    `SELECT u.user_id, u.username, u.display_name, u.about, u.photo, u.poster, u.user_guid
  FROM following f 
  INNER JOIN users u ON f.user_id=u.user_id AND u.is_deleted IS NOT TRUE
  WHERE f.following_id=$1`,
    [user_id],
    "getFollowers"
  );
}

export function getFollowing(user_id) {
  return db.query(
    `SELECT u.user_id, u.username, u.display_name, u.about, u.photo, u.poster, u.user_guid
  FROM following f 
  INNER JOIN users u ON f.following_id=u.user_id AND u.is_deleted IS NOT TRUE
  WHERE f.user_id=$1`,
    [user_id],
    "getFollowing"
  );
}

export function follow(user_id, following_id) {
  return db.insert("following", { user_id, following_id }, "follow", true);
}

export function unfollow(user_id, following_id) {
  return db.delete_rows("following", { user_id, following_id }, "follow");
}

export function getReplies(id, filters, for_user_id) {
  return db.dataTable(
    `${SELECT_POST} AND p.root_id=$2`,
    [for_user_id, id],
    filters,
    [],
    "getReplies"
  );
}

export function getReactions(post_id) {
  return db.query(
    `SELECT reaction as reaction, count(1) FROM reactions 
    WHERE post_id=$1
    GROUP BY reaction`,
    [post_id],
    "getReactions"
  );
}

export async function saveReaction(post_id, user_id, reaction) {
  await db.execute(
    `INSERT INTO reactions(post_id, user_id, reaction)
    VALUES($1,$2,$3)
    ON CONFLICT(post_id, user_id) DO UPDATE SET reaction=$3`,
    [post_id, user_id, reaction],
    undefined,
    "saveReaction"
  );
  return updatePostStats(post_id);
}

export function getBookmarks(user_id) {
  return db.query(
    `${SELECT_POST} AND b.post_id IS NOT NULL
    ORDER BY b.created_date DESC
    LIMIT 1000`,
    [user_id],
    "getBookmarks"
  );
}

export function bookmark(post_id, user_id) {
  db.insert("bookmarks", { post_id, user_id }, "bookmark", true);
  return updatePostStats(post_id);
}

export function deleteBookmark(post_id, user_id) {
  db.delete_rows("bookmarks", { post_id, user_id }, "deleteBookmark");
  return updatePostStats(post_id);
}

export function updatePostStats(post_id) {
  return new Promise((resolve) => {
    db.execute(
      `INSERT INTO post_stats(post_id, reactions,votes,bookmarks,comments) VALUES ($1,
(SELECT count(1) FROM reactions WHERE post_id=$1), 
((SELECT count(1) FROM reactions WHERE post_id=$1 AND reaction = 1) - (SELECT count(1) FROM reactions WHERE post_id=$1 AND reaction = -1)), 
(SELECT count(1) FROM bookmarks WHERE post_id=$1), 
(SELECT count(1) FROM posts WHERE root_id=$1))
ON CONFLICT(post_id) DO UPDATE  SET 
  reactions = excluded.reactions, 
  votes = excluded.votes, 
  bookmarks = excluded.bookmarks, 
  comments = excluded.comments
RETURNING *`,
      [post_id],
      (err, count, rows) => resolve(rows ? rows[0] : undefined),
      "updatePostStats"
    );
  });
}

export function getTags(limit = 10) {
  return db.query(
    `SELECT unnest(tags) tag, count(1) FROM posts p
    WHERE p.is_deleted IS NOT TRUE AND p.created_date >= (current_date - interval '1' month)
    GROUP BY 1
    ORDER BY 2 DESC
    LIMIT $1`,
    [limit],
    "getTags"
  );
}
