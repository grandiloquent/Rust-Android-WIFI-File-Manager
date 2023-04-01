use std::fmt;
use rocket::{Catcher, Request};
use rocket::response::content;
use rocket::response::content::RawHtml;
use rocket::serde::json::{json, Value};

#[catch(404)]
pub fn not_found() -> Value {
    json!({
        "status": 404,
        "reason": "not found"
    })
}
