use std::path::PathBuf;
use std::sync::Arc;
use rocket::State;
use crate::asset::Cache;
use crate::mimetypes::extension_to_mime;
use crate::res::Asset;
#[get("/notes/notes")]
pub fn get_notes_page<'a>(cache: &State<Arc<Cache>>) -> Asset {
    match cache.get("notes/notes.html") {
        None => {
            Asset::default()
        }
        Some(data) => {
            Asset {
                data,
                content_type: "text/html; charset=utf8",
            }
        }
    }
}