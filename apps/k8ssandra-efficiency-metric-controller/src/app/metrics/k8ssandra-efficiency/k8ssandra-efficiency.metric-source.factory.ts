import {
  ComposedMetricSource,
  ComposedMetricSourceFactory,
  MetricsSource,
  ObjectKind,
  OrchestratorGateway,
} from '@polaris-sloc/core';
import {
  K8ssandraEfficiency,
  K8ssandraEfficiencyMetric,
  K8ssandraEfficiencyParams,
} from '@nicokratky/slos';
import { K8ssandraEfficiencyMetricSource } from './k8ssandra-efficiency.metric-source';

/**
 * Factory for creating `K8ssandraEfficiencyMetricSource` instances that supply metrics of type `K8ssandraEfficiencyMetric`.
 */
export class K8ssandraEfficiencyMetricSourceFactory
  implements
    ComposedMetricSourceFactory<
      K8ssandraEfficiencyMetric,
      K8ssandraEfficiency,
      K8ssandraEfficiencyParams
    >
{
  // ToDo:
  // - Adapt this list, if necessary.
  // - To register this factory with the `MetricsSourcesManager` (needed if the metric source should execute in the current process
  //   and be available through `MetricSource.getComposedMetricSource()`, add the following code to your `initPolarisLib()` function
  //   or to your `main.ts`:
  //   ```
  //   K8ssandraEfficiencyMetricSourceFactory.supportedSloTargetTypes.forEach(
  //       sloTargetType => runtime.metricsSourcesManager.addComposedMetricSourceFactory(new K8ssandraEfficiencyMetricSourceFactory(), sloTargetType),
  //   );
  //   ```
  //
  /**
   * The list of supported `SloTarget` types.
   *
   * This list can be used for registering an instance of this factory for each supported
   * `SloTarget` type with the `MetricsSourcesManager`. This registration must be done if the metric source should execute in the current process,
   * i.e., metric source instances can be requested through `MetricSource.getComposedMetricSource()`.
   *
   * When creating a composed metric controller, the list of compatible `SloTarget` types is determined by
   * the `ComposedMetricMapping` type.
   */
  static supportedSloTargetTypes: ObjectKind[] = [
    new ObjectKind({
      group: 'apps',
      version: 'v1',
      kind: 'Deployment',
    }),
    new ObjectKind({
      group: 'apps',
      version: 'v1',
      kind: 'StatefulSet',
    }),
    new ObjectKind({
      group: 'apps',
      version: 'v1',
      kind: 'ReplicaSet',
    }),
    new ObjectKind({
      group: 'apps',
      version: 'v1',
      kind: 'DaemonSet',
    }),
  ];

  readonly metricType = K8ssandraEfficiencyMetric.instance;

  // ToDo: Adapt this, if necessary.
  readonly metricSourceName = `${K8ssandraEfficiencyMetric.instance.metricTypeName}/generic-k8ssandra-efficiency`;

  createSource(
    params: K8ssandraEfficiencyParams,
    metricsSource: MetricsSource,
    orchestrator: OrchestratorGateway
  ): ComposedMetricSource<K8ssandraEfficiency> {
    return new K8ssandraEfficiencyMetricSource(
      params,
      metricsSource,
      orchestrator
    );
  }
}
