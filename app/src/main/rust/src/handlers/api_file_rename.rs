use std::path::{Path};
use rocket::serde::json::{json, Value};
use std::fs;
use rocket::serde::{json::Json};
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
#[post("/api/file/move?<dst>", data = "<list>")]
pub async fn api_file_move(dst: String, list: Json<Vec<String>>) -> Value {
// https://doc.rust-lang.org/std/path/struct.Path.html
    let d = Path::new(dst.as_str());
    for path in list.into_inner() {
        let p = Path::new(path.as_str());
        let f = d.join(p.file_name().unwrap().to_str().unwrap());
        if !f.exists() {
            fs::rename(p, f);
        }
    }
// https://doc.rust-lang.org/stable/std/fs/fn.remove_dir_all.html
    json!({
            "error":0
        })
}