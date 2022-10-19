# nx-cargo

This library was generated with [Nx](https://nx.dev).

## Usage

`nx-cargo` is a plugin to make nx work with cargo workspace.

The following features are implemented or planned:

- Project Inference
  - [x] No need for `project.json`, subdirectories with `Cargo.toml` will be inferred as a nx project.
  - [ ] Planned: auto setup common targets for cargo packages.
    - [ ] check
    - [ ] build
    - [ ] test
    - [ ] clippy
  - [ ] Planned: allow developers to use `package.metadata` to configure targets.
- Dependency graph
  - [x] Local dependencies are added to the graph.
    - [ ] Currently `dev-dependencies` and `build-dependencies` are ignored. An option is planned to change this behavior.

To use `nx-cargo`, just install it and add the following line to `nx.json`.

```sh
yarn add --dev nx-cargo
```

```json
{
  "plugins": ["nx-cargo"]
}
```

## Building

Run `npx nx build nx-cargo` to build the library.

## Running unit tests

Run `npx nx test nx-cargo` to execute the unit tests via [Jest](https://jestjs.io).
