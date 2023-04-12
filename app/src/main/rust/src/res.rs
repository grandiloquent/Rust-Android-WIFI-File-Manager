use std::io::Cursor;
use rocket::{Request, Response, response};
use rocket::http::{Status};
use rocket::response::Responder;

#[derive(Debug, Clone, PartialEq, Default)]
pub struct Asset {
    pub data: Vec<u8>,
    pub content_type: &'static str,
}

impl<'r> Responder<'r, 'static> for Asset {
    fn respond_to(self, _: &'r Request<'_>) -> response::Result<'static> {
        if self.data.len() == 0 {
            Response::build()
                .status(Status::NotFound)
                .ok()
        } else {
            Response::build()
                .raw_header("Content-Type", self.content_type)
                .sized_body(self.data.len(), Cursor::new(self.data))
                .ok()
        }
    }
}