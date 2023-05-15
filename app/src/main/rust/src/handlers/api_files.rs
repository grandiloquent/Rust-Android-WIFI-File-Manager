use crate::util::get_file_list;
use rocket::http::Status;
use rocket::response::content::RawJson;
use std::error::Error;
use std::fs;
use std::path::Path;
fn remove_files_extension(path: &str) -> Result<(), Box<dyn Error>> {
    let p = Path::new(&path);
    if !p.is_dir() {
        return Err("Couldn't find")?;
    }
    let entries = fs::read_dir(p)?;
    for entry in entries {
        let d = entry?;
        if d.path().is_dir() {
            continue;
        }
        match d.path().extension() {
            None => {}
            Some(v) => {
                if v.to_str().unwrap() != "srt" {
                    let s = d.path().parent().unwrap().to_str().unwrap().to_string();
                    let n = Path::new(s.as_str());
                    let nn = n.join(d.path().file_stem().unwrap());
                    let _ = fs::rename(d.path(), nn);
                }
            }
        };
    }
    Ok(())
}
#[get("/api/files?<path>")]
pub fn api_files(path: String) -> RawJson<String> {
    RawJson(
        serde_json::to_string(&get_file_list(path, "/storage/emulated/0"))
            .unwrap_or("".to_string()),
    )
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
            log::error!("{}", err.to_string());
            return Err(Status::NotFound);
        }
    };
    // https://doc.rust-lang.org/std/iter/trait.Iterator.html
    entries
        .map(|x| x.unwrap())
        .filter(|x| {
            x.path().is_dir()
                && match fs::read_dir(x.path()) {
                    Ok(v) => v.count() == 0,
                    Err(_) => false,
                }
        })
        .for_each(|x| {
            let _ = fs::remove_dir(x.path());
        });
    Ok("Success".to_string())
}
#[get("/api/files/rename?<path>")]
pub fn api_files_rename(path: String) -> Result<String, Status> {
    let _ = remove_files_extension(&path);
    Ok("Success".to_string())
}
