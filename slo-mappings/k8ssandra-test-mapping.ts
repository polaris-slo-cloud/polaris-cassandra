import { ApiObjectMetadata, SloTarget } from '@polaris-sloc/core';
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
      targetReadEfficiency: 70,
      targetWriteEfficiency: 60,
    },
    staticElasticityStrategyConfig: {
      maxNodes: 3,
    },
  }),
});
