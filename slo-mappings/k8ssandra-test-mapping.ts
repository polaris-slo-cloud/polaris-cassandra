import {
  ApiObjectMetadata,
  SloTarget,
} from '@polaris-sloc/core';
import {
  K8ssandraEfficiencySloMapping,
  K8ssandraEfficiencySloMappingSpec,
} from '@nicokratky/slos';
import { K8ssandraElasticityStrategyKind } from '@nicokratky/elasticity-strategies';

export default new K8ssandraEfficiencySloMapping({
  metadata: new ApiObjectMetadata({
    namespace: 'k8ssandra',
    name: 'k8ssandra-test-mapping',
  }),
  spec: new K8ssandraEfficiencySloMappingSpec({
    targetRef: new SloTarget({
      group: 'k8ssandra.io',
      version: 'v1alpha1',
      kind: 'K8ssandraCluster',
      name: 'polaris-k8ssandra-cluster',
    }),
    elasticityStrategy: new K8ssandraElasticityStrategyKind(),
    sloConfig: {
      targetCpuUtilisation: 60,
      targetMemoryUtilisation: 70,
      targetWriteLoadPerNode: 5000,
      tolerance: 15,
    },
    staticElasticityStrategyConfig: {
      maxResources: {
        memoryMiB: 8000,
        milliCpu: 2000,
      },
      minResources: {
        memoryMiB: 2000,
        milliCpu: 500, // k8ssandra nodes don't start with less than 500m cpu!
      },
      maxNodes: 3,
    },
    stabilizationWindow: {
      scaleDownSeconds: 600, // default = 300
      scaleUpSeconds: 600, // default = 60
    },
  }),
});
