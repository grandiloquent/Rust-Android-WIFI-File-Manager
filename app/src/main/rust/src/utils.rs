use std::collections::HashMap;
use std::fs;
use std::fs::File;
use std::time::SystemTime;

use regex::Regex;
use rusqlite::{Connection, Error};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use tiny_http::{Header, Request, Response};
use urlencoding::decode;
use crate::headers::{get_content_disposition, get_header};

use crate::StringExt;

pub
fn response_file(file_path: String, req: Request, files_opened_directly: Regex, headers: HashMap<String, Header>) {
    match File::open(file_path.clone()) {
        Ok(f) => {
            let header = get_header(file_path.as_str(), &headers);
            let mut response = Response::from_file(f)
                .with_header(header);
            if !files_opened_directly.is_match(file_path.as_str()) {
                response = response.with_header(get_content_disposition(file_path.substring_after_last("/").as_str()));
            }
            let _ = req.respond(response);
        }
        Err(_) => {}
    }
}

pub fn get_notes(conn: &Connection, limit: &str) -> Result<Vec<HashMap<String, String>>, Error> {
    let mut stmt = conn.prepare("select _id,title,update_at from notes ORDER by update_at DESC LIMIT ?1")?;
    let mut rows = stmt.query([limit])?;
    let mut notes: Vec<HashMap<String, String>> = Vec::new();
    while let Some(row) = rows.next()? {
        let mut note: HashMap<String, String> = HashMap::new();
        let id:u32  = row.get(0)?;
        let title: String = row.get(1)?;
        let update_at: u64 = row.get(2)?;
        note.insert("id".to_string(), id.to_string());
        note.insert("title".to_string(), title);
        note.insert("update_at".to_string(), update_at.to_string());

        notes.push(note);
    }
    Ok(notes)
}
pub
fn update_note(conn: &Connection, content: String) {
    let json: Value = serde_json::from_str(content.as_str()).unwrap();
    match json.get("id") {
        Some(v) => {
            let mut stmt = conn.prepare("UPDATE notes SET title=?1,content=?2,update_at=?3 where _id =?4").unwrap();
        }
        None => {
            let mut stmt = conn.prepare("INSERT INTO notes (title,content,create_at,update_at) VALUES(?1,?2,?3,?4)").unwrap();
            let duration_since_epoch = SystemTime::now().duration_since(SystemTime::UNIX_EPOCH).unwrap();
            let timestamp_secs = duration_since_epoch.as_secs();
            let _ = stmt.execute([
                json.get("title").unwrap().as_str().unwrap(),
                json.get("content").unwrap().as_str().unwrap(),
                timestamp_secs.to_string().as_str(),
                timestamp_secs.to_string().as_str()
            ]);
        }
    }
}
#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct FileItem {
    pub path: String,
    pub is_directory: bool,
}

pub fn get_file_list(query: String, default_path: &str) -> Vec<FileItem> {
    let mut path = query;
    if path.is_empty() {
        path = default_path.to_string();
    } else {
        path = decode(path.as_str()).unwrap().to_string();
    }
    log::error!("{}", path);
    match fs::read_dir(path) {
        Ok(v) => {
            v.map(|res| res.map(|e| {
                FileItem {
                    path: e.path().display().to_string(),
                    is_directory: e.file_type().unwrap().is_dir(),
                }
            }))
                .collect::<Result<Vec<_>, std::io::Error>>().unwrap()
        }
        Err(_) => Vec::new()
    }
}
