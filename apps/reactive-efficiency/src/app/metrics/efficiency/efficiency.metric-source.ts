import {
  ComposedMetricSourceBase,
  MetricsSource,
  OrchestratorGateway,
  Sample,
} from '@polaris-sloc/core';
import { Efficiency, EfficiencyParams } from '@nicokratky/slos';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';

// ToDo:
// 1. Adapt the list of `supportedSloTargetTypes` in `EfficiencyMetricSourceFactory` (see efficiency.metric-source.factory.ts).
// 2. Adapt the `EfficiencyMetricSourceFactory.metricSourceName`, if needed (e.g., if there are multiple sources for EfficiencyMetric that differ
//    based on the supported SloTarget types).
// 3. Implement `EfficiencyMetricSource.getValueStream()` to compute the metric.
// 4. Adapt the `release` label in `../../../../manifests/kubernetes/3-service-monitor.yaml` to ensure that Prometheus will scrape this controller.

/**
 * Computes the `Efficiency` composed metric.
 */
export class EfficiencyMetricSource extends ComposedMetricSourceBase<Efficiency> {
  constructor(
    private params: EfficiencyParams,
    metricsSource: MetricsSource,
    orchestrator: OrchestratorGateway
  ) {
    super(metricsSource, orchestrator);
  }

  getValueStream(): Observable<Sample<Efficiency>> {
    return this.getDefaultPollingInterval().pipe(
      switchMap(() => this.getEfficiency()),
    );
  }

  private async getEfficiency(): Promise<Sample<Efficiency>> {
    const effQuery = this.metricsSource.getTimeSeriesSource()
      .select<number>('polaris_composed', 'efficiency')
      .multiplyBy(100);

    const queryResult = await effQuery.execute();

    if (queryResult.results?.length > 0) {
      const result = queryResult.results[0].samples[0];

      return {
        timestamp: result.timestamp,
        value: { efficiency: result.value },
      };
    }
  }
}