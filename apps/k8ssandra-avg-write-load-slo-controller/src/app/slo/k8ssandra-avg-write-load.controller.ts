import {
  K8ssandraAvgWriteLoadSloConfig,
  K8ssandraEfficiency,
  K8ssandraEfficiencyMetric,
  K8ssandraEfficiencyParams,
} from '@nicokratky/slos';
import {
  ComposedMetricSource,
  Logger,
  MetricsSource,
  ObservableOrPromise,
  OrchestratorGateway,
  ServiceLevelObjective,
  SloCompliance,
  SloMapping,
  SloOutput,
  createOwnerReference,
} from '@polaris-sloc/core';
import { of } from 'rxjs';

/**
 * Implements the K8ssandraAvgWriteLoad SLO.
 *
 * ToDo: Change SloOutput type if necessary.
 */
export class K8ssandraAvgWriteLoadSlo
  implements
    ServiceLevelObjective<K8ssandraAvgWriteLoadSloConfig, SloCompliance>
{
  sloMapping: SloMapping<K8ssandraAvgWriteLoadSloConfig, SloCompliance>;

  private metricsSource: MetricsSource;
  private efficiencyMetricSource: ComposedMetricSource<K8ssandraEfficiency>;

  configure(
    sloMapping: SloMapping<K8ssandraAvgWriteLoadSloConfig, SloCompliance>,
    metricsSource: MetricsSource,
    orchestrator: OrchestratorGateway
  ): ObservableOrPromise<void> {
    this.sloMapping = sloMapping;
    this.metricsSource = metricsSource;

    const efficiencyParams: K8ssandraEfficiencyParams = {
      cpuUtilisationTimeRange: null,
      writeLoadTimeRange: 300, // TODO move to static config?
      namespace: sloMapping.metadata.namespace,
      sloTarget: sloMapping.spec.targetRef,
      owner: createOwnerReference(sloMapping),
    };

    this.efficiencyMetricSource = metricsSource.getComposedMetricSource(
      K8ssandraEfficiencyMetric.instance,
      efficiencyParams
    );

    return of(undefined);
  }

  async evaluate(): Promise<SloOutput<SloCompliance>> {
    Logger.log('Evaluating SLO compliance');

    const sample = await this.efficiencyMetricSource
      .getCurrentValue()
      .toPromise();

    Logger.log('current sample: ', sample);

    const horizontalCompliance = this.calculateHorizontalSloCompliance(
      sample.value
    );

    return {
      sloMapping: this.sloMapping,
      elasticityStrategyParams: {
        currSloCompliancePercentage: horizontalCompliance,
      },
    };
  }

  private calculateHorizontalSloCompliance(
    sample: K8ssandraEfficiency
  ): number {
    const target = this.sloMapping.spec.sloConfig.targetWriteLoadPerNode;
    const currentLoad =
      sample.avgWriteLoadPerNode > 0 ? sample.avgWriteLoadPerNode : 1;

    const compliance = Math.ceil((target / currentLoad) * 100);

    Logger.log('horizontalCompliance:', compliance);

    return compliance;
  }
}
