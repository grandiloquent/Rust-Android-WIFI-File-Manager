use reqwest::header::{HeaderMap, HeaderValue};
use rocket::http::Status;
use crate::strings::StringExt;


#[get("/title?<path>")]
pub async fn title(path: String) -> Result<String, Status> {
    log::error!("{}","fetch_body");
    let mut headers = HeaderMap::new();
    headers.insert("user-agent", HeaderValue::from_static("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36"));
    headers.insert("accept", HeaderValue::from_static("text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9"));

// https://docs.rs/reqwest/latest/reqwest/
    let proxy = match reqwest::Proxy::http("http://127.0.0.1:10809") {
        Ok(v) => v,
        Err(err) => {
            log::error!("{}",err.to_string());
            return Err(Status::NotFound);
        }
    };
    let c = match reqwest::Client::builder()
        .proxy(proxy)
        .default_headers(headers)
        .build() {
        Ok(v) => v,
        Err(err) => {
            log::error!("{}",err.to_string());
            return Err(Status::NotFound);
        }
    };
    let r = match c
        .get(path)
        .send()
        .await {
        Ok(v) => v,
        Err(err) => {
            log::error!("{}",err.to_string());
            return Err(Status::NotFound);
        }
    };
    let v = match r
        .text()
        .await {
        Ok(v) => v,
        Err(err) => {
            log::error!("{}",err.to_string());
            return Err(Status::NotFound);
        }
    };

    Ok(v.substring_after("<title>").substring_before("</title>"))
}

