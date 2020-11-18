#!/usr/bin/env node
import { name } from "../package.json";
import { AlfEc2Stack } from "./alf-ec2-stack";
import { SecretValue } from "@aws-cdk/core";

import { PipelineApp, PipelineAppProps } from "cdk-pipeline-app/pipeline-app";

const pipelineAppProps: PipelineAppProps = {
  branch: "master",
  repositoryName: name,
  stageAccounts: [
    {
      account: {
        id: "981237193288",
        region: "eu-central-1",
      },
      stage: "dev",
    },
    {
      account: {
        id: "981237193288",
        region: "us-east-1",
      },
      stage: "prod",
    },
  ],
  buildAccount: {
    id: "981237193288",
    region: "eu-central-1",
  },
  gitHub: {
    owner: "mmuller88",
    oauthToken: SecretValue.secretsManager("alfcdk", {
      jsonField: "muller88-github-token",
    }),
  },
  customStack: (scope, stageAccount) => {
    return new AlfEc2Stack(scope, `${name}-${stageAccount.stage}`, {
      env: {
        account: stageAccount.account.id,
        region: stageAccount.account.region,
      },
      gitRepo: process.env.gitRepo || "alfresco-ocr",
      stackName: process.env.stackName || `itest123`,
      stage: stageAccount.stage,
    });
  },
  testCommands: (stageAccount) => [
    `aws ec2 get-console-output --instance-id $InstanceId --region ${stageAccount.account.region} --output text`,
    "sleep 180",
    `curl -Ssf $InstancePublicDnsName && aws cloudformation delete-stack --stack-name itest123 --region ${stageAccount.account.region}`,
  ],
};

// tslint:disable-next-line: no-unused-expression
new PipelineApp(pipelineAppProps);
