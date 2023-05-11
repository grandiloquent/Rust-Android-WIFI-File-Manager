use crate::strings::StringExt;
use rocket::futures::future::err;
use rocket::http::{ContentType, Status};
use rocket::response::stream::ReaderStream;
use rocket::response::Responder;
use rocket::serde::json::{json, Value};
use rocket::{response, Request, Response, State};
use std::borrow::{BorrowMut, Cow};
use std::fmt::Error;
use std::fs;
use std::fs::File;
use std::io::prelude::*;
use std::io::{BufWriter, Cursor, Seek, Write};
use std::iter::Iterator;
use std::path::{Path, PathBuf};
use walkdir::WalkDir;
use zip::result::ZipError;
use zip::write::FileOptions;
fn zip_dir<T>(
    it: &mut dyn Iterator<Item = walkdir::DirEntry>,
    prefix: &str,
    writer: T,
    method: zip::CompressionMethod,
) -> zip::result::ZipResult<()>
where
    T: Write + Seek,
{
    let mut zip = zip::ZipWriter::new(writer);
    let options = FileOptions::default()
        .compression_method(method)
        .unix_permissions(0o755);
    let mut buffer = Vec::new();
    for entry in it {
        let path = entry.path();
        let name = path.strip_prefix(Path::new(prefix)).unwrap();
        // Write file or directory explicitly
        // Some unzip tools unzip files with directory paths correctly, some do not!
        if path.is_file() {
            println!("adding file {path:?} as {name:?} ...");
            #[allow(deprecated)]
            zip.start_file_from_path(name, options)?;
            let mut f = File::open(path)?;
            f.read_to_end(&mut buffer)?;
            zip.write_all(&buffer)?;
            buffer.clear();
        } else if !name.as_os_str().is_empty() {
            // Only if not root! Avoids path spec / warning
            // and mapname conversion failed error on unzip
            println!("adding dir {path:?} as {name:?} ...");
            #[allow(deprecated)]
            zip.add_directory_from_path(name, options)?;
        }
    }
    zip.finish()?;
    Result::Ok(())
}
const METHOD_STORED: Option<zip::CompressionMethod> = Some(zip::CompressionMethod::Stored);
// http://192.168.8.189:3000/compress_dir?path=D:\Books9
#[get("/compress_dir?<path>")]
pub async fn compress_zip(path: String) -> FileResponse {
    println!("{}", path);
    // https://doc.rust-lang.org/std/path/struct.Path.html
    //     match list_files(path.as_str()) {
    //         Ok(p) => {
    //             for file in p {
    //                 if !file.is_dir() {
    //                     continue;
    //                 }
    //                 doit(file.to_str().unwrap(),
    //                      (file.to_str().unwrap().to_string() + ".zip").as_str(),
    //                      METHOD_STORED.unwrap(),
    //                 );
    //             }
    //         }
    //         Err(_) => {
    //             return Err(Status::NotFound);
    //         }
    //     }
    //     Ok(())
    FileResponse::new(path)
}
fn list_files(path: &str) -> Result<Vec<PathBuf>, std::io::Error> {
    let mut list = Vec::new();
    let read_dir = fs::read_dir(path)?;
    for entry in read_dir {
        let dir_entry = entry?;
        list.push(dir_entry.path())
    }
    return Ok(list);
}
// https://github.com/zip-rs/zip/blob/master/examples/write_dir.rs
fn doit(
    src_dir: &str,
    dst_file: &str,
    method: zip::CompressionMethod,
) -> zip::result::ZipResult<()> {
    if !Path::new(src_dir).is_dir() {
        return Err(ZipError::FileNotFound);
    }
    let path = Path::new(dst_file);
    let file = File::create(path).unwrap();
    let walkdir = WalkDir::new(src_dir);
    let it = walkdir.into_iter();
    zip_dir(&mut it.filter_map(|e| e.ok()), src_dir, file, method)?;
    Ok(())
}
pub struct FileResponse {
    dir: String,
}
impl FileResponse {
    pub fn new(dir: String) -> FileResponse {
        FileResponse { dir }
    }
}
#[rocket::async_trait]
impl<'r> Responder<'r, 'static> for FileResponse {
    fn respond_to(self, req: &'r rocket::Request<'_>) -> response::Result<'static> {
        let buf = Vec::<u8>::new();
        let buf = Cursor::new(buf);
        let mut zip = zip::ZipWriter::new(buf);
        let options = FileOptions::default()
            .compression_method(zip::CompressionMethod::Stored)
            .unix_permissions(0o755);
        let mut buffer = Vec::new();
        let walkdir = WalkDir::new(&self.dir);
        let it = walkdir.into_iter();
        for entry in it {
            let path = entry.unwrap().path().to_owned();
            let name = path.strip_prefix(Path::new(&self.dir)).unwrap();
            // Write file or directory explicitly
            // Some unzip tools unzip files with directory paths correctly, some do not!
            if path.is_file() {
                #[allow(deprecated)]
                zip.start_file_from_path(name, options).unwrap();
                let mut f = File::open(path).unwrap();
                f.read_to_end(&mut buffer).unwrap();
                zip.write_all(&buffer).unwrap();
                buffer.clear();
            } else if !name.as_os_str().is_empty() {
                // Only if not root! Avoids path spec / warning
                // and mapname conversion failed error on unzip
                #[allow(deprecated)]
                zip.add_directory_from_path(name, options).unwrap();
            }
        }
        let mut buf = zip.finish().unwrap();
        let bytes_written = buf.position();
        //let buf = buf.get_ref();
        // These are the bytes we want
        // let compressed_bytes = &buf[..bytes_written as usize];
        buf.set_position(0);
        Response::build()
            .status(Status::Ok)
            .header(ContentType::ZIP)
            .raw_header(
                "Content-Disposition",
                // TODO: escape?
                format!(
                    "attachment; filename=\"{}.zip\"",
                    self.dir.substring_after_last("\\")
                ),
            )
            .sized_body(bytes_written as usize, buf)
            .ok()
    }
}
