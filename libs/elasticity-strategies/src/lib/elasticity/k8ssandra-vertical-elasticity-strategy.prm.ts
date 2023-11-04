import {
  ElasticityStrategy,
  ElasticityStrategyKind,
  SloCompliance,
  SloTarget,
  initSelf,
} from '@polaris-sloc/core';

// ToDo after code generation:
// - Add configuration parameters to the K8ssandraVerticalElasticityStrategyConfig interface.
// - If the elasticity strategy does not take SloCompliance objects as input,
//   adapt the first generic parameter of K8ssandraVerticalElasticityStrategyKind and K8ssandraVerticalElasticityStrategy accordingly.
// - If the elasticity strategy should operate on a subtype of SloTarget,
//   adapt the second generic parameter of K8ssandraVerticalElasticityStrategyKind and K8ssandraVerticalElasticityStrategy accordingly.
// - (optional) Replace the ObjectKind.group in the constructor of K8ssandraVerticalElasticityStrategy with your own.
//   If you change the group name, ensure that you also accordingly adapt the `1-rbac.yaml` files of all
//   the elasticity strategy controller that needs to read and SLO controllers that need to write this ElasticityStrategy CRD.

/**
 * Configuration options for K8ssandraVerticalElasticityStrategy.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface K8ssandraVerticalElasticityStrategyConfig {}

/**
 * Denotes the elasticity strategy kind for the K8ssandraVerticalElasticityStrategy.
 */
export class K8ssandraVerticalElasticityStrategyKind extends ElasticityStrategyKind<
  SloCompliance,
  SloTarget
> {
  constructor() {
    super({
      group: 'elasticity.polaris-slo-cloud.github.io',
      version: 'v1',
      kind: 'K8ssandraVerticalElasticityStrategy',
    });
  }
}

/**
 * Defines the K8ssandraVerticalElasticityStrategy.
 */
export class K8ssandraVerticalElasticityStrategy extends ElasticityStrategy<
  SloCompliance,
  SloTarget,
  K8ssandraVerticalElasticityStrategyConfig
> {
  constructor(initData?: Partial<K8ssandraVerticalElasticityStrategy>) {
    super(initData);
    this.objectKind = new K8ssandraVerticalElasticityStrategyKind();
    initSelf(this, initData);
  }
}
