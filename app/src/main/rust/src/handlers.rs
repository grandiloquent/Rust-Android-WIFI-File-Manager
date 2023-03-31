use std::collections::HashMap;
use std::fmt::Debug;
use std::ops::Deref;
use std::sync::Mutex;
use ascii::AsciiChar::n;
use ndk::asset::AssetManager;
use tiny_http::{Header, Request, Response};
use crate::{get_header, read_asset};

pub struct Context<'a> {
    pub(crate) cache: &'a HashMap<&'a str, String>,
    pub(crate) ass: Mutex<&'a AssetManager>,
    pub(crate) headers: &'a HashMap<String, Header>,
}

pub fn handle_page(name: &str, context: &Context, request: Request) {
    match read_asset(name.to_string(), context.cache, context.ass.lock().unwrap()) {
        Ok(data) => {
            let _ = request.respond(Response::from_string(data)
                .with_header(get_header(name, context.headers)));
        }
        Err(err) => {
            let _ = request.respond(Response::from_string(err.to_string())
                .with_status_code(500));
        }
    }
}
          