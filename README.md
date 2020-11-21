# Alfresco OCR

That demo deployment was created with https://github.com/Alfresco/alfresco-docker-installer . Please read the documentation over there!

Urls:
http://localhost:80/share
http://localhost:80/alfresco
http://localhost:80
http://localhost:80/api-explorer

# Project Setup

alfresco-ocr is setup using [Projen](https://github.com/projen/projen). So if you want to make some change on the project setup like the package.json you need to change the **.projenrc.js** file!

To apply changes from the .projenrc.js do npx projen . It is recommended to create an alias for thept like pj.

## Start Backend

Use the starting script!

```
./start.sh
```

## Destroy Container

```
./start.sh -d
```

## Destroy Container + Delete Volumes

```
./start.sh -d && sudo rm -rf data logs
```

# OCR

Originated from https://github.com/keensoft/alfresco-simple-ocr. Helpful as well was:

- https://hub.alfresco.com/t5/alfresco-content-services-forum/quot-ocr-extract-quot-action-doesn-t-work-well-alfresco-simple/td-p/193329

# Search

Example Solr queries:

- TYPE:"m:type"
- TYPE:"m:type" AND m:othertype:"bob"

- TYPE:"m:type"
- TYPE:"m:type" AND m:othertype:331.36
- TYPE:"m:type" AND m:othertype:[0 TO 400]

# Run on AWS

You can run the Docker Compose Deploy in an EC2 instance in AWS. I made that process very easy. I use AWS CDK to deploy an Ec2 Instance through CodePipeline. For more details look in the **cdk** folder.

To run the Ec2 Instance with you AWS Credentials you need to adjust the AWS profile in **.projenrc.js** .

## Deploy DEV Ec2 Stack

To deploy the Ec2 Alfresco Stack on Dev do:

```
yarn run cdkdeploy
```

After the command a Cloudformation Stack will be created with an EC2 machine and Alfresco with OCR installed.

To deploy to other stages like Prod do

```
STAGE=prod yarn run cdkdeploy
```

## Deploy CDK Pipeline

To create the CDK Pipeline do:

```
yarn run cdkpipelinedeploy
```
