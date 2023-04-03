import { ApiObjectMetadata, SloTarget } from '@polaris-sloc/core';
import {
  EfficiencySloMapping,
  EfficiencySloMappingSpec,
} from '@nicokratky/slos';
import { HorizontalElasticityStrategyKind } from '@nicokratky/elasticity-strategies';

export default new EfficiencySloMapping({
  metadata: new ApiObjectMetadata({
    namespace: 'demo',
    name: 'demo-efficiency',
  }),
  spec: new EfficiencySloMappingSpec({
    targetRef: new SloTarget({
      group: 'apps',
      version: 'v1',
      kind: 'Deployment',
      name: 'pause-deployment',
    }),
    elasticityStrategy: new HorizontalElasticityStrategyKind(),
    sloConfig: {
      targetEfficiency: 80,
    },
    staticElasticityStrategyConfig: {
      maxReplicas: 3,
    },
  }),
});
