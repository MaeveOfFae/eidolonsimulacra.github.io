#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod companion;

use companion::{
  desktop_companion_peek_incoming_workspace_bundle,
  desktop_companion_publish_workspace_bundle,
  desktop_companion_rotate_pair_code,
  desktop_companion_status,
  desktop_companion_take_incoming_workspace_bundle,
  DesktopCompanion,
};
use serde::Deserialize;
use tauri_plugin_dialog::DialogExt;
use tauri_plugin_sql::{Migration, MigrationKind};

#[derive(Debug, Deserialize)]
struct SaveDialogFilter {
  name: String,
  extensions: Vec<String>,
}

#[tauri::command]
fn save_export(
  app: tauri::AppHandle,
  default_filename: String,
  filters: Option<Vec<SaveDialogFilter>>,
  data: Vec<u8>,
) -> Result<bool, String> {
  let mut dialog = app.dialog().file().set_file_name(&default_filename);

  if let Some(filters) = filters {
    for filter in filters {
      let extensions = filter.extensions.iter().map(String::as_str).collect::<Vec<_>>();
      dialog = dialog.add_filter(filter.name, &extensions);
    }
  }

  let Some(target) = dialog.blocking_save_file() else {
    return Ok(false);
  };

  let Some(path) = target.as_path() else {
    return Err("The selected path is not available on this platform.".to_string());
  };

  if let Some(parent) = path.parent() {
    std::fs::create_dir_all(parent).map_err(|error| error.to_string())?;
  }

  std::fs::write(path, data).map_err(|error| error.to_string())?;
  Ok(true)
}

fn main() {
  let desktop_companion = DesktopCompanion::start();

  let _draft_migrations = vec![
    Migration {
      version: 1,
      description: "create_draft_storage_tables",
      sql: "
        CREATE TABLE IF NOT EXISTS drafts (
          review_id TEXT PRIMARY KEY NOT NULL,
          seed TEXT NOT NULL,
          favorite INTEGER NOT NULL DEFAULT 0,
          mode TEXT,
          model TEXT,
          created_iso TEXT,
          modified_iso TEXT,
          genre TEXT,
          notes TEXT,
          custom_instructions TEXT,
          character_name TEXT,
          template_name TEXT,
          offspring_type TEXT,
          tags_json TEXT NOT NULL DEFAULT '[]',
          component_send_order_json TEXT,
          parent_drafts_json TEXT,
          connected_drafts_json TEXT,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS asset_activity (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          draft_id TEXT NOT NULL,
          asset_name TEXT NOT NULL,
          content TEXT NOT NULL,
          created_at INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS app_meta (
          key TEXT PRIMARY KEY NOT NULL,
          value TEXT NOT NULL
        );
      ",
      kind: MigrationKind::Up,
    },
    Migration {
      version: 2,
      description: "normalize_draft_schema",
      sql: "
        CREATE TABLE IF NOT EXISTS draft_records (
          review_id TEXT PRIMARY KEY NOT NULL,
          seed TEXT NOT NULL,
          favorite INTEGER NOT NULL DEFAULT 0,
          mode TEXT,
          model TEXT,
          created_iso TEXT,
          modified_iso TEXT,
          genre TEXT,
          notes TEXT,
          custom_instructions TEXT,
          character_name TEXT,
          template_name TEXT,
          offspring_type TEXT,
          tags_json TEXT NOT NULL DEFAULT '[]',
          component_send_order_json TEXT,
          parent_drafts_json TEXT,
          connected_drafts_json TEXT,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL
        );

        CREATE TABLE IF NOT EXISTS draft_assets (
          review_id TEXT NOT NULL,
          asset_name TEXT NOT NULL,
          content TEXT NOT NULL,
          updated_at INTEGER NOT NULL,
          PRIMARY KEY (review_id, asset_name)
        );

        CREATE INDEX IF NOT EXISTS idx_draft_assets_review_id ON draft_assets(review_id);
      ",
      kind: MigrationKind::Up,
    },
    Migration {
      version: 3,
      description: "create_local_lore_tables",
      sql: "
        CREATE TABLE IF NOT EXISTS worlds (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          genre TEXT,
          setting TEXT,
          notes TEXT,
          tags_json TEXT NOT NULL DEFAULT '[]',
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS world_characters (
          id TEXT PRIMARY KEY NOT NULL,
          world_id TEXT NOT NULL,
          draft_id TEXT,
          character_name TEXT NOT NULL,
          role TEXT,
          notes TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS world_factions (
          id TEXT PRIMARY KEY NOT NULL,
          world_id TEXT NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          role TEXT,
          notes TEXT,
          tags_json TEXT NOT NULL DEFAULT '[]',
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS world_locations (
          id TEXT PRIMARY KEY NOT NULL,
          world_id TEXT NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          category TEXT,
          notes TEXT,
          tags_json TEXT NOT NULL DEFAULT '[]',
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS timelines (
          id TEXT PRIMARY KEY NOT NULL,
          world_id TEXT NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          start_date TEXT,
          end_date TEXT,
          tags_json TEXT NOT NULL DEFAULT '[]',
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS timeline_events (
          id TEXT PRIMARY KEY NOT NULL,
          timeline_id TEXT NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          event_date TEXT,
          sort_order INTEGER NOT NULL DEFAULT 0,
          tags_json TEXT NOT NULL DEFAULT '[]',
          metadata_json TEXT NOT NULL DEFAULT '{}',
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_world_characters_world_id ON world_characters(world_id);
        CREATE INDEX IF NOT EXISTS idx_world_factions_world_id ON world_factions(world_id);
        CREATE INDEX IF NOT EXISTS idx_world_locations_world_id ON world_locations(world_id);
        CREATE INDEX IF NOT EXISTS idx_timelines_world_id ON timelines(world_id);
        CREATE INDEX IF NOT EXISTS idx_timeline_events_timeline_id ON timeline_events(timeline_id);
      ",
      kind: MigrationKind::Up,
    },
    Migration {
      version: 4,
      description: "normalize_draft_arrays",
      sql: "
        CREATE TABLE IF NOT EXISTS draft_tags (
          review_id TEXT NOT NULL,
          tag TEXT NOT NULL,
          sort_order INTEGER NOT NULL DEFAULT 0,
          PRIMARY KEY (review_id, tag)
        );

        CREATE TABLE IF NOT EXISTS draft_component_send_order (
          review_id TEXT NOT NULL,
          asset_name TEXT NOT NULL,
          sort_order INTEGER NOT NULL DEFAULT 0,
          PRIMARY KEY (review_id, asset_name)
        );

        CREATE TABLE IF NOT EXISTS draft_parent_links (
          review_id TEXT NOT NULL,
          parent_review_id TEXT NOT NULL,
          sort_order INTEGER NOT NULL DEFAULT 0,
          PRIMARY KEY (review_id, parent_review_id)
        );

        CREATE TABLE IF NOT EXISTS draft_connected_links (
          review_id TEXT NOT NULL,
          connected_review_id TEXT NOT NULL,
          sort_order INTEGER NOT NULL DEFAULT 0,
          PRIMARY KEY (review_id, connected_review_id)
        );

        CREATE INDEX IF NOT EXISTS idx_draft_tags_review_id ON draft_tags(review_id);
        CREATE INDEX IF NOT EXISTS idx_draft_component_send_order_review_id ON draft_component_send_order(review_id);
        CREATE INDEX IF NOT EXISTS idx_draft_parent_links_review_id ON draft_parent_links(review_id);
        CREATE INDEX IF NOT EXISTS idx_draft_connected_links_review_id ON draft_connected_links(review_id);
      ",
      kind: MigrationKind::Up,
    },
    Migration {
      version: 5,
      description: "finalize_normalized_draft_records",
      sql: "
        INSERT OR IGNORE INTO draft_tags (review_id, tag, sort_order)
        SELECT draft_records.review_id, json_each.value, CAST(json_each.key AS INTEGER)
        FROM draft_records, json_each(draft_records.tags_json)
        WHERE draft_records.tags_json IS NOT NULL;

        INSERT OR IGNORE INTO draft_component_send_order (review_id, asset_name, sort_order)
        SELECT draft_records.review_id, json_each.value, CAST(json_each.key AS INTEGER)
        FROM draft_records, json_each(draft_records.component_send_order_json)
        WHERE draft_records.component_send_order_json IS NOT NULL;

        INSERT OR IGNORE INTO draft_parent_links (review_id, parent_review_id, sort_order)
        SELECT draft_records.review_id, json_each.value, CAST(json_each.key AS INTEGER)
        FROM draft_records, json_each(draft_records.parent_drafts_json)
        WHERE draft_records.parent_drafts_json IS NOT NULL;

        INSERT OR IGNORE INTO draft_connected_links (review_id, connected_review_id, sort_order)
        SELECT draft_records.review_id, json_each.value, CAST(json_each.key AS INTEGER)
        FROM draft_records, json_each(draft_records.connected_drafts_json)
        WHERE draft_records.connected_drafts_json IS NOT NULL;

        CREATE TABLE IF NOT EXISTS draft_records_v2 (
          review_id TEXT PRIMARY KEY NOT NULL,
          seed TEXT NOT NULL,
          favorite INTEGER NOT NULL DEFAULT 0,
          mode TEXT,
          model TEXT,
          created_iso TEXT,
          modified_iso TEXT,
          genre TEXT,
          notes TEXT,
          custom_instructions TEXT,
          character_name TEXT,
          template_name TEXT,
          offspring_type TEXT,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL
        );

        INSERT OR REPLACE INTO draft_records_v2 (
          review_id,
          seed,
          favorite,
          mode,
          model,
          created_iso,
          modified_iso,
          genre,
          notes,
          custom_instructions,
          character_name,
          template_name,
          offspring_type,
          created_at,
          updated_at
        )
        SELECT
          review_id,
          seed,
          favorite,
          mode,
          model,
          created_iso,
          modified_iso,
          genre,
          notes,
          custom_instructions,
          character_name,
          template_name,
          offspring_type,
          created_at,
          updated_at
        FROM draft_records;

        DROP TABLE draft_records;
        ALTER TABLE draft_records_v2 RENAME TO draft_records;
      ",
      kind: MigrationKind::Up,
    },
    Migration {
      version: 6,
      description: "normalize_lore_tags",
      sql: "
        CREATE TABLE IF NOT EXISTS world_tags (
          world_id TEXT NOT NULL,
          tag TEXT NOT NULL,
          sort_order INTEGER NOT NULL DEFAULT 0,
          PRIMARY KEY (world_id, tag)
        );

        CREATE TABLE IF NOT EXISTS world_faction_tags (
          faction_id TEXT NOT NULL,
          tag TEXT NOT NULL,
          sort_order INTEGER NOT NULL DEFAULT 0,
          PRIMARY KEY (faction_id, tag)
        );

        CREATE TABLE IF NOT EXISTS world_location_tags (
          location_id TEXT NOT NULL,
          tag TEXT NOT NULL,
          sort_order INTEGER NOT NULL DEFAULT 0,
          PRIMARY KEY (location_id, tag)
        );

        CREATE TABLE IF NOT EXISTS timeline_tags (
          timeline_id TEXT NOT NULL,
          tag TEXT NOT NULL,
          sort_order INTEGER NOT NULL DEFAULT 0,
          PRIMARY KEY (timeline_id, tag)
        );

        CREATE TABLE IF NOT EXISTS timeline_event_tags (
          event_id TEXT NOT NULL,
          tag TEXT NOT NULL,
          sort_order INTEGER NOT NULL DEFAULT 0,
          PRIMARY KEY (event_id, tag)
        );

        INSERT OR IGNORE INTO world_tags (world_id, tag, sort_order)
        SELECT worlds.id, json_each.value, CAST(json_each.key AS INTEGER)
        FROM worlds, json_each(worlds.tags_json)
        WHERE worlds.tags_json IS NOT NULL;

        INSERT OR IGNORE INTO world_faction_tags (faction_id, tag, sort_order)
        SELECT world_factions.id, json_each.value, CAST(json_each.key AS INTEGER)
        FROM world_factions, json_each(world_factions.tags_json)
        WHERE world_factions.tags_json IS NOT NULL;

        INSERT OR IGNORE INTO world_location_tags (location_id, tag, sort_order)
        SELECT world_locations.id, json_each.value, CAST(json_each.key AS INTEGER)
        FROM world_locations, json_each(world_locations.tags_json)
        WHERE world_locations.tags_json IS NOT NULL;

        INSERT OR IGNORE INTO timeline_tags (timeline_id, tag, sort_order)
        SELECT timelines.id, json_each.value, CAST(json_each.key AS INTEGER)
        FROM timelines, json_each(timelines.tags_json)
        WHERE timelines.tags_json IS NOT NULL;

        INSERT OR IGNORE INTO timeline_event_tags (event_id, tag, sort_order)
        SELECT timeline_events.id, json_each.value, CAST(json_each.key AS INTEGER)
        FROM timeline_events, json_each(timeline_events.tags_json)
        WHERE timeline_events.tags_json IS NOT NULL;

        CREATE INDEX IF NOT EXISTS idx_world_tags_world_id ON world_tags(world_id);
        CREATE INDEX IF NOT EXISTS idx_world_faction_tags_faction_id ON world_faction_tags(faction_id);
        CREATE INDEX IF NOT EXISTS idx_world_location_tags_location_id ON world_location_tags(location_id);
        CREATE INDEX IF NOT EXISTS idx_timeline_tags_timeline_id ON timeline_tags(timeline_id);
        CREATE INDEX IF NOT EXISTS idx_timeline_event_tags_event_id ON timeline_event_tags(event_id);
      ",
      kind: MigrationKind::Up,
    },
  ];

  let lore_migrations = vec![
    Migration {
      version: 1,
      description: "create_local_lore_tables",
      sql: "
        CREATE TABLE IF NOT EXISTS worlds (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          genre TEXT,
          setting TEXT,
          notes TEXT,
          tags_json TEXT NOT NULL DEFAULT '[]',
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS world_characters (
          id TEXT PRIMARY KEY NOT NULL,
          world_id TEXT NOT NULL,
          draft_id TEXT,
          character_name TEXT NOT NULL,
          role TEXT,
          notes TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS world_factions (
          id TEXT PRIMARY KEY NOT NULL,
          world_id TEXT NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          role TEXT,
          notes TEXT,
          tags_json TEXT NOT NULL DEFAULT '[]',
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS world_locations (
          id TEXT PRIMARY KEY NOT NULL,
          world_id TEXT NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          category TEXT,
          notes TEXT,
          tags_json TEXT NOT NULL DEFAULT '[]',
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS timelines (
          id TEXT PRIMARY KEY NOT NULL,
          world_id TEXT NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          start_date TEXT,
          end_date TEXT,
          tags_json TEXT NOT NULL DEFAULT '[]',
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS timeline_events (
          id TEXT PRIMARY KEY NOT NULL,
          timeline_id TEXT NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          event_date TEXT,
          sort_order INTEGER NOT NULL DEFAULT 0,
          tags_json TEXT NOT NULL DEFAULT '[]',
          metadata_json TEXT NOT NULL DEFAULT '{}',
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_world_characters_world_id ON world_characters(world_id);
        CREATE INDEX IF NOT EXISTS idx_world_factions_world_id ON world_factions(world_id);
        CREATE INDEX IF NOT EXISTS idx_world_locations_world_id ON world_locations(world_id);
        CREATE INDEX IF NOT EXISTS idx_timelines_world_id ON timelines(world_id);
        CREATE INDEX IF NOT EXISTS idx_timeline_events_timeline_id ON timeline_events(timeline_id);
      ",
      kind: MigrationKind::Up,
    },
    Migration {
      version: 2,
      description: "normalize_lore_tags",
      sql: "
        CREATE TABLE IF NOT EXISTS world_tags (
          world_id TEXT NOT NULL,
          tag TEXT NOT NULL,
          sort_order INTEGER NOT NULL DEFAULT 0,
          PRIMARY KEY (world_id, tag)
        );

        CREATE TABLE IF NOT EXISTS world_faction_tags (
          faction_id TEXT NOT NULL,
          tag TEXT NOT NULL,
          sort_order INTEGER NOT NULL DEFAULT 0,
          PRIMARY KEY (faction_id, tag)
        );

        CREATE TABLE IF NOT EXISTS world_location_tags (
          location_id TEXT NOT NULL,
          tag TEXT NOT NULL,
          sort_order INTEGER NOT NULL DEFAULT 0,
          PRIMARY KEY (location_id, tag)
        );

        CREATE TABLE IF NOT EXISTS timeline_tags (
          timeline_id TEXT NOT NULL,
          tag TEXT NOT NULL,
          sort_order INTEGER NOT NULL DEFAULT 0,
          PRIMARY KEY (timeline_id, tag)
        );

        CREATE TABLE IF NOT EXISTS timeline_event_tags (
          event_id TEXT NOT NULL,
          tag TEXT NOT NULL,
          sort_order INTEGER NOT NULL DEFAULT 0,
          PRIMARY KEY (event_id, tag)
        );

        INSERT OR IGNORE INTO world_tags (world_id, tag, sort_order)
        SELECT worlds.id, json_each.value, CAST(json_each.key AS INTEGER)
        FROM worlds, json_each(worlds.tags_json)
        WHERE worlds.tags_json IS NOT NULL;

        INSERT OR IGNORE INTO world_faction_tags (faction_id, tag, sort_order)
        SELECT world_factions.id, json_each.value, CAST(json_each.key AS INTEGER)
        FROM world_factions, json_each(world_factions.tags_json)
        WHERE world_factions.tags_json IS NOT NULL;

        INSERT OR IGNORE INTO world_location_tags (location_id, tag, sort_order)
        SELECT world_locations.id, json_each.value, CAST(json_each.key AS INTEGER)
        FROM world_locations, json_each(world_locations.tags_json)
        WHERE world_locations.tags_json IS NOT NULL;

        INSERT OR IGNORE INTO timeline_tags (timeline_id, tag, sort_order)
        SELECT timelines.id, json_each.value, CAST(json_each.key AS INTEGER)
        FROM timelines, json_each(timelines.tags_json)
        WHERE timelines.tags_json IS NOT NULL;

        INSERT OR IGNORE INTO timeline_event_tags (event_id, tag, sort_order)
        SELECT timeline_events.id, json_each.value, CAST(json_each.key AS INTEGER)
        FROM timeline_events, json_each(timeline_events.tags_json)
        WHERE timeline_events.tags_json IS NOT NULL;

        CREATE INDEX IF NOT EXISTS idx_world_tags_world_id ON world_tags(world_id);
        CREATE INDEX IF NOT EXISTS idx_world_faction_tags_faction_id ON world_faction_tags(faction_id);
        CREATE INDEX IF NOT EXISTS idx_world_location_tags_location_id ON world_location_tags(location_id);
        CREATE INDEX IF NOT EXISTS idx_timeline_tags_timeline_id ON timeline_tags(timeline_id);
        CREATE INDEX IF NOT EXISTS idx_timeline_event_tags_event_id ON timeline_event_tags(event_id);
      ",
      kind: MigrationKind::Up,
    },
    Migration {
      version: 3,
      description: "finalize_normalized_lore_records",
      sql: "
        CREATE TABLE IF NOT EXISTS worlds_v2 (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          genre TEXT,
          setting TEXT,
          notes TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        INSERT OR REPLACE INTO worlds_v2 (id, name, description, genre, setting, notes, created_at, updated_at)
        SELECT id, name, description, genre, setting, notes, created_at, updated_at FROM worlds;

        DROP TABLE worlds;
        ALTER TABLE worlds_v2 RENAME TO worlds;

        CREATE TABLE IF NOT EXISTS world_factions_v2 (
          id TEXT PRIMARY KEY NOT NULL,
          world_id TEXT NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          role TEXT,
          notes TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        INSERT OR REPLACE INTO world_factions_v2 (id, world_id, name, description, role, notes, created_at, updated_at)
        SELECT id, world_id, name, description, role, notes, created_at, updated_at FROM world_factions;

        DROP TABLE world_factions;
        ALTER TABLE world_factions_v2 RENAME TO world_factions;

        CREATE TABLE IF NOT EXISTS world_locations_v2 (
          id TEXT PRIMARY KEY NOT NULL,
          world_id TEXT NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          category TEXT,
          notes TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        INSERT OR REPLACE INTO world_locations_v2 (id, world_id, name, description, category, notes, created_at, updated_at)
        SELECT id, world_id, name, description, category, notes, created_at, updated_at FROM world_locations;

        DROP TABLE world_locations;
        ALTER TABLE world_locations_v2 RENAME TO world_locations;

        CREATE TABLE IF NOT EXISTS timelines_v2 (
          id TEXT PRIMARY KEY NOT NULL,
          world_id TEXT NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          start_date TEXT,
          end_date TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        INSERT OR REPLACE INTO timelines_v2 (id, world_id, name, description, start_date, end_date, created_at, updated_at)
        SELECT id, world_id, name, description, start_date, end_date, created_at, updated_at FROM timelines;

        DROP TABLE timelines;
        ALTER TABLE timelines_v2 RENAME TO timelines;

        CREATE TABLE IF NOT EXISTS timeline_events_v2 (
          id TEXT PRIMARY KEY NOT NULL,
          timeline_id TEXT NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          event_date TEXT,
          sort_order INTEGER NOT NULL DEFAULT 0,
          metadata_json TEXT NOT NULL DEFAULT '{}',
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        INSERT OR REPLACE INTO timeline_events_v2 (id, timeline_id, title, description, event_date, sort_order, metadata_json, created_at, updated_at)
        SELECT id, timeline_id, title, description, event_date, sort_order, metadata_json, created_at, updated_at FROM timeline_events;

        DROP TABLE timeline_events;
        ALTER TABLE timeline_events_v2 RENAME TO timeline_events;

        CREATE INDEX IF NOT EXISTS idx_world_characters_world_id ON world_characters(world_id);
        CREATE INDEX IF NOT EXISTS idx_world_factions_world_id ON world_factions(world_id);
        CREATE INDEX IF NOT EXISTS idx_world_locations_world_id ON world_locations(world_id);
        CREATE INDEX IF NOT EXISTS idx_timelines_world_id ON timelines(world_id);
        CREATE INDEX IF NOT EXISTS idx_timeline_events_timeline_id ON timeline_events(timeline_id);
      ",
      kind: MigrationKind::Up,
    },
    Migration {
      version: 4,
      description: "add_lore_draft_link_tables",
      sql: "
        CREATE TABLE IF NOT EXISTS world_faction_draft_links (
          faction_id TEXT NOT NULL,
          draft_id TEXT NOT NULL,
          sort_order INTEGER NOT NULL DEFAULT 0,
          PRIMARY KEY (faction_id, draft_id)
        );

        CREATE TABLE IF NOT EXISTS world_location_draft_links (
          location_id TEXT NOT NULL,
          draft_id TEXT NOT NULL,
          sort_order INTEGER NOT NULL DEFAULT 0,
          PRIMARY KEY (location_id, draft_id)
        );

        CREATE INDEX IF NOT EXISTS idx_world_faction_draft_links_faction_id ON world_faction_draft_links(faction_id);
        CREATE INDEX IF NOT EXISTS idx_world_location_draft_links_location_id ON world_location_draft_links(location_id);
      ",
      kind: MigrationKind::Up,
    },
    Migration {
      version: 5,
      description: "add_world_relationships",
      sql: "
        CREATE TABLE IF NOT EXISTS world_relationships (
          id TEXT PRIMARY KEY NOT NULL,
          world_id TEXT NOT NULL,
          source_character_id TEXT NOT NULL,
          target_character_id TEXT NOT NULL,
          label TEXT NOT NULL,
          notes TEXT,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        CREATE INDEX IF NOT EXISTS idx_world_relationships_world_id ON world_relationships(world_id);
        CREATE INDEX IF NOT EXISTS idx_world_relationships_source_character_id ON world_relationships(source_character_id);
        CREATE INDEX IF NOT EXISTS idx_world_relationships_target_character_id ON world_relationships(target_character_id);
      ",
      kind: MigrationKind::Up,
    },
  ];

  tauri::Builder::default()
    .manage(desktop_companion)
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_http::init())
    .plugin(tauri_plugin_opener::init())
    .plugin(
      tauri_plugin_sql::Builder::default()
        .add_migrations("sqlite:eidolon-lore.db", lore_migrations)
        .build(),
    )
    .invoke_handler(tauri::generate_handler![
      save_export,
      desktop_companion_status,
      desktop_companion_rotate_pair_code,
      desktop_companion_publish_workspace_bundle,
      desktop_companion_peek_incoming_workspace_bundle,
      desktop_companion_take_incoming_workspace_bundle,
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}