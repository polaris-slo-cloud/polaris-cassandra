import { K8ssandraVerticalSloCompliance } from '@nicokratky/slos';
import {
  ElasticityStrategy,
  ElasticityStrategyKind,
  Resources,
  SloTarget,
  initSelf,
} from '@polaris-sloc/core';

/**
 * Configuration options for K8ssandraVerticalElasticityStrategy.
 */
export interface K8ssandraVerticalElasticityStrategyConfig {
  /**
   * The minimum resources a k8ssandra node should have.
   */
  minResources?: Resources;

  /**
   * The maximum resources a k8ssandra node should have.
   */
  maxResources?: Resources;
}

/**
 * Denotes the elasticity strategy kind for the K8ssandraVerticalElasticityStrategy.
 */
export class K8ssandraVerticalElasticityStrategyKind extends ElasticityStrategyKind<
  K8ssandraVerticalSloCompliance,
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
  K8ssandraVerticalSloCompliance,
  SloTarget,
  K8ssandraVerticalElasticityStrategyConfig
> {
  constructor(initData?: Partial<K8ssandraVerticalElasticityStrategy>) {
    super(initData);
    this.objectKind = new K8ssandraVerticalElasticityStrategyKind();
    initSelf(this, initData);
  }
}
