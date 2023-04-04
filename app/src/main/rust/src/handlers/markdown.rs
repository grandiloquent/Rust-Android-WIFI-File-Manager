use std::sync::Arc;
use rocket::State;
use crate::asset::Cache;
use crate::res::Asset;

// http://192.168.8.55:3000/markdown
#[get("/markdown")]
pub fn markdown<'a>(cache: &State<Arc<Cache>>) -> Asset {
    match cache.get("markdown/markdown.html") {
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