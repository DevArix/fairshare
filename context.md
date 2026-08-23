# FairShare project context

## Product

FairShare is a responsive shared-expense application. The first page is authentication. Signed-in users manage friends, groups, selective expense participants, balances, settlements, invitations, activity, statistics, and their profile.

## Current technical decisions

- The direct request for a JSON database overrides the pasted brief's PostgreSQL line.
- `frontend` is a Vite React application and `backend` is an Express REST API.
- The JSON file is the server-side source of truth. Browser storage holds only the JWT session token.
- Passwords use bcrypt hashes. Protected endpoints use signed JWT bearer tokens.
- Every group member can manage group content and collaboration controls. A stable `ownerId` keeps full group deletion restricted to the original owner even when members change the display manager.
- Uploaded group images and receipts are saved under `backend/uploads`; JSON records store their public paths.
- Money is converted to integer minor units as soon as it enters the API. Calculations never add binary floating point currency values.
- Code is split by page, component, route, controller, service, model, middleware, and utility responsibility. Source files have no comments; project reasoning stays here.

## Data model

- `users`: identity, password hash, profile fields, timestamps.
- `friendRequests`: sender, receiver, pending/accepted/rejected state.
- `friendships`: normalized user pairs.
- `friendInvitations`: one secure personal invitation code per inviter.
- `groups`: stable deletion owner, changeable display manager, currency, optional image, invitation state.
- `groupMembers`: group-user membership and join time.
- `bringItems`: group item or task, assigned member, creator, completion state, and timestamps.
- `expenses`: group, creator, payer, amount in cents, split type, optional receipt.
- `expenseShares`: exact participant share in cents and optional basis points.
- `settlements`: payer-to-receiver money movements, editable separately from expenses with original and updated timestamps.
- `activities`: newest-first group history.

## REST API plan

- `/api/auth`: register, login, current session.
- `/api/users`: search and profile updates.
- `/api/friends`: list, request, accept, reject, personal invite-link creation, public invite preview, and automatic invite acceptance.
- `/api/groups`: list, create, detail, members, invitation controls, assigned bring-items, expenses, balances, and create/update settlements.
- `/api/settlements`: authenticated current-user history across every group membership.
- `/api/invitations`: public preview and authenticated join.

## Calculation approach

For each expense, each selected participant owes their recorded integer share to the payer. The payer's own share creates no debt. Raw pairwise obligations are netted in both directions. Settlements subtract from the payer-to-receiver obligation. Balance details keep the contributing expenses and settlements, so every displayed debt can be explained. Equal splits distribute remainder cents in deterministic participant order. Custom shares must total the expense cents. Percentage shares use integer basis points and must total 10,000; final remainder cents are assigned deterministically.

## Change log

- 2026-08-20: Created the two-folder project foundation, packages, API shell, atomic JSON model, authentication middleware, money helpers, Vite shell, API client, auth context, routes, and formatting helpers.
- 2026-08-20: Added secure registration/login, profile updates, image upload handling, user search, friend requests, friendships, group activity helpers, deterministic split validation, and pairwise balance calculation with explainable detail records.
- 2026-08-20: Added group summaries and full group views, group creation with friend selection and optional image, invitation preview/join/regenerate/disable flows, member access rules, direct friend additions, member removal, leaving, and admin ownership transfer.
- 2026-08-20: Completed expense create/edit/delete with equal, custom, and percentage shares; enforced participant and payer membership; added receipt support; and completed partial/full settlement recording with party authorization and outstanding-debt caps. Every mutation writes an activity and balances are derived fresh from expenses plus settlements.
- 2026-08-20: Built the first responsive product slice: polished login and registration, protected navigation, responsive desktop/mobile shell, real dashboard summaries, group cards, recent activity, reusable avatars and empty states, plus the shared visual system.
- 2026-08-20: Installed all application packages and selected Vite's runner config loader for development and builds so tooling stays within the restricted project workspace.
- 2026-08-20: Disabled development dependency discovery because the desktop sandbox blocks Vite from scanning parent filesystem directories. Production bundling succeeds, and the stable local preview serves that compiled output.
- 2026-08-20: Added reusable modal, expense create/edit form, selective participant shares, receipt selection, balance explanation and partial settlement form, expense detail management, actual-data pie statistics, and invitation/member/admin group controls.
- 2026-08-20: Completed friend search, friend request accept/reject, friend lists, and group creation with currency, optional image, and initial friend selection.
- 2026-08-20: Completed profile and password settings plus invitation preservation across login/registration and one-click group joining.
- 2026-08-20: Completed the dedicated group workspace with overview summaries, full expense history/details/edit/delete, clickable balance explanations, settlement history, actual-data pie statistics, member administration, invitations, and newest-first activity.
- 2026-08-20: Finished responsive desktop, tablet, mobile, modal, form, chart, group, friend, profile, and invitation styling for every implemented surface.
- 2026-08-20: Added isolated calculation and REST flow tests covering cent remainders, percentage and custom validation, opposite-debt netting, duplicate friend requests, equal expenses, partial settlements, and overpayment rejection.
- 2026-08-20: Serialized complete JSON read-change-write transactions to prevent lost updates during concurrent requests, and blocked member removal or departure while that person has an unsettled group balance.
- 2026-08-20: Added a stable sandbox-friendly development command, exact local preview CORS origins, and project setup/verification documentation.
- 2026-08-20: Split chart and general vendor packages into separate production assets to keep the main application bundle compact.
- 2026-08-20: Final verification passed with five backend tests, a clean production build, live frontend/API health checks, and a portable source archive in `outputs`.
- 2026-08-20: Changed the primary visual theme from forest green and lime to violet, deep plum, and soft lavender across navigation, actions, authentication, summaries, group headers, forms, invitations, and charts, with final theme overrides applied after component styles.
- 2026-08-20: Replaced the remaining hard-coded green background, border, and text colors in the sidebar “Good to know” card with plum and lavender shades.
- 2026-08-20: Began complete Persian localization with RTL document direction, Persian typography, navigation, authentication pages, shared authentication marketing copy, Persian date/number formatting, and تومان display support for both new IRT and older IRR group records.
- 2026-08-20: Localized the dashboard, group cards, friends and requests, group creation, profile settings, and invitation flow; replaced the new-group IRR choice with IRT تومان while retaining USD and EUR.
- 2026-08-20: Localized shared modals, expense creation/editing, balance explanations, settlement recording, expense details, confirmations, receipts, and statistics chart labels.
- 2026-08-20: Localized group administration, invitation-link controls, member roles, member additions/removals, ownership controls, and leave-group actions.
- 2026-08-20: Fully localized the group workspace, tabs, summaries, expense and balance rows, empty states, settlement history, statistics headings, activity history, and add/edit expense dialogs.
- 2026-08-20: Localized authentication, access-control, generic server errors, and all split-calculation validation messages; updated the related calculation test expectation.
- 2026-08-20: Localized expense, group, invitation-link activity, and friendship server messages; changed accepted group currencies from IRR to IRT for new groups.
- 2026-08-20: Completed server localization for member management, invitations, profile/password validation, settlements, ownership transfer, and all related activity feed records.
- 2026-08-20: Removed the final visible English brand, loading mark, menu accessibility label, and generic request error; made تومان the default dashboard and new-group currency.
- 2026-08-20: Applied the Persian Vazirmatn typeface to every nested UI element so earlier component-specific Latin font declarations no longer override the localized typography.
- 2026-08-20: Normalized legacy IRR groups to IRT in dashboard summaries, group views, lists, and invitation previews without rewriting stored records; made backend group creation default to تومان and localized balance payment details and the server startup message.
- 2026-08-20: Replaced raw IRT labels on group cards and expense details with «تومان», made the money formatter default to تومان, migrated the current JSON group's currency from IRR to IRT, and translated its existing system-generated activity records while preserving user-entered names and descriptions.
- 2026-08-20: Verified the complete Persian/RTL and تومان update with all five backend tests passing, a clean Vite production build, and successful live responses from the frontend login route and backend health endpoint.
- 2026-08-20: Added the user-provided green PNG as `frontend/public/logo.png` and replaced the letter-based mark with that image on authentication, application navigation, invitation, and loading surfaces; preserved the user's current «دن» authentication brand text and the full logo image with contained sizing.
- 2026-08-20: Verified the new PNG logo with a clean production build and a successful `image/png` response from the live local preview.
- 2026-08-20: Corrected the RTL password field by moving the show/hide password eye control to the left beside the lock icon and increasing the input's left padding so neither icon overlaps the Persian placeholder or typed password.
- 2026-08-20: Added Nodemailer to the Express backend dependencies as the SMTP transport for the requested password-recovery email flow.
- 2026-08-20: Added secure password recovery API endpoints, 30-minute single-use reset tokens stored only as SHA-256 hashes, automatic expired-token cleanup, SMTP email delivery with Persian HTML and text content, generic account-enumeration-safe responses, legacy JSON normalization, Gmail-ready environment examples, and the new password-reset collection in the JSON database.
- 2026-08-20: Replaced the non-interactive «ورود امن» text with a working forgot-password link; added Persian email-request and new-password pages, public routes, loading/error/success states, RTL-friendly form styling, token-aware validation, and navigation back to login.
- 2026-08-20: Extended the REST integration test to cover unknown-account privacy, reset-token creation, invalid-token rejection, successful password replacement, rejection of the old password, acceptance of the new password, and one-time token reuse protection.
- 2026-08-20: Added per-user session versions to JWTs so completing password recovery also invalidates every previously issued login token; kept that internal value out of public user responses and added an integration assertion for old-session rejection.
- 2026-08-20: Documented the SMTP sender variables and frontend reset-link address required to enable real password-recovery email delivery.
- 2026-08-20: Final password-recovery verification passed with the expanded REST flow, all five backend tests, a clean production frontend build, and session invalidation after reset; real outbound delivery remains intentionally gated on private SMTP credentials in `backend/.env`.
- 2026-08-20: Added an administrator-only group deletion endpoint with atomic cleanup of the group's expense shares, expenses, settlements, activities, memberships, and group record; added a clearly labeled destructive section to group management with a full-data-loss confirmation, loading state, error handling, and navigation back to the dashboard.
- 2026-08-20: Added integration coverage proving ordinary members cannot delete a group, administrators can, and every dependent JSON record is removed; made the deletion warning and action stack cleanly on narrow mobile screens.
- 2026-08-20: Final group-deletion verification passed with all five backend tests and a clean production frontend build.
- 2026-08-20: Removed the overlapping magnifying-glass icon from friend search, restored balanced input padding, and added a 600 ms minimum animated search state with a softly pulsing button and three bouncing dots; respected reduced-motion preferences for accessibility.
- 2026-08-20: Verified the animated friend-search update with a clean production build and a successful live response from the friends route.
- 2026-08-20: Made the sidebar avatar, name, and username a single accessible link to the profile page, made the top-bar avatar open the same profile route, preserved mobile-sidebar closing behavior, and isolated username direction so handles render visually as `@username` inside the Persian RTL layout.
- 2026-08-20: Reused the LTR-isolated user-handle style on the profile page, friend search results, friend list, and incoming friend requests so the at-sign remains before every username throughout the RTL interface.
- 2026-08-20: Completed consistent `@username` rendering in group creation friend selection, group member management, and expense participant selection.
- 2026-08-20: Verified clickable profile identities and consistent username direction with a clean production build and a successful live response from the profile route.
- 2026-08-20: Replaced the decorative notification bell with a functional recent-activity popover backed by the existing groups REST endpoint; added loading, error, empty, count, close/backdrop, direct group links, accessible expanded state, entrance animation, desktop positioning, and a mobile full-width layout.
- 2026-08-20: Verified the functional notification popover with a clean production build and a successful live response from the authenticated application route.
- 2026-08-20: Fixed post-registration split editing by resetting percentage shares to an exact even 100% distribution when switching an existing expense to percentage mode, resetting manual amounts to the current expense total when switching to custom mode, recalculating safe defaults when participants change, showing a live Persian percentage total, and preventing save until the total is exactly 100%.
- 2026-08-20: Kept participant-change recalculation as a direct beginner-style state update so selected members and their new percentage or custom defaults stay synchronized without nested state effects.
- 2026-08-20: Added REST integration coverage that edits a registered equal expense to a 25/75 percentage split, verifies the saved percentages, and confirms the outstanding balance is recalculated correctly after an earlier partial settlement.
- 2026-08-20: Final post-registration percentage-edit verification passed with all five backend tests and a clean production frontend build.
- 2026-08-20: Replaced the remaining non-semantic forest-green text and icon colors, including the default body color, with coordinated plum, purple, and lavender shades across the sidebar, forms, cards, search, profile, group, and mobile navigation; retained green only for meaningful positive and success states and red for errors and destructive actions.
- 2026-08-20: Verified the purple typography cleanup with a clean production frontend build and a successful live response from the profile route.
- 2026-08-20: Replaced the green default group-card banner with a soft purple banner and light radial highlight so groups without uploaded cover images match the current violet theme.
- 2026-08-20: Verified the purple default group banner with a clean production frontend build and a successful live response from the dashboard route.
- 2026-08-20: Replaced the old green divider above the sidebar user controls with a muted purple divider matching the deep-plum navigation background.
- 2026-08-20: Verified the sidebar-divider color update with a clean production frontend build and a successful live response from the dashboard route.
- 2026-08-20: Added a clear red hover and keyboard-focus state to the sidebar logout button, with a short color transition and subtle directional movement while preserving its normal lavender color.
- 2026-08-20: Verified the logout hover-state update with a clean production frontend build and a successful live response from the dashboard route.
- 2026-08-20: Replaced the top navigation bar's green-tinted translucent background and divider with a soft lilac-white surface and pale purple divider matching the current theme.
- 2026-08-20: Verified the top-navigation color update with a clean production frontend build and a successful live response from the dashboard route.
- 2026-08-20: Replaced the green-tinted friend-invitation guide card on the new-group page with a very light lavender surface while keeping the white inner tip card distinct.
- 2026-08-20: Verified the new-group invitation-card color update with a clean production frontend build and a successful live response from the group-creation route.
- 2026-08-20: Redesigned the profile summary card with a white-to-lilac surface, removed the remaining green fact-row backgrounds, centered and enlarged the username in a purple pill, added a polished hover lift and shadow, animated the avatar and username, and gave each fact row and icon its own subtle hover response with reduced-motion support.
- 2026-08-20: Verified the redesigned profile summary card with a clean production frontend build and a successful live response from the profile route.
- 2026-08-20: Added a durable `friendInvitations` JSON collection and REST endpoints that create one secure random personal invite link per user, provide a public inviter preview, and let an authenticated visitor accept the link; acceptance creates one mutual friendship, stays idempotent, blocks self-invitation, validates inviter existence, and resolves any pending request between the same pair.
- 2026-08-20: Added a Persian “دعوت به سایت” card to the friends page with automatic personal-link loading, read-only link field, clipboard feedback, responsive purple styling, and a public friend-invitation page that previews the inviter and supports login, registration, self-link handling, acceptance, and direct return to the refreshed friends list.
- 2026-08-20: Preserved friend invitation codes in session storage across login and registration, giving friend invites priority over a stale group invite and clearing the stored code after acceptance, invalid-link detection, or self-link detection.
- 2026-08-20: Extended the REST integration flow with a third account to verify personal friend-link creation, public inviter previews, self-invite rejection, successful acceptance, idempotent repeated acceptance, visibility in the invited user's friend list, one invitation per inviter, and exactly one stored friendship for the invited pair.
- 2026-08-20: Made authenticated friend-link acceptance automatic after login or registration, guarded duplicate client submissions, kept a retry action for temporary failures, and redirected successful visitors directly to the friends page.
- 2026-08-20: Final friend-invitation verification passed with all five backend tests, a clean production frontend build, a successful live friends-page response, and the new public invite API active in the running backend.
- 2026-08-20: Made existing group invitation links complete automatic onboarding: anonymous visitors keep the group code through registration or login, authenticated visitors join automatically with duplicate client submissions guarded, successful joins open the invited group directly, invalid codes are cleared from session storage, and temporary join errors retain a retry action.
- 2026-08-20: Expanded the REST integration flow to verify public group-invite preview, authenticated invitation joining, idempotent repeated joining, exactly one membership record, real invited-member access, and invitation-member cleanup after group deletion.
- 2026-08-20: Aligned the new group-invitation membership assertion with the existing nested `group.members` REST response shape.
- 2026-08-20: Updated group creation and management copy to clearly label the group invitation link and explain that recipients join automatically after registration or login.
- 2026-08-20: Final automatic group-invitation verification passed with all five backend tests, a clean production frontend build, a successful live group-creation response, and the public group-invitation API active in the running backend.
- 2026-08-20: Made the dashboard receivable and debt icons accessible interactive buttons that open matching-currency detail modals, list every nonzero group balance with group navigation and formatted amounts, animate on hover and keyboard focus, and show the requested Persian empty messages «بدهیات صاف شده» and «خیالت راحت شد؟» when their lists are empty.
- 2026-08-20: Verified the dashboard debt-and-receivable detail modals with a clean production frontend build and a successful live dashboard response.
- 2026-08-20: Kept newly created groups on the creation page long enough to show an immediate success state and the group's real invitation link inside the side panel; added copy feedback, manual-selection fallback, direct group entry, member-management access, responsive purple styling, and automatic-join explanation without allowing an accidental duplicate group submission.
- 2026-08-20: Verified the creation-page group invitation handoff with a clean production frontend build and a successful live response from the new-group route.
- 2026-08-20: Added the persistent `bringItems` JSON collection and protected nested group REST endpoints for listing, creating, completing, reopening, and deleting “who brings what” assignments; validated selected members, limited deletion to the creator or group admin, recorded relevant group activity, and included assignment cleanup in full group deletion.
- 2026-08-20: Enlarged the sidebar «فضای کار» label and added a new «کی چی بیاره؟» navigation item immediately before profile on desktop and mobile, with a dedicated responsive purple page for choosing a group, assigning a supply or task to a member, marking it ready, reopening it, and deleting permitted entries.
- 2026-08-20: Connected the new assignment page to the nested group REST API with JSON persistence, loading and empty states, member-aware controls, permission-aware deletion, and integration coverage for invalid members, listing, completion, unauthorized deletion, creator deletion, and group cleanup.
- 2026-08-20: Final «کی چی بیاره؟» verification passed with all five backend tests, a clean production frontend build, and successful live responses from the new frontend route and backend health endpoint.
- 2026-08-20: Corrected completed-item visuals in «کی چی بیاره؟» with a dedicated centered strike line sized to the item title and a padding-free centered check icon; simplified generated profile avatars to one clear first-name letter so Persian initials no longer join into a misleading word.
- 2026-08-20: Verified the strike-line, check alignment, and Persian avatar-letter fixes with a clean production frontend build and a successful live response from the assignment route.
- 2026-08-20: Fixed the remaining off-center assignment avatar letter by restricting the responsible-person flex style to its direct text row and explicitly restoring grid centering, zero padding, centered text, and compact line height on the nested avatar.
- 2026-08-20: Verified the final assignment-avatar centering correction with a clean production frontend build and a successful live assignment-page response.
- 2026-08-20: Changed the dashboard group collection from a wrapping multi-row grid to a single horizontal scroll row, keeping new groups from extending the page downward; added snap alignment, a themed visible scrollbar, three-card desktop, two-card tablet, and one-card mobile sizing.
- 2026-08-20: Verified the horizontally scrolling dashboard group row with a clean production frontend build and a successful live dashboard response.
- 2026-08-20: Removed the visible dashboard group scrollbar and added desktop pointer drag-to-scroll with grab/grabbing cursor feedback, temporary snap release while dragging, preserved native touch scrolling, and click suppression after an actual drag so group links do not open accidentally.
- 2026-08-20: Verified the hidden-scrollbar drag interaction with a clean production frontend build and a successful live dashboard response.
- 2026-08-20: Reverted the dashboard group carousel to the requested visible purple scrollbar, removing the pointer-drag handlers, grab cursor, click suppression, and hidden-scrollbar rules while preserving the one-row responsive card layout.
- 2026-08-20: Verified the restored visible-scrollbar group row with a clean production frontend build and a successful live dashboard response.
- 2026-08-20: Added a protected settlement-update REST endpoint with existing-party and new-party authorization, group-member checks, positive integer-cent validation, note limits, debt-cap recalculation that temporarily excludes the edited payment, updated timestamps, and group activity recording.
- 2026-08-20: Made settlement-history rows interactive and added a responsive Persian payment-details modal showing status, amount, payer, receiver, date, and note; authorized parties can switch to an edit form for both people, amount, date, and note, with refreshed balances after saving.
- 2026-08-20: Extended REST integration coverage for settlement editing to prove unrelated members are rejected, authorized edits persist amount, date, and note, balances recalculate, and overpayment edits are blocked against the pre-payment debt.
- 2026-08-20: Final settlement detail/edit verification passed with all five backend tests, a clean production frontend build, and successful live frontend group-route and backend health responses.
- 2026-08-20: Reduced and standardized the settlement-history «تکمیل‌شده» badge with a compact fixed column, explicit small font, centered 23-pixel height, narrower padding, and no wrapping so it remains proportional beside the payment amount.
- 2026-08-20: Verified the compact settlement-status badge with a clean production frontend build and a successful live group-page response.
- 2026-08-20: Added a protected global settlement-history endpoint that derives the current user's allowed groups from server-side memberships and returns only their payment records with normalized currency plus group, payer, and receiver details.
- 2026-08-20: Added a «تسویه‌ها» sidebar item and protected route with a responsive purple global-history page showing every accessible group payment, people, group, note, date, and amount; each row opens that group's settlement tab, while the five-item mobile bottom bar stays uncluttered.
- 2026-08-20: Extended REST integration coverage for the global settlement history with anonymous rejection, authenticated enriched records, visibility for group members, and automatic disappearance after group deletion.
- 2026-08-20: Final sidebar settlement-history verification passed with all five backend tests, a clean production frontend build, successful live frontend and backend responses, and a confirmed 401 response for unauthenticated global-history access.
- 2026-08-20: Fixed payment-detail avatar letters by separating the payer/receiver copy selector from nested avatar spans and added a higher-specificity global avatar rule for grid centering, zero padding, compact line height, and centered text to prevent the same contextual-style collision elsewhere.
- 2026-08-20: Verified the payment-detail avatar-centering correction with a clean production frontend build and a successful live settlement-tab response.
- 2026-08-20: Expanded server-side group permissions so every authenticated member can create, edit, or remove expenses, record or edit settlements between any members, remove bring-list entries, add eligible friends, remove non-manager members with settled balances, manage invitation links, and appoint the display manager; full group deletion remains restricted to the stable owner.
- 2026-08-20: Matched the frontend to shared member permissions by showing expense edit/delete, settlement edit, and bring-item delete controls to every group member instead of only creators, payment parties, or managers.
- 2026-08-20: Opened group invitation, eligible-friend addition, non-manager member removal, balance settlement, and display-manager controls to every member in group management; kept full deletion visible only to the stable owner so changing the manager cannot transfer deletion permission.
- 2026-08-20: Expanded integration coverage to prove ordinary members can regenerate and disable invitations, appoint the display manager without changing the owner, create a settlement between other people, edit and delete another member's expense, edit another payment, delete another bring item, and remove a settled non-manager member, while owner removal and full group deletion by another member stay blocked.
- 2026-08-20: Final shared-member permission verification passed with all five backend tests, a clean production frontend build, and successful live frontend and backend responses.
- 2026-08-20: Separated permanent deletion ownership from the changeable group manager by adding `ownerId` to new groups and lazy-backfilling legacy groups during manager transfer; all members can now transfer the display manager without gaining delete permission, while the owner and active manager are protected from removal or unsafe departure.
- 2026-08-20: Updated group management UI so every member can appoint the display manager, while the destructive group-deletion section follows stable ownership rather than the current manager; owner and current-manager removal/leave controls stay guarded to preserve a valid group.
- 2026-08-20: Final all-member capability verification passed with all five backend tests, including successful manager appointment by an ordinary member without changing `ownerId`, a clean production frontend build, and successful live frontend and backend health responses.
- 2026-08-20: Replaced the profile page's plain saved-message strip with a responsive purple floating toast containing a confirmation icon, supporting copy, soft entrance and exit motion, a timed progress line, automatic dismissal, and reduced-motion support; the same polished feedback also covers successful password updates.
- 2026-08-20: Verified the animated profile-success toast with a clean production frontend build and a successful live profile-page response.
- 2026-08-20: Reordered navigation by task relevance: overview first, then financial settlements and the shared bring list, followed by friends and group creation, with profile kept last; the mobile navigation inherits the same relative order for its visible items.
- 2026-08-20: Verified the task-based navigation order with a clean production frontend build and a successful live settlements-page response.
- 2026-08-20: Moved the «کی چی بیاره؟» navigation item to the penultimate position, immediately before profile, in both the desktop sidebar and the relative order of visible mobile items.
- 2026-08-20: Verified the final penultimate bring-list navigation position with a clean production frontend build and a successful live bring-list response.
- 2026-08-20: Replaced the bring-list assignee's native select with a polished custom purple member picker showing avatar, full name, username, selected-state checkmark, animated opening, outside-click and Escape closing, keyboard focus styling, and reduced-motion support.
- 2026-08-20: Verified the custom bring-list member picker with a clean production frontend build and a successful live bring-list response.
- 2026-08-20: Added a reusable custom purple selection component with animated menus, selected checkmarks, secondary option details, outside-click and Escape closing, keyboard focus states, disabled handling, and reduced-motion support; replaced every remaining native frontend select, covering group choice, group currency, expense payer, and settlement payer/receiver.
- 2026-08-20: Confirmed no native JSX select elements remain, then verified the unified selection system with a clean production frontend build and successful live responses from the bring-list, new-group, and settlements routes.
- 2026-08-20: Replaced the shared site logo asset with the supplied transparent purple mark, removed the old green logo background, slightly increased its display size, added a restrained shadow for dark surfaces, and registered the same artwork as the browser favicon and Apple touch icon with a cache-busting URL.
- 2026-08-20: Updated every shared, loading, authentication, and invitation logo reference to the cache-busted asset; verified an exact source/target file hash match, a clean production frontend build, the full new logo byte size from the live server, and a successful live home-page response.
- 2026-08-20: Added a crisp one-pixel white raster outline around the shared transparent purple logo, followed by a restrained dark shadow, so the mark stays distinct on purple and other dark backgrounds; intentionally left the incorrect authentication brand name unchanged pending the user's exact replacement text.
- 2026-08-20: Verified the white logo-outline styling with a clean production frontend build and a successful live home-page response.
- 2026-08-20: Corrected the authentication-page brand text beside the new logo from the accidental «دن» label to the supplied official name «فیرشِر», matching the sidebar and invitation branding.
- 2026-08-20: Verified the corrected authentication branding with a clean production frontend build and a successful live login-page response.
- 2026-08-21: Diagnosed the local site's unreachable state as both development services being stopped, restarted the combined root development command, rebuilt and served the frontend on port 4173, restarted the API on port 4000, and confirmed successful HTTP 200 responses from both the login page and backend health endpoint.

## Next work

The requested first version is implemented. Future work should preserve integer-cent calculations, server-side authorization, separate expense and settlement records, serialized JSON writes, and this change log.
