import {
  ContainerResources,
  ElasticityStrategy,
  Logger,
  PolarisRuntime,
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
  constructor(polarisRuntime: PolarisRuntime) {
    super(polarisRuntime);
  }

  protected updateK8ssandraCluster(
    elasticityStrategy: ElasticityStrategy<
      K8ssandraSloCompliance,
      SloTarget,
      K8ssandraElasticityStrategyConfig
    >,
    k8c: K8ssandraCluster
  ): Promise<K8ssandraCluster> {
    k8c = this.updateResources(elasticityStrategy, k8c);

    return Promise.resolve(k8c);
  }

  private updateResources(
    elasticityStrategy: ElasticityStrategy<
      K8ssandraSloCompliance,
      SloTarget,
      K8ssandraElasticityStrategyConfig
    >,
    k8c: K8ssandraCluster
  ): K8ssandraCluster {
    const sloOutputParams = elasticityStrategy.spec.sloOutputParams;

    const memoryComplianceDiff =
      sloOutputParams.currMemorySloCompliancePercentage - 100;
    const memoryScalePercent = (100 - memoryComplianceDiff) / 100;

    Logger.log('memoryComplianceDiff', memoryComplianceDiff);
    Logger.log('memoryScalePercent', memoryScalePercent);

    const cpuComplianceDiff =
      sloOutputParams.currCpuSloCompliancePercentage - 100;
    const cpuScalePercent = (100 + cpuComplianceDiff) / 100;

    Logger.log('cpuComplianceDiff', cpuComplianceDiff);
    Logger.log('cpuScalePercent', cpuScalePercent);

    const resources = k8c.spec.cassandra.resources;

    const scaledResources = new ContainerResources({
      memoryMiB: Math.ceil(resources.memoryMiB * memoryScalePercent),
      milliCpu: resources.milliCpu,
    });

    if (
      !this.checkIfOutsideStabilizationWindow(
        elasticityStrategy,
        resources,
        scaledResources
      )
    ) {
      Logger.log(
        'Skipping scaling, because stabilization window has not yet passed for: ',
        elasticityStrategy
      );
      return;
    }

    Logger.log('Setting new resources', scaledResources);
    k8c.spec.cassandra.resources = scaledResources;

    return k8c;
  }

  private checkIfOutsideStabilizationWindow(
    elasticityStrategy: ElasticityStrategy<
      K8ssandraSloCompliance,
      SloTarget,
      K8ssandraElasticityStrategyConfig
    >,
    oldResources: Resources,
    newResources: Resources
  ): boolean {
    let isScaleUp = false;
    Object.keys(newResources).forEach((key: keyof Resources) => {
      if (newResources[key] > oldResources[key]) {
        isScaleUp = true;
      }
    });

    if (isScaleUp) {
      return this.stabilizationWindowTracker.isOutsideStabilizationWindowForScaleUp(
        elasticityStrategy
      );
    } else {
      return this.stabilizationWindowTracker.isOutsideStabilizationWindowForScaleDown(
        elasticityStrategy
      );
    }
  }
}
