use std::collections::HashMap;
use std::str::FromStr;
use ascii::AsciiString;
use tiny_http::{Header, HeaderField};
use crate::mimetypes::extension_to_mime;

pub
fn get_header(name: &str, headers: &HashMap<String, Header>) -> Header {
    let ext = match name.rfind(".") {
        Some(pos) => {
            &name[pos + 1..]
        }
        None => { "." }
    };
    match headers.get(ext) {
        Some(header) => header.clone(),
        None => {
            let content_type = extension_to_mime(ext);
            let h = Header {
                field: HeaderField::from_str("Content-Type").unwrap(),
                value: AsciiString::from_str(content_type).unwrap(),
            };
            headers.clone().insert(ext.to_string(), h.clone());
            h
        }
    }
}

pub fn get_content_disposition(filename: &str) -> Header {
    Header {
        field: HeaderField::from_str("Content-Disposition").unwrap(),
        value: AsciiString::from_str(format!("attachment; filename=\"{}\"", filename).as_str()).unwrap(),
    }
}