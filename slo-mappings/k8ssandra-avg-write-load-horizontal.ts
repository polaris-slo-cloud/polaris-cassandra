import { ApiObjectMetadata, SloTarget } from '@polaris-sloc/core';
import {
  K8ssandraAvgWriteLoadSloMapping,
  K8ssandraAvgWriteLoadSloMappingSpec,
} from '@nicokratky/slos';
import { K8ssandraHorizontalElasticityStrategyKind } from '@nicokratky/elasticity-strategies';

export default new K8ssandraAvgWriteLoadSloMapping({
  metadata: new ApiObjectMetadata({
    namespace: 'k8ssandra',
    name: 'k8ssandra-avg-write-load-horizontal',
  }),
  spec: new K8ssandraAvgWriteLoadSloMappingSpec({
    targetRef: new SloTarget({
      group: 'k8ssandra.io',
      version: 'v1alpha1',
      kind: 'K8ssandraCluster',
      name: 'polaris-k8ssandra-cluster',
    }),
    elasticityStrategy: new K8ssandraHorizontalElasticityStrategyKind(),
    sloConfig: {
      targetWriteLoadPerNode: 5000,
    },
    staticElasticityStrategyConfig: {
      maxNodes: 3,
    },
    stabilizationWindow: {
      scaleDownSeconds: 600, // default = 300
      scaleUpSeconds: 600, // default = 60
    },
  }),
});
