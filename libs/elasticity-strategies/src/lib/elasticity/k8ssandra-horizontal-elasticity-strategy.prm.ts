import {
  ElasticityStrategy,
  ElasticityStrategyKind,
  SloCompliance,
  SloTarget,
  initSelf,
} from '@polaris-sloc/core';

/**
 * Configuration options for K8ssandraHorizontalElasticityStrategy.
 */
export interface K8ssandraHorizontalElasticityStrategyConfig {
  /**
   * The minimum number of nodes the k8ssandra cluster should have.
   */
  minNodes?: number;

  /**
   * The maximum number of nodes the k8ssandra clsuter should have.
   */
  maxNodes?: number;
}

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
