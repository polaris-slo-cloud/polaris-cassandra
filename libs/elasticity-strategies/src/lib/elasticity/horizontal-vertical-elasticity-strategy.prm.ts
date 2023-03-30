import {
  ElasticityStrategy,
  ElasticityStrategyKind,
  SloCompliance,
  SloTarget,
  initSelf,
} from '@polaris-sloc/core';

// ToDo after code generation:
// - Add configuration parameters to the HorizontalVerticalElasticityStrategyConfig interface.
// - If the elasticity strategy does not take SloCompliance objects as input,
//   adapt the first generic parameter of HorizontalVerticalElasticityStrategyKind and HorizontalVerticalElasticityStrategy accordingly.
// - If the elasticity strategy should operate on a subtype of SloTarget,
//   adapt the second generic parameter of HorizontalVerticalElasticityStrategyKind and HorizontalVerticalElasticityStrategy accordingly.
// - (optional) Replace the ObjectKind.group in the constructor of HorizontalVerticalElasticityStrategy with your own.
//   If you change the group name, ensure that you also accordingly adapt the `1-rbac.yaml` files of all
//   the elasticity strategy controller that needs to read and SLO controllers that need to write this ElasticityStrategy CRD.

/**
 * Configuration options for HorizontalVerticalElasticityStrategy.
 */
export interface HorizontalVerticalElasticityStrategyConfig {}

/**
 * Denotes the elasticity strategy kind for the HorizontalVerticalElasticityStrategy.
 */
export class HorizontalVerticalElasticityStrategyKind extends ElasticityStrategyKind<
  SloCompliance,
  SloTarget
> {
  constructor() {
    super({
      group: 'elasticity.polaris-slo-cloud.github.io',
      version: 'v1',
      kind: 'HorizontalVerticalElasticityStrategy',
    });
  }
}

/**
 * Defines the HorizontalVerticalElasticityStrategy.
 */
export class HorizontalVerticalElasticityStrategy extends ElasticityStrategy<
  SloCompliance,
  SloTarget,
  HorizontalVerticalElasticityStrategyConfig
> {
  constructor(initData?: Partial<HorizontalVerticalElasticityStrategy>) {
    super(initData);
    this.objectKind = new HorizontalVerticalElasticityStrategyKind();
    initSelf(this, initData);
  }
}
