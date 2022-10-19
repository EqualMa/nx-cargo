/**
 * See https://doc.rust-lang.org/cargo/commands/cargo-metadata.html
 */

import { z } from 'zod';

export const DependencyKind = z.union([
  z.literal('dev'),
  z.literal('build'),
  z.null(),
]);
export type DependencyKind = z.infer<typeof DependencyKind>;

export const Dependency = z.object({
  name: z.string(),
  kind: DependencyKind,
  path: z.string().optional(),
});
export type Dependency = z.infer<typeof Dependency>;

export const Package = z.object({
  name: z.string(),
  id: z.string(),
  dependencies: z.array(Dependency),
  manifest_path: z.string(),
});
export type Package = z.infer<typeof Package>;

export const Metadata = z.object({
  packages: z.array(Package),
  workspace_members: z.array(z.string()),
  workspace_root: z.string(),
});
export type Metadata = z.infer<typeof Metadata>;
