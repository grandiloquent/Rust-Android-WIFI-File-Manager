use std::fs;
use std::path::Path;
use rocket::http::Status;
use rocket::response::content::RawJson;
use crate::util::get_file_list;

#[get("/api/files?<path>")]
pub fn api_files(path: String) -> RawJson<String> {
    RawJson(serde_json::to_string(&get_file_list(path, "/storage/emulated/0")).unwrap_or("".to_string()))
}

#[get("/api/files/clear?<path>")]
pub fn api_files_clear(path: String) -> Result<String, Status> {
    let dir = Path::new(&path);
    if !dir.is_dir() {
        return Err(Status::NotFound);
    }
// https://doc.rust-lang.org/std/fs/struct.ReadDir.html
    let entries = match fs::read_dir(dir) {
        Ok(v) => v,
        Err(err) => {
            log::error!("{}",err.to_string());
            return Err(Status::NotFound);
        }
    };
// https://doc.rust-lang.org/std/iter/trait.Iterator.html
    entries.map(|x| x.unwrap())
        .filter(|x| x.path().is_dir() && match fs::read_dir(x.path()) {
            Ok(v) => v.count() == 0,
            Err(_) => false,
        })
        .for_each(|x| {fs::remove_dir(x.path());});
    Ok("Success".to_string())
}
