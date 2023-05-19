use rocket::fairing::{Fairing, Info, Kind};
use rocket::http::Header;
use rocket::{Request, Response};
use crate::strings::StringExt;
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