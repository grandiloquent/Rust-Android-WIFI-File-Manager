use crate::asset::Cache;
use crate::handlers;
use crate::strings::StringExt;
use crate::{error, Database, Server};
use ndk::asset::AssetManager;
use rocket::config::LogLevel;
use rocket::data::{Limits, ToByteUnit};
use rocket::fairing::{Fairing, Info, Kind};
use rocket::figment::providers::{Format, Toml};
use rocket::figment::Figment;
use rocket::http::Header;
use rocket::routes;
use rocket::{Request, Response};
use std::sync::Arc;

pub struct CORS;

#[rocket::async_trait]
impl Fairing for CORS {
    fn info(&self) -> Info {
        Info {
            name: "Attaching CORS headers to responses",
            kind: Kind::Response,
        }
    }

    async fn on_response<'r>(&self, _request: &'r Request<'_>, response: &mut Response<'r>) {
        response.set_header(Header::new("Access-Control-Allow-Origin", "*"));
        response.set_header(Header::new(
            "Access-Control-Allow-Methods",
            "POST, GET, PATCH, OPTIONS",
        ));
        response.set_header(Header::new("Access-Control-Allow-Headers", "*"));
        response.set_header(Header::new("Access-Control-Allow-Credentials", "true"));
    }
}

pub struct ContentDisposition;

#[rocket::async_trait]
impl Fairing for ContentDisposition {
    fn info(&self) -> Info {
        Info {
            name: "Attaching ContentDisposition headers to responses",
            kind: Kind::Response,
        }
    }

    async fn on_response<'r>(&self, request: &'r Request<'_>, response: &mut Response<'r>) {
        let p = request.uri().to_string();
        if p.ends_with(".zip") || p.ends_with(".db") || p.ends_with(".7z") {
            // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Disposition
            response.set_header(Header::new(
                "Content-Disposition",
                format!(
                    "attachment; filename=\"{}\"",
                    urlencoding::decode(request.uri().query().unwrap().as_str())
                        .unwrap()
                        .to_string()
                        .substring_after_last("/")
                ),
            ));
        }
    }
}

#[tokio::main]
pub async fn run_server(srv: Server, ass: AssetManager) {
    let limits = Limits::default()
        .limit("json", 3.mebibytes())
        .limit("string", 3.mebibytes())
        .limit("data-form", 5.gibibytes())
        .limit("file", 5.gibibytes());

    let figment = Figment::from(rocket::Config::default())
        .merge((rocket::Config::ADDRESS, srv.host))
        .merge((rocket::Config::PORT, srv.port))
        .merge((rocket::Config::TEMP_DIR, srv.temp_dir))
        .merge((rocket::Config::LIMITS, limits))
        .merge((rocket::Config::LOG_LEVEL, LogLevel::Critical));
    let mut server = rocket::custom(figment)
        .attach(CORS)
        .attach(ContentDisposition)
        .mount(
            "/",
            routes![
                handlers::api_asset_file::api_asset_file,
                handlers::api_file::api_file,
                handlers::api_file::api_file_post,
                handlers::api_files::api_files,
                handlers::api_files::api_files_clear,
                handlers::api_files::api_files_rename,
                handlers::api_file_delete::api_file_delete,
                handlers::api_file_new::api_file_new_file,
                handlers::api_file_new::api_file_new_dir,
                handlers::api_file_rename::api_file_rename,
                handlers::api_file_rename::api_file_move,
                handlers::api_zip::api_zip,
                handlers::compress_zip::compress_zip,
                handlers::file::file,
                handlers::index::index,
                handlers::index_file::index_file,
                handlers::markdown::markdown,
                handlers::markdown::markdown_file,
                handlers::subtitle::subtitle,
                handlers::upload::upload,
                handlers::video::video
            ],
        )
        .manage(Arc::new(Cache::new(ass)))
        .register("/", catchers![error::not_found]);

    server.launch().await;
}
// cargo ndk -t arm64-v8a --platform 31 -o C:\Users\Administrator\Desktop\file\Killer\app\src\main\jniLibs build --release
