use std::error::Error;
use std::path::{Path};
use rocket::serde::json::{json, Value};
use std::{fs, io};
use std::io::ErrorKind;


fn read_file(p: &Path) -> Result<(), Box<dyn Error>> {
    let mut d = match p.parent() {
        Some(v) => v,
        None => Err("Bad request")?,
    };
// https://doc.rust-lang.org/std/path/struct.Path.html#method.file_stem
// https://doc.rust-lang.org/std/ffi/struct.OsStr.html#method.to_str


    let file_stem = match p.file_stem() {
        Some(v) => v,
        None => Err("Bad request")?,
    };
    let to_str = match file_stem.to_str() {
        Some(v) => v,
        None => Err("Bad request")?,
    };
   let dx = d.join(to_str);

    let file = fs::File::open(p)?;
    let mut archive = zip::ZipArchive::new(file)?;
    for i in 0..archive.len() {
        let mut file = archive.by_index(i)?;
        let mut outpath = match file.enclosed_name() {
            Some(path) => path.to_owned(),
            None => continue,
        };
        outpath = dx.join(outpath.to_str().unwrap().replace("\\", "/"));
        if (*file.name()).ends_with('/') {
            fs::create_dir_all(&outpath)?;
        } else {
            if let Some(p) = outpath.parent() {
                if !p.exists() {
                    fs::create_dir_all(p)?;
                }
            }
            let mut outfile = fs::File::create(&outpath)?;
            io::copy(&mut file, &mut outfile)?;
        }
    }
    Ok(())
}


// https://github.com/zip-rs/zip

#[get("/api/zip?<path>")]
pub async fn api_zip(path: String) -> Value {
// https://doc.rust-lang.org/std/path/struct.Path.html

    let p = Path::new(path.as_str());
    if !p.is_file() {
        json!({
            "error":1
        })
    } else {
        if let Err(value) = read_file(p) {
            log::error!("{}",value.to_string());
        }
// https://doc.rust-lang.org/std/fs/fn.rename.html

        json!({
            "error":0
        })
    }
}