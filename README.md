# Javascript action: get matrix from changed files

Trying to find changed folders in push or pull request event. We filter files wich start with dot.

## Inputs

### `token`

**Required** github token, default GITHUB_TOKEN will be enough

### `folder`

Where do we have to search changes

### `exclude`

Which file names should we exclude from payload

## Outputs

### `matrix`

```json
{ "services": [] }
```

## Example usage with monorepo

If you have monorepository with services in root - omit folder name or set it to '.'

Repository folder structure in example action:

```shell
├── services/
│   ├── auth/
│   │   ├── index.js
│   │   └── blog/
│   │       ├── index.html
|   |           ... // changes were made
│   └── pizza/
│       └── index.js
|           ... // changes were made
├── tests/
│   ├── unittests
├── venv/
├── setup.py
└── MANIFEST.in
```

```yaml
on:
  pull_request:
    types:
      - opened
      - synchronize
      - closed

jobs:
  services:
    runs-on: ubuntu-latest
    outputs:
      matrix: ${{ steps.changes.outputs.matrix }}
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0
      - name: find changed services
        id: changes
        uses: CrusaderX/changes@v1.0.4
        with:
          folder: 'services'
          token: ${{ secrets.GITHUB_TOKEN }}

  tests:
    needs: [services]
    if: ${{ fromJSON(needs.services.outputs.matrix).services[0] }}
    runs-on: ubuntu-latest
    strategy:
      matrix: ${{ fromJson(needs.services.outputs.matrix) }}
      fail-fast: false
    steps:
      - run: |
          echo ${{ matrix.services }} was changed! # will output auth and pizza becase changes were made there
```