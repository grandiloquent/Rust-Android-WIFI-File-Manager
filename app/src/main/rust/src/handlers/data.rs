use rocket::serde::Deserialize;
use rocket::serde::Serialize;
// https://doc.rust-lang.org/book/ch05-01-defining-structs.html

#[derive(Serialize, Deserialize)]
pub struct Message<'a> {
    error: u32,
    message: &'a str,
}

impl <'a>Message<'a>{
    pub fn new(error: u32, message: &'a str) -> Self {
        Message {
            error,
            message,
        }
    }
    pub fn success(message: &'a str) -> Self {
        Message {
            error: 200,
            message,
        }
    }
    pub fn fail(message: &'a str) -> Self {
        Message {
            error: 404,
            message,
        }
    }
}