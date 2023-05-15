use crate::asset::Cache;
use crate::res::Asset;
use rocket::State;
use std::sync::Arc;
#[get("/")]
pub fn index<'a>(cache: &State<Arc<Cache>>) -> Asset {
    match cache.get("index/index.html") {
        None => Asset::default(),
        Some(data) => Asset {
            data,
            content_type: "text/html; charset=utf8",
        },
    }
}
