use std::path::{Path, PathBuf};
use rocket::fs::NamedFile;
use crate::handlers::data::Message;
use rocket::serde::json::{json, Value};
use std::fs;

#[get("/api/file/rename?<path>&<dst>")]
pub async fn api_file_rename(path: String, dst: String) -> Value {
// https://doc.rust-lang.org/std/path/struct.Path.html

    let p = Path::new(path.as_str());
    if !p.exists() {
        json!({
            "error":1
        })
    } else {

        if let Some(value) = p.parent() {
            let d = value.join(dst);
            if !d.exists() {
                fs::rename(p, d);
            }
        } else {}
// https://doc.rust-lang.org/std/fs/fn.rename.html

        json!({
            "error":0
        })
    }
}