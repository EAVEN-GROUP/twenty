import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { type DataSource } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { restoreDerivedRecordFilterProperties } from 'src/database/commands/upgrade-version-command/2-49/utils/restore-derived-record-filter-properties.util';
import { stripDerivedRecordFilterProperties } from 'src/database/commands/upgrade-version-command/2-49/utils/strip-derived-record-filter-properties.util';
import { wrapBareSelectRecordFilterValue } from 'src/database/commands/upgrade-version-command/2-50/utils/wrap-bare-select-filter-values.util';
import { mapSecondSeriesRecordFilters } from 'src/database/commands/upgrade-version-command/2-51/utils/map-second-series-record-filters.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

type StoredRecordFilter = Record<string, unknown>;

// The 2.49 and 2.50 filter rewrites only know the main chart filter; the
// custom bar and line chart second series keeps its own filter beside it.
@RegisteredWorkspaceCommand('2.51.0', 1792928831267)
@Command({
  name: 'upgrade:2-51:migrate-second-series-filters',
  description:
    'Store the second series filters of bar and line chart widgets as field references with select values wrapped in an array, like the main chart filter',
})
export class MigrateSecondSeriesFiltersCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace(args: RunOnWorkspaceArgs): Promise<void> {
    await this.up(args);
  }

  async up(args: RunOnWorkspaceArgs): Promise<void> {
    const { flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(args.workspaceId, [
        'flatFieldMetadataMaps',
      ]);

    await this.rewriteSecondSeriesFilters({
      ...args,
      mapRecordFilter: (recordFilter) =>
        wrapBareSelectRecordFilterValue({
          recordFilter: stripDerivedRecordFilterProperties({ recordFilter }),
          flatFieldMetadataMaps,
        }),
    });
  }

  async down(args: RunOnWorkspaceArgs): Promise<void> {
    const { flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(args.workspaceId, [
        'flatFieldMetadataMaps',
      ]);

    await this.rewriteSecondSeriesFilters({
      ...args,
      mapRecordFilter: (recordFilter) =>
        restoreDerivedRecordFilterProperties({
          recordFilter,
          flatFieldMetadataMaps,
        }),
    });
  }

  private async rewriteSecondSeriesFilters({
    workspaceId,
    options,
    dataSource,
    mapRecordFilter,
  }: RunOnWorkspaceArgs & {
    mapRecordFilter: (recordFilter: StoredRecordFilter) => StoredRecordFilter;
  }): Promise<void> {
    if (!isDefined(dataSource)) {
      this.logger.warn(
        `No data source for workspace ${workspaceId}, skipping second series filter rewrite`,
      );

      return;
    }

    const isDryRun = options.dryRun ?? false;

    const candidateRows: { id: string }[] = await dataSource.query(
      `SELECT id FROM core."pageLayoutWidget" WHERE "workspaceId" = $1 AND configuration -> 'secondSeriesFilter' -> 'recordFilters' IS NOT NULL`,
      [workspaceId],
    );

    let rewrittenWidgetCount = 0;

    for (const { id } of candidateRows) {
      const hasRewritten = await this.rewriteWidgetUnderLock({
        dataSource,
        widgetId: id,
        isDryRun,
        mapRecordFilter,
      });

      if (hasRewritten) {
        rewrittenWidgetCount++;
      }
    }

    if (!isDryRun && rewrittenWidgetCount > 0) {
      await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
        'flatPageLayoutWidgetMaps',
      ]);
    }

    if (rewrittenWidgetCount > 0) {
      this.logger.log(
        `${isDryRun ? '[DRY RUN] ' : ''}Rewrote the second series filter of ${rewrittenWidgetCount} chart widget(s) in workspace ${workspaceId}`,
      );
    }
  }

  private async rewriteWidgetUnderLock({
    dataSource,
    widgetId,
    isDryRun,
    mapRecordFilter,
  }: {
    dataSource: DataSource;
    widgetId: string;
    isDryRun: boolean;
    mapRecordFilter: (recordFilter: StoredRecordFilter) => StoredRecordFilter;
  }): Promise<boolean> {
    return dataSource.transaction(async (manager) => {
      const [lockedWidget]: { configuration: unknown }[] = await manager.query(
        `SELECT configuration FROM core."pageLayoutWidget" WHERE id = $1 FOR UPDATE`,
        [widgetId],
      );

      if (!isDefined(lockedWidget)) {
        return false;
      }

      const { value, hasChanged } = mapSecondSeriesRecordFilters({
        configuration: lockedWidget.configuration,
        mapRecordFilter,
      });

      if (!hasChanged || isDryRun) {
        return hasChanged;
      }

      await manager.query(
        `UPDATE core."pageLayoutWidget" SET configuration = $1::jsonb WHERE id = $2`,
        [JSON.stringify(value), widgetId],
      );

      return true;
    });
  }
}
