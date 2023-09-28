import {
  ContainerResources,
  ElasticityStrategy,
  Logger,
  Resources,
  SloTarget,
} from '@polaris-sloc/core';
import {
  K8ssandraElasticityStrategyConfig,
  K8ssandraCluster,
  K8ssandraElasticityStrategyControllerBase,
} from '@nicokratky/elasticity-strategies';
import { K8ssandraSloCompliance } from '@nicokratky/slos';

export class K8ssandraElasticityStrategyController extends K8ssandraElasticityStrategyControllerBase<
  SloTarget,
  K8ssandraElasticityStrategyConfig
> {
  protected updateK8ssandraCluster(
    elasticityStrategy: ElasticityStrategy<
      K8ssandraSloCompliance,
      SloTarget,
      K8ssandraElasticityStrategyConfig
    >,
    k8c: K8ssandraCluster
  ): Promise<K8ssandraCluster> {
    const sloOutputParams = elasticityStrategy.spec.sloOutputParams;

    k8c = this.updateResources(k8c, sloOutputParams);

    return Promise.resolve(k8c);
  }

  private updateResources(
    k8c: K8ssandraCluster,
    sloOutputParams: K8ssandraSloCompliance
  ): K8ssandraCluster {
    const memoryComplianceDiff =
      sloOutputParams.currMemorySloCompliancePercentage - 100;
    const memoryScalePercent = (100 + memoryComplianceDiff) / 100;

    Logger.log('memoryComplianceDiff', memoryComplianceDiff);
    Logger.log('memoryScalePercent', memoryScalePercent);

    const cpuComplianceDiff =
      sloOutputParams.currCpuSloCompliancePercentage - 100;
    const cpuScalePercent = (100 + cpuComplianceDiff) / 100;

    Logger.log('cpuComplianceDiff', cpuComplianceDiff);
    Logger.log('cpuScalePercent', cpuScalePercent);

    const limits = k8c.spec.cassandra.resources.limits;

    const scaledLimits = new ContainerResources({
      memoryMiB: limits.memoryMiB * memoryScalePercent,
      milliCpu: limits.milliCpu * cpuScalePercent,
    });

    Logger.log('Setting new limits', scaledLimits);

    k8c.spec.cassandra.resources.limits = scaledLimits;

    return k8c;
  }
}
