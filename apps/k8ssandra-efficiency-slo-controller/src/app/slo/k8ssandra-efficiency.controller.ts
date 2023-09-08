import {
  K8ssandraEfficiency,
  K8ssandraEfficiencyMetric,
  K8ssandraEfficiencyParams,
  K8ssandraEfficiencySloConfig,
  K8ssandraSloCompliance,
} from '@nicokratky/slos';
import {
  ComposedMetricSource,
  Logger,
  MetricsSource,
  ObservableOrPromise,
  OrchestratorGateway,
  ServiceLevelObjective,
  SloMapping,
  SloOutput,
  createOwnerReference,
} from '@polaris-sloc/core';
import { of } from 'rxjs';

/**
 * Implements the K8ssandraEfficiency SLO.
 *
 * ToDo: Change SloOutput type if necessary.
 */
export class K8ssandraEfficiencySlo
  implements
    ServiceLevelObjective<K8ssandraEfficiencySloConfig, K8ssandraSloCompliance>
{
  sloMapping: SloMapping<K8ssandraEfficiencySloConfig, K8ssandraSloCompliance>;

  private metricsSource: MetricsSource;
  private efficiencyMetricSource: ComposedMetricSource<K8ssandraEfficiency>;

  configure(
    sloMapping: SloMapping<
      K8ssandraEfficiencySloConfig,
      K8ssandraSloCompliance
    >,
    metricsSource: MetricsSource,
    orchestrator: OrchestratorGateway
  ): ObservableOrPromise<void> {
    this.sloMapping = sloMapping;
    this.metricsSource = metricsSource;

    const efficiencyParams: K8ssandraEfficiencyParams = {
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

  evaluate(): ObservableOrPromise<SloOutput<K8ssandraSloCompliance>> {
    Logger.log('Evaluating SLO compliance');

    return this.calculateSloCompliance().then((sloCompliance) => ({
      sloMapping: this.sloMapping,
      elasticityStrategyParams: {
        currVerticalSloCompliancePercentage: sloCompliance,
        currHorizontalSloCompliancePercentange: sloCompliance,
      },
    }));
  }

  private async calculateSloCompliance(): Promise<number> {
    Logger.log('Calculating SLO compliance');

    const currentEfficiency = await this.efficiencyMetricSource
      .getCurrentValue()
      .toPromise();

    Logger.log('Current efficiency: ', currentEfficiency);

    if (!currentEfficiency) {
      Logger.log('Obtaining efficiency metric returned: ', currentEfficiency);
      return 100;
    }

    // TODO calculate compliance

    return 50;
  }
}
