import { K8ssandraSloCompliance } from '@nicokratky/slos';
import {
  ElasticityStrategy,
  ElasticityStrategyKind,
  Resources,
  SloTarget,
  initSelf,
} from '@polaris-sloc/core';

// ToDo after code generation:
// - Add configuration parameters to the K8ssandraElasticityStrategyConfig interface.
// - If the elasticity strategy does not take SloCompliance objects as input,
//   adapt the first generic parameter of K8ssandraElasticityStrategyKind and K8ssandraElasticityStrategy accordingly.
// - If the elasticity strategy should operate on a subtype of SloTarget,
//   adapt the second generic parameter of K8ssandraElasticityStrategyKind and K8ssandraElasticityStrategy accordingly.
// - (optional) Replace the ObjectKind.group in the constructor of K8ssandraElasticityStrategy with your own.
//   If you change the group name, ensure that you also accordingly adapt the `1-rbac.yaml` files of all
//   the elasticity strategy controller that needs to read and SLO controllers that need to write this ElasticityStrategy CRD.

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
