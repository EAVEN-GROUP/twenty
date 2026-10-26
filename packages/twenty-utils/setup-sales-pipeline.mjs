// Applies the setter -> closer pipeline data model to a workspace through the metadata API.
// Safe to re-run. Usage:
//   TWENTY_URL=http://localhost:3000 TWENTY_API_KEY=<admin api key> node packages/twenty-utils/setup-sales-pipeline.mjs
// Run sales-pipeline-data-migration.sql afterwards.

const TWENTY_URL = process.env.TWENTY_URL ?? 'http://localhost:3000';
const TWENTY_API_KEY = process.env.TWENTY_API_KEY;

if (!TWENTY_API_KEY) {
  console.error('TWENTY_API_KEY is required');
  process.exit(1);
}

const LOST_REASON_OPTIONS = [
  { value: 'NOT_INTERESTED', label: 'Non interessato', color: 'red' },
  { value: 'HAS_MANAGER', label: 'Ha già un gestore', color: 'orange' },
  { value: 'SELF_MANAGED', label: 'Gestisce da solo', color: 'yellow' },
  { value: 'PRICE', label: 'Prezzo', color: 'purple' },
  { value: 'NOT_OWNER', label: 'Non è il proprietario', color: 'gray' },
  { value: 'WRONG_NUMBER', label: 'Numero errato', color: 'gray' },
  { value: 'OTHER', label: 'Altro', color: 'gray' },
];

const PERSON_CALL_OUTCOME_OPTIONS = [
  { value: 'NO_ANSWER', label: 'Nessuna risposta', color: 'tomato' },
  { value: 'FOLLOW_UP', label: 'Follow-up', color: 'lime' },
  { value: 'SEND_INFO', label: 'Invia info', color: 'cyan' },
  { value: 'BOOKED', label: 'Appuntamento fissato', color: 'green' },
  { value: 'NOT_BOOKED', label: 'Non interessato', color: 'red' },
];

const OBJECTS = [
  {
    nameSingular: 'leadCall',
    namePlural: 'leadCalls',
    labelSingular: 'Chiamata',
    labelPlural: 'Chiamate',
    icon: 'IconPhoneCall',
  },
  {
    nameSingular: 'salesPipelineSetting',
    namePlural: 'salesPipelineSettings',
    labelSingular: 'Impostazione pipeline',
    labelPlural: 'Impostazioni pipeline',
    icon: 'IconAdjustments',
    // Edited from Settings > General, so it stays out of the sidebar.
    isHiddenFromNavigation: true,
  },
];

const FIELDS = [
  {
    object: 'person',
    name: 'status',
    options: [
      { value: 'TO_CALL', label: 'Da chiamare', color: 'gray' },
      { value: 'NO_ANSWER', label: 'Nessuna risposta', color: 'tomato' },
      { value: 'UNREACHABLE', label: 'Irraggiungibile', color: 'orange' },
      { value: 'FOLLOW_UP', label: 'Follow-up', color: 'lime' },
      { value: 'SEND_INFO', label: 'Invia info', color: 'cyan' },
      { value: 'BOOKED', label: 'Appuntamento fissato', color: 'green' },
      { value: 'NOT_BOOKED', label: 'Non interessato', color: 'red' },
    ],
  },
  { object: 'person', name: 'owner', label: 'Setter' },
  {
    object: 'person',
    name: 'callAttempts',
    type: 'NUMBER',
    label: 'Tentativi di chiamata',
    icon: 'IconPhoneOff',
    defaultValue: 0,
    settings: { decimals: 0, type: 'number' },
  },
  {
    object: 'person',
    name: 'nextCallAt',
    type: 'DATE_TIME',
    label: 'Prossimo contatto',
    icon: 'IconPhoneCalling',
  },
  { object: 'person', name: 'callDate', label: 'Ultima chiamata' },
  {
    object: 'person',
    name: 'infoChannel',
    type: 'SELECT',
    label: 'Canale info',
    icon: 'IconSend',
    options: [
      { value: 'WHATSAPP', label: 'WhatsApp', color: 'green' },
      { value: 'EMAIL', label: 'Email', color: 'blue' },
    ],
  },
  {
    object: 'person',
    name: 'lostReason',
    type: 'SELECT',
    label: 'Motivo di perdita',
    icon: 'IconThumbDown',
    options: LOST_REASON_OPTIONS,
  },
  {
    object: 'opportunity',
    name: 'status',
    // Keeping BOOKED's option id renames its rows; every other setter status is dropped and its rows become empty.
    renames: { BOOKED: 'MEETING_SCHEDULED' },
    dropUnlisted: true,
    options: [
      { value: 'MEETING_SCHEDULED', label: 'Appuntamento fissato', color: 'blue' },
      { value: 'NEGOTIATION', label: 'Trattativa', color: 'purple' },
      { value: 'CONTRACT_SENT', label: 'Contratto inviato', color: 'yellow' },
      { value: 'WON', label: 'Firmato', color: 'green' },
      { value: 'LOST', label: 'Perso', color: 'red' },
    ],
  },
  { object: 'opportunity', name: 'rep', label: 'Closer' },
  {
    object: 'opportunity',
    name: 'nextContactAt',
    type: 'DATE_TIME',
    label: 'Prossimo contatto',
    icon: 'IconCalendarEvent',
  },
  {
    object: 'opportunity',
    name: 'lostReason',
    type: 'SELECT',
    label: 'Motivo di perdita',
    icon: 'IconThumbDown',
    options: [
      ...LOST_REASON_OPTIONS.slice(0, -1),
      { value: 'NO_SHOW', label: "Assente all'appuntamento", color: 'tomato' },
      LOST_REASON_OPTIONS.at(-1),
    ],
  },
  {
    object: 'opportunity',
    name: 'signedAt',
    type: 'DATE',
    label: 'Firmato il',
    icon: 'IconSignature',
  },
  {
    object: 'meeting',
    name: 'meetingType',
    type: 'SELECT',
    label: 'Tipo',
    icon: 'IconCategory',
    options: [
      { value: 'CALL', label: 'Telefonata', color: 'sky' },
      { value: 'VIDEO', label: 'Videochiamata', color: 'blue' },
      { value: 'VISIT', label: 'Visita di persona', color: 'green' },
    ],
  },
  {
    object: 'workspaceMember',
    name: 'isCloser',
    type: 'BOOLEAN',
    label: 'Closer',
    icon: 'IconUserDollar',
    defaultValue: false,
  },
  {
    object: 'leadCall',
    name: 'calledAt',
    type: 'DATE_TIME',
    label: 'Data e ora',
    icon: 'IconCalendarClock',
  },
  {
    object: 'leadCall',
    name: 'outcome',
    type: 'SELECT',
    label: 'Esito',
    icon: 'IconProgressCheck',
    options: PERSON_CALL_OUTCOME_OPTIONS,
  },
  {
    object: 'leadCall',
    name: 'person',
    type: 'RELATION',
    label: 'Lead',
    icon: 'IconUser',
    relation: {
      type: 'MANY_TO_ONE',
      targetObject: 'person',
      targetFieldLabel: 'Chiamate',
      targetFieldIcon: 'IconPhoneCall',
    },
  },
  {
    object: 'leadCall',
    name: 'setter',
    type: 'RELATION',
    label: 'Setter',
    icon: 'IconUserCircle',
    relation: {
      type: 'MANY_TO_ONE',
      targetObject: 'workspaceMember',
      targetFieldLabel: 'Chiamate',
      targetFieldIcon: 'IconPhoneCall',
    },
  },
  {
    object: 'salesPipelineSetting',
    name: 'maxCallAttempts',
    type: 'NUMBER',
    label: 'Tentativi di chiamata massimi',
    icon: 'IconPhoneOff',
    defaultValue: 3,
    settings: { decimals: 0, type: 'number' },
  },
];

const request = async (query, variables) => {
  const response = await fetch(`${TWENTY_URL}/metadata`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TWENTY_API_KEY}`,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await response.json();

  if (json.errors) {
    throw new Error(JSON.stringify(json.errors, null, 2));
  }

  return json.data;
};

const loadObjects = async () => {
  const data = await request(`{
    objects(paging: { first: 1000 }) {
      edges { node { id nameSingular fieldsList { id name label type options } } }
    }
  }`);

  return new Map(
    data.objects.edges.map(({ node }) => [node.nameSingular, node]),
  );
};

const buildOptions = (spec, existingOptions) => {
  const existingByValue = new Map(
    (existingOptions ?? []).map((option) => [option.value, option]),
  );

  for (const [fromValue, toValue] of Object.entries(spec.renames ?? {})) {
    if (existingByValue.has(fromValue) && !existingByValue.has(toValue)) {
      existingByValue.set(toValue, existingByValue.get(fromValue));
      existingByValue.delete(fromValue);
    }
  }

  const listed = spec.options.map((option, position) => ({
    ...(existingByValue.has(option.value)
      ? { id: existingByValue.get(option.value).id }
      : {}),
    ...option,
    position,
  }));

  if (spec.dropUnlisted) {
    return listed;
  }

  const listedValues = new Set(spec.options.map(({ value }) => value));
  const unlisted = [...existingByValue.entries()]
    .filter(([value]) => !listedValues.has(value))
    .map(([, option], index) => ({ ...option, position: listed.length + index }));

  return [...listed, ...unlisted];
};

const optionsDiffer = (left, right) =>
  JSON.stringify(
    (left ?? []).map(({ id, value, label, color, position }) => ({ id, value, label, color, position })),
  ) !==
  JSON.stringify(
    (right ?? []).map(({ id, value, label, color, position }) => ({ id, value, label, color, position })),
  );

const ensureObject = async (spec, objects) => {
  if (objects.has(spec.nameSingular)) {
    console.log(`unchanged object ${spec.nameSingular}`);
    return;
  }

  const { createOneObject } = await request(
    'mutation($input: CreateOneObjectInput!) { createOneObject(input: $input) { id } }',
    {
      input: {
        object: {
          nameSingular: spec.nameSingular,
          namePlural: spec.namePlural,
          labelSingular: spec.labelSingular,
          labelPlural: spec.labelPlural,
          icon: spec.icon,
          isLabelSyncedWithName: false,
        },
      },
    },
  );
  console.log(`created object ${spec.nameSingular}`);

  if (!spec.isHiddenFromNavigation) {
    return;
  }

  const { navigationMenuItems } = await request(
    '{ navigationMenuItems { id targetObjectMetadataId } }',
  );

  for (const { id } of navigationMenuItems.filter(
    ({ targetObjectMetadataId }) => targetObjectMetadataId === createOneObject.id,
  )) {
    await request(
      'mutation($id: UUID!) { deleteNavigationMenuItem(id: $id) { id } }',
      { id },
    );
  }
};

const main = async () => {
  const initialObjects = await loadObjects();

  for (const spec of OBJECTS) {
    await ensureObject(spec, initialObjects);
  }

  const objects = await loadObjects();

  for (const spec of FIELDS) {
    const object = objects.get(spec.object);

    if (!object) {
      throw new Error(`Object ${spec.object} not found`);
    }

    const existing = object.fieldsList.find(({ name }) => name === spec.name);
    const fieldLabel = `${spec.object}.${spec.name}`;

    if (!existing) {
      if (!spec.type) {
        throw new Error(`${fieldLabel} does not exist`);
      }

      await request(
        'mutation($input: CreateOneFieldMetadataInput!) { createOneField(input: $input) { id } }',
        {
          input: {
            field: {
              objectMetadataId: object.id,
              name: spec.name,
              label: spec.label,
              type: spec.type,
              icon: spec.icon,
              defaultValue: spec.defaultValue,
              settings: spec.settings,
              options: spec.options?.map((option, position) => ({ ...option, position })),
              relationCreationPayload: spec.relation && {
                type: spec.relation.type,
                targetObjectMetadataId: objects.get(spec.relation.targetObject).id,
                targetFieldLabel: spec.relation.targetFieldLabel,
                targetFieldIcon: spec.relation.targetFieldIcon,
              },
              isLabelSyncedWithName: false,
            },
          },
        },
      );
      console.log(`created ${fieldLabel}`);
      continue;
    }

    const update = {};

    if (spec.label && existing.label !== spec.label) {
      update.label = spec.label;
      update.isLabelSyncedWithName = false;
    }

    if (spec.options) {
      const options = buildOptions(spec, existing.options);

      if (optionsDiffer(existing.options, options)) {
        update.options = options;
      }
    }

    if (Object.keys(update).length === 0) {
      console.log(`unchanged ${fieldLabel}`);
      continue;
    }

    await request(
      'mutation($id: UUID!, $update: UpdateFieldInput!) { updateOneField(input: { id: $id, update: $update }) { id } }',
      { id: existing.id, update },
    );
    console.log(`updated ${fieldLabel}: ${Object.keys(update).join(', ')}`);
  }

  const refreshedObjects = await loadObjects();

  for (const spec of VIEWS) {
    await ensureView(spec, refreshedObjects.get(spec.object));
  }
};

const CURRENT_MEMBER_FILTER_VALUE = JSON.stringify({
  isCurrentWorkspaceMemberSelected: true,
  selectedRecordIds: [],
});

const VIEWS = [
  {
    object: 'person',
    name: 'Chiamate di oggi',
    previousNames: ['Calls today'],
    icon: 'IconPhoneCalling',
    type: 'TABLE',
    fields: [
      'name',
      'phones',
      'status',
      'callAttempts',
      'nextCallAt',
      'owner',
      'notes',
      'pointOfContactForOpportunities',
      'meetings',
      'callDate',
    ],
    filters: {
      logicalOperator: 'AND',
      filters: [
        { field: 'owner', operand: 'IS', value: CURRENT_MEMBER_FILTER_VALUE },
      ],
      groups: [
        {
          logicalOperator: 'OR',
          filters: [
            { field: 'status', operand: 'IS', value: JSON.stringify(['TO_CALL']) },
            { field: 'nextCallAt', operand: 'IS_IN_PAST', value: '' },
            { field: 'nextCallAt', operand: 'IS_TODAY', value: '' },
          ],
        },
      ],
    },
    sort: { field: 'nextCallAt', direction: 'ASC' },
  },
  {
    object: 'opportunity',
    name: 'Pipeline closer',
    previousNames: ['Closer pipeline'],
    icon: 'IconLayoutKanban',
    type: 'KANBAN',
    groupBy: 'status',
    fields: [
      'name',
      'pointOfContact',
      'phones',
      'addressCustom',
      'propertyType',
      'price',
      'nextContactAt',
      'rep',
    ],
    filters: {
      logicalOperator: 'AND',
      filters: [
        { field: 'rep', operand: 'IS', value: CURRENT_MEMBER_FILTER_VALUE },
      ],
      groups: [],
    },
    sort: { field: 'nextContactAt', direction: 'ASC' },
  },
  {
    object: 'meeting',
    name: 'I miei appuntamenti',
    previousNames: ['My appointments'],
    icon: 'IconCalendarEvent',
    type: 'TABLE',
    fields: [
      'name',
      'meetingDate',
      'meetingType',
      'status',
      'person',
      'phones',
      'note',
    ],
    filters: {
      logicalOperator: 'AND',
      filters: [
        { field: 'owner', operand: 'IS', value: CURRENT_MEMBER_FILTER_VALUE },
        { field: 'status', operand: 'IS', value: JSON.stringify(['SCHEDULED']) },
      ],
      groups: [],
    },
    sort: { field: 'meetingDate', direction: 'ASC' },
  },
];

const getFieldId = (object, fieldName) => {
  const field = object.fieldsList.find(({ name }) => name === fieldName);

  if (!field) {
    throw new Error(`${object.nameSingular}.${fieldName} does not exist`);
  }

  return field.id;
};

const createFilterGroup = async ({ object, viewId, group, parentId, position }) => {
  const { createViewFilterGroup } = await request(
    'mutation($input: CreateViewFilterGroupInput!) { createViewFilterGroup(input: $input) { id } }',
    {
      input: {
        viewId,
        logicalOperator: group.logicalOperator,
        parentViewFilterGroupId: parentId,
        positionInViewFilterGroup: position,
      },
    },
  );

  for (const [index, filter] of group.filters.entries()) {
    await request(
      'mutation($input: CreateViewFilterInput!) { createViewFilter(input: $input) { id } }',
      {
        input: {
          viewId,
          viewFilterGroupId: createViewFilterGroup.id,
          fieldMetadataId: getFieldId(object, filter.field),
          operand: filter.operand,
          value: filter.value,
          positionInViewFilterGroup: index,
        },
      },
    );
  }

  for (const [index, childGroup] of group.groups.entries()) {
    await createFilterGroup({
      object,
      viewId,
      group: { groups: [], ...childGroup },
      parentId: createViewFilterGroup.id,
      position: group.filters.length + index,
    });
  }
};

const ensureView = async (spec, object) => {
  const { getViews } = await request(
    'query($objectMetadataId: String) { getViews(objectMetadataId: $objectMetadataId) { id name } }',
    { objectMetadataId: object.id },
  );

  const knownNames = [spec.name, ...(spec.previousNames ?? [])];

  if (getViews.some(({ name }) => knownNames.includes(name))) {
    console.log(`unchanged view ${spec.object} / ${spec.name}`);
    return;
  }

  const groupByField = spec.groupBy
    ? object.fieldsList.find(({ name }) => name === spec.groupBy)
    : undefined;

  const { createView } = await request(
    'mutation($input: CreateViewInput!) { createView(input: $input) { id } }',
    {
      input: {
        objectMetadataId: object.id,
        name: spec.name,
        icon: spec.icon,
        type: spec.type,
        visibility: 'WORKSPACE',
        mainGroupByFieldMetadataId: groupByField?.id,
      },
    },
  );
  const viewId = createView.id;

  await request(
    'mutation($inputs: [CreateViewFieldInput!]!) { createManyViewFields(inputs: $inputs) { id } }',
    {
      inputs: spec.fields.map((fieldName, position) => ({
        viewId,
        fieldMetadataId: getFieldId(object, fieldName),
        isVisible: true,
        position,
      })),
    },
  );

  // The server creates one group per option itself; only the empty-value column needs hiding.
  if (groupByField) {
    const { getViewGroups } = await request(
      'query($viewId: String) { getViewGroups(viewId: $viewId) { id fieldValue } }',
      { viewId },
    );

    for (const { id } of getViewGroups.filter(({ fieldValue }) => fieldValue === '')) {
      await request(
        'mutation($input: UpdateViewGroupInput!) { updateViewGroup(input: $input) { id } }',
        { input: { id, update: { isVisible: false } } },
      );
    }
  }

  await createFilterGroup({ object, viewId, group: spec.filters, position: 0 });

  await request(
    'mutation($input: CreateViewSortInput!) { createViewSort(input: $input) { id } }',
    {
      input: {
        viewId,
        fieldMetadataId: getFieldId(object, spec.sort.field),
        direction: spec.sort.direction,
      },
    },
  );

  console.log(`created view ${spec.object} / ${spec.name}`);
};

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
