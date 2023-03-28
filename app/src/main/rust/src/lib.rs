#![allow(unused_qualifications)]

mod utils;

use std::collections::HashMap;
use std::fs::File;
use std::ptr::NonNull;
use jni::JNIEnv;
use jni::objects::{JObject, JString};
use ndk::asset::AssetManager;
use regex::Regex;
use rusqlite::{Connection, Error};
use tiny_http::{Server, Response, Header, Request, HeaderField};
use urlencoding::decode;

use crate::utils::{extension_to_mime, get_asset_manager, get_content_disposition, get_file_list, get_header, read_asset, read_resource_file, response_file, StringExt};

fn get_notes(conn:&Connection,limit: &str) -> Result<Vec<HashMap<String, String>>, Error> {
    let mut stmt = conn.prepare("select _id,title,update_at from notes ORDER by update_at DESC LIMIT ?1")?;
    let mut rows = stmt.query([limit])?;
    let mut notes: Vec<HashMap<String, String>> = Vec::new();
    while let Some(row) = rows.next()? {
        let mut note: HashMap<String, String> = HashMap::new();
        note.insert("id".to_string(), row.get("0")?);
        note.insert("title".to_string(), row.get("1")?);
        note.insert("update_at".to_string(), row.get("2")?);

        notes.push(note);
    }
    Ok(notes)
}

fn run_server(host: &str, ass: AssetManager) {
    let server = Server::http(host).unwrap();
    let cache: HashMap<String, String> = HashMap::new();
    let headers: HashMap<String, Header> = HashMap::new();
    let re = Regex::new(r"^/[^/]+(?:js|css)").unwrap();
    let files_opened_directly = Regex::new(r".+(?:html|jpeg|png|jpg|xhtml|txt|gif)").unwrap();
    let static_pages = Regex::new(r"^/(editor|video|markdown|notes)$").unwrap();
    let conn = Connection::open("/storage/emulated/0/Books/notes.db")
        .unwrap();
    let _ = conn.execute(
        "CREATE TABLE IF NOT EXISTS notes(_id INTEGER PRIMARY KEY AUTOINCREMENT,title TEXT,content TEXT,create_at INTEGER NOT NULL,update_at  INTEGER NOT NULL)",
        (), // empty list of parameters.
    );
    for request in server.incoming_requests() {
        let original_url = request.url().to_owned();
        let path = original_url.substring_before("?");
        if path == "/" {
            let data = read_asset("index.html", cache.clone(), &ass);
            let _ = request.respond(Response::from_string(data)
                .with_header(get_header("index.html", &headers)));
        } else if static_pages.is_match(path.as_str()) {
            let filename = (*(&path[1..])).to_string() + ".html";
            let data = read_asset(filename.as_str(), cache.clone(), &ass);
            let _ = request.respond(Response::from_string(data)
                .with_header(get_header(filename.as_str(), &headers)));
        } else if re.is_match(path.as_str()) {
            let data = read_asset(&path[1..], cache.clone(), &ass);
            let _ = request.respond(Response::from_string(data)
                .with_header(get_header(&path[1..], &headers)));
        } else if path == "/api/files" {
            let query = original_url.substring_after("path=").substring_before("&");
            let list = get_file_list(query, "/storage/emulated/0");
            let data = serde_json::to_string(&list).unwrap();
            let _ = request.respond(Response::from_string(data)
                .with_header(get_header(".json", &headers)));
        } else if path == "/api/file" {
            let query = original_url.substring_after("path=").substring_before("&");
            let file_path = decode(query.as_str()).unwrap().to_string();
            response_file(file_path, request, files_opened_directly.clone(), headers.clone());
        } else if path == "/api/note" {
            let list = get_notes(&conn,"50").unwrap();
            let data = serde_json::to_string(&list).unwrap();
            let _ = request.respond(Response::from_string(data)
                .with_header(get_header(".json", &headers)));
        } else if path.starts_with("/api/") {
            let referer = request
                .headers()
                .iter()
                .find(|header| header.field == HeaderField::from_bytes("Referer").unwrap())
                .map(|header| header.value.as_str());

            let query = referer.unwrap().to_string().substring_after("path=").substring_before("&");
            let file_path = decode(query.as_str()).unwrap().to_string().substring_before_last("/");

            response_file(file_path + path.substring_after_last("/api").as_str(), request, files_opened_directly.clone(), headers.clone());
        }
    }
}

#[no_mangle]
#[allow(non_snake_case)]
pub extern "C" fn Java_psycho_euphoria_killer_MainActivity_startServer(
    env: JNIEnv,
    _class: jni::objects::JClass,
    asset_manager: JObject, host: JString,
) {
    let _host: std::string::String =
        env.get_string(host).expect("Couldn't get java string!").into();

    #[cfg(target_os = "android")]
    android_logger::init_once(
        android_logger::Config::default()
            .with_max_level(log::LevelFilter::Trace)
            .with_tag("Rust"),
    );
    let ass = get_asset_manager(env, asset_manager);
    unsafe {
        run_server(_host.as_str(), ass);
    }
}
