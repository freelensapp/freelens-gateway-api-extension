# @freelensapp/gateway-api-extension

<!-- markdownlint-disable MD013 -->

[![Home](https://img.shields.io/badge/%F0%9F%8F%A0-freelens.app-02a7a0)](https://freelens.app)
[![GitHub](https://img.shields.io/github/stars/freelensapp/freelens?style=flat&label=GitHub%20%E2%AD%90)](https://github.com/freelensapp/freelens)
[![DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/freelensapp/freelens-gateway-api-extension)
[![Release](https://img.shields.io/github/v/release/freelensapp/freelens-gateway-api-extension?display_name=tag&sort=semver)](https://github.com/freelensapp/freelens-gateway-api-extension)
[![Integration tests](https://github.com/freelensapp/freelens-gateway-api-extension/actions/workflows/integration-tests.yaml/badge.svg?branch=main)](https://github.com/freelensapp/freelens-gateway-api-extension/actions/workflows/integration-tests.yaml)
[![npm](https://img.shields.io/npm/v/@freelensapp/gateway-api-extension.svg)](https://www.npmjs.com/package/@freelensapp/gateway-api-extension)

<!-- markdownlint-enable MD013 -->

## WARNING

Work in progress! This extension is not yet completed and useful.

This extension adds a support for [Gateway
API](https://gateway-api.sigs.k8s.io/) to the [Freelens](https://freelens.app)
application.

## Requirements

- Kubernetes >= 1.26
- Freelens >= 1.8.0

## Install

To install open Freelens and go to Extensions (`ctrl`+`shift`+`E` or
`cmd`+`shift`+`E`), and install `@freelensapp/gateway-api-extension`.

or:

Use a following URL in the browser:
[freelens://app/extensions/install/%40freelensapp%2Fgateway-api-extension](freelens://app/extensions/install/%40freelensapp%2Fgateway-api-extension)

## Build from the source

You can build the extension using this repository.

### Prerequisites

Use [NVM](https://github.com/nvm-sh/nvm) or
[mise-en-place](https://mise.jdx.dev/) or
[windows-nvm](https://github.com/coreybutler/nvm-windows) to install the
required Node.js version.

From the root of this repository:

```sh
nvm install
# or
mise install
# or
winget install CoreyButler.NVMforWindows
nvm install 22.22.1
nvm use 22.22.1
```

Install Pnpm:

```sh
corepack install
# or
curl -fsSL https://get.pnpm.io/install.sh | sh -
# or
winget install pnpm.pnpm
```

### Build extension

```sh
pnpm i
pnpm build
pnpm pack
```

One script to build then pack the extension to test:

```sh
pnpm pack:dev
```

### Install built extension

The tarball for the extension will be placed in the current directory. In
Freelens, navigate to the Extensions list and provide the path to the tarball
to be loaded, or drag and drop the extension tarball into the Freelens window.
After loading for a moment, the extension should appear in the list of enabled
extensions.

### Check code statically

```sh
pnpm lint:check
```

or

```sh
pnpm trunk:check
```

and

```sh
pnpm build
pnpm knip:check
```

### Testing the extension with unpublished Freelens

In Freelens working repository:

```sh
rm -f *.tgz
pnpm i
pnpm build
pnpm pack -r
```

then for extension:

```sh
echo "overrides:" >> pnpm-workspace.yaml
for i in ../freelens/*.tgz; do
  name=$(tar zxOf $i package/package.json | yq -r .name)
  echo "  \"$name\": $i" >> pnpm-workspace.yaml
done

pnpm clean:node_modules
pnpm build
```

## License

Copyright (c) 2025-2026 Freelens Authors.

[MIT License](https://opensource.org/licenses/MIT)
