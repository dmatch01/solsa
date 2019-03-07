# SolSA

The SolSA programming model is intended to ease the _development_, _deployment_,
and _integration_ of cloud-native services and applications. SolSA makes it
possible to compose existing services (cloud services, cloud functions,
container-based services) into new micro-services and applications.

A SolSA service is defined by means of a Node.js module. From this code, SolSA
builds and publishes the service as a container image, prepares the deployment
of the service and its dependencies as a Helm chart and produces an SDK for
instantiating and invoking the service.

SolSA leverages Kubernetes operators to manage the life cycle of services both
inside and outside of Kubernetes. SolSA can target a standard Kubernetes cluster
or a KNative cluster.

The SolSa source code includes declarations for the service being composed over
as well as configuration parameters. SolSA leverages these declarations to
construct a complete chart including not only the service instance but also its
transitive dependencies, as well as the configurations of all the services
involved.

Service APIs are defined by means of Javascript function declarations. Service
invocations are just function calls. SolSA relieves the developer from having to
worry about REST APIs, routes, containers, etc.

## Components

SolSA consists of:
- A main `solsa` module that defines the basic architecture and capabilities of
  a SolSA service.
- Helper modules like the `watson` module that make it easier to leverage
  existing IBM cloud services.
- Helper tools:
  - `solsa-build` builds a container image for a given SolSA service.
  - `solsa-chart` synthesizes a Helm chart for deploying a SolSA service and
    its dependencies.
  - `solsa-name` is used to ensure consistent naming of container images.
  - `solsa-serve` starts a local server implementing a given SolSa service.

## Configure a Kubernetes Cluster for SolSA

### Cluster-wide Setup

1. Install SEED (Follow the instructions at https://github.ibm.com/seed/charts)

2. Optionally install KNative (For IKS, follow the instructions at
   https://cloud.ibm.com/docs/containers?topic=containers-knative_tutorial#knative_tutorial)

### Per Namespace Setup

1. Create an image pull secret for the IBM Container Registry

2. Edit the namespace's default service account to add the secret to the list of
   imagePullSecrets

## Local Setup

1. Configure access to the Kubernetes cluster (`KUBECONFIG`)

2. Retrieve the cluster ingress subdomain an secret and export them as
   environment variables `CLUSTER_INGRESS_SUBDOMAIN` and
   `CLUSTER_INGRESS_SECRET`

3. Login to the IBM container registry and export the registry name as
   environment variable `REGISTRY`

4. Clone and initialize this repository
```
git clone https://github.ibm.com/solsa/solsa.git
cd solsa
npm install
npm link
```

## Examples

The [solsa-examples](https://github.ibm.com/solsa/solsa-examples) repository
collects examples of SolSA services.
