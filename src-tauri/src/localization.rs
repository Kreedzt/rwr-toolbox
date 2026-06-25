//! Game localization loader for RWR toolbox
//!
//! Reads RWR's bundled localization files and builds a map from each English
//! in-game name (the XML `key`) to its translated string (`text`). This lets
//! the data pages search weapons/items by their localized names, e.g. typing
//! "霰弹枪" to find "AA-12".
//!
//! Localization lives in `<package>/languages/<lang>/misc_text*.xml`, with
//! entries like `<text key="AA-12" text="AA-12全自动霰弹枪" />`. The `key` is
//! exactly the weapon/item `name` parsed elsewhere, so a plain string lookup
//! is enough. Files carry a UTF-8 BOM and may use different root elements
//! (`<translation>`, `<ui>`, ...), so we scan for `<text>` events directly.

use crate::utils::resolve_packages_dirs;
use quick_xml::events::Event;
use quick_xml::reader::Reader;
use std::collections::HashMap;
use std::path::Path;
use walkdir::WalkDir;

/// Map an application language code to the RWR language directory name.
///
/// The app uses `en`/`zh`; RWR uses `en`/`cn`. Unknown codes fall back to `en`.
fn rwr_lang_code(app_lang: &str) -> &'static str {
    match app_lang {
        "zh" => "cn",
        "en" => "en",
        _ => "en",
    }
}

/// Extract `key` -> `text` pairs from a single localization XML file.
///
/// Entries whose `text` is empty (common in the `en` directory, where the
/// translation equals the key) are skipped.
fn parse_localization_file(path: &Path, map: &mut HashMap<String, String>) {
    let mut reader = match Reader::from_file(path) {
        Ok(r) => r,
        Err(_) => return,
    };
    reader.config_mut().trim_text(true);

    let mut buf = Vec::new();
    loop {
        match reader.read_event_into(&mut buf) {
            // `<text .../>` (self-closing) and `<text ...>` both carry the attrs.
            Ok(Event::Empty(e)) | Ok(Event::Start(e)) if e.name().as_ref() == b"text" => {
                let mut key: Option<String> = None;
                let mut text: Option<String> = None;
                for attr in e.attributes().flatten() {
                    match attr.key.as_ref() {
                        b"key" => {
                            key = attr
                                .decode_and_unescape_value(reader.decoder())
                                .ok()
                                .map(|c| c.into_owned());
                        }
                        b"text" => {
                            text = attr
                                .decode_and_unescape_value(reader.decoder())
                                .ok()
                                .map(|c| c.into_owned());
                        }
                        _ => {}
                    }
                }
                if let (Some(k), Some(t)) = (key, text) {
                    if !k.is_empty() && !t.is_empty() {
                        map.insert(k, t);
                    }
                }
            }
            Ok(Event::Eof) => break,
            Err(_) => break,
            _ => {}
        }
        buf.clear();
    }
}

/// Load and merge the localization map for the given app language.
///
/// Walks every package directory under the resolved package roots, reads each
/// `<package>/languages/<lang>/misc_text*.xml`, and merges all entries. Later
/// entries override earlier ones. Missing directories are silently ignored.
pub fn load_translations(
    game_path: &str,
    directory: Option<&str>,
    app_lang: &str,
) -> HashMap<String, String> {
    let lang = rwr_lang_code(app_lang);
    let source_directory = directory.unwrap_or(game_path);
    let package_roots = resolve_packages_dirs(Path::new(source_directory));

    let mut map: HashMap<String, String> = HashMap::new();

    for root in package_roots {
        if !root.exists() {
            continue;
        }
        // Each immediate child of a packages root is a package directory.
        let packages = match std::fs::read_dir(&root) {
            Ok(entries) => entries,
            Err(_) => continue,
        };
        for pkg in packages.flatten() {
            let lang_dir = pkg.path().join("languages").join(lang);
            if !lang_dir.is_dir() {
                continue;
            }
            for entry in WalkDir::new(&lang_dir)
                .max_depth(1)
                .into_iter()
                .filter_map(|e| e.ok())
            {
                let path = entry.path();
                let is_misc_text = path.extension().is_some_and(|ext| ext == "xml")
                    && path
                        .file_name()
                        .and_then(|n| n.to_str())
                        .is_some_and(|n| n.starts_with("misc_text"));
                if is_misc_text {
                    parse_localization_file(path, &mut map);
                }
            }
        }
    }

    map
}

/// Tauri command: return the localized name map for the active app language.
#[tauri::command]
pub async fn get_game_translations(
    game_path: String,
    directory: Option<String>,
    lang: String,
) -> Result<HashMap<String, String>, String> {
    Ok(load_translations(&game_path, directory.as_deref(), &lang))
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::io::Write;

    fn write_file(dir: &Path, name: &str, content: &str) {
        let mut f = std::fs::File::create(dir.join(name)).unwrap();
        f.write_all(content.as_bytes()).unwrap();
    }

    #[test]
    fn rwr_lang_code_maps_correctly() {
        assert_eq!(rwr_lang_code("zh"), "cn");
        assert_eq!(rwr_lang_code("en"), "en");
        assert_eq!(rwr_lang_code("fr"), "en");
    }

    #[test]
    fn parses_and_skips_empty_text() {
        let tmp = std::env::temp_dir().join("rwr_loc_test_parse");
        let _ = std::fs::remove_dir_all(&tmp);
        std::fs::create_dir_all(&tmp).unwrap();
        // Includes a BOM, mixed root element, self-closing entries, and an
        // empty-text entry that must be skipped.
        let content = "\u{feff}<?xml version=\"1.0\" encoding=\"utf-8\"?>\n\
            <translation>\n\
            \t<text key=\"AA-12\" text=\"AA-12全自动霰弹枪\" />\n\
            \t<text key=\"Medikit\" text=\"医疗包\" />\n\
            \t<text key=\"Empty\" />\n\
            </translation>";
        write_file(&tmp, "misc_text_vanilla.xml", content);

        let mut map = HashMap::new();
        parse_localization_file(&tmp.join("misc_text_vanilla.xml"), &mut map);

        assert_eq!(map.get("AA-12").map(String::as_str), Some("AA-12全自动霰弹枪"));
        assert_eq!(map.get("Medikit").map(String::as_str), Some("医疗包"));
        assert!(!map.contains_key("Empty"));

        let _ = std::fs::remove_dir_all(&tmp);
    }

    #[test]
    fn load_translations_walks_package_languages() {
        let tmp = std::env::temp_dir().join("rwr_loc_test_load");
        let _ = std::fs::remove_dir_all(&tmp);
        let lang_dir = tmp.join("packages").join("vanilla").join("languages").join("cn");
        std::fs::create_dir_all(&lang_dir).unwrap();
        write_file(
            &lang_dir,
            "misc_text_vanilla.xml",
            "<translation><text key=\"AK47\" text=\"AK47突击步枪\" /></translation>",
        );

        // base path ends with the parent of `packages`
        let map = load_translations(tmp.to_str().unwrap(), None, "zh");
        assert_eq!(map.get("AK47").map(String::as_str), Some("AK47突击步枪"));

        let _ = std::fs::remove_dir_all(&tmp);
    }
}
