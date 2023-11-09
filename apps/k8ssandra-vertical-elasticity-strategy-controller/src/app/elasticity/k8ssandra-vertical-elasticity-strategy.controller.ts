import {
  ApiObjectMetadata,
  ContainerResources,
  DefaultStabilizationWindowTracker,
  ElasticityStrategy,
  ElasticityStrategyController,
  Logger,
  OrchestratorClient,
  PolarisRuntime,
  Resources,
  SloTarget,
  StabilizationWindowTracker,
} from '@polaris-sloc/core';
import {
  K8ssandraVerticalElasticityStrategyConfig,
  K8ssandraCluster,
} from '@nicokratky/elasticity-strategies';
import { K8ssandraVerticalSloCompliance } from '@nicokratky/slos';

/** Tracked executions eviction interval of 20 minutes. */
const EVICTION_INTERVAL_MSEC = 20 * 60 * 1000;

/**
 * Controller for the K8ssandraVerticalElasticityStrategy.
 */
export class K8ssandraVerticalElasticityStrategyController
  implements
    ElasticityStrategyController<
      K8ssandraVerticalSloCompliance,
      SloTarget,
      K8ssandraVerticalElasticityStrategyConfig
    >
{
  /** The client for accessing orchestrator resources. */
  private orchClient: OrchestratorClient;

  /** Tracks the stabilization windows of the ElasticityStrategy instances. */
  private stabilizationWindowTracker: StabilizationWindowTracker<
    ElasticityStrategy<
      K8ssandraVerticalSloCompliance,
      SloTarget,
      K8ssandraVerticalElasticityStrategyConfig
    >
  > = new DefaultStabilizationWindowTracker();

  private evictionInterval: NodeJS.Timeout;

  constructor(polarisRuntime: PolarisRuntime) {
    this.orchClient = polarisRuntime.createOrchestratorClient();

    this.evictionInterval = setInterval(
      () => this.stabilizationWindowTracker.evictExpiredExecutions(),
      EVICTION_INTERVAL_MSEC
    );
  }

  async execute(
    elasticityStrategy: ElasticityStrategy<
      K8ssandraVerticalSloCompliance,
      SloTarget,
      K8ssandraVerticalElasticityStrategyConfig
    >
  ): Promise<void> {
    const k8c = await this.loadTarget(elasticityStrategy);
    Logger.log('Loaded K8ssandraCluster:', k8c);
    Logger.log('Resources:', k8c.spec.cassandra.resources);

    let updatedK8c = await this.updateK8ssandraCluster(elasticityStrategy, k8c);

    if (updatedK8c == null) {
      // can't update K8ssandraCluster
      // probably outside stabilization window
      return;
    }

    updatedK8c = this.normalize(k8c, elasticityStrategy.spec.staticConfig);

    await this.orchClient.update(updatedK8c);
    this.stabilizationWindowTracker.trackExecution(elasticityStrategy);

    Logger.log('Successfully updated K8ssandraCluster:', updatedK8c);
    Logger.log('New resources:', updatedK8c.spec.cassandra.resources);
  }

  checkIfActionNeeded(
    elasticityStrategy: ElasticityStrategy<
      K8ssandraVerticalSloCompliance,
      SloTarget,
      K8ssandraVerticalElasticityStrategyConfig
    >
  ): Promise<boolean> {
    const sloCompliance = elasticityStrategy.spec.sloOutputParams;
    const tolerance = sloCompliance.tolerance ?? this.getDefaultTolerance();
    const lowerBound = 100 - tolerance;
    const upperBound = 100 + tolerance;

    const actionNeeded =
      sloCompliance.currCpuSloCompliancePercentage < lowerBound ||
      sloCompliance.currCpuSloCompliancePercentage > upperBound ||
      sloCompliance.currMemorySloCompliancePercentage < lowerBound ||
      sloCompliance.currMemorySloCompliancePercentage > upperBound;

    Logger.log('action needed: ', actionNeeded);

    return Promise.resolve(actionNeeded);
  }

  onDestroy(): void {
    clearInterval(this.evictionInterval);
  }

  onElasticityStrategyDeleted(
    elasticityStrategy: ElasticityStrategy<
      K8ssandraVerticalSloCompliance,
      SloTarget,
      K8ssandraVerticalElasticityStrategyConfig
    >
  ): void {
    this.stabilizationWindowTracker.removeElasticityStrategy(
      elasticityStrategy
    );
  }

  private async loadTarget(
    elasticityStrategy: ElasticityStrategy<
      K8ssandraVerticalSloCompliance,
      SloTarget,
      K8ssandraVerticalElasticityStrategyConfig
    >
  ): Promise<K8ssandraCluster> {
    const targetRef = elasticityStrategy.spec.targetRef;
    const queryApiObject = new K8ssandraCluster({
      metadata: new ApiObjectMetadata({
        namespace: elasticityStrategy.metadata.namespace,
        name: targetRef.name,
      }),
    });

    const k8c = await this.orchClient.read(queryApiObject);

    return k8c;
  }

  protected updateK8ssandraCluster(
    elasticityStrategy: ElasticityStrategy<
      K8ssandraVerticalSloCompliance,
      SloTarget,
      K8ssandraVerticalElasticityStrategyConfig
    >,
    k8c: K8ssandraCluster
  ): Promise<K8ssandraCluster> {
    const oldResources = k8c.spec.cassandra.resources;

    k8c = this.updateResources(elasticityStrategy, k8c);

    if (
      !this.checkIfOutsideStabilizationWindow(
        elasticityStrategy,
        oldResources,
        k8c.spec.cassandra.resources
      )
    ) {
      Logger.log(
        'Skipping scaling, because stabilization window has not yet passed for: ',
        elasticityStrategy
      );
      return;
    }

    return Promise.resolve(k8c);
  }

  private updateResources(
    elasticityStrategy: ElasticityStrategy<
      K8ssandraVerticalSloCompliance,
      SloTarget,
      K8ssandraVerticalElasticityStrategyConfig
    >,
    k8c: K8ssandraCluster
  ): K8ssandraCluster {
    const sloOutputParams = elasticityStrategy.spec.sloOutputParams;

    const memoryComplianceDiff =
      sloOutputParams.currMemorySloCompliancePercentage - 100;
    Logger.log('memoryComplianceDiff', memoryComplianceDiff);

    const cpuComplianceDiff =
      sloOutputParams.currCpuSloCompliancePercentage - 100;
    Logger.log('cpuComplianceDiff', cpuComplianceDiff);

    const tolerance = this.getTolerance(sloOutputParams);

    let memoryScalePercent = 1;
    let cpuScalePercent = 1;

    if (Math.abs(memoryComplianceDiff) > tolerance) {
      memoryScalePercent = (100 - memoryComplianceDiff) / 100;
      Logger.log('memoryScalePercent', memoryScalePercent);
    }

    if (Math.abs(cpuComplianceDiff) > tolerance) {
      cpuScalePercent = (100 - cpuComplianceDiff) / 100;
      Logger.log('cpuScalePercent', cpuScalePercent);
    }

    const resources = k8c.spec.cassandra.resources;

    const scaledResources = new ContainerResources({
      memoryMiB: Math.ceil(resources.memoryMiB * memoryScalePercent),
      milliCpu: Math.ceil(resources.milliCpu * cpuScalePercent),
    });

    Logger.log('Setting new resources', scaledResources);
    k8c.spec.cassandra.resources = scaledResources;

    return k8c;
  }

  private checkIfOutsideStabilizationWindow(
    elasticityStrategy: ElasticityStrategy<
      K8ssandraVerticalSloCompliance,
      SloTarget,
      K8ssandraVerticalElasticityStrategyConfig
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

  /**
   * Normalize the K8ssandraCluster CRD to be within the min/max range
   * of nodes and resources.
   *
   * @param k8c
   * @param config
   * @returns
   */
  private normalize(
    k8c: K8ssandraCluster,
    config: K8ssandraVerticalElasticityStrategyConfig
  ): K8ssandraCluster {
    const resources = k8c.spec.cassandra.resources;

    Logger.log('Resources to normalize:', resources);

    resources.memoryMiB = Math.max(
      resources.memoryMiB,
      config.minResources?.memoryMiB ?? 1
    );
    resources.memoryMiB = Math.min(
      resources.memoryMiB,
      config.maxResources?.memoryMiB ?? Infinity
    );

    resources.milliCpu = Math.max(
      resources.milliCpu,
      config.minResources?.milliCpu ?? 1
    );
    resources.milliCpu = Math.min(
      resources.milliCpu,
      config.maxResources?.milliCpu ?? Infinity
    );

    k8c.spec.cassandra.resources = resources;

    return k8c;
  }

  private getTolerance(sloOutputParams: K8ssandraVerticalSloCompliance) {
    return sloOutputParams.tolerance ?? this.getDefaultTolerance();
  }

  /**
   * @returns The default tolerance value if `SloCompliance.tolerance` is not set for an elasticity strategy.
   */
  protected getDefaultTolerance(): number {
    return 10;
  }
}
