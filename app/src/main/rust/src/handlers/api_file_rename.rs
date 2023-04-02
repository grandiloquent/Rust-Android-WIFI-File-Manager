use std::path::Path;
use rocket::fs::NamedFile;
use crate::handlers::data::Message;
use rocket::serde::json::{json, Value};

#[get("/api/file/rename?<path>&<dst>")]
pub async fn api_file_rename(path: String, dst: String) -> Value {
// https://doc.rust-lang.org/std/path/struct.Path.html

    let p = Path::new(path.as_str());
    if !p.exists() {
        json!({
            "error":1
        })
    } else {
        json!({
            "error":0
        })
    }
}