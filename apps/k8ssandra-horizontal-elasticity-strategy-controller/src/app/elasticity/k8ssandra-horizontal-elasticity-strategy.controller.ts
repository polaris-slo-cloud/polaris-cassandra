import {
  ApiObjectMetadata,
  DefaultStabilizationWindowTracker,
  ElasticityStrategy,
  Logger,
  OrchestratorClient,
  PolarisRuntime,
  SloCompliance,
  SloComplianceElasticityStrategyControllerBase,
  SloTarget,
  StabilizationWindowTracker,
} from '@polaris-sloc/core';
import {
  K8ssandraHorizontalElasticityStrategyConfig,
  K8ssandraHorizontalElasticityStrategy,
  K8ssandraCluster,
} from '@nicokratky/elasticity-strategies';

/** Tracked executions eviction interval of 20 minutes. */
const EVICTION_INTERVAL_MSEC = 20 * 60 * 1000;

/**
 * Controller for the K8ssandraHorizontalElasticityStrategy.
 *
 * ToDo:
 *  1. If you want to restrict the type of workloads that this elasticity strategy can be applied to,
 *     change the first generic parameter from `SloTarget` to the appropriate type.
 *  2. If your elasticity strategy input is not of type `SloCompliance`, change the definition of the controller class
 *     to extend `ElasticityStrategyController` instead of `SloComplianceElasticityStrategyControllerBase`.
 *  3. Implement the `execute()` method.
 *  4. Adapt `manifests/1-rbac.yaml` to include get and update permissions on all resources that you update in the orchestrator during `execute()`.
 */
export class K8ssandraHorizontalElasticityStrategyController extends SloComplianceElasticityStrategyControllerBase<
  SloTarget,
  K8ssandraHorizontalElasticityStrategyConfig
> {
  /** The client for accessing orchestrator resources. */
  private orchClient: OrchestratorClient;

  /** Tracks the stabilization windows of the ElasticityStrategy instances. */
  private stabilizationWindowTracker: StabilizationWindowTracker<K8ssandraHorizontalElasticityStrategy> =
    new DefaultStabilizationWindowTracker();

  private evictionInterval: NodeJS.Timeout;

  constructor(polarisRuntime: PolarisRuntime) {
    super();
    this.orchClient = polarisRuntime.createOrchestratorClient();

    this.evictionInterval = setInterval(
      () => this.stabilizationWindowTracker.evictExpiredExecutions(),
      EVICTION_INTERVAL_MSEC
    );
  }

  async execute(
    elasticityStrategy: K8ssandraHorizontalElasticityStrategy
  ): Promise<void> {
    const k8c = await this.loadTarget(elasticityStrategy);
    Logger.log('Loaded K8ssandraCluster:', k8c);

    const oldSize = k8c.spec.cassandra.datacenters[0].size;

    let updatedK8c = await this.updateK8ssandraCluster(elasticityStrategy, k8c);

    if (updatedK8c == null) {
      // can't update K8ssandraCluster
      // probably outside stabilization window
      return;
    }

    updatedK8c = this.normalize(k8c, elasticityStrategy.spec.staticConfig);

    const newSize = updatedK8c.spec.cassandra.datacenters[0].size;

    if (oldSize == newSize) {
      Logger.log('No update, not tracking execution');
      return;
    }

    await this.orchClient.update(updatedK8c);
    this.stabilizationWindowTracker.trackExecution(elasticityStrategy);

    Logger.log('Successfully updated K8ssandraCluster:', updatedK8c);
    Logger.log('New size:', updatedK8c.spec.cassandra.datacenters[0].size);
  }

  onDestroy(): void {
    clearInterval(this.evictionInterval);
  }

  onElasticityStrategyDeleted(
    elasticityStrategy: K8ssandraHorizontalElasticityStrategy
  ): void {
    this.stabilizationWindowTracker.removeElasticityStrategy(
      elasticityStrategy
    );
  }

  private async loadTarget(
    elasticityStrategy: ElasticityStrategy<
      SloCompliance,
      SloTarget,
      K8ssandraHorizontalElasticityStrategyConfig
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
    config: K8ssandraHorizontalElasticityStrategyConfig
  ): K8ssandraCluster {
    let newSize = k8c.spec.cassandra.datacenters[0].size;

    newSize = Math.max(newSize, config.minNodes ?? 1);
    newSize = Math.min(newSize, config.maxNodes ?? Infinity);

    k8c.spec.cassandra.datacenters[0].size = newSize;

    return k8c;
  }

  protected updateK8ssandraCluster(
    elasticityStrategy: K8ssandraHorizontalElasticityStrategy,
    k8c: K8ssandraCluster
  ): Promise<K8ssandraCluster> {
    const oldSize = k8c.spec.cassandra.datacenters[0].size;

    k8c = this.updateSize(elasticityStrategy, k8c);

    if (
      !this.checkIfOutsideStabilizationWindow(
        elasticityStrategy,
        oldSize,
        k8c.spec.cassandra.datacenters[0].size
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

  private updateSize(
    elasticityStrategy: K8ssandraHorizontalElasticityStrategy,
    k8c: K8ssandraCluster
  ): K8ssandraCluster {
    const sloOutputParams = elasticityStrategy.spec.sloOutputParams;

    const size = k8c.spec.cassandra.datacenters[0].size;
    let newSize = size;

    const horizontalComplianceDiff =
      100 - sloOutputParams.currSloCompliancePercentage;
    Logger.log('horizontalComplianceDiff', horizontalComplianceDiff);

    const tolerance = this.getTolerance(sloOutputParams);

    if (horizontalComplianceDiff > tolerance) {
      Logger.log('Triggering horizontal scale up');
      newSize = newSize + 1;
    } else {
      Logger.log('Not triggering horizontal scale up');
    }

    Logger.log('Setting size', newSize);
    k8c.spec.cassandra.datacenters[0].size = newSize;

    return k8c;
  }

  private checkIfOutsideStabilizationWindow(
    elasticityStrategy: K8ssandraHorizontalElasticityStrategy,
    oldSize: number,
    newSize: number
  ): boolean {
    let isScaleUp = false;

    if (newSize > oldSize) {
      isScaleUp = true;
    }

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

  private getTolerance(sloOutputParams: SloCompliance) {
    return sloOutputParams.tolerance ?? this.getDefaultTolerance();
  }
}
