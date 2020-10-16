---
title: "warbler"
date: "2020-10-16"
tags: projects, aws, cloud
---

# warbler

[Warbler](https://github.com/ANorwell/warbler) is an AWS lambda-based chat service, managed by Terraform.

Warbler is a toy project using AWS serverless primitives to build a small chat service. Processing is handled by lambda functions, DynamoDB is used for storage, and static frontend assets are hosted on S3. It provides the ability for users to chat

All AWS resources are defined as terraform configuration files.

## Diagram
```
+-----------+        +-----------+                          +---------+       +-----------+
|           |        |           |    +-------------+       |         |       |           |
| Frontend  |        | Read/Write+---->     SNS     +-------> Writer  +------->           |
|           +------->+    API    |    +-------------+       |         |       |   Store   |
|           |        |           |                          |         |       | (DynamoDB)|
+-----------+        +-----------+                          +---------+       |           |
                                 |                                            |           |
                                 +------------------------------------------->+-----------+
                                                    Reads
 ```

## Shortcomings

This was primarily a project to experiment with Terraform and composing AWS resources. This project is in a place where the various components _could_ be expanded to support more functionality, but do not. Some extensions that are not implemented but would be interesting:
- Better configuration and support for multiple environments. Currently, there are multiple places with hardcoded endpoints, which would have to become configurable to support multiple environments. Terraform has [terragrunt](https://terragrunt.gruntwork.io/) to help solve this problem, but the services need a better solution for endpoint discovery or configuration.
- Better development workflow. One thing I wanted to investigate with this project was what the development workflow in a serverless environment was like. I followed a workflow where the development environment lived in the cloud, and every code change required a deploy. This deploy process was relatively fast, but it is not as good as localhost-based web development, and it seems like there would be a large amount of parallel work needed to get this environment running outside of the cloud. 
- Better chat features. Lambda supports websockets, which would enable real-time conversations. And while warbler supports multiple conversations, there's no directory of conversations, or otherwise ways to discover which conversations might exist.

## Deployment

`terraform apply`, after configuring aws-cli appropriately. If lambdas change, run `make` to re-package them.

To create a new environment, a few things are needed:

1. Bucket names are globally unique, and so must be changed.
2. The provisioned SNS ARN and API endpoint must be added to the appropriate lambdas -- as per above, there is no configuration of these values.
