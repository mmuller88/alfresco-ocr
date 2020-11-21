#!/usr/bin/env node
import { name } from "../package.json";
import { AlfEc2Stack } from "./alf-ec2-stack";
import { SecretValue } from "@aws-cdk/core";
import { InstanceType, InstanceClass, InstanceSize } from "@aws-cdk/aws-ec2";

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
      stage: "dev", // used for running tests
    },
    {
      account: {
        id: "981237193288",
        region: "us-east-1", // used as production environment
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
      stackName: process.env.stackName || `alf-ocr-${stageAccount.stage}`,
      instanceType:
        stageAccount.stage === "prod"
          ? InstanceType.of(InstanceClass.T2, InstanceSize.XLARGE)
          : undefined,
      stage: stageAccount.stage,
    });
  },
  manualApprovals: (stageAccount) => stageAccount.stage === "prod",
  testCommands: (stageAccount) =>
    stageAccount.stage === "dev"
      ? [
          `sleep 240
    curl -Ssf $InstancePublicDnsName; RESULT=$?; aws ec2 get-console-output --instance-id $InstanceId --region ${stageAccount.account.region} --output text
    aws cloudformation delete-stack --stack-name alf-ocr-${stageAccount.stage} --region ${stageAccount.account.region}
    exit $RESULT`,
        ]
      : [],
};

// tslint:disable-next-line: no-unused-expression
new PipelineApp(pipelineAppProps);
