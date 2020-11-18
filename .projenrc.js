const { TypeScriptProject } = require('projen');

const devDeps = {
  "prettier": "^2.1.2",
  'cdk-pipeline-app': 'github:mmuller88/cdk-pipeline-app#master',
};

const name = 'alfresco-ocr';

const project = new TypeScriptProject({
  name: "alfresco-ocr",
  authorAddress: "damadden88g@googlemail.com",
  authorName: "Martin Müller",
  repository: `https://github.com/mmuller88/${name}`,
  keywords: [
    "cdk",
    "ec2",
    "alfresco",
    "ocr",
  ],
  releaseWorkflow: false,
  devDependencies: devDeps,                    
});

const stage = '${STAGE:-dev}';

project.addScripts({
  'clean': 'rm -rf ./cdk.out && rm -rf ./cdk.out ./build',
  // skip test in build: yarn run test
  'build': 'yarn run clean && yarn install && yarn run compile',
  'cdkdeploy': `yarn run build && cdk deploy ${name}-${stage} --profile damadden88 --require-approval never`,
  'cdksynth': `yarn run build && cdk synth ${name}-${stage} --profile damadden88`,
  'cdkdestroy': `yarn run build && yes | cdk destroy ${name}-${stage} --profile damadden88`,
  'cdkpipelinediff': `yarn run build && cdk diff ${name}-pipeline --profile damadden88 || true`,
  'cdkpipelinedeploy': `yarn run build && cdk deploy ${name}-pipeline --profile damadden88 --require-approval never`,
});

project.synth();
