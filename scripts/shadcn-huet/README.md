The shadcn demo uses the upstream revision pinned in `vendor/shadcn-ui`.
Run `git submodule update --init vendor/shadcn-ui`, then `pnpm shadcn:setup`
and `pnpm shadcn:dev`.

Setup applies `integration.patch`, copies the canonical `huet-configurator.tsx`
into the vendor app, builds and packs the local Huet packages, installs them,
and generates the shadcn registry. The patch includes the baseline Huet surface
and chart integration plus the home-page QR SVG opt-in. It is safe to rerun on
an already patched checkout. Local vendor edits are not stored in the gitlink;
update the patch or canonical configurator to preserve integration changes.
