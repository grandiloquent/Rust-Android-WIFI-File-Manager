#![allow(unused_qualifications)]

use std::collections::HashMap;
use std::fs;
use ascii::AsciiChar::c;

use jni::JNIEnv;
use jni::objects::{JObject, JString};
use ndk::asset::AssetManager;
use regex::Regex;
use rusqlite::{Connection, Error};
use tiny_http::{Header, HeaderField, Response, Server};
use urlencoding::decode;

use crate::assets::{get_asset_manager, read_asset};
use crate::handlers::{Context,handle_page};
use crate::headers::get_header;
use crate::strings::StringExt;
use crate::utils::{get_file_list, get_notes, response_file, update_note};

mod utils;
mod assets;
mod mimetypes;
mod strings;
mod headers;
mod handlers;

fn get_query_parameters(original_url: &str, name: String) -> String {
    original_url.to_string().substring_after((name + "=").as_str()).substring_before("&")
}

fn run_server(host: &str, ass: AssetManager) {
    let server = Server::http(host).unwrap();
    let cache: HashMap<&str, String> = HashMap::new();
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

    let context = Context {
        cache: &cache,
        ass: &ass,
        headers: &headers,
    };
    for mut request in server.incoming_requests() {
        let original_url = request.url().to_owned();
        let path = original_url.substring_before("?");
        if path == "/" {
            handle_page("index.html", &context, request);
        } else if static_pages.is_match(path.as_str()) {
            let filename = (&path[1..]).to_string() + ".html";
            handle_page(filename.as_str(), &context, request);
        } else if re.is_match(path.as_str()) {
            let data = read_asset((&path[1..]).to_string(), &cache, &ass).unwrap();
            let _ = request.respond(Response::from_string(data)
                .with_header(get_header(&path[1..], &headers)));
        } else if path == "/api/files" {
            let query = original_url.substring_after("path=").substring_before("&");
            let list = get_file_list(query, "/storage/emulated/0");
            let data = serde_json::to_string(&list).unwrap();
            let _ = request.respond(Response::from_string(data)
                .with_header(get_header(".json", &headers)));
        } else if path == "/api/file" {
            if original_url.contains("action=") {
                let action = original_url.substring_after("action=").substring_before("&");
                if action == "3" {
                    let query = original_url.substring_after("path=").substring_before("&");
                    let file_path = decode(query.as_str()).unwrap().to_string();
                    if std::path::Path::new(file_path.as_str()).is_dir() {
                        let _ = fs::remove_dir_all(file_path);
                    } else {
                        fs::remove_file(file_path);
                    }
                }
            } else {
                let query = original_url.substring_after("path=").substring_before("&");
                let file_path = decode(query.as_str()).unwrap().to_string();
                response_file(file_path, request, files_opened_directly.clone(), headers.clone());
            }
        } else if path == "/api/note" {
            if request.method().to_string() == "GET" {
                if original_url.contains("action=") {
                    let action = original_url.substring_after("action=").substring_before("&");
                    if action == "1" {
                        let id = original_url.substring_after("id=").substring_before("&");
                        let list = get_note(&conn, &id).unwrap();
                        let data = serde_json::to_string(&list).unwrap();
                        let _ = request.respond(Response::from_string(data)
                            .with_header(get_header(".json", &headers)));
                    }
                } else {
                    let list = get_notes(&conn, "50").unwrap();
                    let data = serde_json::to_string(&list).unwrap();
                    let _ = request.respond(Response::from_string(data)
                        .with_header(get_header(".json", &headers)));
                }
            } else {
                let mut content = String::new();
                request.as_reader().read_to_string(&mut content).unwrap();
                update_note(&conn, content);
                let _ = request.respond(Response::from_string("Ok").with_status_code(200));
            }
        } else if path.starts_with("/api/") {
            let referer = request
                .headers()
                .iter()
                .find(|header| header.field == HeaderField::from_bytes("Referer").unwrap())
                .map(|header| header.value.as_str());

            let query = referer.unwrap().to_string().substring_after("path=").substring_before("&");
            let file_path = decode(query.as_str()).unwrap().to_string().substring_before_last("/");

            response_file(file_path + path.substring_after_last("/api").as_str(), request, files_opened_directly.clone(), headers.clone());
        } else {
            let _ = request.respond(Response::from_string("Ok").with_status_code(200));
        }
    }
}

fn get_note(conn: &Connection, id: &str) -> Result<HashMap<String, String>, Error> {
    let mut stmt = conn.prepare("select title,content,update_at from notes where _id=?1")?;
    let mut rows = stmt.query([id])?;
    let mut note: HashMap<String, String> = HashMap::new();
    if let Some(row) = rows.next()? {
        let title: String = row.get(0)?;
        let content: String = row.get(1)?;
        let update_at: u64 = row.get(2)?;
        note.insert("title".to_string(), title);
        note.insert("content".to_string(), content);
        note.insert("update_at".to_string(), update_at.to_string());
    }
    Ok(note)
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
