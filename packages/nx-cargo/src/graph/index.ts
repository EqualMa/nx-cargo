import * as path from 'path';

import {
  ProjectGraph,
  ProjectGraphBuilder,
  ProjectGraphProcessorContext,
  normalizePath,
} from '@nrwl/devkit';
import execa from 'execa';

import * as cargo from '../common/cargo';

/**
 * Assert `pkgName` is also the nx project name.
 */
function assertCargoPackageNameIsNxProject(
  ctx: ProjectGraphProcessorContext,
  pkgName: string
) {
  const files = ctx.fileMap[pkgName];

  if (!files) {
    throw new Error(
      `${pkgName} is a package in cargo workspace but not a project in nx workspace.`
    );
  }
  return files;
}

export async function processProjectGraph(
  graph: ProjectGraph,
  ctx: ProjectGraphProcessorContext
): Promise<ProjectGraph> {
  const builder = new ProjectGraphBuilder(graph);

  let metadata: cargo.Metadata;

  {
    const { stdout } = await execa('cargo', [
      // https://doc.rust-lang.org/cargo/commands/cargo-metadata.html
      'metadata',
      '--no-deps',
      '--format-version=1',
    ]);
    const metadataInput = JSON.parse(stdout);

    metadata = cargo.Metadata.parse(metadataInput);
  }

  const {
    packages,
    workspace_members: workspaceMembers,
    workspace_root: workspaceRoot,
  } = metadata;

  const localPackages = workspaceMembers
    .map((id) => packages.find((pkg) => pkg.id === id))
    .filter(
      (pkg): pkg is cargo.Package => !!pkg && Reflect.has(ctx.fileMap, pkg.name)
    );

  const localPackageNames = new Set(localPackages.map((m) => m.name));

  for (const pkg of localPackages) {
    const cargoToml = normalizePath(
      path.relative(workspaceRoot, pkg.manifest_path)
    );

    {
      const files = assertCargoPackageNameIsNxProject(ctx, pkg.name);

      // assert Cargo.toml is included in nx file map.
      if (!files.some((data) => normalizePath(data.file) === cargoToml)) {
        throw new Error(
          `Cargo.toml of ${pkg.name} is not included in nx project file map. This is probably a bug.`
        );
      }
    }

    for (const dep of pkg.dependencies) {
      if (!dep.path) {
        // it is a cargo dependency
        continue;
      }

      if (dep.kind) {
        // skip dev or build deps
        continue;
      }

      // assert the dep is a package in cargo workspace.
      if (!localPackageNames.has(dep.name)) {
        throw new Error(
          `${dep.name} is a local dependency of ${pkg.name}, but not included in the cargo workspace.`
        );
      }

      // assert the dep is a project in nx workspace.
      assertCargoPackageNameIsNxProject(ctx, dep.name);

      builder.addExplicitDependency(pkg.name, cargoToml, dep.name);
    }
  }

  return builder.getUpdatedProjectGraph();
}
