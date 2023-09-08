import {
  ElasticityStrategy,
  Logger,
  SloCompliance,
  SloTarget,
} from '@polaris-sloc/core';
import {
  K8ssandraElasticityStrategyConfig,
  K8ssandraCluster,
  K8ssandraElasticityStrategyControllerBase,
} from '@nicokratky/elasticity-strategies';

export class K8ssandraElasticityStrategyController extends K8ssandraElasticityStrategyControllerBase<
  SloTarget,
  K8ssandraElasticityStrategyConfig
> {
  protected updateK8ssandraCluster(
    elasticityStrategy: ElasticityStrategy<
      SloCompliance,
      SloTarget,
      K8ssandraElasticityStrategyConfig
    >,
    k8c: K8ssandraCluster
  ): Promise<K8ssandraCluster> {

    Logger.log("updateK8ssandraCluster called, doing nothing for now");

    return Promise.resolve(k8c);
  }
}
