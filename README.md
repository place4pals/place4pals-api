# <img src="https://place4pals.com/favicon.png" style="width:50px;margin-bottom:-10px;" /> place4pals API

**place4pals-api** is a proprietary and closed-source Node.js Lambda API for place4pals, a non-profit social media platform. This README provides an overview of the project and instructions for building and deploying the API.

## Overview

This repository contains the source code for the place4pals-api, a serverless API built using Node.js and AWS Lambda. The API provides various functionalities to support the place4pals service, including integrations with third-party services such as OpenAI, Typesense, and Stripe.

## Prerequisites

Before you can build and deploy the API, ensure that you have the following prerequisites installed:

- Node.js (version specified in the project's `package.json` file)
- yarn (package manager)
- AWS CLI (configured with the appropriate credentials)

## Installation

1. Clone the repository:

   ```
   git clone https://github.com/place4pals/place4pals-api.git
   ```

2. Navigate to the project directory:

   ```
   cd place4pals-api
   ```

3. Install the dependencies:

   ```
   yarn install
   ```

## Building and Deploying

The `package.json` file includes several scripts for building and deploying the API to different environments:

- `yarn build:prod`: Builds and deploys the API to the production environment.
- `yarn build:staging`: Builds and deploys the API to the staging environment.
- `yarn build`: Runs all the above scripts in sequence, building and deploying the API to all environments.

To build and deploy the API, run the appropriate script(s) from the project root directory. For example, to deploy to the production environment, run:

```
yarn build:prod
```
