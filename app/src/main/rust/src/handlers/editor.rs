use std::sync::Arc;
use rocket::State;
use crate::asset::Cache;
use crate::res::Asset;
// http://192.168.8.55:3000/editor
#[get("/editor")]
pub fn editor<'a>(cache: &State<Arc<Cache>>) -> Asset {
    match cache.get("editor/editor.html") {
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
#[get("/editor/<path>")]
pub fn editor_file(path: String, cache: &State<Arc<Cache>>) -> Asset {
    match cache.get(("editor/".to_string() + path.as_str()).as_str()) {
        None => {
            Asset::default()
        }
        Some(data) => {
            Asset {
                data,
                content_type: if path.ends_with(".js") {
                    "application/javascript"
                } else {
                    "text/css; charset=utf8"
                },
            }
        }
    }
}