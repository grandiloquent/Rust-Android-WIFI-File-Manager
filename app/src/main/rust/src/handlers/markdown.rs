use crate::asset::Cache;
use crate::res::Asset;
use rocket::State;
use std::sync::Arc;
// http://192.168.8.55:3000/markdown
#[get("/markdown")]
pub fn markdown<'a>(cache: &State<Arc<Cache>>) -> Asset {
    match cache.get("markdown/markdown.html") {
        None => Asset::default(),
        Some(data) => Asset {
            data,
            content_type: "text/html; charset=utf8",
        },
    }
}
#[get("/markdown/<path>")]
pub fn markdown_file(path: String, cache: &State<Arc<Cache>>) -> Asset {
    match cache.get(("markdown/".to_string() + path.as_str()).as_str()) {
        None => Asset::default(),
        Some(data) => Asset {
            data,
            content_type: if path.ends_with(".js") {
                "application/javascript"
            } else {
                "text/css; charset=utf8"
            },
        },
    }
}
