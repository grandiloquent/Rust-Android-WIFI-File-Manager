use serde::{Deserialize, Serialize};
use urlencoding::encode;
use utils::strings::StringExt;
use wasm_bindgen::prelude::*;
use wasm_bindgen::JsCast;
use wasm_bindgen_futures::JsFuture;
use web_sys::{Request, RequestInit, RequestMode, Response};
mod utils;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);
}

async fn load_video_file(s: &str) -> Result<JsValue, JsValue> {
    let mut opts = RequestInit::new();
    opts.method("GET");
    opts.mode(RequestMode::Cors);

    let url = format!("/api/files?path={}", s);

    let request = Request::new_with_str_and_init(&url, &opts)?;

    request.headers().set("Accept", "application/json")?;

    let window = web_sys::window().unwrap();
    let resp_value = JsFuture::from(window.fetch_with_request(&request)).await?;

    let resp: Response = resp_value.dyn_into().unwrap();

    // Convert this other `Promise` into a rust `Future`.
    let json = JsFuture::from(resp.json()?).await?;

    // Send the JSON response back to JS.
    Ok(json)
}
#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct FileItem {
    pub path: String,
    pub is_directory: bool,
}

#[wasm_bindgen]
pub async fn start(s: &str, path_separator: &str) {
    // https://docs.rs/wasm-bindgen/0.2.84/wasm_bindgen/struct.JsValue.html
    let videos = match load_video_file(s).await {
        Ok(v) => v,
        Err(error) => {
            log(error.as_string().unwrap_or(String::new()).as_str());
            return;
        }
    };
    let mut files: Vec<FileItem> = match serde_wasm_bindgen::from_value(videos) {
        Ok(v) => v,
        Err(error) => {
            log(error.to_string().as_str());
            return;
        }
    };
    files.sort_by(|a, b| b.path.partial_cmp(&a.path).unwrap());
    let window = web_sys::window().expect("global window does not exists");
    let document = window.document().expect("expecting a document on window");
    // https://rustwasm.github.io/wasm-bindgen/api/web_sys/struct.HtmlElement.html
    let body = document
        .query_selector("body")
        .unwrap()
        .unwrap()
        .dyn_into::<web_sys::HtmlElement>()
        .unwrap();
    for f in files {
        let filename = f.path.substring_after_last(path_separator);
        let dir = f.path.substring_before_last(path_separator);

        body.insert_adjacent_html("afterend", format!(r#"<div class="media-item">
        <a class="media-item-thumbnail-container" href="/video/video?path={}">
            <div class="video-thumbnail-container-large">
                <div class="video-thumbnail-bg">
                    <img class="video-thumbnail-img"
                   src="/api/file?path={}/.images/{}">
                </div>
            </div>
        </a>
        <div class="details">
            <div class="media-channel">
            </div>
            <div class="media-item-info">
                <div class="media-item-metadata">
                    <a class="title-wrapper">
                        <h3 class="media-item-headline">
                        {}
                            </h3>
                        <div class="badge-and-byline-renderer">
                            <span class="badge-and-byline-item-byline">
                            </span>
                            <!-- • -->
                            <span class="badge-and-byline-separator">
                            </span>
                        </div>
                    </a>
                </div>
                <div class="bottom-sheet-renderer">
                    <button class="button">
                        <div class="icon">
                            <div class="c3-icon">
                                <svg xmlns="http://www.w3.org/2000/svg" enable-background="new 0 0 24 24"
                                    height="24" viewBox="0 0 24 24" width="24">
                                    <path
                                        d="M12,16.5c0.83,0,1.5,0.67,1.5,1.5s-0.67,1.5-1.5,1.5s-1.5-0.67-1.5-1.5S11.17,16.5,12,16.5z M10.5,12 c0,0.83,0.67,1.5,1.5,1.5s1.5-0.67,1.5-1.5s-0.67-1.5-1.5-1.5S10.5,11.17,10.5,12z M10.5,6c0,0.83,0.67,1.5,1.5,1.5 s1.5-0.67,1.5-1.5S12.83,4.5,12,4.5S10.5,5.17,10.5,6z">
                                    </path>
                                </svg>
                            </div>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    </div>"#,
     encode(f.path.as_str()).into_owned(),
     encode(dir.as_str()).into_owned(),
     encode(filename.as_str()).into_owned(),
     filename,
).as_str());
    }
}

//  wasm-pack build --target web --out-dir C:\Users\Administrator\Desktop\Resources\Manager\assets\video
