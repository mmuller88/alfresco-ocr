import {
  Vpc,
  MachineImage,
  AmazonLinuxStorage,
  AmazonLinuxVirt,
  AmazonLinuxEdition,
  AmazonLinuxGeneration,
  SecurityGroup,
  SubnetType,
  Peer,
  Port,
  InstanceType,
  InstanceProps,
  InstanceClass,
  InstanceSize,
  UserData,
  Instance,
} from "@aws-cdk/aws-ec2";
import { StackProps, CfnOutput, Construct } from "@aws-cdk/core";
import {
  ApplicationProtocol,
  ApplicationLoadBalancer,
} from "@aws-cdk/aws-elasticloadbalancingv2";
import { InstanceIdTarget } from "@aws-cdk/aws-elasticloadbalancingv2-targets";
import { CustomStack } from "cdk-pipeline-app/custom-stack";
import { ARecord, HostedZone, RecordTarget } from "@aws-cdk/aws-route53";
import { LoadBalancerTarget } from "@aws-cdk/aws-route53-targets";
// import { PolicyStatement } from '@aws-cdk/aws-iam';

export interface AlfEc2StackProps extends StackProps {
  gitRepo?: string;
  stage: string;
  stackName: string;
  // tags?: string[];
  // lb?: {
  //   certArn: string
  // },
  customDomain?: {
    hostedZoneId: string;
    domainName: string;
    certArn: string;
  };
}

export class AlfEc2Stack extends CustomStack {
  constructor(scope: Construct, id: string, props: AlfEc2StackProps) {
    super(scope, id, props);

    const amznLinux = MachineImage.latestAmazonLinux({
      generation: AmazonLinuxGeneration.AMAZON_LINUX,
      edition: AmazonLinuxEdition.STANDARD,
      virtualization: AmazonLinuxVirt.HVM,
      storage: AmazonLinuxStorage.GENERAL_PURPOSE,
    });

    const userData = `Content-Type: multipart/mixed; boundary="//"
MIME-Version: 1.0

--//
Content-Type: text/cloud-config; charset="us-ascii"
MIME-Version: 1.0
Content-Transfer-Encoding: 7bit
Content-Disposition: attachment; filename="cloud-config.txt"

#cloud-config
cloud_final_modules:
- [scripts-user, always]

--//
Content-Type: text/x-shellscript; charset="us-ascii"
MIME-Version: 1.0
Content-Transfer-Encoding: 7bit
Content-Disposition: attachment; filename="userdata.txt"

#!/bin/bash
echo "sudo halt" | at now + 55 minutes
yum -y install git
REPO=${props.gitRepo ? props.gitRepo : "alfresco-ocr"}
git clone https://@github.com/mmuller88/$REPO /usr/local/$REPO
cd /usr/local/$REPO
chmod +x init.sh && ./init.sh
sudo chmod +x start.sh && ./start.sh
sudo chown -R 33007 data/solr-data
sudo chown -R 999 logs
--//
  `;

    let instanceVpc = new Vpc(this, "VPC", {
      maxAzs: 2,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: "ingress",
          subnetType: SubnetType.PUBLIC,
        },
        // {
        //   cidrMask: 24,
        //   name: 'application',
        //   subnetType: ec2.SubnetType.PRIVATE,
        // },
        // {
        //   cidrMask: 28,
        //   name: 'rds',
        //   subnetType: ec2.SubnetType.ISOLATED,
        // }
      ],
    });

    const securityGroup = new SecurityGroup(this, "alfSecurityGroup", {
      vpc: instanceVpc,
      securityGroupName: `secg-${props.stackName}`,
    });

    const acsPort = 8080;

    securityGroup.addIngressRule(Peer.anyIpv4(), Port.tcp(acsPort));
    securityGroup.addIngressRule(Peer.anyIpv4(), Port.tcp(22));

    const instanceProps: InstanceProps = {
      machineImage: amznLinux,
      instanceType: InstanceType.of(InstanceClass.T2, InstanceSize.LARGE),
      keyName: "ec2dev",
      instanceName: props.stackName || "AlfrescoOcrInstance",
      vpc: instanceVpc,
      securityGroup,
      userData: UserData.forLinux({
        shebang: userData,
      }),
    };

    // console.debug("instanceProps: ", JSON.stringify(instanceProps));
    const instance = new Instance(this, "AlfCdkEc2Instance", instanceProps);

    const lb = new ApplicationLoadBalancer(this, "LB", {
      vpc: instanceVpc,
      internetFacing: true,
      securityGroup,
    });

    let listener;

    if (props.customDomain) {
      listener = lb.addListener("Listener", {
        protocol: ApplicationProtocol.HTTPS,
        port: 443,
        certificateArns: [props.customDomain.certArn || ""],
      });

      const zone = HostedZone.fromLookup(this, "Zone", {
        domainName: props.customDomain.domainName,
      });

      // tslint:disable-next-line: no-unused-expression
      const record = new ARecord(this, "InstanceAliasRecord", {
        recordName: `${props.stackName}.${props.customDomain.domainName}`,
        target: RecordTarget.fromAlias(new LoadBalancerTarget(lb)),
        zone,
      });

      const customInstanceUrl = new CfnOutput(this, "CustomInstanceUrl", {
        value: record.domainName,
      });
      this.cfnOutputs["CustomInstanceUrl"] = customInstanceUrl;
    } else {
      listener = lb.addListener("Listener", {
        protocol: ApplicationProtocol.HTTP,
        port: acsPort,
      });
    }

    listener.addTargets("Target", {
      targets: [new InstanceIdTarget(instance.instanceId)],
      protocol: ApplicationProtocol.HTTP,
      port: acsPort,
    });

    const instanceId = new CfnOutput(this, "InstanceId", {
      value: instance.instanceId,
    });
    this.cfnOutputs["InstanceId"] = instanceId;

    const instancePublicDnsName = new CfnOutput(this, "InstancePublicDnsName", {
      value: `${instance.instancePublicDnsName}:${acsPort}`,
    });
    this.cfnOutputs["InstancePublicDnsName"] = instancePublicDnsName;

    const loadBalancerDnsName = new CfnOutput(this, "LoadBalancerDnsName", {
      value: lb.loadBalancerDnsName,
    });
    this.cfnOutputs["LoadBalancerDnsName"] = loadBalancerDnsName;
  }
}
