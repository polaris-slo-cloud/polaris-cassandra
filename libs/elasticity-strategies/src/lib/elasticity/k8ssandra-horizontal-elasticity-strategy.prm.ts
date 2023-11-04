import {
  ElasticityStrategy,
  ElasticityStrategyKind,
  SloCompliance,
  SloTarget,
  initSelf,
} from '@polaris-sloc/core';

// ToDo after code generation:
// - Add configuration parameters to the K8ssandraHorizontalElasticityStrategyConfig interface.
// - If the elasticity strategy does not take SloCompliance objects as input,
//   adapt the first generic parameter of K8ssandraHorizontalElasticityStrategyKind and K8ssandraHorizontalElasticityStrategy accordingly.
// - If the elasticity strategy should operate on a subtype of SloTarget,
//   adapt the second generic parameter of K8ssandraHorizontalElasticityStrategyKind and K8ssandraHorizontalElasticityStrategy accordingly.
// - (optional) Replace the ObjectKind.group in the constructor of K8ssandraHorizontalElasticityStrategy with your own.
//   If you change the group name, ensure that you also accordingly adapt the `1-rbac.yaml` files of all
//   the elasticity strategy controller that needs to read and SLO controllers that need to write this ElasticityStrategy CRD.

/**
 * Configuration options for K8ssandraHorizontalElasticityStrategy.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface K8ssandraHorizontalElasticityStrategyConfig {}

/**
 * Denotes the elasticity strategy kind for the K8ssandraHorizontalElasticityStrategy.
 */
export class K8ssandraHorizontalElasticityStrategyKind extends ElasticityStrategyKind<
  SloCompliance,
  SloTarget
> {
  constructor() {
    super({
      group: 'elasticity.polaris-slo-cloud.github.io',
      version: 'v1',
      kind: 'K8ssandraHorizontalElasticityStrategy',
    });
  }
}

/**
 * Defines the K8ssandraHorizontalElasticityStrategy.
 */
export class K8ssandraHorizontalElasticityStrategy extends ElasticityStrategy<
  SloCompliance,
  SloTarget,
  K8ssandraHorizontalElasticityStrategyConfig
> {
  constructor(initData?: Partial<K8ssandraHorizontalElasticityStrategy>) {
    super(initData);
    this.objectKind = new K8ssandraHorizontalElasticityStrategyKind();
    initSelf(this, initData);
  }
}
