import { HorizontalElasticityStrategyKind } from '@polaris-sloc/common-mappings';
import { ApiObjectMetadata, SloTarget } from '@polaris-sloc/core';
import {
  K8ssandraVerticalEfficiencySloMapping,
  K8ssandraVerticalEfficiencySloMappingSpec,
} from '@nicokratky/slos';
import { K8ssandraVerticalElasticityStrategyKind } from '@nicokratky/elasticity-strategies';

export default new K8ssandraVerticalEfficiencySloMapping({
  metadata: new ApiObjectMetadata({
    namespace: 'k8ssandra',
    name: 'k8ssandra-vertical-efficiency',
  }),
  spec: new K8ssandraVerticalEfficiencySloMappingSpec({
    targetRef: new SloTarget({
      group: 'k8ssandra.io',
      version: 'v1alpha1',
      kind: 'K8ssandraCluster',
      name: 'polaris-k8ssandra-cluster',
    }),
    elasticityStrategy: new K8ssandraVerticalElasticityStrategyKind(),
    sloConfig: {
      targetCpuUtilisation: 60,
      targetMemoryUtilisation: 70,
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
    },
    stabilizationWindow: {
      scaleDownSeconds: 600, // default = 300
      scaleUpSeconds: 600, // default = 60
    },
  }),
});
