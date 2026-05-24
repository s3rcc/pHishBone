# Community Forum Plan and Database Schema

## Goal

Build a Reddit-like community module for pHishBone where users can:

- join topic-based communities
- create discussions, questions, guides, tank showcases, and fish/species shares
- attach uploaded media from the website
- share internal pHishBone content such as fish info pages, tanks, and frozen tank snapshots
- search posts, comments, tanks, and fish-related content quickly

This plan fits the current stack:

- .NET 8 Web API
- EF Core with PostgreSQL
- existing schemas: `profile`, `project`, `catalog`, `ai`
- existing `BaseEntity` pattern with soft-delete columns
- existing PostgreSQL full-text search direction with `tsvector` + `GIN`

## Product Shape

Use a Reddit-like structure:

- `Category` = broad browsing group such as Freshwater, Saltwater, Aquascaping, Plant Care, Disease Help
- `Community` = subreddit-style space such as `r/betta`, `r/plantedtanks`, `r/beginnerhelp`
- `Post` = discussion, question, guide, tank showcase, species share, progress journal
- `Comment` = threaded discussion
- `Vote` = upvote/downvote
- `Save` = bookmark post
- `Attachment` = uploaded image/file or internal share card

This is a better fit than a classic old forum because:

- feeds can sort by hot, new, top
- communities can stay focused by topic
- tank/fish sharing becomes a first-class post type
- search works better on posts and comments than deep forum subfolders

## Recommended Module Scope

### Phase 1

- communities
- posts
- post attachments
- tank/species sharing
- basic moderation flags
- feed and search

### Phase 2

- threaded comments
- votes
- saves
- subscriptions
- post flairs

### Phase 3

- reports and moderation actions
- trending/hot ranking jobs
- notifications
- advanced filters and recommendation feed

## Core Design Principles

1. Keep community data in a new `community` schema.
2. Reuse `profile.PBUsers` as the author/member identity source.
3. Reuse `project.Tanks`, `project.TankSnapshots`, and `catalog.Species` through reference tables instead of copying everything.
4. Freeze important display data into JSON snapshots when users share tanks or fish pages so posts stay readable even if the source changes later.
5. Store hot list counters directly on post/comment rows for fast feed queries.
6. Use PostgreSQL FTS + trigram for search, matching the current species search strategy.

## Main User Flows

### 1. Topic Discussion

User enters a community, creates a text post, adds flair, tags, and optional images.

### 2. Share Fish Info

User opens a fish/species page and clicks Share to Community.

The post stores:

- reference to `catalog.Species.Id`
- small display snapshot of species info at share time
- optional author commentary

### 3. Share Tank

User opens a tank and clicks Share to Community.

The post stores:

- reference to `project.Tank.Id`
- reference to latest `project.TankSnapshot.Id`
- frozen JSON summary with tank name, dimensions, safety score, warnings, thumbnail, and species list

This matches the project context goal that public shares should preserve the safety state at publish time.

### 4. Search

User can search:

- posts by title/body/tags
- comments by body text
- tank showcase posts by water type, safety score, tank size
- species share posts by fish name, scientific name, tag, care metadata

## Recommended Schema

All `community` tables should inherit the existing `BaseEntity` pattern:

- `Id`
- `CreatedBy`
- `LastUpdatedBy`
- `DeletedBy`
- `CreatedTime`
- `LastUpdatedTime`
- `DeletedTime`

### 1. `community.Categories`

Broad navigation groups.

| Column | Type | Notes |
| --- | --- | --- |
| `Id` | `text` | base entity id |
| `Name` | `varchar(80)` | unique display name |
| `Slug` | `varchar(80)` | unique URL key |
| `Description` | `varchar(500)` | optional |
| `IconName` | `varchar(80)` | optional |
| `ColorHex` | `varchar(16)` | optional |
| `SortOrder` | `int` | browse ordering |
| `IsOfficial` | `bool` | system-managed category |

Indexes:

- unique index on `Slug`
- index on `SortOrder`
- partial index on active rows where `DeletedTime is null`

### 2. `community.Communities`

Subreddit-style spaces.

| Column | Type | Notes |
| --- | --- | --- |
| `Id` | `text` | base entity id |
| `CategoryId` | `text` | FK to `community.Categories` |
| `Name` | `varchar(120)` | display name |
| `Slug` | `varchar(120)` | unique, ex: `betta-care` |
| `Description` | `varchar(1000)` | community summary |
| `RulesMarkdown` | `text` | posting rules |
| `IconUrl` | `varchar(500)` | optional |
| `BannerUrl` | `varchar(500)` | optional |
| `Visibility` | `smallint` | public, restricted, private |
| `PostingPolicy` | `smallint` | open, approval-required, mod-only |
| `PrimaryTopic` | `varchar(60)` | ex: freshwater, marine, planted |
| `IsOfficial` | `bool` | platform-owned |
| `MemberCount` | `int` | cached |
| `PostCount` | `int` | cached |
| `LastActivityAt` | `timestamp with time zone` | feed freshness |

Indexes:

- unique index on `Slug`
- index on `(CategoryId, LastActivityAt desc)`
- index on `(Visibility, IsOfficial)`
- partial index on active rows where `DeletedTime is null`

### 3. `community.CommunityMembers`

Subscriptions and moderator roles.

| Column | Type | Notes |
| --- | --- | --- |
| `Id` | `text` | base entity id |
| `CommunityId` | `text` | FK |
| `UserId` | `text` | FK to `profile.PBUsers.Id` |
| `Role` | `smallint` | member, moderator, owner |
| `NotificationLevel` | `smallint` | all, highlights, mute |
| `IsFavorite` | `bool` | quick access |
| `JoinedAt` | `timestamp with time zone` | can reuse `CreatedTime` if preferred |

Indexes:

- unique index on `(CommunityId, UserId)`
- index on `(UserId, CreatedTime desc)`
- index on `(CommunityId, Role)`

### 4. `community.CommunityFlairs`

Reddit-style label options per community.

| Column | Type | Notes |
| --- | --- | --- |
| `Id` | `text` | base entity id |
| `CommunityId` | `text` | FK |
| `Name` | `varchar(60)` | ex: Help, Showcase, Question |
| `Slug` | `varchar(60)` | community-local unique |
| `TextColor` | `varchar(16)` | optional |
| `BackgroundColor` | `varchar(16)` | optional |
| `IsModOnly` | `bool` | moderators only |

Indexes:

- unique index on `(CommunityId, Slug)`
- index on `(CommunityId, Name)`

### 5. `community.TopicTags`

Cross-community topic tags for better search and filtering.

| Column | Type | Notes |
| --- | --- | --- |
| `Id` | `text` | base entity id |
| `Name` | `varchar(60)` | ex: algae, cycling, shrimp, nano-tank |
| `Slug` | `varchar(60)` | unique |
| `TagType` | `smallint` | general, fish, tank, disease, equipment |
| `Description` | `varchar(300)` | optional |

Indexes:

- unique index on `Slug`
- index on `(TagType, Name)`

### 6. `community.Posts`

Main content table for feed pages.

| Column | Type | Notes |
| --- | --- | --- |
| `Id` | `text` | base entity id |
| `CommunityId` | `text` | FK |
| `AuthorId` | `text` | FK to `profile.PBUsers.Id` |
| `FlairId` | `text` | nullable FK |
| `PostType` | `smallint` | discussion, question, guide, tank-showcase, species-share, journal |
| `Status` | `smallint` | draft, published, locked, removed, archived |
| `Visibility` | `smallint` | public, members-only, hidden |
| `Title` | `varchar(220)` | required |
| `Slug` | `varchar(260)` | permalink helper |
| `BodyMarkdown` | `text` | rich editor source |
| `BodyPlainText` | `text` | normalized search body |
| `SearchKeywords` | `text` | denormalized tag/species/tank labels |
| `Metadata` | `jsonb` | flexible post metadata |
| `PrimaryAttachmentType` | `smallint` | image, gallery, file, tank, species |
| `ThumbnailUrl` | `varchar(500)` | feed preview |
| `PublishedAt` | `timestamp with time zone` | publish time |
| `EditedAt` | `timestamp with time zone` | edit marker |
| `LastActivityAt` | `timestamp with time zone` | recent comment/edit/vote activity |
| `CommentCount` | `int` | cached |
| `UpvoteCount` | `int` | cached |
| `DownvoteCount` | `int` | cached |
| `Score` | `int` | cached upvotes - downvotes |
| `SaveCount` | `int` | cached |
| `ViewCount` | `int` | cached |
| `HotScore` | `numeric(18,6)` | ranking score |
| `TrendingScore` | `numeric(18,6)` | optional ranking score |
| `SearchVector` | `tsvector` | generated or maintained |

Suggested metadata JSON examples:

- tank showcase: `{"waterType":"Freshwater","safetyScore":82,"volumeLiters":120}`
- species share: `{"speciesSlug":"betta-splendens","scientificName":"Betta splendens"}`
- guide: `{"difficulty":"Beginner","estimatedReadMinutes":6}`

Indexes:

- unique index on `Slug`
- index on `(CommunityId, PublishedAt desc)` where published and not deleted
- index on `(CommunityId, HotScore desc)` where published and not deleted
- index on `(AuthorId, CreatedTime desc)`
- index on `(PostType, PublishedAt desc)`
- index on `(Status, Visibility, PublishedAt desc)`
- GIN index on `SearchVector`
- GIN index on `Metadata jsonb_path_ops`
- trigram index on `Title`
- optional BRIN index on `PublishedAt` when table becomes very large

### 7. `community.PostTopicTags`

Many-to-many between posts and topic tags.

| Column | Type | Notes |
| --- | --- | --- |
| `PostId` | `text` | FK |
| `TagId` | `text` | FK |

Indexes:

- unique index on `(PostId, TagId)`
- index on `(TagId, PostId)`

### 8. `community.Attachments`

Generic media and internal share target store.

| Column | Type | Notes |
| --- | --- | --- |
| `Id` | `text` | base entity id |
| `OwnerUserId` | `text` | FK to `profile.PBUsers.Id` |
| `AttachmentKind` | `smallint` | image, video, file, internal-species, internal-tank, internal-snapshot, external-link |
| `StorageProvider` | `varchar(40)` | cloudinary, internal, external |
| `BucketOrFolder` | `varchar(120)` | optional |
| `StorageKey` | `varchar(255)` | Cloudinary public id or internal key |
| `Url` | `varchar(500)` | resolved public URL |
| `OriginalFileName` | `varchar(255)` | optional |
| `MimeType` | `varchar(120)` | optional |
| `SizeBytes` | `bigint` | optional |
| `Width` | `int` | image/video |
| `Height` | `int` | image/video |
| `DurationMs` | `int` | video/audio if used later |
| `ChecksumSha256` | `varchar(64)` | dedupe support |
| `Title` | `varchar(160)` | optional |
| `Caption` | `varchar(500)` | optional |
| `AltText` | `varchar(500)` | accessibility |
| `SourceEntityType` | `varchar(80)` | `catalog.Species`, `project.Tank`, `project.TankSnapshot` |
| `SourceEntityId` | `text` | related row id |
| `SourceSnapshot` | `jsonb` | frozen display payload |
| `Metadata` | `jsonb` | flexible attachment data |

Indexes:

- index on `(OwnerUserId, CreatedTime desc)`
- index on `(AttachmentKind, CreatedTime desc)`
- index on `(SourceEntityType, SourceEntityId)`
- unique index on `ChecksumSha256` only if dedupe is required
- GIN index on `SourceSnapshot`
- GIN index on `Metadata jsonb_path_ops`

### 9. `community.PostAttachments`

Orders attachments on a post.

| Column | Type | Notes |
| --- | --- | --- |
| `Id` | `text` | base entity id |
| `PostId` | `text` | FK |
| `AttachmentId` | `text` | FK |
| `SortOrder` | `int` | gallery order |
| `IsPrimary` | `bool` | feed preview |
| `DisplayMode` | `smallint` | card, gallery, inline, download |

Indexes:

- unique index on `(PostId, AttachmentId)`
- unique index on `(PostId, SortOrder)`
- index on `(AttachmentId)`

### 10. `community.Comments`

Threaded replies on posts.

| Column | Type | Notes |
| --- | --- | --- |
| `Id` | `text` | base entity id |
| `PostId` | `text` | FK |
| `AuthorId` | `text` | FK to `profile.PBUsers.Id` |
| `ParentCommentId` | `text` | nullable FK to same table |
| `RootCommentId` | `text` | top-level ancestor for thread queries |
| `Depth` | `smallint` | 0 for top-level |
| `ThreadPath` | `varchar(1200)` | materialized path for ordering |
| `Status` | `smallint` | active, deleted, removed, locked |
| `BodyMarkdown` | `text` | optional markdown |
| `BodyPlainText` | `text` | search body |
| `ReplyCount` | `int` | cached |
| `UpvoteCount` | `int` | cached |
| `DownvoteCount` | `int` | cached |
| `Score` | `int` | cached |
| `EditedAt` | `timestamp with time zone` | optional |
| `LastActivityAt` | `timestamp with time zone` | optional |
| `SearchVector` | `tsvector` | generated or maintained |

Indexes:

- index on `(PostId, ThreadPath)` where active and not deleted
- index on `(PostId, Score desc)`
- index on `(AuthorId, CreatedTime desc)`
- index on `(RootCommentId, ThreadPath)`
- GIN index on `SearchVector`
- trigram index on `BodyPlainText` only if comment search becomes important enough

### 11. `community.PostVotes`

Separate post voting table keeps foreign keys simple and fast.

| Column | Type | Notes |
| --- | --- | --- |
| `Id` | `text` | base entity id |
| `PostId` | `text` | FK |
| `UserId` | `text` | FK |
| `Value` | `smallint` | `1` or `-1` |

Indexes:

- unique index on `(PostId, UserId)`
- index on `(UserId, CreatedTime desc)`
- check constraint `Value in (-1, 1)`

### 12. `community.CommentVotes`

| Column | Type | Notes |
| --- | --- | --- |
| `Id` | `text` | base entity id |
| `CommentId` | `text` | FK |
| `UserId` | `text` | FK |
| `Value` | `smallint` | `1` or `-1` |

Indexes:

- unique index on `(CommentId, UserId)`
- index on `(UserId, CreatedTime desc)`
- check constraint `Value in (-1, 1)`

### 13. `community.PostSaves`

User saves/bookmarks of posts.

| Column | Type | Notes |
| --- | --- | --- |
| `Id` | `text` | base entity id |
| `PostId` | `text` | FK |
| `UserId` | `text` | FK |

Indexes:

- unique index on `(PostId, UserId)`
- index on `(UserId, CreatedTime desc)`

### 14. `community.Reports`

Moderation/report queue for safety and abuse control.

| Column | Type | Notes |
| --- | --- | --- |
| `Id` | `text` | base entity id |
| `ReporterUserId` | `text` | FK |
| `TargetType` | `smallint` | post, comment, community |
| `TargetId` | `text` | target row id |
| `ReasonCode` | `smallint` | spam, abuse, misinformation, unsafe advice |
| `Details` | `varchar(1000)` | optional |
| `Status` | `smallint` | open, reviewed, dismissed, actioned |
| `ReviewedByUserId` | `text` | nullable FK |
| `ReviewedAt` | `timestamp with time zone` | optional |

Indexes:

- index on `(TargetType, TargetId, Status)`
- index on `(Status, CreatedTime desc)`
- index on `(ReporterUserId, CreatedTime desc)`

## Entity Reference Strategy for Fish and Tank Sharing

This is the most important design choice for your app.

Do not only upload raw files. Support two attachment styles:

### A. Uploaded Media

Examples:

- tank photos
- progress images
- PDF care sheet
- downloadable aquarium checklist

These use:

- `community.Attachments`
- `StorageProvider = cloudinary` or future file storage provider

### B. Internal Share Cards

Examples:

- share a fish info page
- share a saved tank
- share a tank safety snapshot

These use:

- `SourceEntityType`
- `SourceEntityId`
- `SourceSnapshot`

Recommended snapshot payloads:

### Species share snapshot

```json
{
  "speciesId": "species_id",
  "commonName": "Betta",
  "scientificName": "Betta splendens",
  "slug": "betta-splendens",
  "thumbnailUrl": "https://...",
  "waterType": "Freshwater",
  "temperament": "Semi-aggressive",
  "difficulty": "Beginner",
  "tags": ["labyrinth", "territorial"]
}
```

### Tank share snapshot

```json
{
  "tankId": "tank_id",
  "tankSnapshotId": "snapshot_id",
  "name": "My 120L Planted Tank",
  "thumbnailUrl": "https://...",
  "width": 90,
  "height": 45,
  "depth": 30,
  "waterVolume": 120,
  "waterType": "Freshwater",
  "safetyScore": 82,
  "filterCapacity": 115,
  "warnings": ["Mild territory overlap"],
  "species": [
    { "speciesId": "1", "name": "Neon Tetra", "count": 12 },
    { "speciesId": "2", "name": "Corydoras", "count": 6 }
  ]
}
```

Why snapshot as JSON:

- fast public rendering
- post remains stable even if source tank changes
- search can use metadata without extra joins
- future export/share APIs become easier

## Search Strategy

Use the same search philosophy already present in `SpeciesService`:

- PostgreSQL `websearch_to_tsquery('simple', q)`
- `tsvector` for strong keyword matches
- `pg_trgm` similarity for typo tolerance
- weighted ranking across title, body, tags, and reference metadata

### Required PostgreSQL Extensions

- `pg_trgm`
- optional: `unaccent`

### Post Search Document

Build `Posts.SearchVector` from:

- `Title`
- `BodyPlainText`
- `SearchKeywords`
- selected metadata labels such as species name, scientific name, water type, flair name

Good implementation choice:

- keep a denormalized `SearchKeywords` text column
- update it in the application layer when tags/attachments change
- generate or refresh `SearchVector` from the row itself

This avoids generated-column limitations across joined tables.

### Comment Search Document

Build `Comments.SearchVector` from:

- `BodyPlainText`

Comment search can return:

- matching comment excerpt
- parent post title
- community slug

### Example Ranking Formula for Posts

```sql
(
  COALESCE(ts_rank("SearchVector", websearch_to_tsquery('simple', @q)), 0) * 4.0
  + COALESCE(similarity("Title", @q), 0) * 2.0
  + COALESCE(similarity(COALESCE("SearchKeywords", ''), @q), 0) * 1.5
  + CASE WHEN "PostType" = 3 THEN 0.25 ELSE 0 END
) + COALESCE("HotScore", 0) * 0.15
```

The exact weights can be tuned later.

### Search Endpoints to Support

- `GET /api/community/search/posts?q=&communitySlug=&postType=&tag=&page=&size=`
- `GET /api/community/search/comments?q=&communitySlug=&postId=&page=&size=`
- `GET /api/community/feed?sort=hot|new|top&communitySlug=&tag=`

## Indexing Strategy Summary

### Feed Queries

Optimize for:

- community home feed
- global hot/new feed
- author profile posts
- tank showcase browsing

Key indexes:

- `Posts(CommunityId, PublishedAt desc)`
- `Posts(CommunityId, HotScore desc)`
- `Posts(PostType, PublishedAt desc)`
- `Posts(AuthorId, CreatedTime desc)`
- partial published-active indexes

### Search Queries

Key indexes:

- `GIN(Posts.SearchVector)`
- `GIN(Comments.SearchVector)`
- `GIN(Posts.Metadata jsonb_path_ops)`
- trigram on `Posts.Title`

### Sharing Queries

Optimize for:

- all posts sharing one tank
- all posts sharing one species
- re-rendering post cards from snapshots

Key indexes:

- `Attachments(SourceEntityType, SourceEntityId)`
- `PostAttachments(PostId, SortOrder)`

### Interaction Queries

Key indexes:

- unique vote/save indexes to prevent duplicates
- user-centric indexes for profile pages

## Recommended Enums

Implement as `enum` in C# and store as `smallint` or string consistently.

### `CommunityVisibility`

- `0 = Public`
- `1 = Restricted`
- `2 = Private`

### `CommunityMemberRole`

- `0 = Member`
- `1 = Moderator`
- `2 = Owner`

### `CommunityPostType`

- `0 = Discussion`
- `1 = Question`
- `2 = Guide`
- `3 = TankShowcase`
- `4 = SpeciesShare`
- `5 = JournalUpdate`

### `CommunityPostStatus`

- `0 = Draft`
- `1 = Published`
- `2 = Locked`
- `3 = Removed`
- `4 = Archived`

### `AttachmentKind`

- `0 = Image`
- `1 = Video`
- `2 = File`
- `3 = InternalSpecies`
- `4 = InternalTank`
- `5 = InternalTankSnapshot`
- `6 = ExternalLink`

## Proposed API Surface

Follow the current project style:

- base route under `api/...`
- REST-style verbs
- slug-based public browsing where useful
- authenticated `me/...` routes for current-user views
- separate moderator and admin surfaces for privileged actions

### 1. Community Discovery and Feed

Public or authenticated read endpoints.

- `GET /api/community/categories`
  - list all top-level forum categories
- `GET /api/community/categories/{slug}`
  - get one category with summary counts
- `GET /api/community/communities`
  - browse communities with filters like category, topic, official, search, page, size
- `GET /api/community/communities/{slug}`
  - get community detail page payload
- `GET /api/community/communities/{slug}/about`
  - get community metadata, counts, description, moderators
- `GET /api/community/communities/{slug}/rules`
  - get community rules
- `GET /api/community/communities/{slug}/feed`
  - community feed with `sort=hot|new|top`, optional flair, tag, post type, time window
- `GET /api/community/feed`
  - global community feed across all communities
- `GET /api/community/trending`
  - trending communities, posts, tags

### 2. Membership and Current User Community Views

Authenticated endpoints.

- `GET /api/community/me/communities`
  - communities joined by current user
- `GET /api/community/me/feed`
  - personalized feed from joined communities
- `GET /api/community/communities/{communityId}/membership`
  - current user's membership state for one community
- `POST /api/community/communities/{communityId}/join`
  - join or subscribe to a community
- `DELETE /api/community/communities/{communityId}/join`
  - leave or unsubscribe from a community
- `PATCH /api/community/communities/{communityId}/membership`
  - update notification level or favorite state

### 3. Community Management

Moderator or admin endpoints depending on ownership rules.

- `POST /api/community/communities`
  - create a new community
- `PUT /api/community/communities/{communityId}`
  - update community profile, description, topic, branding
- `PATCH /api/community/communities/{communityId}/rules`
  - update rules markdown only
- `PATCH /api/community/communities/{communityId}/settings`
  - update visibility, posting policy, moderation settings
- `DELETE /api/community/communities/{communityId}`
  - archive or soft-delete a community
- `GET /api/community/communities/{communityId}/members`
  - list members or moderators
- `PATCH /api/community/communities/{communityId}/members/{userId}/role`
  - promote or demote moderator/owner role
- `DELETE /api/community/communities/{communityId}/members/{userId}`
  - remove a member from the community

### 4. Flairs and Topic Tags

Mix of public read and privileged write endpoints.

- `GET /api/community/communities/{communityId}/flairs`
  - list flairs for a community
- `POST /api/community/communities/{communityId}/flairs`
  - create a flair
- `PUT /api/community/communities/{communityId}/flairs/{flairId}`
  - update a flair
- `DELETE /api/community/communities/{communityId}/flairs/{flairId}`
  - delete a flair
- `GET /api/community/tags`
  - browse global topic tags
- `GET /api/community/tags/search`
  - search tags for composer/filter UI
- `POST /api/community/tags`
  - create a global topic tag
- `PUT /api/community/tags/{tagId}`
  - update a global topic tag
- `DELETE /api/community/tags/{tagId}`
  - delete a global topic tag

### 5. Posts and Composer

Core post lifecycle endpoints.

- `GET /api/community/posts/{postId}`
  - get post detail by id
- `GET /api/community/posts/by-slug/{communitySlug}/{postSlug}`
  - get SEO-friendly post detail
- `POST /api/community/posts`
  - create a new post or draft
- `PUT /api/community/posts/{postId}`
  - update title, body, tags, flair, metadata
- `DELETE /api/community/posts/{postId}`
  - soft-delete own post
- `PATCH /api/community/posts/{postId}/publish`
  - publish a draft
- `PATCH /api/community/posts/{postId}/archive`
  - archive own post
- `PATCH /api/community/posts/{postId}/lock`
  - lock or unlock post, usually moderator action
- `PATCH /api/community/posts/{postId}/pin`
  - pin or unpin post inside a community
- `POST /api/community/posts/{postId}/view`
  - increment view count or record view event
- `GET /api/community/me/posts`
  - current user's published posts
- `GET /api/community/me/drafts`
  - current user's draft posts
- `GET /api/community/me/saved-posts`
  - current user's saved/bookmarked posts

### 6. Attachment Uploads and Sharing Helpers

These power uploaded files plus fish/tank share cards.

- `POST /api/community/attachments`
  - upload one file attachment before attaching it to a post
- `POST /api/community/attachments/batch`
  - upload multiple attachments
- `DELETE /api/community/attachments/{attachmentId}`
  - delete an uploaded attachment owned by current user
- `POST /api/community/posts/{postId}/attachments`
  - attach one or more existing attachments to a post
- `DELETE /api/community/posts/{postId}/attachments/{attachmentId}`
  - detach an attachment from a post
- `PATCH /api/community/posts/{postId}/attachments/reorder`
  - reorder gallery attachments
- `PATCH /api/community/posts/{postId}/attachments/{attachmentId}/primary`
  - set the main thumbnail attachment
- `GET /api/community/share-preview/species/{speciesId}`
  - build preview payload for a species share card
- `GET /api/community/share-preview/tanks/{tankId}`
  - build preview payload for a tank share card using latest snapshot
- `GET /api/community/share-preview/tanks/{tankId}/snapshots/{snapshotId}`
  - build preview payload for a specific tank snapshot
- `POST /api/community/posts/{postId}/share/species/{speciesId}`
  - attach a species share card to an existing draft post
- `POST /api/community/posts/{postId}/share/tanks/{tankId}`
  - attach a tank share card to an existing draft post
- `POST /api/community/posts/{postId}/share/tank-snapshots/{snapshotId}`
  - attach a frozen tank snapshot card to an existing draft post

### 7. Votes, Saves, and Reactions

Authenticated interaction endpoints.

- `POST /api/community/posts/{postId}/vote`
  - set post vote with value `1` or `-1`
- `DELETE /api/community/posts/{postId}/vote`
  - remove current user's post vote
- `POST /api/community/comments/{commentId}/vote`
  - set comment vote with value `1` or `-1`
- `DELETE /api/community/comments/{commentId}/vote`
  - remove current user's comment vote
- `POST /api/community/posts/{postId}/save`
  - save a post
- `DELETE /api/community/posts/{postId}/save`
  - unsave a post

### 8. Comments and Replies

Threaded discussion endpoints.

- `GET /api/community/posts/{postId}/comments`
  - list comment tree for a post with sort options
- `GET /api/community/comments/{commentId}`
  - get one comment with context
- `POST /api/community/posts/{postId}/comments`
  - create a top-level comment
- `POST /api/community/comments/{commentId}/reply`
  - reply to an existing comment
- `PUT /api/community/comments/{commentId}`
  - edit own comment
- `DELETE /api/community/comments/{commentId}`
  - soft-delete own comment
- `PATCH /api/community/comments/{commentId}/lock`
  - lock or unlock a comment thread
- `GET /api/community/me/comments`
  - current user's comment history

### 9. Search

Search endpoints should use the PostgreSQL FTS and trigram strategy described above.

- `GET /api/community/search/posts`
  - search posts by title, body, tags, fish names, tank metadata
- `GET /api/community/search/comments`
  - search comments
- `GET /api/community/search/communities`
  - search communities by name and description
- `GET /api/community/search/tags`
  - search topic tags
- `GET /api/community/search/suggestions`
  - fast autocomplete for global search bar

### 10. Reporting and Moderation Queue

Authenticated report creation plus moderator review tools.

- `POST /api/community/reports`
  - create a report for post, comment, or community
- `GET /api/community/mod/communities/{communityId}/queue`
  - get moderation queue for one community
- `GET /api/community/mod/reports`
  - get global or filtered reports list for moderators/admins
- `GET /api/community/mod/reports/{reportId}`
  - get report detail
- `PATCH /api/community/mod/reports/{reportId}/status`
  - mark open, reviewed, dismissed, or actioned

### 11. Post and Comment Moderation Actions

Moderator endpoints.

- `POST /api/community/mod/posts/{postId}/approve`
  - approve a post if community uses approval flow
- `POST /api/community/mod/posts/{postId}/remove`
  - remove a post from public view
- `POST /api/community/mod/posts/{postId}/restore`
  - restore a removed post
- `POST /api/community/mod/posts/{postId}/lock`
  - lock post comments
- `DELETE /api/community/mod/posts/{postId}/lock`
  - unlock post comments
- `POST /api/community/mod/posts/{postId}/pin`
  - pin post in community
- `DELETE /api/community/mod/posts/{postId}/pin`
  - unpin post
- `POST /api/community/mod/comments/{commentId}/approve`
  - approve comment if needed
- `POST /api/community/mod/comments/{commentId}/remove`
  - remove comment
- `POST /api/community/mod/comments/{commentId}/restore`
  - restore removed comment
- `POST /api/community/mod/comments/{commentId}/lock`
  - lock comment branch
- `DELETE /api/community/mod/comments/{commentId}/lock`
  - unlock comment branch

### 12. Community Safety and Ban Management

Optional but strongly recommended for moderation completeness.

- `GET /api/community/mod/communities/{communityId}/bans`
  - list banned users
- `POST /api/community/mod/communities/{communityId}/bans`
  - ban a user from a community
- `DELETE /api/community/mod/communities/{communityId}/bans/{userId}`
  - unban a user
- `GET /api/community/mod/communities/{communityId}/muted-keywords`
  - list blocked terms
- `POST /api/community/mod/communities/{communityId}/muted-keywords`
  - add blocked term or phrase
- `DELETE /api/community/mod/communities/{communityId}/muted-keywords/{keywordId}`
  - remove blocked term

### 13. Admin and Backoffice Endpoints

Platform-level management, separate from community moderators.

- `GET /api/admin/community/categories`
  - admin list of categories
- `POST /api/admin/community/categories`
  - create category
- `PUT /api/admin/community/categories/{categoryId}`
  - update category
- `DELETE /api/admin/community/categories/{categoryId}`
  - delete category
- `GET /api/admin/community/communities`
  - admin list of all communities with moderation state
- `PATCH /api/admin/community/communities/{communityId}/official`
  - mark or unmark community as official
- `PATCH /api/admin/community/communities/{communityId}/status`
  - suspend, archive, or restore community
- `GET /api/admin/community/tags`
  - admin list of global tags
- `POST /api/admin/community/tags`
  - create global tag
- `PUT /api/admin/community/tags/{tagId}`
  - update global tag
- `DELETE /api/admin/community/tags/{tagId}`
  - delete global tag
- `GET /api/admin/community/reports`
  - admin-level report oversight
- `GET /api/admin/community/analytics`
  - platform community analytics dashboard

### 14. Notifications

Phase 3 endpoints if you add alerts for replies, votes, moderation actions, and follows.

- `GET /api/community/me/notifications`
  - list current user's community notifications
- `PATCH /api/community/me/notifications/{notificationId}/read`
  - mark one notification as read
- `PATCH /api/community/me/notifications/read-all`
  - mark all notifications as read

### 15. Minimal First Release API Slice

If you want the first shippable version only, implement these first:

- `GET /api/community/categories`
- `GET /api/community/communities`
- `GET /api/community/communities/{slug}`
- `GET /api/community/communities/{slug}/feed`
- `POST /api/community/communities/{communityId}/join`
- `DELETE /api/community/communities/{communityId}/join`
- `POST /api/community/posts`
- `PUT /api/community/posts/{postId}`
- `DELETE /api/community/posts/{postId}`
- `GET /api/community/posts/{postId}`
- `GET /api/community/posts/by-slug/{communitySlug}/{postSlug}`
- `POST /api/community/attachments`
- `POST /api/community/posts/{postId}/attachments`
- `GET /api/community/share-preview/species/{speciesId}`
- `GET /api/community/share-preview/tanks/{tankId}`
- `POST /api/community/posts/{postId}/share/species/{speciesId}`
- `POST /api/community/posts/{postId}/share/tanks/{tankId}`
- `POST /api/community/posts/{postId}/vote`
- `DELETE /api/community/posts/{postId}/vote`
- `POST /api/community/posts/{postId}/save`
- `DELETE /api/community/posts/{postId}/save`
- `GET /api/community/search/posts`

## API/Backend Implementation Plan

### Step 1. Domain and Infrastructure

- create `Domain.Entities.Community.*`
- create `Infrastructure.Persistence.Configurations.Community.*`
- add `DbSet<>` entries to `ApplicationDbContext`
- create migration for `community` schema and indexes

### Step 2. Application Layer

- DTOs for communities, posts, attachments, comments
- validators for post creation, sharing, and search filters
- service interfaces:
  - `ICommunityService`
  - `ICommunityPostService`
  - `ICommunityCommentService`
  - `ICommunitySearchService`

### Step 3. API

- `CommunityController`
- `CommunityPostController`
- `CommunityCommentController`
- `CommunitySearchController`

### Step 4. Sharing Hooks

- add "Share to community" action on species detail page
- add "Share tank" action on tank builder/dashboard
- create attachment snapshots from current species/tank data

### Step 5. Search and Feed Tuning

- implement hybrid FTS + trigram queries
- add hot score updater
- cache top community feeds if needed

## Frontend Shape

Recommended primary views:

- community discovery page
- community detail page with tabs for Hot, New, Top
- create post composer
- tank showcase card
- species share card
- post detail page with comments
- global search page with Posts and Comments tabs

Recommended post composer options:

- text post
- question
- tank showcase
- fish/species share
- guide
- upload media

## Important Decisions

### 1. Use one `Posts` table, not separate tables per post type

Reason:

- simpler feed query
- simpler search
- post type differences fit cleanly in metadata + attachments

### 2. Use separate vote tables for posts and comments

Reason:

- real foreign keys
- cleaner indexes
- easier aggregate updates

### 3. Use snapshots for internal sharing

Reason:

- stable public content
- less join-heavy rendering
- matches the product requirement around frozen safety score

### 4. Keep uploaded files generic

Reason:

- future support for PDFs, spreadsheets, guides, and videos
- not limited to image-only sharing

## Suggested First Migration Slice

If you want the safest first implementation, start with only these tables:

- `community.Categories`
- `community.Communities`
- `community.CommunityMembers`
- `community.CommunityFlairs`
- `community.Posts`
- `community.Attachments`
- `community.PostAttachments`
- `community.TopicTags`
- `community.PostTopicTags`

Then add:

- `community.Comments`
- `community.PostVotes`
- `community.CommentVotes`
- `community.PostSaves`
- `community.Reports`

## Final Recommendation

The best fit for pHishBone is:

- Reddit-style communities
- first-class `TankShowcase` and `SpeciesShare` post types
- generic attachment storage plus internal share snapshots
- PostgreSQL FTS + trigram search on posts and comments
- a dedicated `community` schema that reuses your current user, tank, snapshot, and species tables

This gives you a modern social forum without losing the aquarium-specific strength of the product.
