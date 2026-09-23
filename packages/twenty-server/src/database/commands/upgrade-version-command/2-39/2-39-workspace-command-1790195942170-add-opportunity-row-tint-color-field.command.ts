import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const OPPORTUNITY = STANDARD_OBJECTS.opportunity;
const ROW_TINT_COLOR_FIELD_UNIVERSAL_IDENTIFIER =
  OPPORTUNITY.fields.rowTintColor.universalIdentifier;

@RegisteredWorkspaceCommand('2.39.0', 1790195942170)
@Command({
  name: 'upgrade:2-39:add-opportunity-row-tint-color-field',
  description:
    'Add the opportunity.rowTintColor system field on existing workspaces that predate it',
})
export class AddOpportunityRowTintColorFieldCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    const { flatFieldMetadataMaps, flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
        'flatObjectMetadataMaps',
      ]);

    const opportunityObjectMetadata =
      findFlatEntityByUniversalIdentifier<FlatObjectMetadata>({
        flatEntityMaps: flatObjectMetadataMaps,
        universalIdentifier: OPPORTUNITY.universalIdentifier,
      });

    if (!isDefined(opportunityObjectMetadata)) {
      this.logger.log(
        `opportunity object does not exist for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const isRowTintColorFieldPresent = isDefined(
      findFlatEntityByUniversalIdentifier<FlatFieldMetadata>({
        flatEntityMaps: flatFieldMetadataMaps,
        universalIdentifier: ROW_TINT_COLOR_FIELD_UNIVERSAL_IDENTIFIER,
      }),
    );

    if (isRowTintColorFieldPresent) {
      return;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const { allFlatEntityMaps: standardAllFlatEntityMaps } =
      computeTwentyStandardApplicationAllFlatEntityMaps({
        now: new Date().toISOString(),
        workspaceId,
        twentyStandardApplicationId: twentyStandardFlatApplication.id,
      });

    const standardRowTintColorField =
      findFlatEntityByUniversalIdentifier<FlatFieldMetadata>({
        flatEntityMaps: standardAllFlatEntityMaps.flatFieldMetadataMaps,
        universalIdentifier: ROW_TINT_COLOR_FIELD_UNIVERSAL_IDENTIFIER,
      });

    if (!isDefined(standardRowTintColorField)) {
      throw new Error(
        'Standard application is missing opportunity field rowTintColor',
      );
    }

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Would add the opportunity.rowTintColor field for workspace ${workspaceId}`,
      );

      return;
    }

    const flatFieldMetadataToCreate: FlatFieldMetadata[] = [
      {
        ...standardRowTintColorField,
        viewFieldIds: [],
        viewFieldUniversalIdentifiers: [],
      },
    ];

    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          isSystemBuild: true,
          workspaceId,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
          allFlatEntityOperationByMetadataName: {
            fieldMetadata: {
              flatEntityToCreate: flatFieldMetadataToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
          },
        },
      );

    if (result.status === 'fail') {
      this.logger.error(
        `Failed to add opportunity.rowTintColor field:\n${JSON.stringify(result, null, 2)}`,
      );

      throw new Error(
        `Failed to add opportunity.rowTintColor field for workspace ${workspaceId}`,
      );
    }

    this.logger.log(
      `Added opportunity.rowTintColor field for workspace ${workspaceId}`,
    );
  }
}
