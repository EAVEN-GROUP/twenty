// Translates the labels stored in the workspace metadata to Italian through the metadata API.
// Safe to re-run: it matches by name and by option value, never by label. Usage:
//   TWENTY_URL=http://localhost:3000 TWENTY_API_KEY=<admin api key> node packages/twenty-utils/translate-workspace-to-italian.mjs
// Run italian-locale-data-migration.sql before it and flush the server cache after it:
//   docker compose exec server yarn command:prod cache:flush

const TWENTY_URL = process.env.TWENTY_URL ?? 'http://localhost:3000';
const TWENTY_API_KEY = process.env.TWENTY_API_KEY;

if (!TWENTY_API_KEY) {
  console.error('TWENTY_API_KEY is required');
  process.exit(1);
}

const OBJECTS = {
  opportunity: { labelSingular: 'Immobile', labelPlural: 'Immobili' },
  person: { labelSingular: 'Lead', labelPlural: 'Lead' },
  meeting: {
    labelSingular: 'Appuntamento',
    labelPlural: 'Appuntamenti',
    description:
      'Una visita o chiamata programmata con un lead, per un immobile specifico',
  },
};

const FIELD_LABELS = {
  'meeting.meetingDate': 'Data appuntamento',
  'meeting.meetingType': 'Tipo',
  'meeting.name': 'Nome',
  'meeting.note': 'Nota',
  'meeting.opportunity': 'Immobile',
  'meeting.owner': 'Proprietario',
  'meeting.person': 'Lead',
  'meeting.phones': 'Telefono',
  'meeting.showUp': 'Presentato',
  'meeting.status': 'Stato',
  'opportunity.addressCustom': 'Indirizzo',
  'opportunity.bathrooms': 'Bagni',
  'opportunity.callDate': 'Data chiamata',
  'opportunity.contract': 'Contratto',
  'opportunity.floor': 'Piano',
  'opportunity.listingUrl': 'Link annuncio',
  'opportunity.lostReason': 'Motivo di perdita',
  'opportunity.nextContactAt': 'Prossimo contatto',
  'opportunity.phones': 'Telefoni',
  'opportunity.pointOfContact': 'Lead',
  'opportunity.price': 'Prezzo',
  'opportunity.propertyLocation': 'Posizione immobile',
  'opportunity.propertyType': 'Tipo di immobile',
  'opportunity.province': 'Provincia',
  'opportunity.rooms': 'Locali',
  'opportunity.signedAt': 'Firmato il',
  'opportunity.source': 'Fonte',
  'opportunity.status': 'Stato',
  'opportunity.title': 'Titolo',
  'opportunity.zone': 'Zona',
  'person.callAttempts': 'Tentativi di chiamata',
  'person.callDate': 'Ultima chiamata',
  'person.lostReason': 'Motivo di perdita',
  'person.meetings': 'Appuntamenti',
  'person.nextCallAt': 'Prossimo contatto',
  'person.notes': 'Note',
  'person.phones': 'Telefono',
  'person.pointOfContactForOpportunities': 'Immobili',
  'person.propertiesCount': 'Numero di immobili',
  'person.status': 'Stato',
  'workspaceMember.assignedLeads': 'Lead assegnati',
  'workspaceMember.meetings': 'Appuntamenti',
  'workspaceMember.ownedOpportunities': 'Immobili assegnati',
  'workspaceMember.people': 'Lead',
};

const LOST_REASON_LABELS = {
  NOT_INTERESTED: 'Non interessato',
  HAS_MANAGER: 'Ha già un gestore',
  SELF_MANAGED: 'Gestisce da solo',
  PRICE: 'Prezzo',
  NOT_OWNER: 'Non è il proprietario',
  WRONG_NUMBER: 'Numero errato',
  NO_SHOW: "Assente all'appuntamento",
  OTHER: 'Altro',
};

const OPTION_LABELS = {
  'person.status': {
    TO_CALL: 'Da chiamare',
    NO_ANSWER: 'Nessuna risposta',
    UNREACHABLE: 'Irraggiungibile',
    FOLLOW_UP: 'Follow-up',
    SEND_INFO: 'Invia info',
    BOOKED: 'Appuntamento fissato',
    NOT_BOOKED: 'Non interessato',
  },
  'person.lostReason': LOST_REASON_LABELS,
  'opportunity.lostReason': LOST_REASON_LABELS,
  'opportunity.status': {
    MEETING_SCHEDULED: 'Appuntamento fissato',
    NEGOTIATION: 'Trattativa',
    CONTRACT_SENT: 'Contratto inviato',
    WON: 'Firmato',
    LOST: 'Perso',
  },
  'opportunity.source': { GOOGLE_MAPS: 'Google Maps' },
  'meeting.meetingType': {
    CALL: 'Telefonata',
    VIDEO: 'Videochiamata',
    VISIT: 'Visita di persona',
  },
  'meeting.status': {
    SCHEDULED: 'Programmato',
    COMPLETED: 'Completato',
    NO_SHOW: 'Assente',
    CANCELLED: 'Annullato',
    RESCHEDULED: 'Riprogrammato',
  },
  'task.status': {
    TODO: 'Da fare',
    IN_PROGRESS: 'In corso',
    DONE: 'Completato',
  },
  'workflow.statuses': {
    DRAFT: 'Bozza',
    ACTIVE: 'Attivo',
    DEACTIVATED: 'Disattivato',
  },
  'workflowRun.status': {
    NOT_STARTED: 'Non avviato',
    RUNNING: 'In esecuzione',
    COMPLETED: 'Completato',
    FAILED: 'Non riuscito',
    ENQUEUED: 'In coda',
    STOPPING: 'In arresto',
    STOPPED: 'Arrestato',
  },
  'workflowVersion.status': {
    DRAFT: 'Bozza',
    ACTIVE: 'Attiva',
    DEACTIVATED: 'Disattivata',
    ARCHIVED: 'Archiviata',
  },
};

const VIEW_NAMES = {
  'All Companies': 'Tutte le aziende',
  'All Dashboards': 'Tutti i cruscotti',
  'All Meetings': 'Tutti gli appuntamenti',
  'All Notes': 'Tutte le note',
  'All People': 'Tutti i lead',
  'All Tasks': 'Tutte le attività',
  'All Workflows': 'Tutti i workflow',
  'Calls today': 'Chiamate di oggi',
  'Closer pipeline': 'Pipeline closer',
  'Long-term': 'Lungo termine',
  'My appointments': 'I miei appuntamenti',
  'My leads': 'I miei lead',
  'My meetings': 'Tutti i miei appuntamenti',
  'Short-term': 'Breve termine',
};

const NAVIGATION_FOLDER_NAMES = { Tools: 'Strumenti' };

const TAB_TITLES = {
  'Tab 1': 'Scheda 1',
  'Team summary': 'Riepilogo team',
  'Team trend': 'Andamento team',
  'Trend per rep': 'Andamento per setter',
};

const WIDGET_TITLES = {
  'Adrian phone calls': 'Telefonate di Adrian',
  'Answered calls': 'Chiamate con risposta',
  'Answered phone calls': 'Telefonate con risposta',
  'Conversion rate': 'Tasso di conversione',
  'Luca phone calls': 'Telefonate di Luca',
  'Meetings booked': 'Appuntamenti fissati',
  'Meetings booked by rep': 'Appuntamenti fissati per setter',
  'Phone calls': 'Telefonate',
  'Phone calls trend over time': 'Andamento delle telefonate nel tempo',
  'Total calls': 'Chiamate totali',
  'Total opportunities': 'Immobili totali',
  'Unanswered call': 'Chiamate senza risposta',
};

const WIDGET_CONFIGURATION_LABELS = {
  'Answered Calls': 'Chiamate con risposta',
  'Answered calls': 'Chiamate con risposta',
  Meetings: 'Appuntamenti',
  'Phone Calls': 'Telefonate',
};

const ROLE_LABELS = {
  Member: { label: 'Membro', description: 'Ruolo membro' },
  'Sales Rep': { label: 'Commerciale' },
};

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
    throw new Error(
      json.errors.map(({ message }) => message).join('; '),
      { cause: json.errors },
    );
  }

  return json.data;
};

const attempt = async (description, run) => {
  try {
    return await run();
  } catch (error) {
    console.warn(`skipped ${description}: ${error.message}`);
  }
};

const changedKeys = (current, target) =>
  Object.keys(target).filter((key) => current[key] !== target[key]);

const loadObjects = async () => {
  const data = await request(`{
    objects(paging: { first: 1000 }) {
      edges { node { id nameSingular labelSingular labelPlural description fieldsList { id name label type options isLabelSyncedWithName } } }
    }
  }`);

  return new Map(
    data.objects.edges.map(({ node }) => [node.nameSingular, node]),
  );
};

const translateObjects = async (objects) => {
  for (const [nameSingular, target] of Object.entries(OBJECTS)) {
    const object = objects.get(nameSingular);

    if (!object) {
      console.warn(`skipped object ${nameSingular}: not found`);
      continue;
    }

    const keys = changedKeys(object, target);

    if (keys.length === 0) {
      console.log(`unchanged object ${nameSingular}`);
      continue;
    }

    await request(
      'mutation($id: UUID!, $update: UpdateObjectPayload!) { updateOneObject(input: { id: $id, update: $update }) { id } }',
      {
        id: object.id,
        update: Object.fromEntries(keys.map((key) => [key, target[key]])),
      },
    );
    console.log(`updated object ${nameSingular}: ${keys.join(', ')}`);
  }
};

const buildTranslatedOptions = (existingOptions, labelsByValue) =>
  existingOptions.map((option) => ({
    ...option,
    label: labelsByValue[option.value] ?? option.label,
  }));

const translateFields = async (objects) => {
  const specs = new Map();

  for (const [key, label] of Object.entries(FIELD_LABELS)) {
    specs.set(key, { label });
  }

  for (const [key, labelsByValue] of Object.entries(OPTION_LABELS)) {
    specs.set(key, { ...specs.get(key), labelsByValue });
  }

  for (const [key, spec] of specs) {
    const [objectName, fieldName] = key.split('.');
    const field = objects
      .get(objectName)
      ?.fieldsList.find(({ name }) => name === fieldName);

    if (!field) {
      console.warn(`skipped field ${key}: not found`);
      continue;
    }

    const update = {};

    if (spec.label && field.label !== spec.label) {
      update.label = spec.label;

      if (field.isLabelSyncedWithName) {
        update.isLabelSyncedWithName = false;
      }
    }

    if (spec.labelsByValue) {
      const options = buildTranslatedOptions(
        field.options ?? [],
        spec.labelsByValue,
      );
      const hasChange = options.some(
        ({ label }, index) => label !== field.options[index].label,
      );

      if (hasChange) {
        update.options = options;
      }
    }

    if (Object.keys(update).length === 0) {
      console.log(`unchanged field ${key}`);
      continue;
    }

    await attempt(`field ${key}`, async () => {
      await request(
        'mutation($id: UUID!, $update: UpdateFieldInput!) { updateOneField(input: { id: $id, update: $update }) { id } }',
        { id: field.id, update },
      );
      console.log(`updated field ${key}: ${Object.keys(update).join(', ')}`);
    });
  }
};

const translateViews = async () => {
  const { getViews } = await request('{ getViews { id name } }');

  for (const view of getViews) {
    const name = VIEW_NAMES[view.name];

    if (!name) {
      continue;
    }

    await request(
      'mutation($id: String!, $input: UpdateViewInput!) { updateView(id: $id, input: $input) { id } }',
      { id: view.id, input: { name } },
    );
    console.log(`updated view ${view.name} -> ${name}`);
  }
};

const translateNavigation = async () => {
  const { navigationMenuItems } = await request(
    '{ navigationMenuItems { id name type } }',
  );

  for (const item of navigationMenuItems) {
    const name = NAVIGATION_FOLDER_NAMES[item.name];

    if (item.type !== 'FOLDER' || !name) {
      continue;
    }

    await request(
      'mutation($id: UUID!, $update: UpdateNavigationMenuItemInput!) { updateNavigationMenuItem(input: { id: $id, update: $update }) { id } }',
      { id: item.id, update: { name } },
    );
    console.log(`updated navigation folder ${item.name} -> ${name}`);
  }
};

const CHART_CONFIGURATION_TYPES = ['BarChartConfiguration', 'LineChartConfiguration'];

// The update replaces the whole configuration, so every field of the chart types is read back.
const loadChartConfigurationSelection = async () => {
  const data = await request(
    '{ __type(name: "WidgetConfiguration") { possibleTypes { name fields { name } } } }',
  );

  return data.__type.possibleTypes
    .filter(({ name }) => CHART_CONFIGURATION_TYPES.includes(name))
    .map(
      ({ name, fields }) =>
        `... on ${name} { ${fields.map((field) => field.name).join(' ')} }`,
    )
    .join(' ');
};

const translateConfiguration = (configuration) => {
  const { __typename, ...rest } = configuration;
  const update = {};

  for (const key of ['seriesLabel', 'secondSeriesLabel']) {
    const label = WIDGET_CONFIGURATION_LABELS[rest[key]];

    if (label) {
      update[key] = label;
    }
  }

  return Object.keys(update).length > 0 ? { ...rest, ...update } : undefined;
};

const translateDashboards = async () => {
  const configurationSelection = await loadChartConfigurationSelection();
  const { getPageLayouts } = await request(
    '{ getPageLayouts(pageLayoutType: DASHBOARD) { id } }',
  );

  for (const pageLayout of getPageLayouts) {
    const { getPageLayoutTabs } = await request(
      'query($pageLayoutId: String!) { getPageLayoutTabs(pageLayoutId: $pageLayoutId) { id title } }',
      { pageLayoutId: pageLayout.id },
    );

    for (const tab of getPageLayoutTabs) {
      const title = TAB_TITLES[tab.title];

      if (title) {
        await request(
          'mutation($id: String!, $input: UpdatePageLayoutTabInput!) { updatePageLayoutTab(id: $id, input: $input) { id } }',
          { id: tab.id, input: { title } },
        );
        console.log(`updated tab ${tab.title} -> ${title}`);
      }

      const { getPageLayoutWidgets } = await request(
        `query($pageLayoutTabId: String!) { getPageLayoutWidgets(pageLayoutTabId: $pageLayoutTabId) { id title configuration { __typename ${configurationSelection} } } }`,
        { pageLayoutTabId: tab.id },
      );

      for (const widget of getPageLayoutWidgets) {
        const input = {};

        if (WIDGET_TITLES[widget.title]) {
          input.title = WIDGET_TITLES[widget.title];
        }

        const configuration = translateConfiguration(widget.configuration);

        if (configuration) {
          input.configuration = configuration;
        }

        if (Object.keys(input).length === 0) {
          continue;
        }

        await attempt(`widget ${widget.title}`, async () => {
          await request(
            'mutation($id: String!, $input: UpdatePageLayoutWidgetInput!) { updatePageLayoutWidget(id: $id, input: $input) { id } }',
            { id: widget.id, input },
          );
          console.log(`updated widget ${widget.title}: ${Object.keys(input).join(', ')}`);
        });
      }
    }
  }
};

const translateRoles = async () => {
  const { getRoles } = await request('{ getRoles { id label description isEditable } }');

  for (const role of getRoles) {
    const target = ROLE_LABELS[role.label];

    if (!target || !role.isEditable) {
      continue;
    }

    await attempt(`role ${role.label}`, async () => {
      await request(
        'mutation($input: UpdateRoleInput!) { updateOneRole(updateRoleInput: $input) { id } }',
        { input: { id: role.id, update: target } },
      );
      console.log(`updated role ${role.label} -> ${target.label}`);
    });
  }
};

const main = async () => {
  const objects = await loadObjects();

  await translateObjects(objects);
  await translateFields(await loadObjects());
  await translateViews();
  await translateNavigation();
  await translateDashboards();
  await translateRoles();
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
