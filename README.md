# @freelensapp/gateway-api-extension

<!-- markdownlint-disable MD013 -->

[![Home](https://img.shields.io/badge/%F0%9F%8F%A0-freelens.app-02a7a0)](https://freelens.app)
[![GitHub](https://img.shields.io/github/stars/freelensapp/freelens?style=flat&label=GitHub%20%E2%AD%90)](https://github.com/freelensapp/freelens)
[![DeepWiki](https://deepwiki.com/badge.svg)](https://deepwiki.com/freelensapp/freelens-gateway-api-extension)
[![Release](https://img.shields.io/github/v/release/freelensapp/freelens-gateway-api-extension?display_name=tag&sort=semver)](https://github.com/freelensapp/freelens-gateway-api-extension)
[![Integration tests](https://github.com/freelensapp/freelens-gateway-api-extension/actions/workflows/integration-tests.yaml/badge.svg?branch=main)](https://github.com/freelensapp/freelens-gateway-api-extension/actions/workflows/integration-tests.yaml)
[![npm](https://img.shields.io/npm/v/@freelensapp/gateway-api-extension.svg)](https://www.npmjs.com/package/@freelensapp/gateway-api-extension)

<!-- markdownlint-enable MD013 -->

## Overview

This extension adds support for the
[Kubernetes Gateway API](https://gateway-api.sigs.k8s.io/) to
[Freelens](https://freelens.app). The Gateway API is an official Kubernetes
project that provides expressive, extensible, and role-oriented interfaces
for service networking, designed as the successor to the Ingress API.

The extension provides cluster pages, list views, and detail panels for all
standard and experimental Gateway API resources across the
`gateway.networking.k8s.io` and `gateway.networking.x-k8s.io` API groups.
Each resource is accessible from the Freelens sidebar, with status
conditions, spec fields, and related objects displayed in the detail view.

## Requirements

- Kubernetes >= 1.26
- Freelens >= 1.8.0
- Gateway API CRDs installed in the cluster (see the [Gateway API installation guide](https://gateway-api.sigs.k8s.io/guides/))

## Supported APIs

### gateway.networking.k8s.io

<!-- markdownlint-disable MD013 -->

| API Version | Kind | Short Name | Scope | Description |
| --- | --- | --- | --- | --- |
| v1 | `GatewayClass` | `gc` | Cluster | Defines a class of Gateways sharing a common controller |
| v1 | `Gateway` | `gtw` | Namespaced | Describes an instance of a service-traffic handling infrastructure |
| v1 | `HTTPRoute` | | Namespaced | Routes HTTP and HTTPS traffic to backends |
| v1 | `GRPCRoute` | | Namespaced | Routes gRPC traffic to backends |
| v1 | `TLSRoute` | | Namespaced | Routes TLS traffic to backends based on SNI |
| v1 | `BackendTLSPolicy` | `btlspolicy` | Namespaced | Configures TLS for connections from a Gateway to backends |
| v1 | `ReferenceGrant` | `refgrant` | Namespaced | Allows cross-namespace references to Gateway API resources |
| v1 | `ListenerSet` | `lset` | Namespaced | Extends a Gateway with additional listeners |
| v1alpha2 | `TCPRoute` | | Namespaced | Routes TCP traffic to backends |
| v1alpha2 | `UDPRoute` | | Namespaced | Routes UDP traffic to backends |
| v1beta1 | `ReferenceGrant` | `refgrant` | Namespaced | Allows cross-namespace references (v1beta1 variant) |

<!-- markdownlint-enable MD013 -->

### gateway.networking.x-k8s.io

Experimental APIs from the Kubernetes SIG Network incubation group.

<!-- markdownlint-disable MD013 -->

| API Version | Kind | Short Name | Scope | Description |
| --- | --- | --- | --- | --- |
| v1alpha1 | `XBackendTrafficPolicy` | `xbtrafficpolicy` | Namespaced | Configures backend traffic policies such as retry budgets and session persistence |
| v1alpha1 | `XMesh` | `mesh` | Cluster | Describes a service mesh implementation |

<!-- markdownlint-enable MD013 -->

## Install

To install, open Freelens and go to Extensions (`ctrl`+`shift`+`E` or `cmd`+`shift`+`E`),
then search for and install `@freelensapp/gateway-api-extension`.

Alternatively, open the following URL in the browser to install directly:

[freelens://app/extensions/install/%40freelensapp%2Fgateway-api-extension](freelens://app/extensions/install/%40freelensapp%2Fgateway-api-extension)

## Build from the source

You can build the extension from this repository.

### Prerequisites

Use [NVM](https://github.com/nvm-sh/nvm),
[mise-en-place](https://mise.jdx.dev/), or
[windows-nvm](https://github.com/coreybutler/nvm-windows) to install the
required Node.js version.

From the root of this repository:

```sh
nvm install
# or
mise install
# or
winget install CoreyButler.NVMforWindows
nvm install 24.15.0
nvm use 24.15.0
```

Install pnpm:

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

One script to build and pack the extension for testing:

```sh
pnpm pack:dev
```

### Install built extension

The tarball will be placed in the current directory. In Freelens, navigate
to the Extensions page and provide the path to the tarball, or drag and
drop the `.tgz` file into the Freelens window.

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

In the Freelens working repository:

```sh
rm -f *.tgz
pnpm i
pnpm build
pnpm pack -r
```

Then in the extension repository:

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
