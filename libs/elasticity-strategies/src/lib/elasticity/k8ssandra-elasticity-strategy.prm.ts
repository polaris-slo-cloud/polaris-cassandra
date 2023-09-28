import { K8ssandraSloCompliance } from '@nicokratky/slos';
import {
  ElasticityStrategy,
  ElasticityStrategyKind,
  Resources,
  SloTarget,
  initSelf,
} from '@polaris-sloc/core';

/**
 * Configuration options for K8ssandraElasticityStrategy.
 */
export interface K8ssandraElasticityStrategyConfig {
  /**
   * The minimum number of nodes the k8ssandra cluster should have.
   */
  minNodes?: number;

  /**
   * The maximum number of nodes the k8ssandra clsuter should have.
   */
  maxNodes?: number;

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
 * Denotes the elasticity strategy kind for the K8ssandraElasticityStrategy.
 */
export class K8ssandraElasticityStrategyKind extends ElasticityStrategyKind<
  K8ssandraSloCompliance,
  SloTarget
> {
  constructor() {
    super({
      group: 'elasticity.polaris-slo-cloud.github.io',
      version: 'v1',
      kind: 'K8ssandraElasticityStrategy',
    });
  }
}

/**
 * Defines the K8ssandraElasticityStrategy.
 */
export class K8ssandraElasticityStrategy extends ElasticityStrategy<
  K8ssandraSloCompliance,
  SloTarget,
  K8ssandraElasticityStrategyConfig
> {
  constructor(initData?: Partial<K8ssandraElasticityStrategy>) {
    super(initData);
    this.objectKind = new K8ssandraElasticityStrategyKind();
    initSelf(this, initData);
  }
}
