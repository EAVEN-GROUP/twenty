import { Injectable } from '@nestjs/common';

import { type APP_LOCALES } from 'twenty-shared/translations';

import { ApplicationTranslationCatalogService } from 'src/engine/metadata-modules/application-translation-catalog/services/application-translation-catalog.service';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { resolveEffectiveTranslatedFlatEntity } from 'src/engine/metadata-modules/overrides/utils/resolve-effective-translated-flat-entity.util';

@Injectable()
export class ChartFieldLabelTranslationService {
  constructor(
    private readonly applicationTranslationCatalogService: ApplicationTranslationCatalogService,
  ) {}

  async translateFieldLabels({
    fields,
    locale,
    workspaceId,
  }: {
    fields: FlatFieldMetadata[];
    locale: keyof typeof APP_LOCALES;
    workspaceId: string;
  }): Promise<FlatFieldMetadata[]> {
    const getI18nContext =
      await this.applicationTranslationCatalogService.getI18nContextByApplicationId(
        {
          applicationIds: fields.map(({ applicationId }) => applicationId),
          locale,
          workspaceId,
        },
      );

    return fields.map((field) =>
      resolveEffectiveTranslatedFlatEntity({
        metadataName: 'fieldMetadata',
        flatEntity: field,
        i18nContext: getI18nContext(field.applicationId),
      }),
    );
  }
}
