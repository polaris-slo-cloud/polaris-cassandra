import { KubeConfig } from '@kubernetes/client-node';
import {
  K8ssandraElasticityStrategyKind,
  initPolarisLib as initMappingsLib,
} from '@nicokratky/elasticity-strategies';
import { Logger } from '@polaris-sloc/core';
import { initPolarisKubernetes } from '@polaris-sloc/kubernetes';
import { K8ssandraElasticityStrategyController } from './app/elasticity';

// Load the KubeConfig and initialize the @polaris-sloc/kubernetes library.
const k8sConfig = new KubeConfig();
k8sConfig.loadFromDefault();
const polarisRuntime = initPolarisKubernetes(k8sConfig);

// Initialize the used Polaris mapping libraries
initMappingsLib(polarisRuntime);

// Create an ElasticityStrategyManager and watch the supported elasticity strategy kinds.
const manager = polarisRuntime.createElasticityStrategyManager();
manager
  .startWatching({
    kindsToWatch: [
      {
        kind: new K8ssandraElasticityStrategyKind(),
        controller: new K8ssandraElasticityStrategyController(polarisRuntime),
      },
    ],
  })
  .catch((error) => {
    Logger.error(error);
    process.exit(1);
  });
