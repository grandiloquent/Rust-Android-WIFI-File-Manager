use std::sync::Arc;
use rocket::State;
use crate::asset::Cache;
use crate::res::Asset;

// http://192.168.8.55:3000/notes
#[get("/notes")]
pub fn notes<'a>(cache: &State<Arc<Cache>>) -> Asset {
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